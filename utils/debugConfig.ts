/**
 * Configuración de depuración para la aplicación
 *
 * Este archivo proporciona utilidades para gestionar la configuración de depuración
 * sin depender de las rutas internas de @pubflow/react-native
 */

// Configuración de depuración
interface DebugConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  categories: {
    api: boolean;
    request: boolean;
    response: boolean;
    error: boolean;
    storage: boolean;
    auth: boolean;
    ui: boolean;
  };
  // Configuración de red
  network: {
    // Interceptar peticiones fetch
    interceptFetch: boolean;
    // Mostrar detalles de peticiones
    showRequestDetails: boolean;
    // Mostrar detalles de respuestas
    showResponseDetails: boolean;
    // Historial máximo de peticiones
    maxHistory: number;
  };
  // Configuración de API
  api: {
    // URLs base por entorno
    baseUrls: {
      development: string;
      staging: string;
      production: string;
    };
    // Headers por defecto
    defaultHeaders: Record<string, string>;
    // Timeout por defecto (ms)
    timeout: number;
  };
}

// Configuración por defecto
const defaultConfig: DebugConfig = {
  enabled: __DEV__, // Habilitado solo en desarrollo por defecto
  level: 'info',
  categories: {
    api: true,
    request: true,
    response: true,
    error: true,
    storage: true,
    auth: true,
    ui: true
  },
  network: {
    interceptFetch: true,
    showRequestDetails: true,
    showResponseDetails: true,
    maxHistory: 100
  },
  api: {
    baseUrls: {
      development: 'http://localhost:3000',
      staging: 'https://staging-api.example.com',
      production: 'https://api.example.com'
    },
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 30000 // 30 segundos
  }
};

// Configuración actual
let debugConfig: DebugConfig = { ...defaultConfig };

/**
 * Establece la configuración de depuración
 *
 * @param config Configuración de depuración
 */
export function setDebugConfig(config: Partial<DebugConfig>): void {
  debugConfig = {
    ...debugConfig,
    ...config,
    categories: {
      ...debugConfig.categories,
      ...(config.categories || {})
    }
  };

  // Guardar en localStorage para persistencia entre recargas
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aula_pml_debug_config', JSON.stringify(debugConfig));
    }
  } catch (error) {
    console.warn('No se pudo guardar la configuración de depuración:', error);
  }

  console.log('Configuración de depuración actualizada:', debugConfig);
}

/**
 * Obtiene la configuración de depuración actual
 *
 * @returns Configuración de depuración
 */
export function getDebugConfig(): DebugConfig {
  // Intentar cargar desde localStorage si existe
  try {
    if (typeof localStorage !== 'undefined') {
      const savedConfig = localStorage.getItem('aula_pml_debug_config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        debugConfig = {
          ...defaultConfig,
          ...parsedConfig,
          categories: {
            ...defaultConfig.categories,
            ...(parsedConfig.categories || {})
          }
        };
      }
    }
  } catch (error) {
    console.warn('No se pudo cargar la configuración de depuración:', error);
  }

  return debugConfig;
}

/**
 * Habilita o deshabilita la depuración
 *
 * @param enabled Estado de habilitación
 */
export function enableDebug(enabled: boolean): void {
  setDebugConfig({ enabled });
}

/**
 * Establece el nivel de depuración
 *
 * @param level Nivel de depuración
 */
export function setDebugLevel(level: DebugConfig['level']): void {
  setDebugConfig({ level });
}

/**
 * Habilita o deshabilita una categoría de depuración
 *
 * @param category Categoría de depuración
 * @param enabled Estado de habilitación
 */
export function enableDebugCategory(
  category: keyof DebugConfig['categories'],
  enabled: boolean
): void {
  setDebugConfig({
    categories: {
      [category]: enabled
    } as any
  });
}

/**
 * Registra un mensaje de depuración si la depuración está habilitada
 *
 * @param level Nivel de log
 * @param category Categoría de log
 * @param message Mensaje de log
 * @param data Datos adicionales
 */
export function debugLog(
  level: DebugConfig['level'],
  category: keyof DebugConfig['categories'],
  message: string,
  data?: any
): void {
  const config = getDebugConfig();

  // Verificar si la depuración está habilitada
  if (!config.enabled) {
    return;
  }

  // Verificar nivel de log
  const levels: DebugConfig['level'][] = ['debug', 'info', 'warn', 'error'];
  const configLevelIndex = levels.indexOf(config.level);
  const currentLevelIndex = levels.indexOf(level);

  // Solo loguear si el nivel actual es mayor o igual al nivel configurado
  if (currentLevelIndex < configLevelIndex) {
    return;
  }

  // Verificar categoría
  if (!config.categories[category]) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[DEBUG][${timestamp}][${level.toUpperCase()}][${category}]`;

  switch (level) {
    case 'debug':
      console.debug(prefix, message, data || '');
      break;
    case 'info':
      console.info(prefix, message, data || '');
      break;
    case 'warn':
      console.warn(prefix, message, data || '');
      break;
    case 'error':
      console.error(prefix, message, data || '');
      break;
  }
}

export default {
  getDebugConfig,
  setDebugConfig,
  enableDebug,
  setDebugLevel,
  enableDebugCategory,
  debugLog
};
