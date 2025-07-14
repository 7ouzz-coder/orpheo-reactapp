'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla de usuarios
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombres: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellidos: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      rol: {
        type: Sequelize.ENUM('superadmin', 'admin', 'general'),
        allowNull: false,
        defaultValue: 'general'
      },
      grado: {
        type: Sequelize.ENUM('aprendiz', 'companero', 'maestro'),
        allowNull: false,
        defaultValue: 'aprendiz'
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo', 'suspendido'),
        allowNull: false,
        defaultValue: 'activo'
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      fecha_nacimiento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ultimo_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      intentos_login_fallidos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      cuenta_bloqueada: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fecha_bloqueo: {
        type: Sequelize.DATE,
        allowNull: true
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fecha_cambio_password: {
        type: Sequelize.DATE,
        allowNull: true
      },
      avatar_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      configuraciones: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          notificaciones_email: true,
          notificaciones_push: true,
          tema: 'dark',
          idioma: 'es'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla de miembros
    await queryInterface.createTable('miembros', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombres: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellidos: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      rut: {
        type: Sequelize.STRING(12),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      grado: {
        type: Sequelize.ENUM('aprendiz', 'companero', 'maestro'),
        allowNull: false,
        defaultValue: 'aprendiz'
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo', 'suspendido'),
        allowNull: false,
        defaultValue: 'activo'
      },
      fecha_ingreso: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      fecha_nacimiento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ciudad_nacimiento: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      profesion: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      foto_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      creado_por: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      actualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla de documentos
    await queryInterface.createTable('documentos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      categoria: {
        type: Sequelize.ENUM('aprendiz', 'companero', 'maestro', 'general', 'administrativo'),
        allowNull: false,
        defaultValue: 'general'
      },
      tipo: {
        type: Sequelize.ENUM('documento', 'plancha', 'acta', 'reglamento', 'ritual', 'otro'),
        allowNull: false,
        defaultValue: 'documento'
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobado', 'rechazado'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      nombre_archivo: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      ruta_archivo: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      tamano_archivo: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      tipo_mime: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      vistas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      descargas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      autor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      moderado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      fecha_moderado: {
        type: Sequelize.DATE,
        allowNull: true
      },
      comentarios_moderador: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      es_confidencial: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fecha_expiracion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla de programas
    await queryInterface.createTable('programas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tipo: {
        type: Sequelize.ENUM('tenida', 'ceremonia', 'reunion', 'evento', 'taller'),
        allowNull: false,
        defaultValue: 'tenida'
      },
      grado_requerido: {
        type: Sequelize.ENUM('aprendiz', 'companero', 'maestro'),
        allowNull: false,
        defaultValue: 'aprendiz'
      },
      fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fecha_fin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ubicacion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('programado', 'en_curso', 'finalizado', 'cancelado'),
        allowNull: false,
        defaultValue: 'programado'
      },
      capacidad_maxima: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      requiere_confirmacion: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      creado_por: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla de asistencias
    await queryInterface.createTable('asistencias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      programa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'programas',
          key: 'id'
        }
      },
      miembro_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'miembros',
          key: 'id'
        }
      },
      estado: {
        type: Sequelize.ENUM('confirmado', 'presente', 'ausente', 'justificado'),
        allowNull: false,
        defaultValue: 'confirmado'
      },
      fecha_confirmacion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear tabla de notificaciones
    await queryInterface.createTable('notificaciones', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      mensaje: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM('info', 'warning', 'error', 'success'),
        allowNull: false,
        defaultValue: 'info'
      },
      categoria: {
        type: Sequelize.ENUM('sistema', 'documento', 'programa', 'miembro', 'general'),
        allowNull: false,
        defaultValue: 'general'
      },
      leida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fecha_leida: {
        type: Sequelize.DATE,
        allowNull: true
      },
      datos_adicionales: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear índices
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['rol']);
    await queryInterface.addIndex('users', ['grado']);
    await queryInterface.addIndex('users', ['estado']);

    await queryInterface.addIndex('miembros', ['rut'], { unique: true });
    await queryInterface.addIndex('miembros', ['email'], { unique: true });
    await queryInterface.addIndex('miembros', ['grado']);
    await queryInterface.addIndex('miembros', ['estado']);
    await queryInterface.addIndex('miembros', ['nombres', 'apellidos']);

    await queryInterface.addIndex('documentos', ['autor_id']);
    await queryInterface.addIndex('documentos', ['categoria']);
    await queryInterface.addIndex('documentos', ['tipo']);
    await queryInterface.addIndex('documentos', ['estado']);
    await queryInterface.addIndex('documentos', ['created_at']);

    await queryInterface.addIndex('programas', ['creado_por']);
    await queryInterface.addIndex('programas', ['fecha_inicio']);
    await queryInterface.addIndex('programas', ['tipo']);
    await queryInterface.addIndex('programas', ['estado']);

    await queryInterface.addIndex('asistencias', ['programa_id']);
    await queryInterface.addIndex('asistencias', ['miembro_id']);
    await queryInterface.addIndex('asistencias', ['programa_id', 'miembro_id'], { unique: true });

    await queryInterface.addIndex('notificaciones', ['usuario_id']);
    await queryInterface.addIndex('notificaciones', ['leida']);
    await queryInterface.addIndex('notificaciones', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar tablas en orden inverso (respetando las dependencias)
    await queryInterface.dropTable('notificaciones');
    await queryInterface.dropTable('asistencias');
    await queryInterface.dropTable('programas');
    await queryInterface.dropTable('documentos');
    await queryInterface.dropTable('miembros');
    await queryInterface.dropTable('users');
  }
};