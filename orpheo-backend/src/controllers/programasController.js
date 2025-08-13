const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Programa, User, Miembro, Asistencia } = require('../models');
const logger = require('../utils/logger');
const moment = require('moment');

class ProgramasController {

  // GET /api/programas - Obtener todos los programas con filtros y paginación
  async getProgramas(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const {
        page = 1,
        limit = 10,
        search = '',
        grado = '',
        tipo = '',
        estado = '',
        fecha_desde = '',
        fecha_hasta = '',
        sortBy = 'fecha',
        sortOrder = 'DESC'
      } = req.query;

      // Construir condiciones WHERE dinámicamente
      const whereConditions = {};

      // Filtro de búsqueda por tema o descripción
      if (search) {
        whereConditions[Op.or] = [
          { tema: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } },
          { orador: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Filtros específicos
      if (grado && grado !== 'todos') whereConditions.grado = grado;
      if (tipo && tipo !== 'todos') whereConditions.tipo = tipo;
      if (estado && estado !== 'todos') whereConditions.estado = estado;

      // Filtros de fecha
      if (fecha_desde && fecha_hasta) {
        whereConditions.fecha = {
          [Op.between]: [new Date(fecha_desde), new Date(fecha_hasta)]
        };
      } else if (fecha_desde) {
        whereConditions.fecha = { [Op.gte]: new Date(fecha_desde) };
      } else if (fecha_hasta) {
        whereConditions.fecha = { [Op.lte]: new Date(fecha_hasta) };
      }

      // Permisos por grado: usuarios solo ven programas de su grado o general
      if (req.user.rol === 'general') {
        const gradoJerarquia = { aprendiz: 1, companero: 2, maestro: 3 };
        const userLevel = gradoJerarquia[req.user.grado] || 1;
        
        const allowedGrades = Object.keys(gradoJerarquia)
          .filter(g => gradoJerarquia[g] <= userLevel)
          .concat(['general']);
          
        whereConditions.grado = { [Op.in]: allowedGrades };
      }

      // Calcular offset
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Realizar consulta con paginación
      const { count, rows: programas } = await Programa.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'creador',
            attributes: ['id', 'nombres', 'apellidos']
          },
          {
            model: Asistencia,
            as: 'asistencias',
            attributes: ['id', 'asistio', 'miembro_id'],
            include: [
              {
                model: Miembro,
                as: 'miembro',
                attributes: ['nombres', 'apellidos', 'grado']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        distinct: true
      });

      // Calcular estadísticas de asistencia para cada programa
      const programasConStats = programas.map(programa => {
        const programaData = programa.toJSON();
        const totalAsistencias = programaData.asistencias?.length || 0;
        const asistieron = programaData.asistencias?.filter(a => a.asistio).length || 0;
        
        programaData.estadisticas = {
          total_miembros: totalAsistencias,
          asistieron,
          porcentaje_asistencia: totalAsistencias > 0 ? ((asistieron / totalAsistencias) * 100).toFixed(1) : 0
        };

        return programaData;
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          programas: programasConStats,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          },
          filters: {
            search,
            grado,
            tipo,
            estado,
            fecha_desde,
            fecha_hasta,
            sortBy,
            sortOrder
          }
        }
      });

    } catch (error) {
      logger.error('Error obteniendo programas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/programas/estadisticas - Obtener estadísticas de programas
  async getEstadisticas(req, res) {
    try {
      // Total de programas
      const totalProgramas = await Programa.count();

      // Programas por estado
      const programasPorEstado = await Programa.findAll({
        attributes: [
          'estado',
          [Programa.sequelize.fn('COUNT', Programa.sequelize.col('id')), 'count']
        ],
        group: ['estado']
      });

      // Programas por tipo
      const programasPorTipo = await Programa.findAll({
        attributes: [
          'tipo',
          [Programa.sequelize.fn('COUNT', Programa.sequelize.col('id')), 'count']
        ],
        group: ['tipo']
      });

      // Programas por grado
      const programasPorGrado = await Programa.findAll({
        attributes: [
          'grado',
          [Programa.sequelize.fn('COUNT', Programa.sequelize.col('id')), 'count']
        ],
        group: ['grado']
      });

      // Estadísticas de asistencia general
      const asistenciaStats = await Asistencia.findAll({
        attributes: [
          [Asistencia.sequelize.fn('COUNT', Asistencia.sequelize.col('id')), 'total'],
          [Asistencia.sequelize.fn('SUM', Asistencia.sequelize.literal('CASE WHEN asistio = true THEN 1 ELSE 0 END')), 'asistieron']
        ]
      });

      const totalAsistencias = parseInt(asistenciaStats[0]?.dataValues?.total || 0);
      const totalAsistieron = parseInt(asistenciaStats[0]?.dataValues?.asistieron || 0);

      // Próximos programas (5 más cercanos)
      const proximosProgramas = await Programa.findAll({
        where: {
          fecha: { [Op.gte]: new Date() },
          estado: 'programado'
        },
        include: [
          {
            model: User,
            as: 'creador',
            attributes: ['nombres', 'apellidos']
          }
        ],
        order: [['fecha', 'ASC']],
        limit: 5
      });

      res.status(200).json({
        success: true,
        data: {
          resumen: {
            total_programas: totalProgramas,
            porcentaje_asistencia_general: totalAsistencias > 0 ? 
              ((totalAsistieron / totalAsistencias) * 100).toFixed(1) : 0
          },
          distribucion: {
            por_estado: programasPorEstado.map(p => ({
              estado: p.estado,
              cantidad: parseInt(p.dataValues.count)
            })),
            por_tipo: programasPorTipo.map(p => ({
              tipo: p.tipo,
              cantidad: parseInt(p.dataValues.count)
            })),
            por_grado: programasPorGrado.map(p => ({
              grado: p.grado,
              cantidad: parseInt(p.dataValues.count)
            }))
          },
          proximos_programas: proximosProgramas
        }
      });

    } catch (error) {
      logger.error('Error obteniendo estadísticas de programas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/programas/:id - Obtener un programa por ID
  async getProgramaById(req, res) {
    try {
      const { id } = req.params;

      const programa = await Programa.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creador',
            attributes: ['id', 'nombres', 'apellidos']
          },
          {
            model: Asistencia,
            as: 'asistencias',
            include: [
              {
                model: Miembro,
                as: 'miembro',
                attributes: ['id', 'nombres', 'apellidos', 'grado', 'email']
              }
            ]
          }
        ]
      });

      if (!programa) {
        return res.status(404).json({
          success: false,
          message: 'Programa no encontrado'
        });
      }

      // Verificar permisos de acceso según grado
      if (!this.canAccessPrograma(req.user, programa)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este programa'
        });
      }

      res.status(200).json({
        success: true,
        data: programa
      });

    } catch (error) {
      logger.error('Error obteniendo programa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/programas - Crear nuevo programa
  async createPrograma(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const {
        tema,
        descripcion,
        fecha,
        hora_inicio,
        hora_fin,
        tipo,
        grado,
        lugar,
        orador,
        estado = 'programado',
        observaciones
      } = req.body;

      // Verificar que no haya conflicto de horarios
      const conflicto = await Programa.findOne({
        where: {
          fecha: new Date(fecha),
          [Op.or]: [
            {
              hora_inicio: { [Op.between]: [hora_inicio, hora_fin] }
            },
            {
              hora_fin: { [Op.between]: [hora_inicio, hora_fin] }
            },
            {
              [Op.and]: [
                { hora_inicio: { [Op.lte]: hora_inicio } },
                { hora_fin: { [Op.gte]: hora_fin } }
              ]
            }
          ],
          estado: { [Op.ne]: 'cancelado' }
        }
      });

      if (conflicto) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un programa programado en ese horario'
        });
      }

      // Crear programa
      const nuevoPrograma = await Programa.create({
        tema: tema.trim(),
        descripcion: descripcion?.trim(),
        fecha: new Date(fecha),
        hora_inicio,
        hora_fin,
        tipo,
        grado,
        lugar: lugar?.trim(),
        orador: orador?.trim(),
        estado,
        observaciones: observaciones?.trim(),
        creado_por: req.user.id
      });

      // Crear asistencias automáticamente para todos los miembros elegibles
      await this.crearAsistenciasAutomaticas(nuevoPrograma);

      logger.audit('Programa creado', {
        programaId: nuevoPrograma.id,
        tema: nuevoPrograma.tema,
        fecha: nuevoPrograma.fecha,
        creadoPor: req.user.id,
        ip: req.ip
      });

      // Emitir evento WebSocket
      if (req.io) {
        req.io.emit('nuevo_programa', {
          id: nuevoPrograma.id,
          tema: nuevoPrograma.tema,
          fecha: nuevoPrograma.fecha,
          tipo: nuevoPrograma.tipo,
          grado: nuevoPrograma.grado
        });
      }

      // Obtener programa completo para respuesta
      const programaCompleto = await Programa.findByPk(nuevoPrograma.id, {
        include: [
          {
            model: User,
            as: 'creador',
            attributes: ['nombres', 'apellidos']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Programa creado exitosamente',
        data: programaCompleto
      });

    } catch (error) {
      logger.error('Error creando programa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/programas/:id - Actualizar programa
  async updatePrograma(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const programa = await Programa.findByPk(id);

      if (!programa) {
        return res.status(404).json({
          success: false,
          message: 'Programa no encontrado'
        });
      }

      // Verificar permisos
      if (!this.canModifyPrograma(req.user, programa)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este programa'
        });
      }

      const updateData = {};
      const allowedFields = [
        'tema', 'descripcion', 'fecha', 'hora_inicio', 'hora_fin',
        'tipo', 'grado', 'lugar', 'orador', 'estado', 'observaciones'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      // Si se cambió la fecha, verificar conflictos
      if (updateData.fecha) {
        const conflicto = await Programa.findOne({
          where: {
            id: { [Op.ne]: id },
            fecha: new Date(updateData.fecha),
            hora_inicio: updateData.hora_inicio || programa.hora_inicio,
            hora_fin: updateData.hora_fin || programa.hora_fin,
            estado: { [Op.ne]: 'cancelado' }
          }
        });

        if (conflicto) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un programa programado en ese horario'
          });
        }
      }

      await programa.update(updateData);

      logger.audit('Programa actualizado', {
        programaId: programa.id,
        cambios: updateData,
        actualizadoPor: req.user.id,
        ip: req.ip
      });

      // Emitir evento WebSocket
      if (req.io) {
        req.io.emit('programa_actualizado', {
          id: programa.id,
          cambios: updateData
        });
      }

      const programaActualizado = await Programa.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creador',
            attributes: ['nombres', 'apellidos']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Programa actualizado exitosamente',
        data: programaActualizado
      });

    } catch (error) {
      logger.error('Error actualizando programa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // DELETE /api/programas/:id - Eliminar programa
  async deletePrograma(req, res) {
    try {
      const { id } = req.params;
      const programa = await Programa.findByPk(id);

      if (!programa) {
        return res.status(404).json({
          success: false,
          message: 'Programa no encontrado'
        });
      }

      // Verificar permisos
      if (!this.canDeletePrograma(req.user, programa)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este programa'
        });
      }

      // Eliminar asistencias relacionadas primero
      await Asistencia.destroy({
        where: { programa_id: id }
      });

      await programa.destroy();

      logger.audit('Programa eliminado', {
        programaId: id,
        tema: programa.tema,
        eliminadoPor: req.user.id,
        ip: req.ip
      });

      // Emitir evento WebSocket
      if (req.io) {
        req.io.emit('programa_eliminado', {
          id: programa.id,
          tema: programa.tema
        });
      }

      res.status(200).json({
        success: true,
        message: 'Programa eliminado exitosamente'
      });

    } catch (error) {
      logger.error('Error eliminando programa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/programas/:programaId/asistencia - Gestionar asistencia
  async gestionarAsistencia(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { programaId } = req.params;
      const { miembroId, asistio, justificacion, horaLlegada } = req.body;

      // Verificar que existe el programa
      const programa = await Programa.findByPk(programaId);
      if (!programa) {
        return res.status(404).json({
          success: false,
          message: 'Programa no encontrado'
        });
      }

      // Verificar que existe el miembro
      const miembro = await Miembro.findByPk(miembroId);
      if (!miembro) {
        return res.status(404).json({
          success: false,
          message: 'Miembro no encontrado'
        });
      }

      // Buscar o crear asistencia
      let asistencia = await Asistencia.findOne({
        where: {
          programa_id: programaId,
          miembro_id: miembroId
        }
      });

      const asistenciaData = {
        asistio,
        justificacion: justificacion?.trim(),
        hora_llegada: horaLlegada,
        confirmado: true,
        registrado_por: req.user.id
      };

      if (asistencia) {
        await asistencia.update(asistenciaData);
      } else {
        asistencia = await Asistencia.create({
          programa_id: programaId,
          miembro_id: miembroId,
          ...asistenciaData
        });
      }

      logger.audit('Asistencia registrada', {
        programaId,
        miembroId,
        asistio,
        registradoPor: req.user.id,
        ip: req.ip
      });

      // Emitir evento WebSocket
      if (req.io) {
        req.io.emit('asistencia_actualizada', {
          programaId,
          miembroId,
          miembro: `${miembro.nombres} ${miembro.apellidos}`,
          asistio,
          timestamp: new Date()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Asistencia registrada exitosamente',
        data: asistencia
      });

    } catch (error) {
      logger.error('Error gestionando asistencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Métodos auxiliares

  // Crear asistencias automáticamente para miembros elegibles
  async crearAsistenciasAutomaticas(programa) {
    try {
      // Obtener miembros elegibles según el grado del programa
      const whereCondition = { estado: 'activo' };
      
      if (programa.grado !== 'general') {
        const gradoJerarquia = { aprendiz: 1, companero: 2, maestro: 3 };
        const programaLevel = gradoJerarquia[programa.grado];
        
        const allowedGrades = Object.keys(gradoJerarquia)
          .filter(g => gradoJerarquia[g] >= programaLevel);
          
        whereCondition.grado = { [Op.in]: allowedGrades };
      }

      const miembrosElegibles = await Miembro.findAll({
        where: whereCondition
      });

      // Crear asistencias
      const asistencias = miembrosElegibles.map(miembro => ({
        programa_id: programa.id,
        miembro_id: miembro.id,
        asistio: false,
        confirmado: false
      }));

      await Asistencia.bulkCreate(asistencias, {
        ignoreDuplicates: true
      });

      logger.info(`Asistencias creadas para programa ${programa.id}`, {
        programaId: programa.id,
        cantidadMiembros: miembrosElegibles.length
      });

    } catch (error) {
      logger.error('Error creando asistencias automáticas:', error);
    }
  }

  // Verificar permisos de acceso
  canAccessPrograma(user, programa) {
    // SuperAdmin y Admin pueden ver todo
    if (['superadmin', 'admin'].includes(user.rol)) {
      return true;
    }

    // Verificar acceso por grado
    const gradoJerarquia = { aprendiz: 1, companero: 2, maestro: 3 };
    const userLevel = gradoJerarquia[user.grado] || 1;
    const programaLevel = gradoJerarquia[programa.grado] || 1;

    // Si es general, todos pueden ver
    if (programa.grado === 'general') {
      return true;
    }

    // Puede ver si su grado es igual o superior
    return userLevel >= programaLevel;
  }

  // Verificar permisos de modificación
  canModifyPrograma(user, programa) {
    // Solo Admin, SuperAdmin y el creador pueden modificar
    if (['superadmin', 'admin'].includes(user.rol)) {
      return true;
    }

    return programa.creado_por === user.id;
  }

  // Verificar permisos de eliminación
  canDeletePrograma(user, programa) {
    // Solo Admin y SuperAdmin pueden eliminar
    return ['superadmin', 'admin'].includes(user.rol);
  }
}

module.exports = new ProgramasController();