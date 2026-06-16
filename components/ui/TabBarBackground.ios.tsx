import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

const NATIVE_TAB_BAR_FALLBACK_HEIGHT = 68;

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  try {
    return useBottomTabBarHeight();
  } catch {
    return NATIVE_TAB_BAR_FALLBACK_HEIGHT;
  }
}
