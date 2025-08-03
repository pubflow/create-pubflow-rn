import React from 'react';
import { View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';

interface AppLogoProps {
  width?: number;
  height?: number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
}

// Función para resolver el path del logo desde las variables de entorno
const getLogoSource = () => {
  const logoPath = process.env.EXPO_PUBLIC_LOGO || '@/assets/images/Pubflow_black.svg';

  // Si es una URL externa, usar como URI
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return { uri: logoPath };
  }

  // Para paths locales, intentar require() dinámicamente usando eval
  try {
    // Usar eval para require dinámico - acepta CUALQUIER path del ENV
    const logoSource = eval(`require('${logoPath}')`);
    return logoSource;
  } catch {
    // Si falla, intentar como URI (para casos edge)
    try {
      return { uri: logoPath };
    } catch {
      // Último fallback - solo en caso de error total
      if (__DEV__) {
        console.warn(`Could not load logo "${logoPath}", using fallback`);
      }
      return require('@/assets/images/Pubflow_black.svg');
    }
  }
};

export default function AppLogo({ 
  width = 200, 
  height = 50, 
  style,
  containerStyle 
}: AppLogoProps) {
  const logoSource = getLogoSource();

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={logoSource}
        style={[
          {
            width,
            height,
          },
          style
        ]}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
