import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PubflowProvider, OfflineIndicator } from '@pubflow/react-native';
import React, { ReactNode, useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GlobalDebugger } from '@/components/debug';
import { enableDebug, setDebugLevel } from '@/utils/debugConfig';

// Auth component to handle redirects
function AuthProvider({ children }: { children: ReactNode }) {
  // Simplificamos el componente para evitar bucles
  // Cada pantalla manejará su propia lógica de autenticación
  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Configurar depuración al iniciar
  useEffect(() => {
    // Habilitar depuración en desarrollo
    if (__DEV__) {
      enableDebug(true);
      setDebugLevel('debug');
      console.log('Depuración habilitada en modo desarrollo');
    }
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <PubflowProvider
        config={{
          baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.pml.edu.do',
          bridgeBasePath: '/bridge',
          authBasePath: '/auth',
          useSecureStorage: false, // Usar AsyncStorage en lugar de SecureStore
          storageConfig: {
            prefix: '', // Sin prefijo para evitar duplicación
            sessionKey: 'session_id' // Clave específica para la sesión
          },
          sessionConfig: {
            validationInterval: 60 * 60 * 1000, // 60 minutos
            autoValidate: false, // Desactivar validación automática para evitar problemas
            validateOnStartup: false, // No validar al iniciar para evitar problemas
            validateBeforeRequests: false // No validar antes de cada petición para evitar problemas
          }
        }}
        enableDebugTools={__DEV__} // Habilitar herramientas de depuración en desarrollo
      >
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
            {/* Depurador global - solo visible en desarrollo */}
            {__DEV__ && <GlobalDebugger initialVisible={false} />}
          </AuthProvider>
        </ThemeProvider>
      </PubflowProvider>
    </SafeAreaProvider>
  );
}
