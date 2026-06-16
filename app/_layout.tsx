import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PubflowProvider, OfflineIndicator } from '@pubflow/react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';

function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

const pubflowConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.pml.edu.do',
  bridgeBasePath: '/bridge',
  authBasePath: '/auth',
  useSecureStorage: false,
  storageConfig: {
    prefix: '',
    sessionKey: 'session_id',
  },
  sessionConfig: {
    validationInterval: 60 * 60 * 1000,
    validationEndpoint: '/validation',
    autoValidate: false,
    validateOnStartup: false,
  },
} as any;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PubflowProvider
        config={pubflowConfig}
        enableDebugTools={false}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <Stack>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="account-recovery" options={{ headerShown: false }} />
              <Stack.Screen name="create-account" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            <OfflineIndicator />
          </AuthProvider>
        </ThemeProvider>
      </PubflowProvider>
    </SafeAreaProvider>
  );
}
