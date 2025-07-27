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

// Redux
import { 
  selectUser, 
  selectUserDisplayName,
  logout 
} from '../../store/slices/authSlice';

// Colors
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
  const userName = useSelector(selectUserDisplayName);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.userName}>{userName || 'Usuario Demo'}</Text>
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

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="account-group" size={32} color={colors.primary} />
            <Text style={styles.statNumber}>25</Text>
            <Text style={styles.statLabel}>Miembros</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="file-document" size={32} color={colors.warning} />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Documentos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="calendar" size={32} color={colors.success} />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Programas</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="account-plus" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Nuevo Miembro</Text>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="file-upload" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Subir Documento</Text>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="calendar-plus" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Nuevo Programa</Text>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          
          <View style={styles.activityItem}>
            <Icon name="account" size={20} color={colors.success} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Nuevo miembro registrado</Text>
              <Text style={styles.activityTime}>Hace 2 horas</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Icon name="file-document" size={20} color={colors.warning} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Documento subido</Text>
              <Text style={styles.activityTime}>Hace 1 día</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Icon name="calendar" size={20} color={colors.primary} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Programa creado</Text>
              <Text style={styles.activityTime}>Hace 3 días</Text>
            </View>
          </View>
        </View>

        {/* Status Message */}
        <View style={styles.statusContainer}>
          <Icon name="check-circle" size={24} color={colors.success} />
          <Text style={styles.statusText}>
            Sistema funcionando correctamente ✨
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
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
    flex: 1,
  },
  activityContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default DashboardScreen;