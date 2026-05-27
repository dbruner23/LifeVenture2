import type { Ionicons } from '@expo/vector-icons';

export interface Genre {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const genres: Genre[] = [
  { id: 'all', label: 'All', icon: 'sparkles-outline' },
  { id: 'wilderness', label: 'Wilderness', icon: 'leaf-outline' },
  { id: 'mountains', label: 'Mountains', icon: 'triangle-outline' },
  { id: 'coast', label: 'Coast', icon: 'water-outline' },
  { id: 'city', label: 'City', icon: 'business-outline' },
  { id: 'culinary', label: 'Culinary', icon: 'restaurant-outline' },
  { id: 'culture', label: 'Culture', icon: 'library-outline' },
  { id: 'road-trip', label: 'Road Trip', icon: 'car-sport-outline' },
  { id: 'wellness', label: 'Wellness', icon: 'flower-outline' },
  { id: 'pilgrimage', label: 'Pilgrimage', icon: 'compass-outline' },
];
