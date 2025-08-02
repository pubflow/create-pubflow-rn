import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ColorSystem, ColorUtils, COLORS } from '@/utils/colorSystem';

/**
 * Componente de ejemplo que demuestra el uso del sistema de colores profesional
 * Este componente muestra diferentes casos de uso y patrones de diseño
 */
export default function ColorSystemExample() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sistema de Colores Profesional</Text>
      
      {/* Botones Primarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Botones Primarios</Text>
        
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Botón Principal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Botón Secundario</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Botón Outline</Text>
        </TouchableOpacity>
      </View>

      {/* Estados Semánticos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estados Semánticos</Text>
        
        <View style={styles.alertSuccess}>
          <Text style={styles.alertSuccessText}>✅ Operación exitosa</Text>
        </View>
        
        <View style={styles.alertWarning}>
          <Text style={styles.alertWarningText}>⚠️ Advertencia importante</Text>
        </View>
        
        <View style={styles.alertError}>
          <Text style={styles.alertErrorText}>❌ Error en la operación</Text>
        </View>
        
        <View style={styles.alertInfo}>
          <Text style={styles.alertInfoText}>ℹ️ Información adicional</Text>
        </View>
      </View>

      {/* Cards y Superficies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cards y Superficies</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Card Principal</Text>
          <Text style={styles.cardContent}>
            Esta es una card con el estilo principal del sistema de colores.
          </Text>
        </View>
        
        <View style={styles.cardElevated}>
          <Text style={styles.cardTitle}>Card Elevada</Text>
          <Text style={styles.cardContent}>
            Esta card tiene mayor elevación y sombra.
          </Text>
        </View>
      </View>

      {/* Paleta de Colores Primarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paleta Primaria</Text>
        <View style={styles.colorPalette}>
          <View style={[styles.colorSwatch, { backgroundColor: ColorSystem.primary[50] }]}>
            <Text style={styles.colorLabel}>50</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: ColorSystem.primary[100] }]}>
            <Text style={styles.colorLabel}>100</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: ColorSystem.primary[200] }]}>
            <Text style={styles.colorLabel}>200</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: ColorSystem.primary[300] }]}>
            <Text style={styles.colorLabel}>300</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: ColorSystem.primary[400] }]}>
            <Text style={[styles.colorLabel, { color: ColorSystem.text.inverse }]}>400</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: ColorSystem.primary.DEFAULT }]}>
            <Text style={[styles.colorLabel, { color: ColorSystem.text.inverse }]}>500</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: ColorSystem.primary[600] }]}>
            <Text style={[styles.colorLabel, { color: ColorSystem.text.inverse }]}>600</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: ColorSystem.primary[700] }]}>
            <Text style={[styles.colorLabel, { color: ColorSystem.text.inverse }]}>700</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: ColorSystem.primary[800] }]}>
            <Text style={[styles.colorLabel, { color: ColorSystem.text.inverse }]}>800</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: ColorSystem.primary[900] }]}>
            <Text style={[styles.colorLabel, { color: ColorSystem.text.inverse }]}>900</Text>
          </View>
        </View>
      </View>

      {/* Ejemplos de Utilidades */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Utilidades de Color</Text>
        
        <View style={[styles.utilityExample, { 
          backgroundColor: ColorUtils.withOpacity(ColorSystem.primary.DEFAULT, 0.1) 
        }]}>
          <Text style={styles.utilityText}>
            Color con 10% de opacidad usando ColorUtils.withOpacity()
          </Text>
        </View>
        
        <View style={[styles.utilityExample, { 
          backgroundColor: ColorSystem.primary.DEFAULT 
        }]}>
          <Text style={[styles.utilityText, { 
            color: ColorUtils.getContrastText(ColorSystem.primary.DEFAULT) 
          }]}>
            Texto con contraste automático usando ColorUtils.getContrastText()
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorSystem.surface.secondary,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ColorSystem.primary.DEFAULT,
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ColorSystem.text.primary,
    marginBottom: 15,
  },
  
  // Botones
  primaryButton: {
    backgroundColor: ColorSystem.primary.DEFAULT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: ColorSystem.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: ColorSystem.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: ColorSystem.secondary.DEFAULT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: ColorSystem.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: ColorSystem.primary.DEFAULT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  outlineButtonText: {
    color: ColorSystem.primary.DEFAULT,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Alertas
  alertSuccess: {
    backgroundColor: ColorSystem.success[50],
    borderColor: ColorSystem.success[200],
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertSuccessText: {
    color: ColorSystem.success.DEFAULT,
    fontWeight: '500',
  },
  alertWarning: {
    backgroundColor: ColorSystem.warning[50],
    borderColor: ColorSystem.warning[200],
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertWarningText: {
    color: ColorSystem.warning.DEFAULT,
    fontWeight: '500',
  },
  alertError: {
    backgroundColor: ColorSystem.error[50],
    borderColor: ColorSystem.error[200],
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertErrorText: {
    color: ColorSystem.error.DEFAULT,
    fontWeight: '500',
  },
  alertInfo: {
    backgroundColor: ColorSystem.info[50],
    borderColor: ColorSystem.info[200],
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertInfoText: {
    color: ColorSystem.info.DEFAULT,
    fontWeight: '500',
  },
  
  // Cards
  card: {
    backgroundColor: ColorSystem.surface.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ColorSystem.border.primary,
  },
  cardElevated: {
    backgroundColor: ColorSystem.surface.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: ColorSystem.shadow.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ColorSystem.text.primary,
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: ColorSystem.text.secondary,
    lineHeight: 20,
  },
  
  // Paleta de colores
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ColorSystem.border.primary,
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ColorSystem.text.primary,
  },
  
  // Utilidades
  utilityExample: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  utilityText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
