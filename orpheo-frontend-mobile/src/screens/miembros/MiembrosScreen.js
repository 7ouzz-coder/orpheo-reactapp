import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Datos mock de miembros
const mockMiembros = [
  {
    id: 1,
    nombre: 'Juan Carlos Pérez',
    grado: 'maestro',
    cargo: 'Venerable Maestro',
    email: 'juan.perez@email.com',
    telefono: '+56 9 1234 5678',
    inicioMembresía: '2018-03-15',
  },
  {
    id: 2,
    nombre: 'Roberto Silva Martinez',
    grado: 'companero',
    cargo: 'Primer Vigilante',
    email: 'roberto.silva@email.com',
    telefono: '+56 9 2345 6789',
    inicioMembresía: '2020-07-22',
  },
  {
    id: 3,
    nombre: 'Carlos Eduardo Rojas',
    grado: 'aprendiz',
    cargo: null,
    email: 'carlos.rojas@email.com',
    telefono: '+56 9 3456 7890',
    inicioMembresía: '2023-01-10',
  },
  {
    id: 4,
    nombre: 'Fernando López Castro',
    grado: 'maestro',
    cargo: 'Secretario',
    email: 'fernando.lopez@email.com',
    telefono: '+56 9 4567 8901',
    inicioMembresía: '2019-11-08',
  },
  {
    id: 5,
    nombre: 'Miguel Angel Torres',
    grado: 'companero',
    cargo: 'Tesorero',
    email: 'miguel.torres@email.com',
    telefono: '+56 9 5678 9012',
    inicioMembresía: '2021-05-12',
  },
];

export default function MiembrosScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('todos');

  // Filtrar miembros
  const filteredMiembros = mockMiembros.filter(miembro => {
    const matchesSearch = miembro.nombre.toLowerCase().includes(searchText.toLowerCase());
    const matchesGrado = selectedGrado === 'todos' || miembro.grado === selectedGrado;
    return matchesSearch && matchesGrado;
  });

  const getGradoColor = (grado) => {
    switch (grado) {
      case 'aprendiz': return '#F59E0B';
      case 'companero': return '#10B981';
      case 'maestro': return '#3B82F6';
      default: return '#A59F99';
    }
  };

  const getGradoIcon = (grado) => {
    switch (grado) {
      case 'aprendiz': return '⚬';
      case 'companero': return '⚬⚬';
      case 'maestro': return '⚬⚬⚬';
      default: return '⚬';
    }
  };

  const handleMiembroPress = (miembro) => {
    Alert.alert(
      miembro.nombre,
      `Grado: ${miembro.grado}\n${miembro.cargo ? `Cargo: ${miembro.cargo}\n` : ''}Email: ${miembro.email}\nTeléfono: ${miembro.telefono}\nMiembro desde: ${miembro.inicioMembresía}`,
      [{ text: 'OK' }]
    );
  };

  const handleAddMiembro = () => {
    Alert.alert('Próximamente', 'La función para agregar miembros estará disponible pronto.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Miembros</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMiembro}>
          <Ionicons name="add" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#A59F99" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar miembros..."
            placeholderTextColor="#A59F99"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['todos', 'aprendiz', 'companero', 'maestro'].map((grado) => (
            <TouchableOpacity
              key={grado}
              style={[
                styles.filterButton,
                selectedGrado === grado && styles.filterButtonActive
              ]}
              onPress={() => setSelectedGrado(grado)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedGrado === grado && styles.filterButtonTextActive
              ]}>
                {grado === 'todos' ? 'Todos' : grado.charAt(0).toUpperCase() + grado.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredMiembros.length}</Text>
          <Text style={styles.statLabel}>Resultados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{mockMiembros.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Lista de miembros */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredMiembros.map((miembro) => (
          <TouchableOpacity
            key={miembro.id}
            style={styles.miembroCard}
            onPress={() => handleMiembroPress(miembro)}
          >
            <View style={styles.miembroHeader}>
              <View style={styles.miembroInfo}>
                <Text style={styles.miembroNombre}>{miembro.nombre}</Text>
                <Text style={styles.miembroCargo}>{miembro.cargo || 'Sin cargo'}</Text>
              </View>
              <View style={styles.miembroGrado}>
                <View style={[styles.gradoBadge, { backgroundColor: `${getGradoColor(miembro.grado)}20` }]}>
                  <Text style={[styles.gradoIcon, { color: getGradoColor(miembro.grado) }]}>
                    {getGradoIcon(miembro.grado)}
                  </Text>
                  <Text style={[styles.gradoText, { color: getGradoColor(miembro.grado) }]}>
                    {miembro.grado}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.miembroDetails}>
              <View style={styles.miembroDetailItem}>
                <Ionicons name="mail" size={14} color="#A59F99" />
                <Text style={styles.miembroDetailText}>{miembro.email}</Text>
              </View>
              <View style={styles.miembroDetailItem}>
                <Ionicons name="call" size={14} color="#A59F99" />
                <Text style={styles.miembroDetailText}>{miembro.telefono}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#7A6F63',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#7A6F63',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#A59F99',
    fontSize: 16,
    paddingVertical: 12,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#7A6F63',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterButtonText: {
    color: '#A59F99',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#0B0B0B',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7A6F63',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  statLabel: {
    fontSize: 12,
    color: '#A59F99',
    marginTop: 4,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  miembroCard: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7A6F63',
  },
  miembroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  miembroInfo: {
    flex: 1,
  },
  miembroNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A59F99',
    marginBottom: 4,
  },
  miembroCargo: {
    fontSize: 14,
    color: '#7A6F63',
  },
  miembroGrado: {
    marginLeft: 12,
  },
  gradoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  gradoIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  gradoText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  miembroDetails: {
    gap: 8,
  },
  miembroDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miembroDetailText: {
    fontSize: 14,
    color: '#A59F99',
  },
});