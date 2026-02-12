// ✅ FUNCIÓN PARA HACER REQUESTS CON JWT
async function fetchConToken(url, opciones = {}) {
  const token = sessionStorage.getItem('token');

  // Si no hay token, redirigir a login
  if (!token) {
    console.log('❌ No hay token, redirigiendo a login');
    window.location.href = 'login.html';
    return;
  }

  // Agregar token al header
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...opciones.headers
  };

  try {
    const response = await fetch(url, {
      ...opciones,
      headers
    });

    // Si el token expiró o es inválido (401/403)
    if (response.status === 401 || response.status === 403) {
      console.log('❌ Token expirado o inválido');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      window.location.href = 'login.html';
      return;
    }

    return response;
  } catch (error) {
    console.error('❌ Error en request:', error);
    throw error;
  }
}

// ✅ LOGIN CON JWT
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = document.getElementById('username').value;
  const contrasena = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: usuario,
        password: contrasena
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error en login');
    }

    // ✅ Guardar SOLO el token en sessionStorage (user y role viajan en el JWT)
    sessionStorage.setItem('token', data.token);

    console.log('✅ Login exitoso:', data);
    
    // Redirigir al dashboard después de 1 segundo
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    alert('❌ ' + error.message);
  }
});
