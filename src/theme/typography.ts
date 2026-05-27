import type { TextStyle } from 'react-native';

export const fontFamily = {
  displayRegular: 'PlayfairDisplay_400Regular',
  displaySemiBold: 'PlayfairDisplay_600SemiBold',
  displayBold: 'PlayfairDisplay_700Bold',
  displayItalic: 'PlayfairDisplay_600SemiBold_Italic',
  displayItalicBold: 'PlayfairDisplay_700Bold_Italic',
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

type TextVariant = TextStyle & { fontFamily: string };

export const typography = {
  // Playfair Display 700 italic — the font file is already italic, so do NOT
  // also set fontStyle:'italic' (Android then fails to match the face and
  // falls back to a plain sans-serif).
  wordmark: {
    fontFamily: fontFamily.displayItalicBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  wordmarkSm: {
    fontFamily: fontFamily.displayItalicBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  displayLg: {
    fontFamily: fontFamily.displayBold,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.96,
  },
  displayMd: {
    fontFamily: fontFamily.displayBold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.36,
  },
  headlineLg: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 30,
    lineHeight: 38,
  },
  headlineMd: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 24,
    lineHeight: 32,
  },
  headlineSm: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  titleLg: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  titleMd: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 18,
    lineHeight: 30,
  },
  bodyMd: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  labelLg: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.7,
  },
  labelMd: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSm: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
  eyebrow: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
} satisfies Record<string, TextVariant>;

export type TypographyVariant = keyof typeof typography;
