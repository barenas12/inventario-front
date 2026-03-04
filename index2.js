//Inserta la información en la tabla del front
const tabla = document.querySelector('#tabla #tabla-body');

// ✅ FUNCIÓN PARA HACER REQUESTS CON JWT
async function fetchConToken(url, opciones = {}) {
    const token = sessionStorage.getItem('token');

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

        if (response.status === 401) {
            console.log('❌ Token expirado o inválido');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('role');
            alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
            window.location.href = 'login.html';
            return;
        }
        if (response.status === 403) {
            // permiso denegado, no eliminar la sesión
            console.log('❌ Acceso denegado - sin permisos');
            alert('No tienes permisos para realizar esta acción.');
            return response;
        }

        return response;
    } catch (error) {
        console.error('❌ Error en request:', error);
        throw error;
    }
}

async function cargarUsuarios() {
    try {
        const response = await fetchConToken('http://localhost:3000/api/login/users', {
            method: 'GET'
        });

        if (!response) {
            console.error('⚠️ No se obtuvo respuesta del servidor');
            return;
        }

        if (!response.ok) {
            console.error('⚠️ Error al cargar usuarios, estado:', response.status);
            // opcional: mostrar mensaje en interfaz
            return;
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            console.error('⚠️ Formato de datos inesperado:', data);
            return;
        }

        const tabla = document.querySelector('#tabla-body');
        tabla.innerHTML = '';

        data.forEach(users => {
            const fila = tabla.insertRow();
            fila.insertCell().textContent = users.id;
            fila.insertCell().textContent = users.nombre;
            fila.insertCell().textContent = users.apellido;
            fila.insertCell().textContent = users.user;
            fila.insertCell().textContent = users.role;
            fila.insertCell().textContent = users.status;
            fila.insertCell().textContent = users.reset_pass;
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn btn-secondary btn-sm align-items-center btn-edit';
            btnEditar.style = 'float: center;';
            btnEditar.dataset.id = users.id;
            console.log(users);
            // Evitar que usuarios sin rol administrador activen la edición
            function getRoleFromToken() {
                const token = sessionStorage.getItem('token');
                if (!token) return null;
                try {
                    const partes = token.split('.');
                    if (partes.length !== 3) return null;
                    const payload = JSON.parse(atob(partes[1]));
                    return payload?.role || null;
                } catch (e) {
                    return null;
                }
            }

            btnEditar.onclick = (dataset) => {
                const role = getRoleFromToken();
                if (role !== 'admin') {
                    alert('No tienes permisos para editar este registro');
                    return;
                }
                const id = dataset.target.dataset.id;
                console.log("📌 Guardando id en sessionStorage:", id);
                sessionStorage.setItem('id', id);
                window.location.href = `editar_Usuario.html`;
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
    } catch (err) {
        console.error('❌ Excepción al cargar usuarios:', err);
    }
}

function activarExportar() {
    const btnExportar = document.getElementById("exportar");

    if (!btnExportar) {
        console.error("⚠️ No se encontró el botón con id 'exportar'");
        return;
    }

    btnExportar.addEventListener("click", async () => {
        console.log("📌 Exportando inventario...");
        const token = sessionStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:3000/api/exportar/usuarios', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error en la exportación');
            }

            // Descargar el archivo
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('❌ Error al exportar:', error);
            alert('Error al exportar el los usuarios');
        }
    });
}
document.addEventListener("DOMContentLoaded", activarExportar);

document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
});

const menu = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main")

menu.addEventListener('click', () => {
    sidebar.classList.toggle('menu-toggle');
    menu.classList.toggle('menu-toggle');
    main.classList.toggle('menu-toggle');
})

// ✅ CERRAR SESIÓN
function cerrarSesion() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}