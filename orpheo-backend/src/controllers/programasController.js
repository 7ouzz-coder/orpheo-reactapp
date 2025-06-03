const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Programa, User, Miembro, Asistencia } = require('../models');
const logger = require('../utils/logger');
const { canViewGrado, hasPermission, canPerformCRUD } = require('../utils/permissions');
const NotificationService = require('../services/notificationService');

const programasController = {
  // Obtener todos los programas
  async getProgramas(req, res) {
    try {
      const { 
        grado, 
        tipo, 
        estado, 
        fecha_desde,
        fecha_hasta,
        search, 
        page = 1, 
        limit = 20, 
        sortBy = 'fecha', 
        sortOrder = 'ASC' 
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Construir condiciones de búsqueda
      const where = { activo: true };
      
      // Filtro por grado con permisos
      if (grado && grado !== 'todos') {
        if (!canViewGrado(req.user.grado, grado)) {
          return res.status(403).json({
            success: false,
            message: 'No tiene permisos para ver programas de este grado'
          });
        }
        where.grado = grado;
      } else {
        // Aplicar filtros por permisos de grado
        const allowedGrados = [];
        if (canViewGrado(req.user.grado, 'aprendiz')) allowedGrados.push('aprendiz');
        if (canViewGrado(req.user.grado, 'companero')) allowedGrados.push('companero');
        if (canViewGrado(req.user.grado, 'maestro')) allowedGrados.push('maestro');
        allowedGrados.push('general'); // Todos pueden ver programas generales
        
        where.grado = { [Op.in]: allowedGrados };
      }
      
      // Filtros adicionales
      if (tipo && tipo !== 'todos') {
        where.tipo = tipo;
      }
      
      if (estado && estado !== 'todos') {
        where.estado = estado;
      }
      
      // Filtro por rango de fechas
      if (fecha_desde || fecha_hasta) {
        where.fecha = {};
        if (fecha_desde) where.fecha[Op.gte] = new Date(fecha_desde);
        if (fecha_hasta) where.fecha[Op.lte] = new Date(fecha_hasta);
      }
      
      // Búsqueda por texto
      if (search) {
        where[Op.or] = [
          { tema: { [Op.iLike]: `%${search}%` } },
          { encargado: { [Op.iLike]: `%${search}%` } },
          { quien_imparte: { [Op.iLike]: `%${search}%` } },
          { resumen: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Ejecutar consulta
      const { count, rows } = await Programa.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'responsable',
            attributes: ['id', 'username', 'member_full_name'],
            required: false
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      // Formatear respuesta
      const programas = rows.map(programa => ({
        id: programa.id,
        tema: programa.tema,
        fecha: programa.fecha,
        encargado: programa.encargado,
        quienImparte: programa.quien_imparte,
        resumen: programa.resumen,
        grado: programa.grado,
        tipo: programa.tipo,
        estado: programa.estado,
        ubicacion: programa.ubicacion,
        requiereConfirmacion: programa.requiere_confirmacion,
        limiteAsistentes: programa.limite_asistentes,
        esFuturo: programa.esFuturo(),
        diasRestantes: programa.getDiasRestantes(),
        responsable: programa.responsable ? {
          id: programa.responsable.id,
          nombre: programa.responsable.member_full_name || programa.responsable.username
        } : null,
        createdAt: programa.created_at,
        updatedAt: programa.updated_at
      }));
      
      res.json({
        success: true,
        data: programas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
      
    } catch (error) {
      logger.error('Error al obtener programas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener un programa por ID
  async getProgramaById(req, res) {
    try {
      const { id } = req.params;
      
      const programa = await Programa.findByPk(id, {
        include: [
          {
            model: User,
            as: 'responsable',
            attributes: ['id', 'username', 'member_full_name', 'email']
          },
          {
            model: Asistencia,
            as: 'asistencias',
            include: [
              {
                model: Miembro,
                as: 'miembro',
                attributes: ['id', 'nombres', 'apellidos', 'grado']
              }
            ]
          }
        ]
      });
      
      if (!programa || !programa.activo) {
        return res.status(404).json({
          success: false,
          message: 'Programa no encontrado'
        });
      }
      
      // Verificar permisos
      if (!canViewGrado(req.user.grado, programa.grado)) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para ver este programa'
        });
      }
      
      // Obtener estadísticas de asistencia
      const estadisticasAsistencia = await Asistencia.getEstadisticasByPrograma(programa.id);
      
      res.json({
        success: true,
        data: {
          id: programa.id,
          tema: programa.tema,
          fecha: programa.fecha,
          encargado: programa.encargado,
          quienImparte: programa.quien_imparte,
          resumen: programa.resumen,
          grado: programa.grado,
          tipo: programa.tipo,
          estado: programa.estado,
          ubicacion: programa.ubicacion,
          detallesAdicionales: programa.detalles_adicionales,
          requiereConfirmacion: programa.requiere_confirmacion,
          limiteAsistentes: programa.limite_asistentes,
          observaciones: programa.observaciones,
          esFuturo: programa.esFuturo(),
          diasRestantes: programa.getDiasRestantes(),
          documentosRelacionados: programa.getDocumentosRelacionados(),
          responsable: programa.responsable ? {
            id: programa.responsable.id,
            nombre: programa.responsable.member_full_name || programa.responsable.username,
            email: programa.responsable.email
          } : null,
          asistencias: programa.asistencias?.map(asistencia => ({
            id: asistencia.id,
            asistio: asistencia.asistio,
            confirmado: asistencia.confirmado,
            justificacion: asistencia.justificacion,
            horaLlegada: asistencia.hora_llegada,
            miembro: {
              id: asistencia.miembro.id,
              nombre: `${asistencia.miembro.nombres} ${asistencia.miembro.apellidos}`,
              grado: asistencia.miembro.grado
            }
          })) || [],
          estadisticasAsistencia,
          createdAt: programa.created_at,
          updatedAt: programa.updated_at
        }
      });
      
    } catch (error) {
      logger.error('Error al obtener programa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Crear nuevo programa
  async createPrograma(req, res) {
    try {
      // Verificar permisos
      if (!hasPermission(req.user, 'create_programs')) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para crear programas'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      // Crear programa
      const nuevoPrograma = await Programa.create({
        tema: req.body.tema,
        fecha: req.body.fecha,
        encargado: req.body.encargado,
        quien_imparte: req.body.quienImparte,
        resumen: req.body.resumen,
        grado: req.body.grado,
        tipo: req.body.tipo,
        estado: req.body.estado || 'programado',
        ubicacion: req.body.ubicacion,
        detalles_adicionales: req.body.detallesAdicionales,
        requiere_confirmacion: req.body.requiereConfirmacion !== false,
        limite_asistentes: req.body.limiteAsistentes,
        observaciones: req.body.observaciones,
        responsable_id: req.user.id,
        responsable_nombre: req.user.member_full_name || req.user.username
      });

      logger.info(`Nuevo programa creado - ID: ${nuevoPrograma.id}, Tema: ${nuevoPrograma.tema}`);

      // Emitir notificación en tiempo real
      const io = req.app.get('io');
      io.emit('new_program', {
        type: 'new_program',
        data: {
          id: nuevoPrograma.id,
          tema: nuevoPrograma.tema,
          fecha: nuevoPrograma.fecha,
          grado: nuevoPrograma.grado
        }
      });

      // Enviar notificación automática
      await NotificationService.notifyNewProgram(nuevoPrograma, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Programa creado exitosamente',
        data: {
          id: nuevoPrograma.id,
          tema: nuevoPrograma.tema,
          fecha: nuevoPrograma.fecha,
          grado: nuevoPrograma.grado,
          tipo: nuevoPrograma.tipo
        }
      });

    } catch (error) {
      logger.error('Error al crear programa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar programa
  async updatePrograma(req, res) {
    try {
      const { id } = req.params;
      
      const programa = await Programa.findByPk(id);
      if (!programa || !programa.activo) {
        return res.status(404).json({
          success: false,
          message: 'Programa no encontrado'
        });
      }

      // Verificar permisos
      if (!canPerformCRUD(req.user, 'programas', 'update', programa)) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para actualizar este programa'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      // Actualizar programa
      await programa.update({
        tema: req.body.tema || programa.tema,
        fecha: req.body.fecha || programa.fecha,
        encargado: req.body.encargado || programa.encargado,
        quien_imparte: req.body.quienImparte !== undefined ? req.body.quienImparte : programa.quien_imparte,
        resumen: req.body.resumen !== undefined ? req.body.resumen : programa.resumen,
        grado: req.body.grado || programa.grado,
        tipo: req.body.tipo || programa.tipo,
        estado: req.body.estado || programa.estado,
        ubicacion: req.body.ubicacion !== undefined ? req.body.ubicacion : programa.ubicacion,
        detalles_adicionales: req.body.detallesAdicionales !== undefined ? req.body.detallesAdicionales : programa.detalles_adicionales,
        requiere_confirmacion: req.body.requiereConfirmacion !== undefined ? req.body.requiereConfirmacion : programa.requiere_confirmacion,
        limite_asistentes: req.body.limiteAsistentes !== undefined ? req.body.limiteAsistentes : programa.limite_asistentes,
        observaciones: req.body.observaciones !== undefined ? req.body.observaciones : programa.observaciones
      });

      logger.info(`Programa actualizado - ID: ${programa.id}`);

      res.json({
        success: true,
        message: 'Programa actualizado exitosamente',
        data: {
          id: programa.id,
          tema: programa.tema,
          fecha: programa.fecha,
          grado: programa.grado,
          updatedAt: programa.updated_at
        }
      });

    } catch (error) {
      logger.error('Error al actualizar programa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar programa
  async deletePrograma(req, res) {
    try {
      const { id } = req.params;
      
      const programa = await Programa.findByPk(id);
      if (!programa || !programa.activo) {
        return res.status(404).json({
          success: false,
          message: 'Programa no encontrado'
        });
      }

      // Verificar permisos
      if (!canPerformCRUD(req.user, 'programas', 'delete', programa)) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para eliminar este programa'
        });
      }

      // Soft delete
      await programa.update({ activo: false });

      logger.info(`Programa eliminado (soft delete) - ID: ${programa.id}`);

      res.json({
        success: true,
        message: 'Programa eliminado exitosamente'
      });

    } catch (error) {
      logger.error('Error al eliminar programa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Gestionar asistencia
  async gestionarAsistencia(req, res) {
    try {
      const { programaId } = req.params;
      const { miembroId, asistio, justificacion, horaLlegada } = req.body;

      // Verificar permisos
      if (!hasPermission(req.user, 'manage_attendance')) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para gestionar asistencia'
        });
      }

      const programa = await Programa.findByPk(programaId);
      if (!programa || !programa.activo) {
        return res.status(404).json({
          success: false,
          message: 'Programa no encontrado'
        });
      }

      const miembro = await Miembro.findByPk(miembroId);
      if (!miembro || !miembro.vigente) {
        return res.status(404).json({
          success: false,
          message: 'Miembro no encontrado'
        });
      }

      // Buscar o crear registro de asistencia
      let asistencia = await Asistencia.findOne({
        where: { programa_id: programaId, miembro_id: miembroId }
      });

      if (asistencia) {
        // Actualizar asistencia existente
        await asistencia.update({
          asistio,
          justificacion,
          hora_llegada: horaLlegada,
          registrado_por_id: req.user.id,
          registrado_por_nombre: req.user.member_full_name || req.user.username
        });
      } else {
        // Crear nueva asistencia
        asistencia = await Asistencia.create({
          programa_id: programaId,
          miembro_id: miembroId,
          asistio,
          justificacion,
          hora_llegada: horaLlegada,
          registrado_por_id: req.user.id,
          registrado_por_nombre: req.user.member_full_name || req.user.username,
          nombre_miembro: miembro.getNombreCompleto(),
          grado_miembro: miembro.grado
        });
      }

      logger.info(`Asistencia gestionada - Programa: ${programaId}, Miembro: ${miembroId}, Asistio: ${asistio}`);

      res.json({
        success: true,
        message: 'Asistencia registrada exitosamente',
        data: {
          id: asistencia.id,
          asistio: asistencia.asistio,
          justificacion: asistencia.justificacion,
          horaLlegada: asistencia.hora_llegada
        }
      });

    } catch (error) {
      logger.error('Error al gestionar asistencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener estadísticas de programas
  async getEstadisticas(req, res) {
    try {
      const stats = {};

      // Estadísticas generales
      stats.total = await Programa.count({ where: { activo: true } });
      stats.totalInactivos = await Programa.count({ where: { activo: false } });

      // Por grado
      const gradoCounts = await Programa.findAll({
        attributes: [
          'grado',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        where: { activo: true },
        group: ['grado'],
        raw: true
      });

      stats.porGrado = {
        aprendiz: 0,
        companero: 0,
        maestro: 0,
        general: 0
      };

      gradoCounts.forEach(item => {
        stats.porGrado[item.grado] = parseInt(item.count);
      });

      // Por tipo
      const tipoCounts = await Programa.findAll({
        attributes: [
          'tipo',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        where: { activo: true },
        group: ['tipo'],
        raw: true
      });

      stats.porTipo = {};
      tipoCounts.forEach(item => {
        stats.porTipo[item.tipo] = parseInt(item.count);
      });

      // Por estado
      const estadoCounts = await Programa.findAll({
        attributes: [
          'estado',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        where: { activo: true },
        group: ['estado'],
        raw: true
      });

      stats.porEstado = {};
      estadoCounts.forEach(item => {
        stats.porEstado[item.estado] = parseInt(item.count);
      });

      // Próximos programas
      stats.proximos = await Programa.count({
        where: {
          fecha: { [Op.gt]: new Date() },
          activo: true
        }
      });

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Error al obtener estadísticas de programas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = programasController;