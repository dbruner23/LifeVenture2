import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../../src/auth/AuthContext';
import { colors } from '../../src/theme';

export default function AuthLayout() {
  const { status } = useAuth();
  if (status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;
  }
  if (status === 'signedIn') {
    return <Redirect href="/(tabs)" />;
  }
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
