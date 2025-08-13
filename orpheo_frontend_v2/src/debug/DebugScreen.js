// src/screens/DebugScreen.js - PANTALLA DE DIAGNÓSTICO
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DebugScreen = () => {
  const insets = useSafeAreaInsets();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  useEffect(() => {
    // Obtener altura del StatusBar en Android
    if (Platform.OS === 'android') {
      setStatusBarHeight(StatusBar.currentHeight || 0);
    }

    // Listener para cambios de orientación
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Información completa del dispositivo
  const deviceInfo = {
    // Información básica
    platform: Platform.OS,
    platformVersion: Platform.Version,
    screenWidth: dimensions.width,
    screenHeight: dimensions.height,
    
    // Safe Area Insets
    topInset: insets.top,
    bottomInset: insets.bottom,
    leftInset: insets.left,
    rightInset: insets.right,
    
    // Status Bar
    statusBarHeight: statusBarHeight,
    
    // Cálculos
    usableHeight: dimensions.height - insets.top - insets.bottom,
    aspectRatio: (dimensions.width / dimensions.height).toFixed(2),
    
    // Detección de tipo de dispositivo
    deviceType: dimensions.width > 768 ? 'Tablet' : 'Phone',
    hasNotch: insets.top > 24,
    hasHomeIndicator: insets.bottom > 0,
    isLandscape: dimensions.width > dimensions.height,
  };

  console.log('🔍 DIAGNÓSTICO COMPLETO:', deviceInfo);

  return (
    <View style={styles.container}>
      {/* Indicadores visuales de Safe Area */}
      <View style={[styles.safeAreaIndicator, styles.topIndicator, { height: insets.top }]}>
        <Text style={styles.indicatorText}>TOP: {insets.top}px</Text>
      </View>
      
      <View style={[styles.safeAreaIndicator, styles.bottomIndicator, { height: insets.bottom }]}>
        <Text style={styles.indicatorText}>BOTTOM: {insets.bottom}px</Text>
      </View>
      
      <View style={[styles.safeAreaIndicator, styles.leftIndicator, { width: insets.left }]}>
        <Text style={[styles.indicatorText, { transform: [{ rotate: '90deg' }] }]}>L</Text>
      </View>
      
      <View style={[styles.safeAreaIndicator, styles.rightIndicator, { width: insets.right }]}>
        <Text style={[styles.indicatorText, { transform: [{ rotate: '90deg' }] }]}>R</Text>
      </View>

      {/* Contenido principal con padding aplicado */}
      <ScrollView 
        style={[styles.content, {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Icon name="bug" size={48} color="#FF6B6B" />
          <Text style={styles.title}>🔍 DIAGNÓSTICO SAFE AREA</Text>
          <Text style={styles.subtitle}>Información completa de tu dispositivo</Text>
        </View>

        {/* Información del dispositivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 INFORMACIÓN DEL DISPOSITIVO</Text>
          <InfoRow label="Plataforma" value={`${deviceInfo.platform} ${deviceInfo.platformVersion}`} />
          <InfoRow label="Tipo" value={deviceInfo.deviceType} />
          <InfoRow label="Pantalla" value={`${deviceInfo.screenWidth} x ${deviceInfo.screenHeight}px`} />
          <InfoRow label="Aspect Ratio" value={deviceInfo.aspectRatio} />
          <InfoRow label="Orientación" value={deviceInfo.isLandscape ? 'Horizontal' : 'Vertical'} />
        </View>

        {/* Safe Area Insets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📐 SAFE AREA INSETS</Text>
          <InfoRow label="Top (Superior)" value={`${deviceInfo.topInset}px`} color="#FF6B6B" />
          <InfoRow label="Bottom (Inferior)" value={`${deviceInfo.bottomInset}px`} color="#4ECDC4" />
          <InfoRow label="Left (Izquierda)" value={`${deviceInfo.leftInset}px`} color="#45B7D1" />
          <InfoRow label="Right (Derecha)" value={`${deviceInfo.rightInset}px`} color="#96CEB4" />
          <InfoRow label="Altura Usable" value={`${deviceInfo.usableHeight}px`} color="#FECA57" />
        </View>

        {/* Detección automática */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 DETECCIÓN AUTOMÁTICA</Text>
          <InfoRow 
            label="Tiene Notch/Isla Dinámica" 
            value={deviceInfo.hasNotch ? 'SÍ' : 'NO'} 
            color={deviceInfo.hasNotch ? '#FF6B6B' : '#96CEB4'} 
          />
          <InfoRow 
            label="Tiene Home Indicator" 
            value={deviceInfo.hasHomeIndicator ? 'SÍ' : 'NO'} 
            color={deviceInfo.hasHomeIndicator ? '#FF6B6B' : '#96CEB4'} 
          />
          {Platform.OS === 'android' && (
            <InfoRow label="Status Bar Height" value={`${deviceInfo.statusBarHeight}px`} />
          )}
        </View>

        {/* Problemas comunes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ PROBLEMAS COMUNES</Text>
          
          {deviceInfo.topInset === 0 && (
            <ProblemCard 
              icon="alert-circle"
              title="Safe Area Top = 0"
              description="Puede indicar que SafeAreaProvider no está configurado correctamente"
              severity="high"
            />
          )}
          
          {!deviceInfo.hasNotch && !deviceInfo.hasHomeIndicator && (
            <ProblemCard 
              icon="information"
              title="Dispositivo sin características especiales"
              description="Este dispositivo no tiene notch ni home indicator"
              severity="low"
            />
          )}
          
          {deviceInfo.screenWidth < 350 && (
            <ProblemCard 
              icon="cellphone"
              title="Pantalla muy pequeña"
              description="Puede requerir ajustes específicos para pantallas pequeñas"
              severity="medium"
            />
          )}
        </View>

        {/* Recomendaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 RECOMENDACIONES</Text>
          
          <View style={styles.recommendationCard}>
            <Icon name="lightbulb" size={24} color="#FECA57" />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Configuración recomendada:</Text>
              <Text style={styles.recommendationText}>
                paddingTop: {Math.max(deviceInfo.topInset, 16)}px{'\n'}
                paddingBottom: {Math.max(deviceInfo.bottomInset + 80, 96)}px (con tab bar){'\n'}
                paddingHorizontal: {Math.max(deviceInfo.leftInset, 16)}px
              </Text>
            </View>
          </View>
        </View>

        {/* Botón para copiar información */}
        <TouchableOpacity 
          style={styles.copyButton}
          onPress={() => {
            console.log('📋 INFORMACIÓN COPIADA AL LOG:', JSON.stringify(deviceInfo, null, 2));
          }}
        >
          <Icon name="content-copy" size={20} color="#FFF" />
          <Text style={styles.copyButtonText}>Copiar Info al Log</Text>
        </TouchableOpacity>

        {/* Espaciado final */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// Componente para mostrar información
const InfoRow = ({ label, value, color = '#FFF' }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, { color }]}>{value}</Text>
  </View>
);

// Componente para mostrar problemas
const ProblemCard = ({ icon, title, description, severity }) => {
  const severityColors = {
    low: '#96CEB4',
    medium: '#FECA57', 
    high: '#FF6B6B'
  };

  return (
    <View style={[styles.problemCard, { borderLeftColor: severityColors[severity] }]}>
      <Icon name={icon} size={20} color={severityColors[severity]} />
      <View style={styles.problemContent}>
        <Text style={styles.problemTitle}>{title}</Text>
        <Text style={styles.problemDescription}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Indicadores visuales de Safe Area
  safeAreaIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  topIndicator: {
    top: 0,
    left: 0,
    right: 0,
  },
  
  bottomIndicator: {
    bottom: 0,
    left: 0,
    right: 0,
  },
  
  leftIndicator: {
    top: 0,
    bottom: 0,
    left: 0,
  },
  
  rightIndicator: {
    top: 0,
    bottom: 0,
    right: 0,
  },
  
  indicatorText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    marginTop: 8,
    textAlign: 'center',
  },
  
  section: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  
  infoLabel: {
    fontSize: 14,
    color: '#CCC',
    flex: 1,
  },
  
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  problemCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  
  problemContent: {
    marginLeft: 12,
    flex: 1,
  },
  
  problemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  
  problemDescription: {
    fontSize: 12,
    color: '#CCC',
    lineHeight: 16,
  },
  
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(254, 202, 87, 0.1)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(254, 202, 87, 0.3)',
  },
  
  recommendationContent: {
    marginLeft: 12,
    flex: 1,
  },
  
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FECA57',
    marginBottom: 8,
  },
  
  recommendationText: {
    fontSize: 12,
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  
  copyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DebugScreen;