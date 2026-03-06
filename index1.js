const menu = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main")

menu.addEventListener('click', () => {
    sidebar.classList.toggle('menu-toggle');
    menu.classList.toggle('menu-toggle');

})

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

    if (response.status === 401 || response.status === 403) {
      console.log('❌ Token expirado o inválido');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
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

// Obtener la fecha actual en formato YYYY-MM-DD
const hoy = new Date().toISOString().split("T")[0];

// Asignar la fecha máxima al input
document.getElementById("fecha").setAttribute("max", hoy);

// Captura la información del nombre del implemento en el formulario
function activarNombre() {
    const implemento = document.querySelector('#implemento_name');
    if (implemento.value == "") {
        alert("Por favor, seleccione un implemento");
        return null;
    }
    return implemento.value;
}
// Captura la información del nombre de la categoria en el formulario
function activarCategoria() {
    const categoria = document.querySelector('#categoria');
    if (categoria.value == "") {
        alert("Por favor, seleccione una categoria");
        return null;
    }
    return categoria.value;
}
// Captura la información del nombre del departamento en el formulario
function activarDepartamento() {
    const inventario = document.querySelector('#departamento');
    if (inventario.value == "") {
        alert("Por favor, seleccione un departamento");
        return null;
    }
    return inventario.value;
}

function activarResponsable(){
    const responsable = document.querySelector('#responsable');
    if(responsable.value == ""){
        alert("Por favor, seleccione un responsable")
        return null;
    }
    return responsable.value;
}
// Captura la información del nombre de la condición en el formulario
function activarCondicion() {
    const inventario = document.querySelector('#condicion');
    if (inventario.value == "") {
        alert("Por favor, seleccione el estado del implemento");
        return null;
    }
    return inventario.value;
}
// Captura la información del nombre del propietario en el formulario
function activarPertenencia() {
    const inventario = document.querySelector('#pertenencia');
    if (inventario.value == "") {
        alert("Por favor, seleccione la pertenencia del implemento");
        return null;
    }
    return inventario.value;
}

function activarPropietario() {
    const inventario = document.querySelector('#propietario');
    if (inventario.value == "") {
        alert("Por favor, seleccione el propietario del implemento");
        return null;
    }
    return inventario.value;
}

function activarValor() {
    const inventario = document.querySelector('#valor');
    if (Number(inventario.value) < 10000) {
        alert("El valor debe ser mayor a 10000")
        inventario.reset();
        return;
    }
    else {
        if (Number(inventario.value) > 100000000) {
            alert("El valor debe ser menor a 100.000.000")
            inventario.reset();
            return;
        }
    }
    return inventario.value;
}

// Captura la información del nombre de la fecha en el formulario
function activarFecha() {
    const inventario = document.querySelector('#fecha');
    if (fecha.value == "") {
        alert("Por favor, seleccione una fecha");
        return null;
    }
    console.log(inventario.value);
    return inventario.value;
}

function activarSede() {
    const inventario = document.querySelector('#sede');
    if(inventario.value ==""){
        alert("Por favor, seleccione una sede");
        return null;
    }
    console.log(inventario.value);
    return inventario.value;
}

function activarDescripcion() {
    const inventario = document.querySelector('#descripcion');
    console.log(typeof inventario.value);

    return inventario.value;
}


//Inserta la información en la tabla del front
const tabla = document.querySelector('#tabla #tabla-body');

// Captura la información del formulario y la agrega a la tabla
const form = document.querySelector('#formulario');

limpiarFormulario();

form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const nombre = activarNombre();
    const categoria = activarCategoria();
    const departamento = activarDepartamento();
    const condicion = activarCondicion();
    const pertenencia = activarPertenencia();
    const propietario = activarPropietario();
    const valor = activarValor();
    const fecha = activarFecha();
    const sede = activarSede();
    const descripcion = activarDescripcion();
    const responsable = activarResponsable();

    if (!nombre || !categoria || !departamento || !condicion || !pertenencia || !propietario || !valor || !fecha || !sede || !responsable) {
        return;
    }

    const datos = {
        nombre,
        categoria,
        departamento,
        condicion,
        pertenencia,
        propietario,
        valor,
        fecha,
        sede,
        descripcion,
        responsable
    };
    console.log(datos);
    enviarAlBackend(datos);
    alert('✅ Datos guardados correctamente');
    window.location.href = `index.html`;

})




// Limpia el formulario después de agregar la fila o darle click en el botónde limpiar
function limpiarFormulario() {
    document.querySelector('#formulario').reset();
}

function enviarAlBackend(datos) {
    fetchConToken('http://172.18.22.4:3000/api/inventario/implemento', {
        method: 'POST',
        body: JSON.stringify(datos)
    })
        .then(res => res.json())
        .then(data => {
            console.log('✔ Enviado al backend:', data);
        })
        .catch(error => {
            console.error('❌ Error al enviar al backend:', error);
            alert('Error al guardar en la base de datos');
        });
}

function recorrerDepartamentos() {
    const select = document.querySelector("#departamento");
    const url = 'http://172.18.22.4:3000/department/get-departments';
    
    fetchConToken(url, { method: 'GET' })
        .then(res => res.json())
        .then(lista_de_departamentos => {
            // ✅ Filtra solo los activos antes de recorrer
            const activos = lista_de_departamentos.filter(d => d.estado === 'Activo');
            
            for (let departamento of activos) {
                let nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = departamento.id;
                nuevaOpcion.text = departamento.nombre;
                select.add(nuevaOpcion);
            }
        })
        .catch(error => console.error("¡Error!", error));
}

function recorrerResponsable() {
    const select = document.querySelector("#responsable");
    const url = 'http://172.18.22.4:3000/api/inventario/responsable';
    select.innerHTML = '<option value="" disabled selected>Seleccione el responsable</option>';
    fetchConToken(url, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(lista_de_responsable => {
            for (let responsable of lista_de_responsable) {
                let nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = responsable.id;
                nuevaOpcion.text = responsable.nombre;
                select.add(nuevaOpcion);
            }
        })
        .catch(function (error) {
            console.error("¡Error!", error);
        });
}

function recorrerImplementos() {
    const select = document.querySelector("#categoria");
    const url = 'http://172.18.22.4:3000/api/inventario/cat_implemento';
    fetchConToken(url, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(lista_cat => {
            const activos = lista_cat.filter(d => d.estado === 'Activo');
            for (let implemento of activos) {
                let nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = implemento.id;
                nuevaOpcion.text = implemento.nombre;
                select.add(nuevaOpcion);
            }
        })
        .catch(function (error) {
            console.error("¡Error!", error);
        })
}
function nombre() {
    const name = document.querySelector("#implemento_name");
    const categoria = document.querySelector("#categoria").value;
    const url = `http://172.18.22.4:3000/api/inventario/cat_implemento/${encodeURIComponent(categoria)}`;
    name.innerHTML = '<option value="" disabled selected>Seleccione el implemento</option>';
    fetchConToken(url, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(lista_cat => {
            for (let implemento of lista_cat) {
                let nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = implemento.nom_implemento;
                nuevaOpcion.text = implemento.nom_implemento;
                name.add(nuevaOpcion);
            }
        })
        .catch(function (error) {
            console.error("¡Error!", error);
        });
}

function Propietario() {
    const propietario = document.querySelector("#propietario");
    const pertenencia = document.querySelector("#pertenencia").value;
    const url = `http://172.18.22.4:3000/api/inventario/propietario/${encodeURIComponent(pertenencia)}`;
    propietario.innerHTML = '<option value="" disabled selected>Seleccione el propietario</option>';
    fetchConToken(url, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(lista_cat => {
            for (let propietarios of lista_cat) {
                let nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = propietarios.id;
                nuevaOpcion.text = propietarios.nombre_proveedor;
                propietario.add(nuevaOpcion);
            }
        })
        .catch(function (error) {
            console.error("¡Error!", error);
        });
}

// ✅ CERRAR SESIÓN
function cerrarSesion() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function aplicarPermisosSidebar() {
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

  const role = getRoleFromToken();

  // Oculta links exclusivos de admin si no es admin
  document.querySelectorAll('[data-admin]').forEach(el => {
    el.style.display = role === 'admin' ? '' : 'none';
  });

  // Oculta links exclusivos de gestor si no es gestor
  document.querySelectorAll('[data-gestor]').forEach(el => {
    el.style.display = role === 'gestor' ? '' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', aplicarPermisosSidebar);