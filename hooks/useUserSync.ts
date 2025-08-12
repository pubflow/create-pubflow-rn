/**
 * useUserSync Hook
 * 
 * Hook para sincronizar datos del usuario entre el servidor y AsyncStorage
 * Actualiza automáticamente pubflow_user_data después de cambios en el perfil
 */

import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@pubflow/react-native';

interface UserSyncResult {
  syncUserData: (forceRefresh?: boolean) => Promise<boolean>;
  updateLocalUserData: (updatedFields: Partial<any>) => Promise<boolean>;
  updateUserPicture: (newPictureUrl: string) => Promise<boolean>;
}

export function useUserSync(): UserSyncResult {
  const { refreshUser } = useAuth();

  /**
   * Sincroniza los datos del usuario desde el servidor y actualiza AsyncStorage
   */
  const syncUserData = useCallback(async (forceRefresh = false): Promise<boolean> => {
    try {
      console.log('🔄 useUserSync: Iniciando sincronización de datos del usuario...');
      
      const sessionId = await AsyncStorage.getItem('pubflow_session_id');
      if (!sessionId) {
        console.warn('⚠️ useUserSync: No se encontró session_id');
        return false;
      }

      // Obtener la URL base del entorno
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.pml.edu.do';
      const url = `${baseUrl}/auth/user/me?session_id=${sessionId}`;

      console.log('📡 useUserSync: Obteniendo datos frescos del servidor...');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
          ...(forceRefresh && { 'Cache-Control': 'no-cache' }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log('✅ useUserSync: Datos obtenidos del servidor:', data.data);
          
          // Actualizar pubflow_user_data en AsyncStorage
          await AsyncStorage.setItem('pubflow_user_data', JSON.stringify(data.data));
          console.log('💾 useUserSync: pubflow_user_data actualizado en AsyncStorage');
          
          // Refrescar el contexto de autenticación de Pubflow
          if (refreshUser) {
            await refreshUser();
            console.log('🔄 useUserSync: Contexto de autenticación actualizado');
          }
          
          return true;
        } else {
          console.error('❌ useUserSync: Respuesta del servidor inválida:', data);
          return false;
        }
      } else {
        console.error('❌ useUserSync: Error en la respuesta del servidor:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ useUserSync: Error durante la sincronización:', error);
      return false;
    }
  }, [refreshUser]);

  /**
   * Actualiza campos específicos del usuario en AsyncStorage sin hacer llamada al servidor
   * Útil para actualizaciones inmediatas de la UI
   */
  const updateLocalUserData = useCallback(async (updatedFields: Partial<any>): Promise<boolean> => {
    try {
      console.log('🔄 useUserSync: Actualizando datos locales del usuario...', updatedFields);
      
      // Obtener datos actuales del usuario
      const currentUserDataString = await AsyncStorage.getItem('pubflow_user_data');
      if (!currentUserDataString) {
        console.warn('⚠️ useUserSync: No se encontraron datos del usuario en AsyncStorage');
        return false;
      }

      const currentUserData = JSON.parse(currentUserDataString);
      
      // Combinar datos actuales con los campos actualizados
      const updatedUserData = {
        ...currentUserData,
        ...updatedFields,
        updated_at: new Date().toISOString(), // Actualizar timestamp
      };

      // Guardar datos actualizados en AsyncStorage
      await AsyncStorage.setItem('pubflow_user_data', JSON.stringify(updatedUserData));
      console.log('💾 useUserSync: Datos locales actualizados en AsyncStorage');
      
      // Refrescar el contexto de autenticación de Pubflow
      if (refreshUser) {
        await refreshUser();
        console.log('🔄 useUserSync: Contexto de autenticación actualizado');
      }
      
      return true;
    } catch (error) {
      console.error('❌ useUserSync: Error actualizando datos locales:', error);
      return false;
    }
  }, [refreshUser]);

  /**
   * Actualiza específicamente la imagen de perfil del usuario en AsyncStorage
   * Optimizado para subidas de imagen exitosas
   */
  const updateUserPicture = useCallback(async (newPictureUrl: string): Promise<boolean> => {
    try {
      console.log('🖼️ useUserSync: Actualizando imagen de perfil localmente...', newPictureUrl);

      // Obtener datos actuales del usuario
      const currentUserDataString = await AsyncStorage.getItem('pubflow_user_data');
      if (!currentUserDataString) {
        console.warn('⚠️ useUserSync: No se encontraron datos del usuario en AsyncStorage');
        return false;
      }

      const currentUserData = JSON.parse(currentUserDataString);

      // Actualizar solo el campo picture con la nueva URL
      const updatedUserData = {
        ...currentUserData,
        picture: newPictureUrl,
        updated_at: new Date().toISOString(), // Actualizar timestamp
      };

      // Guardar datos actualizados en AsyncStorage
      await AsyncStorage.setItem('pubflow_user_data', JSON.stringify(updatedUserData));
      console.log('✅ useUserSync: Imagen de perfil actualizada en AsyncStorage');

      // Refrescar el contexto de autenticación de Pubflow
      if (refreshUser) {
        await refreshUser();
        console.log('🔄 useUserSync: Contexto de autenticación actualizado con nueva imagen');
      }

      return true;
    } catch (error) {
      console.error('❌ useUserSync: Error actualizando imagen de perfil:', error);
      return false;
    }
  }, [refreshUser]);

  return {
    syncUserData,
    updateLocalUserData,
    updateUserPicture,
  };
}
