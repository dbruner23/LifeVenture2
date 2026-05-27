import { type Venture, ventures as mockVentures } from '../data/ventures';
import { USE_MOCK_API } from './config';
import { apiFetch } from './client';

type TokenGetter = () => Promise<string | null>;

// Shape returned by GET /ventures. Today the backend stub returns a minimal
// subset; step 2 (real schema + PostGIS query) will return the full record.
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

export async function fetchVentures(getToken: TokenGetter): Promise<Venture[]> {
  if (USE_MOCK_API) {
    await delay(600); // simulate latency so loading states are exercised
    return mockVentures;
  }

  const token = await getToken();
  const data = await apiFetch<VenturesResponse>('/ventures', { token });
  return data.ventures.map(mapApiVenture);
}
