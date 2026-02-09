// Captura la información del nombre del implemento en el formulario
function activarNombre() {
    const implemento = document.querySelector('#implemento_name');
    return implemento.value;
}

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

// Captura la información del nombre de la categoria en el formulario
function activarCategoria() {
    const categoria = document.querySelector('#categoria');
    return categoria.value;
}
// Captura la información del nombre del departamento en el formulario
function activarDepartamento() {
    const inventario = document.querySelector('#departamento');
    return inventario.value;
}
// Captura la información del nombre de la condición en el formulario
function activarCondicion() {
    const inventario = document.querySelector('#condicion');
    return inventario.value;
}
// Captura la información del nombre del propietario en el formulario
function activarPertenencia() {
    const inventario = document.querySelector('#pertenencia');
    return inventario.value;
}

function activarPropietario() {
    const inventario = document.querySelector('#propietario');
    return inventario.value;
}


// Captura la información del nombre del valor en el formulario
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
    return inventario.value;
}

function activarEstado() {
    const estado = document.querySelector('#estado');
    return estado.value;

}

//Inserta la información en la tabla del front
const tabla = document.querySelector('#tabla #tabla-body');

// Captura la información del formulario y la agrega a la tabla
const form = document.querySelector('#formulario');

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
    const estado = activarEstado();

    const datos = {
        nombre,
        categoria,
        departamento,
        condicion,
        pertenencia,
        propietario,
        valor,
        fecha,
        estado
    };
    actualizarImplemento(datos);
    window.location.href = `index.html`;
})

// Limpia el formulario después de agregar la fila o darle click en el botónde limpiar
function limpiarFormulario() {
    document.querySelector('#formulario').reset();
}

function enviarAlBackend(datos) {
    fetchConToken('http://localhost:3000/api/inventario/implemento', {
        method: 'POST',
        body: JSON.stringify(datos)
    })
        .then(res => res.json())
        .then(data => {
            console.log('✔ Enviado al backend:', data);
            alert(data.mensaje);
        })
        .catch(error => {
            console.error('❌ Error al enviar al backend:', error);
            alert('Error al guardar en la base de datos');
        });
}



async function nombre(selectedValue = null) {
    const name = document.querySelector("#implemento_name");
    const categoria = document.querySelector("#categoria").value;
    const url = `http://localhost:3000/api/inventario/cat_implemento/${encodeURIComponent(categoria)}`;

    if (!categoria) {
        name.innerHTML = "";
        return;
    }
    // Limpia las opciones previas
    name.innerHTML = "";
    name.innerHTML = '<option value="" disabled selected>Seleccione el implemento</option>';
    try {
        const res = await fetchConToken(url, { method: 'GET' });
        const lista_cat = await res.json();
        for (let implemento of lista_cat) {
            let nuevaOpcion = document.createElement("option");
            nuevaOpcion.value = implemento.nom_implemento;
            nuevaOpcion.text = implemento.nom_implemento;
            name.add(nuevaOpcion);
        }
        // Si se pasa un valor seleccionado, asígnalo
        if (selectedValue) {
            name.value = selectedValue;
        }
    } catch (error) {
        console.error("¡Error!", error);
    }
}


function recorrerDepartamentos() {
    return new Promise((resolve, reject) => {
        const select = document.querySelector("#departamento");
        const url = 'http://localhost:3000/api/inventario/departamento';
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
                resolve();
            })
            .catch(function (error) {
                console.error("¡Error!", error);
                (reject.error);
            });
    });
}

function recorrerImplementos() {
    const select = document.querySelector("#categoria");
    const url = 'http://localhost:3000/api/inventario/cat_implemento';
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
        const id = sessionStorage.getItem('id');
        const url = 'http://localhost:3000/api/inventario/implemento/' + id;
        fetchConToken(url, {
            method: 'GET',
        })
            .then(res => {
                if (!res.ok) {
                    // Si el estado no es OK, rechaza la promesa con un error
                    return reject(new Error(`HTTP error! Status: ${res.status}`));
                }
                // Verifica si la respuesta está vacía
                if (res.status === 204) {
                    return reject(new Error("No Content: La respuesta está vacía"));
                }
                return res.json();
            })
            .then(implemento => {
                resolve(implemento);
            })
            .catch(function (error) {
                console.error("¡Error!", error);
                reject(error);
            });
    })
}

function actualizarImplemento(datos) {
    const id = sessionStorage.getItem('id');
    fetchConToken(`http://localhost:3000/api/inventario/implemento/` + id, {
        method: 'PUT',
        body: JSON.stringify(datos)
    })
        .then(res => res.json())
        .then(data => {
            console.log('✔ Actualizado Correctamente:', data);
            alert(data.mensaje);

        })
        .catch(error => {
            console.error('❌ Error al enviar al backend:', error);
            alert('Error al guardar en la base de datos');
        });
    alert('✅ Actualizado Correctamente');
}