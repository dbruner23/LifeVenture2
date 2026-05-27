import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View, type ColorValue } from 'react-native';
import { colors, radius, shadows, spacing } from '../../src/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IoniconName;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={focused ? 24 : 22} color={color as string} />
    </View>
  );
}

function CenterTabIcon({ focused }: { color: ColorValue; focused: boolean }) {
  return (
    <View style={[styles.centerWrap, shadows.card]}>
      <View style={[styles.centerInner, focused && styles.centerInnerActive]}>
        <Ionicons name="add" size={26} color={colors.onTertiary} />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'book' : 'book-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'map' : 'map-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => <CenterTabIcon color={color} focused={focused} />,
          tabBarItemStyle: [styles.tabItem, styles.centerItem],
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'person-circle' : 'person-circle-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: Platform.select({ ios: spacing.lg, android: spacing.md, default: spacing.md }),
    height: 68,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xxl,
    borderTopWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingTop: 8,
    paddingBottom: 8,
    ...shadows.floating,
  },
  tabItem: {
    height: 52,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  iconWrap: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerWrap: {
    width: 56,
    height: 56,
    marginTop: -18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInner: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.tertiaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInnerActive: {
    backgroundColor: colors.primary,
  },
  centerItem: {
    height: 56,
  },
});
