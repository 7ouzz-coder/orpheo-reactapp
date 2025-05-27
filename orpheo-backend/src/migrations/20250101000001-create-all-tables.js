'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    
    // ===== 1. CREAR TABLA MIEMBROS PRIMERO =====
    await queryInterface.createTable('miembros', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nombres: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      apellidos: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      rut: {
        type: Sequelize.STRING(12),
        allowNull: false,
        unique: true,
      },
      grado: {
        type: Sequelize.ENUM('aprendiz', 'companero', 'maestro'),
        allowNull: false,
      },
      cargo: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      vigente: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      profesion: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ocupacion: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      trabajo_nombre: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      trabajo_direccion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      trabajo_telefono: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      trabajo_email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pareja_nombre: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pareja_telefono: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      contacto_emergencia_nombre: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      contacto_emergencia_telefono: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      fecha_iniciacion: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      fecha_aumento_salario: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      fecha_exaltacion: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      situacion_salud: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });

    // ===== 2. CREAR TABLA USERS =====
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('general', 'admin', 'superadmin'),
        defaultValue: 'general',
        allowNull: false,
      },
      grado: {
        type: Sequelize.ENUM('aprendiz', 'companero', 'maestro'),
        allowNull: false,
      },
      cargo: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      member_full_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      miembro_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'miembros',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      failed_login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      locked_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });

    // ===== 3. CREAR TABLA DOCUMENTOS =====
    await queryInterface.createTable('documentos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tamano: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      ruta_local: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      hash_archivo: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      categoria: {
        type: Sequelize.ENUM('aprendiz', 'companero', 'maestro', 'general', 'administrativo'),
        allowNull: false,
      },
      subcategoria: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      palabras_clave: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      es_plancha: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      plancha_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      plancha_estado: {
        type: Sequelize.ENUM('pendiente', 'aprobada', 'rechazada'),
        allowNull: true,
      },
      plancha_comentarios: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      autor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      autor_nombre: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      subido_por_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      subido_por_nombre: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      documento_padre_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'documentos',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      descargas: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      visualizaciones: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });

    // ===== 4. CREAR TABLA PROGRAMAS =====
    await queryInterface.createTable('programas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tema: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      encargado: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      quien_imparte: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      resumen: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      grado: {
        type: Sequelize.ENUM('aprendiz', 'companero', 'maestro', 'general'),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('tenida', 'instruccion', 'camara', 'trabajo', 'ceremonia', 'reunion'),
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'programado', 'completado', 'cancelado'),
        defaultValue: 'pendiente',
      },
      documentos_json: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      responsable_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      responsable_nombre: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ubicacion: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      detalles_adicionales: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      requiere_confirmacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      limite_asistentes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });

    // ===== 5. CREAR TABLA ASISTENCIAS =====
    await queryInterface.createTable('asistencias', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      programa_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'programas',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      miembro_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'miembros',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      asistio: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      confirmado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      justificacion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      registrado_por_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      registrado_por_nombre: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      hora_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      hora_llegada: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      nombre_miembro: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      grado_miembro: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });

    // ===== 6. CREAR TODOS LOS ÍNDICES =====
    
    // Índices de Miembros
    await queryInterface.addIndex('miembros', ['rut'], { unique: true });
    await queryInterface.addIndex('miembros', ['nombres', 'apellidos']);
    await queryInterface.addIndex('miembros', ['grado']);
    await queryInterface.addIndex('miembros', ['vigente']);
    await queryInterface.addIndex('miembros', ['email']);

    // Índices de Users
    await queryInterface.addIndex('users', ['username'], { unique: true });
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['role', 'grado']);
    await queryInterface.addIndex('users', ['is_active']);
    await queryInterface.addIndex('users', ['miembro_id']);

    // Índices de Documentos
    await queryInterface.addIndex('documentos', ['categoria']);
    await queryInterface.addIndex('documentos', ['tipo']);
    await queryInterface.addIndex('documentos', ['autor_id']);
    await queryInterface.addIndex('documentos', ['subido_por_id']);
    await queryInterface.addIndex('documentos', ['activo']);
    await queryInterface.addIndex('documentos', ['es_plancha']);
    await queryInterface.addIndex('documentos', ['plancha_estado']);
    await queryInterface.addIndex('documentos', ['created_at']);

    // Índices de Programas
    await queryInterface.addIndex('programas', ['fecha']);
    await queryInterface.addIndex('programas', ['grado']);
    await queryInterface.addIndex('programas', ['tipo']);
    await queryInterface.addIndex('programas', ['estado']);
    await queryInterface.addIndex('programas', ['responsable_id']);
    await queryInterface.addIndex('programas', ['activo']);

    // Índices de Asistencias
    await queryInterface.addIndex('asistencias', ['programa_id']);
    await queryInterface.addIndex('asistencias', ['miembro_id']);
    await queryInterface.addIndex('asistencias', ['asistio']);
    await queryInterface.addIndex('asistencias', ['confirmado']);
    await queryInterface.addIndex('asistencias', ['hora_registro']);

    // ===== 7. CONSTRAINTS ÚNICOS =====
    await queryInterface.addConstraint('asistencias', {
      fields: ['programa_id', 'miembro_id'],
      type: 'unique',
      name: 'asistencias_programa_miembro_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('asistencias');
    await queryInterface.dropTable('programas');
    await queryInterface.dropTable('documentos');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('miembros');
  }
};