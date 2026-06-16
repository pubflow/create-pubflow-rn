import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type AppTab = {
  name: 'index' | 'explore' | 'profile';
  title: string;
  symbol: React.ComponentProps<typeof IconSymbol>['name'];
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

const tabs: AppTab[] = [
  {
    name: 'index',
    title: 'Home',
    symbol: 'house.fill',
    icon: 'home',
  },
  {
    name: 'explore',
    title: 'Explore',
    symbol: 'paperplane.fill',
    icon: 'send',
  },
  {
    name: 'profile',
    title: 'Profile',
    symbol: 'person.fill',
    icon: 'account-circle',
  },
];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = Colors[scheme];
  const isExpoGo = Constants.appOwnership === 'expo';
  const isWeb = Platform.OS === 'web';
  const insets = useSafeAreaInsets();

  if (!isExpoGo && !isWeb) {
    return (
      <NativeTabs
        backgroundColor="rgba(255, 255, 255, 0.76)"
        blurEffect="systemUltraThinMaterialLight"
        disableTransparentOnScrollEdge
        iconColor={{
          default: palette.tabIconDefault,
          selected: palette.tint,
        }}
        indicatorColor="rgba(0, 106, 255, 0.16)"
        labelStyle={{
          default: styles.nativeLabel,
          selected: styles.nativeSelectedLabel,
        }}
        rippleColor="rgba(0, 106, 255, 0.12)"
        shadowColor="rgba(15, 23, 42, 0.16)"
        tintColor={palette.tint}>
        {tabs.map((tab) => (
          <NativeTabs.Trigger
            key={tab.name}
            contentStyle={styles.nativeContent}
            disableTransparentOnScrollEdge
            name={tab.name}>
            <NativeTabs.Trigger.Label selectedStyle={styles.nativeSelectedLabel}>{tab.title}</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
              selectedColor={palette.tint}
              src={<NativeTabs.Trigger.VectorIcon family={MaterialIcons} name={tab.icon} />}
            />
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.tint,
        tabBarBackground: TabBarBackground,
        tabBarButton: HapticTab,
        tabBarInactiveTintColor: palette.tabIconDefault,
        tabBarLabelStyle: styles.label,
        tabBarStyle: [
          styles.expoGoTabBar,
          {
            height: 60 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ],
      }}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <IconSymbol size={24} name={tab.symbol} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  expoGoTabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderTopColor: 'rgba(203, 213, 225, 0.72)',
    borderTopWidth: 1,
    elevation: 10,
    paddingTop: 7,
    position: 'absolute',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
  },
  nativeContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  nativeLabel: {
    color: Colors.light.tabIconDefault,
    fontSize: 11,
    fontWeight: '800',
  },
  nativeSelectedLabel: {
    color: Colors.light.tint,
    fontSize: 12,
    fontWeight: '900',
  },
});
