/**
 * Interceptor de red para capturar peticiones HTTP
 * 
 * Este interceptor permite capturar todas las peticiones HTTP y sus respuestas
 * para poder inspeccionarlas en las herramientas de depuración.
 */

import { debugLog } from './debugConfig';

// Tipos de peticiones
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Información de la petición
export interface RequestInfo {
  id: string;
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
  source: 'bridge' | 'auth' | 'other';
  endpoint?: string;
}

// Información de la respuesta
export interface ResponseInfo {
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  timestamp: string;
  duration: number;
}

// Información de error
export interface ErrorInfo {
  requestId: string;
  message: string;
  code?: string;
  stack?: string;
  timestamp: string;
}

// Historial de peticiones
interface NetworkHistory {
  requests: Record<string, RequestInfo>;
  responses: Record<string, ResponseInfo>;
  errors: Record<string, ErrorInfo>;
}

// Historial de red
const networkHistory: NetworkHistory = {
  requests: {},
  responses: {},
  errors: {}
};

// Límite de historial
const HISTORY_LIMIT = 100;

// Callbacks de eventos
type NetworkEventCallback = (data: any) => void;
const eventListeners: Record<string, NetworkEventCallback[]> = {
  request: [],
  response: [],
  error: []
};

/**
 * Genera un ID único para una petición
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Limpia el historial si excede el límite
 */
function cleanupHistory() {
  const requestIds = Object.keys(networkHistory.requests);
  
  if (requestIds.length > HISTORY_LIMIT) {
    const idsToRemove = requestIds.slice(0, requestIds.length - HISTORY_LIMIT);
    
    idsToRemove.forEach(id => {
      delete networkHistory.requests[id];
      delete networkHistory.responses[id];
      delete networkHistory.errors[id];
    });
  }
}

/**
 * Dispara un evento de red
 */
function triggerEvent(eventType: 'request' | 'response' | 'error', data: any) {
  if (eventListeners[eventType]) {
    eventListeners[eventType].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error en callback de evento ${eventType}:`, error);
      }
    });
  }
}

/**
 * Registra una petición
 */
export function logRequest(
  url: string,
  method: HttpMethod,
  headers: Record<string, string> = {},
  body?: any,
  source: RequestInfo['source'] = 'other',
  endpoint?: string
): string {
  const id = generateRequestId();
  const timestamp = new Date().toISOString();
  
  const requestInfo: RequestInfo = {
    id,
    url,
    method,
    headers,
    body,
    timestamp,
    source,
    endpoint
  };
  
  networkHistory.requests[id] = requestInfo;
  
  // Limpiar historial si es necesario
  cleanupHistory();
  
  // Registrar en el log
  debugLog('debug', 'api', `${method} ${url}`, { headers, body });
  
  // Disparar evento
  triggerEvent('request', requestInfo);
  
  return id;
}

/**
 * Registra una respuesta
 */
export function logResponse(
  requestId: string,
  status: number,
  statusText: string,
  headers: Record<string, string> = {},
  data: any
): void {
  const timestamp = new Date().toISOString();
  const request = networkHistory.requests[requestId];
  
  if (!request) {
    console.warn(`No se encontró la petición con ID ${requestId}`);
    return;
  }
  
  const startTime = new Date(request.timestamp).getTime();
  const endTime = new Date(timestamp).getTime();
  const duration = endTime - startTime;
  
  const responseInfo: ResponseInfo = {
    requestId,
    status,
    statusText,
    headers,
    data,
    timestamp,
    duration
  };
  
  networkHistory.responses[requestId] = responseInfo;
  
  // Registrar en el log
  const logLevel = status >= 400 ? 'error' : 'info';
  debugLog(logLevel, 'response', `${request.method} ${request.url} - ${status} ${statusText}`, { 
    duration: `${duration}ms`,
    data 
  });
  
  // Disparar evento
  triggerEvent('response', responseInfo);
}

/**
 * Registra un error
 */
export function logError(
  requestId: string,
  message: string,
  code?: string,
  stack?: string
): void {
  const timestamp = new Date().toISOString();
  const request = networkHistory.requests[requestId];
  
  if (!request) {
    console.warn(`No se encontró la petición con ID ${requestId}`);
    return;
  }
  
  const errorInfo: ErrorInfo = {
    requestId,
    message,
    code,
    stack,
    timestamp
  };
  
  networkHistory.errors[requestId] = errorInfo;
  
  // Registrar en el log
  debugLog('error', 'error', `${request.method} ${request.url} - ${message}`, { 
    code,
    stack 
  });
  
  // Disparar evento
  triggerEvent('error', errorInfo);
}

/**
 * Obtiene el historial de red
 */
export function getNetworkHistory(): NetworkHistory {
  return { ...networkHistory };
}

/**
 * Limpia el historial de red
 */
export function clearNetworkHistory(): void {
  Object.keys(networkHistory.requests).forEach(key => {
    delete networkHistory.requests[key];
  });
  
  Object.keys(networkHistory.responses).forEach(key => {
    delete networkHistory.responses[key];
  });
  
  Object.keys(networkHistory.errors).forEach(key => {
    delete networkHistory.errors[key];
  });
}

/**
 * Suscribe a eventos de red
 */
export function subscribeToNetworkEvents(
  eventType: 'request' | 'response' | 'error',
  callback: NetworkEventCallback
): () => void {
  if (!eventListeners[eventType]) {
    eventListeners[eventType] = [];
  }
  
  eventListeners[eventType].push(callback);
  
  // Devolver función para cancelar suscripción
  return () => {
    const index = eventListeners[eventType].indexOf(callback);
    if (index !== -1) {
      eventListeners[eventType].splice(index, 1);
    }
  };
}

/**
 * Intercepta el método fetch global
 */
export function interceptFetch(): void {
  if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch;
    
    window.fetch = async function(input: RequestInfo | string, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || (typeof input === 'string' ? 'GET' : input.method) || 'GET';
      const headers = init?.headers || (typeof input === 'string' ? {} : input.headers) || {};
      const body = init?.body;
      
      // Determinar la fuente de la petición
      let source: RequestInfo['source'] = 'other';
      let endpoint: string | undefined;
      
      if (url.includes('/bridge/')) {
        source = 'bridge';
        const match = url.match(/\/bridge\/([^/?]+)/);
        if (match) {
          endpoint = match[1];
        }
      } else if (url.includes('/auth/')) {
        source = 'auth';
      }
      
      // Registrar petición
      const requestId = logRequest(
        url,
        method as HttpMethod,
        headers as Record<string, string>,
        body,
        source,
        endpoint
      );
      
      try {
        const response = await originalFetch(input, init);
        
        // Clonar la respuesta para no consumirla
        const clonedResponse = response.clone();
        
        // Procesar la respuesta
        clonedResponse.text().then(text => {
          let data;
          
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = text;
          }
          
          // Extraer headers
          const responseHeaders: Record<string, string> = {};
          clonedResponse.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });
          
          // Registrar respuesta
          logResponse(
            requestId,
            clonedResponse.status,
            clonedResponse.statusText,
            responseHeaders,
            data
          );
        });
        
        return response;
      } catch (error) {
        // Registrar error
        logError(
          requestId,
          error.message,
          error.code,
          error.stack
        );
        
        throw error;
      }
    };
  }
}

export default {
  logRequest,
  logResponse,
  logError,
  getNetworkHistory,
  clearNetworkHistory,
  subscribeToNetworkEvents,
  interceptFetch
};
