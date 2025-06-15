import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';
import { useMainTabNavigation } from '@/navigation';
import { 
  ProfileHeader, 
  Card, 
  StatsCard, 
  Button, 
  Loading 
} from '@/components/common';
import { theme } from '@/utils/theme';
import { formatDate, getRelativeTime } from '@/utils/helpers';

interface DashboardStats {
  proximosEventos: number;
  documentosPendientes: number;
  asistenciaPendiente: number;
  ultimaActividad: string;
}

const DashboardScreen: React.FC = () => {
  const { user, userDisplayName, userInitials, logout } = useAuth();
  const navigation = useMainTabNavigation();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    proximosEventos: 0,
    documentosPendientes: 0,
    asistenciaPendiente: 0,
    ultimaActividad: new Date().toISOString(),
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Simular carga de datos del dashboard
      // En la implementación real, aquí harías llamadas a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        proximosEventos: 3,
        documentosPendientes: 5,
        asistenciaPendiente: 2,
        ultimaActividad: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const navigateToProgramas = () => {
    navigation.navigate('Programas');
  };

  const navigateToDocumentos = () => {
    navigation.navigate('Documentos');
  };

  const navigateToMiembros = () => {
    navigation.navigate('Miembros');
  };

  if (isLoading) {
    return (
      <Loading
        fullScreen
        text="Cargando dashboard..."
        size="large"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader
        title="Dashboard"
        userName={userDisplayName}
        userInitials={userInitials}
        notificationCount={stats.documentosPendientes + stats.asistenciaPendiente}
        onProfilePress={() => navigation.navigate('Perfil')}
        onNotificationPress={() => {
          // Navegar a notificaciones o mostrar modal
          console.log('Show notifications');
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.gold}
            colors={[theme.colors.gold]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Bienvenida */}
        <Card style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>
                Bienvenido, H∴ {userDisplayName}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {user?.grado && `Grado: ${user.grado.charAt(0).toUpperCase() + user.grado.slice(1)}`}
              </Text>
              {user?.cargo && (
                <Text style={styles.welcomeCargo}>
                  {user.cargo.replace('_', ' ').charAt(0).toUpperCase() + user.cargo.slice(1)}
                </Text>
              )}
            </View>
            <View style={styles.lodgeSymbol}>
              <Ionicons
                name="business"
                size={40}
                color={theme.colors.gold}
              />
            </View>
          </View>
        </Card>

        {/* Estadísticas principales */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="Próximos Eventos"
            value={stats.proximosEventos}
            subtitle="Este mes"
            icon={
              <Ionicons
                name="calendar"
                size={24}
                color={theme.colors.info}
              />
            }
            color={theme.colors.info}
            trend="up"
            trendValue="+2"
            onPress={navigateToProgramas}
          />

          <StatsCard
            title="Documentos"
            value={stats.documentosPendientes}
            subtitle="Pendientes"
            icon={
              <Ionicons
                name="document-text"
                size={24}
                color={theme.colors.warning}
              />
            }
            color={theme.colors.warning}
            onPress={navigateToDocumentos}
          />
        </View>

        {/* Acciones rápidas */}
        <Card style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={navigateToProgramas}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={theme.colors.gold}
                />
              </View>
              <Text style={styles.quickActionText}>Programas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={navigateToDocumentos}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={28}
                  color={theme.colors.gold}
                />
              </View>
              <Text style={styles.quickActionText}>Documentos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={navigateToMiembros}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="people-outline"
                  size={28}
                  color={theme.colors.gold}
                />
              </View>
              <Text style={styles.quickActionText}>Miembros</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('Perfil')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="person-outline"
                  size={28}
                  color={theme.colors.gold}
                />
              </View>
              <Text style={styles.quickActionText}>Mi Perfil</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Actividad reciente */}
        <Card style={styles.activityCard}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          
          <View style={styles.activityItem}>
            <Ionicons
              name="document"
              size={20}
              color={theme.colors.info}
            />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>
                Nuevo documento: "Acta Tenida Ordinaria"
              </Text>
              <Text style={styles.activityTime}>
                {getRelativeTime(stats.ultimaActividad)}
              </Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <Ionicons
              name="calendar"
              size={20}
              color={theme.colors.success}
            />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>
                Próxima Tenida: {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'dd/MM')}
              </Text>
              <Text style={styles.activityTime}>
                Confirma tu asistencia
              </Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <Ionicons
              name="people"
              size={20}
              color={theme.colors.warning}
            />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>
                Nuevo miembro iniciado
              </Text>
              <Text style={styles.activityTime}>
                {getRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))}
              </Text>
            </View>
          </View>
        </Card>

        {/* Información de la logia */}
        <Card style={styles.lodgeInfoCard}>
          <Text style={styles.sectionTitle}>Logia Orpheo</Text>
          
          <View style={styles.lodgeInfo}>
            <Text style={styles.lodgeInfoText}>
              Fundada en 1923 • Gran Logia de Chile
            </Text>
            <Text style={styles.lodgeInfoSubtext}>
              Libertad • Igualdad • Fraternidad
            </Text>
          </View>
        </Card>

        {/* Botón de logout temporal (para desarrollo) */}
        {__DEV__ && (
          <Button
            title="Cerrar Sesión (Dev)"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  
  welcomeCard: {
    marginBottom: theme.spacing.lg,
  },
  
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  welcomeText: {
    flex: 1,
  },
  
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gold,
    marginBottom: theme.spacing.xs,
  },
  
  welcomeSubtitle: {
    fontSize: 14,
    color: theme.colors.grayText,
    marginBottom: 2,
  },
  
  welcomeCargo: {
    fontSize: 12,
    color: theme.colors.grayBorder,
    fontStyle: 'italic',
  },
  
  lodgeSymbol: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${theme.colors.gold}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  
  quickActionsCard: {
    marginBottom: theme.spacing.lg,
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  
  quickActionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
  },
  
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${theme.colors.gold}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  quickActionText: {
    fontSize: 12,
    color: theme.colors.grayText,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  activityCard: {
    marginBottom: theme.spacing.lg,
  },
  
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayBorder,
    gap: theme.spacing.sm,
  },
  
  activityContent: {
    flex: 1,
  },
  
  activityTitle: {
    fontSize: 14,
    color: theme.colors.grayText,
    fontWeight: '500',
    marginBottom: 2,
  },
  
  activityTime: {
    fontSize: 12,
    color: theme.colors.grayBorder,
  },
  
  lodgeInfoCard: {
    marginBottom: theme.spacing.lg,
  },
  
  lodgeInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  
  lodgeInfoText: {
    fontSize: 14,
    color: theme.colors.grayText,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  
  lodgeInfoSubtext: {
    fontSize: 12,
    color: theme.colors.gold,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  logoutButton: {
    marginTop: theme.spacing.lg,
  },
});

export default DashboardScreen;