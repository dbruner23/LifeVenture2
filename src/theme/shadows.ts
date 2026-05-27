import { Platform, type ViewStyle } from 'react-native';

const ios = (style: ViewStyle): ViewStyle => (Platform.OS === 'ios' ? style : {});
const android = (elevation: number): ViewStyle =>
  Platform.OS === 'android' ? { elevation } : {};

export const shadows = {
  none: {} as ViewStyle,
  soft: {
    ...ios({
      shadowColor: '#001b3c',
      shadowOpacity: 0.06,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
    }),
    ...android(2),
  } as ViewStyle,
  card: {
    ...ios({
      shadowColor: '#001b3c',
      shadowOpacity: 0.08,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
    }),
    ...android(4),
  } as ViewStyle,
  floating: {
    ...ios({
      shadowColor: '#001b3c',
      shadowOpacity: 0.18,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
    }),
    ...android(10),
  } as ViewStyle,
} as const;

export type ShadowVariant = keyof typeof shadows;
