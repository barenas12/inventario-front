//Inserta la información en la tabla del front
const tabla = document.querySelector('#tabla #tabla-body');

// ✅ FUNCIÓN PARA HACER REQUESTS CON JWT
async function fetchConToken(url, opciones = {}) {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('❌ No hay token, redirigiendo a login');
    window.location.href = 'login.html';
    return;
  }

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

    if (response.status === 401 || response.status === 403) {
      console.log('❌ Token expirado o inválido');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
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

async function cargarImplementos() {
    const response = await fetchConToken('http://localhost:3000/api/inventario/implemento', {
        method: 'GET'
    });
    const data = await response.json();
            const tabla = document.querySelector('#tabla-body');
            tabla.innerHTML = '';

            data.forEach(implemento => {
                const fila = tabla.insertRow();
                fila.insertCell().textContent = implemento.id_implemento;
                fila.insertCell().textContent = implemento.nombre;
                fila.insertCell().textContent = implemento.categoria;
                fila.insertCell().textContent = implemento.departamento;
                fila.insertCell().textContent = implemento.condicion;
                fila.insertCell().textContent = implemento.pertenencia;
                fila.insertCell().textContent = implemento.propietario;
                fila.insertCell().textContent = implemento.responsable;
                fila.insertCell().textContent = implemento.cantidad;
                fila.insertCell().textContent = Number(implemento.valor).toLocaleString('es-CO');
                const fecha = new Date(implemento.fecha);
                const fechaFormateada = fecha.toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                fila.insertCell().textContent = fechaFormateada;
                fila.insertCell().textContent = implemento.sede;
                fila.insertCell().textContent = implemento.descripcion;
                fila.insertCell().textContent = implemento.estado;
                const btnEditar = document.createElement('button');
                btnEditar.textContent = 'Editar';
                btnEditar.className = 'btn btn-secondary btn-sm align-items-center';
                btnEditar.style = 'float: center;';
                btnEditar.dataset.id = implemento.id;
                console.log(implemento);
                btnEditar.onclick = (dataset) => {
                    const id = dataset.target.dataset.id;
                    console.log("📌 Guardando id en sessionStorage:", id);
                    sessionStorage.setItem('id', id);
                    window.location.href = `editar_Implemento.html`;
                };
                  fila.insertCell().appendChild(btnEditar);
                });

                // actualizar contador total de registros
                const totalEl = document.getElementById('totalRegistros');
                if (totalEl) totalEl.textContent = `Total: ${data.length}`;

                // inicializar/actualizar paginación ahora que la tabla tiene filas
                if (typeof window.initPagination === 'function') {
                  window.initPagination();
                }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarImplementos();
});

function activarExportar() {
    const btnExportar = document.getElementById("exportar");

    if (!btnExportar) {
        console.error("⚠️ No se encontró el botón con id 'exportar'");
        return;
    }

    btnExportar.addEventListener("click", async () => {
        console.log("📌 Exportando inventario...");
        const token = localStorage.getItem('token');
        window.location.href = `http://localhost:3000/api/exportar?token=${token}`;
    });
}

document.addEventListener("DOMContentLoaded", activarExportar);

const menu = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main")

menu.addEventListener('click', () => {
    sidebar.classList.toggle('menu-toggle');
    menu.classList.toggle('menu-toggle');
    main.classList.toggle('menu-toggle');
})