import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { router } from 'expo-router';

/**
 * Función para depurar el contenido de AsyncStorage
 * @param {string} prefix - Prefijo para filtrar las claves (opcional)
 * @returns {Promise<Object>} - Objeto con todas las claves y valores encontrados
 */
export const debugAsyncStorage = async (prefix = '') => {
  try {
    // Obtenemos todas las claves
    const keys = await AsyncStorage.getAllKeys();

    // Filtramos por prefijo si se proporciona
    const filteredKeys = prefix
      ? keys.filter(key => key.startsWith(prefix))
      : keys;

    console.log('AsyncStorage keys:', filteredKeys);

    if (filteredKeys.length === 0) {
      console.log('No se encontraron claves en AsyncStorage' + (prefix ? ` con el prefijo "${prefix}"` : ''));
      return {};
    }

    // Obtenemos los valores para cada clave
    const keyValuePairs = await AsyncStorage.multiGet(filteredKeys);

    // Convertimos a un objeto para facilitar la lectura
    const result = {};
    keyValuePairs.forEach(([key, value]) => {
      try {
        // Intentamos parsear como JSON
        result[key] = JSON.parse(value);
      } catch (e) {
        // Si no es JSON, guardamos como string
        result[key] = value;
      }
    });

    console.log('AsyncStorage contenido:', result);
    return result;
  } catch (error) {
    console.error('Error al depurar AsyncStorage:', error);
    return {};
  }
};

/**
 * Función para limpiar AsyncStorage
 * @param {string} prefix - Prefijo para filtrar las claves a eliminar (opcional)
 * @returns {Promise<void>}
 */
export const clearAsyncStorage = async (prefix = '') => {
  try {
    // Obtenemos todas las claves
    const keys = await AsyncStorage.getAllKeys();

    // Filtramos por prefijo si se proporciona
    const keysToRemove = prefix
      ? keys.filter(key => key.startsWith(prefix))
      : keys;

    if (keysToRemove.length === 0) {
      console.log('No hay claves para eliminar' + (prefix ? ` con el prefijo "${prefix}"` : ''));
      return;
    }

    // Eliminamos las claves
    await AsyncStorage.multiRemove(keysToRemove);
    console.log(`Se eliminaron ${keysToRemove.length} claves de AsyncStorage`);
  } catch (error) {
    console.error('Error al limpiar AsyncStorage:', error);
  }
};

/**
 * Función para reiniciar la sesión y redirigir al login
 * @param {string} prefix - Prefijo para filtrar las claves a eliminar
 * @returns {Promise<void>}
 */
export const resetSession = async (prefix = 'aula_pml_app_v2') => {
  try {
    // Mostrar alerta de confirmación
    Alert.alert(
      "Reiniciar sesión",
      "¿Estás seguro de que deseas reiniciar la sesión? Esto cerrará tu sesión actual.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Reiniciar",
          onPress: async () => {
            // Limpiar el almacenamiento
            await clearAsyncStorage(prefix);
            console.log('Sesión reiniciada correctamente');

            // Redirigir al login
            setTimeout(() => {
              router.replace('/login');
            }, 100);
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error al reiniciar la sesión:', error);
  }
};
