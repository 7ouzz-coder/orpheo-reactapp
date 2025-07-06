import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Animated 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../styles/colors';
import { wp, hp, fontSize, spacing } from '../../utils/dimensions';

const FilterModal = ({ visible, filters, onApply, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const slideAnim = React.useRef(new Animated.Value(hp(100))).current;

  React.useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
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

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = { grado: null, vigente: null };
    setLocalFilters(clearedFilters);
    onApply(clearedFilters);
  };

  const renderGradoOption = (grado, label, color) => (
    <TouchableOpacity
      key={grado}
      style={[
        styles.optionButton,
        localFilters.grado === grado && { backgroundColor: color }
      ]}
      onPress={() => setLocalFilters(prev => ({
        ...prev,
        grado: prev.grado === grado ? null : grado
      }))}
      activeOpacity={0.8}
    >
      <View style={[styles.gradoBadge, { backgroundColor: color }]}>
        <Text style={styles.gradoBadgeText}>{label}</Text>
      </View>
      {localFilters.grado === grado && (
        <Icon name="check" size={wp(5)} color={colors.white} />
      )}
    </TouchableOpacity>
  );

  const renderStatusOption = (status, label, icon) => (
    <TouchableOpacity
      key={status}
      style={[
        styles.optionButton,
        localFilters.vigente === status && styles.optionButtonSelected
      ]}
      onPress={() => setLocalFilters(prev => ({
        ...prev,
        vigente: prev.vigente === status ? null : status
      }))}
      activeOpacity={0.8}
    >
      <Icon name={icon} size={wp(6)} color={
        localFilters.vigente === status ? colors.white : colors.textSecondary
      } />
      <Text style={[
        styles.optionText,
        localFilters.vigente === status && styles.optionTextSelected
      ]}>
        {label}
      </Text>
      {localFilters.vigente === status && (
        <Icon name="check" size={wp(5)} color={colors.white} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <Animated.View style={[
          styles.modal, 
          { transform: [{ translateY: slideAnim }] }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🔍 Filtros</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={wp(6)} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Filtro por Grado */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Por Grado Masónico</Text>
              <View style={styles.optionsContainer}>
                {renderGradoOption('aprendiz', 'APRENDIZ', colors.aprendiz)}
                {renderGradoOption('companero', 'COMPAÑERO', colors.companero)}
                {renderGradoOption('maestro', 'MAESTRO', colors.maestro)}
              </View>
            </View>

            {/* Filtro por Estado */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Por Estado</Text>
              <View style={styles.optionsContainer}>
                {renderStatusOption(true, 'Activos', 'person')}
                {renderStatusOption(false, 'Inactivos', 'person-off')}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: wp(6),
    borderTopRightRadius: wp(6),
    maxHeight: hp(80),
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: colors.card,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  gradoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: wp(1),
    marginRight: spacing.md,
    flex: 1,
    alignItems: 'center',
  },
  gradoBadgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.md,
  },
  optionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.card,
    gap: spacing.md,
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: wp(2),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  clearButtonText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: wp(2),
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

export default FilterModal;