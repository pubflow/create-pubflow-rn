import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@pubflow/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageUploadComponent from './ImageUploadComponent';
import { ColorSystem, ColorUtils, COLORS } from '@/utils/colorSystem';
import { useUserSync } from '@/hooks/useUserSync';

// Form data interface for updates
interface UpdateUserData {
  name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  user_name?: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export default function EditProfileModal({ visible, onClose, onProfileUpdated }: EditProfileModalProps) {
  const { user } = useAuth();
  const { syncUserData } = useUserSync();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'photo' | 'password'>('personal');

  // Form data state
  const [formData, setFormData] = useState<UpdateUserData>({});

  // Fresh user data from API
  const [freshUserData, setFreshUserData] = useState<any>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch fresh user data from API
  const fetchFreshUserData = async (forceRefresh = false) => {
    try {
      const sessionId = await AsyncStorage.getItem('pubflow_session_id');
      if (!sessionId) return null;

      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.pml.edu.do';

      // Add timestamp to force fresh data when manually refreshing
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
          // Store fresh user data for accurate picture URL
          setFreshUserData(data.data);
          return data.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching fresh user data:', error);
      return null;
    }
  };

  // Initialize form data with user data
  const initializeFormData = (userData: any) => {
    if (!userData) return;

    // Initialize form data
    setFormData({
      name: userData.name || '',
      last_name: userData.last_name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      user_name: userData.user_name || '',
    });
  };

  // Ref para evitar múltiples inicializaciones
  const isInitializedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Effect para manejar apertura/cierre del modal
  useEffect(() => {
    if (visible && user) {
      // Solo inicializar si es la primera vez o si cambió el usuario
      const shouldInitialize = !isInitializedRef.current || lastUserIdRef.current !== user.id;

      if (shouldInitialize) {
        // Marcar como inicializado para evitar múltiples llamadas
        isInitializedRef.current = true;
        lastUserIdRef.current = user.id;

        // Fetch fresh data from API and ONLY use that data
        setRefreshing(true);
        fetchFreshUserData().then(freshData => {
          if (freshData) {
            initializeFormData(freshData);
          } else {
            // Fallback to context data only if API fails
            initializeFormData(user);
          }
          setRefreshing(false);
        });
      }
    } else if (!visible) {
      // Reset form when modal closes
      isInitializedRef.current = false;
      lastUserIdRef.current = null;
      setFormData({});
      setFreshUserData(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('personal');
      setRefreshing(false);
    }
  }, [visible, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update user data via backend
  const updateUserData = async (updateData: UpdateUserData) => {
    const sessionId = await AsyncStorage.getItem('pubflow_session_id');
    if (!sessionId) {
      Alert.alert('Error', 'No se encontró la sesión de usuario');
      return false;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.pml.edu.do';

      const response = await fetch(`${baseUrl}/auth/user/me?session_id=${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data) {
          Alert.alert('Éxito', 'Perfil actualizado correctamente');

          // Sincronizar datos del usuario con AsyncStorage
          setRefreshing(true);
          const syncSuccess = await syncUserData(true);

          if (syncSuccess) {
            console.log('✅ EditProfileModal: Datos del usuario sincronizados correctamente');
            // Actualizar datos frescos para el formulario
            const freshData = await fetchFreshUserData(true);
            if (freshData) {
              initializeFormData(freshData);
            }
          } else {
            console.warn('⚠️ EditProfileModal: Error sincronizando datos del usuario');
            // Fallback: usar el método anterior
            const freshData = await fetchFreshUserData(true);
            if (freshData) {
              initializeFormData(freshData);
            }
          }

          setRefreshing(false);
          onProfileUpdated();
          return true;
        } else {
          throw new Error(data.error || 'Respuesta inválida del servidor');
        }
      } else {
        const errorText = await response.text();

        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // Could not parse error response as JSON
        }

        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Save personal information
  const savePersonalInfo = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!formData.email?.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    // Create a clean update object with only the fields that have values
    const updatePayload: any = {};

    if (formData.name?.trim()) updatePayload.name = formData.name.trim();
    if (formData.last_name?.trim()) updatePayload.last_name = formData.last_name.trim();
    if (formData.email?.trim()) updatePayload.email = formData.email.trim().toLowerCase();
    if (formData.phone?.trim()) updatePayload.phone = formData.phone.trim();
    if (formData.user_name?.trim()) updatePayload.user_name = formData.user_name.trim();

    await updateUserData(updatePayload);
  };

  // Change password
  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const sessionId = await AsyncStorage.getItem('pubflow_session_id');
      if (!sessionId) {
        Alert.alert('Error', 'No se encontró la sesión de usuario');
        return;
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.pml.edu.do';
      
      const response = await fetch(`${baseUrl}/auth/password-change/self`, {
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Contraseña actualizada correctamente');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'No se pudo cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (refreshing || loading) return; // Prevent multiple refreshes

    setRefreshing(true);
    const freshData = await fetchFreshUserData(true);

    if (freshData) {
      initializeFormData(freshData);
      Alert.alert('Éxito', 'Datos actualizados correctamente');
    } else {
      Alert.alert('Error', 'No se pudieron actualizar los datos');
    }

    setRefreshing(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={ColorSystem.primary.DEFAULT} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            {refreshing && (
              <View style={styles.refreshIndicator}>
                <ActivityIndicator size="small" color={ColorSystem.primary.light} />
                <Text style={styles.refreshText}>Updating...</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleManualRefresh}
            disabled={refreshing || loading}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={refreshing || loading ? ColorSystem.text.tertiary : ColorSystem.primary.light}
            />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
            onPress={() => setActiveTab('personal')}
          >
            <Ionicons
              name="person"
              size={18}
              color={activeTab === 'personal' ? ColorSystem.primary.DEFAULT : ColorSystem.text.secondary}
            />
            <Text style={[
              styles.tabText,
              activeTab === 'personal' && styles.activeTabText
            ]}>
              Personal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'photo' && styles.activeTab]}
            onPress={() => setActiveTab('photo')}
          >
            <Ionicons
              name="camera"
              size={18}
              color={activeTab === 'photo' ? ColorSystem.primary.DEFAULT : ColorSystem.text.secondary}
            />
            <Text style={[
              styles.tabText,
              activeTab === 'photo' && styles.activeTabText
            ]}>
              Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'password' && styles.activeTab]}
            onPress={() => setActiveTab('password')}
          >
            <Ionicons
              name="lock-closed"
              size={18}
              color={activeTab === 'password' ? ColorSystem.primary.DEFAULT : ColorSystem.text.secondary}
            />
            <Text style={[
              styles.tabText,
              activeTab === 'password' && styles.activeTabText
            ]}>
              Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'personal' && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>Personal Information</Text>
              <Text style={styles.tabSubtitle}>Manage your profile information</Text>

              {/* Nombre y Apellido en la misma línea */}
              <View style={styles.rowContainer}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name || ''}
                    onChangeText={(text) => handleInputChange('name', text)}
                    placeholder="First Name"
                    placeholderTextColor={ColorSystem.text.tertiary}
                  />
                </View>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.last_name || ''}
                    onChangeText={(text) => handleInputChange('last_name', text)}
                    placeholder="Last Name"
                    placeholderTextColor={ColorSystem.text.tertiary}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email || ''}
                  onChangeText={(text) => handleInputChange('email', text.toLowerCase())}
                  placeholder="email@example.com"
                  placeholderTextColor={ColorSystem.text.tertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={formData.user_name || ''}
                  onChangeText={(text) => handleInputChange('user_name', text)}
                  placeholder="Username"
                  placeholderTextColor={ColorSystem.text.tertiary}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone || ''}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  placeholder="Phone number"
                  placeholderTextColor={ColorSystem.text.tertiary}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={savePersonalInfo}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Information</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'photo' && (
            <View style={styles.tabContent}>
              <ImageUploadComponent
                currentImageUrl={freshUserData?.picture || user?.picture}
                onImageUploaded={async () => {
                  // Sincronizar datos del usuario después de subir imagen
                  setRefreshing(true);

                  const syncSuccess = await syncUserData(true);

                  if (syncSuccess) {
                    console.log('✅ EditProfileModal: Imagen actualizada y datos sincronizados');
                    // Actualizar datos frescos para el formulario
                    const freshData = await fetchFreshUserData(true);
                    if (freshData) {
                      initializeFormData(freshData);
                    }
                  } else {
                    console.warn('⚠️ EditProfileModal: Error sincronizando después de subir imagen');
                    // Fallback: usar el método anterior
                    const freshData = await fetchFreshUserData(true);
                    if (freshData) {
                      initializeFormData(freshData);
                    }
                  }

                  setRefreshing(false);
                  onProfileUpdated();
                }}
              />
            </View>
          )}

          {activeTab === 'password' && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>Change Password</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter your current password"
                    placeholderTextColor={ColorSystem.text.tertiary}
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={ColorSystem.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={ColorSystem.text.tertiary}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={ColorSystem.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={ColorSystem.text.tertiary}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={ColorSystem.text.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={changePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={ColorSystem.text.inverse} />
                ) : (
                  <Text style={styles.saveButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorSystem.surface.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: ColorSystem.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: ColorSystem.border.primary,
    shadowColor: ColorSystem.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: ColorUtils.withOpacity(ColorSystem.primary.DEFAULT, 0.1),
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: ColorUtils.withOpacity(ColorSystem.primary.DEFAULT, 0.1),
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ColorSystem.primary.DEFAULT,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  refreshText: {
    fontSize: 12,
    color: ColorSystem.primary.light,
    marginLeft: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: ColorSystem.surface.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: ColorSystem.primary[100],
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: ColorSystem.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    color: ColorSystem.primary.DEFAULT,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ColorSystem.primary.DEFAULT,
    marginBottom: 8,
    textAlign: 'center',
  },
  tabSubtitle: {
    fontSize: 14,
    color: ColorSystem.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: ColorSystem.primary.DEFAULT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: ColorSystem.surface.primary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: ColorSystem.text.primary,
    borderWidth: 1,
    borderColor: ColorSystem.border.primary,
    shadowColor: ColorSystem.shadow.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorSystem.surface.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorSystem.border.primary,
    shadowColor: ColorSystem.shadow.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: ColorSystem.text.primary,
  },
  eyeButton: {
    padding: 16,
  },
  saveButton: {
    backgroundColor: ColorSystem.primary.DEFAULT,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: ColorSystem.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ColorSystem.text.inverse,
  },
});
