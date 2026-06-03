import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthInput, Button, Text } from '../../src/components';
import { colors, palette, radius, spacing } from '../../src/theme';
import { useAuth } from '../../src/auth/AuthContext';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={{ uri: HERO_IMAGE }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.scrim} />

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BlurView intensity={40} tint="light" style={styles.card}>
            <View style={styles.cardInner}>
              <Text variant="wordmark" color={palette.explorerBlue} align="center">
                LifeVenture
              </Text>
              <Text
                variant="labelMd"
                color="onSurfaceVariant"
                align="center"
                style={styles.tagline}
              >
                SHARE STORIES · GET INSPIRED · LIVE THE ADVENTURE
              </Text>

              <View style={styles.fields}>
                <AuthInput
                  variant="glass"
                  leadingIcon="mail-outline"
                  placeholder="Email Address"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <AuthInput
                  variant="glass"
                  leadingIcon="lock-closed-outline"
                  placeholder="Password"
                  autoCapitalize="none"
                  autoComplete="password"
                  secure
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {error ? (
                <Text variant="labelMd" color="error" align="center" style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <Button
                label={submitting ? 'Signing in…' : 'Continue Your Journey'}
                variant="primary"
                size="lg"
                fullWidth
                onPress={onSubmit}
                disabled={submitting}
                style={styles.submit}
              />

              <Pressable hitSlop={8} style={styles.forgot}>
                <Text variant="labelLg" color="onSurfaceVariant">
                  Forgot password?
                </Text>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text variant="labelSm" color="onSurfaceVariant" style={styles.dividerText}>
                  OR
                </Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                hitSlop={8}
                style={styles.joinRow}
                onPress={() => router.push('/(auth)/signup')}
              >
                <Text variant="labelLg" color="secondary">
                  Join LifeVenture
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.secondary} />
              </Pressable>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.explorerBlueDeep },
  fill: { flex: 1 },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,32,69,0.18)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.page,
    paddingVertical: spacing.xxl,
  },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  cardInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  tagline: {
    marginTop: spacing.sm,
    letterSpacing: 1.6,
    lineHeight: 16,
    opacity: 0.85,
  },
  fields: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  error: {
    marginTop: spacing.md,
  },
  submit: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  forgot: {
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(116,119,127,0.35)',
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    letterSpacing: 1.6,
    opacity: 0.7,
  },
  joinRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
