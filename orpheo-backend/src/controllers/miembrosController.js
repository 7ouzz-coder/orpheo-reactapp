const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Miembro, User } = require('../models');
const logger = require('../utils/logger');
const { canViewGrado, hasPermission } = require('../utils/permissions');

const miembrosController = {
  // Obtener todos los miembros
  async getMiembros(req, res) {
    try {
      const { grado, search, page = 1, limit = 20, sortBy = 'apellidos', sortOrder = 'ASC' } = req.query;
      const offset = (page - 1) * limit;
      
      // Construir condiciones de búsqueda
      const where = { vigente: true };
      
      // Filtro por grado
      if (grado && grado !== 'todos') {
        // Verificar permisos para ver este grado
        if (!canViewGrado(req.user.grado, grado)) {
          return res.status(403).json({
            success: false,
            message: 'No tiene permisos para ver miembros de este grado'
          });
        }
        where.grado = grado;
      } else {
        // Si no especifica grado, aplicar filtros por permisos
        const allowedGrados = [];
        if (canViewGrado(req.user.grado, 'aprendiz')) allowedGrados.push('aprendiz');
        if (canViewGrado(req.user.grado, 'companero')) allowedGrados.push('companero');
        if (canViewGrado(req.user.grado, 'maestro')) allowedGrados.push('maestro');
        
        where.grado = { [Op.in]: allowedGrados };
      }
      
      // Búsqueda por texto
      if (search) {
        where[Op.or] = [
          { nombres: { [Op.iLike]: `%${search}%` } },
          { apellidos: { [Op.iLike]: `%${search}%` } },
          { rut: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Ejecutar consulta
      const { count, rows } = await Miembro.findAndCountAll({
        where,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [{
          model: User,
          as: 'usuario',
          attributes: ['id', 'username', 'is_active'],
          required: false
        }]
      });
      
      // Formatear respuesta
      const miembros = rows.map(miembro => ({
        id: miembro.id,
        nombres: miembro.nombres,
        apellidos: miembro.apellidos,
        nombreCompleto: miembro.getNombreCompleto(),
        rut: miembro.rut,
        grado: miembro.grado,
        cargo: miembro.cargo,
        email: miembro.email,
        telefono: miembro.telefono,
        vigente: miembro.vigente,
        edad: miembro.getEdad(),
        tieneUsuario: !!miembro.usuario,
        fechaIniciacion: miembro.fecha_iniciacion,
        createdAt: miembro.created_at,
        updatedAt: miembro.updated_at
      }));
      
      res.json({
        success: true,
        data: miembros,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
      
    } catch (error) {
      logger.error('Error al obtener miembros:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener un miembro por ID
  async getMiembroById(req, res) {
    try {
      const { id } = req.params;
      
      const miembro = await Miembro.findByPk(id, {
        include: [{
          model: User,
          as: 'usuario',
          attributes: ['id', 'username', 'email', 'is_active', 'last_login']
        }]
      });
      
      if (!miembro) {
        return res.status(404).json({
          success: false,
          message: 'Miembro no encontrado'
        });
      }
      
      // Verificar permisos
      if (!canViewGrado(req.user.grado, miembro.grado)) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para ver este miembro'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: miembro.id,
          nombres: miembro.nombres,
          apellidos: miembro.apellidos,
          nombreCompleto: miembro.getNombreCompleto(),
          rut: miembro.rut,
          grado: miembro.grado,
          cargo: miembro.cargo,
          vigente: miembro.vigente,
          
          // Información de contacto
          email: miembro.email,
          telefono: miembro.telefono,
          direccion: miembro.direccion,
          
          // Información profesional
          profesion: miembro.profesion,
          ocupacion: miembro.ocupacion,
          trabajoNombre: miembro.trabajo_nombre,
          trabajoDireccion: miembro.trabajo_direccion,
          trabajoTelefono: miembro.trabajo_telefono,
          trabajoEmail: miembro.trabajo_email,
          
          // Información familiar
          parejaNombre: miembro.pareja_nombre,
          parejaTelefono: miembro.pareja_telefono,
          contactoEmergenciaNombre: miembro.contacto_emergencia_nombre,
          contactoEmergenciaTelefono: miembro.contacto_emergencia_telefono,
          
          // Fechas importantes
          fechaNacimiento: miembro.fecha_nacimiento,
          fechaIniciacion: miembro.fecha_iniciacion,
          fechaAumentoSalario: miembro.fecha_aumento_salario,
          fechaExaltacion: miembro.fecha_exaltacion,
          edad: miembro.getEdad(),
          
          // Salud
          situacionSalud: miembro.situacion_salud,
          observaciones: miembro.observaciones,
          
          // Usuario asociado
          usuario: miembro.usuario ? {
            id: miembro.usuario.id,
            username: miembro.usuario.username,
            email: miembro.usuario.email,
            isActive: miembro.usuario.is_active,
            lastLogin: miembro.usuario.last_login
          } : null,
          
          // Metadatos
          createdAt: miembro.created_at,
          updatedAt: miembro.updated_at
        }
      });
      
    } catch (error) {
      logger.error('Error al obtener miembro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Crear nuevo miembro
  async createMiembro(req, res) {
    try {
      // Verificar permisos
      if (!hasPermission(req.user, 'manage_members')) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para crear miembros'
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

      // Verificar que el RUT no exista
      const existingMiembro = await Miembro.findByRUT(req.body.rut);
      if (existingMiembro) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un miembro con este RUT'
        });
      }

      // Crear miembro
      const nuevoMiembro = await Miembro.create({
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        rut: req.body.rut,
        grado: req.body.grado,
        cargo: req.body.cargo,
        email: req.body.email,
        telefono: req.body.telefono,
        direccion: req.body.direccion,
        profesion: req.body.profesion,
        ocupacion: req.body.ocupacion,
        trabajo_nombre: req.body.trabajoNombre,
        trabajo_direccion: req.body.trabajoDireccion,
        trabajo_telefono: req.body.trabajoTelefono,
        trabajo_email: req.body.trabajoEmail,
        pareja_nombre: req.body.parejaNombre,
        pareja_telefono: req.body.parejaTelefono,
        contacto_emergencia_nombre: req.body.contactoEmergenciaNombre,
        contacto_emergencia_telefono: req.body.contactoEmergenciaTelefono,
        fecha_nacimiento: req.body.fechaNacimiento,
        fecha_iniciacion: req.body.fechaIniciacion,
        fecha_aumento_salario: req.body.fechaAumentoSalario,
        fecha_exaltacion: req.body.fechaExaltacion,
        situacion_salud: req.body.situacionSalud,
        observaciones: req.body.observaciones
      });

      logger.info(`Nuevo miembro creado - ID: ${nuevoMiembro.id}, RUT: ${nuevoMiembro.rut}`);

      // Emitir notificación en tiempo real
      const io = req.app.get('io');
      io.emit('new_member', {
        type: 'new_member',
        data: {
          id: nuevoMiembro.id,
          nombre: nuevoMiembro.getNombreCompleto(),
          grado: nuevoMiembro.grado
        }
      });

      res.status(201).json({
        success: true,
        message: 'Miembro creado exitosamente',
        data: {
          id: nuevoMiembro.id,
          nombres: nuevoMiembro.nombres,
          apellidos: nuevoMiembro.apellidos,
          rut: nuevoMiembro.rut,
          grado: nuevoMiembro.grado
        }
      });

    } catch (error) {
      logger.error('Error al crear miembro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar miembro
  async updateMiembro(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar permisos
      if (!hasPermission(req.user, 'manage_members')) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para actualizar miembros'
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

      const miembro = await Miembro.findByPk(id);
      if (!miembro) {
        return res.status(404).json({
          success: false,
          message: 'Miembro no encontrado'
        });
      }

      // Si cambia el RUT, verificar que no exista
      if (req.body.rut && req.body.rut !== miembro.rut) {
        const existingMiembro = await Miembro.findByRUT(req.body.rut);
        if (existingMiembro) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un miembro con este RUT'
          });
        }
      }

      // Actualizar miembro
      await miembro.update({
        nombres: req.body.nombres || miembro.nombres,
        apellidos: req.body.apellidos || miembro.apellidos,
        rut: req.body.rut || miembro.rut,
        grado: req.body.grado || miembro.grado,
        cargo: req.body.cargo !== undefined ? req.body.cargo : miembro.cargo,
        email: req.body.email !== undefined ? req.body.email : miembro.email,
        telefono: req.body.telefono !== undefined ? req.body.telefono : miembro.telefono,
        direccion: req.body.direccion !== undefined ? req.body.direccion : miembro.direccion,
        profesion: req.body.profesion !== undefined ? req.body.profesion : miembro.profesion,
        ocupacion: req.body.ocupacion !== undefined ? req.body.ocupacion : miembro.ocupacion,
        trabajo_nombre: req.body.trabajoNombre !== undefined ? req.body.trabajoNombre : miembro.trabajo_nombre,
        trabajo_direccion: req.body.trabajoDireccion !== undefined ? req.body.trabajoDireccion : miembro.trabajo_direccion,
        trabajo_telefono: req.body.trabajoTelefono !== undefined ? req.body.trabajoTelefono : miembro.trabajo_telefono,
       trabajo_email: req.body.trabajoEmail !== undefined ? req.body.trabajoEmail : miembro.trabajo_email,
       pareja_nombre: req.body.parejaNombre !== undefined ? req.body.parejaNombre : miembro.pareja_nombre,
       pareja_telefono: req.body.parejaTelefono !== undefined ? req.body.parejaTelefono : miembro.pareja_telefono,
       contacto_emergencia_nombre: req.body.contactoEmergenciaNombre !== undefined ? req.body.contactoEmergenciaNombre : miembro.contacto_emergencia_nombre,
       contacto_emergencia_telefono: req.body.contactoEmergenciaTelefono !== undefined ? req.body.contactoEmergenciaTelefono : miembro.contacto_emergencia_telefono,
       fecha_nacimiento: req.body.fechaNacimiento !== undefined ? req.body.fechaNacimiento : miembro.fecha_nacimiento,
       fecha_iniciacion: req.body.fechaIniciacion !== undefined ? req.body.fechaIniciacion : miembro.fecha_iniciacion,
       fecha_aumento_salario: req.body.fechaAumentoSalario !== undefined ? req.body.fechaAumentoSalario : miembro.fecha_aumento_salario,
       fecha_exaltacion: req.body.fechaExaltacion !== undefined ? req.body.fechaExaltacion : miembro.fecha_exaltacion,
       situacion_salud: req.body.situacionSalud !== undefined ? req.body.situacionSalud : miembro.situacion_salud,
       observaciones: req.body.observaciones !== undefined ? req.body.observaciones : miembro.observaciones,
       vigente: req.body.vigente !== undefined ? req.body.vigente : miembro.vigente
     });

     logger.info(`Miembro actualizado - ID: ${miembro.id}, RUT: ${miembro.rut}`);

     // Emitir notificación en tiempo real
     const io = req.app.get('io');
     io.emit('member_updated', {
       type: 'member_updated',
       data: {
         id: miembro.id,
         nombre: miembro.getNombreCompleto(),
         grado: miembro.grado
       }
     });

     res.json({
       success: true,
       message: 'Miembro actualizado exitosamente',
       data: {
         id: miembro.id,
         nombres: miembro.nombres,
         apellidos: miembro.apellidos,
         rut: miembro.rut,
         grado: miembro.grado,
         updatedAt: miembro.updated_at
       }
     });

   } catch (error) {
     logger.error('Error al actualizar miembro:', error);
     res.status(500).json({
       success: false,
       message: 'Error interno del servidor'
     });
   }
 },

 // Eliminar miembro (soft delete)
 async deleteMiembro(req, res) {
   try {
     const { id } = req.params;
     
     // Verificar permisos
     if (!hasPermission(req.user, 'manage_members')) {
       return res.status(403).json({
         success: false,
         message: 'No tiene permisos para eliminar miembros'
       });
     }

     const miembro = await Miembro.findByPk(id);
     if (!miembro) {
       return res.status(404).json({
         success: false,
         message: 'Miembro no encontrado'
       });
     }

     // Soft delete - marcar como no vigente
     await miembro.update({ vigente: false });

     logger.info(`Miembro eliminado (soft delete) - ID: ${miembro.id}, RUT: ${miembro.rut}`);

     res.json({
       success: true,
       message: 'Miembro eliminado exitosamente'
     });

   } catch (error) {
     logger.error('Error al eliminar miembro:', error);
     res.status(500).json({
       success: false,
       message: 'Error interno del servidor'
     });
   }
 },

 // Obtener estadísticas de miembros
 async getEstadisticas(req, res) {
   try {
     // Verificar permisos básicos
     if (!canViewGrado(req.user.grado, 'aprendiz')) {
       return res.status(403).json({
         success: false,
         message: 'No tiene permisos para ver estadísticas'
       });
     }

     const stats = {};

     // Estadísticas generales
     stats.total = await Miembro.count({ where: { vigente: true } });
     stats.totalInactivos = await Miembro.count({ where: { vigente: false } });

     // Por grado
     const gradoCounts = await Miembro.findAll({
       attributes: [
         'grado',
         [sequelize.fn('COUNT', sequelize.col('id')), 'count']
       ],
       where: { vigente: true },
       group: ['grado'],
       raw: true
     });

     stats.porGrado = {
       aprendiz: 0,
       companero: 0,
       maestro: 0
     };

     gradoCounts.forEach(item => {
       stats.porGrado[item.grado] = parseInt(item.count);
     });

     // Con cargo
     stats.conCargo = await Miembro.count({
       where: {
         vigente: true,
         cargo: { [Op.ne]: null }
       }
     });

     // Con información de contacto
     stats.conEmail = await Miembro.count({
       where: {
         vigente: true,
         email: { [Op.ne]: null }
       }
     });

     stats.conTelefono = await Miembro.count({
       where: {
         vigente: true,
         telefono: { [Op.ne]: null }
       }
     });

     // Usuarios del sistema
     const usuarioStats = await User.findAll({
       attributes: [
         [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
         [sequelize.fn('COUNT', sequelize.literal('CASE WHEN is_active = true THEN 1 END')), 'activos']
       ],
       raw: true
     });

     stats.usuarios = {
       total: parseInt(usuarioStats[0].total),
       activos: parseInt(usuarioStats[0].activos)
     };

     res.json({
       success: true,
       data: stats
     });

   } catch (error) {
     logger.error('Error al obtener estadísticas:', error);
     res.status(500).json({
       success: false,
       message: 'Error interno del servidor'
     });
   }
 },

 // Importar miembros desde Excel
 async importarMiembros(req, res) {
   try {
     // Verificar permisos
     if (!hasPermission(req.user, 'manage_members')) {
       return res.status(403).json({
         success: false,
         message: 'No tiene permisos para importar miembros'
       });
     }

     const { miembros } = req.body;

     if (!Array.isArray(miembros) || miembros.length === 0) {
       return res.status(400).json({
         success: false,
         message: 'Debe proporcionar un array de miembros válido'
       });
     }

     const resultados = {
       exitosos: 0,
       errores: 0,
       detalles: []
     };

     // Procesar cada miembro
     for (let i = 0; i < miembros.length; i++) {
       const miembroData = miembros[i];
       
       try {
         // Validaciones básicas
         if (!miembroData.nombres || !miembroData.apellidos || !miembroData.rut || !miembroData.grado) {
           throw new Error('Faltan campos obligatorios');
         }

         // Verificar que el RUT no exista
         const existingMiembro = await Miembro.findByRUT(miembroData.rut);
         if (existingMiembro) {
           throw new Error('RUT ya existe');
         }

         // Crear miembro
         await Miembro.create({
           nombres: miembroData.nombres,
           apellidos: miembroData.apellidos,
           rut: miembroData.rut,
           grado: miembroData.grado,
           cargo: miembroData.cargo,
           email: miembroData.email,
           telefono: miembroData.telefono,
           direccion: miembroData.direccion,
           profesion: miembroData.profesion,
           fecha_nacimiento: miembroData.fechaNacimiento,
           fecha_iniciacion: miembroData.fechaIniciacion
         });

         resultados.exitosos++;
         resultados.detalles.push({
           fila: i + 1,
           rut: miembroData.rut,
           estado: 'exitoso'
         });

       } catch (error) {
         resultados.errores++;
         resultados.detalles.push({
           fila: i + 1,
           rut: miembroData.rut || 'N/A',
           estado: 'error',
           mensaje: error.message
         });
       }
     }

     logger.info(`Importación de miembros completada - Exitosos: ${resultados.exitosos}, Errores: ${resultados.errores}`);

     res.json({
       success: true,
       message: 'Importación completada',
       data: resultados
     });

   } catch (error) {
     logger.error('Error en importación de miembros:', error);
     res.status(500).json({
       success: false,
       message: 'Error interno del servidor'
     });
   }
 }
};

module.exports = miembrosController;