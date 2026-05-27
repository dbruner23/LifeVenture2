import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen, Text, BrandHeader, Button, JournalCard } from '../../src/components';
import { colors, radius, spacing } from '../../src/theme';
import { useVentures } from '../../src/hooks/useVentures';

export default function HomeFeed() {
  const { data: ventures, isLoading, isError, refetch, isRefetching } = useVentures();

  return (
    <Screen statusBarStyle="dark">
      <View style={styles.header}>
        <BrandHeader
          onAvatarPress={() => router.push('/(tabs)/profile')}
          trailing={
            <Pressable style={styles.iconButton} hitSlop={6}>
              <Ionicons name="notifications-outline" size={20} color={colors.onSurface} />
              <View style={styles.dot} />
            </Pressable>
          }
        />

        <Pressable style={styles.searchBar} hitSlop={4}>
          <Ionicons name="search-outline" size={18} color={colors.onSurfaceVariant} />
          <Text variant="bodyMd" color="onSurfaceVariant" style={{ flex: 1 }}>
            Search a place, a friend, a feeling…
          </Text>
          <Ionicons name="options-outline" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Text variant="eyebrow" color="primary" style={styles.sectionEyebrow}>
          Tuesday, 27 May · From your circle
        </Text>
        <Text variant="headlineMd" color="onSurface" style={styles.sectionTitle}>
          New ventures this week
        </Text>

        {isLoading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.primary} />
            <Text variant="labelMd" color="onSurfaceVariant" style={styles.stateText}>
              Gathering field notes…
            </Text>
          </View>
        ) : isError ? (
          <View style={styles.state}>
            <Ionicons name="cloud-offline-outline" size={28} color={colors.onSurfaceVariant} />
            <Text variant="titleMd" color="onSurface" align="center" style={styles.stateText}>
              Couldn't load your feed
            </Text>
            <Text variant="bodySm" color="onSurfaceVariant" align="center" style={styles.stateSub}>
              Check your connection and try again.
            </Text>
            <Button label="Retry" variant="secondary" icon="refresh" onPress={() => refetch()} style={styles.retry} />
          </View>
        ) : (
          <>
            {ventures?.map((v) => (
              <JournalCard key={v.id} venture={v} />
            ))}
            <View style={styles.endcap}>
              <Ionicons name="leaf-outline" size={20} color={colors.onSurfaceVariant} />
              <Text variant="labelMd" color="onSurfaceVariant" align="center" style={styles.endcapText}>
                You're all caught up. Time to plan the next one.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.page,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.tertiaryAccent,
    borderWidth: 1.5,
    borderColor: colors.surfaceContainer,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginTop: spacing.md,
  },
  feed: {
    paddingHorizontal: spacing.page,
    paddingBottom: 140,
  },
  sectionEyebrow: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  state: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  stateText: {
    marginTop: spacing.xs,
  },
  stateSub: {
    maxWidth: 260,
  },
  retry: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
  endcap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  endcapText: {
    maxWidth: 240,
    lineHeight: 18,
  },
});
