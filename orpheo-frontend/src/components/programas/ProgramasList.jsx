import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  fetchProgramas, 
  setFilters, 
  setPagination,
  resetFilters,
  selectProgramas,
  selectProgramasLoading,
  selectProgramasError,
  selectProgramasFilters,
  selectProgramasPagination,
  selectProgramasStats,
} from '../../store/slices/programasSlice';
import { selectUser } from '../../store/slices/authSlice';
import { 
  formatDate, 
  formatFileSize, 
  getRelativeTime,
  getInitials 
} from '../../utils/helpers';
import { 
  PROGRAMA_TIPOS_DISPLAY, 
  PROGRAMA_ESTADOS_DISPLAY 
} from '../../utils/constants';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const ProgramasList = ({ 
  onCreatePrograma, 
  onEditPrograma, 
  onViewPrograma, 
  onManageAsistencia,
  onViewChange 
}) => {
  const dispatch = useDispatch();
  const programas = useSelector(selectProgramas);
  const isLoading = useSelector(selectProgramasLoading);
  const error = useSelector(selectProgramasError);
  const filters = useSelector(selectProgramasFilters);
  const pagination = useSelector(selectProgramasPagination);
  const stats = useSelector(selectProgramasStats);
  const user = useSelector(selectUser);

  // Cargar programas al montar
  useEffect(() => {
    dispatch(fetchProgramas());
  }, [dispatch]);

  // Recargar cuando cambian los filtros o paginación
  useEffect(() => {
    dispatch(fetchProgramas());
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Mostrar error si existe
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ page: newPage }));
  };

  const handle