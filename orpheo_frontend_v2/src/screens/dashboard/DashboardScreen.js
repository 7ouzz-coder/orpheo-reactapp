import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux - USAR SOLO LOS SELECTORES QUE EXISTEN
import { 
  selectUser, 
  logout 
} from '../../store/slices/authSlice';

// Colors - DEFINIR LOCALMENTE PARA EVITAR ERRORES DE IMPORT
const colors = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  primary: '#D4AF37',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#808080',
  border: '#333333',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Función para obtener el nombre del usuario
  const getUserDisplayName = () => {
    if (!user) return 'Usuario Demo';
    return user.nombres && user.apellidos 
      ? `${user.nombres} ${user.apellidos}`
      : user.email || 'Usuario';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.userName}>{getUserDisplayName()}</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userGrade}>
                Grado: {user?.grado || 'No definido'}
              </Text>
              <Text style={styles.userRole}>
                Rol: {user?.rol || 'General'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Success Message */}
        <View style={styles.successContainer}>
          <Icon name="check-circle" size={32} color={colors.success} />
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>¡App Funcionando Correctamente! 🎉</Text>
            <Text style={styles.successSubtitle}>
              ETAPA 1 completada exitosamente
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="account-group" size={28} color={colors.primary} />
            <Text style={styles.statNumber}>25</Text>
            <Text style={styles.statLabel}>Miembros</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="file-document" size={28} color={colors.warning} />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Documentos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="calendar" size={28} color={colors.success} />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Programas</Text>
          </View>
        </View>

        {/* Progress Checklist */}
        <View style={styles.progressContainer}>
          <Text style={styles.sectionTitle}>Estado del Proyecto</Text>
          
          <View style={styles.progressItem}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={styles.progressText}>Redux configurado</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={styles.progressText}>Navegación funcionando</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={styles.progressText}>Login operativo</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={styles.progressText}>Tema aplicado</Text>
          </View>
          
          <View style={styles.progressItem}>
            <Icon name="clock" size={20} color={colors.warning} />
            <Text style={styles.progressText}>Módulos en desarrollo</Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsContainer}>
          <Text style={styles.sectionTitle}>Próximos Pasos</Text>
          <Text style={styles.nextStepsText}>
            • Conectar con backend real{'\n'}
            • Implementar CRUD de miembros{'\n'}
            • Sistema de documentos{'\n'}
            • Gestión de programas{'\n'}
            • Notificaciones en tiempo real
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: 4,
  },
  userInfo: {
    marginTop: 8,
  },
  userGrade: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  userRole: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  successContent: {
    marginLeft: 12,
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  progressText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  nextStepsContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  nextStepsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default DashboardScreen;