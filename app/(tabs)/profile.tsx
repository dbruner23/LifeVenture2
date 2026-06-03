import { Alert, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Text, Chip, Button, JournalCard, BrandHeader } from '../../src/components';
import { colors, palette, radius, shadows, spacing } from '../../src/theme';
import { ventures } from '../../src/data/ventures';
import { useAuth } from '../../src/auth/AuthContext';

const stats = [
  { value: '24', label: 'Ventures' },
  { value: '47', label: 'Countries' },
  { value: '1.2k', label: 'Friends' },
];

const collections = [
  {
    id: 'norway-25',
    title: 'Norway — Winter 25',
    count: 6,
    cover:
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=400&q=70',
  },
  {
    id: 'south-east-asia',
    title: 'South-East Asia',
    count: 9,
    cover:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=70',
  },
  {
    id: 'home-trails',
    title: 'Home trails',
    count: 11,
    cover:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=70',
  },
];

export default function ProfileScreen() {
  const { signOut } = useAuth();

  const onSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <Screen edges={['left', 'right']} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=70',
            }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,27,60,0.05)', 'rgba(0,27,60,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bannerTopBar}>
            <BrandHeader
              tone="dark"
              avatar={null}
              trailing={
                <>
                  <Pressable style={styles.bannerIcon} hitSlop={6}>
                    <Ionicons name="share-outline" size={18} color={colors.surface} />
                  </Pressable>
                  <Pressable style={styles.bannerIcon} hitSlop={6} onPress={onSignOut}>
                    <Ionicons name="log-out-outline" size={18} color={colors.surface} />
                  </Pressable>
                </>
              }
            />
          </View>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/200?img=15' }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text variant="headlineSm" color="onSurface">
                David Bruner
              </Text>
              <Text variant="labelLg" color="onSurfaceVariant">
                @davidb · Wellington, NZ
              </Text>
            </View>
            <Button label="Edit" variant="secondary" size="sm" icon="create-outline" />
          </View>

          <Text variant="bodyMd" color="onSurfaceVariant" style={styles.bio}>
            Slow journeys, mountain weather, and the kind of food you stand around eating. Currently
            plotting a long walk through Patagonia.
          </Text>

          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={s.label} style={[styles.stat, i < stats.length - 1 && styles.statDivider]}>
                <Text variant="headlineSm" color="onSurface">
                  {s.value}
                </Text>
                <Text variant="labelMd" color="onSurfaceVariant">
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.chipRow}>
            <Chip label="Wilderness" tone="primary" icon="leaf-outline" />
            <Chip label="Pilgrimage" tone="primary" icon="compass-outline" />
            <Chip label="Mountains" tone="primary" icon="triangle-outline" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="headlineSm" color="onSurface">
              Collections
            </Text>
            <Pressable hitSlop={6}>
              <Text variant="labelLg" color="primary">
                See all
              </Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.collectionRow}
          >
            {collections.map((c) => (
              <Pressable key={c.id} style={[styles.collection, shadows.soft]}>
                <Image source={{ uri: c.cover }} style={styles.collectionCover} contentFit="cover" />
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,27,60,0.85)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.collectionMeta}>
                  <Text variant="labelMd" color={palette.explorerBluePale}>
                    {c.count} ventures
                  </Text>
                  <Text variant="titleLg" color="inverseOnSurface" numberOfLines={2}>
                    {c.title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="headlineSm" color="onSurface">
              Recent ventures
            </Text>
            <Pressable hitSlop={6}>
              <Text variant="labelLg" color="primary">
                Grid
              </Text>
            </Pressable>
          </View>
          {ventures.slice(0, 2).map((v) => (
            <JournalCard key={v.id} venture={v} />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl,
  },
  banner: {
    height: 200,
    overflow: 'hidden',
    backgroundColor: colors.primaryContainer,
  },
  bannerTopBar: {
    position: 'absolute',
    top: 44,
    left: spacing.page,
    right: spacing.md,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCard: {
    marginTop: -48,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.surfaceContainerLowest,
    backgroundColor: colors.surfaceContainerHighest,
  },
  bio: {
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.page,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  collectionRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  collection: {
    width: 200,
    height: 240,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primaryContainer,
  },
  collectionCover: {
    width: '100%',
    height: '100%',
  },
  collectionMeta: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
});
