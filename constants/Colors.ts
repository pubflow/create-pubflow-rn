/**
 * Colores del sistema Aula PML integrados con el sistema de colores profesional.
 * Estos colores se basan en el color principal configurado en las variables de entorno.
 */

import { ColorSystem } from '@/utils/colorSystem';

// Colores principales para modo claro y oscuro
const tintColorLight = ColorSystem.primary.DEFAULT;
const tintColorDark = ColorSystem.text.inverse;

export const Colors = {
  light: {
    text: ColorSystem.text.primary,
    background: ColorSystem.surface.primary,
    tint: tintColorLight,
    icon: ColorSystem.text.secondary,
    tabIconDefault: ColorSystem.text.tertiary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: ColorSystem.text.inverse,
    background: ColorSystem.neutral[900],
    tint: tintColorDark,
    icon: ColorSystem.neutral[400],
    tabIconDefault: ColorSystem.neutral[500],
    tabIconSelected: tintColorDark,
  },
};
