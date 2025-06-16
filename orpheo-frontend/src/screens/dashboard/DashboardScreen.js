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
  const miembros = useSelector(selectMiembros);
  
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
      // Cargar miembros para obtener estadísticas reales
      const result = await dispatch(getMiembros({ page: 1, limit: 100 }));
      
      if (result.payload) {
        const miembrosData = result.payload.data;
        const activosCount = miembrosData.filter(m => m.vigente).length;
        
        setStats({
          totalMiembros: miembrosData.length,
          miembrosActivos: activosCount,
          documentosTotal: 0, // Implementar cuando tengas documentos
          proximasTenidas: 0, // Implementar cuando tengas programas
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Saludo personalizado */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Bienvenido,</Text>
          <Text style={styles.userName}>
            {user?.member_full_name || user?.username}
          </Text>
          <Text style={styles.userGrado}>
            Grado: {user?.grado?.toUpperCase()}
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
            () => {}, // navigation.navigate('Documentos') cuando esté implementado
            colors.companero
          )}
          
          {renderStatsCard(
            'calendar-today',
            'Programas',
            stats.proximasTenidas,
            'Próximas tenidas',
            () => {}, // navigation.navigate('Programas') cuando esté implementado
            colors.maestro
          )}
          
          {renderStatsCard(
            'insights',
            'Estadísticas',
            '100%',
            'Ver reportes',
            () => {},
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
              // navigation.navigate('Documentos', { screen: 'DocumentoUpload' })
            }}
          >
            <Icon name="upload-file" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Subir Documento</Text>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {
              // navigation.navigate('Programas', { screen: 'ProgramaForm' })
            }}
          >
            <Icon name="event" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Nueva Tenida</Text>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Miembros recientes */}
        {miembros.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Miembros Recientes</Text>
            {miembros.slice(0, 3).map((miembro) => (
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
                    {miembro.nombres?.charAt(0)}{miembro.apellidos?.charAt(0)}
                  </Text>
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>
                    {miembro.nombres} {miembro.apellidos}
                  </Text>
                  <Text style={styles.recentGrado}>
                    {miembro.grado?.toUpperCase()}
                  </Text>
                </View>
                <Icon name="chevron-right" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
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
});

export default DashboardScreen;