import crypto from 'crypto';

/**
 * Genera un token seguro para recuperación de contraseña
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Genera el enlace de recuperación de contraseña dinámicamente
 */
export function generateResetLink(token: string, email: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const encodedEmail = encodeURIComponent(email);
  return `${baseUrl}/reset-password?token=${token}&email=${encodedEmail}`;
}

/**
 * Prepara las variables para el template de email premium
 */
export function prepareEmailTemplate(email: string, nombre?: string, requestInfo?: {
  ip?: string;
  userAgent?: string;
  date?: string;
}) {
  const token = generateResetToken();
  const resetLink = generateResetLink(token, email);
  
  return {
    token,
    resetLink,
    nombre: nombre || email.split('@')[0], // Si no hay nombre, usa la parte del email
    email,
    requestIp: requestInfo?.ip || '192.168.1.100',
    userAgent: requestInfo?.userAgent || 'Chrome 119.0.0.0',
    requestDate: requestInfo?.date || new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  };
}

/**
 * Reemplaza variables en el template HTML premium
 */
export function replaceTemplateVariables(template: string, variables: {
  nombre: string;
  resetLink: string;
  email: string;
  logoBase64?: string;
  requestIp?: string;
  userAgent?: string;
  requestDate?: string;
}): string {
  let result = template;
  
  // Reemplazar {{nombre}}
  result = result.replace(/\{\{nombre\}\}/g, variables.nombre);
  
  // Reemplazar {{resetLink}}
  result = result.replace(/\{\{resetLink\}\}/g, variables.resetLink);
  
  // Reemplazar {{email}}
  result = result.replace(/\{\{email\}\}/g, variables.email);
  
  // Reemplazar {{requestIp}}
  result = result.replace(/\{\{requestIp\}\}/g, variables.requestIp || '192.168.1.100');
  
  // Reemplazar {{userAgent}}
  result = result.replace(/\{\{userAgent\}\}/g, variables.userAgent || 'Chrome 119.0.0.0');
  
  // Reemplazar {{requestDate}}
  result = result.replace(/\{\{requestDate\}\}/g, variables.requestDate || new Date().toLocaleString('es-AR'));
  
  // Reemplazar {{logoBase64}} si se proporciona
  if (variables.logoBase64) {
    result = result.replace(/\{\{logoBase64\}\}/g, variables.logoBase64);
  }
  
  return result;
}

/**
 * Genera QR code para el enlace (placeholder - requeriría librería como qrcode)
 */
export function generateQRCode(text: string): string {
  // Placeholder - en producción usarías una librería como 'qrcode'
  // Ejemplo: 
  // import QRCode from 'qrcode';
  // return QRCode.toDataURL(text);
  
  // Por ahora devolvemos un SVG placeholder
  return `<svg width="100" height="100" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" fill="white"/>
    <path d="M8 8h20v20H8zM36 8h8v8h-8zM52 8h8v8h-8zM68 8h20v20H68zM8 36h8v8H8zM24 36h8v8h-8zM36 36h20v20H36zM68 36h8v8h-8zM84 36h8v8h-8zM8 52h8v8H8zM24 52h8v8h-8zM52 52h8v8h-8zM68 52h8v8h-8zM8 68h20v20H8zM36 68h8v8h-8zM52 68h8v8h-8zM68 68h20v20H68z" fill="black"/>
  </svg>`;
}

/**
 * Reemplaza variables en el template HTML premium minimalista con QR
 */
export function replaceTemplateVariablesMinimalQR(template: string, variables: {
  nombre: string;
  resetLink: string;
  email: string;
  logoBase64?: string;
  requestIp?: string;
  userAgent?: string;
  requestDate?: string;
}): string {
  let result = replaceTemplateVariables(template, variables);
  
  // Reemplazar placeholder de QR con QR real si se necesita
  // En producción: result = result.replace(/<!-- QR code placeholder -->/g, generateQRCode(variables.resetLink));
  
  return result;
}
