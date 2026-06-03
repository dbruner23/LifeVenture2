import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { Text } from './Text';

interface AuthInputProps extends Omit<ComponentProps<typeof TextInput>, 'style'> {
  label?: string;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
  /** Light tone uses the glass-card look (Login); dark tone uses on-surface (Signup). */
  variant?: 'glass' | 'surface';
}

export function AuthInput({
  label,
  leadingIcon,
  secure = false,
  variant = 'surface',
  ...textInputProps
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const onLight = variant === 'glass';
  const textColor = onLight ? colors.onSurface : colors.onSurface;
  const placeholderColor = onLight ? 'rgba(26,28,28,0.45)' : colors.outline;
  const labelColor = focused ? colors.primary : colors.onSurfaceVariant;
  const baseLineColor = colors.outlineVariant;

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="labelSm" color={labelColor} style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.row,
          { borderBottomColor: focused ? colors.primary : baseLineColor },
          variant === 'glass' ? styles.rowGlass : null,
        ]}
      >
        {leadingIcon ? (
          <Ionicons
            name={leadingIcon}
            size={18}
            color={focused ? colors.primary : colors.onSurfaceVariant}
            style={styles.leadingIcon}
          />
        ) : null}
        <TextInput
          {...textInputProps}
          secureTextEntry={secure && !revealed}
          onFocus={(e) => {
            setFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            textInputProps.onBlur?.(e);
          }}
          placeholderTextColor={placeholderColor}
          style={[styles.input, { color: textColor }]}
        />
        {secure ? (
          <Pressable hitSlop={8} onPress={() => setRevealed((v) => !v)}>
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  label: {
    marginBottom: 4,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    paddingVertical: 8,
  },
  rowGlass: {
    borderBottomWidth: 2,
  },
  leadingIcon: {
    marginRight: spacing.sm + 4,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
});
