const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Miembro } = require('../models');
const XLSX = require('xlsx');
const logger = require('../utils/logger');

class MiembrosController {
  // GET /api/miembros - Obtener todos los miembros con filtros y paginación
  async getMiembros(req, res) {
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
        estado = '',
        sortBy = 'nombres',
        sortOrder = 'ASC'
      } = req.query;

      // Construir condiciones WHERE dinámicamente
      const whereConditions = {};

      // Filtro de búsqueda por nombre, apellido o RUT
      if (search) {
        whereConditions[Op.or] = [
          { nombres: { [Op.iLike]: `%${search}%` } },
          { apellidos: { [Op.iLike]: `%${search}%` } },
          { rut: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Filtro por grado
      if (grado) {
        whereConditions.grado = grado;
      }

      // Filtro por estado
      if (estado) {
        whereConditions.estado = estado;
      }

      // Permisos: Si es aprendiz o compañero, solo ve su grado o menor
      if (req.user.grado === 'aprendiz') {
        whereConditions.grado = 'aprendiz';
      } else if (req.user.grado === 'companero') {
        whereConditions.grado = { [Op.in]: ['aprendiz', 'companero'] };
      }

      const offset = (page - 1) * limit;

      const { count, rows: miembros } = await Miembro.findAndCountAll({
        where: whereConditions,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: { exclude: ['password'] } // No devolver contraseñas
      });

      const totalPages = Math.ceil(count / limit);

      logger.info(`Miembros consultados por usuario ${req.user.id}`, {
        userId: req.user.id,
        filters: { search, grado, estado },
        totalResults: count
      });

      res.status(200).json({
        success: true,
        data: {
          miembros,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      logger.error('Error al obtener miembros:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/miembros/estadisticas - Obtener estadísticas de miembros
  async getEstadisticas(req, res) {
    try {
      const whereCondition = {};

      // Aplicar restricciones de grado
      if (req.user.grado === 'aprendiz') {
        whereCondition.grado = 'aprendiz';
      } else if (req.user.grado === 'companero') {
        whereCondition.grado = { [Op.in]: ['aprendiz', 'companero'] };
      }

      const [totalMiembros, activos, inactivos, aprendices, companeros, maestros] = await Promise.all([
        Miembro.count({ where: whereCondition }),
        Miembro.count({ where: { ...whereCondition, estado: 'activo' } }),
        Miembro.count({ where: { ...whereCondition, estado: 'inactivo' } }),
        Miembro.count({ where: { ...whereCondition, grado: 'aprendiz' } }),
        Miembro.count({ where: { ...whereCondition, grado: 'companero' } }),
        Miembro.count({ where: { ...whereCondition, grado: 'maestro' } })
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalMiembros,
          activos,
          inactivos,
          porcentajeActivos: totalMiembros > 0 ? ((activos / totalMiembros) * 100).toFixed(1) : 0,
          distribucionPorGrado: {
            aprendices,
            companeros,
            maestros
          }
        }
      });

    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/miembros/:id - Obtener un miembro por ID
  async getMiembroById(req, res) {
    try {
      const { id } = req.params;

      const miembro = await Miembro.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!miembro) {
        return res.status(404).json({
          success: false,
          message: 'Miembro no encontrado'
        });
      }

      // Verificar permisos de acceso según grado
      if (!this.canAccessMember(req.user, miembro)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este miembro'
        });
      }

      res.status(200).json({
        success: true,
        data: miembro
      });

    } catch (error) {
      logger.error('Error al obtener miembro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/miembros - Crear nuevo miembro
  async createMiembro(req, res) {
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
        nombres,
        apellidos,
        rut,
        email,
        telefono,
        grado,
        estado = 'activo',
        fechaIngreso,
        direccion,
        ciudadNacimiento,
        profesion,
        fechaNacimiento
      } = req.body;

      // Verificar si el RUT ya existe
      const existingMember = await Miembro.findOne({ where: { rut } });
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un miembro con este RUT'
        });
      }

      // Verificar si el email ya existe
      if (email) {
        const existingEmail = await Miembro.findOne({ where: { email } });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un miembro con este email'
          });
        }
      }

      const nuevoMiembro = await Miembro.create({
        nombres,
        apellidos,
        rut,
        email,
        telefono,
        grado,
        estado,
        fechaIngreso: fechaIngreso || new Date(),
        direccion,
        ciudadNacimiento,
        profesion,
        fechaNacimiento,
        creadoPor: req.user.id
      });

      logger.info('Miembro creado exitosamente', {
        miembroId: nuevoMiembro.id,
        creadoPor: req.user.id,
        rut: nuevoMiembro.rut
      });

      res.status(201).json({
        success: true,
        message: 'Miembro creado exitosamente',
        data: nuevoMiembro
      });

    } catch (error) {
      logger.error('Error al crear miembro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/miembros/:id - Actualizar miembro
  async updateMiembro(req, res) {
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
      const updateData = req.body;

      const miembro = await Miembro.findByPk(id);
      if (!miembro) {
        return res.status(404).json({
          success: false,
          message: 'Miembro no encontrado'
        });
      }

      // Verificar permisos
      if (!this.canModifyMember(req.user, miembro)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este miembro'
        });
      }

      // Verificar RUT único si se está cambiando
      if (updateData.rut && updateData.rut !== miembro.rut) {
        const existingRut = await Miembro.findOne({ 
          where: { rut: updateData.rut, id: { [Op.ne]: id } } 
        });
        if (existingRut) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un miembro con este RUT'
          });
        }
      }

      // Verificar email único si se está cambiando
      if (updateData.email && updateData.email !== miembro.email) {
        const existingEmail = await Miembro.findOne({ 
          where: { email: updateData.email, id: { [Op.ne]: id } } 
        });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un miembro con este email'
          });
        }
      }

      // Actualizar miembro
      await miembro.update({
        ...updateData,
        actualizadoPor: req.user.id
      });

      logger.info('Miembro actualizado exitosamente', {
        miembroId: miembro.id,
        actualizadoPor: req.user.id,
        cambios: Object.keys(updateData)
      });

      res.status(200).json({
        success: true,
        message: 'Miembro actualizado exitosamente',
        data: miembro
      });

    } catch (error) {
      logger.error('Error al actualizar miembro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // DELETE /api/miembros/:id - Eliminar miembro
  async deleteMiembro(req, res) {
    try {
      const { id } = req.params;

      const miembro = await Miembro.findByPk(id);
      if (!miembro) {
        return res.status(404).json({
          success: false,
          message: 'Miembro no encontrado'
        });
      }

      // Solo superadmin puede eliminar miembros
      if (req.user.rol !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Solo el superadmin puede eliminar miembros'
        });
      }

      await miembro.destroy();

      logger.info('Miembro eliminado exitosamente', {
        miembroId: id,
        eliminadoPor: req.user.id,
        rutEliminado: miembro.rut
      });

      res.status(200).json({
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
  }

  // POST /api/miembros/importar - Importar miembros desde Excel
  async importarMiembros(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo'
        });
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const errores = [];
      const exitosos = [];

      for (let i = 0; i < jsonData.length; i++) {
        try {
          const fila = jsonData[i];
          
          // Validar campos requeridos
          if (!fila.nombres || !fila.apellidos || !fila.rut) {
            errores.push({
              fila: i + 2, // +2 porque las filas empiezan en 1 y la primera es header
              error: 'Campos requeridos faltantes: nombres, apellidos, rut'
            });
            continue;
          }

          // Verificar si ya existe
          const existente = await Miembro.findOne({ where: { rut: fila.rut } });
          if (existente) {
            errores.push({
              fila: i + 2,
              error: `Ya existe un miembro con RUT ${fila.rut}`
            });
            continue;
          }

          const nuevoMiembro = await Miembro.create({
            nombres: fila.nombres,
            apellidos: fila.apellidos,
            rut: fila.rut,
            email: fila.email || null,
            telefono: fila.telefono || null,
            grado: fila.grado || 'aprendiz',
            estado: fila.estado || 'activo',
            fechaIngreso: fila.fechaIngreso ? new Date(fila.fechaIngreso) : new Date(),
            direccion: fila.direccion || null,
            ciudadNacimiento: fila.ciudadNacimiento || null,
            profesion: fila.profesion || null,
            fechaNacimiento: fila.fechaNacimiento ? new Date(fila.fechaNacimiento) : null,
            creadoPor: req.user.id
          });

          exitosos.push({
            fila: i + 2,
            miembro: `${nuevoMiembro.nombres} ${nuevoMiembro.apellidos}`,
            rut: nuevoMiembro.rut
          });

        } catch (error) {
          errores.push({
            fila: i + 2,
            error: error.message
          });
        }
      }

      logger.info('Importación de miembros completada', {
        usuarioId: req.user.id,
        totalFilas: jsonData.length,
        exitosos: exitosos.length,
        errores: errores.length
      });

      res.status(200).json({
        success: true,
        message: 'Importación completada',
        data: {
          totalFilas: jsonData.length,
          exitosos: exitosos.length,
          errores: errores.length,
          detalleExitosos: exitosos,
          detalleErrores: errores
        }
      });

    } catch (error) {
      logger.error('Error en importación de miembros:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor durante la importación'
      });
    }
  }

  // Métodos auxiliares para permisos
  canAccessMember(user, member) {
    // SuperAdmin y Admin pueden ver todo
    if (['superadmin', 'admin'].includes(user.rol)) {
      return true;
    }

    // Los usuarios solo pueden ver miembros de su grado o menor
    const gradoJerarquia = { aprendiz: 1, companero: 2, maestro: 3 };
    return gradoJerarquia[user.grado] >= gradoJerarquia[member.grado];
  }

  canModifyMember(user, member) {
    // Solo Admin y SuperAdmin pueden modificar
    return ['superadmin', 'admin'].includes(user.rol);
  }
}

module.exports = new MiembrosController();