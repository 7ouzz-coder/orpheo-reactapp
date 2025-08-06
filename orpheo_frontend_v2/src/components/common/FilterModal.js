import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, colorOpacity } from '../../styles/colors';
import { wp, hp, fontSize, spacing } from '../../utils/dimensions';

const { height: screenHeight } = Dimensions.get('window');

const FilterModal = ({
  visible = false,
  onClose,
  onApply,
  onClear,
  initialFilters = {},
  title = 'Filtros',
}) => {
  // Estados locales para los filtros
  const [filters, setFilters] = useState({
    grado: null,
    estado: null,
    fechaIngreso: null,
    ordenarPor: 'nombre',
    orden: 'asc',
    ...initialFilters,
  });

  // Animación del modal
  const slideAnim = useState(new Animated.Value(screenHeight))[0];
  const backdropOpacity = useState(new Animated.Value(0))[0];

  // Opciones de filtros
  const gradosOptions = [
    { value: null, label: 'Todos los grados', icon: 'account-group' },
    { value: 'aprendiz', label: 'Aprendiz', icon: 'school', color: colors.info },
    { value: 'companero', label: 'Compañero', icon: 'hammer-wrench', color: colors.warning },
    { value: 'maestro', label: 'Maestro', icon: 'crown', color: colors.success },
  ];

  const estadosOptions = [
    { value: null, label: 'Todos los estados', icon: 'account-multiple' },
    { value: 'activo', label: 'Activo', icon: 'check-circle', color: colors.success },
    { value: 'inactivo', label: 'Inactivo', icon: 'pause-circle', color: colors.warning },
    { value: 'suspendido', label: 'Suspendido', icon: 'cancel', color: colors.error },
  ];

  const ordenarOptions = [
    { value: 'nombre', label: 'Nombre', icon: 'sort-alphabetical-ascending' },
    { value: 'apellido', label: 'Apellido', icon: 'sort-alphabetical-ascending' },
    { value: 'fecha_ingreso', label: 'Fecha de ingreso', icon: 'calendar' },
    { value: 'grado', label: 'Grado', icon: 'crown' },
  ];

  const ordenOptions = [
    { value: 'asc', label: 'Ascendente', icon: 'sort-ascending' },
    { value: 'desc', label: 'Descendente', icon: 'sort-descending' },
  ];

  // Efecto para sincronizar filtros externos
  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...initialFilters,
    }));
  }, [initialFilters]);

  // Efecto para animaciones del modal
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity]);

  // Actualizar filtro
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Aplicar filtros
  const handleApply = () => {
    onApply?.(filters);
    onClose?.();
  };

  // Limpiar filtros
  const handleClear = () => {
    const clearedFilters = {
      grado: null,
      estado: null,
      fechaIngreso: null,
      ordenarPor: 'nombre',
      orden: 'asc',
    };
    setFilters(clearedFilters);
    onClear?.(clearedFilters);
  };

  // Cerrar modal
  const handleClose = () => {
    onClose?.();
  };

  // Contar filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.grado) count++;
    if (filters.estado) count++;
    if (filters.fechaIngreso) count++;
    return count;
  };

  // Renderizar opción de filtro
  const renderFilterOption = (option, isSelected, onPress, showColor = false) => (
    <TouchableOpacity
      key={option.value || 'all'}
      style={[
        styles.filterOption,
        isSelected && styles.filterOptionSelected,
        showColor && option.color && { borderLeftColor: option.color, borderLeftWidth: 3 }
      ]}
      onPress={() => onPress(option.value)}
    >
      <View style={styles.filterOptionContent}>
        <Icon 
          name={option.icon} 
          size={wp(5)} 
          color={isSelected ? colors.primary : (option.color || colors.textSecondary)} 
        />
        <Text style={[
          styles.filterOptionText,
          isSelected && styles.filterOptionTextSelected
        ]}>
          {option.label}
        </Text>
      </View>
      {isSelected && (
        <Icon name="check" size={wp(4)} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  // Renderizar sección de filtro
  const renderFilterSection = (title, options, currentValue, onSelect, showColors = false) => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map(option => 
          renderFilterOption(
            option, 
            currentValue === option.value, 
            onSelect,
            showColors
          )
        )}
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View 
        style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{title}</Text>
            {getActiveFiltersCount() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={wp(6)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Filtro por Grado */}
          {renderFilterSection(
            'Grado Masónico',
            gradosOptions,
            filters.grado,
            (value) => updateFilter('grado', value),
            true
          )}

          {/* Filtro por Estado */}
          {renderFilterSection(
            'Estado del Miembro',
            estadosOptions,
            filters.estado,
            (value) => updateFilter('estado', value),
            true
          )}

          {/* Ordenar por */}
          {renderFilterSection(
            'Ordenar por',
            ordenarOptions,
            filters.ordenarPor,
            (value) => updateFilter('ordenarPor', value)
          )}

          {/* Orden */}
          {renderFilterSection(
            'Orden',
            ordenOptions,
            filters.orden,
            (value) => updateFilter('orden', value)
          )}

          {/* Espacio adicional para scroll */}
          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* Footer con acciones */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, styles.clearButton]}
            onPress={handleClear}
          >
            <Icon name="refresh" size={wp(4)} color={colors.textSecondary} />
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.applyButton]}
            onPress={handleApply}
          >
            <Icon name="check" size={wp(4)} color={colors.white} />
            <Text style={styles.applyButtonText}>
              Aplicar {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colorOpacity.black50,
  },

  backdropTouchable: {
    flex: 1,
  },

  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: screenHeight * 0.85,
    backgroundColor: colors.background,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    elevation: 10,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  badge: {
    backgroundColor: colors.primary,
    borderRadius: wp(3),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
    minWidth: wp(6),
    alignItems: 'center',
  },

  badgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },

  closeButton: {
    padding: spacing.sm,
    borderRadius: wp(2),
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  filterSection: {
    marginVertical: spacing.md,
  },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  optionsContainer: {
    gap: spacing.xs,
  },

  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: colors.border,
  },

  filterOptionSelected: {
    backgroundColor: colorOpacity.primary10,
    borderColor: colors.primary,
  },

  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  filterOptionText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
  },

  filterOptionTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },

  bottomSpace: {
    height: spacing.xl,
  },

  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },

  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: wp(2),
    gap: spacing.sm,
  },

  clearButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  clearButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  applyButton: {
    backgroundColor: colors.primary,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  applyButtonText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: '600',
  },
});

export default FilterModal;