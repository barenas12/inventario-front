//Inserta la información en la tabla del front
const tabla = document.querySelector('#tabla #tabla-body');


function cargarImplementos() {
    fetch('http://localhost:3000/api/inventario/implemento')
        .then(response => response.json())
        .then(data => {
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
        })
        .catch(error => {
            console.error('❌ Error al cargar implementos:', error);
        })
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

    btnExportar.addEventListener("click", () => {
        console.log("📌 Exportando inventario...");
        window.location.href = "http://localhost:3000/api/exportar";
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