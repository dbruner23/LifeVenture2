import type { Pool } from 'pg';

export interface VentureListItem {
  id: string;
  title: string;
  excerpt: string | null;
  genre: string;
  location: string | null;
  coordinates: { latitude: number; longitude: number } | null;
  coverImage: string | null;
  duration: string | null;
  publishedAt: string | null;
  likes: number;
  saves: number;
  author: { id: string; name: string; handle: string; avatar: string | null };
}

export class ValidationError extends Error {}

export interface ListVenturesOptions {
  genre?: string;
  /** [minLng, minLat, maxLng, maxLat] viewport filter. */
  bbox?: [number, number, number, number];
  /** { lng, lat, radiusMeters } radius filter, also orders by distance. */
  near?: { lng: number; lat: number; radiusMeters: number };
  limit?: number;
}

export interface CreateVentureInput {
  authorId: string;
  title: string;
  body?: string | null;
  excerpt?: string | null;
  genre: string;
  placeLabel?: string | null;
  latitude: number;
  longitude: number;
  coverImage?: string | null;
  duration?: string | null;
}

const SELECT_VENTURE = `
  SELECT
    v.id, v.title, v.excerpt, v.genre,
    v.place_label AS location,
    ST_Y(v.location::geometry) AS latitude,
    ST_X(v.location::geometry) AS longitude,
    v.cover_image, v.duration, v.published_at,
    u.id AS author_id, u.name AS author_name, u.handle AS author_handle, u.avatar_url AS author_avatar,
    COUNT(r.*) FILTER (WHERE r.kind = 'like') AS likes,
    COUNT(r.*) FILTER (WHERE r.kind = 'save') AS saves
  FROM ventures v
  JOIN users u ON u.id = v.author_id
  LEFT JOIN reactions r ON r.venture_id = v.id
`;
const GROUP_BY = ' GROUP BY v.id, u.id ';

function mapRow(row: Record<string, any>): VentureListItem {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    genre: row.genre,
    location: row.location,
    coordinates:
      row.latitude != null && row.longitude != null
        ? { latitude: Number(row.latitude), longitude: Number(row.longitude) }
        : null,
    coverImage: row.cover_image,
    duration: row.duration,
    publishedAt: formatPublished(row.published_at),
    likes: Number(row.likes),
    saves: Number(row.saves),
    author: {
      id: row.author_id,
      name: row.author_name,
      handle: row.author_handle,
      avatar: row.author_avatar,
    },
  };
}

export async function listVentures(
  pool: Pool,
  opts: ListVenturesOptions = {},
): Promise<VentureListItem[]> {
  const where: string[] = ['v.published_at IS NOT NULL'];
  const params: unknown[] = [];
  let orderBy = 'MAX(v.published_at) DESC';

  if (opts.genre) {
    params.push(opts.genre);
    where.push(`v.genre = $${params.length}`);
  }

  if (opts.bbox) {
    const [minLng, minLat, maxLng, maxLat] = opts.bbox;
    params.push(minLng, minLat, maxLng, maxLat);
    const n = params.length;
    where.push(
      `v.location && ST_MakeEnvelope($${n - 3}, $${n - 2}, $${n - 1}, $${n}, 4326)::geography`,
    );
  }

  if (opts.near) {
    params.push(opts.near.lng, opts.near.lat, opts.near.radiusMeters);
    const n = params.length;
    const point = `ST_SetSRID(ST_MakePoint($${n - 2}, $${n - 1}), 4326)::geography`;
    where.push(`ST_DWithin(v.location, ${point}, $${n})`);
    orderBy = `MIN(v.location <-> ${point})`;
  }

  params.push(opts.limit ?? 50);
  const sql = `${SELECT_VENTURE} WHERE ${where.join(' AND ')} ${GROUP_BY} ORDER BY ${orderBy} LIMIT $${params.length}`;

  const { rows } = await pool.query(sql, params);
  return rows.map(mapRow);
}

export async function getVenture(pool: Pool, id: string): Promise<VentureListItem | null> {
  const { rows } = await pool.query(`${SELECT_VENTURE} WHERE v.id = $1 ${GROUP_BY}`, [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createVenture(pool: Pool, input: CreateVentureInput): Promise<VentureListItem> {
  const { rows } = await pool.query(
    `INSERT INTO ventures
       (author_id, title, body, excerpt, genre, place_label, location, cover_image, duration, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography, $9, $10, now())
     RETURNING id`,
    [
      input.authorId,
      input.title,
      input.body ?? null,
      input.excerpt ?? null,
      input.genre,
      input.placeLabel ?? null,
      input.longitude,
      input.latitude,
      input.coverImage ?? null,
      input.duration ?? null,
    ],
  );

  const created = await getVenture(pool, rows[0].id);
  if (!created) throw new Error('Failed to load created venture');
  return created;
}

// Resolves the venture author. With Cognito wired, callers pass the resolved
// user id from getOrCreateUserBySub(). Falls back to the first seeded user
// only when nothing is provided (kept for the local dev server, which has no
// JWT and just wants the create flow to work).
async function resolveAuthorId(pool: Pool, provided?: string): Promise<string> {
  if (provided) return provided;
  const { rows } = await pool.query('SELECT id FROM users ORDER BY created_at LIMIT 1');
  if (!rows[0]) throw new ValidationError('No users exist to author this venture');
  return rows[0].id;
}

/**
 * Upsert the signed-in user by Cognito `sub`. Returns the local users.id to
 * use as ventures.author_id. Idempotent — safe to call on every POST.
 *
 * The handle is `<email-local>_<sub-prefix>` to avoid collisions across users
 * who share an email local part (e.g. foo@a.com vs foo@b.com).
 */
export async function getOrCreateUserBySub(
  pool: Pool,
  claims: { sub: string; email?: string; name?: string },
): Promise<string> {
  const existing = await pool.query('SELECT id FROM users WHERE cognito_sub = $1', [claims.sub]);
  if (existing.rows[0]) return existing.rows[0].id;

  const emailLocal = claims.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, '') ?? 'explorer';
  const handle = `@${emailLocal}_${claims.sub.slice(0, 6)}`;
  const name = claims.name?.trim() || 'LifeVenture explorer';

  const inserted = await pool.query(
    `INSERT INTO users (cognito_sub, handle, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (cognito_sub) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [claims.sub, handle, name],
  );
  return inserted.rows[0].id;
}

// Validates a loose request body and creates the venture.
export async function createVentureFromBody(pool: Pool, body: any): Promise<VentureListItem> {
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    throw new ValidationError('title is required');
  }
  if (typeof body.genre !== 'string' || !body.genre) {
    throw new ValidationError('genre is required');
  }
  if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
    throw new ValidationError('latitude and longitude are required');
  }

  const authorId = await resolveAuthorId(pool, body.authorId);
  return createVenture(pool, {
    authorId,
    title: body.title.trim(),
    body: body.body ?? null,
    excerpt: body.excerpt ?? null,
    genre: body.genre,
    placeLabel: body.placeLabel ?? null,
    latitude: body.latitude,
    longitude: body.longitude,
    coverImage: body.coverImage ?? null,
    duration: body.duration ?? null,
  });
}

function formatPublished(date: Date | null): string | null {
  if (!date) return null;
  return `Published ${date.toLocaleString('en-NZ', { month: 'short', day: 'numeric' })}`;
}
