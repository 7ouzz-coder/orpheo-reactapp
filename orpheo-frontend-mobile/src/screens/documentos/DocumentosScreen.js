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

// Datos mock de documentos
const mockDocumentos = [
  {
    id: 1,
    titulo: 'Acta Tenida Ordinaria Marzo 2024',
    tipo: 'acta',
    autor: 'Juan Carlos Pérez',
    fecha: '2024-03-15',
    estado: 'aprobado',
    tamaño: '1.2 MB',
    descargas: 23,
    grado: 'maestro',
  },
  {
    id: 2,
    titulo: 'Plancha sobre Tolerancia',
    tipo: 'plancha',
    autor: 'Roberto Silva Martinez',
    fecha: '2024-03-10',
    estado: 'pendiente',
    tamaño: '856 KB',
    descargas: 12,
    grado: 'companero',
  },
  {
    id: 3,
    titulo: 'Circular - Cambio de Sede',
    tipo: 'circular',
    autor: 'Fernando López Castro',
    fecha: '2024-03-08',
    estado: 'aprobado',
    tamaño: '345 KB',
    descargas: 45,
    grado: 'aprendiz',
  },
  {
    id: 4,
    titulo: 'Reglamento Interno Actualizado',
    tipo: 'reglamento',
    autor: 'Carlos Eduardo Rojas',
    fecha: '2024-03-05',
    estado: 'revision',
    tamaño: '2.1 MB',
    descargas: 67,
    grado: 'maestro',
  },
  {
    id: 5,
    titulo: 'Informe Financiero Q1 2024',
    tipo: 'informe',
    autor: 'Miguel Angel Torres',
    fecha: '2024-03-01',
    estado: 'aprobado',
    tamaño: '1.8 MB',
    descargas: 34,
    grado: 'maestro',
  },
];

export default function DocumentosScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('todos');

  // Filtrar documentos
  const filteredDocumentos = mockDocumentos.filter(doc => {
    const matchesSearch = doc.titulo.toLowerCase().includes(searchText.toLowerCase());
    const matchesTipo = selectedTipo === 'todos' || doc.tipo === selectedTipo;
    return matchesSearch && matchesTipo;
  });

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado': return '#10B981';
      case 'pendiente': return '#F59E0B';
      case 'revision': return '#3B82F6';
      case 'rechazado': return '#EF4444';
      default: return '#A59F99';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'acta': return 'document-text';
      case 'plancha': return 'document';
      case 'circular': return 'megaphone';
      case 'reglamento': return 'library';
      case 'informe': return 'bar-chart';
      default: return 'document';
    }
  };

  const handleDocumentoPress = (documento) => {
    Alert.alert(
      documento.titulo,
      `Tipo: ${documento.tipo}\nAutor: ${documento.autor}\nFecha: ${documento.fecha}\nEstado: ${documento.estado}\nTamaño: ${documento.tamaño}\nDescargas: ${documento.descargas}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Descargar', onPress: () => Alert.alert('Descarga', 'Funcionalidad de descarga próximamente') }
      ]
    );
  };

  const handleUploadDocumento = () => {
    Alert.alert('Próximamente', 'La función para subir documentos estará disponible pronto.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documentos</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocumento}>
          <Ionicons name="cloud-upload" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#A59F99" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar documentos..."
            placeholderTextColor="#A59F99"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['todos', 'acta', 'plancha', 'circular', 'reglamento', 'informe'].map((tipo) => (
            <TouchableOpacity
              key={tipo}
              style={[
                styles.filterButton,
                selectedTipo === tipo && styles.filterButtonActive
              ]}
              onPress={() => setSelectedTipo(tipo)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedTipo === tipo && styles.filterButtonTextActive
              ]}>
                {tipo === 'todos' ? 'Todos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredDocumentos.length}</Text>
          <Text style={styles.statLabel}>Resultados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{mockDocumentos.reduce((sum, doc) => sum + doc.descargas, 0)}</Text>
          <Text style={styles.statLabel}>Descargas</Text>
        </View>
      </View>

      {/* Lista de documentos */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredDocumentos.map((documento) => (
          <TouchableOpacity
            key={documento.id}
            style={styles.documentoCard}
            onPress={() => handleDocumentoPress(documento)}
          >
            <View style={styles.documentoHeader}>
              <View style={styles.documentoIcon}>
                <Ionicons 
                  name={getTipoIcon(documento.tipo)} 
                  size={24} 
                  color="#D4AF37" 
                />
              </View>
              <View style={styles.documentoInfo}>
                <Text style={styles.documentoTitulo}>{documento.titulo}</Text>
                <Text style={styles.documentoAutor}>Por {documento.autor}</Text>
              </View>
              <View style={styles.documentoEstado}>
                <View style={[styles.estadoBadge, { backgroundColor: `${getEstadoColor(documento.estado)}20` }]}>
                  <Text style={[styles.estadoText, { color: getEstadoColor(documento.estado) }]}>
                    {documento.estado}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.documentoDetails}>
              <View style={styles.documentoDetailItem}>
                <Ionicons name="calendar" size={14} color="#A59F99" />
                <Text style={styles.documentoDetailText}>{documento.fecha}</Text>
              </View>
              <View style={styles.documentoDetailItem}>
                <Ionicons name="document" size={14} color="#A59F99" />
                <Text style={styles.documentoDetailText}>{documento.tamaño}</Text>
              </View>
              <View style={styles.documentoDetailItem}>
                <Ionicons name="download" size={14} color="#A59F99" />
                <Text style={styles.documentoDetailText}>{documento.descargas} descargas</Text>
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
  uploadButton: {
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
  documentoCard: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7A6F63',
  },
  documentoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentoInfo: {
    flex: 1,
  },
  documentoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A59F99',
    marginBottom: 4,
  },
  documentoAutor: {
    fontSize: 14,
    color: '#7A6F63',
  },
  documentoEstado: {
    marginLeft: 12,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  documentoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  documentoDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  documentoDetailText: {
    fontSize: 12,
    color: '#A59F99',
  },
});