import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { selectUser } from '../../store/slices/authSlice';
import { setPageTitle } from '../../store/slices/uiSlice';
import Layout from '../../components/common/Layout';
import { getGradoDisplayName } from '../../utils/helpers';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(setPageTitle('Dashboard'));
  }, [dispatch]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getGradoColor = (grado) => {
    const colors = {
      aprendiz: 'text-yellow-400',
      companero: 'text-green-400',
      maestro: 'text-blue-400',
    };
    return colors[grado] || 'text-gray-400';
  };

  // Datos mock para estadísticas
  const stats = [
    {
      title: 'Miembros Activos',
      value: '156',
      change: '+12',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Documentos Pendientes',
      value: '8',
      change: '-3',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Próximas Tenidas',
      value: '3',
      change: '+1',
      changeType: 'neutral',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Asistencia Promedio',
      value: '87%',
      change: '+5%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  // Actividades recientes mock
  const recentActivities = [
    {
      id: 1,
      type: 'member',
      title: 'Nuevo Aprendiz Iniciado',
      description: 'Pedro González ha sido iniciado como Aprendiz Masón',
      time: '2 horas',
      icon: '👤',
    },
    {
      id: 2,
      type: 'document',
      title: 'Plancha Aprobada',
      description: 'La plancha "El Simbolismo del Compás" ha sido aprobada',
      time: '5 horas',
      icon: '📄',
    },
    {
      id: 3,
      type: 'program',
      title: 'Tenida Programada',
      description: 'Tenida Ordinaria programada para el viernes 25 de mayo',
      time: '1 día',
      icon: '📅',
    },
    {
      id: 4,
      type: 'system',
      title: 'Actualización del Sistema',
      description: 'Se ha actualizado el módulo de gestión de miembros',
      time: '2 días',
      icon: '⚙️',
    },
  ];

  // Próximos eventos mock
  const upcomingEvents = [
    {
      id: 1,
      title: 'Tenida Ordinaria',
      date: '2025-05-25',
      time: '19:30',
      type: 'tenida',
      participants: 45,
    },
    {
      id: 2,
      title: 'Ceremonia de Grado',
      date: '2025-05-30',
      time: '20:00',
      type: 'ceremonia',
      participants: 32,
    },
    {
      id: 3,
      title: 'Conferencia Masónica',
      date: '2025-06-05',
      time: '19:00',
      type: 'conferencia',
      participants: 28,
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="orpheo-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary-gold mb-2">
                {getGreeting()}, {user?.memberFullName?.split(' ')[0] || user?.username}
              </h1>
              <p className="text-gray-text">
                Bienvenido al sistema de gestión de la logia •{' '}
                <span className={getGradoColor(user?.grado)}>
                  {getGradoDisplayName(user?.grado)}
                </span>
                {user?.cargo && (
                  <span className="text-primary-gold">
                    {' '} • {user.cargo.replace('_', ' ')}
                  </span>
                )}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-primary-gold rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="orpheo-card hover:border-primary-gold/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-border text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-text mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm ${
                        stat.changeType === 'positive'
                          ? 'text-green-400'
                          : stat.changeType === 'negative'
                          ? 'text-red-400'
                          : 'text-gray-border'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-gray-border text-sm ml-1">este mes</span>
                  </div>
                </div>
                <div className="text-primary-gold opacity-80">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="orpheo-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-primary-gold">
                  Actividad Reciente
                </h2>
                <button className="text-sm text-gray-border hover:text-primary-gold transition-colors">
                  Ver todo
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 rounded-lg hover:bg-primary-gold/5 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary-gold/10 rounded-full flex items-center justify-center text-lg">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-text font-medium">{activity.title}</p>
                      <p className="text-gray-border text-sm mt-1">{activity.description}</p>
                    </div>
                    <div className="text-gray-border text-sm">
                      hace {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="orpheo-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-primary-gold">
                  Próximos Eventos
                </h2>
                <button className="text-sm text-gray-border hover:text-primary-gold transition-colors">
                  Ver calendario
                </button>
              </div>
              
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-border rounded-lg hover:border-primary-gold/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-text">{event.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          event.type === 'tenida'
                            ? 'bg-blue-400/10 text-blue-400'
                            : event.type === 'ceremonia'
                            ? 'bg-yellow-400/10 text-yellow-400'
                            : 'bg-green-400/10 text-green-400'
                        }`}
                      >
                        {event.type}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-border space-x-4">
                      <span>📅 {event.date}</span>
                      <span>🕒 {event.time}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-border">
                      👥 {event.participants} participantes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="orpheo-card"
        >
          <h2 className="text-xl font-serif font-bold text-primary-gold mb-6">
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-border rounded-lg hover:border-primary-gold/30 hover:bg-primary-gold/5 transition-all group">
              <div className="w-8 h-8 text-primary-gold group-hover:scale-110 transition-transform mx-auto mb-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm text-gray-text group-hover:text-primary-gold transition-colors">
                Nuevo Miembro
              </p>
            </button>

            <button className="p-4 border border-gray-border rounded-lg hover:border-primary-gold/30 hover:bg-primary-gold/5 transition-all group">
              <div className="w-8 h-8 text-primary-gold group-hover:scale-110 transition-transform mx-auto mb-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-text group-hover:text-primary-gold transition-colors">
                Subir Documento
              </p>
            </button>

            <button className="p-4 border border-gray-border rounded-lg hover:border-primary-gold/30 hover:bg-primary-gold/5 transition-all group">
              <div className="w-8 h-8 text-primary-gold group-hover:scale-110 transition-transform mx-auto mb-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-text group-hover:text-primary-gold transition-colors">
                Programar Tenida
              </p>
            </button>

            <button className="p-4 border border-gray-border rounded-lg hover:border-primary-gold/30 hover:bg-primary-gold/5 transition-all group">
              <div className="w-8 h-8 text-primary-gold group-hover:scale-110 transition-transform mx-auto mb-2">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-text group-hover:text-primary-gold transition-colors">
                Ver Reportes
              </p>
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default DashboardPage;