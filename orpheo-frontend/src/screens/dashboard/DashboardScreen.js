import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../styles/colors';
import { selectUser } from '../../store/slices/authSlice';
import { getMiembros, selectMiembros } from '../../store/slices/miembrosSlice';
import LoadingCard from '../../components/common/LoadingCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const miembros = useSelector(selectMiembros) || [];
  
  const [refreshing, setRefreshing] = React.useState(false);
  const [stats, setStats] = React.useState({
    totalMiembros: 0,
    miembrosActivos: 0,
    documentosTotal: 0,
    proximasTenidas: 0,
    loading: true,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setStats(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await dispatch(getMiembros({ page: 1, limit: 100 })).unwrap();
      
      if (result && Array.isArray(result.data)) {
        const miembrosData = result.data;
        const activosCount = miembrosData.filter(m => m && m.vigente).length;
        
        setStats({
          totalMiembros: miembrosData.length,
          miembrosActivos: activosCount,
          documentosTotal: 12, // Mock data
          proximasTenidas: 3, // Mock data
          loading: false,
        });
      } else {
        setStats({
          totalMiembros: 0,
          miembrosActivos: 0,
          documentosTotal: 0,
          proximasTenidas: 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats({
        totalMiembros: 0,
        miembrosActivos: 0,
        documentosTotal: 0,
        proximasTenidas: 0,
        loading: false,
      });
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboardData().finally(() => setRefreshing(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getUserDisplayName = () => {
    return user?.member_full_name || user?.username || 'Usuario';
  };

  const renderStatsCard = (icon, title, value, subtitle, onPress, color = colors.primary) => (
    <TouchableOpacity 
      style={styles.statsCard} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.statsIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color={colors.white} />
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
        <Text style={styles.statsSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderActionCard = (icon, title, subtitle, onPress, iconColor = colors.primary) => (
    <TouchableOpacity 
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIcon, { backgroundColor: iconColor + '20' }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderMiembroItem = (miembro) => {
    if (!miembro || !miembro.id) return null;
    
    const initials = `${(miembro.nombres || 'N').charAt(0)}${(miembro.apellidos || 'N').charAt(0)}`;
    const gradoColor = colors[miembro.grado] || colors.primary;
    
    return (
      <TouchableOpacity
        key={miembro.id}
        style={styles.miembroItem}
        onPress={() => navigation.navigate('Miembros', {
          screen: 'MiembroDetail',
          params: { miembro }
        })}
        activeOpacity={0.8}
      >
        <View style={[styles.miembroAvatar, { backgroundColor: gradoColor }]}>
          <Text style={styles.miembroInitials}>{initials}</Text>
        </View>
        <View style={styles.miembroInfo}>
          <Text style={styles.miembroName} numberOfLines={1}>
            {miembro.nombres || 'Sin nombre'} {miembro.apellidos || ''}
          </Text>
          <Text style={styles.miembroGrado}>
            {(miembro.grado || 'N/A').toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (stats.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.loadingContainer}>
          <LoadingCard height={120} />
          <View style={styles.statsGrid}>
            <LoadingCard height={80} width={(SCREEN_WIDTH - 48) / 2} />
            <LoadingCard height={80} width={(SCREEN_WIDTH - 48) / 2} />
            <LoadingCard height={80} width={(SCREEN_WIDTH - 48) / 2} />
            <LoadingCard height={80} width={(SCREEN_WIDTH - 48) / 2} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header de Bienvenida */}
        <View style={styles.welcomeCard}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName} numberOfLines={2}>
            {getUserDisplayName()}
          </Text>
          <View style={styles.userBadges}>
            <View style={[styles.gradoBadge, { backgroundColor: colors[user?.grado] || colors.primary }]}>
              <Text style={styles.badgeText}>
                {user?.grado?.toUpperCase() || 'N/A'}
              </Text>
            </View>
            {user?.cargo && (
              <View style={styles.cargoBadge}>
                <Text style={styles.cargoText}>
                  {user.cargo.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Grid de Estadísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Resumen</Text>
          <View style={styles.statsGrid}>
            {renderStatsCard(
              'people',
              'Miembros',
              stats.totalMiembros,
              `${stats.miembrosActivos} activos`,
              () => navigation.navigate('Miembros'),
              colors.aprendiz
            )}
            
            {renderStatsCard(
              'description',
              'Documentos',
              stats.documentosTotal,
              'Ver biblioteca',
              () => console.log('Navegando a Documentos'),
              colors.companero
            )}
            
            {renderStatsCard(
              'calendar-today',
              'Programas',
              stats.proximasTenidas,
              'Próximas tenidas',
              () => console.log('Navegando a Programas'),
              colors.maestro
            )}
            
            {renderStatsCard(
              'insights',
              'Reportes',
              '100%',
              'Ver estadísticas',
              () => console.log('Navegando a Reportes'),
              colors.primary
            )}
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
          
          {renderActionCard(
            'person-add',
            'Nuevo Miembro',
            'Registrar hermano en la logia',
            () => navigation.navigate('Miembros', { screen: 'MiembroForm' }),
            colors.success
          )}
          
          {renderActionCard(
            'upload-file',
            'Subir Documento',
            'Compartir plancha o archivo',
            () => console.log('Subir Documento'),
            colors.info
          )}
          
          {renderActionCard(
            'event',
            'Nueva Tenida',
            'Programar reunión masónica',
            () => console.log('Nueva Tenida'),
            colors.warning
          )}
        </View>

        {/* Miembros Recientes */}
        {Array.isArray(miembros) && miembros.length > 0 && (
          <View style={styles.miembrosSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👥 Miembros Recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Miembros')}>
                <Text style={styles.sectionLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.miembrosList}>
              {miembros.slice(0, 4).map(renderMiembroItem)}
            </View>
          </View>
        )}

        {/* Estado Vacío */}
        {(!Array.isArray(miembros) || miembros.length === 0) && (
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>¡Bienvenido a Orpheo!</Text>
            <Text style={styles.emptyText}>
              Comienza agregando el primer miembro de tu logia
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Miembros', { screen: 'MiembroForm' })}
            >
              <Icon name="add" size={20} color={colors.white} />
              <Text style={styles.emptyButtonText}>Agregar Primer Miembro</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 16,
  },
  
  // Welcome Card
  welcomeCard: {
    backgroundColor: colors.surface,
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  userBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  cargoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.card,
    marginBottom: 4,
  },
  cargoText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  
  // Sections
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  miembrosSection: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: (SCREEN_WIDTH - 40) / 2,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  
  // Action Cards
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  
  // Miembros List
  miembrosList: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  miembroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  miembroAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  miembroInitials: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  miembroInfo: {
    flex: 1,
  },
  miembroName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  miembroGrado: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DashboardScreen;