// ===== SEEDER CON DATOS INICIALES - CORREGIDO =====
'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    
    // ===== 1. INSERTAR MIEMBROS =====
    const miembrosIds = [
      uuidv4(), // 0
      uuidv4(), // 1
      uuidv4(), // 2
      uuidv4(), // 3
      uuidv4()  // 4
    ];

    await queryInterface.bulkInsert('miembros', [
      {
        id: miembrosIds[0],
        nombres: 'Juan Carlos',
        apellidos: 'González López',
        rut: '12345678-9',
        grado: 'maestro',
        cargo: 'venerable_maestro',
        email: 'juan.gonzalez@email.cl',
        telefono: '+56912345678',
        profesion: 'Ingeniero Civil',
        fecha_nacimiento: '1975-03-15',
        fecha_iniciacion: '2020-06-21',
        fecha_aumento_salario: '2022-03-20',
        fecha_exaltacion: '2024-09-22',
        vigente: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: miembrosIds[1],
        nombres: 'Pedro Antonio',
        apellidos: 'Martínez Silva',
        rut: '98765432-1',
        grado: 'maestro',
        cargo: 'secretario',
        email: 'pedro.martinez@email.cl',
        telefono: '+56987654321',
        profesion: 'Médico Cirujano',
        fecha_nacimiento: '1980-07-22',
        fecha_iniciacion: '2021-03-20',
        fecha_aumento_salario: '2023-09-22',
        fecha_exaltacion: '2024-12-21',
        vigente: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: miembrosIds[2],
        nombres: 'Luis Fernando',
        apellidos: 'Rodríguez Pérez',
        rut: '11223344-5',
        grado: 'companero',
        email: 'luis.rodriguez@email.cl',
        telefono: '+56911223344',
        profesion: 'Abogado',
        fecha_nacimiento: '1985-11-10',
        fecha_iniciacion: '2023-06-21',
        fecha_aumento_salario: '2024-09-22',
        vigente: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: miembrosIds[3],
        nombres: 'Carlos Eduardo',
        apellidos: 'Hernández Muñoz',
        rut: '55667788-9',
        grado: 'maestro',
        cargo: 'tesorero',
        email: 'carlos.hernandez@email.cl',
        telefono: '+56955667788',
        profesion: 'Contador Auditor',
        fecha_nacimiento: '1970-01-30',
        fecha_iniciacion: '2018-03-20',
        fecha_aumento_salario: '2020-09-22',
        fecha_exaltacion: '2022-06-21',
        vigente: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: miembrosIds[4],
        nombres: 'Roberto Miguel',
        apellidos: 'Vargas Torres',
        rut: '99887766-5',
        grado: 'aprendiz',
        email: 'roberto.vargas@email.cl',
        telefono: '+56999887766',
        profesion: 'Arquitecto',
        fecha_nacimiento: '1990-05-18',
        fecha_iniciacion: '2024-09-22',
        vigente: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    
    // ===== 2. INSERTAR USUARIOS =====
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const usersIds = [
      uuidv4(), // admin
      uuidv4(), // venerable
      uuidv4(), // secretario
      uuidv4(), // maestro1
      uuidv4(), // companero1
      uuidv4()  // aprendiz1
    ];
    
    await queryInterface.bulkInsert('users', [
      {
        id: usersIds[0],
        username: 'admin',
        email: 'admin@orpheo.cl',
        password: hashedPassword,
        role: 'superadmin',
        grado: 'maestro',
        member_full_name: 'Administrador del Sistema',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: usersIds[1],
        username: 'venerable',
        email: 'vm@orpheo.cl',
        password: hashedPassword,
        role: 'admin',
        grado: 'maestro',
        cargo: 'venerable_maestro',
        member_full_name: 'Juan Carlos González López',
        miembro_id: miembrosIds[0],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: usersIds[2],
        username: 'secretario',
        email: 'secretario@orpheo.cl',
        password: hashedPassword,
        role: 'admin',
        grado: 'maestro',
        cargo: 'secretario',
        member_full_name: 'Pedro Antonio Martínez Silva',
        miembro_id: miembrosIds[1],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: usersIds[3],
        username: 'maestro1',
        email: 'maestro1@orpheo.cl',
        password: hashedPassword,
        role: 'general',
        grado: 'maestro',
        cargo: 'tesorero',
        member_full_name: 'Carlos Eduardo Hernández Muñoz',
        miembro_id: miembrosIds[3],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: usersIds[4],
        username: 'companero1',
        email: 'companero1@orpheo.cl',
        password: hashedPassword,
        role: 'general',
        grado: 'companero',
        member_full_name: 'Luis Fernando Rodríguez Pérez',
        miembro_id: miembrosIds[2],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: usersIds[5],
        username: 'aprendiz1',
        email: 'aprendiz1@orpheo.cl',
        password: hashedPassword,
        role: 'general',
        grado: 'aprendiz',
        member_full_name: 'Roberto Miguel Vargas Torres',
        miembro_id: miembrosIds[4],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // ===== 3. INSERTAR PROGRAMAS DE EJEMPLO =====
    const programasIds = [
      uuidv4(),
      uuidv4(),
      uuidv4()
    ];

    await queryInterface.bulkInsert('programas', [
      {
        id: programasIds[0],
        tema: 'Tenida Ordinaria - Enero 2025',
        fecha: new Date('2025-01-15 19:30:00'),
        encargado: 'Juan Carlos González López',
        quien_imparte: 'Venerable Maestro',
        resumen: 'Tenida ordinaria con trabajos del grado de Maestro',
        grado: 'maestro',
        tipo: 'tenida',
        estado: 'programado',
        responsable_id: usersIds[1],
        responsable_nombre: 'Juan Carlos González López',
        ubicacion: 'Templo Masónico',
        requiere_confirmacion: true,
        limite_asistentes: 50,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: programasIds[1],
        tema: 'Ceremonia de Iniciación',
        fecha: new Date('2025-02-05 20:00:00'),
        encargado: 'Pedro Antonio Martínez Silva',
        quien_imparte: 'Venerable Maestro',
        resumen: 'Ceremonia de iniciación de nuevo hermano',
        grado: 'maestro',
        tipo: 'ceremonia',
        estado: 'programado',
        responsable_id: usersIds[2],
        responsable_nombre: 'Pedro Antonio Martínez Silva',
        ubicacion: 'Templo Masónico',
        requiere_confirmacion: true,
        limite_asistentes: 40,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: programasIds[2],
        tema: 'Instrucción - Grado de Compañero',
        fecha: new Date('2025-01-25 19:00:00'),
        encargado: 'Luis Fernando Rodríguez Pérez',
        quien_imparte: 'Segundo Vigilante',
        resumen: 'Instrucción específica para grado de Compañero',
        grado: 'companero',
        tipo: 'instruccion',
        estado: 'programado',
        responsable_id: usersIds[4],
        responsable_nombre: 'Luis Fernando Rodríguez Pérez',
        ubicacion: 'Sala de Instrucción',
        requiere_confirmacion: true,
        limite_asistentes: 25,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // ===== 4. INSERTAR DOCUMENTOS DE EJEMPLO =====
    const documentosIds = [
      uuidv4(),
      uuidv4()
    ];

    await queryInterface.bulkInsert('documentos', [
      {
        id: documentosIds[0],
        nombre: 'Reglamento General de la Logia',
        tipo: 'pdf',
        descripcion: 'Reglamento interno y normas de funcionamiento',
        categoria: 'general',
        subcategoria: 'reglamentación',
        palabras_clave: 'reglamento, normas, funcionamiento',
        es_plancha: false,
        autor_id: usersIds[1],
        autor_nombre: 'Juan Carlos González López',
        subido_por_id: usersIds[1],
        subido_por_nombre: 'Juan Carlos González López',
        version: 1,
        descargas: 0,
        visualizaciones: 0,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: documentosIds[1],
        nombre: 'Plancha: La Simbología en el Grado de Maestro',
        tipo: 'pdf',
        descripcion: 'Trabajo de investigación sobre los símbolos masónicos',
        categoria: 'maestro',
        subcategoria: 'simbología',
        palabras_clave: 'símbolos, maestro, investigación',
        es_plancha: true,
        plancha_id: 'PL-2025-001',
        plancha_estado: 'pendiente',
        autor_id: usersIds[3],
        autor_nombre: 'Carlos Eduardo Hernández Muñoz',
        subido_por_id: usersIds[3],
        subido_por_nombre: 'Carlos Eduardo Hernández Muñoz',
        version: 1,
        descargas: 0,
        visualizaciones: 0,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // ===== 5. INSERTAR ASISTENCIAS DE EJEMPLO =====
    const asistenciasIds = [
      uuidv4(),
      uuidv4(),
      uuidv4()
    ];

    await queryInterface.bulkInsert('asistencias', [
      {
        id: asistenciasIds[0],
        programa_id: programasIds[0],
        miembro_id: miembrosIds[0],
        asistio: false,
        confirmado: true,
        registrado_por_id: usersIds[1],
        registrado_por_nombre: 'Juan Carlos González López',
        hora_registro: new Date(),
        nombre_miembro: 'Juan Carlos González López',
        grado_miembro: 'maestro',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: asistenciasIds[1],
        programa_id: programasIds[0],
        miembro_id: miembrosIds[1],
        asistio: false,
        confirmado: true,
        registrado_por_id: usersIds[2],
        registrado_por_nombre: 'Pedro Antonio Martínez Silva',
        hora_registro: new Date(),
        nombre_miembro: 'Pedro Antonio Martínez Silva',
        grado_miembro: 'maestro',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: asistenciasIds[2],
        programa_id: programasIds[2],
        miembro_id: miembrosIds[2],
        asistio: false,
        confirmado: false,
        hora_registro: new Date(),
        nombre_miembro: 'Luis Fernando Rodríguez Pérez',
        grado_miembro: 'companero',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // ===== 6. INSERTAR NOTIFICACIONES DE EJEMPLO =====
    const notificacionesIds = [
      uuidv4(),
      uuidv4(),
      uuidv4()
    ];

    await queryInterface.bulkInsert('notificaciones', [
      {
        id: notificacionesIds[0],
        titulo: 'Bienvenido al Sistema Orpheo',
        mensaje: 'Tu cuenta ha sido activada exitosamente. Puedes comenzar a usar todas las funcionalidades del sistema.',
        tipo: 'sistema',
        usuario_id: usersIds[0],
        prioridad: 'normal',
        leido: false,
        remitente_tipo: 'system',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: notificacionesIds[1],
        titulo: 'Nueva Tenida Programada',
        mensaje: 'Se ha programado una nueva tenida ordinaria para el 15 de enero. Por favor confirma tu asistencia.',
        tipo: 'programa',
        relacionado_tipo: 'programa',
        relacionado_id: programasIds[0],
        usuario_id: usersIds[3],
        prioridad: 'alta',
        leido: false,
        remitente_tipo: 'user',
        remitente_id: usersIds[1],
        remitente_nombre: 'Juan Carlos González López',
        accion_url: `/programas/${programasIds[0]}`,
        accion_texto: 'Ver Programa',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: notificacionesIds[2],
        titulo: 'Documento Pendiente de Aprobación',
        mensaje: 'Hay una plancha pendiente de tu aprobación como Venerable Maestro.',
        tipo: 'plancha',
        relacionado_tipo: 'documento',
        relacionado_id: documentosIds[1],
        usuario_id: usersIds[1],
        prioridad: 'alta',
        leido: false,
        remitente_tipo: 'system',
        accion_url: `/documentos/${documentosIds[1]}`,
        accion_texto: 'Revisar Plancha',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    console.log('✅ Datos iniciales insertados correctamente:');
    console.log(`   - ${miembrosIds.length} Miembros`);
    console.log(`   - ${usersIds.length} Usuarios`);
    console.log(`   - ${programasIds.length} Programas`);
    console.log(`   - ${documentosIds.length} Documentos`);
    console.log(`   - ${asistenciasIds.length} Asistencias`);
    console.log(`   - ${notificacionesIds.length} Notificaciones`);
    console.log('');
    console.log('🔑 Usuarios de prueba creados:');
    console.log('   admin/password123 (Super Admin)');
    console.log('   venerable/password123 (Admin - Venerable Maestro)');
    console.log('   secretario/password123 (Admin - Secretario)');
    console.log('   maestro1/password123 (General - Maestro)');
    console.log('   companero1/password123 (General - Compañero)');
    console.log('   aprendiz1/password123 (General - Aprendiz)');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('notificaciones', null, {});
    await queryInterface.bulkDelete('asistencias', null, {});
    await queryInterface.bulkDelete('documentos', null, {});
    await queryInterface.bulkDelete('programas', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('miembros', null, {});
    
    console.log('✅ Todos los datos de prueba eliminados');
  }
};