import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Redux
import { 
  selectUser, 
  selectUserDisplayName,
  selectUserRole,
  selectUserGrade,
  logout,
  updateUser 
} from '../../store/slices/authSlice';
import { 
  setTheme,
  selectTheme,
  selectLanguage,
  setLanguage 
} from '../../store/slices/uiSlice';

// Styles
import { colors, getGradoColor } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const user = useSelector(selectUser);
  const userName = useSelector(selectUserDisplayName);
  const userRole = useSelector(selectUserRole);
  const userGrade = useSelector(selectUserGrade);
  const theme = useSelector(selectTheme);
  const language = useSelector(selectLanguage);
  
  // Local state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Manejar logout
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Cambiar tema
  const handleThemeChange = () => {
    const options = ['Cancelar', 'Claro', 'Oscuro'];
    const cancelButtonIndex = 0;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Seleccionar Tema',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            dispatch(setTheme('light'));
          } else if (buttonIndex === 2) {
            dispatch(setTheme('dark'));
          }
        }
      );
    } else {
      Alert.alert(
        'Seleccionar Tema',
        'Elige el tema de la aplicación',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Claro', onPress: () => dispatch(setTheme('light')) },
          { text: 'Oscuro', onPress: () => dispatch(setTheme('dark')) },
        ]
      );
    }
  };

  // Cambiar idioma
  const handleLanguageChange = () => {
    const options = ['Cancelar', 'Español', 'English'];
    const cancelButtonIndex = 0;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Seleccionar Idioma',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            dispatch(setLanguage('es'));
          } else if (buttonIndex === 2) {
            dispatch(setLanguage('en'));
          }
        }
      );
    } else {
      Alert.alert(
        'Seleccionar Idioma',
        'Elige el idioma de la aplicación',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Español', onPress: () => dispatch(setLanguage('es')) },
          { text: 'English', onPress: () => dispatch(setLanguage('en')) },
        ]
      );
    }
  };

  // Componente de opción de menú
  const MenuOption = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent, 
    showChevron = true,
    color = colors.text 
  }) => (
    <TouchableOpacity
      style={styles.menuOption}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuOptionLeft}>
        <Icon name={icon} size={24} color={color} />
        <View style={styles.menuOptionText}>
          <Text style={[styles.menuOptionTitle, { color }]}>{title}</Text>
          {subtitle && (
            <Text style={styles.menuOptionSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.menuOptionRight}>
        {rightComponent || (showChevron && (
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header del perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon 
              name="account-circle" 
              size={80} 
              color={getGradoColor(userGrade)} 
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={16} color={colors.background} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            
            <View style={styles.userBadges}>
              <View style={[styles.gradeBadge, { backgroundColor: getGradoColor(userGrade) + '20' }]}>
                <Text style={[styles.gradeText, { color: getGradoColor(userGrade) }]}>
                  {userGrade?.toUpperCase() || 'MIEMBRO'}
                </Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{userRole}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={globalStyles.card}>
            <MenuOption
              icon="account-edit"
              title="Editar Perfil"
              subtitle="Actualizar información personal"
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            />
            
            <MenuOption
              icon="lock"
              title="Cambiar Contraseña"
              subtitle="Actualizar contraseña de acceso"
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            />
            
            <MenuOption
              icon="phone"
              title="Contacto"
              subtitle={user?.telefono || 'No configurado'}
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            />
          </View>
        </View>

        {/* Configuraciones de la app */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuraciones</Text>
          
          <View style={globalStyles.card}>
            <MenuOption
              icon="palette"
              title="Tema"
              subtitle={theme === 'dark' ? 'Oscuro' : 'Claro'}
              onPress={handleThemeChange}
            />
            
            <MenuOption
              icon="translate"
              title="Idioma"
              subtitle={language === 'es' ? 'Español' : 'English'}
              onPress={handleLanguageChange}
            />
            
            <MenuOption
              icon="bell"
              title="Notificaciones"
              subtitle="Recibir notificaciones push"
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
                />
              }
              showChevron={false}
            />
            
            <MenuOption
              icon="fingerprint"
              title="Autenticación Biométrica"
              subtitle="Usar huella o Face ID"
              rightComponent={
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={biometricEnabled ? colors.primary : colors.textMuted}
                />
              }
              showChevron={false}
            />
          </View>
        </View>

        {/* Información de la app */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplicación</Text>
          
          <View style={globalStyles.card}>
            <MenuOption
              icon="information"
              title="Acerca de"
              subtitle="Versión 1.0.0"
              onPress={() => Alert.alert(
                'Orpheo v1.0.0',
                'Sistema de Gestión Masónica\n\nDesarrollado para la administración eficiente de logias masónicas.\n\n© 2025 Orpheo Project'
              )}
            />
            
            <MenuOption
              icon="help-circle"
              title="Ayuda y Soporte"
              subtitle="Obtener ayuda"
              onPress={() => Alert.alert('Soporte', 'Para soporte técnico, contacta al administrador del sistema.')}
            />
            
            <MenuOption
              icon="shield-check"
              title="Política de Privacidad"
              subtitle="Términos y condiciones"
              onPress={() => Alert.alert('Privacidad', 'Toda la información está protegida según las políticas de la logia.')}
            />
            
            <MenuOption
              icon="update"
              title="Buscar Actualizaciones"
              subtitle="Verificar nuevas versiones"
              onPress={() => Alert.alert('Actualizaciones', 'Estás usando la versión más reciente.')}
            />
          </View>
        </View>

        {/* Botón de logout */}
        <View style={styles.section}>
          <View style={globalStyles.card}>
            <MenuOption
              icon="logout"
              title="Cerrar Sesión"
              subtitle="Salir de la aplicación"
              onPress={handleLogout}
              color={colors.error}
              showChevron={false}
            />
          </View>
        </View>

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
  profileHeader: {
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  userBadges: {
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
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.info + '20',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.info,
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
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuOptionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuOptionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  menuOptionRight: {
    marginLeft: 16,
  },
});

export default ProfileScreen;