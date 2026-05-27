# LifeVenture — agent notes

LifeVenture is a mobile-first social travel journal: travel-blog × Instagram × Strava, with a permanent "scrapbook" feel and a map-led discovery surface. Users compose long-form ventures with rich text templates and photo galleries, geotag them, categorize by genre, and browse a friend-filtered map of places.

## Stack
- **Expo SDK 56** (React Native 0.85, React 19.2). New Architecture enabled.
- **Expo Router** with typed routes — file-based routing in `app/`.
- **TypeScript strict** mode.
- **Fonts**: Playfair Display (display/headlines) + Inter (body/labels) via `@expo-google-fonts/*`.
- **Maps**: `react-native-maps` (native only; web falls back to a placeholder).
- **Imaging**: `expo-image`; gradients via `expo-linear-gradient`.

Expo has shifted significantly across recent SDKs. When in doubt, read the SDK 56 docs: https://docs.expo.dev/versions/v56.0.0/

## Layout
```
app/
  _layout.tsx              Root stack, font loader, splash gating
  index.tsx                Brand splash → redirects to /(tabs)
  (tabs)/
    _layout.tsx            Bottom tab bar (Journal · Discover · + · You)
    index.tsx              Home Feed (journal feed)
    map.tsx                Map Discovery
    new.tsx                Venture composer / journal editor
    profile.tsx            Profile + collections
src/
  theme/                   colors, typography, spacing, shadows, radius
  components/              Text, Screen, Chip, Button, JournalCard
  data/                    Mock ventures + genres (replace with API later)
  hooks/                   useAppFonts
```

## Design system

Pulled from the LifeVenture Stitch project (id `9401912407294847262`). Editorial-minimalist aesthetic — Deep Explorer Blue (#002045) primary, Forest Green (#3b6934) secondary, Sunset Gold (#d4903b) reserved for high-priority CTAs ("Publish", "Start adventure"). Off-white #f9f9f9 surfaces, Playfair display headlines, Inter UI. Soft tonal shadows, 16px card radius, 24px page margin.

Use the theme tokens — don't inline hex. Use the `<Text variant="…">` primitive — don't reach for raw `<Text>` from RN.

## Local dev
```
npm install
npm run web        # quickest preview (no native maps)
npm run ios        # requires macOS / Expo Go
npm run android    # via Expo Go or emulator
```

Type-check: `npx tsc --noEmit`.
