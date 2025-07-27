import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Styles
import { colors } from '../../styles/colors';
import { globalStyles, spacing, fontSize, wp, hp } from '../../styles/globalStyles';

const FilterModal = ({
  visible = false,
  onClose,
  onApply,
  filters = {},
  title = 'Filtros',
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [slideAnim] = useState(new Animated.Value(hp(100)));

  // Opciones de filtros
  const gradoOptions = [
    { key: 'todos', label: 'Todos los Grados', icon: 'account-group' },
    { key: 'aprendiz', label: 'Aprendiz', icon: 'school' },
    { key: 'companero', label: 'Compañero', icon: 'account-group' },
    { key: 'maestro', label: 'Maestro', icon: 'crown' },
  ];

  const estadoOptions = [
    { key: 'todos', label: 'Todos los Estados', icon: 'circle-outline' },
    { key: 'activo', label: 'Activo', icon: 'check-circle', color: colors.success },
    { key: 'inactivo', label: 'Inactivo', icon: 'minus-circle', color: colors.textSecondary },
    { key: 'suspendido', label: 'Suspendido', icon: 'pause-circle', color: colors.warning },
    { key: 'irradiado', label: 'Irradiado', icon: 'close-circle', color: colors.error },
  ];

  const sortByOptions = [
    { key: 'apellidos', label: 'Apellidos', icon: 'sort-alphabetical-ascending' },
    { key: 'nombres', label: 'Nombres', icon: 'sort-alphabetical-ascending' },
    { key: 'grado', label: 'Grado', icon: 'sort-variant' },
    { key: 'fechaIngreso', label: 'Fecha de Ingreso', icon: 'sort-calendar-ascending' },
    { key: 'created_at', label: 'Fecha de Registro', icon: 'sort-clock-ascending' },
  ];

  const sortOrderOptions = [
    { key: 'ASC', label: 'Ascendente', icon: 'sort-ascending' },
    { key: 'DESC', label: 'Descendente', icon: 'sort-descending' },
  ];

  // Actualizar filtros locales cuando cambien los externos
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Animación de entrada/salida
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: hp(100),
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApply?.(localFilters);
    onClose?.();
  };

  const handleReset = () => {
    const resetFilters = {
      grado: 'todos',
      estado: 'todos',
      sortBy: 'apellidos',
      sortOrder: 'ASC'
    };
    setLocalFilters(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.grado && localFilters.grado !== 'todos') count++;
    if (localFilters.estado && localFilters.estado !== 'todos') count++;
    return count;
  };

  const renderFilterSection = (title, options, selectedKey, onSelect, iconColor) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.option,
              selectedKey === option.key && styles.optionSelected
            ]}
            onPress={() => onSelect(option.key)}
          >
            <Icon
              name={option.icon}
              size={20}
              color={option.color || (selectedKey === option.key ? colors.white : colors.textSecondary)}
              style={styles.optionIcon}
            />
            <Text style={[
              styles.optionText,
              selectedKey === option.key && styles.optionTextSelected
            ]}>
              {option.label}
            </Text>
            {selectedKey === option.key && (
              <Icon
                name="check"
                size={16}
                color={colors.white}
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        
        <Animated.View style={[
          styles.modal,
          { transform: [{ translateY: slideAnim }] }
        ]}>
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
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Filtro por Grado */}
            {renderFilterSection(
              'Grado Masónico',
              gradoOptions,
              localFilters.grado,
              (value) => handleFilterChange('grado', value)
            )}

            {/* Filtro por Estado */}
            {renderFilterSection(
              'Estado del Miembro',
              estadoOptions,
              localFilters.estado,
              (value) => handleFilterChange('estado', value)
            )}

            {/* Ordenamiento */}
            {renderFilterSection(
              'Ordenar por',
              sortByOptions,
              localFilters.sortBy,
              (value) => handleFilterChange('sortBy', value)
            )}

            {/* Dirección del ordenamiento */}
            {renderFilterSection(
              'Dirección',
              sortOrderOptions,
              localFilters.sortOrder,
              (value) => handleFilterChange('sortOrder', value)
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Icon name="refresh" size={18} color={colors.textSecondary} />
              <Text style={styles.resetButtonText}>Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Icon name="check" size={18} color={colors.white} />
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  modal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: hp(80),
    minHeight: hp(50),
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
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
    color: colors.text,
    marginRight: spacing.sm,
  },
  
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  
  badgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: 'bold',
  },
  
  closeButton: {
    padding: spacing.xs,
  },
  
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  
  section: {
    marginBottom: spacing.xl,
  },
  
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  
  optionsContainer: {
    gap: spacing.xs,
  },
  
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  optionIcon: {
    marginRight: spacing.sm,
  },
  
  optionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  
  optionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  
  checkIcon: {
    marginLeft: spacing.sm,
  },
  
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  resetButtonText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  
  applyButtonText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default FilterModal;