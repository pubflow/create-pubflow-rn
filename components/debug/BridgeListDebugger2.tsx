import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import { BridgeApiService, EntityConfig, EntityData } from '@pubflow/core';
import { useBridgeApi } from '@pubflow/react-native';

interface BridgeListDebugger2Props {
  entityConfig: EntityConfig;
  visible: boolean;
  onClose: () => void;
}

/**
 * Componente para depurar BridgeList y ver las respuestas directamente
 */
export default function BridgeListDebugger2({ entityConfig, visible, onClose }: BridgeListDebugger2Props) {
  const [isVisible, setIsVisible] = useState(visible);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'parsed'>('raw');

  // Obtener servicio de API
  const service = useBridgeApi<EntityData>(entityConfig);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  // Manejar cierre
  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  // Realizar solicitud directa
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Realizar solicitud de búsqueda
      const result = await service.search({
        page: 1,
        limit: 10,
        q: '',
        useRows: true
      });

      setResponse(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Realizar solicitud directa sin usar el servicio
  const fetchRawData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Construir URL
      const baseUrl = 'https://api.pml.edu.do';
      const endpoint = `${baseUrl}/bridge/${entityConfig.endpoint}/search?page=1&limit=10&q=`;

      // Realizar solicitud HTTP directa
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      console.error('Error fetching raw data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
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

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={fetchData}
            >
              <Text style={styles.buttonText}>Fetch with Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={fetchRawData}
            >
              <Text style={styles.buttonText}>Fetch Raw Data</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'raw' && styles.activeTab]}
              onPress={() => setActiveTab('raw')}
            >
              <Text style={styles.tabText}>Raw Response</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'parsed' && styles.activeTab]}
              onPress={() => setActiveTab('parsed')}
            >
              <Text style={styles.tabText}>Parsed Data</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error:</Text>
                <Text style={styles.errorMessage}>{error.message}</Text>
              </View>
            ) : response ? (
              activeTab === 'raw' ? (
                <View>
                  <Text style={styles.responseTitle}>Raw Response:</Text>
                  <Text style={styles.responseText}>{JSON.stringify(response, null, 2)}</Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.responseTitle}>Parsed Data:</Text>
                  <Text style={styles.label}>Response Structure:</Text>
                  <Text>- Has data property: {response.data !== undefined ? 'Yes' : 'No'}</Text>
                  <Text>- Has meta property: {response.meta !== undefined ? 'Yes' : 'No'}</Text>

                  {response.data !== undefined && (
                    <>
                      <Text style={styles.label}>Data Structure:</Text>
                      <Text>- Type: {typeof response.data}</Text>
                      <Text>- Is Array: {Array.isArray(response.data) ? 'Yes' : 'No'}</Text>
                      {Array.isArray(response.data) ? (
                        <Text>- Array Length: {response.data.length}</Text>
                      ) : (
                        <>
                          <Text>- Has rows: {response.data?.rows !== undefined ? 'Yes' : 'No'}</Text>
                          <Text>- Has data.rows: {response.data?.data?.rows !== undefined ? 'Yes' : 'No'}</Text>
                          <Text>- Has data.data: {response.data?.data !== undefined ? 'Yes' : 'No'}</Text>
                        </>
                      )}
                    </>
                  )}

                  <Text style={styles.label}>Data Items:</Text>
                  {Array.isArray(response.data) ? (
                    response.data.slice(0, 3).map((item, index) => (
                      <View key={index} style={styles.dataItem}>
                        <Text style={styles.dataItemTitle}>Item {index + 1}:</Text>
                        <Text>{JSON.stringify(item, null, 2)}</Text>
                      </View>
                    ))
                  ) : response.data?.rows ? (
                    response.data.rows.slice(0, 3).map((item, index) => (
                      <View key={index} style={styles.dataItem}>
                        <Text style={styles.dataItemTitle}>Item {index + 1} (from rows):</Text>
                        <Text>{JSON.stringify(item, null, 2)}</Text>
                      </View>
                    ))
                  ) : response.data?.data?.rows ? (
                    response.data.data.rows.slice(0, 3).map((item, index) => (
                      <View key={index} style={styles.dataItem}>
                        <Text style={styles.dataItemTitle}>Item {index + 1} (from data.rows):</Text>
                        <Text>{JSON.stringify(item, null, 2)}</Text>
                      </View>
                    ))
                  ) : (
                    <Text>No items found in any expected format</Text>
                  )}

                  <Text style={styles.label}>Meta:</Text>
                  <Text>{JSON.stringify(response.meta, null, 2)}</Text>
                </View>
              )
            ) : (
              <Text style={styles.emptyText}>No data fetched yet. Press one of the buttons above to fetch data.</Text>
            )}
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
  buttonContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
  },
  buttonSecondary: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
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
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 5,
  },
  errorMessage: {
    color: '#d32f2f',
  },
  responseTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  responseText: {
    fontFamily: 'monospace',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#757575',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  dataItem: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 10,
  },
  dataItemTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
