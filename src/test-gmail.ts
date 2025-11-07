import nodemailer from 'nodemailer';

async function testGmailConfig() {
  try {
    // Configurar transporter con tus credenciales
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jcancelo.dev@gmail.com',
        pass: 'eejs dklq txja yhjm', // Contraseña de aplicación
      },
    });

    // Verificar conexión
    await transporter.verify();
    console.log('✅ Gmail configurado correctamente');

    // Enviar email de prueba
    const testEmail = {
      from: '"Laboratorio 3D" <jcancelo.dev@gmail.com>',
      to: 'jcancelo.dev@gmail.com', // Email de prueba
      subject: '🧪 Test de configuración Gmail',
      html: `
        <h2>✅ Configuración exitosa</h2>
        <p>El sistema de correos de Laboratorio 3D está funcionando correctamente.</p>
        <p>Este es un email de prueba para verificar la configuración de Gmail.</p>
        <br>
        <p><strong>Features activados:</strong></p>
        <ul>
          <li>✅ Template premium minimalista</li>
          <li>✅ QR code dinámico</li>
          <li>✅ Logo base64</li>
          <li>✅ Info de request</li>
          <li>✅ Dark mode support</li>
        </ul>
        <br>
        <p><em>Enviado desde el sistema de recuperación de contraseñas</em></p>
      `,
    };

    const result = await transporter.sendMail(testEmail);
    console.log('📧 Email de prueba enviado:', result.messageId);

  } catch (error: any) {
    console.error('❌ Error en configuración Gmail:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('💡 Solución: Verifica que la contraseña de aplicación sea correcta');
      console.log('💡 O activa "Acceso de apps menos seguras" en tu cuenta Gmail');
    }
  }
}

// Ejecutar test
testGmailConfig();
