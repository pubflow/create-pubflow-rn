import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth, BridgeView } from '@pubflow/react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

export default function ProfileScreen() {
  // Get user data and authentication functions
  const { user, logout, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const mainColor = '#c30000';

  // Local states
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  // Handle session reset
  const handleResetSession = async () => {
    Alert.alert(
      "Reset Session",
      "Are you sure you want to reset your session?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Error resetting session:', error);
            }
          }
        }
      ]
    );
  };

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={mainColor} size="large" />
        <ThemedText style={styles.message}>Loading profile...</ThemedText>
      </View>
    );
  }

  // No user found
  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

        <ThemedView style={styles.header}>
          <ThemedText style={styles.name}>User Profile</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.message}>
            No user information found. Please log in again.
          </ThemedText>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: mainColor, marginTop: 20 }]}
            onPress={() => router.replace('/login')}
          >
            <ThemedText style={styles.buttonText}>Go to Login</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ThemedView style={styles.header}>
        <View style={styles.profileImageContainer}>
          <View style={[styles.profileImagePlaceholder, { backgroundColor: mainColor }]}>
            <ThemedText style={styles.profileImagePlaceholderText}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="title" style={styles.name}>
          {user.name || 'User'}
        </ThemedText>
        <ThemedText style={styles.email}>
          {user.email || 'Not available'}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Account Information</ThemedText>

        <ThemedText style={styles.infoText}>ID: {user.id || 'Not available'}</ThemedText>
        <ThemedText style={styles.infoText}>Type: {user.user_type || 'Not available'}</ThemedText>

        {/* Admin-only content */}
        <BridgeView
          allowedTypes={['admin', 'superadmin']}
          fallback={<ThemedText style={styles.fallbackText}>Admin content is hidden</ThemedText>}
        >
          <ThemedView style={styles.adminSection}>
            <ThemedText style={styles.adminText}>Exclusive admin content</ThemedText>
            <ThemedText style={styles.adminSubText}>You have access to advanced features</ThemedText>
          </ThemedView>
        </BridgeView>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: mainColor }]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.buttonText}>Logout</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#666', marginTop: 10 }]}
          onPress={handleResetSession}
        >
          <ThemedText style={styles.buttonText}>Reset Session</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  adminSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(195, 0, 0, 0.1)',
    borderRadius: 8,
  },
  adminText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c30000',
    marginBottom: 5,
  },
  adminSubText: {
    fontSize: 14,
    color: '#666',
  },
  fallbackText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    padding: 20,
    marginBottom: 40,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
