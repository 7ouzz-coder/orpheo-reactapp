import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="business" size={60} color="#D4AF37" />
        </View>
        <Text style={styles.title}>Orpheo Mobile</Text>
        <Text style={styles.subtitle}>Sistema de Gestión Masónica</Text>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>¡Bienvenido!</Text>
        <Text style={styles.description}>
          La aplicación móvil para la gestión de tu logia masónica.
          Administra miembros, documentos y programas desde cualquier lugar.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={goToLogin}>
          <Ionicons name="log-in" size={20} color="#0B0B0B" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Ionicons name="shield-checkmark" size={16} color="#7A6F63" />
          <Text style={styles.footerText}>Seguro y confiable</Text>
        </View>
        <Text style={styles.version}>Versión 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    padding: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A59F99',
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#A59F99',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#7A6F63',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#0B0B0B',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerText: {
    color: '#7A6F63',
    fontSize: 14,
    marginLeft: 8,
  },
  version: {
    color: '#7A6F63',
    fontSize: 12,
  },
});