import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectUser } from '../../store/slices/authSlice';
import { getGradoDisplayName, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const user = useSelector(selectUser);

  // Datos simulados para estadísticas (en producción vendrían de la API)
  const stats = [
    {
      title: 'Miembros Activos',
      value: '127',
      change: '+5.4%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Documentos',
      value: '89',
      change: '+12.3%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Programas',
      value: '24',
      change: '+8.1%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple',
    },
    {
      title: 'Asistencia',
      value: '94%',
      change: '+2.1%',
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'yellow',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'tenida',
      title: 'Tenida Ordinaria',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días adelante
      grado: 'maestro',
      status: 'programado',
    },
    {
      id: 2,
      type: 'documento',
      title: 'Nueva plancha sobre simbolismo',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
      grado: 'companero',
      status: 'publicado',
    },
    {
      id: 3,
      type: 'instruccion',
      title: 'Instrucción de primer grado',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días adelante
      grado: 'aprendiz',
      status: 'programado',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-400 bg-blue-400/10',
      green: 'text-green-400 bg-green-400/10',
      purple: 'text-purple-400 bg-purple-400/10',
      yellow: 'text-yellow-400 bg-yellow-400/10',
    };
    return colors[color] || 'text-gray-400 bg-gray-400/10';
  };

  const getActivityIcon = (type) => {
    const icons = {
      tenida: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      documento: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      instruccion: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    };
    return icons[type] || icons.documento;
  };

  return (
    <div className="space-y-8">
      {/* Header de bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="orpheo-card bg-gold-gradient"
      >
        <div className="text-primary-black">
          <h1 className="text-3xl font-serif font-bold mb-2">
            ¡Bienvenido, {user?.memberFullName || user?.username}!
          </h1>
          <p className="text-lg opacity-90">
            {getGradoDisplayName(user?.grado)} {user?.cargo && `• ${user.cargo}`}
          </p>
          <p className="text-sm opacity-75 mt-2">
            Hoy es {formatDate(new Date(), 'EEEE, dd \'de\' MMMM \'de\' yyyy')}
          </p>
        </div>
      </motion.div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="orpheo-card hover:shadow-gold/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-text text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-primary-gold mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-text text-sm ml-1">vs mes anterior</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Actividades recientes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 orpheo-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-primary-gold">
              Actividades Recientes
            </h2>
            <button className="text-primary-gold hover:text-primary-gold-secondary transition-colors text-sm font-medium">
              Ver todas
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-4 rounded-lg border border-gray-border hover:border-primary-gold/30 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-gold/10 rounded-lg flex items-center justify-center text-primary-gold">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-gray-text font-medium truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-border">
                      {formatDate(activity.date)}
                    </span>
                    <span className="text-gray-border">•</span>
                    <span className="text-sm text-primary-gold">
                      {getGradoDisplayName(activity.grado)}
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'programado' 
                      ? 'bg-blue-400/10 text-blue-400'
                      : 'bg-green-400/10 text-green-400'
                  }`}>
                    {activity.status === 'programado' ? 'Programado' : 'Completado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Panel lateral */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Próximos eventos */}
          <div className="orpheo-card">
            <h3 className="text-lg font-serif font-bold text-primary-gold mb-4">
              Próximos Eventos
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-gold rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-text font-medium">Tenida Ordinaria</p>
                  <p className="text-sm text-gray-border">Mañana - 19:00</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-text font-medium">Instrucción</p>
                  <p className="text-sm text-gray-border">Viernes - 20:00</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-text font-medium">Cena Fraternal</p>
                  <p className="text-sm text-gray-border">Sábado - 21:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="orpheo-card">
            <h3 className="text-lg font-serif font-bold text-primary-gold mb-4">
              Enlaces Rápidos
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-primary-gold/10 transition-colors flex items-center space-x-3">
                <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-text">Subir Documento</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-primary-gold/10 transition-colors flex items-center space-x-3">
                <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-gray-text">Ver Miembros</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-primary-gold/10 transition-colors flex items-center space-x-3">
                <svg className="w-5 h-5 text-primary-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-text">Crear Programa</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;