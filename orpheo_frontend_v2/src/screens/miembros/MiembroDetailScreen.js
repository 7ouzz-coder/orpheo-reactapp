import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Styles
import { colors, getGradoColor, getEstadoColor } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

const MiembroDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { miembro } = route.params;

  // Funciones de utilidad
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const handleCall = (telefono) => {
    if (telefono) {
      Linking.openURL(`tel:${telefono}`);
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleEdit = () => {
    navigation.navigate('MiembroForm', { miembro });
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Miembro',
      `¿Estás seguro de que quieres eliminar a ${miembro.nombres} ${miembro.apellidos}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar eliminación
            Alert.alert('Función pendiente', 'La eliminación será implementada próximamente');
          }
        },
      ]
    );
  };

  // Componente de información
  const InfoRow = ({ icon, label, value, onPress, actionIcon }) => (
    <TouchableOpacity 
      style={styles.infoRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.infoIcon}>
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'No especificado'}</Text>
      </View>
      {actionIcon && (
        <Icon name={actionIcon} size={20} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header del miembro */}
        <View style={styles.memberHeader}>
          <View style={styles.avatarContainer}>
            <Icon 
              name="account-circle" 
              size={80} 
              color={getGradoColor(miembro.grado)} 
            />
          </View>
          
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {miembro.nombres} {miembro.apellidos}
            </Text>
            <Text style={styles.memberEmail}>{miembro.email}</Text>
            
            <View style={styles.badges}>
              <View style={[styles.gradeBadge, { backgroundColor: getGradoColor(miembro.grado) + '20' }]}>
                <Text style={[styles.gradeText, { color: getGradoColor(miembro.grado) }]}>
                  {miembro.grado?.toUpperCase() || 'MIEMBRO'}
                </Text>
              </View>
              <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(miembro.estado) + '20' }]}>
                <Text style={[styles.estadoText, { color: getEstadoColor(miembro.estado) }]}>
                  {miembro.estado?.toUpperCase() || 'ACTIVO'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCall(miembro.telefono)}
          >
            <Icon name="phone" size={20} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>Llamar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEmail(miembro.email)}
          >
            <Icon name="email" size={20} color={colors.info} />
            <Text style={[styles.actionText, { color: colors.info }]}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleEdit}
          >
            <Icon name="pencil" size={20} color={colors.warning} />
            <Text style={[styles.actionText, { color: colors.warning }]}>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDelete}
          >
            <Icon name="delete" size={20} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        {/* Información personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={globalStyles.card}>
            <InfoRow
              icon="card-account-details"
              label="RUT"
              value={miembro.rut}
            />
            <InfoRow
              icon="phone"
              label="Teléfono"
              value={miembro.telefono}
              onPress={() => handleCall(miembro.telefono)}
              actionIcon="phone"
            />
            <InfoRow
              icon="email"
              label="Email"
              value={miembro.email}
              onPress={() => handleEmail(miembro.email)}
              actionIcon="email"
            />
            <InfoRow
              icon="home"
              label="Dirección"
              value={miembro.direccion}
            />
            <InfoRow
              icon="calendar"
              label="Fecha de Nacimiento"
              value={formatDate(miembro.fecha_nacimiento)}
            />
          </View>
        </View>

        {/* Información masónica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Masónica</Text>
          <View style={globalStyles.card}>
            <InfoRow
              icon="compass"
              label="Grado"
              value={miembro.grado}
            />
            <InfoRow
              icon="calendar-plus"
              label="Fecha de Iniciación"
              value={formatDate(miembro.fecha_iniciacion)}
            />
            <InfoRow
              icon="calendar-check"
              label="Fecha de Exaltación"
              value={formatDate(miembro.fecha_exaltacion)}
            />
            <InfoRow
              icon="account-star"
              label="Padrino"
              value={miembro.padrino}
            />
            <InfoRow
              icon="information"
              label="Estado"
              value={miembro.estado}
            />
          </View>
        </View>

        {/* Información profesional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Profesional</Text>
          <View style={globalStyles.card}>
            <InfoRow
              icon="briefcase"
              label="Profesión"
              value={miembro.profesion}
            />
            <InfoRow
              icon="domain"
              label="Empresa"
              value={miembro.empresa}
            />
            <InfoRow
              icon="school"
              label="Educación"
              value={miembro.educacion}
            />
          </View>
        </View>

        {/* Información adicional */}
        {(miembro.observaciones || miembro.created_at) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>
            <View style={globalStyles.card}>
              {miembro.observaciones && (
                <InfoRow
                  icon="note-text"
                  label="Observaciones"
                  value={miembro.observaciones}
                />
              )}
              <InfoRow
                icon="calendar-clock"
                label="Fecha de Registro"
                value={formatDate(miembro.created_at)}
              />
              {miembro.updated_at && (
                <InfoRow
                  icon="update"
                  label="Última Actualización"
                  value={formatDate(miembro.updated_at)}
                />
              )}
            </View>
          </View>
        )}

        {/* Espaciado final */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  memberHeader: {
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  memberInfo: {
    alignItems: 'center',
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  memberEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
});

export default MiembroDetailScreen;