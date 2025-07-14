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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-chart-kit';

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
  selectDocumentosLoading,
  selectPlanchasPendientes 
} from '../../store/slices/documentosSlice';

// Styles
import { colors, getGradoColor } from '../../styles/colors';

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
  const planchasPendientes = useSelector(selectPlanchasPendientes);
  
  const isLoadingMiembros = useSelector(selectMiembrosLoading);
  const isLoadingDocumentos = useSelector(selectDocumentosLoading);
  
  const isRefreshing = isLoadingMiembros || isLoadingDocumentos;
  
  // Ref para controlar actualizaciones
  const mounted = useRef(true);

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
    
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchMiembrosStats()),
        dispatch(fetchDocumentosStats()),
        dispatch(fetchMiembros({ limit: 5 })), // Solo para obtener datos recientes
        dispatch(fetchDocumentos({ limit: 5 })) // Solo para obtener datos recientes
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Función de refresh
  const onRefresh = () => {
    loadDashboardData();
  };

  // Obtener saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  // Datos para el gráfico de miembros por grado
  const getMiembrosChartData = () => {
    if (!miembrosStats.distribucionPorGrado) {
      return {
        labels: ['Aprendices', 'Compañeros', 'Maestros'],
        datasets: [{
          data: [0, 0, 0],
          color: (opacity = 1) => colors.primary,
          strokeWidth: 2
        }]
      };
    }

    const { aprendices, companeros, maestros } = miembrosStats.distribucionPorGrado;
    
    return {
      labels: ['Aprendices', 'Compañeros', 'Maestros'],
      datasets: [{
        data: [aprendices || 0, companeros || 0, maestros || 0],
        color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  // Configuración del gráfico
  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fill: colors.text
    },
    propsForVerticalLabels: {
      fontSize: 10,
      fill: colors.textSecondary
    },
    propsForHorizontalLabels: {
      fontSize: 10,
      fill: colors.textSecondary
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              {getGreeting()}, {userName}!
            </Text>
            <View style={styles.userInfo}>
              <View style={[styles.gradeBadge, { backgroundColor: getGradoColor(userGrade) }]}>
                <Text style={styles.gradeText}>{userGrade}</Text>
              </View>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Icon name="account-circle" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Miembros Card */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Miembros')}
          >
            <View style={styles.statHeader}>
              <Icon name="account-group" size={24} color={colors.primary} />
              <Text style={styles.statTitle}>Miembros</Text>
            </View>
            <Text style={styles.statNumber}>{miembrosStats.totalMiembros || 0}</Text>
            <View style={styles.statDetail}>
              <Text style={styles.statDetailText}>
                {miembrosStats.activos || 0} activos ({miembrosStats.porcentajeActivos || 0}%)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Documentos Card */}
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Documentos')}
          >
            <View style={styles.statHeader}>
              <Icon name="file-document" size={24} color={colors.primary} />
              <Text style={styles.statTitle}>Documentos</Text>
            </View>
            <Text style={styles.statNumber}>{documentosStats.totalDocumentos || 0}</Text>
            <View style={styles.statDetail}>
              <Text style={styles.statDetailText}>
                {documentosStats.documentosAprobados || 0} aprobados
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Planchas pendientes (solo para maestros/admins) */}
        {(['maestro'].includes(userGrade) || ['admin', 'superadmin'].includes(userRole)) && 
         documentosStats.planchasPendientes > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Icon name="alert-circle" size={24} color={colors.warning} />
              <Text style={styles.alertTitle}>Planchas Pendientes</Text>
            </View>
            <Text style={styles.alertText}>
              Hay {documentosStats.planchasPendientes} plancha(s) esperando moderación
            </Text>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => navigation.navigate('Documentos', { 
                screen: 'DocumentosList',
                params: { filter: { tipo: 'plancha', estado: 'pendiente' } }
              })}
            >
              <Text style={styles.alertButtonText}>Revisar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Gráfico de distribución por grado */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Distribución por Grado</Text>
          <LineChart
            data={getMiembrosChartData()}
            width={screenWidth - 60}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Acciones rápidas */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            {/* Nuevo Miembro */}
            {(['admin', 'superadmin'].includes(userRole)) && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Miembros', { 
                  screen: 'MiembroForm' 
                })}
              >
                <Icon name="account-plus" size={28} color={colors.primary} />
                <Text style={styles.actionText}>Nuevo Miembro</Text>
              </TouchableOpacity>
            )}

            {/* Subir Documento */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Documentos', { 
                screen: 'DocumentoUpload' 
              })}
            >
              <Icon name="upload" size={28} color={colors.primary} />
              <Text style={styles.actionText}>Subir Documento</Text>
            </TouchableOpacity>

            {/* Ver Miembros */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Miembros')}
            >
              <Icon name="account-search" size={28} color={colors.primary} />
              <Text style={styles.actionText}>Ver Miembros</Text>
            </TouchableOpacity>

            {/* Ver Documentos */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Documentos')}
            >
              <Icon name="file-search" size={28} color={colors.primary} />
              <Text style={styles.actionText}>Ver Documentos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información del Sistema</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mi Grado:</Text>
              <Text style={[styles.infoValue, { color: getGradoColor(userGrade) }]}>
                {userGrade?.charAt(0).toUpperCase() + userGrade?.slice(1)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mi Rol:</Text>
              <Text style={styles.infoValue}>
                {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  roleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  profileButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  statDetail: {
    marginTop: 5,
  },
  statDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  alertCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  alertText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  alertButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  alertButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  chartCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: colors.surface,
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});

export default DashboardScreen;