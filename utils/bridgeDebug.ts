/**
 * BridgeList Debug Utilities
 *
 * Proporciona utilidades para depurar problemas relacionados con BridgeList
 * y las solicitudes de API en Pubflow.
 */

import { getDebugConfig, debugLog } from './debugConfig';

// Niveles de log
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Categorías de log
type LogCategory = 'api' | 'request' | 'response' | 'error';

// Configuración de logging
interface LoggingConfig {
  enabled: boolean;
  level: LogLevel;
  categories: {
    api: boolean;
    request: boolean;
    response: boolean;
    error: boolean;
  };
}

// Configuración por defecto
const defaultLoggingConfig: LoggingConfig = {
  enabled: __DEV__, // Habilitado solo en desarrollo por defecto
  level: 'info',
  categories: {
    api: true,
    request: true,
    response: true,
    error: true
  }
};

// Configuración actual
let loggingConfig: LoggingConfig = { ...defaultLoggingConfig };

/**
 * Configura las opciones de logging
 *
 * @param config Configuración de logging
 */
export function configureBridgeDebug(config: Partial<LoggingConfig>): void {
  loggingConfig = {
    ...loggingConfig,
    ...config,
    categories: {
      ...loggingConfig.categories,
      ...(config.categories || {})
    }
  };
}

/**
 * Verifica si el logging está habilitado para un nivel y categoría específicos
 *
 * @param level Nivel de log
 * @param category Categoría de log
 * @returns Verdadero si el logging está habilitado
 */
function isLoggingEnabled(level: LogLevel, category: LogCategory): boolean {
  // Verificar si el debug está habilitado en Pubflow
  const { enabled: debugEnabled } = getDebugConfig();

  // Si el debug no está habilitado en Pubflow, no loguear
  if (!debugEnabled && !loggingConfig.enabled) {
    return false;
  }

  // Verificar nivel de log
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const configLevelIndex = levels.indexOf(loggingConfig.level);
  const currentLevelIndex = levels.indexOf(level);

  // Solo loguear si el nivel actual es mayor o igual al nivel configurado
  if (currentLevelIndex < configLevelIndex) {
    return false;
  }

  // Verificar categoría
  return loggingConfig.categories[category];
}

/**
 * Función de log para BridgeList
 *
 * @param level Nivel de log
 * @param category Categoría de log
 * @param message Mensaje de log
 * @param data Datos adicionales
 */
export function bridgeLog(
  level: LogLevel,
  category: LogCategory,
  message: string,
  data?: any
): void {
  if (!isLoggingEnabled(level, category)) {
    return;
  }

  // Usar nuestra función de log centralizada
  debugLog(level, category as any, `[BridgeList] ${message}`, data);
}

/**
 * Registra una solicitud de API
 *
 * @param endpoint Endpoint de la API
 * @param params Parámetros de la solicitud
 */
export function logApiRequest(endpoint: string, params?: any): void {
  bridgeLog('info', 'request', `Solicitud a ${endpoint}`, params);
}

/**
 * Registra una respuesta de API
 *
 * @param endpoint Endpoint de la API
 * @param response Respuesta de la API
 */
export function logApiResponse(endpoint: string, response: any): void {
  bridgeLog('info', 'response', `Respuesta de ${endpoint}`, response);
}

/**
 * Registra un error de API
 *
 * @param endpoint Endpoint de la API
 * @param error Error de la API
 */
export function logApiError(endpoint: string, error: any): void {
  bridgeLog('error', 'error', `Error en ${endpoint}`, error);
}

/**
 * Utilidad para depurar BridgeList
 *
 * @param entityConfig Configuración de la entidad
 * @param params Parámetros de búsqueda
 * @returns Información de depuración
 */
export function debugBridgeList(entityConfig: any, params?: any): void {
  // Verificar si el debug está habilitado
  const { enabled } = getDebugConfig();

  if (!enabled && !loggingConfig.enabled) {
    console.warn('BridgeList debug está deshabilitado. Habilítalo en PubflowProvider o con configureBridgeDebug().');
    return;
  }

  // Construir URL base
  const basePath = entityConfig.basePath || '/bridge';
  const baseEndpoint = `${basePath}/${entityConfig.endpoint}`;

  // Construir URL de búsqueda
  let searchUrl = `${baseEndpoint}/search`;

  if (params) {
    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Manejar valores de array
          value.forEach(item => {
            queryParams.append(`${key}[]`, String(item));
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    }

    searchUrl += `?${queryParams.toString()}`;
  }

  // Mostrar información de depuración
  bridgeLog('debug', 'api', 'Información de depuración de BridgeList', {
    entityConfig,
    baseEndpoint,
    searchUrl,
    params
  });
}

export default {
  configureBridgeDebug,
  logApiRequest,
  logApiResponse,
  logApiError,
  debugBridgeList
};
