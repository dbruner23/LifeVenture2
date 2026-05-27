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

export interface ListVenturesOptions {
  genre?: string;
  /** [minLng, minLat, maxLng, maxLat] viewport filter. */
  bbox?: [number, number, number, number];
  /** { lng, lat, radiusMeters } radius filter, also orders by distance. */
  near?: { lng: number; lat: number; radiusMeters: number };
  limit?: number;
}

export async function listVentures(
  pool: Pool,
  opts: ListVenturesOptions = {},
): Promise<VentureListItem[]> {
  const where: string[] = ['v.published_at IS NOT NULL'];
  const params: unknown[] = [];
  let orderBy = 'v.published_at DESC';

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
    orderBy = `v.location <-> ${point}`;
  }

  params.push(opts.limit ?? 50);
  const limitParam = `$${params.length}`;

  const sql = `
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
    WHERE ${where.join(' AND ')}
    GROUP BY v.id, u.id
    ORDER BY ${orderBy}
    LIMIT ${limitParam}
  `;

  const { rows } = await pool.query(sql, params);

  return rows.map((row) => ({
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
  }));
}

function formatPublished(date: Date | null): string | null {
  if (!date) return null;
  return `Published ${date.toLocaleString('en-NZ', { month: 'short', day: 'numeric' })}`;
}
