import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, Button } from 'react-native';
import { DebuggableBridgeList } from './withBridgeDebug';
import { configureBridgeDebug } from '../../utils/bridgeDebug';
import { getDebugConfig, enableDebug, setDebugLevel, enableDebugCategory } from '../../utils/debugConfig';

/**
 * Ejemplo de uso de las herramientas de depuración de BridgeList
 */
export default function BridgeDebugExample() {
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [apiLogsEnabled, setApiLogsEnabled] = useState(true);
  const [requestLogsEnabled, setRequestLogsEnabled] = useState(true);
  const [responseLogsEnabled, setResponseLogsEnabled] = useState(true);
  const [errorLogsEnabled, setErrorLogsEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar configuración actual al iniciar
  useEffect(() => {
    const config = getDebugConfig();
    setDebugEnabled(config.enabled);
    setApiLogsEnabled(config.categories.api);
    setRequestLogsEnabled(config.categories.request);
    setResponseLogsEnabled(config.categories.response);
    setErrorLogsEnabled(config.categories.error);
  }, []);

  // Configurar opciones de depuración
  const updateDebugConfig = () => {
    // Actualizar configuración global
    enableDebug(debugEnabled);
    setDebugLevel('debug'); // Usar nivel más detallado

    // Actualizar categorías
    enableDebugCategory('api', apiLogsEnabled);
    enableDebugCategory('request', requestLogsEnabled);
    enableDebugCategory('response', responseLogsEnabled);
    enableDebugCategory('error', errorLogsEnabled);

    // Actualizar configuración de BridgeList
    configureBridgeDebug({
      enabled: debugEnabled,
      categories: {
        api: apiLogsEnabled,
        request: requestLogsEnabled,
        response: responseLogsEnabled,
        error: errorLogsEnabled
      }
    });
  };

  // Renderizar un elemento de usuario
  const renderUser = ({ item, isSelected }: { item: any, isSelected: boolean }) => (
    <View style={[styles.userItem, isSelected && styles.selectedItem]}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BridgeList Debug Demo</Text>

      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Configuración de Depuración</Text>

        <View style={styles.configItem}>
          <Text>Habilitar Depuración</Text>
          <Switch
            value={debugEnabled}
            onValueChange={(value) => {
              setDebugEnabled(value);
              configureBridgeDebug({ enabled: value });
            }}
          />
        </View>

        <View style={styles.configItem}>
          <Text>Logs de API</Text>
          <Switch
            value={apiLogsEnabled}
            onValueChange={setApiLogsEnabled}
            disabled={!debugEnabled}
          />
        </View>

        <View style={styles.configItem}>
          <Text>Logs de Solicitudes</Text>
          <Switch
            value={requestLogsEnabled}
            onValueChange={setRequestLogsEnabled}
            disabled={!debugEnabled}
          />
        </View>

        <View style={styles.configItem}>
          <Text>Logs de Respuestas</Text>
          <Switch
            value={responseLogsEnabled}
            onValueChange={setResponseLogsEnabled}
            disabled={!debugEnabled}
          />
        </View>

        <View style={styles.configItem}>
          <Text>Logs de Errores</Text>
          <Switch
            value={errorLogsEnabled}
            onValueChange={setErrorLogsEnabled}
            disabled={!debugEnabled}
          />
        </View>

        <Button
          title="Aplicar Configuración"
          onPress={updateDebugConfig}
          disabled={!debugEnabled}
        />
      </View>

      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Búsqueda</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Lista de Usuarios</Text>

        <DebuggableBridgeList
          entityConfig={{
            endpoint: 'users'
          }}
          renderItem={renderUser}
          showSearch={true}
          showPagination={true}
          searchTerm={searchTerm}
          keyExtractor={(item: any) => item.id}
          emptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No se encontraron usuarios</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  configSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  listSection: {
    flex: 1,
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});
