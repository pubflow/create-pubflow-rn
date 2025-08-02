# Sistema de Colores Profesional - Aula PML

## 🎨 Descripción General

El sistema de colores de Aula PML está diseñado siguiendo los principios de Material Design 3 y las mejores prácticas de UI/UX modernas. Se basa en un color principal configurable a través de variables de entorno y genera automáticamente una paleta completa y coherente.

## 🔧 Configuración

### Variable de Entorno
```env
EXPO_PUBLIC_MAIN_COLOR="#c30000"
```

El sistema genera automáticamente todas las variaciones de color basándose en este color principal.

## 📚 Estructura del Sistema

### 1. Colores Primarios
```typescript
ColorSystem.primary.50   // Muy claro
ColorSystem.primary.100  // Claro
ColorSystem.primary.200  // Medio claro
ColorSystem.primary.300  // Claro medio
ColorSystem.primary.400  // Medio
ColorSystem.primary.500  // Color base (DEFAULT)
ColorSystem.primary.600  // Medio oscuro
ColorSystem.primary.700  // Oscuro medio
ColorSystem.primary.800  // Oscuro
ColorSystem.primary.900  // Muy oscuro
ColorSystem.primary.950  // Extremadamente oscuro

// Accesos rápidos
ColorSystem.primary.DEFAULT // Color principal
ColorSystem.primary.light   // Versión clara
ColorSystem.primary.dark    // Versión oscura
```

### 2. Colores Semánticos
```typescript
// Éxito
ColorSystem.success.DEFAULT // #22c55e - Verde éxito
ColorSystem.success.50      // Verde muy claro
ColorSystem.success.900     // Verde muy oscuro

// Advertencia
ColorSystem.warning.DEFAULT // #f59e0b - Naranja advertencia

// Error
ColorSystem.error.DEFAULT   // #ef4444 - Rojo error

// Información
ColorSystem.info.DEFAULT    // #3b82f6 - Azul información
```

### 3. Colores de Superficie
```typescript
ColorSystem.surface.primary    // #ffffff - Fondo principal
ColorSystem.surface.secondary  // #f8fafc - Fondo secundario
ColorSystem.surface.tertiary   // #f1f5f9 - Fondo terciario
ColorSystem.surface.elevated   // #ffffff - Superficies elevadas
ColorSystem.surface.overlay    // rgba(0, 0, 0, 0.5) - Overlays
ColorSystem.surface.glass      // rgba(255, 255, 255, 0.1) - Glassmorphism
```

### 4. Colores de Texto
```typescript
ColorSystem.text.primary     // #0f172a - Texto principal
ColorSystem.text.secondary   // #475569 - Texto secundario
ColorSystem.text.tertiary    // #94a3b8 - Texto terciario
ColorSystem.text.inverse     // #ffffff - Texto inverso
ColorSystem.text.disabled    // #cbd5e1 - Texto deshabilitado
ColorSystem.text.placeholder // #94a3b8 - Placeholder
```

### 5. Colores de Borde
```typescript
ColorSystem.border.primary   // #e2e8f0 - Borde principal
ColorSystem.border.secondary // #cbd5e1 - Borde secundario
ColorSystem.border.focus     // Color principal - Borde en foco
ColorSystem.border.error     // #ef4444 - Borde de error
ColorSystem.border.success   // #22c55e - Borde de éxito
```

## 🛠️ Utilidades

### ColorUtils (Utilidades de Color)
```typescript
// Agregar opacidad a un color
ColorUtils.withOpacity('#c30000', 0.5) // Resultado: #c3000080

// Obtener color de texto contrastante automáticamente
ColorUtils.getContrastText('#c30000') // Resultado: '#ffffff' o '#0f172a'

// Crear gradiente personalizado
ColorUtils.gradient('#c30000', '#ff4444', 'to right')

// Obtener sombra según nivel de elevación
ColorUtils.getElevation(3) // Sombra nivel 3 (Material Design)
```

### Accesos Rápidos (COLORS)
```typescript
import { COLORS } from '@/utils/colorSystem';

COLORS.primary        // Color principal de la aplicación
COLORS.primaryLight   // Color principal versión clara
COLORS.primaryDark    // Color principal versión oscura
COLORS.success        // Color de éxito (verde)
COLORS.error          // Color de error (rojo)
COLORS.background     // Fondo principal
COLORS.textPrimary    // Texto principal
```

## 🎯 Casos de Uso Comunes

### Botones Principales
```typescript
// Botón principal con sombra y elevación
{
  backgroundColor: ColorSystem.primary.DEFAULT,
  color: ColorSystem.text.inverse,
  shadowColor: ColorSystem.primary.DEFAULT,
  shadowOpacity: 0.3,
  borderRadius: 12,
  elevation: 6,
}
```

### Campos de Entrada y Formularios
```typescript
// Input con estilo profesional
{
  backgroundColor: ColorSystem.surface.primary,
  borderColor: ColorSystem.border.primary,
  color: ColorSystem.text.primary,
  shadowColor: ColorSystem.shadow.sm,
  borderRadius: 12,
  borderWidth: 1,
}
```

### Estados de Error y Validación
```typescript
// Mensaje de error con fondo claro
{
  backgroundColor: ColorSystem.error[50],
  borderColor: ColorSystem.error[200],
  color: ColorSystem.error.DEFAULT,
  borderWidth: 1,
  borderRadius: 12,
}
```

### Tarjetas y Superficies Elevadas
```typescript
// Card con sombra sutil
{
  backgroundColor: ColorSystem.surface.primary,
  borderColor: ColorSystem.border.primary,
  shadowColor: ColorSystem.shadow.md,
  borderRadius: 12,
  elevation: 4,
}
```

## 🌟 Características Profesionales

### 1. **Generación Automática de Paleta**
- Todas las variaciones (50-950) se generan automáticamente desde el color base
- Mantiene relaciones armónicas y matemáticamente precisas entre tonos
- Garantiza contraste adecuado según estándares de accesibilidad
- Algoritmos basados en HSL para transiciones suaves

### 2. **Accesibilidad y Usabilidad**
- Cumple con estándares WCAG 2.1 AA
- Contraste automático para texto sobre cualquier fondo
- Colores semánticos universalmente reconocidos
- Soporte para usuarios con daltonismo

### 3. **Consistencia Visual**
- Paleta unificada en toda la aplicación
- Mantenimiento centralizado desde un solo archivo
- Escalabilidad para múltiples temas o marcas
- Coherencia entre plataformas (iOS, Android, Web)

### 4. **Flexibilidad de Desarrollo**
- Configurable completamente por variables de entorno
- Utilidades avanzadas para casos especiales
- Compatible con React Native, Expo y frameworks web
- Fácil integración con sistemas de diseño existentes

## 📱 Implementación en Componentes

### Ejemplo: Modal de Perfil Profesional
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorSystem.surface.secondary, // Fondo suave
  },
  header: {
    backgroundColor: ColorSystem.surface.primary,   // Fondo principal
    borderBottomColor: ColorSystem.border.primary,  // Borde sutil
    shadowColor: ColorSystem.shadow.primary,        // Sombra del color principal
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: ColorSystem.primary.DEFAULT,   // Color principal
    shadowColor: ColorSystem.primary.DEFAULT,       // Sombra del mismo color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: 12,
  },
  buttonText: {
    color: ColorSystem.text.inverse,                // Texto blanco automático
    fontWeight: '600',
  },
});
```

## 🔄 Guía de Migración

Para migrar componentes existentes al nuevo sistema:

### 1. **Importar el Sistema de Colores**
```typescript
import { ColorSystem, ColorUtils, MAIN_COLOR } from '@/utils/colorSystem';
```

### 2. **Reemplazar Colores Codificados**
```typescript
// ❌ Antes (colores hardcodeados)
color: '#c30000'
backgroundColor: '#ffffff'
borderColor: '#e5e5e5'

// ✅ Después (sistema profesional)
color: ColorSystem.primary.DEFAULT
backgroundColor: ColorSystem.surface.primary
borderColor: ColorSystem.border.primary
```

### 3. **Utilizar Utilidades para Casos Especiales**
```typescript
// ❌ Antes (opacidad manual)
backgroundColor: 'rgba(195, 0, 0, 0.1)'

// ✅ Después (utilidad automática)
backgroundColor: ColorUtils.withOpacity(ColorSystem.primary.DEFAULT, 0.1)
```

### 4. **Aprovechar Colores Semánticos**
```typescript
// ✅ Estados claros y consistentes
backgroundColor: ColorSystem.success[50]  // Fondo de éxito
color: ColorSystem.error.DEFAULT         // Texto de error
borderColor: ColorSystem.warning[200]    // Borde de advertencia
```

## 🎨 Beneficios del Sistema

### Para Desarrolladores
- **Mantenimiento Simplificado**: Un solo lugar para gestionar todos los colores
- **Desarrollo Más Rápido**: Colores predefinidos y utilidades listas para usar
- **Menos Errores**: No más colores inconsistentes o mal contrastados
- **Escalabilidad**: Fácil agregar temas o cambiar la identidad visual

### Para Usuarios
- **Experiencia Visual Superior**: Colores armónicos y profesionales
- **Mejor Accesibilidad**: Contraste optimizado para todos los usuarios
- **Consistencia**: Misma experiencia visual en toda la aplicación
- **Modernidad**: Diseño actualizado siguiendo tendencias actuales

### Para el Negocio
- **Imagen Profesional**: Aplicación con apariencia de nivel empresarial
- **Flexibilidad de Marca**: Fácil adaptación a cambios de identidad corporativa
- **Cumplimiento**: Estándares de accesibilidad para mercados internacionales
- **Futuro-Proof**: Sistema preparado para evoluciones del diseño
