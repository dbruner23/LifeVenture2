import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen, Text, Chip, JournalCard, BrandHeader } from '../../src/components';
import { colors, radius, shadows, spacing } from '../../src/theme';
import { genres } from '../../src/data/genres';
import { ventures } from '../../src/data/ventures';

// Lazy native map only — web target renders a styled placeholder.
const MapView = Platform.OS === 'web' ? null : require('react-native-maps').default;
const Marker = Platform.OS === 'web' ? null : require('react-native-maps').Marker;

export default function MapDiscovery() {
  const [activeGenre, setActiveGenre] = useState('all');
  const [activeVentureId, setActiveVentureId] = useState<string>(ventures[0].id);

  const filtered = useMemo(() => {
    if (activeGenre === 'all') return ventures;
    return ventures.filter((v) => v.genre.toLowerCase() === activeGenre.replace('-', ' '));
  }, [activeGenre]);

  const active = ventures.find((v) => v.id === activeVentureId) ?? ventures[0];

  return (
    <Screen edges={['top', 'left', 'right']} statusBarStyle="dark">
      <View style={styles.brandBar}>
        <BrandHeader
          onAvatarPress={() => router.push('/(tabs)/profile')}
          trailing={
            <Pressable style={styles.brandIcon} hitSlop={6}>
              <Ionicons name="locate-outline" size={18} color={colors.primary} />
            </Pressable>
          }
        />
      </View>
      <View style={styles.mapArea}>
        {MapView ? (
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: 40,
              longitude: 10,
              latitudeDelta: 90,
              longitudeDelta: 90,
            }}
            showsCompass={false}
            showsScale={false}
            toolbarEnabled={false}
          >
            {filtered.map((v) => (
              <Marker
                key={v.id}
                coordinate={v.coordinates}
                onPress={() => setActiveVentureId(v.id)}
                pinColor={v.id === activeVentureId ? colors.tertiaryAccent : colors.primary}
              />
            ))}
          </MapView>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.webPlaceholder]}>
            <Ionicons name="map" size={40} color={colors.onPrimaryContainer} />
            <Text variant="labelLg" color="onPrimaryContainer" style={{ marginTop: 8 }}>
              Map preview is available on iOS & Android
            </Text>
          </View>
        )}

        <View style={styles.topBar}>
          <View style={[styles.searchBar, shadows.card]}>
            <Ionicons name="search-outline" size={18} color={colors.onSurfaceVariant} />
            <Text variant="bodyMd" color="onSurfaceVariant" style={{ flex: 1 }}>
              Where are you headed?
            </Text>
            <Pressable hitSlop={6} style={styles.tinyButton}>
              <Ionicons name="options-outline" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.sideControls}>
          {[
            { icon: 'layers-outline' as const, label: 'Layers' },
            { icon: 'people-outline' as const, label: 'Friends' },
            { icon: 'bookmark-outline' as const, label: 'Saved' },
          ].map((b) => (
            <Pressable key={b.label} style={[styles.fab, shadows.card]} hitSlop={6}>
              <Ionicons name={b.icon} size={18} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreRow}
        >
          {genres.map((g) => (
            <Chip
              key={g.id}
              label={g.label}
              icon={g.icon}
              tone="primary"
              selected={activeGenre === g.id}
              onPress={() => setActiveGenre(g.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.sheetHeader}>
          <Text variant="eyebrow" color="primary">
            {filtered.length} ventures in view
          </Text>
          <Pressable hitSlop={6} style={styles.sortBtn}>
            <Text variant="labelLg" color="primary">
              Newest
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardScroller}
          snapToInterval={300}
          decelerationRate="fast"
        >
          {filtered.map((v) => (
            <Pressable
              key={v.id}
              onPress={() => setActiveVentureId(v.id)}
              style={[styles.cardWrap, v.id === active.id && styles.cardWrapActive]}
            >
              <JournalCard venture={v} variant="compact" />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandBar: {
    paddingHorizontal: spacing.page,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapArea: {
    flex: 1,
    backgroundColor: colors.primaryContainer,
  },
  webPlaceholder: {
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.page,
    right: spacing.page,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  tinyButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideControls: {
    position: 'absolute',
    top: 80,
    right: spacing.page,
    gap: spacing.sm,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: spacing.sm,
    paddingBottom: 110,
    marginTop: -spacing.xl,
    ...shadows.floating,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  genreRow: {
    paddingHorizontal: spacing.page,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.page,
    marginBottom: spacing.sm,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardScroller: {
    paddingHorizontal: spacing.page,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  cardWrap: {
    width: 280,
    opacity: 0.78,
  },
  cardWrapActive: {
    opacity: 1,
  },
});
