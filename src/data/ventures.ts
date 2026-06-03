export interface VentureAuthor {
  id: string;
  name: string;
  avatar: string;
  handle: string;
}

export type MediaKind = 'image' | 'video';

export interface GalleryItem {
  kind: MediaKind;
  /** Local file:// URI or remote URL. */
  uri: string;
  /** Poster frame for videos (used for thumbnails in the feed and gallery). */
  posterUri?: string;
  durationMs?: number;
}

export interface Venture {
  id: string;
  title: string;
  excerpt?: string;
  location: string;
  coordinates: { latitude: number; longitude: number };
  genre: string;
  duration?: string;
  /** Always an image URL — for videos this is the poster frame. */
  coverImage: string;
  coverKind?: MediaKind;
  /** Original video URI when coverKind === 'video'. */
  coverVideoUri?: string;
  gallery?: GalleryItem[];
  author: VentureAuthor;
  publishedAt: string;
  likes: number;
  saves: number;
  mood?: string;
}

const authors: Record<string, VentureAuthor> = {
  maya: {
    id: 'maya',
    name: 'Maya Holloway',
    handle: '@mayawanders',
    avatar: 'https://i.pravatar.cc/120?img=47',
  },
  ren: {
    id: 'ren',
    name: 'Ren Takeda',
    handle: '@ren.takeda',
    avatar: 'https://i.pravatar.cc/120?img=12',
  },
  iben: {
    id: 'iben',
    name: 'Iben Sørenson',
    handle: '@ibens.field',
    avatar: 'https://i.pravatar.cc/120?img=32',
  },
  carlos: {
    id: 'carlos',
    name: 'Carlos Marín',
    handle: '@carlosm',
    avatar: 'https://i.pravatar.cc/120?img=68',
  },
};

export const ventures: Venture[] = [
  {
    id: 'v1',
    title: 'Sleeping Under the Northern Lights, Lofoten',
    excerpt:
      'Three nights at a tiny rorbu south of Reine. The aurora came on the second night — quietly, slowly, like a curtain pulled back.',
    location: 'Reine, Lofoten Islands · Norway',
    coordinates: { latitude: 67.9311, longitude: 13.0908 },
    genre: 'Wilderness',
    duration: '3 days',
    coverImage:
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80',
    author: authors.iben,
    publishedAt: 'Published Feb 14',
    likes: 482,
    saves: 124,
    mood: 'Quiet wonder',
  },
  {
    id: 'v2',
    title: 'A Slow Week Eating Through Oaxaca',
    excerpt:
      'A mole tasting at Origen, a cooking class in Teotitlán del Valle, and a mezcal palenque I am still thinking about a month later.',
    location: 'Oaxaca de Juárez · Mexico',
    coordinates: { latitude: 17.0732, longitude: -96.7266 },
    genre: 'Culinary',
    duration: '7 days',
    coverImage:
      'https://images.unsplash.com/photo-1518131945814-1f4dd80f8a13?auto=format&fit=crop&w=1200&q=80',
    author: authors.carlos,
    publishedAt: 'Published Mar 02',
    likes: 318,
    saves: 96,
    mood: 'Curious',
  },
  {
    id: 'v3',
    title: 'Two Weeks on the Kumano Kodo',
    excerpt:
      'Pilgrim trail through the Kii Mountains. Cedar groves, onsen towns, and the slow rhythm of walking the same path monks have walked for a thousand years.',
    location: 'Kii Peninsula · Japan',
    coordinates: { latitude: 33.8835, longitude: 135.7681 },
    genre: 'Pilgrimage',
    duration: '14 days',
    coverImage:
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80',
    author: authors.ren,
    publishedAt: 'Published Apr 18',
    likes: 612,
    saves: 287,
    mood: 'Reflective',
  },
  {
    id: 'v4',
    title: 'A High Pass in the Dolomites',
    excerpt:
      'Hut to hut, Rifugio Locatelli to Lavaredo. The Tre Cime felt taller in person.',
    location: 'Sesto · Italy',
    coordinates: { latitude: 46.6149, longitude: 12.3046 },
    genre: 'Mountains',
    duration: '5 days',
    coverImage:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    author: authors.maya,
    publishedAt: 'Published May 09',
    likes: 274,
    saves: 81,
    mood: 'Triumphant',
  },
  {
    id: 'v5',
    title: 'Lisbon in the Off-Season',
    excerpt:
      'Empty miradouros, soft January light, and the best pastel de nata of my life from a place with no sign.',
    location: 'Lisbon · Portugal',
    coordinates: { latitude: 38.7223, longitude: -9.1393 },
    genre: 'City',
    duration: '4 days',
    coverImage:
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80',
    author: authors.maya,
    publishedAt: 'Published Jan 22',
    likes: 196,
    saves: 54,
    mood: 'Easy',
  },
];

export function getVentureById(id: string): Venture | undefined {
  return ventures.find((v) => v.id === id);
}
