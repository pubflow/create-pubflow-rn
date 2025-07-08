import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Switch } from 'react-native';
import { getDebugConfig, setDebugConfig } from '../../utils/debugConfig';
import { interceptFetch } from '../../utils/networkInterceptor';

interface ApiConfigDebuggerProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Componente para depurar y configurar la API
 */
export default function ApiConfigDebugger({ visible, onClose }: ApiConfigDebuggerProps) {
  const [baseUrls, setBaseUrls] = useState({
    development: '',
    staging: '',
    production: ''
  });
  
  const [defaultHeaders, setDefaultHeaders] = useState<Record<string, string>>({});
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  
  const [timeout, setTimeout] = useState(30000);
  const [interceptEnabled, setInterceptEnabled] = useState(true);
  const [showRequestDetails, setShowRequestDetails] = useState(true);
  const [showResponseDetails, setShowResponseDetails] = useState(true);
  const [maxHistory, setMaxHistory] = useState(100);
  
  // Cargar configuración al abrir
  useEffect(() => {
    if (visible) {
      loadConfig();
    }
  }, [visible]);
  
  // Cargar configuración
  const loadConfig = () => {
    const config = getDebugConfig();
    
    setBaseUrls(config.api.baseUrls);
    setDefaultHeaders(config.api.defaultHeaders);
    setTimeout(config.api.timeout);
    
    setInterceptEnabled(config.network.interceptFetch);
    setShowRequestDetails(config.network.showRequestDetails);
    setShowResponseDetails(config.network.showResponseDetails);
    setMaxHistory(config.network.maxHistory);
  };
  
  // Guardar configuración
  const saveConfig = () => {
    const config = getDebugConfig();
    
    const newConfig = {
      ...config,
      api: {
        ...config.api,
        baseUrls,
        defaultHeaders,
        timeout
      },
      network: {
        ...config.network,
        interceptFetch: interceptEnabled,
        showRequestDetails,
        showResponseDetails,
        maxHistory
      }
    };
    
    setDebugConfig(newConfig);
    
    // Activar interceptor si está habilitado
    if (interceptEnabled) {
      interceptFetch();
    }
    
    onClose();
  };
  
  // Actualizar URL base
  const updateBaseUrl = (env: keyof typeof baseUrls, value: string) => {
    setBaseUrls({
      ...baseUrls,
      [env]: value
    });
  };
  
  // Agregar nuevo header
  const addHeader = () => {
    if (newHeaderKey.trim() === '') return;
    
    setDefaultHeaders({
      ...defaultHeaders,
      [newHeaderKey]: newHeaderValue
    });
    
    setNewHeaderKey('');
    setNewHeaderValue('');
  };
  
  // Eliminar header
  const removeHeader = (key: string) => {
    const newHeaders = { ...defaultHeaders };
    delete newHeaders[key];
    setDefaultHeaders(newHeaders);
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Configuración de API</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>URLs Base</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Desarrollo:</Text>
                <TextInput
                  style={styles.input}
                  value={baseUrls.development}
                  onChangeText={(text) => updateBaseUrl('development', text)}
                  placeholder="URL de desarrollo"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Staging:</Text>
                <TextInput
                  style={styles.input}
                  value={baseUrls.staging}
                  onChangeText={(text) => updateBaseUrl('staging', text)}
                  placeholder="URL de staging"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Producción:</Text>
                <TextInput
                  style={styles.input}
                  value={baseUrls.production}
                  onChangeText={(text) => updateBaseUrl('production', text)}
                  placeholder="URL de producción"
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Headers por Defecto</Text>
              
              {Object.entries(defaultHeaders).map(([key, value]) => (
                <View key={key} style={styles.headerItem}>
                  <View style={styles.headerInfo}>
                    <Text style={styles.headerKey}>{key}:</Text>
                    <Text style={styles.headerValue}>{value}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeHeader(key)}
                  >
                    <Text style={styles.removeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.addHeaderContainer}>
                <View style={styles.headerInputs}>
                  <TextInput
                    style={styles.headerKeyInput}
                    value={newHeaderKey}
                    onChangeText={setNewHeaderKey}
                    placeholder="Nombre"
                  />
                  <TextInput
                    style={styles.headerValueInput}
                    value={newHeaderValue}
                    onChangeText={setNewHeaderValue}
                    placeholder="Valor"
                  />
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addHeader}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Configuración General</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Timeout (ms):</Text>
                <TextInput
                  style={styles.input}
                  value={timeout.toString()}
                  onChangeText={(text) => setTimeout(parseInt(text) || 30000)}
                  keyboardType="numeric"
                  placeholder="Timeout en milisegundos"
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Configuración de Red</Text>
              
              <View style={styles.configItem}>
                <Text>Interceptar Peticiones</Text>
                <Switch
                  value={interceptEnabled}
                  onValueChange={setInterceptEnabled}
                />
              </View>
              
              <View style={styles.configItem}>
                <Text>Mostrar Detalles de Peticiones</Text>
                <Switch
                  value={showRequestDetails}
                  onValueChange={setShowRequestDetails}
                  disabled={!interceptEnabled}
                />
              </View>
              
              <View style={styles.configItem}>
                <Text>Mostrar Detalles de Respuestas</Text>
                <Switch
                  value={showResponseDetails}
                  onValueChange={setShowResponseDetails}
                  disabled={!interceptEnabled}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Historial Máximo:</Text>
                <TextInput
                  style={styles.input}
                  value={maxHistory.toString()}
                  onChangeText={(text) => setMaxHistory(parseInt(text) || 100)}
                  keyboardType="numeric"
                  placeholder="Número máximo de entradas"
                  disabled={!interceptEnabled}
                />
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveConfig}
              >
                <Text style={styles.saveButtonText}>Guardar Configuración</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
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
    backgroundColor: '#2196F3',
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
  },
  headerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 5,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  headerKey: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  headerValue: {
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff5252',
    borderRadius: 12,
    marginLeft: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  headerInputs: {
    flex: 1,
    flexDirection: 'row',
  },
  headerKeyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
    marginRight: 5,
  },
  headerValueInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
  },
  addButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
});
