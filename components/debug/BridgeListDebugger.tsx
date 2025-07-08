import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { configureBridgeDebug, logApiRequest, logApiResponse, logApiError } from '../../utils/bridgeDebug';
import { getDebugConfig, setDebugConfig } from '../../utils/debugConfig';
import { logRequest, logResponse, logError } from '../../utils/networkInterceptor';
import NetworkInspector from './NetworkInspector';

interface BridgeListDebuggerProps {
  entityConfig: any;
  searchParams?: any;
  visible?: boolean;
  onClose?: () => void;
}

/**
 * Componente para depurar BridgeList
 * Muestra información detallada sobre la configuración y las solicitudes
 */
export default function BridgeListDebugger({
  entityConfig,
  searchParams,
  visible = false,
  onClose
}: BridgeListDebuggerProps) {
  const [isVisible, setIsVisible] = useState(visible);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'config' | 'requests' | 'responses' | 'errors'>('config');
  const [showNetworkInspector, setShowNetworkInspector] = useState(false);

  // Verificar si el debug está habilitado
  useEffect(() => {
    const { enabled } = getDebugConfig();
    setDebugEnabled(enabled);
  }, []);

  // Actualizar visibilidad cuando cambia la prop
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  // Construir URL base
  const basePath = entityConfig.basePath || '/bridge';
  const baseEndpoint = `${basePath}/${entityConfig.endpoint}`;

  // Construir URL de búsqueda
  let searchUrl = `${baseEndpoint}/search`;

  if (searchParams) {
    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Manejar valores de array
          value.forEach((item: any) => {
            queryParams.append(`${key}[]`, String(item));
          });
        } else {
          queryParams.append(key, String(value));
        }
      }
    }

    searchUrl += `?${queryParams.toString()}`;
  }

  // Simular una solicitud para depuración
  const simulateRequest = () => {
    const request = {
      url: searchUrl,
      method: 'GET',
      params: searchParams,
      timestamp: new Date().toISOString()
    };

    setRequests([request, ...requests]);
    logApiRequest(searchUrl, searchParams);

    // Registrar en el interceptor de red
    logRequest(
      searchUrl,
      'GET',
      { 'Content-Type': 'application/json' },
      searchParams,
      'bridge',
      entityConfig.endpoint
    );

    // Simular respuesta después de 1 segundo
    setTimeout(() => {
      const response = {
        url: searchUrl,
        status: 200,
        data: {
          rows: [
            { id: '1', name: 'Item 1' },
            { id: '2', name: 'Item 2' }
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 2,
            hasMore: false
          }
        },
        timestamp: new Date().toISOString()
      };

      setResponses([response, ...responses]);
      logApiResponse(searchUrl, response);

      // Registrar en el interceptor de red
      logResponse(
        searchUrl,
        200,
        'OK',
        { 'Content-Type': 'application/json' },
        response.data
      );
    }, 1000);
  };

  // Simular un error para depuración
  const simulateError = () => {
    const error = {
      url: searchUrl,
      method: 'GET',
      params: searchParams,
      error: {
        message: 'Error de conexión',
        code: 'NETWORK_ERROR'
      },
      timestamp: new Date().toISOString()
    };

    setErrors([error, ...errors]);
    logApiError(searchUrl, error);

    // Registrar en el interceptor de red
    logError(
      searchUrl,
      error.error.message,
      error.error.code
    );
  };

  // Habilitar/deshabilitar depuración
  const toggleDebug = () => {
    const newDebugEnabled = !debugEnabled;

    // Obtener configuración actual
    const config = getDebugConfig();

    // Actualizar configuración
    setDebugConfig({
      ...config,
      enabled: newDebugEnabled,
      categories: {
        ...config.categories,
        api: newDebugEnabled,
        request: newDebugEnabled,
        response: newDebugEnabled,
        error: newDebugEnabled
      }
    });

    // También configurar BridgeList
    configureBridgeDebug({
      enabled: newDebugEnabled
    });

    setDebugEnabled(newDebugEnabled);
  };

  // Cerrar modal
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={handleClose}
      >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>BridgeList Debugger</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'config' && styles.activeTab]}
              onPress={() => setActiveTab('config')}
            >
              <Text style={styles.tabText}>Configuración</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
              onPress={() => setActiveTab('requests')}
            >
              <Text style={styles.tabText}>Solicitudes ({requests.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'responses' && styles.activeTab]}
              onPress={() => setActiveTab('responses')}
            >
              <Text style={styles.tabText}>Respuestas ({responses.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'errors' && styles.activeTab]}
              onPress={() => setActiveTab('errors')}
            >
              <Text style={styles.tabText}>Errores ({errors.length})</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {activeTab === 'config' && (
              <View>
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Debug habilitado:</Text>
                  <Text style={styles.configValue}>{debugEnabled ? 'Sí' : 'No'}</Text>
                </View>
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Endpoint base:</Text>
                  <Text style={styles.configValue}>{baseEndpoint}</Text>
                </View>
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>URL de búsqueda:</Text>
                  <Text style={styles.configValue}>{searchUrl}</Text>
                </View>
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Parámetros:</Text>
                  <Text style={styles.configValue}>
                    {JSON.stringify(searchParams, null, 2)}
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, debugEnabled ? styles.buttonEnabled : styles.buttonDisabled]}
                    onPress={toggleDebug}
                  >
                    <Text style={styles.buttonText}>
                      {debugEnabled ? 'Deshabilitar Debug' : 'Habilitar Debug'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={simulateRequest}
                  >
                    <Text style={styles.buttonText}>Simular Solicitud</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonDanger]}
                    onPress={simulateError}
                  >
                    <Text style={styles.buttonText}>Simular Error</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={() => setShowNetworkInspector(true)}
                  >
                    <Text style={styles.buttonText}>Ver Inspector de Red</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === 'requests' && (
              <View>
                {requests.length === 0 ? (
                  <Text style={styles.emptyText}>No hay solicitudes registradas</Text>
                ) : (
                  requests.map((request, index) => (
                    <View key={index} style={styles.item}>
                      <Text style={styles.itemTitle}>{request.url}</Text>
                      <Text style={styles.itemSubtitle}>
                        {request.method} - {request.timestamp}
                      </Text>
                      <Text style={styles.itemContent}>
                        {JSON.stringify(request.params, null, 2)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === 'responses' && (
              <View>
                {responses.length === 0 ? (
                  <Text style={styles.emptyText}>No hay respuestas registradas</Text>
                ) : (
                  responses.map((response, index) => (
                    <View key={index} style={styles.item}>
                      <Text style={styles.itemTitle}>{response.url}</Text>
                      <Text style={styles.itemSubtitle}>
                        Status: {response.status} - {response.timestamp}
                      </Text>
                      <Text style={styles.itemContent}>
                        {JSON.stringify(response.data, null, 2)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === 'errors' && (
              <View>
                {errors.length === 0 ? (
                  <Text style={styles.emptyText}>No hay errores registrados</Text>
                ) : (
                  errors.map((error, index) => (
                    <View key={index} style={[styles.item, styles.errorItem]}>
                      <Text style={styles.itemTitle}>{error.url}</Text>
                      <Text style={styles.itemSubtitle}>
                        {error.method} - {error.timestamp}
                      </Text>
                      <Text style={styles.errorText}>
                        {error.error.message} ({error.error.code})
                      </Text>
                      <Text style={styles.itemContent}>
                        {JSON.stringify(error.params, null, 2)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      </Modal>

      {/* Inspector de red */}
      <NetworkInspector
        visible={showNetworkInspector}
        onClose={() => setShowNetworkInspector(false)}
        filter="bridge"
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  configItem: {
    marginBottom: 15,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  configValue: {
    fontSize: 14,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonEnabled: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    backgroundColor: '#4CAF50',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonDanger: {
    backgroundColor: '#FF9500',
  },
  buttonSecondary: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorItem: {
    backgroundColor: '#ffebee',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  itemContent: {
    fontSize: 14,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
