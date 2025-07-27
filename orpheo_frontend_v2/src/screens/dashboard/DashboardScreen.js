import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux
import { 
  selectUser, 
  selectUserDisplayName,
  selectUserRole,
  selectUserGrade 
} from '../../store/slices/authSlice';
import { 
  fetchMiembros, 
  fetchEstadisticas as fetchMiembrosStats,
  selectMiembrosEstadisticas,
  selectMiembrosLoading 
} from '../../store/slices/miembrosSlice';
import { 
  fetchDocumentos, 
  fetchEstadisticas as fetchDocumentosStats,
  selectDocumentosEstadisticas,
  selectDocumentosLoading 
} from '../../store/slices/documentosSlice';

// Styles
import { colors, getGradoColor } from '../../styles/colors';
import { globalStyles, dimensions } from '../../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Selectores
  const user = useSelector(selectUser);
  const userName = useSelector(selectUserDisplayName);
  const userRole = useSelector(selectUserRole);
  const userGrade = useSelector(selectUserGrade);
  
  const miembrosStats = useSelector(selectMiembrosEstadisticas);
  const documentosStats = useSelector(selectDocumentosEstadisticas);
  const miembrosLoading = useSelector(selectMiembrosLoading);
  const documentosLoading = useSelector(selectDocumentosLoading);
  
  // Estado local
  const [refreshing, setRefreshing] = React.useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchMiembrosStats()),
        dispatch(fetchDocumentosStats()),
        // dispatch(fetchProgramasStats()), // TODO: Implementar cuando esté listo
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Función para navegar a módulos
  const navigateToModule = (module) => {
    switch (module) {
      case 'miembros':
        navigation.navigate('MiembrosTab');
        break;
      case 'documentos':
        navigation.navigate('DocumentosTab');
        break;
      case 'perfil':
        navigation.navigate('Profile');
        break;
      default:
        Alert.alert('Próximamente', `El módulo ${module} estará disponible pronto`);
    }
  };

  // Componente de tarjeta de estadística
  const StatCard = ({ title, value, icon, color, onPress, loading = false }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statContent}>
        <View style={styles.statIcon}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statValue}>
            {loading ? '...' : value || '0'}
          </Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Componente de acción rápida
  const QuickAction = ({ title, icon, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.quickAction, { backgroundColor: color + '20' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={32} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header de bienvenida */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
            <Text style={styles.welcomeSubtitle}>{userName}</Text>
            <View style={styles.userInfo}>
              <View style={[styles.gradeBadge, { backgroundColor: getGradoColor(userGrade) + '20' }]}>
                <Text style={[styles.gradeText, { color: getGradoColor(userGrade) }]}>
                  {userGrade?.toUpperCase() || 'MIEMBRO'}
                </Text>
              </View>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          </View>
          <View style={styles.welcomeIcon}>
            <Icon name="account-circle" size={60} color={colors.primary} />
          </View>
        </View>

        {/* Estadísticas principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Miembros"
              value={miembrosStats?.total}
              icon="account-group"
              color={colors.primary}
              onPress={() => navigateToModule('miembros')}
              loading={miembrosLoading}
            />
            
            <StatCard
              title="Documentos"
              value={documentosStats?.total}
              icon="file-document"
              color={colors.info}
              onPress={() => navigateToModule('documentos')}
              loading={documentosLoading}
            />
            
            <StatCard
              title="Aprendices"
              value={miembrosStats?.porGrado?.aprendiz}
              icon="account-school"
              color={colors.aprendiz}
              onPress={() => navigateToModule('miembros')}
              loading={miembrosLoading}
            />
            
            <StatCard
              title="Compañeros"
              value={miembrosStats?.porGrado?.companero}
              icon="account-tie"
              color={colors.companero}
              onPress={() => navigateToModule('miembros')}
              loading={miembrosLoading}
            />
            
            <StatCard
              title="Maestros"
              value={miembrosStats?.porGrado?.maestro}
              icon="account-star"
              color={colors.maestro}
              onPress={() => navigateToModule('miembros')}
              loading={miembrosLoading}
            />
            
            <StatCard
              title="Nuevos (mes)"
              value={miembrosStats?.nuevosUltimoMes}
              icon="account-plus"
              color={colors.success}
              onPress={() => navigateToModule('miembros')}
              loading={miembrosLoading}
            />
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Ver Miembros"
              icon="account-group"
              color={colors.primary}
              onPress={() => navigateToModule('miembros')}
            />
            
            <QuickAction
              title="Documentos"
              icon="file-document"
              color={colors.info}
              onPress={() => navigateToModule('documentos')}
            />
            
            <QuickAction
              title="Programas"
              icon="calendar"
              color={colors.warning}
              onPress={() => navigateToModule('programas')}
            />
            
            <QuickAction
              title="Mi Perfil"
              icon="account-edit"
              color={colors.success}
              onPress={() => navigateToModule('perfil')}
            />
          </View>
        </View>

        {/* Actividad reciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <Icon name="account-plus" size={20} color={colors.success} />
              <Text style={styles.activityText}>
                Sistema iniciado correctamente
              </Text>
              <Text style={styles.activityTime}>Ahora</Text>
            </View>
            
            <View style={styles.activityItem}>
              <Icon name="database" size={20} color={colors.info} />
              <Text style={styles.activityText}>
                Datos sincronizados
              </Text>
              <Text style={styles.activityTime}>Hace 5 min</Text>
            </View>
            
            <View style={styles.activityItem}>
              <Icon name="security" size={20} color={colors.primary} />
              <Text style={styles.activityText}>
                Sesión iniciada como {userRole}
              </Text>
              <Text style={styles.activityTime}>Hace 10 min</Text>
            </View>
          </View>
        </View>

        {/* Información del sistema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sistema</Text>
          
          <View style={globalStyles.card}>
            <View style={styles.systemInfo}>
              <Icon name="information" size={20} color={colors.info} />
              <View style={styles.systemText}>
                <Text style={styles.systemTitle}>Orpheo v1.0.0</Text>
                <Text style={styles.systemSubtitle}>Sistema de Gestión Masónica</Text>
              </View>
            </View>
            
            <View style={styles.systemStatus}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={styles.statusText}>Backend conectado</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={styles.statusText}>Datos sincronizados</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Espaciado final */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  welcomeIcon: {
    marginLeft: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    width: (screenWidth - 48) / 2,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 12,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (screenWidth - 48) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  systemText: {
    marginLeft: 12,
  },
  systemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  systemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  systemStatus: {
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default DashboardScreen;