export const palette = {
  explorerBlue: '#002045',
  explorerBlueDeep: '#001b3c',
  explorerBlueMid: '#1a365d',
  explorerBlueLight: '#86a0cd',
  explorerBlueSoft: '#adc7f7',
  explorerBluePale: '#d6e3ff',

  forestGreen: '#3b6934',
  forestGreenDeep: '#23501e',
  forestGreenLight: '#bcf0ae',
  forestGreenSoft: '#b9eeab',

  sunsetGold: '#d4903b',
  sunsetGoldDeep: '#673d00',
  sunsetGoldWarm: '#ffb866',
  sunsetGoldPale: '#ffddba',

  terracotta: '#ba1a1a',
  terracottaSoft: '#ffdad6',

  paperWhite: '#f9f9f9',
  paperContainer: '#f3f3f3',
  paperRaised: '#eeeeee',
  paperRaisedHigh: '#e8e8e8',
  paperRaisedHighest: '#e2e2e2',
  paperDim: '#dadada',
  white: '#ffffff',

  ink: '#1a1c1c',
  inkMuted: '#43474e',
  inkOutline: '#74777f',
  inkOutlineSoft: '#c4c6cf',
  inverseSurface: '#2f3131',
  inverseInk: '#f0f1f1',
} as const;

export const colors = {
  surface: palette.paperWhite,
  surfaceContainerLowest: palette.white,
  surfaceContainerLow: palette.paperContainer,
  surfaceContainer: palette.paperRaised,
  surfaceContainerHigh: palette.paperRaisedHigh,
  surfaceContainerHighest: palette.paperRaisedHighest,
  surfaceDim: palette.paperDim,
  surfaceVariant: palette.paperRaisedHighest,

  onSurface: palette.ink,
  onSurfaceVariant: palette.inkMuted,
  outline: palette.inkOutline,
  outlineVariant: palette.inkOutlineSoft,
  inverseSurface: palette.inverseSurface,
  inverseOnSurface: palette.inverseInk,

  primary: palette.explorerBlue,
  onPrimary: palette.white,
  primaryContainer: palette.explorerBlueMid,
  onPrimaryContainer: palette.explorerBlueLight,
  primaryFixed: palette.explorerBluePale,
  primaryFixedDim: palette.explorerBlueSoft,
  onPrimaryFixed: palette.explorerBlueDeep,

  secondary: palette.forestGreen,
  onSecondary: palette.white,
  secondaryContainer: palette.forestGreenSoft,
  onSecondaryContainer: palette.forestGreenDeep,

  tertiary: palette.sunsetGoldDeep,
  onTertiary: palette.white,
  tertiaryContainer: palette.sunsetGoldPale,
  onTertiaryContainer: palette.sunsetGoldDeep,
  tertiaryAccent: palette.sunsetGold,

  error: palette.terracotta,
  onError: palette.white,
  errorContainer: palette.terracottaSoft,

  scrim: 'rgba(0, 0, 0, 0.5)',
  scrimSoft: 'rgba(0, 0, 0, 0.2)',
} as const;

export type ColorToken = keyof typeof colors;
