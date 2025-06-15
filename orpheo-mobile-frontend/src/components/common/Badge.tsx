import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/utils/theme';
import {
  getGradoColor,
  getDocumentoEstadoColor,
  getProgramaEstadoColor,
} from '@/utils/helpers';
import {
  GRADOS_DISPLAY,
  DOCUMENTO_ESTADOS_DISPLAY,
  PROGRAMA_ESTADOS_DISPLAY,
  ASISTENCIA_ESTADOS_DISPLAY,
} from '@/utils/constants';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'grado' | 'documento' | 'programa' | 'asistencia' | 'custom';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  outline?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'medium',
  color,
  backgroundColor,
  style,
  textStyle,
  icon,
  outline = false,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle = styles.badge;
    const sizeStyle = styles[`badge_${size}`];
    const variantStyle = getVariantStyle();
    const outlineStyle = outline ? styles.badgeOutline : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      ...outlineStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = styles.text;
    const sizeStyle = styles[`text_${size}`];
    const colorStyle = getTextColorStyle();

    return {
      ...baseStyle,
      ...sizeStyle,
      ...colorStyle,
      ...textStyle,
    };
  };

  const getVariantStyle = (): ViewStyle => {
    if (backgroundColor) {
      return { backgroundColor };
    }

    switch (variant) {
      case 'grado':
        return {
          backgroundColor: `${getGradoColor(text.toLowerCase())}20`,
        };
      case 'documento':
        return {
          backgroundColor: `${getDocumentoEstadoColor(text.toLowerCase())}20`,
        };
      case 'programa':
        return {
          backgroundColor: `${getProgramaEstadoColor(text.toLowerCase())}20`,
        };
      case 'asistencia':
        return getAsistenciaStyle(text.toLowerCase());
      default:
        return {
          backgroundColor: `${theme.colors.gold}20`,
        };
    }
  };

  const getTextColorStyle = (): TextStyle => {
    if (color) {
      return { color };
    }

    switch (variant) {
      case 'grado':
        return {
          color: getGradoColor(text.toLowerCase()),
        };
      case 'documento':
        return {
          color: getDocumentoEstadoColor(text.toLowerCase()),
        };
      case 'programa':
        return {
          color: getProgramaEstadoColor(text.toLowerCase()),
        };
      case 'asistencia':
        return {
          color: getAsistenciaColor(text.toLowerCase()),
        };
      default:
        return {
          color: theme.colors.gold,
        };
    }
  };

  const getAsistenciaStyle = (estado: string): ViewStyle => {
    const colors = {
      confirmada: theme.colors.success,
      pendiente: theme.colors.warning,
      ausente: theme.colors.error,
      justificada: theme.colors.info,
    };
    
    const color = colors[estado as keyof typeof colors] || theme.colors.grayBorder;
    return { backgroundColor: `${color}20` };
  };

  const getAsistenciaColor = (estado: string): string => {
    const colors = {
      confirmada: theme.colors.success,
      pendiente: theme.colors.warning,
      ausente: theme.colors.error,
      justificada: theme.colors.info,
    };
    
    return colors[estado as keyof typeof colors] || theme.colors.grayBorder;
  };

  const getDisplayText = (): string => {
    switch (variant) {
      case 'grado':
        return GRADOS_DISPLAY[text.toLowerCase() as keyof typeof GRADOS_DISPLAY] || text;
      case 'documento':
        return DOCUMENTO_ESTADOS_DISPLAY[text.toLowerCase() as keyof typeof DOCUMENTO_ESTADOS_DISPLAY] || text;
      case 'programa':
        return PROGRAMA_ESTADOS_DISPLAY[text.toLowerCase() as keyof typeof PROGRAMA_ESTADOS_DISPLAY] || text;
      case 'asistencia':
        return ASISTENCIA_ESTADOS_DISPLAY[text.toLowerCase() as keyof typeof ASISTENCIA_ESTADOS_DISPLAY] || text;
      default:
        return text;
    }
  };

  return (
    <View style={getBadgeStyle()}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={getTextStyle()}>{getDisplayText()}</Text>
    </View>
  );
};

// Badge específico para grados masónicos
interface GradoBadgeProps {
  grado: 'aprendiz' | 'companero' | 'maestro';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showIcon?: boolean;
}

export const GradoBadge: React.FC<GradoBadgeProps> = ({
  grado,
  size = 'medium',
  style,
  showIcon = true,
}) => {
  const getGradoIcon = () => {
    const iconSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;
    
    switch (grado) {
      case 'aprendiz':
        return <Text style={{ fontSize: iconSize, color: getGradoColor(grado) }}>⚬</Text>;
      case 'companero':
        return <Text style={{ fontSize: iconSize, color: getGradoColor(grado) }}>⚬⚬</Text>;
      case 'maestro':
        return <Text style={{ fontSize: iconSize, color: getGradoColor(grado) }}>⚬⚬⚬</Text>;
      default:
        return null;
    }
  };

  return (
    <Badge
      text={grado}
      variant="grado"
      size={size}
      style={style}
      icon={showIcon ? getGradoIcon() : undefined}
    />
  );
};

// Badge para estados de documentos
interface DocumentoBadgeProps {
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'revision';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showIcon?: boolean;
}

export const DocumentoBadge: React.FC<DocumentoBadgeProps> = ({
  estado,
  size = 'medium',
  style,
  showIcon = true,
}) => {
  const getEstadoIcon = () => {
    const iconSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;
    const color = getDocumentoEstadoColor(estado);
    
    switch (estado) {
      case 'aprobado':
        return <Ionicons name="checkmark-circle" size={iconSize} color={color} />;
      case 'pendiente':
        return <Ionicons name="time" size={iconSize} color={color} />;
      case 'revision':
        return <Ionicons name="eye" size={iconSize} color={color} />;
      case 'rechazado':
        return <Ionicons name="close-circle" size={iconSize} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Badge
      text={estado}
      variant="documento"
      size={size}
      style={style}
      icon={showIcon ? getEstadoIcon() : undefined}
    />
  );
};

// Badge para estados de programas
interface ProgramaBadgeProps {
  estado: 'programado' | 'en_curso' | 'finalizado' | 'cancelado' | 'suspendido';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showIcon?: boolean;
}

export const ProgramaBadge: React.FC<ProgramaBadgeProps> = ({
  estado,
  size = 'medium',
  style,
  showIcon = true,
}) => {
  const getEstadoIcon = () => {
    const iconSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;
    const color = getProgramaEstadoColor(estado);
    
    switch (estado) {
      case 'programado':
        return <Ionicons name="calendar" size={iconSize} color={color} />;
      case 'en_curso':
        return <Ionicons name="play-circle" size={iconSize} color={color} />;
      case 'finalizado':
        return <Ionicons name="checkmark-circle" size={iconSize} color={color} />;
      case 'cancelado':
        return <Ionicons name="close-circle" size={iconSize} color={color} />;
      case 'suspendido':
        return <Ionicons name="pause-circle" size={iconSize} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Badge
      text={estado}
      variant="programa"
      size={size}
      style={style}
      icon={showIcon ? getEstadoIcon() : undefined}
    />
  );
};

// Badge para asistencia
interface AsistenciaBadgeProps {
  estado: 'confirmada' | 'pendiente' | 'ausente' | 'justificada';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showIcon?: boolean;
}

export const AsistenciaBadge: React.FC<AsistenciaBadgeProps> = ({
  estado,
  size = 'medium',
  style,
  showIcon = true,
}) => {
  const getEstadoIcon = () => {
    const iconSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;
    const color = getAsistenciaColor(estado);
    
    switch (estado) {
      case 'confirmada':
        return <Ionicons name="checkmark" size={iconSize} color={color} />;
      case 'pendiente':
        return <Ionicons name="help" size={iconSize} color={color} />;
      case 'ausente':
        return <Ionicons name="close" size={iconSize} color={color} />;
      case 'justificada':
        return <Ionicons name="document-text" size={iconSize} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Badge
      text={estado}
      variant="asistencia"
      size={size}
      style={style}
      icon={showIcon ? getEstadoIcon() : undefined}
    />
  );
};

// Badge de notificación (número)
interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  show?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  size = 'medium',
  style,
  show = true,
}) => {
  if (!show || count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View style={[styles.notificationBadge, styles[`notification_${size}`], style]}>
      <Text style={[styles.notificationText, styles[`notificationText_${size}`]]}>
        {displayCount}
      </Text>
    </View>
  );
};

// Badge personalizable con colores custom
interface CustomBadgeProps {
  text: string;
  color: string;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  outline?: boolean;
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({
  text,
  color,
  backgroundColor,
  size = 'medium',
  style,
  outline = false,
}) => {
  return (
    <Badge
      text={text}
      variant="custom"
      size={size}
      color={color}
      backgroundColor={backgroundColor || `${color}20`}
      style={style}
      outline={outline}
    />
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  
  // Sizes
  badge_small: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  badge_medium: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  badge_large: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
  },
  
  // States
  badgeOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  
  iconContainer: {
    marginRight: theme.spacing.xs,
  },
  
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  
  text_small: {
    fontSize: 10,
  },
  
  text_medium: {
    fontSize: 12,
  },
  
  text_large: {
    fontSize: 14,
  },
  
  // Notification badge
  notificationBadge: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -5,
    right: -5,
  },
  
  notification_small: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
  
  notification_medium: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
  },
  
  notification_large: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
  },
  
  notificationText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  notificationText_small: {
    fontSize: 8,
  },
  
  notificationText_medium: {
    fontSize: 10,
  },
  
  notificationText_large: {
    fontSize: 12,
  },
});

export default Badge;