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

  // Mapeo de paths comunes para require()
  const logoMap: { [key: string]: any } = {
    '@/assets/images/Pubflow_black.svg': require('@/assets/images/Pubflow_black.svg'),
    '@/assets/images/partial-react-logo.png': require('@/assets/images/partial-react-logo.png'),
    // Agregar más logos aquí según sea necesario
    // Ejemplo: '@/assets/images/custom-logo.png': require('@/assets/images/custom-logo.png'),
  };

  // Si el path está en el mapeo, usar require(), sino intentar como URI
  if (logoMap[logoPath]) {
    return logoMap[logoPath];
  }

  // Si es una URL externa, usar como URI
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return { uri: logoPath };
  }

  // Fallback al logo por defecto
  console.warn(`Logo path "${logoPath}" not found in logoMap. Using default logo.`);
  return logoMap['@/assets/images/Pubflow_black.svg'];
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
