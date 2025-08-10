/**
 * User Data Manager
 * 
 * Utilidades para manejar datos del usuario en AsyncStorage
 * Proporciona funciones para actualizar campos específicos y sincronizar datos
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  id: string;
  name: string;
  last_name: string;
  email: string;
  user_type: string;
  picture?: string;
  user_name?: string;
  phone?: string;
  is_verified: boolean;
  lang?: string;
  metadata?: string;
  first_time: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene los datos del usuario desde AsyncStorage
 */
export async function getUserData(): Promise<UserData | null> {
  try {
    const userDataString = await AsyncStorage.getItem('pubflow_user_data');
    if (!userDataString) {
      return null;
    }
    return JSON.parse(userDataString);
  } catch (error) {
    console.error('❌ Error obteniendo datos del usuario:', error);
    return null;
  }
}

/**
 * Actualiza campos específicos del usuario en AsyncStorage
 */
export async function updateUserDataFields(updatedFields: Partial<UserData>): Promise<boolean> {
  try {
    const currentUserData = await getUserData();
    if (!currentUserData) {
      console.warn('⚠️ No se encontraron datos del usuario para actualizar');
      return false;
    }

    const updatedUserData = {
      ...currentUserData,
      ...updatedFields,
      updated_at: new Date().toISOString(),
    };

    await AsyncStorage.setItem('pubflow_user_data', JSON.stringify(updatedUserData));
    console.log('✅ Datos del usuario actualizados localmente:', updatedFields);
    return true;
  } catch (error) {
    console.error('❌ Error actualizando datos del usuario:', error);
    return false;
  }
}

/**
 * Sincroniza datos del usuario desde el servidor
 */
export async function syncUserDataFromServer(forceRefresh = false): Promise<UserData | null> {
  try {
    const sessionId = await AsyncStorage.getItem('pubflow_session_id');
    if (!sessionId) {
      console.warn('⚠️ No se encontró session_id');
      return null;
    }

    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.pml.edu.do';
    const timestamp = forceRefresh ? `&_t=${Date.now()}` : '';
    const url = `${baseUrl}/auth/user/me?session_id=${sessionId}${timestamp}`;

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
        await AsyncStorage.setItem('pubflow_user_data', JSON.stringify(data.data));
        console.log('✅ Datos del usuario sincronizados desde el servidor');
        return data.data;
      }
    }

    console.error('❌ Error sincronizando datos del servidor');
    return null;
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    return null;
  }
}

/**
 * Limpia todos los datos del usuario
 */
export async function clearUserData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(['pubflow_session_id', 'pubflow_user_data']);
    console.log('🧹 Datos del usuario limpiados');
  } catch (error) {
    console.error('❌ Error limpiando datos del usuario:', error);
  }
}

/**
 * Ejemplo de uso para actualizar el nombre del usuario inmediatamente
 */
export async function updateUserName(name: string, lastName: string): Promise<boolean> {
  return await updateUserDataFields({
    name,
    last_name: lastName,
  });
}

/**
 * Ejemplo de uso para actualizar la foto de perfil inmediatamente
 */
export async function updateUserPicture(pictureUrl: string): Promise<boolean> {
  return await updateUserDataFields({
    picture: pictureUrl,
  });
}

/**
 * Ejemplo de uso para actualizar el email inmediatamente
 */
export async function updateUserEmail(email: string): Promise<boolean> {
  return await updateUserDataFields({
    email: email.toLowerCase(),
  });
}
