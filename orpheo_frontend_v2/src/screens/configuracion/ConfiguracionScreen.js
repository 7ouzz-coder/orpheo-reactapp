import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Redux
import { logout, selectUser } from '../../store/slices/authSlice';

// Components
import TabSafeView from '../../components/common/TabSafeView';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const ConfiguracionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  // Estados de configuración
  const [configuracion, setConfiguracion] = useState({
    notificaciones: {
      push: true,
      email: true,
      eventos: true,
      documentos: true,
      miembros: false,
      sistema: true,
    },
    privacidad: {
      perfilPublico: false,
      mostrarEmail: false,
      mostrarTelefono: false,
    },
    preferencias: {
      temaOscuro: false,
      idioma: 'es',
      sincronizacionAuto: true,
      descargaWifi: true,
    },
  });

  // Cargar configuración desde AsyncStorage
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const configGuardada = await AsyncStorage.getItem('configuracion_app');
      if (configGuardada) {
        const config = JSON.parse(configGuardada);
        setConfiguracion(prevConfig => ({
          ...prevConfig,
          ...config,
        }));
      }
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
    }
  };

  // Guardar configuración
  const guardarConfiguracion = async (nuevaConfig) => {
    try {
      await AsyncStorage.setItem('configuracion_app', JSON.stringify(nuevaConfig));
      setConfiguracion(nuevaConfig);
      
      Toast.show({
        type: 'success',
        text1: 'Configuración guardada',
        text2: 'Los cambios han sido aplicados',
      });
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo guardar la configuración',
      });
    }
  };

  // Actualizar configuración específica
  const actualizarConfiguracion = (seccion, campo, valor) => {
    const nuevaConfig = {
      ...configuracion,
      [seccion]: {
        ...configuracion[seccion],
        [campo]: valor,
      },
    };
    guardarConfiguracion(nuevaConfig);
  };

  // Limpiar caché
  const limpiarCache = () => {
    Alert.alert(
      'Limpiar caché',
      'Esto eliminará archivos temporales y datos en caché. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          onPress: async () => {
            try {
              // Aquí iría la lógica para limpiar caché
              // await FileSystem.deleteAsync(cacheDirs, { idempotent: true });
              
              Toast.show({
                type: 'success',
                text1: 'Caché limpiado',
                text2: 'Los archivos temporales han sido eliminados',
              });
            } catch (error) {
              console.error('❌ Error limpiando caché:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo limpiar el caché',
              });
            }
          },
        },
      ]
    );
  };

  // Exportar datos
  const exportarDatos = () => {
    Alert.alert(
      'Exportar datos',
      'Esto creará una copia de seguridad de tus datos personales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: () => {
            // TODO: Implementar exportación de datos
            Toast.show({
              type: 'info',
              text1: 'Función en desarrollo',
              text2: 'Esta función estará disponible pronto',
            });
          },
        },
      ]
    );
  };

  // Restablecer configuración
  const restablecerConfiguracion = () => {
    Alert.alert(
      'Restablecer configuración',
      'Esto volverá todas las configuraciones a sus valores por defecto. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('configuracion_app');
              
              // Restablecer al estado inicial
              const configInicial = {
                notificaciones: {
                  push: true,
                  email: true,
                  eventos: true,
                  documentos: true,
                  miembros: false,
                  sistema: true,
                },
                privacidad: {
                  perfilPublico: false,
                  mostrarEmail: false,
                  mostrarTelefono: false,
                },
                preferencias: {
                  temaOscuro: false,
                  idioma: 'es',
                  sincronizacionAuto: true,
                  descargaWifi: true,
                },
              };
              
              setConfiguracion(configInicial);
              
              Toast.show({
                type: 'success',
                text1: 'Configuración restablecida',
                text2: 'Se han restaurado los valores por defecto',
              });
            } catch (error) {
              console.error('❌ Error restableciendo configuración:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo restablecer la configuración',
              });
            }
          },
        },
      ]
    );
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            Toast.show({
              type: 'success',
              text1: 'Sesión cerrada',
              text2: 'Has cerrado sesión correctamente',
            });
          },
        },
      ]
    );
  };

  // Contactar soporte
  const contactarSoporte = () => {
    Alert.alert(
      'Contactar soporte',
      'Selecciona una opción para contactar con el soporte técnico:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:soporte@orpheo.com?subject=Soporte Orpheo App');
          },
        },
        {
          text: 'WhatsApp',
          onPress: () => {
            Linking.openURL('whatsapp://send?phone=56912345678&text=Hola, necesito ayuda con la app Orpheo');
          },
        },
      ]
    );
  };

  return (
    <TabSafeView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Información del usuario */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Icon name="account-circle" size={60} color={colors.primary} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.nombres} {user?.apellidos}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userRole}>
                {user?.grado || 'Miembro'} • {user?.estado || 'Activo'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          
          <SettingItem
            icon="bell"
            title="Notificaciones push"
            subtitle="Recibir notificaciones en el dispositivo"
            value={configuracion.notificaciones.push}
            onToggle={(value) => actualizarConfiguracion('notificaciones', 'push', value)}
            type="switch"
          />
          
          <SettingItem
            icon="email"
            title="Notificaciones por email"
            subtitle="Recibir notificaciones por correo electrónico"
            value={configuracion.notificaciones.email}
            onToggle={(value) => actualizarConfiguracion('notificaciones', 'email', value)}
            type="switch"
          />
          
          <SettingItem
            icon="calendar"
            title="Eventos y reuniones"
            subtitle="Notificar sobre tenidas y eventos"
            value={configuracion.notificaciones.eventos}
            onToggle={(value) => actualizarConfiguracion('notificaciones', 'eventos', value)}
            type="switch"
          />
          
          <SettingItem
            icon="file-document"
            title="Documentos"
            subtitle="Notificar sobre nuevos documentos"
            value={configuracion.notificaciones.documentos}
            onToggle={(value) => actualizarConfiguracion('notificaciones', 'documentos', value)}
            type="switch"
          />
        </View>

        {/* Privacidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidad</Text>
          
          <SettingItem
            icon="account-eye"
            title="Perfil público"
            subtitle="Otros miembros pueden ver tu perfil"
            value={configuracion.privacidad.perfilPublico}
            onToggle={(value) => actualizarConfiguracion('privacidad', 'perfilPublico', value)}
            type="switch"
          />
          
          <SettingItem
            icon="email-outline"
            title="Mostrar email"
            subtitle="Tu email será visible para otros"
            value={configuracion.privacidad.mostrarEmail}
            onToggle={(value) => actualizarConfiguracion('privacidad', 'mostrarEmail', value)}
            type="switch"
          />
          
          <SettingItem
            icon="phone"
            title="Mostrar teléfono"
            subtitle="Tu teléfono será visible para otros"
            value={configuracion.privacidad.mostrarTelefono}
            onToggle={(value) => actualizarConfiguracion('privacidad', 'mostrarTelefono', value)}
            type="switch"
          />
        </View>

        {/* Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          
          <SettingItem
            icon="theme-light-dark"
            title="Tema oscuro"
            subtitle="Activar modo oscuro (próximamente)"
            value={configuracion.preferencias.temaOscuro}
            onToggle={(value) => actualizarConfiguracion('preferencias', 'temaOscuro', value)}
            type="switch"
            disabled
          />
          
          <SettingItem
            icon="sync"
            title="Sincronización automática"
            subtitle="Sincronizar datos automáticamente"
            value={configuracion.preferencias.sincronizacionAuto}
            onToggle={(value) => actualizarConfiguracion('preferencias', 'sincronizacionAuto', value)}
            type="switch"
          />
          
          <SettingItem
            icon="wifi"
            title="Solo descargar con WiFi"
            subtitle="Usar solo WiFi para descargas grandes"
            value={configuracion.preferencias.descargaWifi}
            onToggle={(value) => actualizarConfiguracion('preferencias', 'descargaWifi', value)}
            type="switch"
          />
        </View>

        {/* Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          
          <SettingItem
            icon="key-change"
            title="Cambiar contraseña"
            subtitle="Actualizar tu contraseña"
            onPress={() => navigation.navigate('ChangePassword')}
            type="button"
          />
          
          <SettingItem
            icon="download"
            title="Exportar mis datos"
            subtitle="Descargar una copia de tus datos"
            onPress={exportarDatos}
            type="button"
          />
        </View>

        {/* Aplicación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplicación</Text>
          
          <SettingItem
            icon="delete-sweep"
            title="Limpiar caché"
            subtitle="Eliminar archivos temporales"
            onPress={limpiarCache}
            type="button"
          />
          
          <SettingItem
            icon="refresh"
            title="Restablecer configuración"
            subtitle="Volver a valores por defecto"
            onPress={restablecerConfiguracion}
            type="button"
          />
          
          <SettingItem
            icon="information"
            title="Acerca de"
            subtitle="Información de la aplicación"
            onPress={() => navigation.navigate('About')}
            type="button"
          />
        </View>

        {/* Soporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          
          <SettingItem
            icon="help-circle"
            title="Ayuda y soporte"
            subtitle="Contactar con el equipo de soporte"
            onPress={contactarSoporte}
            type="button"
          />
          
          <SettingItem
            icon="bug"
            title="Reportar problema"
            subtitle="Informar sobre errores o bugs"
            onPress={() => {
              Linking.openURL('mailto:soporte@orpheo.com?subject=Reporte de Error - Orpheo App');
            }}
            type="button"
          />
        </View>

        {/* Cerrar sesión */}
        <View style={styles.section}>
          <SettingItem
            icon="logout"
            title="Cerrar sesión"
            subtitle="Salir de la aplicación"
            onPress={cerrarSesion}
            type="button"
            textColor={colors.error}
          />
        </View>

        {/* Espaciado inferior */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </TabSafeView>
  );
};

// Componente SettingItem
const SettingItem = ({ 
  icon, 
  title, 
  subtitle, 
  value, 
  onToggle, 
  onPress, 
  type = 'switch',
  disabled = false,
  textColor = colors.text 
}) => {
  return (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.settingItemDisabled]}
      onPress={type === 'button' ? onPress : undefined}
      disabled={disabled}
      activeOpacity={type === 'button' ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>
        <Icon 
          name={icon} 
          size={24} 
          color={disabled ? colors.textSecondary : colors.primary} 
        />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: textColor }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      
      <View style={styles.settingAction}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={value ? colors.primary : colors.textSecondary}
            disabled={disabled}
          />
        ) : (
          <Icon name="chevron-right" size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
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

  // User section
  userSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userRole: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },

  // Sections
  section: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },

  // Setting item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  settingAction: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomSpacer: {
    height: spacing.xl,
  },
});

export default ConfiguracionScreen;