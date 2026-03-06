// ✅ FUNCIÓN PARA HACER REQUESTS CON JWT
async function fetchConToken(url, opciones = {}) {
  const token = sessionStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...opciones.headers
  };

  try {
    const response = await fetch(url, { ...opciones, headers });

    if (response.status === 401 || response.status === 403) {
      sessionStorage.clear();
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

// ✅ MODAL DE CAMBIO DE CONTRASEÑA
function mostrarModalCambioContrasena() {
  if (document.getElementById('modalCambioPass')) return;

  const modalHTML = `
    <div id="modalCambioPass" style="
      position:fixed; inset:0; background:rgba(0,0,0,0.6);
      display:flex; align-items:center; justify-content:center; z-index:9999;">
      <div style="
        background:#fff; border-radius:12px; padding:2rem;
        width:100%; max-width:420px; box-shadow:0 8px 32px rgba(0,0,0,0.2);">
        <h4 style="margin-bottom:0.25rem;">🔐 Cambio de contraseña requerido</h4>
        <p style="color:#666; font-size:0.9rem; margin-bottom:1.5rem;">
          Por seguridad, debes establecer una nueva contraseña antes de continuar.
        </p>

        <label style="display:block; margin-bottom:.25rem; font-weight:500;">Nueva contraseña</label>
        <input type="password" id="nuevaPass" placeholder="Mínimo 8 caracteres" style="
          width:100%; padding:.6rem .75rem; border:1px solid #ccc;
          border-radius:8px; margin-bottom:.5rem; font-size:1rem; box-sizing:border-box;">

        <label style="display:block; margin-bottom:.25rem; font-weight:500;">Confirmar contraseña</label>
        <input type="password" id="confirmarPass" placeholder="Repite la contraseña" style="
          width:100%; padding:.6rem .75rem; border:1px solid #ccc;
          border-radius:8px; margin-bottom:1rem; font-size:1rem; box-sizing:border-box;">

        <p id="errorCambio" style="color:red; font-size:.875rem; min-height:1.2rem; margin-bottom:.75rem;"></p>

        <button id="btnGuardarPass" style="
          width:100%; padding:.7rem; background:#0d6efd; color:#fff;
          border:none; border-radius:8px; font-size:1rem; cursor:pointer;">
          Guardar contraseña
        </button>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // ✅ Checklist de requisitos en tiempo real
  const checks = [
    { regex: /.{8,}/,        id: 'req-len',     texto: 'Mínimo 8 caracteres' },
    { regex: /[A-Z]/,        id: 'req-upper',   texto: '1 letra mayúscula' },
    { regex: /[a-z]/,        id: 'req-lower',   texto: '1 letra minúscula' },
    { regex: /[0-9]/,        id: 'req-num',     texto: '1 número' },
    { regex: /[^A-Za-z0-9]/, id: 'req-special', texto: '1 carácter especial (!@#$...)' },
  ];

  const checklist = document.createElement('ul');
  checklist.style.cssText = 'list-style:none; padding:0; margin:-0.25rem 0 1rem; font-size:0.82rem;';
  checks.forEach(c => {
    const li = document.createElement('li');
    li.id = c.id;
    li.style.cssText = 'color:#aaa; transition: color .2s;';
    li.innerHTML = `⬜ ${c.texto}`;
    checklist.appendChild(li);
  });
  document.getElementById('nuevaPass').insertAdjacentElement('afterend', checklist);

  document.getElementById('nuevaPass').addEventListener('input', (e) => {
    const val = e.target.value;
    checks.forEach(c => {
      const li = document.getElementById(c.id);
      const ok = c.regex.test(val);
      li.style.color = ok ? '#198754' : '#aaa';
      li.innerHTML = `${ok ? '✅' : '⬜'} ${c.texto}`;
    });
  });

  // ✅ Guardar nueva contraseña
  document.getElementById('btnGuardarPass').addEventListener('click', async () => {
    const nueva = document.getElementById('nuevaPass').value;
    const confirmar = document.getElementById('confirmarPass').value;
    const errorEl = document.getElementById('errorCambio');

    errorEl.textContent = '';

    // Validar requisitos
    const requisitos = [
      { regex: /.{8,}/,        texto: 'Mínimo 8 caracteres' },
      { regex: /[A-Z]/,        texto: 'Al menos 1 letra mayúscula' },
      { regex: /[a-z]/,        texto: 'Al menos 1 letra minúscula' },
      { regex: /[0-9]/,        texto: 'Al menos 1 número' },
      { regex: /[^A-Za-z0-9]/, texto: 'Al menos 1 carácter especial (!@#$...)' },
    ];

    const fallidos = requisitos.filter(r => !r.regex.test(nueva));
    if (fallidos.length > 0) {
      errorEl.innerHTML = '❌ La contraseña no cumple:<br>• ' + fallidos.map(f => f.texto).join('<br>• ');
      return;
    }

    if (nueva !== confirmar) {
      errorEl.textContent = '❌ Las contraseñas no coinciden.';
      return;
    }

    const btn = document.getElementById('btnGuardarPass');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://172.18.22.4:3000/api/login/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nuevaContrasena: nueva })
      });

      const data = await response.json();

      if (!response.ok) {
        errorEl.textContent = '❌ ' + (data.mensaje || 'Error al guardar');
        btn.disabled = false;
        btn.textContent = 'Guardar contraseña';
        return;
      }

      document.getElementById('modalCambioPass').remove();
      alert('✅ Contraseña actualizada. Bienvenido/a.');
      window.location.href = 'index.html';

    } catch (err) {
      errorEl.textContent = '❌ Error de conexión. Intenta de nuevo.';
      btn.disabled = false;
      btn.textContent = 'Guardar contraseña';
    }
  });
}

// ✅ LOGIN CON JWT
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = document.getElementById('username').value;
  const contrasena = document.getElementById('password').value;

  try {
    const response = await fetch('http://172.18.22.4:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: usuario, password: contrasena })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error en login');
    }

    sessionStorage.setItem('token', data.token);
    if (data.role) sessionStorage.setItem('role', data.role);
    if (data.user) sessionStorage.setItem('user', data.user);

    // ✅ Si debe cambiar contraseña, mostrar modal
    if (data.mustChangePassword) {
      mostrarModalCambioContrasena();
      return;
    }

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);

  } catch (error) {
    console.error('❌ Error:', error.message);
    alert('❌ ' + error.message);
  }
});