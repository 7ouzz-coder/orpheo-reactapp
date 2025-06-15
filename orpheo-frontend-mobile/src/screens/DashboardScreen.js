import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          onPress: () => navigation.navigate('Welcome'),
          style: 'destructive' 
        },
      ]
    );
  };

  const showComingSoon = (feature) => {
    Alert.alert('Próximamente', `La función "${feature}" estará disponible pronto.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenido</Text>
          <Text style={styles.userName}>H∴ Usuario Demo</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              onPress={() => showComingSoon('Programas')}
            >
              <Ionicons name="calendar-outline" size={32} color="#D4AF37" />
              <Text style={styles.actionText}>Programas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => showComingSoon('Documentos')}
            >
              <Ionicons name="document-text-outline" size={32} color="#D4AF37" />
              <Text style={styles.actionText}>Documentos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => showComingSoon('Miembros')}
            >
              <Ionicons name="people-outline" size={32} color="#D4AF37" />
              <Text style={styles.actionText}>Miembros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => showComingSoon('Mi Perfil')}
            >
              <Ionicons name="person-outline" size={32} color="#D4AF37" />
              <Text style={styles.actionText}>Mi Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          
          <View style={styles.activityItem}>
            <Ionicons name="document" size={20} color="#10B981" />
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Nuevo documento subido</Text>
              <Text style={styles.activityTime}>Hace 2 horas</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Ionicons name="calendar" size={20} color="#3B82F6" />
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Próxima tenida programada</Text>
              <Text style={styles.activityTime}>En 3 días</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Ionicons name="people" size={20} color="#F59E0B" />
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Nuevo miembro iniciado</Text>
              <Text style={styles.activityTime}>Hace 1 semana</Text>
            </View>
          </View>
        </View>

        {/* Lodge Info */}
        <View style={styles.lodgeInfo}>
          <Text style={styles.lodgeTitle}>Logia Orpheo</Text>
          <Text style={styles.lodgeSubtitle}>Fundada en 1923 • Gran Logia de Chile</Text>
          <Text style={styles.lodgeMotto}>Libertad • Igualdad • Fraternidad</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#7A6F63',
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
  content: {
    flex: 1,
    padding: 16,
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#7A6F63',
    gap: 12,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    color: '#A59F99',
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    color: '#7A6F63',
    fontSize: 12,
    marginTop: 2,
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