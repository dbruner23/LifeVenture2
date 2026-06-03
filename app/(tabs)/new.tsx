import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Screen, Text, Chip, Button } from '../../src/components';
import { colors, radius, shadows, spacing } from '../../src/theme';
import { genres } from '../../src/data/genres';
import { locationPresets, defaultLocation, type LocationPreset } from '../../src/data/locations';
import { type GalleryItem } from '../../src/data/ventures';
import { useCreateVenture } from '../../src/hooks/useCreateVenture';
import { type NewVentureCover } from '../../src/api/ventures';

const templates = [
  { id: 'field', label: 'Field journal', icon: 'book-outline' as const, hint: 'Daily entries, photos & weather' },
  { id: 'route', label: 'Route diary', icon: 'trail-sign-outline' as const, hint: 'Maps + GPX + elevation' },
  { id: 'gallery', label: 'Photo essay', icon: 'images-outline' as const, hint: 'Image-led layout, light prose' },
  { id: 'reflect', label: 'Reflection', icon: 'sparkles-outline' as const, hint: 'Long-form retrospective' },
];

export default function NewVenture() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [template, setTemplate] = useState('field');
  const [genreId, setGenreId] = useState('mountains');
  const [location, setLocation] = useState<LocationPreset>(defaultLocation);
  const [cover, setCover] = useState<NewVentureCover | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const createVenture = useCreateVenture();

  // Video preview for the cover area. useVideoPlayer must always be called
  // (hooks rule); passing null when the cover isn't a video is safe.
  const coverVideoUri = cover?.kind === 'video' ? cover.uri : null;
  const coverPlayer = useVideoPlayer(coverVideoUri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const pickCover = useCallback(async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });
    if (res.canceled || !res.assets[0]) return;
    const a = res.assets[0];
    if (a.type === 'video') {
      const thumb = await VideoThumbnails.getThumbnailAsync(a.uri, { time: 1000 }).catch(() => null);
      setCover({
        kind: 'video',
        uri: a.uri,
        posterUri: thumb?.uri,
        durationMs: typeof a.duration === 'number' ? a.duration : undefined,
      });
    } else {
      setCover({ kind: 'image', uri: a.uri });
    }
  }, []);

  const addGalleryItem = useCallback(async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (res.canceled || !res.assets[0]) return;
    const a = res.assets[0];
    if (a.type === 'video') {
      const thumb = await VideoThumbnails.getThumbnailAsync(a.uri, { time: 1000 }).catch(() => null);
      setGallery((prev) => [...prev, { kind: 'video', uri: a.uri, posterUri: thumb?.uri }]);
    } else {
      setGallery((prev) => [...prev, { kind: 'image', uri: a.uri }]);
    }
  }, []);

  const publish = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Give your venture a name before publishing.');
      return;
    }
    const genreLabel = genres.find((g) => g.id === genreId)?.label ?? 'Wilderness';
    try {
      await createVenture.mutateAsync({
        title: title.trim(),
        body: body || undefined,
        excerpt: body ? body.slice(0, 160) : undefined,
        genre: genreLabel,
        placeLabel: location.label,
        latitude: location.latitude,
        longitude: location.longitude,
        cover: cover ?? undefined,
        gallery: gallery.length > 0 ? gallery : undefined,
      });
      setTitle('');
      setBody('');
      setCover(null);
      setGallery([]);
      router.push('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      Alert.alert('Could not publish', message);
    }
  }, [title, body, genreId, location, cover, gallery, createVenture]);

  return (
    <Screen statusBarStyle="dark">
      <View style={styles.header}>
        <Pressable hitSlop={6} style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={colors.onSurface} />
        </Pressable>
        <Text variant="labelLg" color="onSurfaceVariant">
          {createVenture.isPending ? 'Publishing…' : 'New venture'}
        </Text>
        <Pressable hitSlop={6} style={styles.iconButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="eyebrow" color="primary">
          A new chapter
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="A title for this chapter…"
          placeholderTextColor={colors.outline}
          style={styles.title}
          multiline
        />

        <Pressable style={styles.locationRow} hitSlop={6} onPress={() => setLocationModalOpen(true)}>
          <Ionicons name="location-outline" size={16} color={colors.secondary} />
          <Text variant="labelLg" color="secondary">
            {location.label}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.secondary} />
        </Pressable>

        <Pressable style={styles.coverWrap} onPress={pickCover}>
          {cover?.kind === 'video' ? (
            <VideoView
              player={coverPlayer}
              style={styles.cover}
              contentFit="cover"
              nativeControls={false}
              allowsPictureInPicture={false}
            />
          ) : cover ? (
            <Image source={{ uri: cover.uri }} style={styles.cover} contentFit="cover" />
          ) : (
            <View style={[styles.cover, styles.coverEmpty]}>
              <Ionicons name="image-outline" size={28} color={colors.onSurfaceVariant} />
              <Text variant="labelMd" color="onSurfaceVariant" style={{ marginTop: 6 }}>
                Tap to add a cover photo or video
              </Text>
            </View>
          )}

          {cover ? (
            <View style={styles.coverActions}>
              <View style={[styles.coverPill, shadows.soft]}>
                <Ionicons
                  name={cover.kind === 'video' ? 'videocam-outline' : 'camera-outline'}
                  size={14}
                  color={colors.onSurface}
                />
                <Text variant="labelMd" color="onSurface">
                  Replace
                </Text>
              </View>
            </View>
          ) : null}
        </Pressable>

        <Text variant="eyebrow" color="onSurfaceVariant" style={styles.sectionLabel}>
          Template
        </Text>
        <View style={styles.templateGrid}>
          {templates.map((t) => {
            const active = template === t.id;
            return (
              <Pressable
                key={t.id}
                style={[styles.templateCard, active && styles.templateCardActive]}
                onPress={() => setTemplate(t.id)}
              >
                <View style={[styles.templateIcon, active && styles.templateIconActive]}>
                  <Ionicons
                    name={t.icon}
                    size={18}
                    color={active ? colors.onPrimary : colors.primary}
                  />
                </View>
                <Text variant="titleMd" color="onSurface" style={{ marginTop: spacing.sm }}>
                  {t.label}
                </Text>
                <Text variant="labelMd" color="onSurfaceVariant" style={{ marginTop: 2 }}>
                  {t.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text variant="eyebrow" color="onSurfaceVariant" style={styles.sectionLabel}>
          Genre
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreRow}
        >
          {genres
            .filter((g) => g.id !== 'all')
            .map((g) => (
              <Chip
                key={g.id}
                label={g.label}
                icon={g.icon}
                tone="secondary"
                selected={genreId === g.id}
                onPress={() => setGenreId(g.id)}
              />
            ))}
        </ScrollView>

        <Text variant="eyebrow" color="onSurfaceVariant" style={styles.sectionLabel}>
          Story
        </Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder={"The first night we arrived, the harbour was so still…"}
          placeholderTextColor={colors.outline}
          style={styles.body}
          multiline
          textAlignVertical="top"
        />

        <Text variant="eyebrow" color="onSurfaceVariant" style={styles.sectionLabel}>
          Gallery
        </Text>
        <View style={styles.galleryRow}>
          {gallery.map((item, idx) => (
            <View key={`${item.uri}-${idx}`} style={styles.galleryThumbWrap}>
              <Image
                source={{ uri: item.posterUri ?? item.uri }}
                style={styles.galleryThumb}
                contentFit="cover"
              />
              {item.kind === 'video' ? (
                <View style={styles.galleryPlay}>
                  <Ionicons name="play" size={12} color={colors.surface} />
                </View>
              ) : null}
            </View>
          ))}
          <Pressable style={styles.galleryAdd} onPress={addGalleryItem}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, shadows.floating]}>
        <Button label="Preview" variant="secondary" icon="eye-outline" />
        <Button
          label={createVenture.isPending ? 'Publishing…' : 'Publish'}
          variant="accent"
          icon="paper-plane-outline"
          iconPosition="trailing"
          onPress={publish}
          disabled={createVenture.isPending || !title.trim()}
        />
      </View>

      <Modal
        visible={locationModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setLocationModalOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setLocationModalOpen(false)} />
        <View style={[styles.modalSheet, shadows.floating]}>
          <View style={styles.sheetHandle} />
          <Text variant="headlineSm" color="onSurface" style={styles.modalTitle}>
            Where did this happen?
          </Text>
          <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
            {locationPresets.map((p) => {
              const selected = p.id === location.id;
              return (
                <Pressable
                  key={p.id}
                  style={[styles.locationOption, selected && styles.locationOptionActive]}
                  onPress={() => {
                    setLocation(p);
                    setLocationModalOpen(false);
                  }}
                >
                  <View style={styles.locationDot}>
                    <Ionicons
                      name={selected ? 'checkmark' : 'location-outline'}
                      size={16}
                      color={selected ? colors.onPrimary : colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMd" color="onSurface">
                      {p.label}
                    </Text>
                    <Text variant="labelMd" color="onSurfaceVariant">
                      {p.latitude.toFixed(2)}, {p.longitude.toFixed(2)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {createVenture.isPending ? (
        <View style={styles.pendingOverlay} pointerEvents="none">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.page,
    paddingTop: spacing.sm,
    paddingBottom: 220,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    lineHeight: 40,
    color: colors.onSurface,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  coverWrap: {
    height: 220,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  cover: { width: '100%', height: '100%' },
  coverEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverActions: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
  },
  coverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  templateCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  templateCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.soft,
  },
  templateIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateIconActive: {
    backgroundColor: colors.primary,
  },
  genreRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  body: {
    minHeight: 140,
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    lineHeight: 28,
    color: colors.onSurface,
    paddingVertical: spacing.sm,
  },
  galleryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  galleryThumbWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  galleryThumb: {
    width: '100%',
    height: '100%',
  },
  galleryPlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryAdd: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 92,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLowest,
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,27,60,0.45)',
  },
  modalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '75%',
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.page,
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    marginBottom: spacing.md,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  locationOptionActive: {
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    borderBottomColor: 'transparent',
  },
  locationDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
