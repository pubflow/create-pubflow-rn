import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { 
  getNetworkHistory, 
  clearNetworkHistory, 
  subscribeToNetworkEvents,
  RequestInfo,
  ResponseInfo,
  ErrorInfo
} from '../../utils/networkInterceptor';

interface NetworkInspectorProps {
  visible: boolean;
  onClose: () => void;
  filter?: 'all' | 'bridge' | 'auth' | 'other';
}

/**
 * Componente para inspeccionar peticiones de red
 */
export default function NetworkInspector({ visible, onClose, filter = 'all' }: NetworkInspectorProps) {
  const [requests, setRequests] = useState<RequestInfo[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'request' | 'response' | 'error'>('request');
  
  // Cargar historial al abrir
  useEffect(() => {
    if (visible) {
      loadNetworkHistory();
    }
  }, [visible, filter]);
  
  // Suscribirse a eventos de red
  useEffect(() => {
    const unsubscribeRequest = subscribeToNetworkEvents('request', () => {
      loadNetworkHistory();
    });
    
    const unsubscribeResponse = subscribeToNetworkEvents('response', () => {
      loadNetworkHistory();
    });
    
    const unsubscribeError = subscribeToNetworkEvents('error', () => {
      loadNetworkHistory();
    });
    
    return () => {
      unsubscribeRequest();
      unsubscribeResponse();
      unsubscribeError();
    };
  }, [filter]);
  
  // Cargar historial de red
  const loadNetworkHistory = () => {
    const history = getNetworkHistory();
    
    // Convertir a array y filtrar
    let requestsArray = Object.values(history.requests);
    
    if (filter !== 'all') {
      requestsArray = requestsArray.filter(req => req.source === filter);
    }
    
    // Ordenar por timestamp (más reciente primero)
    requestsArray.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    setRequests(requestsArray);
  };
  
  // Limpiar historial
  const handleClearHistory = () => {
    clearNetworkHistory();
    loadNetworkHistory();
    setSelectedRequest(null);
  };
  
  // Renderizar detalles de la petición
  const renderRequestDetails = () => {
    if (!selectedRequest) return null;
    
    const history = getNetworkHistory();
    const request = history.requests[selectedRequest];
    
    if (!request) return null;
    
    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>Detalles de la Petición</Text>
        
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>URL:</Text>
          <Text style={styles.detailsValue}>{request.url}</Text>
        </View>
        
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Método:</Text>
          <Text style={styles.detailsValue}>{request.method}</Text>
        </View>
        
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Timestamp:</Text>
          <Text style={styles.detailsValue}>{new Date(request.timestamp).toLocaleString()}</Text>
        </View>
        
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Fuente:</Text>
          <Text style={styles.detailsValue}>{request.source}</Text>
        </View>
        
        {request.endpoint && (
          <View style={styles.detailsItem}>
            <Text style={styles.detailsLabel}>Endpoint:</Text>
            <Text style={styles.detailsValue}>{request.endpoint}</Text>
          </View>
        )}
        
        <Text style={styles.detailsSubtitle}>Headers:</Text>
        {Object.entries(request.headers).length > 0 ? (
          Object.entries(request.headers).map(([key, value]) => (
            <View key={key} style={styles.detailsItem}>
              <Text style={styles.detailsLabel}>{key}:</Text>
              <Text style={styles.detailsValue}>{value}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay headers</Text>
        )}
        
        <Text style={styles.detailsSubtitle}>Body:</Text>
        {request.body ? (
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {typeof request.body === 'string' 
                ? request.body 
                : JSON.stringify(request.body, null, 2)}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No hay body</Text>
        )}
      </View>
    );
  };
  
  // Renderizar detalles de la respuesta
  const renderResponseDetails = () => {
    if (!selectedRequest) return null;
    
    const history = getNetworkHistory();
    const response = history.responses[selectedRequest];
    
    if (!response) {
      return (
        <View style={styles.detailsContainer}>
          <Text style={styles.emptyText}>No hay respuesta disponible</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>Detalles de la Respuesta</Text>
        
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Status:</Text>
          <Text style={[
            styles.detailsValue,
            response.status >= 400 ? styles.errorText : styles.successText
          ]}>
            {response.status} {response.statusText}
          </Text>
        </View>
        
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Timestamp:</Text>
          <Text style={styles.detailsValue}>{new Date(response.timestamp).toLocaleString()}</Text>
        </View>
        
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Duración:</Text>
          <Text style={styles.detailsValue}>{response.duration}ms</Text>
        </View>
        
        <Text style={styles.detailsSubtitle}>Headers:</Text>
        {Object.entries(response.headers).length > 0 ? (
          Object.entries(response.headers).map(([key, value]) => (
            <View key={key} style={styles.detailsItem}>
              <Text style={styles.detailsLabel}>{key}:</Text>
              <Text style={styles.detailsValue}>{value}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay headers</Text>
        )}
        
        <Text style={styles.detailsSubtitle}>Data:</Text>
        {response.data ? (
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {typeof response.data === 'string' 
                ? response.data 
                : JSON.stringify(response.data, null, 2)}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No hay datos</Text>
        )}
      </View>
    );
  };
  
  // Renderizar detalles del error
  const renderErrorDetails = () => {
    if (!selectedRequest) return null;
    
    const history = getNetworkHistory();
    const error = history.errors[selectedRequest];
    
    if (!error) {
      return (
        <View style={styles.detailsContainer}>
          <Text style={styles.emptyText}>No hay error disponible</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>Detalles del Error</Text>
        
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Mensaje:</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
        
        {error.code && (
          <View style={styles.detailsItem}>
            <Text style={styles.detailsLabel}>Código:</Text>
            <Text style={styles.detailsValue}>{error.code}</Text>
          </View>
        )}
        
        <View style={styles.detailsItem}>
          <Text style={styles.detailsLabel}>Timestamp:</Text>
          <Text style={styles.detailsValue}>{new Date(error.timestamp).toLocaleString()}</Text>
        </View>
        
        {error.stack && (
          <>
            <Text style={styles.detailsSubtitle}>Stack:</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{error.stack}</Text>
            </View>
          </>
        )}
      </View>
    );
  };
  
  // Renderizar elemento de la lista
  const renderItem = ({ item }: { item: RequestInfo }) => {
    const history = getNetworkHistory();
    const response = history.responses[item.id];
    const error = history.errors[item.id];
    
    let statusIndicator;
    
    if (error) {
      statusIndicator = <View style={[styles.statusIndicator, styles.errorIndicator]} />;
    } else if (response) {
      statusIndicator = <View style={[
        styles.statusIndicator,
        response.status >= 400 ? styles.errorIndicator : styles.successIndicator
      ]} />;
    } else {
      statusIndicator = <View style={[styles.statusIndicator, styles.pendingIndicator]} />;
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.requestItem,
          selectedRequest === item.id && styles.selectedItem
        ]}
        onPress={() => setSelectedRequest(item.id)}
      >
        {statusIndicator}
        
        <View style={styles.requestInfo}>
          <Text style={styles.requestMethod}>{item.method}</Text>
          <Text style={styles.requestEndpoint}>
            {item.endpoint || item.url.split('/').pop() || 'unknown'}
          </Text>
          <Text style={styles.requestTime}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        
        <View style={styles.requestStatus}>
          {response && (
            <Text style={[
              styles.statusText,
              response.status >= 400 ? styles.errorText : styles.successText
            ]}>
              {response.status}
            </Text>
          )}
          {error && (
            <Text style={styles.errorText}>Error</Text>
          )}
          {!response && !error && (
            <Text style={styles.pendingText}>Pendiente</Text>
          )}
        </View>
      </TouchableOpacity>
    );
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
            <Text style={styles.title}>Inspector de Red</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.toolbar}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleClearHistory}
            >
              <Text style={styles.toolbarButtonText}>Limpiar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={loadNetworkHistory}
            >
              <Text style={styles.toolbarButtonText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <View style={styles.requestsList}>
              <FlatList
                data={requests}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
              />
            </View>
            
            {selectedRequest && (
              <View style={styles.detailsPanel}>
                <View style={styles.tabs}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'request' && styles.activeTab]}
                    onPress={() => setActiveTab('request')}
                  >
                    <Text style={styles.tabText}>Petición</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'response' && styles.activeTab]}
                    onPress={() => setActiveTab('response')}
                  >
                    <Text style={styles.tabText}>Respuesta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'error' && styles.activeTab]}
                    onPress={() => setActiveTab('error')}
                  >
                    <Text style={styles.tabText}>Error</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.detailsScroll}>
                  {activeTab === 'request' && renderRequestDetails()}
                  {activeTab === 'response' && renderResponseDetails()}
                  {activeTab === 'error' && renderErrorDetails()}
                </ScrollView>
              </View>
            )}
          </View>
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
    width: '95%',
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
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  toolbarButton: {
    marginRight: 10,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  toolbarButtonText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  requestsList: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  listContent: {
    paddingVertical: 5,
  },
  requestItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  pendingIndicator: {
    backgroundColor: '#9E9E9E',
  },
  successIndicator: {
    backgroundColor: '#4CAF50',
  },
  errorIndicator: {
    backgroundColor: '#F44336',
  },
  requestInfo: {
    flex: 1,
  },
  requestMethod: {
    fontWeight: 'bold',
  },
  requestEndpoint: {
    fontSize: 14,
  },
  requestTime: {
    fontSize: 12,
    color: '#666',
  },
  requestStatus: {
    marginLeft: 10,
  },
  statusText: {
    fontWeight: 'bold',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  pendingText: {
    color: '#9E9E9E',
  },
  detailsPanel: {
    flex: 2,
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
    fontSize: 14,
  },
  detailsScroll: {
    flex: 1,
  },
  detailsContainer: {
    padding: 15,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  detailsItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailsLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    minWidth: 80,
  },
  detailsValue: {
    flex: 1,
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
  },
});
