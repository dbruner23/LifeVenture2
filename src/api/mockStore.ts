import { ventures as seed, type Venture } from '../data/ventures';

// Mutable in-memory store for mock mode. Seeded from the static mock data, then
// receives newly created ventures so the feed reflects them. Reset on reload.
let store: Venture[] = [...seed];

export function getMockVentures(): Venture[] {
  return store;
}

export function addMockVenture(v: Venture): void {
  store = [v, ...store];
}
