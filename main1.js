document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = document.getElementById('username').value;
  const contrasena = document.getElementById('password').value;

  const response = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: usuario,
      password: contrasena
    })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.mensaje || 'Error en login');
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('✅ Login exitoso:', data);
    localStorage.setItem('user', data.user);
    localStorage.setItem('role', data.role);
    window.location.href = 'index.html';
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    alert('❌ ' + error.message);
  });
});
