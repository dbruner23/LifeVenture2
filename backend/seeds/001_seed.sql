-- Idempotent seed (fixed UUIDs + ON CONFLICT) so it can re-run safely.

INSERT INTO users (id, handle, name, avatar_url, bio) VALUES
  ('11111111-1111-1111-1111-111111111111', '@ibens.field', 'Iben Sørenson', 'https://i.pravatar.cc/120?img=32', 'Cold places, quiet light.'),
  ('22222222-2222-2222-2222-222222222222', '@carlosm', 'Carlos Marín', 'https://i.pravatar.cc/120?img=68', 'Eating my way around the world.'),
  ('33333333-3333-3333-3333-333333333333', '@ren.takeda', 'Ren Takeda', 'https://i.pravatar.cc/120?img=12', 'Long walks, old trails.'),
  ('44444444-4444-4444-4444-444444444444', '@mayawanders', 'Maya Holloway', 'https://i.pravatar.cc/120?img=47', 'Mountains and cities in equal measure.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ventures
  (id, author_id, title, excerpt, genre, place_label, location, cover_image, duration, published_at)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Sleeping Under the Northern Lights, Lofoten',
    'Three nights at a tiny rorbu south of Reine. The aurora came on the second night — quietly, slowly, like a curtain pulled back.',
    'Wilderness',
    'Reine, Lofoten Islands · Norway',
    ST_SetSRID(ST_MakePoint(13.0908, 67.9311), 4326)::geography,
    'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=80',
    '3 days',
    now() - interval '12 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'A Slow Week Eating Through Oaxaca',
    'A mole tasting at Origen, a cooking class in Teotitlán del Valle, and a mezcal palenque I am still thinking about a month later.',
    'Culinary',
    'Oaxaca de Juárez · Mexico',
    ST_SetSRID(ST_MakePoint(-96.7266, 17.0732), 4326)::geography,
    'https://images.unsplash.com/photo-1518131945814-1f4dd80f8a13?auto=format&fit=crop&w=1200&q=80',
    '7 days',
    now() - interval '20 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    'Two Weeks on the Kumano Kodo',
    'Pilgrim trail through the Kii Mountains. Cedar groves, onsen towns, and the slow rhythm of walking a thousand-year-old path.',
    'Pilgrimage',
    'Kii Peninsula · Japan',
    ST_SetSRID(ST_MakePoint(135.7681, 33.8835), 4326)::geography,
    'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80',
    '14 days',
    now() - interval '4 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    '44444444-4444-4444-4444-444444444444',
    'A High Pass in the Dolomites',
    'Hut to hut, Rifugio Locatelli to Lavaredo. The Tre Cime felt taller in person.',
    'Mountains',
    'Sesto · Italy',
    ST_SetSRID(ST_MakePoint(12.3046, 46.6149), 4326)::geography,
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    '5 days',
    now() - interval '2 days'
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    '44444444-4444-4444-4444-444444444444',
    'Lisbon in the Off-Season',
    'Empty miradouros, soft January light, and the best pastel de nata of my life from a place with no sign.',
    'City',
    'Lisbon · Portugal',
    ST_SetSRID(ST_MakePoint(-9.1393, 38.7223), 4326)::geography,
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80',
    '4 days',
    now() - interval '40 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO reactions (user_id, venture_id, kind) VALUES
  ('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001', 'like'),
  ('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000001', 'like'),
  ('44444444-4444-4444-4444-444444444444', 'a0000000-0000-0000-0000-000000000001', 'save'),
  ('11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000003', 'like'),
  ('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000003', 'save')
ON CONFLICT DO NOTHING;
