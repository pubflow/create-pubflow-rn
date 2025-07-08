import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import {
  useBridgeCrud,
  BridgeList,
  contains,
  equals,
  greaterThan,
  startsWith
} from '@pubflow/react-native';
import { userSchema, createUserSchema, updateUserSchema } from '../../lib/schemas/user';
import { z } from 'zod';
import BridgeListDebugger2 from '../debug/BridgeListDebugger2';

/**
 * Users component for displaying and managing users
 * Uses BridgeList for displaying data with search, pagination and offline support
 */
export default function Users() {
  const [showDebugger, setShowDebugger] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  const {
    items: users,
    loading,
    error,
    isOffline
  } = useBridgeCrud({
    entityConfig: {
      endpoint: 'users'
    },
    schemas: {
      entity: userSchema,
      create: createUserSchema,
      update: updateUserSchema
    },
    successMessages: {
      delete: 'User deleted successfully'
    },
    errorMessages: {
      delete: 'Error deleting user'
    },
    offlineConfig: {
      queueMutations: true,
      showOfflineAlerts: true
    },
    searchConfig: {
      // Añadir configuración para que use el formato correcto de respuesta
      initialPage: 1,
      initialLimit: 10,
      useRows: true
    }
  });

  /**
   * Render individual user item
   */
  const renderUser = ({ item, isSelected }: {
    item: z.infer<typeof userSchema>;
    isSelected: boolean;
  }) => (
    <View style={[styles.userItem, isSelected && styles.selectedItem]}>
      <View>
        <Text style={styles.userName}>{item.name} {item.last_name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userType}>Type: {item.user_type}</Text>
      </View>
    </View>
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error: {error.message}</Text>
      </View>
    );
  }

  // Añadir un componente de depuración para ver los datos
  //console.log('Users data:', users);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <View style={styles.headerButtons}>
          
        
        </View>
      </View>

      <BridgeList
        renderItem={renderUser}
        showSearch={true}
        showPagination={true}
        showAdvancedFilters={showAdvancedFilters}
        advancedFilterFields={[
          {
            name: 'name',
            label: 'Nombre',
            type: 'text',
            operator: contains
          },
          {
            name: 'email',
            label: 'Email',
            type: 'text',
            operator: startsWith
          },
          {
            name: 'user_type',
            label: 'Tipo de usuario',
            type: 'select',
            operator: equals,
            options: [
              { value: 'admin', label: 'Administrador' },
              { value: 'teacher', label: 'Profesor' },
              { value: 'student', label: 'Estudiante' }
            ]
          },
          {
            name: 'age',
            label: 'Edad',
            type: 'number',
            operator: greaterThan
          }
        ]}
        layout={{
          advancedFilterWidth: 35,
          contentWidth: 65
        }}
        colors={{
          primary: '#2196F3',
          secondary: '#f8f9fa',
          background: '#ffffff',
          text: '#333333',
          border: '#dddddd'
        }}
        texts={{
          searchPlaceholder: 'Buscar usuarios...',
          noItemsText: 'No se encontraron usuarios',
          loadingText: 'Cargando...',
          advancedFilter: {
            title: 'Filtros Avanzados',
            addFilter: 'Añadir Filtro',
            resetFilters: 'Limpiar',
            apply: 'Aplicar',
            cancel: 'Cancelar',
            field: 'Campo',
            operator: 'Operador',
            value: 'Valor',
            filterButton: 'Filtrar',
            activeFilters: 'Filtros Activos',
            noActiveFilters: 'No hay filtros activos',
            selectField: 'Selecciona un campo',
            selectOperator: 'Selecciona un operador',
            enterValue: 'Introduce un valor'
          }
        } as any } 
        entityConfig={{
          endpoint: 'users'
        }}
        emptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
        loadingComponent={
          <View style={styles.centered}>
            <ActivityIndicator color="#007AFF" />
          </View>
        }
        errorComponent={
          <View style={styles.centered}>
            <Text style={styles.error}>Error loading users</Text>
          </View>
        } 
      /> 

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  headerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  debugContainer: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  userType: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  error: {
    color: 'red',
    marginBottom: 10,
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