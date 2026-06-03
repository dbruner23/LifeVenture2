export interface LocationPreset {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
}

// Curated starting set so a new venture can be geotagged without a geocoder.
// Real device-GPS + Amazon Location Service geocoding lands with Phase 3.
export const locationPresets: LocationPreset[] = [
  { id: 'queenstown', label: 'Queenstown · New Zealand', latitude: -45.0312, longitude: 168.6626 },
  { id: 'reine', label: 'Reine, Lofoten Islands · Norway', latitude: 67.9311, longitude: 13.0908 },
  { id: 'oaxaca', label: 'Oaxaca de Juárez · Mexico', latitude: 17.0732, longitude: -96.7266 },
  { id: 'kumano', label: 'Kii Peninsula · Japan', latitude: 33.8835, longitude: 135.7681 },
  { id: 'dolomites', label: 'Sesto · Italy', latitude: 46.6149, longitude: 12.3046 },
  { id: 'lisbon', label: 'Lisbon · Portugal', latitude: 38.7223, longitude: -9.1393 },
  { id: 'patagonia', label: 'El Chaltén · Argentina', latitude: -49.3315, longitude: -72.8868 },
  { id: 'marrakech', label: 'Marrakech · Morocco', latitude: 31.6295, longitude: -7.9811 },
  { id: 'banff', label: 'Banff · Canada', latitude: 51.1784, longitude: -115.5708 },
  { id: 'cape-town', label: 'Cape Town · South Africa', latitude: -33.9249, longitude: 18.4241 },
];

export const defaultLocation = locationPresets[0];
