import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, spacing } from '../theme';
import { currentUser } from '../data/user';
import { Text } from './Text';

interface BrandHeaderProps {
  tone?: 'light' | 'dark';
  avatar?: string | null;
  onAvatarPress?: () => void;
  trailing?: ReactNode;
  style?: ViewStyle;
}

export function BrandHeader({
  tone = 'light',
  avatar = currentUser.avatar,
  onAvatarPress,
  trailing,
  style,
}: BrandHeaderProps) {
  const wordmarkColor = tone === 'dark' ? colors.inverseOnSurface : colors.primary;
  const ringColor = tone === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,32,69,0.12)';

  return (
    <View style={[styles.row, style]}>
      <View style={styles.side}>
        {avatar ? (
          <Pressable onPress={onAvatarPress} hitSlop={6}>
            <Image
              source={{ uri: avatar }}
              style={[styles.avatar, { borderColor: ringColor }]}
              contentFit="cover"
            />
          </Pressable>
        ) : null}
      </View>

      <Text variant="wordmark" color={wordmarkColor}>
        LifeVenture
      </Text>

      <View style={[styles.side, styles.sideEnd]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sideEnd: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 2,
    backgroundColor: colors.primaryContainer,
  },
});
