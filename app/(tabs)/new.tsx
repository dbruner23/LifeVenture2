import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Text, Chip, Button } from '../../src/components';
import { colors, radius, shadows, spacing } from '../../src/theme';
import { genres } from '../../src/data/genres';

const templates = [
  { id: 'field', label: 'Field journal', icon: 'book-outline' as const, hint: 'Daily entries, photos & weather' },
  { id: 'route', label: 'Route diary', icon: 'trail-sign-outline' as const, hint: 'Maps + GPX + elevation' },
  { id: 'gallery', label: 'Photo essay', icon: 'images-outline' as const, hint: 'Image-led layout, light prose' },
  { id: 'reflect', label: 'Reflection', icon: 'sparkles-outline' as const, hint: 'Long-form retrospective' },
];

const galleryStubs = [
  'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=600&q=70',
  'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=600&q=70',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=70',
];

export default function NewVenture() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [template, setTemplate] = useState('field');
  const [genre, setGenre] = useState('mountains');

  return (
    <Screen statusBarStyle="dark">
      <View style={styles.header}>
        <Pressable hitSlop={6} style={styles.iconButton}>
          <Ionicons name="close" size={20} color={colors.onSurface} />
        </Pressable>
        <Text variant="labelLg" color="onSurfaceVariant">
          Draft · saved a moment ago
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
          New venture
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="A title for this chapter…"
          placeholderTextColor={colors.outline}
          style={styles.title}
          multiline
        />

        <Pressable style={styles.locationRow} hitSlop={6}>
          <Ionicons name="location-outline" size={16} color={colors.secondary} />
          <Text variant="labelLg" color="secondary">
            Reine, Lofoten Islands
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.secondary} />
        </Pressable>

        <View style={styles.coverWrap}>
          <Image source={{ uri: galleryStubs[0] }} style={styles.cover} contentFit="cover" />
          <View style={styles.coverActions}>
            <Pressable style={[styles.coverPill, shadows.soft]} hitSlop={6}>
              <Ionicons name="camera-outline" size={16} color={colors.onSurface} />
              <Text variant="labelMd" color="onSurface">
                Replace cover
              </Text>
            </Pressable>
          </View>
        </View>

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
                selected={genre === g.id}
                onPress={() => setGenre(g.id)}
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
          {galleryStubs.map((src) => (
            <Image key={src} source={{ uri: src }} style={styles.galleryThumb} contentFit="cover" />
          ))}
          <Pressable style={styles.galleryAdd}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, shadows.floating]}>
        <Button label="Preview" variant="secondary" icon="eye-outline" />
        <Button label="Publish" variant="accent" icon="paper-plane-outline" iconPosition="trailing" />
      </View>
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
    paddingBottom: 180,
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
  galleryThumb: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
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
});
