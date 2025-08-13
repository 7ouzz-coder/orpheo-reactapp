import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
} from 'react-native';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import TabSafeView from '../../components/common/TabSafeView';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const AboutScreen = ({ navigation }) => {

  // Información de la app
  const appInfo = {
    name: 'Orpheo',
    version: Constants.expoConfig?.version || '1.0.0',
    buildNumber: Constants.expoConfig?.android?.versionCode || Constants.expoConfig?.ios?.buildNumber || '1',
    description: 'Aplicación oficial para la gestión de logias masónicas',
    developer: 'Equipo de Desarrollo Orpheo',
    website: 'https://orpheo.com',
    supportEmail: 'soporte@orpheo.com',
    privacyPolicy: 'https://orpheo.com/privacy',
    termsOfService: 'https://orpheo.com/terms',
  };

  // Funcionalidades principales
  const features = [
    {
      icon: 'account-group',
      title: 'Gestión de Miembros',
      description: 'Administra la información de todos los miembros de la logia',
    },
    {
      icon: 'file-document-multiple',
      title: 'Biblioteca Digital',
      description: 'Accede y gestiona documentos, rituales y planchas',
    },
    {
      icon: 'calendar-clock',
      title: 'Eventos y Tenidas',
      description: 'Mantente informado sobre reuniones y eventos',
    },
    {
      icon: 'bell-ring',
      title: 'Notificaciones',
      description: 'Recibe avisos importantes en tiempo real',
    },
    {
      icon: 'shield-check',
      title: 'Seguridad',
      description: 'Protección avanzada de datos con encriptación',
    },
    {
      icon: 'cloud-sync',
      title: 'Sincronización',
      description: 'Datos sincronizados en todos tus dispositivos',
    },
  ];

  // Equipo de desarrollo
  const team = [
    {
      name: 'Carlos Mendoza',
      role: 'Product Manager',
      avatar: null,
    },
    {
      name: 'Ana Rodríguez',
      role: 'Lead Developer',
      avatar: null,
    },
    {
      name: 'Roberto Silva',
      role: 'UI/UX Designer',
      avatar: null,
    },
    {
      name: 'María Vásquez',
      role: 'Backend Developer',
      avatar: null,
    },
  ];

  // Enlaces útiles
  const links = [
    {
      icon: 'web',
      title: 'Sitio Web',
      subtitle: appInfo.website,
      onPress: () => Linking.openURL(appInfo.website),
    },
    {
      icon: 'email',
      title: 'Soporte Técnico',
      subtitle: appInfo.supportEmail,
      onPress: () => Linking.openURL(`mailto:${appInfo.supportEmail}`),
    },
    {
      icon: 'shield-account',
      title: 'Política de Privacidad',
      subtitle: 'Cómo protegemos tus datos',
      onPress: () => Linking.openURL(appInfo.privacyPolicy),
    },
    {
      icon: 'file-document',
      title: 'Términos de Servicio',
      subtitle: 'Condiciones de uso',
      onPress: () => Linking.openURL(appInfo.termsOfService),
    },
  ];

  // Información técnica
  const technicalInfo = [
    { label: 'Versión', value: appInfo.version },
    { label: 'Build', value: appInfo.buildNumber },
    { label: 'Plataforma', value: Constants.platform?.ios ? 'iOS' : 'Android' },
    { label: 'SDK Version', value: Constants.expoConfig?.sdkVersion || 'N/A' },
    { label: 'Fecha de build', value: new Date().toLocaleDateString('es-ES') },
  ];

  return (
    <TabSafeView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header de la app */}
        <View style={styles.appHeader}>
          <View style={styles.appLogo}>
            <Icon name="temple-buddhist" size={80} color={colors.primary} />
          </View>
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appVersion}>Versión {appInfo.version}</Text>
          <Text style={styles.appDescription}>{appInfo.description}</Text>
        </View>

        {/* Funcionalidades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon name={feature.icon} size={32} color={colors.primary} />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Equipo de desarrollo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipo de Desarrollo</Text>
          <Text style={styles.sectionSubtitle}>
            Conoce a las personas que hacen posible Orpheo
          </Text>
          <View style={styles.teamGrid}>
            {team.map((member, index) => (
              <View key={index} style={styles.teamMember}>
                <View style={styles.memberAvatar}>
                  {member.avatar ? (
                    <Image source={{ uri: member.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Icon name="account" size={40} color={colors.textSecondary} />
                  )}
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Enlaces útiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enlaces Útiles</Text>
          {links.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={styles.linkItem}
              onPress={link.onPress}
            >
              <View style={styles.linkIcon}>
                <Icon name={link.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>{link.title}</Text>
                <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
              </View>
              <Icon name="open-in-new" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Información técnica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Técnica</Text>
          <View style={styles.technicalInfo}>
            {technicalInfo.map((info, index) => (
              <View key={index} style={styles.technicalItem}>
                <Text style={styles.technicalLabel}>{info.label}</Text>
                <Text style={styles.technicalValue}>{info.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reconocimientos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reconocimientos</Text>
          <Text style={styles.acknowledgmentText}>
            Esta aplicación ha sido desarrollada con amor y dedicación para servir 
            a la comunidad masónica. Agradecemos a todos los hermanos que han 
            contribuido con sus ideas, sugerencias y feedback para hacer de 
            Orpheo una herramienta útil y confiable.
          </Text>
          
          <View style={styles.symbolContainer}>
            <Icon name="triangle" size={30} color={colors.primary} />
            <Text style={styles.symbolText}>∴</Text>
            <Icon name="square" size={30} color={colors.primary} />
            <Text style={styles.symbolText}>∴</Text>
            <Icon name="circle" size={30} color={colors.primary} />
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyrightText}>
            © 2024 {appInfo.developer}
          </Text>
          <Text style={styles.copyrightSubtext}>
            Todos los derechos reservados
          </Text>
          <Text style={styles.masonicNote}>
            "Libertad, Igualdad, Fraternidad"
          </Text>
        </View>

        {/* Espaciado inferior */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </TabSafeView>
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

  // App header
  appHeader: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...globalStyles.shadow,
  },
  appName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  appVersion: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  appDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Sections
  section: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },

  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Team
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  teamMember: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  memberName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  memberRole: {
    fontSize: fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Links
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkIcon: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  linkContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  linkTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  linkSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Technical info
  technicalInfo: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  technicalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  technicalLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  technicalValue: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },

  // Acknowledgments
  acknowledgmentText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: spacing.lg,
  },
  symbolContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  symbolText: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: 'bold',
  },

  // Footer
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  copyrightText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  copyrightSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  masonicNote: {
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: colors.primary,
    fontWeight: '500',
  },

  bottomSpacer: {
    height: spacing.xl,
  },
});

export default AboutScreen;