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
        const response = await fetchConToken('http://172.18.22.4:3000/api/login/users', {
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
            const response = await fetch('http://172.18.22.4:3000/api/exportar/usuarios', {
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

function aplicarFiltro() {
    const columna = document.getElementById("columnaFiltro").value;
    const valor = document.getElementById("valorFiltro").value.toLowerCase().trim();
    const tabla = document.getElementById("tabla");
    const filas = tabla.getElementsByTagName("tr");

    for (let i = 1; i < filas.length; i++) {
        const celdas = filas[i].getElementsByTagName("td");
        if (celdas[columna]) {
            const texto = celdas[columna].innerText.toLowerCase().trim();

            let mostrar = false;

            // Si la columna es Estado (12) → coincidencia exacta
            if (columna == 5) {
                mostrar = (texto === valor);
            } else {
                // Para las demás columnas → coincidencia parcial
                mostrar = texto.includes(valor);
            }

            filas[i].style.display = mostrar ? "" : "none";
        }
    }
}

function limpiarFiltro() {
    document.getElementById("valorFiltro").value = "";
    const tabla = document.getElementById("tabla");
    const filas = tabla.getElementsByTagName("tr");

    for (let i = 1; i < filas.length; i++) {
        filas[i].style.display = ""; // muestra todas otra vez
    }
}

// Inicializa la paginación; se llama después de cargar los datos en la tabla
window.initPagination = function () {
    const tabla = document.querySelector("table tbody"); // cuerpo de la tabla
    let filas = tabla.querySelectorAll("tr"); // todas las filas actuales
    const selectRegistros = document.getElementById("registrosPorPagina");
    const paginacionEl = document.getElementById('paginacion');

    let paginaActual = 1;

    function getRegistrosPorPagina() {
        const v = parseInt(selectRegistros.value, 10);
        if (isNaN(v) || v <= 0) return filas.length; // 0 o invalid => mostrar todo
        return v;
    }

    function mostrarPagina(pagina) {
        filas = tabla.querySelectorAll("tr");
        const total = filas.length;
        const registrosPorPagina = getRegistrosPorPagina();
        const inicio = (pagina - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;

        filas.forEach((fila, index) => {
            fila.style.display = (index >= inicio && index < fin) ? "" : "none";
        });

        renderPaginacion(total, registrosPorPagina);
    }

    function renderPaginacion(totalRegistros, registrosPorPagina) {
        paginacionEl.innerHTML = '';
        const totalPaginas = Math.max(1, Math.ceil(totalRegistros / registrosPorPagina));

        function crearLi(text, disabled, active, onClick) {
            const li = document.createElement('li');
            li.className = 'page-item' + (disabled ? ' disabled' : '') + (active ? ' active' : '');
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = text;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (!disabled) onClick();
            });
            li.appendChild(a);
            return li;
        }

        // Prev
        paginacionEl.appendChild(crearLi('Anterior', paginaActual === 1, false, () => {
            if (paginaActual > 1) { paginaActual--; mostrarPagina(paginaActual); }
        }));

        // Páginas numeradas (si son muchas, podríamos truncar, pero por ahora mostramos todas)
        for (let p = 1; p <= totalPaginas; p++) {
            paginacionEl.appendChild(crearLi(p, false, p === paginaActual, () => {
                paginaActual = p; mostrarPagina(paginaActual);
            }));
        }

        // Next
        paginacionEl.appendChild(crearLi('Siguiente', paginaActual === totalPaginas, false, () => {
            if (paginaActual < totalPaginas) { paginaActual++; mostrarPagina(paginaActual); }
        }));
    }

    // cuando cambias la cantidad en el select
    selectRegistros.addEventListener("change", () => {
        filas = tabla.querySelectorAll("tr");
        paginaActual = 1;
        mostrarPagina(paginaActual);
    });

    // inicia mostrando la primera página
    mostrarPagina(paginaActual);
};
