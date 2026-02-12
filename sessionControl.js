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
  sessionStorage.removeItem('token');
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
    const token = sessionStorage.getItem('token');
    
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
  const token = sessionStorage.getItem('token');
  
  // Solo iniciar verificación si estamos en una página protegida (hay token)
  if (token) {
    iniciarVerificacionToken();
    
    // Verificar inmediatamente al cargar
    if (tokenExpirado(token)) {
      cerrarSesionExpirada();
    }
    
    // Validar permisos según el rol
    validarPermisosUsuario();
  }
});

// ✅ OBTENER DATOS DEL USUARIO DESDE EL JWT (sin guardarlos en sesionStorage)
function obtenerDatosUsuario() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    return { id: null, user: null, role: null };
  }
  
  const payload = decodificarJWT(token);
  return {
    id: payload?.id || null,
    user: payload?.user || null,
    role: payload?.role || null
  };
}

// ✅ VALIDACIÓN DE PERMISOS SEGÚN ROL
function validarPermisosUsuario() {
  const datosUsuario = obtenerDatosUsuario();
  const { id, user, role } = datosUsuario;
  
  console.log(`👤 Usuario ID: ${id}, Usuario: ${user}, Rol: ${role}`);
  
  // Obtener la página actual
  const paginaActual = window.location.pathname.split('/').pop() || 'index.html';
  
  // Páginas que solo pueden acceder administradores
  const paginasAdmin = ['crear_Implemento.html', 'editar_Implemento.html', 'reportes.html', 'usuarios.html', 'configuracion.html'];
  
  // Validar acceso a página restringida
  if (paginasAdmin.includes(paginaActual) && role !== 'admin') {
    console.warn(`⛔ Acceso denegado a ${paginaActual} - Usuario sin permisos`);
    alert('⛔ Acceso denegado. Solo administradores pueden acceder a esta página.');
    window.location.href = 'index.html'; // Redirigir a página principal
    return;
  }
  
  // Mostrar/ocultar elementos según el rol
  if (role === 'admin') {
    // Mostrar botones administrativos
    const btnExportar = document.getElementById('exportar');
    const btnEliminar = document.querySelectorAll('.btn-danger');
    const btnCrear = document.querySelectorAll('.btn-create');
    const btnEditar = document.querySelectorAll('.btn-edit');
    
    if (btnExportar) btnExportar.classList.remove('hidden');
    btnEliminar.forEach(btn => btn.classList.remove('hidden'));
    btnCrear.forEach(btn => btn.classList.remove('hidden'));
    btnEditar.forEach(btn => btn.classList.remove('hidden'));
    
    // Mostrar enlaces a páginas admin en el menú
    document.querySelectorAll('[data-admin]').forEach(el => el.classList.remove('hidden'));
    
    console.log('✅ Permisos de administrador activados');
  } else if (role === 'user') {
    // Ocultar botones administrativos
    const btnExportar = document.getElementById('exportar');
    const btnEliminar = document.querySelectorAll('.btn-danger');
    const btnCrear = document.querySelectorAll('.btn-create');
    const btnEditar = document.querySelectorAll('.btn-edit');
    
    if (btnExportar) btnExportar.classList.add('hidden');
    btnEliminar.forEach(btn => btn.classList.add('hidden'));
    btnCrear.forEach(btn => btn.classList.add('hidden'));
    btnEditar.forEach(btn => btn.classList.add('hidden'));
    
    // Ocultar enlaces a páginas admin en el menú
    document.querySelectorAll('[data-admin]').forEach(el => el.classList.add('hidden'));
    
    console.log('⚠️ Acceso restringido - Usuario sin permisos administrativos');
  }
}
