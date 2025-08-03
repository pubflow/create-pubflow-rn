# Logo Configuration Examples

## ✅ Sistema Completo Implementado

El componente `AppLogo` ahora soporta **múltiples formatos** tanto **locales como externos**:

### **Formatos Soportados:**
- 🖼️ **SVG** - Vectorial, escalable
- 🖼️ **PNG** - Con transparencia
- 🖼️ **WEBP** - Formato moderno, optimizado

### **Fuentes Soportadas:**
- 📁 **Archivos locales** - Usando `require()`
- 🌐 **URLs externas** - Usando `{ uri: url }`

## 📝 Ejemplos de Configuración

### **1. Logos Locales SVG:**
```env
EXPO_PUBLIC_LOGO="@/assets/images/Pubflow_black.svg"
EXPO_PUBLIC_LOGO="@/assets/images/LOGO-PML-WEB.svg"
```

### **2. Logos Locales PNG:**
```env
EXPO_PUBLIC_LOGO="@/assets/images/LOGO-PML-WEB.png"
EXPO_PUBLIC_LOGO="@/assets/images/partial-react-logo.png"
EXPO_PUBLIC_LOGO="@/assets/images/react-logo.png"
EXPO_PUBLIC_LOGO="@/assets/images/icon.png"
```

### **3. Logos Locales WEBP:**
```env
EXPO_PUBLIC_LOGO="@/assets/images/LOGO-PML-WEB.webp"
```

### **4. URLs Externas (Cualquier formato):**
```env
EXPO_PUBLIC_LOGO="https://example.com/logo.svg"
EXPO_PUBLIC_LOGO="https://example.com/logo.png"
EXPO_PUBLIC_LOGO="https://example.com/logo.webp"
EXPO_PUBLIC_LOGO="https://cdn.example.com/assets/brand/logo.svg"
```

## 🔧 Cómo Funciona

### **Detección Automática:**
```typescript
// URLs externas → { uri: url }
if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
  return { uri: logoPath };
}

// Archivos locales → require()
switch (logoPath) {
  case '@/assets/images/LOGO-PML-WEB.png':
    return require('@/assets/images/LOGO-PML-WEB.png');
  // ... más casos
}
```

### **Fallback Inteligente:**
- ✅ Si el logo existe → Se carga correctamente
- ⚠️ Si no existe → Usa `Pubflow_black.svg` por defecto
- 🐛 Si hay error → Muestra warning en desarrollo

## 🎯 Casos de Uso Reales

### **Para PML (pml-flowfull-mobile):**
```env
# Opción 1: PNG local
EXPO_PUBLIC_LOGO="@/assets/images/LOGO-PML-WEB.png"

# Opción 2: SVG local
EXPO_PUBLIC_LOGO="@/assets/images/LOGO-PML-WEB.svg"

# Opción 3: WEBP local (más optimizado)
EXPO_PUBLIC_LOGO="@/assets/images/LOGO-PML-WEB.webp"
```

### **Para Pubflow (create-pubflow-rn):**
```env
# Logo por defecto
EXPO_PUBLIC_LOGO="@/assets/images/Pubflow_black.svg"

# Logo personalizado
EXPO_PUBLIC_LOGO="@/assets/images/custom-logo.png"
```

### **Para Clientes con CDN:**
```env
EXPO_PUBLIC_LOGO="https://cdn.miempresa.com/logo.svg"
EXPO_PUBLIC_LOGO="https://assets.miempresa.com/brand/logo-dark.png"
```

## 🚀 Ventajas del Sistema

### **1. Flexibilidad Total:**
- ✅ Cualquier formato de imagen
- ✅ Archivos locales o remotos
- ✅ Sin configuración adicional

### **2. Rendimiento Optimizado:**
- ✅ Archivos locales: `require()` (bundled)
- ✅ URLs externas: `{ uri }` (cached)
- ✅ Fallback automático

### **3. Developer Experience:**
- ✅ Warnings informativos en desarrollo
- ✅ Lista de logos disponibles
- ✅ Manejo de errores robusto

## 🔍 Debugging

### **Si el logo no aparece:**
1. **Verifica el path**: Debe ser exacto
2. **Revisa la consola**: Warnings en modo desarrollo
3. **Confirma el archivo**: Debe existir en `assets/images/`

### **Logs de ejemplo:**
```
WARN: Logo "@/assets/images/mi-logo.png" not found, using default.
WARN: Supported formats: SVG, PNG, WEBP
WARN: Available logos: Pubflow_black.svg, LOGO-PML-WEB.svg, ...
```

## 📋 Checklist de Implementación

- ✅ **pml-flowfull-mobile**: Sistema completo implementado
- ✅ **create-pubflow-rn**: Sistema completo implementado
- ✅ **Soporte SVG**: ✅ Local ✅ Externo
- ✅ **Soporte PNG**: ✅ Local ✅ Externo  
- ✅ **Soporte WEBP**: ✅ Local ✅ Externo
- ✅ **Fallback**: Automático a Pubflow_black.svg
- ✅ **Debugging**: Warnings informativos
- ✅ **Performance**: Optimizado para ambos casos

¡El sistema está **100% funcional** y listo para usar! 🎨✨
