import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Switch, ScrollView, Button } from 'react-native';
import { getDebugConfig, setDebugConfig, debugLog } from '../../utils/debugConfig';
import ApiConfigDebugger from './ApiConfigDebugger';
import NetworkInspector from './NetworkInspector';
import { interceptFetch } from '../../utils/networkInterceptor';

interface GlobalDebuggerProps {
  initialVisible?: boolean;
}

/**
 * Componente de depuración global para la aplicación
 * Permite configurar opciones de depuración y ver logs
 */
export default function GlobalDebugger({ initialVisible = false }: GlobalDebuggerProps) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugLevel, setDebugLevelState] = useState<'debug' | 'info' | 'warn' | 'error'>('info');
  const [categorySettings, setCategorySettings] = useState({
    api: true,
    request: true,
    response: true,
    error: true,
    storage: true,
    auth: true,
    ui: true
  });
  const [logs, setLogs] = useState<Array<{
    level: string;
    category: string;
    message: string;
    timestamp: string;
  }>>([]);

  // Estados para los componentes adicionales
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [showNetworkInspector, setShowNetworkInspector] = useState(false);
  const [networkFilter, setNetworkFilter] = useState<'all' | 'bridge' | 'auth' | 'other'>('all');

  // Cargar configuración actual al iniciar
  useEffect(() => {
    const config = getDebugConfig();
    setDebugEnabled(config.enabled);
    setDebugLevelState(config.level);
    setCategorySettings(config.categories);

    // Generar algunos logs de ejemplo
    if (config.enabled) {
      generateSampleLogs();
    }

    // Iniciar interceptor de red si está habilitado
    if (config.network.interceptFetch) {
      interceptFetch();
    }
  }, []);

  // Generar logs de ejemplo para demostración
  const generateSampleLogs = () => {
    const sampleLogs = [
      { level: 'info', category: 'api', message: 'API inicializada correctamente', timestamp: new Date().toISOString() },
      { level: 'debug', category: 'request', message: 'GET /bridge/users', timestamp: new Date().toISOString() },
      { level: 'info', category: 'response', message: 'Respuesta recibida: 200 OK', timestamp: new Date().toISOString() },
      { level: 'warn', category: 'auth', message: 'Sesión a punto de expirar', timestamp: new Date().toISOString() },
      { level: 'error', category: 'api', message: 'Error en la solicitud: Timeout', timestamp: new Date().toISOString() }
    ];

    setLogs(sampleLogs);
  };

  // Actualizar configuración de depuración
  const updateDebugConfig = () => {
    // Obtener configuración actual
    const currentConfig = getDebugConfig();

    // Actualizar configuración global
    const newConfig = {
      ...currentConfig,
      enabled: debugEnabled,
      level: debugLevel,
      categories: categorySettings
    };

    setDebugConfig(newConfig);

    // Registrar cambio
    debugLog('info', 'ui', 'Configuración de depuración actualizada', newConfig);

    // Generar logs de ejemplo si se habilita la depuración
    if (debugEnabled && logs.length === 0) {
      generateSampleLogs();
    }

    // Iniciar interceptor de red si está habilitado
    if (newConfig.network.interceptFetch) {
      interceptFetch();
    }
  };

  // Alternar visibilidad
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Alternar categoría
  const toggleCategory = (category: keyof typeof categorySettings) => {
    setCategorySettings({
      ...categorySettings,
      [category]: !categorySettings[category]
    });
  };

  // Cambiar nivel de depuración
  const changeDebugLevel = (level: 'debug' | 'info' | 'warn' | 'error') => {
    setDebugLevelState(level);
  };

  // Limpiar logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Generar un log de prueba
  const generateTestLog = (level: 'debug' | 'info' | 'warn' | 'error') => {
    const newLog = {
      level,
      category: 'test',
      message: `Log de prueba (${level})`,
      timestamp: new Date().toISOString()
    };

    setLogs([newLog, ...logs]);
    debugLog(level, 'ui', `Log de prueba (${level})`);
  };

  // Renderizar botón flotante
  const renderFloatingButton = () => (
    <TouchableOpacity
      style={[
        styles.debugButton,
        debugEnabled ? styles.debugButtonEnabled : styles.debugButtonDisabled
      ]}
      onPress={toggleVisibility}
    >
      <Text style={styles.debugButtonText}>🐞</Text>
    </TouchableOpacity>
  );

  // Renderizar modal de depuración
  const renderDebugModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={toggleVisibility}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Depurador Global</Text>
            <TouchableOpacity onPress={toggleVisibility} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Configuración General</Text>

              <View style={styles.configItem}>
                <Text>Habilitar Depuración</Text>
                <Switch
                  value={debugEnabled}
                  onValueChange={setDebugEnabled}
                />
              </View>

              <Text style={styles.label}>Nivel de Depuración:</Text>
              <View style={styles.levelButtons}>
                {['debug', 'info', 'warn', 'error'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      debugLevel === level && styles.levelButtonActive
                    ]}
                    onPress={() => changeDebugLevel(level as any)}
                  >
                    <Text style={styles.levelButtonText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.toolsContainer}>
                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => setShowApiConfig(true)}
                >
                  <Text style={styles.toolButtonText}>Configuración API</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => {
                    setNetworkFilter('all');
                    setShowNetworkInspector(true);
                  }}
                >
                  <Text style={styles.toolButtonText}>Inspector de Red</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[styles.filterButton, styles.filterButtonBridge]}
                  onPress={() => {
                    setNetworkFilter('bridge');
                    setShowNetworkInspector(true);
                  }}
                >
                  <Text style={styles.filterButtonText}>Bridge API</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterButton, styles.filterButtonAuth]}
                  onPress={() => {
                    setNetworkFilter('auth');
                    setShowNetworkInspector(true);
                  }}
                >
                  <Text style={styles.filterButtonText}>Auth API</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categorías</Text>

              {Object.keys(categorySettings).map((category) => (
                <View key={category} style={styles.configItem}>
                  <Text>{category}</Text>
                  <Switch
                    value={categorySettings[category as keyof typeof categorySettings]}
                    onValueChange={() => toggleCategory(category as keyof typeof categorySettings)}
                    disabled={!debugEnabled}
                  />
                </View>
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Aplicar Configuración"
                onPress={updateDebugConfig}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.logHeader}>
                <Text style={styles.sectionTitle}>Logs</Text>
                <View style={styles.logActions}>
                  <Button title="Limpiar" onPress={clearLogs} />
                  <Button title="Generar" onPress={() => generateTestLog('info')} />
                </View>
              </View>

              <View style={styles.logButtons}>
                <TouchableOpacity
                  style={[styles.logButton, styles.logButtonDebug]}
                  onPress={() => generateTestLog('debug')}
                >
                  <Text style={styles.logButtonText}>Debug</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.logButton, styles.logButtonInfo]}
                  onPress={() => generateTestLog('info')}
                >
                  <Text style={styles.logButtonText}>Info</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.logButton, styles.logButtonWarn]}
                  onPress={() => generateTestLog('warn')}
                >
                  <Text style={styles.logButtonText}>Warn</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.logButton, styles.logButtonError]}
                  onPress={() => generateTestLog('error')}
                >
                  <Text style={styles.logButtonText}>Error</Text>
                </TouchableOpacity>
              </View>

              {logs.length === 0 ? (
                <Text style={styles.emptyText}>No hay logs registrados</Text>
              ) : (
                logs.map((log, index) => (
                  <View
                    key={index}
                    style={[
                      styles.logItem,
                      log.level === 'error' && styles.logItemError,
                      log.level === 'warn' && styles.logItemWarn,
                      log.level === 'info' && styles.logItemInfo,
                      log.level === 'debug' && styles.logItemDebug
                    ]}
                  >
                    <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                    <View style={styles.logContent}>
                      <Text style={styles.logLevel}>{log.level.toUpperCase()}</Text>
                      <Text style={styles.logCategory}>[{log.category}]</Text>
                      <Text style={styles.logMessage}>{log.message}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      {renderFloatingButton()}
      {renderDebugModal()}

      {/* Componentes adicionales */}
      <ApiConfigDebugger
        visible={showApiConfig}
        onClose={() => setShowApiConfig(false)}
      />

      <NetworkInspector
        visible={showNetworkInspector}
        onClose={() => setShowNetworkInspector(false)}
        filter={networkFilter}
      />
    </>
  );
}

const styles = StyleSheet.create({
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10,
  },
  toolButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  toolButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  filterButton: {
    flex: 1,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  filterButtonBridge: {
    backgroundColor: '#4CAF50',
  },
  filterButtonAuth: {
    backgroundColor: '#FF9800',
  },
  filterButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  debugButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  debugButtonEnabled: {
    backgroundColor: '#4CAF50',
  },
  debugButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  debugButtonText: {
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4CAF50',
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
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    marginBottom: 5,
  },
  levelButtons: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  levelButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#ddd',
    marginHorizontal: 2,
  },
  levelButtonActive: {
    backgroundColor: '#4CAF50',
  },
  levelButtonText: {
    color: 'black',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logActions: {
    flexDirection: 'row',
  },
  logButtons: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  logButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  logButtonDebug: {
    backgroundColor: '#9E9E9E',
  },
  logButtonInfo: {
    backgroundColor: '#2196F3',
  },
  logButtonWarn: {
    backgroundColor: '#FF9800',
  },
  logButtonError: {
    backgroundColor: '#F44336',
  },
  logButtonText: {
    color: 'white',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  logItem: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  logItemDebug: {
    borderLeftWidth: 5,
    borderLeftColor: '#9E9E9E',
  },
  logItemInfo: {
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  logItemWarn: {
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
  },
  logItemError: {
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  logContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  logLevel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  logCategory: {
    marginRight: 5,
  },
  logMessage: {
    flex: 1,
  },
});
