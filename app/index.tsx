import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { colors, palette, radius, spacing } from '../src/theme';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';

export default function SplashRoute() {
  useEffect(() => {
    // Auto-advance after a beat so this works as a stub splash for now.
    const t = setTimeout(() => router.replace('/(tabs)' as never), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[palette.explorerBlueDeep, palette.explorerBlue, palette.explorerBlueMid]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.center}>
        <View style={styles.logoMark}>
          <Ionicons name="compass-outline" size={48} color={colors.surface} />
        </View>
        <Text variant="displayMd" color="inverseOnSurface" align="center" style={styles.wordmark}>
          LifeVenture
        </Text>
        <Text
          variant="labelLg"
          color={palette.explorerBlueSoft}
          align="center"
          style={styles.tagline}
        >
          A FIELD JOURNAL FOR EVERY JOURNEY
        </Text>
      </View>
      <View style={styles.footer}>
        <Button
          label="Enter the journal"
          variant="accent"
          size="lg"
          icon="arrow-forward"
          iconPosition="trailing"
          fullWidth
          onPress={() => router.replace('/(tabs)' as never)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.explorerBlue },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.page },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: spacing.lg,
  },
  wordmark: {
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: spacing.sm,
    letterSpacing: 1.6,
  },
  footer: {
    paddingHorizontal: spacing.page,
    paddingBottom: spacing.xxl,
  },
});
