import { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSystem, ColorUtils } from '@/utils/colorSystem';

interface ImageUploadComponentProps {
  currentImageUrl?: string | null;
  onImageUploaded: () => void;
}

export default function ImageUploadComponent({ currentImageUrl, onImageUploaded }: ImageUploadComponentProps) {
  const [uploading, setUploading] = useState(false);

  // Debug log for currentImageUrl
  console.log('🖼️ ImageUploadComponent - currentImageUrl:', currentImageUrl);

  // Request permissions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos Requeridos',
          'Se necesitan permisos para acceder a la galería de fotos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos Requeridos',
          'Se necesitan permisos para acceder a la cámara.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  // Validate image size and type
  const validateImage = (imageAsset: ImagePicker.ImagePickerAsset): boolean => {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (imageAsset.fileSize && imageAsset.fileSize > maxSize) {
      Alert.alert('Error', 'La imagen es demasiado grande. El tamaño máximo es 10MB.');
      return false;
    }

    // Check image type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image'];
    let imageType = imageAsset.type || 'image/jpeg';

    console.log('Image validation - Type:', imageType, 'Allowed:', allowedTypes);

    // Manejar casos especiales de MIME types
    if (imageType === 'image') {
      console.log('⚠️ Generic "image" type detected, will determine specific type from filename');
      return true; // Permitir y corregir en prepareFormData
    }

    // Si no hay tipo después del recorte, asumir JPEG
    if (!imageType) {
      console.log('⚠️ No MIME type detected after cropping, assuming image/jpeg');
      return true; // Permitir y corregir en prepareFormData
    }

    if (!allowedTypes.includes(imageType)) {
      Alert.alert('Error', `Formato de imagen no válido: ${imageType}. Solo se permiten JPG, PNG, GIF y WebP.`);
      return false;
    }

    return true;
  };

  // Upload image to server
  const uploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    // Validate image before upload
    if (!validateImage(imageAsset)) {
      return;
    }

    setUploading(true);

    let uploadUrl = '';

    try {
      // Try both session keys for compatibility
      let sessionId = await AsyncStorage.getItem('pubflow_session_id');
      if (!sessionId) {
        sessionId = await AsyncStorage.getItem('sessionId');
      }

      if (!sessionId) {
        Alert.alert('Error', 'No se encontró la sesión de usuario');
        return;
      }

      console.log('🔍 Upload attempt with session_id:', sessionId.substring(0, 10) + '...');

      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.pml.edu.do';

      if (!baseUrl) {
        Alert.alert('Error', 'URL de API no configurada');
        return;
      }

      // Determine file extension and MIME type
      let fileExtension = 'jpg'; // Default
      let originalFileName = imageAsset.fileName;

      // Si no hay fileName, intentar extraer de la URI
      if (!originalFileName && imageAsset.uri) {
        const uriParts = imageAsset.uri.split('/');
        originalFileName = uriParts[uriParts.length - 1];
      }

      // Extraer extensión del fileName si existe
      if (originalFileName && originalFileName.includes('.')) {
        const extractedExt = originalFileName.split('.').pop()?.toLowerCase();
        if (extractedExt) {
          fileExtension = extractedExt;
        }
      }

      // Determinar MIME type - priorizar el tipo del asset si existe y es específico
      let mimeType = imageAsset.type || 'image/jpeg';

      // Si no hay tipo o es genérico (común después del recorte), usar extensión
      if (!imageAsset.type || imageAsset.type === 'image') {
        console.log('⚠️ No specific MIME type from ImagePicker, determining from extension');
        if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
          mimeType = 'image/jpeg';
        } else if (fileExtension === 'png') {
          mimeType = 'image/png';
        } else if (fileExtension === 'gif') {
          mimeType = 'image/gif';
        } else if (fileExtension === 'webp') {
          mimeType = 'image/webp';
        } else {
          // Si no podemos determinar, asumir JPEG (más común)
          mimeType = 'image/jpeg';
          fileExtension = 'jpg';
        }
      }

      const fileName = originalFileName || `profile_${Date.now()}.${fileExtension}`;

      console.log('📋 Upload details:', {
        uri: imageAsset.uri,
        type: mimeType,
        name: fileName,
        originalType: imageAsset.type,
        fileSize: imageAsset.fileSize,
        detectedExtension: fileExtension
      });

      // Create FormData - simplified for React Native
      const formData = new FormData();

      // Add the image file with proper React Native format
      formData.append('picture', {
        uri: imageAsset.uri,
        type: mimeType,
        name: fileName,
      } as any);

      uploadUrl = `${baseUrl}/auth/upload/picture?session_id=${sessionId}`;
      console.log('📡 Making upload request to:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId,
          // Don't set Content-Type for FormData, let React Native set it with boundary
        },
        body: formData,
      });

      console.log('📡 Upload response status:', response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          Alert.alert('Éxito', 'Imagen subida correctamente');
          onImageUploaded();
        } else {
          throw new Error(responseData.error || 'Error al subir la imagen');
        }
      } else {
        const errorText = await response.text();
        console.error('Upload error:', errorText);

        // Try to parse error response
        let errorMessage = `Error ${response.status}: No se pudo subir la imagen`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Use default error message
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);

      let errorMessage = 'No se pudo subir la imagen';

      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet y que la URL del servidor sea correcta.';
          console.error('❌ Network error - check connection and server URL');
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Error de red. Verifica la conexión al servidor.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Error de Upload', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Show image selection options
  const showImageOptions = () => {
    Alert.alert(
      'Cambiar Foto de Perfil',
      'Selecciona una opción',
      [
        {
          text: 'Cámara',
          onPress: takePhoto,
        },
        {
          text: 'Galería',
          onPress: pickImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foto de Perfil</Text>
      <Text style={styles.subtitle}>
        Tu foto de perfil será visible en tu cuenta
      </Text>
      
      <View style={styles.photoSection}>
        <View style={styles.currentPhotoContainer}>
          {currentImageUrl && currentImageUrl.trim() !== '' ? (
            <Image
              source={{ uri: currentImageUrl }}
              style={styles.currentPhoto}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', currentImageUrl);
              }}
              onError={(error) => {
                console.error('❌ Image load error:', error.nativeEvent.error);
                console.error('❌ Failed URL:', currentImageUrl);
              }}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={60} color={ColorSystem.text.secondary} />
              <Text style={styles.placeholderText}>Sin foto</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={showImageOptions}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={ColorSystem.text.inverse} />
          ) : (
            <>
              <Ionicons name="camera" size={20} color={ColorSystem.text.inverse} />
              <Text style={styles.uploadButtonText}>Cambiar Foto</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.photoRequirements}>
          Formatos permitidos: JPG, JPEG, PNG, GIF, WebP (Máx. 10MB)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ColorSystem.primary.DEFAULT,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: ColorSystem.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  photoSection: {
    alignItems: 'center',
  },
  currentPhotoContainer: {
    marginBottom: 24,
  },
  currentPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: ColorSystem.primary.light,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ColorSystem.surface.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: ColorSystem.primary.light,
  },
  placeholderText: {
    fontSize: 12,
    color: ColorSystem.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorSystem.primary.DEFAULT,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: ColorSystem.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 150,
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ColorSystem.text.inverse,
    marginLeft: 8,
  },
  photoRequirements: {
    fontSize: 12,
    color: ColorSystem.text.tertiary,
    textAlign: 'center',
  },
});
