import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { Text } from './Text';

type ChipTone = 'neutral' | 'primary' | 'secondary' | 'tertiary' | 'inverse';

interface ChipProps {
  label: string;
  tone?: ChipTone;
  selected?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
}

const toneMap: Record<ChipTone, { bg: string; fg: string; selectedBg: string; selectedFg: string }> = {
  neutral: {
    bg: colors.surfaceContainerLow,
    fg: colors.onSurfaceVariant,
    selectedBg: colors.onSurface,
    selectedFg: colors.surface,
  },
  primary: {
    bg: colors.primaryFixed,
    fg: colors.primary,
    selectedBg: colors.primary,
    selectedFg: colors.onPrimary,
  },
  secondary: {
    bg: colors.secondaryContainer,
    fg: colors.onSecondaryContainer,
    selectedBg: colors.secondary,
    selectedFg: colors.onSecondary,
  },
  tertiary: {
    bg: colors.tertiaryContainer,
    fg: colors.onTertiaryContainer,
    selectedBg: colors.tertiaryAccent,
    selectedFg: colors.onTertiary,
  },
  inverse: {
    bg: 'rgba(255,255,255,0.18)',
    fg: colors.inverseOnSurface,
    selectedBg: colors.inverseOnSurface,
    selectedFg: colors.inverseSurface,
  },
};

export function Chip({ label, tone = 'neutral', selected = false, icon, onPress, style }: ChipProps) {
  const palette = toneMap[tone];
  const bg = selected ? palette.selectedBg : palette.bg;
  const fg = selected ? palette.selectedFg : palette.fg;

  const content = (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      {icon ? <Ionicons name={icon} size={14} color={fg} style={styles.icon} /> : null}
      <Text variant="labelMd" color={fg} style={styles.label}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} hitSlop={6}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    letterSpacing: 0.4,
  },
});
