// ===== SEEDER CON DATOS INICIALES =====
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    
    // ===== 1. INSERTAR MIEMBROS =====
    const miembrosIds = [
      '550e8400-e29b-41d4-a716-446655440101',
      '550e8400-e29b-41d4-a716-446655440102', 
      '550e8400-e29b-41d4-a716-446655440103',
      '550e8400-e29b-41d4-a716-446655440104',
      '550e8400-e29b-41d4-a716-446655440105'
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
    
    await queryInterface.bulkInsert('users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
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
        id: '550e8400-e29b-41d4-a716-446655440002',
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
        id: '550e8400-e29b-41d4-a716-446655440003',
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
        id: '550e8400-e29b-41d4-a716-446655440004',
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
        id: '550e8400-e29b-41d4-a716-446655440005',
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
        id: '550e8400-e29b-41d4-a716-446655440006',
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
      '550e8400-e29b-41d4-a716-446655440201',
      '550e8400-e29b-41d4-a716-446655440202',
      '550e8400-e29b-41d4-a716-446655440203'
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
        responsable_id: '550e8400-e29b-41d4-a716-446655440002',
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
        responsable_id: '550e8400-e29b-41d4-a716-446655440003',
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
        responsable_id: '550e8400-e29b-41d4-a716-446655440005',
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
    await queryInterface.bulkInsert('documentos', [
      {
        id: '550e8400-e29b-41d4-a716-446655440301',
        nombre: 'Reglamento General de la Logia',
        tipo: 'pdf',
        descripcion: 'Reglamento interno y normas de funcionamiento',
        categoria: 'general',
        subcategoria: 'reglamentación',
        palabras_clave: 'reglamento, normas, funcionamiento',
        es_plancha: false,
        autor_id: '550e8400-e29b-41d4-a716-446655440002',
        autor_nombre: 'Juan Carlos González López',
        subido_por_id: '550e8400-e29b-41d4-a716-446655440002',
        subido_por_nombre: 'Juan Carlos González López',
        version: 1,
        descargas: 0,
        visualizaciones: 0,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440302',
        nombre: 'Plancha: La Simbología en el Grado de Maestro',
        tipo: 'pdf',
        descripcion: 'Trabajo de investigación sobre los símbolos masónicos',
        categoria: 'maestro',
        subcategoria: 'simbología',
        palabras_clave: 'símbolos, maestro, investigación',
        es_plancha: true,
        plancha_id: 'PL-2025-001',
        plancha_estado: 'pendiente',
        autor_id: '550e8400-e29b-41d4-a716-446655440004',
        autor_nombre: 'Carlos Eduardo Hernández Muñoz',
        subido_por_id: '550e8400-e29b-41d4-a716-446655440004',
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
        await queryInterface.bulkInsert('asistencias', [
        {
        id: '550e8400-e29b-41d4-a716-446655440401',
        programa_id: programasIds[0],
        miembro_id: miembrosIds[0],
        asistio: false,
        confirmado: true,
        registrado_por_id: '550e8400-e29b-41d4-a716-446655440002',
        registrado_por_nombre: 'Juan Carlos González López',
        hora_registro: new Date(), // ✅ AGREGADO
        nombre_miembro: 'Juan Carlos González López',
        grado_miembro: 'maestro',
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440402',
        programa_id: programasIds[0],
        miembro_id: miembrosIds[1],
        asistio: false,
        confirmado: true,
        registrado_por_id: '550e8400-e29b-41d4-a716-446655440003',
        registrado_por_nombre: 'Pedro Antonio Martínez Silva',
        hora_registro: new Date(), // ✅ AGREGADO
        nombre_miembro: 'Pedro Antonio Martínez Silva',
        grado_miembro: 'maestro',
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440403',
        programa_id: programasIds[2],
        miembro_id: miembrosIds[2],
        asistio: false,
        confirmado: false,
        hora_registro: new Date(), // ✅ AGREGADO
        nombre_miembro: 'Luis Fernando Rodríguez Pérez',
        grado_miembro: 'companero',
        created_at: new Date(),
        updated_at: new Date()
    }
    ], {});

    console.log('✅ Datos iniciales insertados correctamente:');
    console.log('   - 5 Miembros');
    console.log('   - 6 Usuarios');
    console.log('   - 3 Programas');
    console.log('   - 2 Documentos');
    console.log('   - 3 Asistencias');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('asistencias', null, {});
    await queryInterface.bulkDelete('documentos', null, {});
    await queryInterface.bulkDelete('programas', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('miembros', null, {});
  }
};