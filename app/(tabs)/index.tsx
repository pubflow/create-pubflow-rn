import React from 'react';
import { View, StyleSheet } from 'react-native';
import Users from '../../components/bridge/Users';

/**
 * Home screen component
 * Displays the users list using the Bridge component
 */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Users />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});