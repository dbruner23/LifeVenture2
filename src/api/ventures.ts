import { type Venture, type GalleryItem, type MediaKind } from '../data/ventures';
import { currentUser } from '../data/user';
import { USE_MOCK_API } from './config';
import { apiFetch } from './client';
import { addMockVenture, getMockVentures } from './mockStore';

type TokenGetter = () => Promise<string | null>;

export interface VentureQuery {
  genre?: string;
  /** [minLng, minLat, maxLng, maxLat] viewport filter. */
  bbox?: [number, number, number, number];
  /** Radius filter; results are ordered by distance. */
  near?: { lng: number; lat: number; radiusMeters: number };
}

// Shape returned by GET /ventures (see backend/src/queries/ventures.ts).
interface ApiVenture {
  id: string;
  title: string;
  location?: string;
  genre?: string;
  coordinates?: { latitude: number; longitude: number };
  excerpt?: string;
  coverImage?: string;
  duration?: string;
  publishedAt?: string;
  likes?: number;
  saves?: number;
  author?: Venture['author'];
}

interface VenturesResponse {
  ventures: ApiVenture[];
  source?: string;
}

const FALLBACK_AUTHOR: Venture['author'] = {
  id: 'unknown',
  name: 'LifeVenture explorer',
  handle: '@explorer',
  avatar: 'https://i.pravatar.cc/120?img=1',
};

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';

function mapApiVenture(v: ApiVenture): Venture {
  return {
    id: v.id,
    title: v.title,
    excerpt: v.excerpt,
    location: v.location ?? 'Somewhere on Earth',
    coordinates: v.coordinates ?? { latitude: 0, longitude: 0 },
    genre: v.genre ?? 'Wilderness',
    duration: v.duration,
    coverImage: v.coverImage ?? FALLBACK_COVER,
    author: v.author ?? FALLBACK_AUTHOR,
    publishedAt: v.publishedAt ?? 'Recently',
    likes: v.likes ?? 0,
    saves: v.saves ?? 0,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Mirrors the PostGIS query semantics so mock mode behaves like the backend.
function filterMock(list: Venture[], q: VentureQuery): Venture[] {
  let out = list;

  if (q.genre) {
    out = out.filter((v) => v.genre === q.genre);
  }

  if (q.bbox) {
    const [minLng, minLat, maxLng, maxLat] = q.bbox;
    out = out.filter(
      (v) =>
        v.coordinates.longitude >= minLng &&
        v.coordinates.longitude <= maxLng &&
        v.coordinates.latitude >= minLat &&
        v.coordinates.latitude <= maxLat,
    );
  }

  if (q.near) {
    const origin = { latitude: q.near.lat, longitude: q.near.lng };
    out = out
      .filter((v) => distanceMeters(origin, v.coordinates) <= q.near!.radiusMeters)
      .sort((a, b) => distanceMeters(origin, a.coordinates) - distanceMeters(origin, b.coordinates));
  }

  return out;
}

export async function fetchVentures(getToken: TokenGetter, q: VentureQuery = {}): Promise<Venture[]> {
  if (USE_MOCK_API) {
    await delay(400); // simulate latency so loading states are exercised
    return filterMock(getMockVentures(), q);
  }

  const params = new URLSearchParams();
  if (q.genre) params.set('genre', q.genre);
  if (q.bbox) params.set('bbox', q.bbox.join(','));
  if (q.near) params.set('near', `${q.near.lng},${q.near.lat},${q.near.radiusMeters}`);
  const qs = params.toString();

  const token = await getToken();
  const data = await apiFetch<VenturesResponse>(`/ventures${qs ? `?${qs}` : ''}`, { token });
  return data.ventures.map(mapApiVenture);
}

export interface NewVentureCover {
  kind: MediaKind;
  uri: string;
  posterUri?: string;
  durationMs?: number;
}

export interface NewVentureInput {
  title: string;
  body?: string;
  excerpt?: string;
  genre: string;
  placeLabel: string;
  latitude: number;
  longitude: number;
  duration?: string;
  cover?: NewVentureCover | null;
  gallery?: GalleryItem[];
}

export async function createVenture(
  getToken: TokenGetter,
  input: NewVentureInput,
): Promise<Venture> {
  if (USE_MOCK_API) {
    await delay(500);
    const cover = input.cover ?? null;
    const coverPoster =
      cover?.kind === 'video' ? cover.posterUri ?? cover.uri : cover?.uri ?? FALLBACK_COVER;

    const venture: Venture = {
      id: `local-${Date.now()}`,
      title: input.title,
      excerpt: input.excerpt,
      location: input.placeLabel,
      coordinates: { latitude: input.latitude, longitude: input.longitude },
      genre: input.genre,
      duration: input.duration,
      coverImage: coverPoster,
      coverKind: cover?.kind ?? 'image',
      coverVideoUri: cover?.kind === 'video' ? cover.uri : undefined,
      gallery: input.gallery,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
      },
      publishedAt: 'Just now',
      likes: 0,
      saves: 0,
    };
    addMockVenture(venture);
    return venture;
  }

  // Live backend doesn't yet persist video URIs or galleries (Phase 2 media).
  // Send only fields the backend understands; the poster doubles as cover_image.
  const token = await getToken();
  const cover = input.cover ?? null;
  const coverImageForBackend =
    cover?.kind === 'video' ? cover.posterUri ?? cover.uri : cover?.uri ?? null;

  const body = {
    title: input.title,
    body: input.body,
    excerpt: input.excerpt,
    genre: input.genre,
    placeLabel: input.placeLabel,
    latitude: input.latitude,
    longitude: input.longitude,
    coverImage: coverImageForBackend,
    duration: input.duration,
  };

  const data = await apiFetch<{ venture: ApiVenture }>('/ventures', {
    method: 'POST',
    body,
    token,
  });
  return mapApiVenture(data.venture);
}
