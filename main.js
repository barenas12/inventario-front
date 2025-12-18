function tomar_usuario() {
    const user = document.querySelector('#user');
    return user.value;
}

function tomar_password(){
    const password = document.querySelector('#password');
    return password.value;
}

function comprobar_credenciales() {

    const user = tomar_usuario(); // ✓ correcto
    const password = tomar_password();

    if (!user || !password) {
        alert("Debe ingresar usuario y contraseña");
        return;
    }

    const url = `http://localhost:3000/api/login/users/${encodeURIComponent(user)}`;

    fetch(url)
        .then(res => {
            if (res.status === 404) {
                throw new Error("Usuario no existe");
            }
            return res.json();
        })
        .then(data => {
            // data = { password: "1234" }

            if (data.password === password) {
                alert("¡Credenciales correctas!");
                window.location.href = "index.html";
            } else {
                alert("¡Contraseña incorrecta!");
            }
        })
        .catch(err => {
            alert("Usuario no válido");
            console.error(err);
        });
}


/////
