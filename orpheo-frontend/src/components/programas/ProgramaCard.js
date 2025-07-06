import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../styles/colors';
import { wp, fontSize, spacing } from '../../utils/dimensions';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const ProgramaCard = ({ programa, onPress, getTipoIcon, getTipoColor }) => {
  const fechaPrograma = new Date(programa.fecha);
  const esPasado = isPast(fechaPrograma);
  const esHoy = isToday(fechaPrograma);
  const esManana = isTomorrow(fechaPrograma);
  
  const getGradoColor = (grado) => {
    return colors[grado] || colors.primary;
  };

  const getEstadoInfo = () => {
    if (programa.estado === 'completado') {
      return { icon: 'check-circle', color: colors.success, text: 'Completado' };
    }
    if (programa.estado === 'cancelado') {
      return { icon: 'cancel', color: colors.error, text: 'Cancelado' };
    }
    if (esPasado && programa.estado === 'programado') {
      return { icon: 'schedule', color: colors.warning, text: 'Pendiente' };
    }
    return { icon: 'event', color: colors.info, text: 'Programado' };
  };

  const getFechaDisplay = () => {
    if (esHoy) return '📅 HOY';
    if (esManana) return '📅 MAÑANA';
    
    const diffDays = differenceInDays(fechaPrograma, new Date());
    if (diffDays > 0 && diffDays <= 7) {
      return `📅 En ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    }
    
    return format(fechaPrograma, "dd 'de' MMMM", { locale: es });
  };

  const getHoraDisplay = () => {
    return format(fechaPrograma, "HH:mm 'hrs'");
  };

  const estadoInfo = getEstadoInfo();
  const tipoColor = getTipoColor(programa.tipo);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        esPasado && styles.cardPasado,
        esHoy && styles.cardHoy
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {/* Header con tipo e ícono */}
        <View style={styles.header}>
          <View style={[styles.tipoContainer, { backgroundColor: tipoColor }]}>
            <Icon name={getTipoIcon(programa.tipo)} size={wp(5)} color={colors.white} />
            <Text style={styles.tipoText}>
              {programa.tipo.toUpperCase()}
            </Text>
          </View>
          
          <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.color }]}>
            <Icon name={estadoInfo.icon} size={wp(3.5)} color={colors.white} />
            <Text style={styles.estadoText}>{estadoInfo.text}</Text>
          </View>
        </View>

        {/* Título del programa */}
        <Text style={styles.tema} numberOfLines={2}>
          {programa.tema}
        </Text>

        {/* Información de fecha y hora */}
        <View style={styles.fechaContainer}>
          <Text style={[
            styles.fechaDisplay,
            esHoy && { color: colors.warning, fontWeight: 'bold' },
            esManana && { color: colors.info, fontWeight: 'bold' }
          ]}>
            {getFechaDisplay()}
          </Text>
          <Text style={styles.horaDisplay}>
            {getHoraDisplay()}
          </Text>
        </View>

        {/* Información del encargado */}
        <View style={styles.encargadoContainer}>
          <Icon name="person" size={wp(4)} color={colors.textSecondary} />
          <Text style={styles.encargadoText} numberOfLines={1}>
            {programa.encargado}
          </Text>
          {programa.quienImparte && (
            <>
              <Icon name="school" size={wp(3.5)} color={colors.textTertiary} style={styles.separatorIcon} />
              <Text style={styles.imparteText} numberOfLines={1}>
                {programa.quienImparte}
              </Text>
            </>
          )}
        </View>

        {/* Footer con grado y ubicación */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={[styles.gradoBadge, { backgroundColor: getGradoColor(programa.grado) }]}>
              <Text style={styles.gradoText}>
                {programa.grado === 'general' ? 'GENERAL' : programa.grado.toUpperCase()}
              </Text>
            </View>
            
            {programa.ubicacion && (
              <View style={styles.ubicacionContainer}>
                <Icon name="place" size={wp(3.5)} color={colors.textTertiary} />
                <Text style={styles.ubicacionText} numberOfLines={1}>
                  {programa.ubicacion}
                </Text>
              </View>
            )}
          </View>

          <Icon name="chevron-right" size={wp(5)} color={colors.textSecondary} />
        </View>

        {/* Indicador visual lateral */}
        <View style={[styles.indicadorLateral, { backgroundColor: tipoColor }]} />
        
        {/* Indicador de urgencia para eventos próximos */}
        {esHoy && (
          <View style={styles.urgenciaIndicator}>
            <Text style={styles.urgenciaText}>¡HOY!</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPasado: {
    opacity: 0.8,
    backgroundColor: colors.card,
  },
  cardHoy: {
    borderWidth: 2,
    borderColor: colors.warning,
    elevation: 4,
    shadowOpacity: 0.2,
  },
  content: {
    padding: spacing.md,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: wp(4),
    flex: 1,
    marginRight: spacing.sm,
  },
  tipoText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: wp(2),
  },
  estadoText: {
    color: colors.white,
    fontSize: fontSize.xs - 1,
    fontWeight: '500',
    marginLeft: 2,
  },
  
  // Título
  tema: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: fontSize.lg * 1.2,
  },
  
  // Fecha y hora
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: wp(2),
    marginBottom: spacing.sm,
  },
  fechaDisplay: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  horaDisplay: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  // Encargado
  encargadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  encargadoText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
    flex: 1,
    fontWeight: '500',
  },
  separatorIcon: {
    marginHorizontal: spacing.xs,
  },
  imparteText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontStyle: 'italic',
    flex: 1,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: wp(1),
    marginRight: spacing.sm,
  },
  gradoText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  ubicacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ubicacionText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginLeft: 2,
  },
  
  // Indicadores visuales
  indicadorLateral: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: wp(1),
  },
  urgenciaIndicator: {
    position: 'absolute',
    top: -spacing.xs,
    right: spacing.md,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderBottomLeftRadius: wp(2),
    borderBottomRightRadius: wp(2),
    elevation: 3,
  },
  urgenciaText: {
    color: colors.background,
    fontSize: fontSize.xs - 1,
    fontWeight: 'bold',
  },
});

export default ProgramaCard;