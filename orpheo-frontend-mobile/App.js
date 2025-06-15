import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome', 'login', 'dashboard'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Navegación simple
  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  // Login handler
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      if (username === 'demo' && password === '123456') {
        navigateTo('dashboard');
      } else {
        Alert.alert('Error', 'Usuario o contraseña incorrectos\n\nPrueba: demo / 123456');
      }
      setLoading(false);
    }, 1000);
  };

  // Logout handler
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          onPress: () => {
            setUsername('');
            setPassword('');
            navigateTo('welcome');
          },
          style: 'destructive' 
        },
      ]
    );
  };

  // Pantalla de Bienvenida
  if (currentScreen === 'welcome') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#0B0B0B" />
        
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="business" size={60} color="#D4AF37" />
          </View>
          <Text style={styles.title}>Orpheo Mobile</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Masónica</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeText}>¡Bienvenido!</Text>
          <Text style={styles.description}>
            La aplicación móvil para la gestión de tu logia masónica.
            Administra miembros, documentos y programas desde cualquier lugar.
          </Text>
          
          <TouchableOpacity style={styles.button} onPress={() => navigateTo('login')}>
            <Ionicons name="log-in" size={20} color="#0B0B0B" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Ionicons name="shield-checkmark" size={16} color="#7A6F63" />
            <Text style={styles.footerText}>Seguro y confiable</Text>
          </View>
          <Text style={styles.version}>Versión 1.0.0</Text>
        </View>
      </View>
    );
  }

  // Pantalla de Login
  if (currentScreen === 'login') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#0B0B0B" />
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigateTo('welcome')}>
              <Ionicons name="arrow-back" size={24} color="#A59F99" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Iniciar Sesión</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircleSmall}>
              <Ionicons name="business" size={50} color="#D4AF37" />
            </View>
            <Text style={styles.titleSmall}>Orpheo Mobile</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color="#A59F99" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Usuario"
                placeholderTextColor="#A59F99"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#A59F99" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#A59F99"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#A59F99"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.loginButtonText}>Iniciando...</Text>
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color="#0B0B0B" style={styles.buttonIcon} />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.demoContainer}>
              <Text style={styles.demoText}>Credenciales de prueba:</Text>
              <Text style={styles.demoCredentials}>Usuario: demo</Text>
              <Text style={styles.demoCredentials}>Contraseña: 123456</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // Pantalla Dashboard
  if (currentScreen === 'dashboard') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#0B0B0B" />
        
        {/* Header */}
        <View style={styles.dashboardHeader}>
          <View>
            <Text style={styles.greeting}>Bienvenido</Text>
            <Text style={styles.userName}>H∴ Usuario Demo</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.dashboardContent} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={32} color="#3B82F6" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Próximos Eventos</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={32} color="#F59E0B" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Documentos</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => Alert.alert('Próximamente', 'La función "Programas" estará disponible pronto.')}
              >
                <Ionicons name="calendar-outline" size={32} color="#D4AF37" />
                <Text style={styles.actionText}>Programas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => Alert.alert('Próximamente', 'La función "Documentos" estará disponible pronto.')}
              >
                <Ionicons name="document-text-outline" size={32} color="#D4AF37" />
                <Text style={styles.actionText}>Documentos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => Alert.alert('Próximamente', 'La función "Miembros" estará disponible pronto.')}
              >
                <Ionicons name="people-outline" size={32} color="#D4AF37" />
                <Text style={styles.actionText}>Miembros</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => Alert.alert('Próximamente', 'La función "Mi Perfil" estará disponible pronto.')}
              >
                <Ionicons name="person-outline" size={32} color="#D4AF37" />
                <Text style={styles.actionText}>Mi Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lodge Info */}
          <View style={styles.lodgeInfo}>
            <Text style={styles.lodgeTitle}>Logia Orpheo</Text>
            <Text style={styles.lodgeSubtitle}>Fundada en 1923 • Gran Logia de Chile</Text>
            <Text style={styles.lodgeMotto}>Libertad • Igualdad • Fraternidad</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
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
  logoCircleSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  titleSmall: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
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
  // Login styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
  },
  placeholder: {
    width: 40,
  },
  form: {
    width: '100%',
    justifyContent: 'center',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#7A6F63',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#A59F99',
    fontSize: 16,
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontWeight: '600',
  },
  demoContainer: {
    backgroundColor: 'rgba(122, 111, 99, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  demoText: {
    color: '#A59F99',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  demoCredentials: {
    color: '#7A6F63',
    fontSize: 12,
    marginBottom: 2,
  },
  // Dashboard styles
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#7A6F63',
    marginBottom: 16,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  greeting: {
    color: '#A59F99',
    fontSize: 14,
  },
  userName: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  dashboardContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7A6F63',
  },
  statNumber: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    color: '#A59F99',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7A6F63',
  },
  actionText: {
    color: '#A59F99',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  lodgeInfo: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7A6F63',
    marginTop: 16,
    marginBottom: 32,
  },
  lodgeTitle: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lodgeSubtitle: {
    color: '#A59F99',
    fontSize: 14,
    marginBottom: 4,
  },
  lodgeMotto: {
    color: '#D4AF37',
    fontSize: 12,
    fontStyle: 'italic',
  },
});