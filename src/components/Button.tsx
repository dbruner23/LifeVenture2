import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'leading' | 'trailing';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary },
  secondary: { bg: 'transparent', fg: colors.secondary, border: colors.secondary },
  accent: { bg: colors.tertiaryAccent, fg: colors.onTertiary },
  ghost: { bg: 'transparent', fg: colors.primary },
};

const sizeStyles: Record<ButtonSize, { paddingV: number; paddingH: number; gap: number }> = {
  sm: { paddingV: spacing.xs + 2, paddingH: spacing.md, gap: 6 },
  md: { paddingV: spacing.sm + 4, paddingH: spacing.lg, gap: 8 },
  lg: { paddingV: spacing.md, paddingH: spacing.xl, gap: 10 },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'leading',
  onPress,
  disabled = false,
  style,
  fullWidth,
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          paddingVertical: s.paddingV,
          paddingHorizontal: s.paddingH,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        v.border ? { borderWidth: 1.5, borderColor: v.border } : null,
        variant === 'primary' ? shadows.soft : null,
        variant === 'accent' ? shadows.card : null,
        fullWidth && { alignSelf: 'stretch' },
        style,
      ]}
    >
      <View style={[styles.row, { gap: s.gap }]}>
        {icon && iconPosition === 'leading' ? (
          <Ionicons name={icon} size={size === 'lg' ? 18 : 16} color={v.fg} />
        ) : null}
        <Text variant="labelLg" color={v.fg}>
          {label}
        </Text>
        {icon && iconPosition === 'trailing' ? (
          <Ionicons name={icon} size={size === 'lg' ? 18 : 16} color={v.fg} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
