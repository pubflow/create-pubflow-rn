# 🎨 Sistema de Colores Aula PML - Guía Rápida

## 🚀 Inicio Rápido

### Configuración Básica
1. **Configurar color principal** en `.env`:
   ```env
   EXPO_PUBLIC_MAIN_COLOR="#c30000"
   ```

2. **Importar en tu componente**:
   ```typescript
   import { ColorSystem, COLORS } from '@/utils/colorSystem';
   ```

3. **Usar en estilos**:
   ```typescript
   const styles = StyleSheet.create({
     button: {
       backgroundColor: COLORS.primary,
       color: COLORS.textPrimary,
     }
   });
   ```

## 📋 Colores Más Usados

### Colores Principales
```typescript
COLORS.primary          // Color principal de la app
COLORS.primaryLight     // Versión clara del principal
COLORS.primaryDark      // Versión oscura del principal
```

### Colores de Texto
```typescript
COLORS.textPrimary      // Texto principal (oscuro)
COLORS.textSecondary    // Texto secundario (gris)
ColorSystem.text.inverse // Texto blanco
```

### Fondos y Superficies
```typescript
COLORS.background       // Fondo principal
COLORS.surface          // Superficie de cards
ColorSystem.surface.secondary // Fondo secundario
```

### Estados y Alertas
```typescript
COLORS.success          // Verde para éxito
COLORS.error            // Rojo para errores
COLORS.warning          // Naranja para advertencias
COLORS.info             // Azul para información
```

## 🎯 Ejemplos Prácticos

### Botón Principal
```typescript
const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: ColorSystem.primary.DEFAULT,
    borderRadius: 12,
    padding: 16,
    shadowColor: ColorSystem.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: ColorSystem.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

### Input de Formulario
```typescript
const styles = StyleSheet.create({
  input: {
    backgroundColor: ColorSystem.surface.primary,
    borderColor: ColorSystem.border.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: ColorSystem.text.primary,
    shadowColor: ColorSystem.shadow.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
```

### Mensaje de Error
```typescript
const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: ColorSystem.error[50],
    borderColor: ColorSystem.error[200],
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: ColorSystem.error.DEFAULT,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
```

### Card con Sombra
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorSystem.surface.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: ColorSystem.shadow.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: ColorSystem.border.primary,
  },
});
```

## 🛠️ Utilidades Útiles

### Agregar Transparencia
```typescript
// Color con 20% de opacidad
backgroundColor: ColorUtils.withOpacity(ColorSystem.primary.DEFAULT, 0.2)
```

### Texto Contrastante Automático
```typescript
// Automáticamente blanco o negro según el fondo
color: ColorUtils.getContrastText(ColorSystem.primary.DEFAULT)
```

### Sombras por Nivel
```typescript
// Sombra nivel 3 (Material Design)
shadowColor: ColorUtils.getElevation(3)
```

## 🎨 Variaciones de Color

### Escala Completa del Color Principal
```typescript
ColorSystem.primary[50]   // Muy claro
ColorSystem.primary[100]  // Claro
ColorSystem.primary[200]  // 
ColorSystem.primary[300]  // 
ColorSystem.primary[400]  // 
ColorSystem.primary[500]  // Base (DEFAULT)
ColorSystem.primary[600]  // 
ColorSystem.primary[700]  // 
ColorSystem.primary[800]  // 
ColorSystem.primary[900]  // Muy oscuro
ColorSystem.primary[950]  // Extremo
```

## ⚡ Tips de Rendimiento

1. **Usa COLORS para casos comunes** (más rápido):
   ```typescript
   backgroundColor: COLORS.primary
   ```

2. **Usa ColorSystem para casos específicos**:
   ```typescript
   backgroundColor: ColorSystem.primary[300]
   ```

3. **Cachea colores calculados**:
   ```typescript
   const primaryWithOpacity = ColorUtils.withOpacity(COLORS.primary, 0.1);
   ```

## 🔧 Solución de Problemas

### Error: "Property 'colors' doesn't exist"
- **Solución**: Usar `ColorSystem` en lugar de `Colors`
- **Correcto**: `import { ColorSystem } from '@/utils/colorSystem'`

### Color no se actualiza
- **Verificar**: Variable de entorno `EXPO_PUBLIC_MAIN_COLOR`
- **Reiniciar**: El servidor de desarrollo después de cambiar .env

### Contraste insuficiente
- **Usar**: `ColorUtils.getContrastText()` para texto automático
- **Verificar**: Combinaciones con herramientas de accesibilidad

## 📞 Soporte

Para más información, consulta:
- 📖 [Documentación completa](./color-system.md)
- 🎨 [Componente de ejemplo](../components/examples/ColorSystemExample.tsx)
- 🔧 [Archivo del sistema](../utils/colorSystem.ts)
