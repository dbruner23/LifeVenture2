import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';

interface ScreenProps {
  children: ReactNode;
  edges?: ReadonlyArray<Edge>;
  background?: keyof typeof colors;
  statusBarStyle?: 'light' | 'dark' | 'auto';
  style?: ViewStyle;
}

export function Screen({
  children,
  edges = ['top', 'left', 'right'],
  background = 'surface',
  statusBarStyle = 'dark',
  style,
}: ScreenProps) {
  const bg = (colors as Record<string, string>)[background];

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar style={statusBarStyle} />
      <SafeAreaView style={[styles.safe, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
});
