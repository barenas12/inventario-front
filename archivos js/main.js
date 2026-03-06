// Captura la información del nombre del implemento en el formulario
function activarNombre() {
    const implemento = document.querySelector('#implemento_name');
    if (implemento.value == "") {
        alert("Por favor, seleccione un implemento");
        return null;
    }
    return implemento.value;
}

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

// Captura la información del nombre de la categoria en el formulario
function activarCategoria() {
    const categoria = document.querySelector('#categoria');
    if (categoria.value == "") {
        alert("Por favor, seleccione una catego");
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
    else{
        if (Number(inventario.value) >100000000){
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

    if (!nombre || !categoria || !departamento || !condicion || !pertenencia || !propietario || !valor || !fecha) {
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
        fecha
    };
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


function recorrerDepartamentos() {
    const select = document.querySelector("#departamento");
    const url = 'http://172.18.22.4:3000/department/get-departments';
    fetchConToken(url, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(lista_de_departamentos => {
            for (let departamento of lista_de_departamentos) {
                let nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = departamento.id;
                nuevaOpcion.text = departamento.nombre;
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
            for (let implemento of lista_cat) {
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

function traerInformacion() {
    return new Promise((resolve, reject) => {
        const id_implemento = sessionStorage.getItem('id_implemento');
        const url = 'http://172.18.22.4:3000/api/inventario/implemento/' + id_implemento;
        fetchConToken(url, {
            method: 'GET',
        })
            .then(res => res.json())
            .then(implemento => {
                resolve(implemento);
            })
            .catch(function (error) {
                console.error("¡Error!", error);
                reject(error);
            }
            );
    })

}


function activarEstado() {
    const url = 'http://172.18.22.4:3000/department/get-departments';
    fetch(url, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(implemento => {
            for (let estado of implemento) {

            }
        })
        .catch(function (error) {
            console.error("¡Error!", error);
        }
        );
}