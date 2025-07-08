import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getDebugConfig } from '../../utils/debugConfig';
import BridgeListDebugger from './BridgeListDebugger';

interface BridgeListMonitorProps {
  entityConfig: any;
  searchParams?: any;
  children: React.ReactNode;
}

/**
 * Componente para monitorear BridgeList
 * Muestra un indicador flotante que permite abrir el depurador
 */
export default function BridgeListMonitor({
  entityConfig,
  searchParams,
  children
}: BridgeListMonitorProps) {
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [isDebuggerVisible, setIsDebuggerVisible] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  // Verificar si el debug está habilitado
  useEffect(() => {
    const { enabled } = getDebugConfig();
    setDebugEnabled(enabled);
  }, []);

  // Simular contador de solicitudes (en una implementación real, esto se conectaría a eventos reales)
  useEffect(() => {
    if (debugEnabled) {
      const interval = setInterval(() => {
        // Incrementar contador de solicitudes aleatoriamente para simular actividad
        if (Math.random() > 0.7) {
          setRequestCount(prev => prev + 1);
        }

        // Simular errores ocasionales
        if (Math.random() > 0.9) {
          setErrorCount(prev => prev + 1);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [debugEnabled]);

  // Abrir/cerrar depurador
  const toggleDebugger = () => {
    setIsDebuggerVisible(!isDebuggerVisible);
  };

  // Si el debug no está habilitado, solo mostrar los children
  if (!debugEnabled) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {children}

      <TouchableOpacity
        style={[
          styles.debugButton,
          errorCount > 0 ? styles.debugButtonError : styles.debugButtonNormal
        ]}
        onPress={toggleDebugger}
      >
        <Text style={styles.debugButtonText}>
          🔍 {requestCount} {errorCount > 0 ? `(${errorCount} ⚠️)` : ''}
        </Text>
      </TouchableOpacity>

      <BridgeListDebugger
        entityConfig={entityConfig}
        searchParams={searchParams}
        visible={isDebuggerVisible}
        onClose={() => setIsDebuggerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  debugButtonNormal: {
    backgroundColor: '#007AFF',
  },
  debugButtonError: {
    backgroundColor: '#FF3B30',
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
