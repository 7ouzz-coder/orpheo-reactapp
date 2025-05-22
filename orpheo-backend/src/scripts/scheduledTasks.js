const cron = require('node-cron');
const { Programa } = require('../models');
const NotificationService = require('../services/notificationService');
const logger = require('../utils/logger');

class ScheduledTasks {
  
  static init() {
    this.setupNotificationReminders();
    this.setupDatabaseCleanup();
    this.setupBackupTasks();
    
    logger.info('Tareas programadas inicializadas');
  }

  // Recordatorios de programas
  static setupNotificationReminders() {
    // Ejecutar todos los días a las 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      try {
        logger.info('Ejecutando recordatorios de programas...');
        
        // Buscar programas en los próximos 3 días
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 3);
        
        const programasProximos = await Programa.findByDateRange(fechaInicio, fechaFin);
        
        for (const programa of programasProximos) {
          const diasRestantes = programa.getDiasRestantes();
          
          // Enviar recordatorio 3 días antes, 1 día antes y el mismo día
          if ([3, 1, 0].includes(diasRestantes)) {
            await NotificationService.notifyUpcomingProgram(programa);
          }
        }
        
        logger.info(`Recordatorios enviados para ${programasProximos.length} programas`);
      } catch (error) {
        logger.error('Error en recordatorios de programas:', error);
      }
    });
  }

  // Limpieza de base de datos
  static setupDatabaseCleanup() {
    // Ejecutar todos los días a las 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Ejecutando limpieza de base de datos...');
        
        // Limpiar notificaciones expiradas
        const deletedNotifications = await NotificationService.cleanExpiredNotifications();
        
        logger.info(`Limpieza completada: ${deletedNotifications} notificaciones eliminadas`);
      } catch (error) {
        logger.error('Error en limpieza de base de datos:', error);
      }
    });
  }

  // Tareas de backup
  static setupBackupTasks() {
    // Backup diario a las 3:00 AM
    cron.schedule('0 3 * * *', async () => {
      try {
        logger.info('Iniciando backup automático...');
        
        // Aquí implementarías la lógica de backup
        // Por ejemplo, usando pg_dump para PostgreSQL
        const { exec } = require('child_process');
        const timestamp = new Date().toISOString().split('T')[0];
        const backupFile = `backup_${timestamp}.sql`;
        
        exec(`pg_dump ${process.env.DATABASE_URL} > ${process.env.BACKUP_PATH}/${backupFile}`, (error, stdout, stderr) => {
          if (error) {
            logger.error('Error en backup:', error);
          } else {
            logger.info(`Backup creado exitosamente: ${backupFile}`);
          }
        });
        
      } catch (error) {
        logger.error('Error en backup automático:', error);
      }
    });
  }

  // Actualizar estados de programas
  static setupProgramStatusUpdater() {
    // Ejecutar cada hora
    cron.schedule('0 * * * *', async () => {
      try {
        const now = new Date();
        
        // Actualizar programas que ya pasaron pero siguen como 'programado'
        const programasPasados = await Programa.findAll({
          where: {
            fecha: { [require('sequelize').Op.lt]: now },
            estado: 'programado',
            activo: true
          }
        });
        
        for (const programa of programasPasados) {
          await programa.update({ estado: 'completado' });
          logger.info(`Programa ${programa.id} marcado como completado automáticamente`);
        }
        
      } catch (error) {
        logger.error('Error al actualizar estados de programas:', error);
      }
    });
  }
}

module.exports = ScheduledTasks;