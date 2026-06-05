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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthInput, Button, Text } from '../../src/components';
import { colors, palette, spacing } from '../../src/theme';
import { useAuth } from '../../src/auth/AuthContext';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1400&q=80';

export default function ConfirmScreen() {
  const { pendingEmail, confirmSignUp, resendConfirmationCode } = useAuth();
  const [email, setEmail] = useState(pendingEmail ?? '');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    if (!email.trim() || !code.trim()) {
      setError('Enter the 6-digit code we emailed you.');
      return;
    }
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await confirmSignUp(email.trim(), code.trim());
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify the code.');
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!email.trim()) {
      setError('Enter your email to resend the code.');
      return;
    }
    setError(null);
    setResending(true);
    try {
      await resendConfirmationCode(email.trim());
      setInfo('A new code is on the way.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Image source={{ uri: HERO_IMAGE }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={['rgba(0,32,69,0.0)', 'rgba(0,32,69,0.55)']}
              locations={[0.3, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <Text variant="wordmark" color="inverseOnSurface" style={styles.heroWordmark}>
                LifeVenture
              </Text>
              <Text variant="bodyLg" color="inverseOnSurface" style={styles.heroTagline}>
                Check your inbox — we sent a 6-digit code to verify it's you.
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text variant="eyebrow" color="secondary" style={styles.eyebrow}>
              Step 2 · Confirm your email
            </Text>

            <View style={styles.fields}>
              <AuthInput
                label="Email Address"
                placeholder="explorer@lifeventure.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <AuthInput
                label="Verification Code"
                placeholder="6-digit code"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />
            </View>

            {info ? (
              <Text variant="labelMd" color="secondary" style={styles.info}>
                {info}
              </Text>
            ) : null}
            {error ? (
              <Text variant="labelMd" color="error" style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Button
              label={submitting ? 'Verifying…' : 'Verify and Continue'}
              variant="primary"
              size="lg"
              fullWidth
              onPress={onConfirm}
              disabled={submitting}
              style={styles.submit}
            />

            <View style={styles.actions}>
              <Pressable hitSlop={8} onPress={onResend} disabled={resending}>
                <Text variant="labelLg" color="primary">
                  {resending ? 'Sending…' : 'Resend code'}
                </Text>
              </Pressable>
              <Pressable hitSlop={8} onPress={() => router.replace('/(auth)/login')}>
                <Text variant="labelLg" color="onSurfaceVariant">
                  Back to sign in
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: {
    height: 240,
    backgroundColor: palette.explorerBlueDeep,
    overflow: 'hidden',
  },
  heroContent: {
    position: 'absolute',
    left: spacing.page,
    right: spacing.page,
    bottom: spacing.lg,
  },
  heroWordmark: { marginBottom: spacing.xs },
  heroTagline: { maxWidth: 320, lineHeight: 26 },
  form: {
    flex: 1,
    paddingHorizontal: spacing.page,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  eyebrow: { marginBottom: spacing.lg },
  fields: { gap: spacing.lg },
  info: { marginTop: spacing.md },
  error: { marginTop: spacing.md },
  submit: {
    marginTop: spacing.lg,
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  actions: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
