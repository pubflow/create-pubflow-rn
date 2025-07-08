import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { EntityConfig } from '@pubflow/core';
import { SecureStorageAdapter } from '@pubflow/react-native';

interface CustomBridgeListProps<T> {
  entityConfig: EntityConfig;
  renderItem: (props: { item: T; index: number; isSelected: boolean; onSelect: () => void }) => React.ReactNode;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  keyExtractor?: (item: T) => string;
  onItemPress?: (item: T) => void;
  showSearch?: boolean;
  showPagination?: boolean;
  style?: any;
}

/**
 * CustomBridgeList component that uses fetch directly
 */
export default function CustomBridgeList<T extends { id: string }>({
  entityConfig,
  renderItem,
  emptyComponent,
  loadingComponent,
  errorComponent,
  keyExtractor = (item) => item.id,
  onItemPress,
  showSearch = false,
  showPagination = false,
  style
}: CustomBridgeListProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Obtener el token de sesión
  useEffect(() => {
    const getSessionId = async () => {
      const storage = new SecureStorageAdapter();
      const id = await storage.getItem('session_id');
      setSessionId(id);
    };
    getSessionId();
  }, []);

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Construir URL
      const baseUrl = 'https://api.pml.edu.do';
      const endpoint = `${baseUrl}/bridge/${entityConfig.endpoint}/search?page=${page}&limit=${limit}&q=${searchTerm}`;

      console.log('CustomBridgeList - Fetching data from:', endpoint);
      console.log('CustomBridgeList - Session ID:', sessionId);

      // Realizar solicitud HTTP directa
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Session-ID': sessionId || ''
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('CustomBridgeList - Raw response:', JSON.stringify(data, null, 2));

      // Extraer los datos y el meta
      let extractedItems: T[] = [];
      let meta = { page: 1, limit: 10, total: 0, hasMore: false };

      if (data.data?.data?.rows && Array.isArray(data.data.data.rows)) {
        console.log('CustomBridgeList - Found data.data.rows format');
        extractedItems = data.data.data.rows;
        meta = data.data.meta || meta;
      } else if (data.data?.rows && Array.isArray(data.data.rows)) {
        console.log('CustomBridgeList - Found data.rows format');
        extractedItems = data.data.rows;
        meta = data.meta || meta;
      } else if (data.data?.data && Array.isArray(data.data.data)) {
        console.log('CustomBridgeList - Found data.data format');
        extractedItems = data.data.data;
        meta = data.meta || meta;
      } else if (Array.isArray(data.data)) {
        console.log('CustomBridgeList - Found data format');
        extractedItems = data.data;
        meta = data.meta || meta;
      }

      console.log('CustomBridgeList - Extracted items:', extractedItems.length);
      console.log('CustomBridgeList - Meta:', meta);

      setItems(extractedItems);
      setHasMore(meta.hasMore || false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente o cuando cambian los parámetros
  useEffect(() => {
    fetchData();
  }, [entityConfig.endpoint, page, limit, searchTerm]);

  // Refrescar datos
  const refresh = () => {
    setPage(1);
    fetchData();
  };

  // Seleccionar item
  const selectItem = (item: T) => {
    setSelectedItem(item);
  };

  // Añadir logs para depuración
  console.log('CustomBridgeList - items:', items);
  console.log('CustomBridgeList - items length:', items?.length || 0);
  console.log('CustomBridgeList - loading:', loading);
  console.log('CustomBridgeList - error:', error);

  // Verificar que items sea un array
  const validItems = Array.isArray(items) ? items : [];

  // Render loading state
  if (loading && validItems.length === 0 && loadingComponent) {
    console.log('CustomBridgeList - Rendering loading component');
    return <>{loadingComponent}</>;
  }

  // Render error state
  if (error && errorComponent) {
    console.log('CustomBridgeList - Rendering error component:', error);
    return <>{errorComponent}</>;
  }

  // Render empty state
  if (validItems.length === 0 && !loading && emptyComponent) {
    console.log('CustomBridgeList - Rendering empty component (no items)');
    return <>{emptyComponent}</>;
  }

  // Render item
  const renderListItem = ({ item, index }: { item: T; index: number }) => {
    console.log('CustomBridgeList - renderListItem called with item:', item);

    // Verificar que el item sea válido
    if (!item) {
      console.error('CustomBridgeList - Invalid item received:', item);
      return null;
    }

    // Verificar que el item tenga un id
    if (!item.id) {
      console.error('CustomBridgeList - Item without id received:', item);
      return null;
    }

    const isSelected = selectedItem ? keyExtractor(selectedItem) === keyExtractor(item) : false;

    return (
      <TouchableOpacity
        key={keyExtractor(item)}
        onPress={() => {
          selectItem(item);
          if (onItemPress) {
            onItemPress(item);
          }
        }}
      >
        {renderItem({
          item,
          index,
          isSelected,
          onSelect: () => selectItem(item)
        })}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* List */}
      <FlatList
        data={validItems}
        renderItem={renderListItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={['#2196F3']}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#2196F3" />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found</Text>
            </View>
          )
        }
        onEndReached={() => {
          if (hasMore && !loading) {
            setPage(page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && validItems.length > 0 ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color="#2196F3" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  footerLoading: {
    padding: 10,
    alignItems: 'center',
  },
});
