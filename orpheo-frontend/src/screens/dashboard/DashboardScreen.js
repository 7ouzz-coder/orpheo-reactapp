import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
import { selectUser } from '../../store/slices/authSlice';
import { getMiembros, selectMiembros } from '../../store/slices/miembrosSlice';
import LoadingCard from '../../components/common/LoadingCard';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const miembros = useSelector(selectMiembros) || []; // ✅ Fallback para evitar undefined
  
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
      // ✅ Cargar miembros con manejo de errores robusto
      const result = await dispatch(getMiembros({ page: 1, limit: 100 })).unwrap();
      
      // ✅ Verificar que result y result.data existen
      if (result && Array.isArray(result.data)) {
        const miembrosData = result.data;
        const activosCount = miembrosData.filter(m => m && m.vigente).length;
        
        setStats({
          totalMiembros: miembrosData.length,
          miembrosActivos: activosCount,
          documentosTotal: 0, // TODO: Implementar cuando tengas documentos
          proximasTenidas: 0, // TODO: Implementar cuando tengas programas
          loading: false,
        });
      } else {
        // Si no hay datos, usar valores por defecto
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
      
      // ✅ En caso de error, mostrar datos por defecto
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

  const renderStatsCard = (icon, title, value, subtitle, onPress, color = colors.primary) => (
    <TouchableOpacity style={styles.statsCard} onPress={onPress}>
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

  if (stats.loading) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <ScrollView style={globalStyles.padding}>
          <LoadingCard height={120} />
          <View style={styles.statsGrid}>
            <LoadingCard height={100} width="48%" />
            <LoadingCard height={100} width="48%" />
            <LoadingCard height={100} width="48%" />
            <LoadingCard height={100} width="48%" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView
        style={globalStyles.padding}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Saludo personalizado */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Bienvenido,</Text>
          <Text style={styles.userName}>
            {user?.member_full_name || user?.username || 'Usuario'}
          </Text>
          <Text style={styles.userGrado}>
            Grado: {user?.grado?.toUpperCase() || 'N/A'}
          </Text>
          {user?.role && (
            <Text style={styles.userRole}>
              Rol: {user.role.toUpperCase()}
            </Text>
          )}
        </View>

        {/* Estadísticas */}
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
            'Ver todos',
            () => {
              // TODO: navigation.navigate('Documentos') cuando esté implementado
              console.log('Navegando a Documentos - TODO');
            },
            colors.companero
          )}
          
          {renderStatsCard(
            'calendar-today',
            'Programas',
            stats.proximasTenidas,
            'Próximas tenidas',
            () => {
              // TODO: navigation.navigate('Programas') cuando esté implementado
              console.log('Navegando a Programas - TODO');
            },
            colors.maestro
          )}
          
          {renderStatsCard(
            'insights',
            'Estadísticas',
            '100%',
            'Ver reportes',
            () => {
              console.log('Navegando a Estadísticas - TODO');
            },
            colors.primary
          )}
        </View>

        {/* Accesos rápidos */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Miembros', { 
              screen: 'MiembroForm'
            })}
          >
            <Icon name="person-add" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Nuevo Miembro</Text>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {
              console.log('Subir Documento - TODO');
            }}
          >
            <Icon name="upload-file" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Subir Documento</Text>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {
              console.log('Nueva Tenida - TODO');
            }}
          >
            <Icon name="event" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Nueva Tenida</Text>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Miembros recientes - ✅ Con verificación de datos */}
        {Array.isArray(miembros) && miembros.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Miembros Recientes</Text>
            {miembros.slice(0, 3).map((miembro) => {
              // ✅ Verificar que miembro existe y tiene propiedades necesarias
              if (!miembro || !miembro.id) return null;
              
              return (
                <TouchableOpacity
                  key={miembro.id}
                  style={styles.recentItem}
                  onPress={() => navigation.navigate('Miembros', {
                    screen: 'MiembroDetail',
                    params: { miembro }
                  })}
                >
                  <View style={styles.recentAvatar}>
                    <Text style={styles.recentAvatarText}>
                      {(miembro.nombres || 'N').charAt(0)}
                      {(miembro.apellidos || 'N').charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName}>
                      {miembro.nombres || 'Sin nombre'} {miembro.apellidos || ''}
                    </Text>
                    <Text style={styles.recentGrado}>
                      {(miembro.grado || 'N/A').toUpperCase()}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Mensaje si no hay miembros */}
        {(!Array.isArray(miembros) || miembros.length === 0) && (
          <View style={styles.emptySection}>
            <Icon name="people-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>
              No hay miembros cargados
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadDashboardData}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  welcomeCard: {
    ...globalStyles.card,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  userGrado: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userRole: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.background,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recentGrado: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptySection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
});

export default DashboardScreen;