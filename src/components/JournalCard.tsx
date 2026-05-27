import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows, spacing } from '../theme';
import { Text } from './Text';
import { Chip } from './Chip';
import type { Venture } from '../data/ventures';

interface JournalCardProps {
  venture: Venture;
  variant?: 'feed' | 'compact';
  onPress?: () => void;
}

export function JournalCard({ venture, variant = 'feed', onPress }: JournalCardProps) {
  const isFeed = variant === 'feed';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isFeed ? styles.cardFeed : styles.cardCompact,
        { opacity: pressed ? 0.94 : 1 },
      ]}
    >
      <View style={[styles.coverWrap, isFeed ? styles.coverFeed : styles.coverCompact]}>
        <Image source={{ uri: venture.coverImage }} style={styles.cover} contentFit="cover" transition={200} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,27,60,0.75)']}
          locations={[0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.coverHeader}>
          <Chip label={venture.genre} tone="inverse" />
          {venture.duration ? (
            <Chip label={venture.duration} tone="inverse" icon="time-outline" />
          ) : null}
        </View>
        <View style={styles.coverFooter}>
          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color={colors.inverseOnSurface} />
            <Text variant="labelMd" color="inverseOnSurface" style={styles.locationText}>
              {venture.location}
            </Text>
          </View>
          <Text
            variant={isFeed ? 'headlineMd' : 'headlineSm'}
            color="inverseOnSurface"
            numberOfLines={2}
          >
            {venture.title}
          </Text>
        </View>
      </View>

      <View style={styles.meta}>
        <View style={styles.author}>
          <Image source={{ uri: venture.author.avatar }} style={styles.avatar} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text variant="labelLg" color="onSurface">
              {venture.author.name}
            </Text>
            <Text variant="labelMd" color="onSurfaceVariant">
              {venture.publishedAt}
            </Text>
          </View>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="bookmark-outline" size={16} color={colors.onSurfaceVariant} />
            <Text variant="labelMd" color="onSurfaceVariant">
              {venture.saves}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="heart-outline" size={16} color={colors.onSurfaceVariant} />
            <Text variant="labelMd" color="onSurfaceVariant">
              {venture.likes}
            </Text>
          </View>
        </View>
      </View>

      {isFeed && venture.excerpt ? (
        <Text variant="bodyMd" color="onSurfaceVariant" style={styles.excerpt} numberOfLines={3}>
          {venture.excerpt}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardFeed: {
    marginBottom: spacing.xl,
  },
  cardCompact: {
    marginBottom: spacing.md,
  },
  coverWrap: {
    width: '100%',
    overflow: 'hidden',
  },
  coverFeed: {
    height: 360,
  },
  coverCompact: {
    height: 200,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverHeader: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  coverFooter: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  locationText: {
    letterSpacing: 0.5,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  excerpt: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
