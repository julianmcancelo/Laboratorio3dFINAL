import { NextRequest, NextResponse } from 'next/server';
import { crearUsuario, obtenerUsuarioPorEmail } from '@/lib/database';
import bcrypt from 'bcryptjs';

// Tipo para los datos de registro validados
interface RegistroUsuarioInput {
  nombre_completo: string;
  email: string;
  password: string;
  dni: string;
  telefono?: string;
  instagram?: string;
  codigo_referido?: string;
  acepta_terminos: boolean;
  acepta_privacidad: boolean;
}

/**
 * 📝 Maneja la solicitud POST para registro de usuarios
 * 
 * @param request - Request de Next.js con datos de registro
 * @returns Response con resultado del registro
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📝 Iniciando proceso de registro de usuario');

    // 1. Validar y extraer datos del body
    const body = await validarBodyRequest(request, RegistroUsuarioSchema) as RegistroUsuarioInput;
    const {
      nombre_completo,
      email,
      password,
      dni,
      telefono,
      instagram,
      codigo_referido,
      acepta_terminos,
      acepta_privacidad
    } = body;

    console.log('📧 Validando datos para registro:', email);

    // 2. Verificar si el email ya está registrado
    const emailExistente = await ejecutarConsultaUnica(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (emailExistente) {
      console.log('❌ Email ya registrado:', email);
      return NextResponse.json(
        { 
          success: false, 
          error: 'El email ya está registrado en el sistema',
          codigo: 'EMAIL_EXISTENTE'
        },
        { status: 409 }
      );
    }

    // 3. Verificar si el DNI ya está registrado
    const dniExistente = await ejecutarConsultaUnica(
      'SELECT id FROM usuarios WHERE dni = ?',
      [dni]
    );

    if (dniExistente) {
      console.log('❌ DNI ya registrado:', dni);
      return NextResponse.json(
        { 
          success: false, 
          error: 'El DNI ya está registrado en el sistema',
          codigo: 'DNI_EXISTENTE'
        },
        { status: 409 }
      );
    }

    // 4. Procesar código de referido si se proporcionó
    let referidoPorId: number | null = null;
    if (codigo_referido && codigo_referido.trim() !== '') {
      const referente = await ejecutarConsultaUnica(
        'SELECT id FROM usuarios WHERE codigo_referido = ? AND activo = 1',
        [codigo_referido.trim()]
      );

      if (!referente) {
        console.log('❌ Código de referido inválido:', codigo_referido);
        return NextResponse.json(
          { 
            success: false, 
            error: 'El código de referido no es válido',
            codigo: 'CODIGO_REFERIDO_INVALIDO'
          },
          { status: 400 }
        );
      }

      referidoPorId = referente.id;
    }

    // 5. Generar código de referido para el nuevo usuario
    const codigoReferidoUsuario = generarCodigoReferido(nombre_completo);

    // 6. Hashear la contraseña de forma segura
    console.log('🔐 Hasheando contraseña');
    const passwordHash = await bcrypt.hash(password, 12);

    // 7. Crear el usuario en la base de datos usando transacción
    console.log('💾 Creando usuario en la base de datos');
    
    const nuevoUsuarioId = await ejecutarTransaccion(async (conexion) => {
      // Insertar el nuevo usuario
      const usuarioId = await ejecutarInsercion(
        `INSERT INTO usuarios (
          nombre_completo,
          email,
          password_hash,
          dni,
          telefono,
          instagram,
          rol,
          estado,
          codigo_referido,
          referido_por_id,
          puntos_acumulados,
          nivel_lealtad_id,
          apto_para_canje,
          activo,
          fecha_creacion,
          fecha_actualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          nombre_completo.trim(),
          email.toLowerCase().trim(),
          passwordHash,
          dni,
          telefono || null,
          instagram || null,
          RolUsuario.CLIENTE, // Rol por defecto
          'activo', // Estado por defecto
          codigoReferidoUsuario,
          referidoPorId,
          500, // 🎁 Bono de bienvenida según documento (1 punto = $1.000)
          1, // Nivel de lealtad inicial (Bronce)
          false, // No apto para canje inicialmente
          true, // Activo
        ]
      );

      // Si hay un referente, actualizar sus estadísticas
      if (referidoPorId) {
        await conexion.execute(
          'UPDATE usuarios SET total_referidos = total_referidos + 1 WHERE id = ?',
          [referidoPorId]
        );
      }

      // Registrar en el log de auditoría
      await conexion.execute(
        `INSERT INTO auditoria (
          usuario_id,
          tipo_operacion,
          recurso_afectado,
          recurso_id,
          descripcion,
          ip_address,
          user_agent,
          fecha_operacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          usuarioId,
          'crear',
          'usuario',
          usuarioId,
          `Registro de nuevo usuario: ${email}`,
          request.headers.get('x-forwarded-for') || 'unknown',
          request.headers.get('user-agent') || 'unknown',
        ]
      );

      return usuarioId;
    });

    // 8. Generar token JWT para el nuevo usuario
    console.log('🔑 Generando token JWT para nuevo usuario');
    const tokenJWT = await generarTokenJWT({
      id: nuevoUsuarioId,
      email: email,
      rol: RolUsuario.CLIENTE,
      nombre_completo: nombre_completo
    });

    // 9. Preparar respuesta con datos del usuario
    const usuarioResponse = {
      id: nuevoUsuarioId,
      nombre_completo: nombre_completo.trim(),
      email: email.toLowerCase().trim(),
      rol: RolUsuario.CLIENTE,
      puntos_acumulados: 0,
      codigo_referido: codigoReferidoUsuario,
      nivel_lealtad: 'Bronce',
      apto_para_canje: false,
      referidos_count: 0,
    };

    // 10. Crear response con cookies seguras
    const response = NextResponse.json(
      {
        success: true,
        mensaje: 'Usuario registrado exitosamente',
        usuario: usuarioResponse,
        token: tokenJWT,
        bienvenida: true
      },
      { status: 201 }
    );

    // 11. Establecer cookies seguras
    response.cookies.set('auth_token', tokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/',
    });

    console.log('✅ Usuario registrado exitosamente:', email);
    return response;

  } catch (error) {
    console.error('❌ Error en el proceso de registro:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor al registrar el usuario',
        codigo: 'ERROR_INTERNO'
      },
      { status: 500 }
    );
  }
}

/**
 * 🏷️ Genera un código de referido único basado en el nombre
 * 
 * @param nombre - Nombre completo del usuario
 * @returns Código de referido generado
 */
function generarCodigoReferido(nombre: string): string {
  try {
    // Tomar las primeras 4 letras del nombre, quitar espacios y acentos
    const nombreLimpio = nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/\s+/g, '') // Quitar espacios
      .toUpperCase()
      .slice(0, 4);

    // Generar número aleatorio de 4 dígitos
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    
    return `${nombreLimpio}${numeroAleatorio}`;
  } catch (error) {
    console.error('❌ Error al generar código de referido:', error);
    // Fallback: generar código aleatorio
    return `USER${Math.floor(10000 + Math.random() * 90000)}`;
  }
}

/**
 * 🚫 Método no permitido para GET
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Método no permitido',
      codigo: 'METODO_NO_PERMITIDO'
    },
    { status: 405 }
  );
}
