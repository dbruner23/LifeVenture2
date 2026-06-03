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
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError('Use your real name, an email you check, and at least 8 characters.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-up failed.');
    } finally {
      setSubmitting(false);
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
            <Image
              source={{ uri: HERO_IMAGE }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
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
                Every mile is a story. Begin your next chapter with clarity and calm.
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text variant="eyebrow" color="secondary" style={styles.eyebrow}>
              Step 1 · Create your account
            </Text>

            <View style={styles.fields}>
              <AuthInput
                label="Full Name"
                placeholder="Eleanor Rigby"
                autoCapitalize="words"
                autoComplete="name"
                value={name}
                onChangeText={setName}
              />
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
                label="Create Password"
                placeholder="At least 8 characters"
                autoCapitalize="none"
                autoComplete="password-new"
                secure
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Text variant="labelMd" color="onSurfaceVariant" style={styles.terms}>
              By creating an account, you agree to LifeVenture's{' '}
              <Text variant="labelMd" color="primary">
                Terms of Exploration
              </Text>{' '}
              and{' '}
              <Text variant="labelMd" color="primary">
                Privacy Policy
              </Text>
              .
            </Text>

            {error ? (
              <Text variant="labelMd" color="error" style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Button
              label={submitting ? 'Creating account…' : 'Start Your First Chapter'}
              variant="primary"
              size="lg"
              fullWidth
              onPress={onSubmit}
              disabled={submitting}
              style={styles.submit}
            />

            <Pressable
              hitSlop={8}
              style={styles.loginRow}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text variant="bodyMd" color="onSurfaceVariant">
                Already have an account?
              </Text>
              <Text variant="labelLg" color="primary">
                Log in
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  fill: { flex: 1 },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    height: 280,
    backgroundColor: palette.explorerBlueDeep,
    overflow: 'hidden',
  },
  heroContent: {
    position: 'absolute',
    left: spacing.page,
    right: spacing.page,
    bottom: spacing.lg,
  },
  heroWordmark: {
    marginBottom: spacing.xs,
  },
  heroTagline: {
    maxWidth: 320,
    lineHeight: 26,
  },
  form: {
    flex: 1,
    paddingHorizontal: spacing.page,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  eyebrow: {
    marginBottom: spacing.lg,
  },
  fields: {
    gap: spacing.lg,
  },
  terms: {
    marginTop: spacing.lg,
    lineHeight: 18,
  },
  error: {
    marginTop: spacing.md,
  },
  submit: {
    marginTop: spacing.lg,
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  loginRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
});
