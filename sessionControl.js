// ✅ CONTROL DE SESIÓN - VERIFICA EXPIRACIÓN DEL JWT PERIÓDICAMENTE

// Función para decodificar JWT sin verificar firma
function decodificarJWT(token) {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) {
      throw new Error('Token inválido');
    }
    
    // Decodificar el payload (segunda parte)
    const payload = JSON.parse(atob(partes[1]));
    return payload;
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
}

// Función para verificar si el token está expirado
function tokenExpirado(token) {
  const payload = decodificarJWT(token);
  
  if (!payload || !payload.exp) {
    return true; // Si no tiene exp, considerarlo expirado
  }
  
  const ahora = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
  const expiracion = payload.exp; // Tiempo de expiración en segundos
  
  return ahora > expiracion; // true si expiró, false si aún es válido
}

// Función para limpiar la sesión
function limpiarSesion() {
  console.log('🔓 Limpiando sesión...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
}

// Función para cerrar sesión por expiración
function cerrarSesionExpirada() {
  limpiarSesion();
  alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
  window.location.href = 'login.html';
}

// ✅ VERIFICACIÓN PERIÓDICA DEL TOKEN (cada 30 segundos)
function iniciarVerificacionToken() {
  setInterval(() => {
    const token = localStorage.getItem('token');
    
    // Si no hay token, no hacer nada
    if (!token) {
      return;
    }
    
    // Verificar si el token está expirado
    if (tokenExpirado(token)) {
      console.log('⏰ Token expirado - cerrando sesión');
      cerrarSesionExpirada();
    } else {
      console.log('✅ Token aún válido');
    }
  }, 30000); // Verificar cada 30 segundos
}

// Ejecutar verificación cuando el documento carga
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  
  // Solo iniciar verificación si estamos en una página protegida (hay token)
  if (token) {
    iniciarVerificacionToken();
    
    // Verificar inmediatamente al cargar
    if (tokenExpirado(token)) {
      cerrarSesionExpirada();
    }
  }
});
