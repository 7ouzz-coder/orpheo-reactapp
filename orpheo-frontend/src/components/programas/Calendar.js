import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../styles/colors';
import { wp, fontSize, spacing } from '../../utils/dimensions';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth
} from 'date-fns';
import { es } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CalendarioView = ({ programas, onProgramaPress, onDatePress, getTipoColor }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Obtener programas por fecha
  const programasPorFecha = useMemo(() => {
    const map = new Map();
    programas.forEach(programa => {
      const fecha = format(new Date(programa.fecha), 'yyyy-MM-dd');
      if (!map.has(fecha)) {
        map.set(fecha, []);
      }
      map.get(fecha).push(programa);
    });
    return map;
  }, [programas]);

  // Generar días del mes actual
  const diasDelMes = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }); // Lunes
    const fin = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: inicio, end: fin });
  }, [currentDate]);

  const navegarMes = (direccion) => {
    if (direccion === 'anterior') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
    setSelectedDate(null);
  };

  const handleDayPress = (date) => {
    setSelectedDate(date);
    onDatePress?.(date);
  };

  const getProgramasDelDia = (date) => {
    const fecha = format(date, 'yyyy-MM-dd');
    return programasPorFecha.get(fecha) || [];
  };

  const renderHeader = () => (
  <View style={styles.header}>
    {/* Botón anterior */}
    <TouchableOpacity 
      style={styles.navButton}
      onPress={() => navegarMes('anterior')}
    >
      <Icon name="chevron-left" size={wp(6)} color={colors.primary} />
    </TouchableOpacity>

    {/* Título del mes */}
    <Text style={styles.monthTitle}>
      {format(currentDate, "MMMM yyyy", { locale: es })}
    </Text>

    {/* Botón siguiente */}
    <TouchableOpacity 
      style={styles.navButton}
      onPress={() => navegarMes('siguiente')}
    >
      <Icon name="chevron-right" size={wp(6)} color={colors.primary} />
    </TouchableOpacity>
  </View>
);

  const renderDaysOfWeek = () => (
    <View style={styles.daysOfWeekContainer}>
      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
        <View key={index} style={styles.dayOfWeekItem}>
          <Text style={styles.dayOfWeekText}>{day}</Text>
        </View>
      ))}
    </View>
  );

  const renderDay = (date) => {
    const programasDelDia = getProgramasDelDia(date);
    const esHoy = isToday(date);
    const esMesActual = isSameMonth(date, currentDate);
    const estaSeleccionado = selectedDate && isSameDay(date, selectedDate);
    const tieneProgramas = programasDelDia.length > 0;

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.dayContainer,
          !esMesActual && styles.dayContainerOtherMonth,
          esHoy && styles.dayContainerToday,
          estaSeleccionado && styles.dayContainerSelected,
          tieneProgramas && styles.dayContainerWithPrograms
        ]}
        onPress={() => handleDayPress(date)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dayText,
          !esMesActual && styles.dayTextOtherMonth,
          esHoy && styles.dayTextToday,
          estaSeleccionado && styles.dayTextSelected
        ]}>
          {format(date, 'd')}
        </Text>
        
        {/* Indicadores de programas */}
        {tieneProgramas && (
          <View style={styles.programasIndicators}>
            {programasDelDia.slice(0, 3).map((programa, index) => (
              <View
                key={programa.id}
                style={[
                  styles.programaIndicator,
                  { backgroundColor: getTipoColor(programa.tipo) }
                ]}
              />
            ))}
            {programasDelDia.length > 3 && (
              <Text style={styles.moreIndicator}>+{programasDelDia.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCalendarGrid = () => {
    const weeks = [];
    for (let i = 0; i < diasDelMes.length; i += 7) {
      weeks.push(diasDelMes.slice(i, i + 7));
    }

    return (
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map(renderDay)}
          </View>
        ))}
      </View>
    );
  };

  const renderSelectedDayPrograms = () => {
    if (!selectedDate) return null;

    const programasDelDia = getProgramasDelDia(selectedDate);
    
    return (
      <View style={styles.selectedDayContainer}>
        <Text style={styles.selectedDayTitle}>
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
        </Text>
        
        {programasDelDia.length === 0 ? (
          <View style={styles.noProgramsContainer}>
            <Icon name="event-available" size={wp(8)} color={colors.textTertiary} />
            <Text style={styles.noProgramsText}>
              No hay programas para este día
            </Text>
            <TouchableOpacity
              style={styles.addProgramButton}
              onPress={() => onDatePress(selectedDate)}
            >
              <Icon name="add" size={wp(4)} color={colors.primary} />
              <Text style={styles.addProgramText}>Programar evento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.dayProgramsList} showsVerticalScrollIndicator={false}>
            {programasDelDia.map((programa) => (
              <TouchableOpacity
                key={programa.id}
                style={styles.dayProgramItem}
                onPress={() => onProgramaPress(programa)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.programTipoIndicator,
                  { backgroundColor: getTipoColor(programa.tipo) }
                ]} />
                
                <View style={styles.programInfo}>
                  <Text style={styles.programTitle} numberOfLines={1}>
                    {programa.tema}
                  </Text>
                  <Text style={styles.programTime}>
                    {format(new Date(programa.fecha), 'HH:mm')} hrs
                  </Text>
                  <Text style={styles.programType}>
                    {programa.tipo.toUpperCase()} • {programa.grado.toUpperCase()}
                  </Text>
                </View>
                
                <Icon name="chevron-right" size={wp(5)} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderDaysOfWeek()}
        {renderCalendarGrid()}
        {renderSelectedDayPrograms()}
      </ScrollView>
    </View>
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
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: wp(3),
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: wp(2),
    backgroundColor: colors.background,
  },
  monthTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
  },
  
  // Días de la semana
  daysOfWeekContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    paddingVertical: spacing.sm,
  },
  dayOfWeekItem: {
    flex: 1,
    alignItems: 'center',
  },
  dayOfWeekText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  
  // Calendario
  calendarGrid: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderBottomLeftRadius: wp(3),
    borderBottomRightRadius: wp(3),
    paddingBottom: spacing.sm,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayContainer: {
    flex: 1,
    aspectRatio: 1,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
    borderRadius: wp(2),
    minHeight: wp(13),
  },
  dayContainerOtherMonth: {
    opacity: 0.3,
  },
  dayContainerToday: {
    backgroundColor: colors.primary,
  },
  dayContainerSelected: {
    backgroundColor: colors.info,
    elevation: 2,
  },
  dayContainerWithPrograms: {
    backgroundColor: colors.card,
  },
  dayText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  dayTextOtherMonth: {
    color: colors.textTertiary,
  },
  dayTextToday: {
    color: colors.background,
    fontWeight: 'bold',
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  
  // Indicadores de programas
  programasIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  programaIndicator: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    marginHorizontal: 1,
  },
  moreIndicator: {
    fontSize: fontSize.xs - 2,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  
  // Día seleccionado
  selectedDayContainer: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: wp(3),
    padding: spacing.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedDayTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  
  // Sin programas
  noProgramsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noProgramsText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  addProgramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addProgramText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  
  // Lista de programas del día
  dayProgramsList: {
    maxHeight: wp(60),
  },
  dayProgramItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: wp(2),
    elevation: 1,
  },
  programTipoIndicator: {
    width: wp(1),
    height: '100%',
    borderRadius: wp(0.5),
    marginRight: spacing.md,
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  programTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  programType: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontWeight: '500',
  },
});