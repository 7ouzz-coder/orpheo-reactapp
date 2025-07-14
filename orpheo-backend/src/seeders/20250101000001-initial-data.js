'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Crear usuarios iniciales
    const users = [
      {
        nombres: 'Administrador',
        apellidos: 'Sistema',
        email: 'admin@orpheo.com',
        password: await bcrypt.hash('admin123456', 12),
        rol: 'superadmin',
        grado: 'maestro',
        estado: 'activo',
        created_at: now,
        updated_at: now
      },
      {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        email: 'juan.perez@orpheo.com',
        password: await bcrypt.hash('maestro123', 12),
        rol: 'admin',
        grado: 'maestro',
        estado: 'activo',
        telefono: '+56987654321',
        created_at: now,
        updated_at: now
      },
      {
        nombres: 'María Elena',
        apellidos: 'Rodríguez Silva',
        email: 'maria.rodriguez@orpheo.com',
        password: await bcrypt.hash('companero123', 12),
        rol: 'general',
        grado: 'companero',
        estado: 'activo',
        telefono: '+56987654322',
        created_at: now,
        updated_at: now
      },
      {
        nombres: 'Pedro Antonio',
        apellidos: 'López Fernández',
        email: 'pedro.lopez@orpheo.com',
        password: await bcrypt.hash('aprendiz123', 12),
        rol: 'general',
        grado: 'aprendiz',
        estado: 'activo',
        telefono: '+56987654323',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('users', users);

    // Obtener IDs de usuarios insertados
    const insertedUsers = await queryInterface.sequelize.query(
      'SELECT id, email, grado FROM users ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const adminUser = insertedUsers.find(u => u.email === 'admin@orpheo.com');
    const maestroUser = insertedUsers.find(u => u.email === 'juan.perez@orpheo.com');
    const companeroUser = insertedUsers.find(u => u.email === 'maria.rodriguez@orpheo.com');
    const aprendizUser = insertedUsers.find(u => u.email === 'pedro.lopez@orpheo.com');

    // Crear miembros iniciales
    const miembros = [
      {
        nombres: 'Carlos Eduardo',
        apellidos: 'Martínez Herrera',
        rut: '12345678-9',
        email: 'carlos.martinez@email.com',
        telefono: '+56987654324',
        grado: 'maestro',
        estado: 'activo',
        fecha_ingreso: new Date('2020-01-15'),
        fecha_nacimiento: new Date('1975-03-20'),
        direccion: 'Av. Providencia 1234, Santiago',
        ciudad_nacimiento: 'Santiago',
        profesion: 'Ingeniero Civil',
        observaciones: 'Miembro fundador de la logia',
        creado_por: adminUser.id,
        created_at: now,
        updated_at: now
      },
      {
        nombres: 'Ana Sofía',
        apellidos: 'Campos Morales',
        rut: '23456789-0',
        email: 'ana.campos@email.com',
        telefono: '+56987654325',
        grado: 'companero',
        estado: 'activo',
        fecha_ingreso: new Date('2021-06-10'),
        fecha_nacimiento: new Date('1982-11-15'),
        direccion: 'Calle Los Robles 567, Las Condes',
        ciudad_nacimiento: 'Valparaíso',
        profesion: 'Médico Cirujano',
        creado_por: adminUser.id,
        created_at: now,
        updated_at: now
      },
      {
        nombres: 'Roberto Luis',
        apellidos: 'Vega Sánchez',
        rut: '34567890-1',
        email: 'roberto.vega@email.com',
        telefono: '+56987654326',
        grado: 'aprendiz',
        estado: 'activo',
        fecha_ingreso: new Date('2023-03-20'),
        fecha_nacimiento: new Date('1990-07-08'),
        direccion: 'Pasaje Central 890, Ñuñoa',
        ciudad_nacimiento: 'Concepción',
        profesion: 'Contador Auditor',
        creado_por: maestroUser.id,
        created_at: now,
        updated_at: now
      },
      {
        nombres: 'Luisa Fernanda',
        apellidos: 'Torres Jiménez',
        rut: '45678901-2',
        email: 'luisa.torres@email.com',
        telefono: '+56987654327',
        grado: 'companero',
        estado: 'activo',
        fecha_ingreso: new Date('2022-09-05'),
        fecha_nacimiento: new Date('1985-04-25'),
        direccion: 'Av. Brasil 2345, Valparaíso',
        ciudad_nacimiento: 'La Serena',
        profesion: 'Arquitecto',
        creado_por: maestroUser.id,
        created_at: now,
        updated_at: now
      },
      {
        nombres: 'Francisco Javier',
        apellidos: 'Moreno Castro',
        rut: '56789012-3',
        email: 'francisco.moreno@email.com',
        telefono: '+56987654328',
        grado: 'maestro',
        estado: 'activo',
        fecha_ingreso: new Date('2019-11-30'),
        fecha_nacimiento: new Date('1978-12-10'),
        direccion: 'Los Espinos 456, Vitacura',
        ciudad_nacimiento: 'Temuco',
        profesion: 'Abogado',
        observaciones: 'Ex Venerable Maestro',
        creado_por: adminUser.id,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('miembros', miembros);

    // Crear documentos de ejemplo
    const documentos = [
      {
        nombre: 'Reglamento General de la Logia',
        descripcion: 'Documento que establece las normas y procedimientos generales de la logia',
        categoria: 'general',
        tipo: 'reglamento',
        estado: 'aprobado',
        nombre_archivo: 'reglamento_general.pdf',
        ruta_archivo: 'docs/reglamento_general.pdf',
        tamano_archivo: 1024000,
        tipo_mime: 'application/pdf',
        vistas: 15,
        descargas: 8,
        autor_id: adminUser.id,
        moderado_por: adminUser.id,
        fecha_moderado: now,
        tags: ['reglamento', 'normas', 'procedimientos'],
        created_at: now,
        updated_at: now
      },
      {
        nombre: 'Ritual de Iniciación - Grado Aprendiz',
        descripcion: 'Ritual completo para la ceremonia de iniciación al grado de Aprendiz',
        categoria: 'aprendiz',
        tipo: 'ritual',
        estado: 'aprobado',
        nombre_archivo: 'ritual_aprendiz.pdf',
        ruta_archivo: 'docs/ritual_aprendiz.pdf',
        tamano_archivo: 2048000,
        tipo_mime: 'application/pdf',
        vistas: 25,
        descargas: 12,
        autor_id: maestroUser.id,
        moderado_por: adminUser.id,
        fecha_moderado: now,
        tags: ['ritual', 'iniciación', 'aprendiz'],
        created_at: now,
        updated_at: now
      },
      {
        nombre: 'Manual de Ceremonias - Grado Compañero',
        descripcion: 'Guía detallada de las ceremonias específicas del grado Compañero',
        categoria: 'companero',
        tipo: 'documento',
        estado: 'aprobado',
        nombre_archivo: 'manual_companero.pdf',
        ruta_archivo: 'docs/manual_companero.pdf',
        tamano_archivo: 1536000,
        tipo_mime: 'application/pdf',
        vistas: 18,
        descargas: 9,
        autor_id: maestroUser.id,
        moderado_por: adminUser.id,
        fecha_moderado: now,
        tags: ['manual', 'ceremonias', 'companero'],
        created_at: now,
        updated_at: now
      },
      {
        nombre: 'Plancha: Reflexiones sobre la Geometría Sagrada',
        descripcion: 'Estudio profundo sobre el simbolismo geométrico en la masonería',
        categoria: 'maestro',
        tipo: 'plancha',
        estado: 'pendiente',
        nombre_archivo: 'plancha_geometria.pdf',
        ruta_archivo: 'docs/plancha_geometria.pdf',
        tamano_archivo: 768000,
        tipo_mime: 'application/pdf',
        vistas: 3,
        descargas: 1,
        autor_id: companeroUser.id,
        tags: ['plancha', 'geometría', 'simbolismo'],
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('documentos', documentos);

    // Crear programas de ejemplo
    const programas = [
      {
        titulo: 'Tenida Ordinaria de Enero',
        descripcion: 'Primera tenida ordinaria del año con agenda de planificación anual',
        tipo: 'tenida',
        grado_requerido: 'aprendiz',
        fecha_inicio: new Date('2025-01-15 19:30:00'),
        fecha_fin: new Date('2025-01-15 22:00:00'),
        ubicacion: 'Templo Principal - Sede Logia',
        estado: 'programado',
        capacidad_maxima: 50,
        requiere_confirmacion: true,
        observaciones: 'Se requiere traje formal. Puntualidad obligatoria.',
        creado_por: maestroUser.id,
        created_at: now,
        updated_at: now
      },
      {
        titulo: 'Ceremonia de Iniciación',
        descripcion: 'Ceremonia de iniciación de nuevos candidatos al grado de Aprendiz',
        tipo: 'ceremonia',
        grado_requerido: 'maestro',
        fecha_inicio: new Date('2025-02-01 18:00:00'),
        fecha_fin: new Date('2025-02-01 21:30:00'),
        ubicacion: 'Templo Principal - Sede Logia',
        estado: 'programado',
        capacidad_maxima: 30,
        requiere_confirmacion: true,
        observaciones: 'Solo para Maestros. Ceremonia solemne.',
        creado_por: adminUser.id,
        created_at: now,
        updated_at: now
      },
      {
        titulo: 'Taller: Simbolismo Masónico',
        descripcion: 'Taller educativo sobre los símbolos fundamentales de la masonería',
        tipo: 'taller',
        grado_requerido: 'aprendiz',
        fecha_inicio: new Date('2025-01-20 14:00:00'),
        fecha_fin: new Date('2025-01-20 17:00:00'),
        ubicacion: 'Sala de Conferencias',
        estado: 'programado',
        capacidad_maxima: 25,
        requiere_confirmacion: true,
        observaciones: 'Material de estudio será proporcionado',
        creado_por: maestroUser.id,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('programas', programas);

    // Crear algunas notificaciones de ejemplo
    const notificaciones = [
      {
        usuario_id: companeroUser.id,
        titulo: 'Nueva Tenida Programada',
        mensaje: 'Se ha programado la Tenida Ordinaria de Enero para el 15 de enero a las 19:30 hrs.',
        tipo: 'info',
        categoria: 'programa',
        leida: false,
        datos_adicionales: { programa_id: 1 },
        created_at: now,
        updated_at: now
      },
      {
        usuario_id: aprendizUser.id,
        titulo: 'Documento Aprobado',
        mensaje: 'Tu plancha "Reflexiones sobre la Geometría Sagrada" ha sido aprobada y publicada.',
        tipo: 'success',
        categoria: 'documento',
        leida: false,
        datos_adicionales: { documento_id: 4 },
        created_at: now,
        updated_at: now
      },
      {
        usuario_id: maestroUser.id,
        titulo: 'Plancha Pendiente de Revisión',
        mensaje: 'Hay una nueva plancha pendiente de moderación en el sistema.',
        tipo: 'warning',
        categoria: 'documento',
        leida: false,
        datos_adicionales: { documento_id: 4 },
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('notificaciones', notificaciones);

    console.log('✅ Datos iniciales insertados correctamente');
    console.log('👤 Usuarios creados:');
    console.log('   - admin@orpheo.com (contraseña: admin123456) - SuperAdmin/Maestro');
    console.log('   - juan.perez@orpheo.com (contraseña: maestro123) - Admin/Maestro');
    console.log('   - maria.rodriguez@orpheo.com (contraseña: companero123) - General/Compañero');
    console.log('   - pedro.lopez@orpheo.com (contraseña: aprendiz123) - General/Aprendiz');
    console.log('👥 5 miembros de ejemplo creados');
    console.log('📄 4 documentos de ejemplo creados');
    console.log('📅 3 programas de ejemplo creados');
    console.log('🔔 3 notificaciones de ejemplo creadas');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar datos en orden inverso
    await queryInterface.bulkDelete('notificaciones', null, {});
    await queryInterface.bulkDelete('asistencias', null, {});
    await queryInterface.bulkDelete('programas', null, {});
    await queryInterface.bulkDelete('documentos', null, {});
    await queryInterface.bulkDelete('miembros', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};