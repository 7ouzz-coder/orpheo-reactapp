import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

// Colores definidos directamente para evitar imports problemáticos
const colors = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  primary: '#D4AF37',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  overlay: 'rgba(0, 0, 0, 0.8)',
};

/**
 * Componente de loading básico (inline)
 */
export const LoadingSpinner = ({ 
  size = 'large', 
  color = colors.primary, 
  text = null,
  style = {} 
}) => (
  <View style={[styles.container, style]}>
    <ActivityIndicator size={size} color={color} />
    {text && <Text style={styles.loadingText}>{text}</Text>}
  </View>
);

/**
 * Componente de loading con overlay completo
 */
export const LoadingOverlay = ({ 
  visible = false, 
  text = 'Cargando...', 
  onRequestClose = null 
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onRequestClose}
  >
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.overlayText}>{text}</Text>
      </View>
    </View>
  </Modal>
);

/**
 * Componente de loading para pantallas completas
 */
export const LoadingScreen = ({ 
  text = 'Cargando Orpheo...', 
  subtitle = null,
  showIcon = true 
}) => (
  <View style={styles.screenContainer}>
    {showIcon && (
      <View style={styles.iconContainer}>
        <Icon name="temple-buddhist" size={60} color={colors.primary} />
      </View>
    )}
    
    <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
    
    <Text style={styles.screenTitle}>{text}</Text>
    
    {subtitle && (
      <Text style={styles.screenSubtitle}>{subtitle}</Text>
    )}
    
    <View style={styles.progressDots}>
      <View style={[styles.dot, styles.dotActive]} />
      <View style={[styles.dot, styles.dotActive]} />
      <View style={[styles.dot, styles.dotInactive]} />
    </View>
  </View>
);

/**
 * Componente de loading para listas
 */
export const LoadingList = ({ 
  itemCount = 5, 
  itemHeight = 80, 
  showAvatar = true 
}) => (
  <View style={styles.listContainer}>
    {Array.from({ length: itemCount }).map((_, index) => (
      <View key={index} style={[styles.listItem, { height: itemHeight }]}>
        {showAvatar && <View style={styles.skeletonAvatar} />}
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
      </View>
    ))}
  </View>
);

/**
 * Componente de loading para cards
 */
export const LoadingCard = ({ style = {} }) => (
  <View style={[styles.card, style]}>
    <View style={styles.cardHeader}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.cardHeaderContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
      </View>
    </View>
    <View style={styles.cardBody}>
      <View style={styles.skeletonParagraph} />
      <View style={styles.skeletonParagraph} />
      <View style={[styles.skeletonParagraph, { width: '60%' }]} />
    </View>
  </View>
);

/**
 * Componente de loading con botón de retry
 */
export const LoadingWithRetry = ({ 
  loading = true, 
  error = null, 
  onRetry = null,
  text = 'Cargando...',
  errorText = 'Error al cargar datos',
  retryText = 'Reintentar'
}) => {
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorTitle}>{errorText}</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Icon name="refresh" size={20} color={colors.primary} />
            <Text style={styles.retryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (loading) {
    return <LoadingSpinner text={text} />;
  }

  return null;
};

/**
 * Componente de loading para pulls to refresh
 */
export const PullToRefreshLoader = ({ refreshing = false }) => {
  if (!refreshing) return null;
  
  return (
    <View style={styles.pullRefreshContainer}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
};

/**
 * Componente de loading inline para botones
 */
export const ButtonLoader = ({ 
  loading = false, 
  text = 'Cargando...', 
  size = 'small' 
}) => {
  if (!loading) return null;
  
  return (
    <View style={styles.buttonLoader}>
      <ActivityIndicator size={size} color={colors.primary} />
      <Text style={styles.buttonLoaderText}>{text}</Text>
    </View>
  );
};

/**
 * Componente de loading con progreso
 */
export const LoadingProgress = ({ 
  progress = 0, 
  text = 'Procesando...', 
  showPercentage = true 
}) => (
  <View style={styles.progressContainer}>
    <Text style={styles.progressText}>{text}</Text>
    
    <View style={styles.progressBar}>
      <View 
        style={[
          styles.progressFill, 
          { width: `${Math.min(100, Math.max(0, progress))}%` }
        ]} 
      />
    </View>
    
    {showPercentage && (
      <Text style={styles.progressPercentage}>
        {Math.round(progress)}%
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  // Loading básico
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: colors.surface,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: screenWidth * 0.6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  overlayText: {
    marginTop: 16,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Pantalla completa
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  spinner: {
    marginVertical: 20,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  screenSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotInactive: {
    backgroundColor: colors.textSecondary,
    opacity: 0.3,
  },
  
  // Lista skeleton
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    marginRight: 16,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: colors.surface,
    borderRadius: 6,
    width: '50%',
  },
  
  // Card skeleton
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardBody: {
    gap: 8,
  },
  skeletonParagraph: {
    height: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    width: '100%',
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.background,
  },
  errorTitle: {
    color: '#F44336',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  retryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  // Pull to refresh
  pullRefreshContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  
  // Button loader
  buttonLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLoaderText: {
    color: colors.text,
    fontSize: 14,
    marginLeft: 8,
  },
  
  // Progress loader
  progressContainer: {
    padding: 20,
    alignItems: 'center',
  },
  progressText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressPercentage: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

// Exportar componente principal por defecto
export default LoadingSpinner;