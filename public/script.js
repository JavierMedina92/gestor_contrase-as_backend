const API_URL = '/api/registro';
const PASSWORD_LENGTH = 16;

// Función para obtener un elemento por su ID
const getElementById = (id) => document.getElementById(id);

// Función para obtener el valor de un campo de entrada
const getInputValue = (id) => getElementById(id).value;

// Función para mostrar un mensaje de alerta
const showAlert = (message) => alert(message);

// Función para limpiar el formulario
const limpiarFormulario = () => {
    getElementById('nombre').value = '';
    getElementById('correo').value = '';
    getElementById('contraseña').value = '';
    getElementById('plataforma').value = '';
    getElementById('nombre_cuenta').value = '';
};

// Función para generar una contraseña segura
const generarContraseñaSegura = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let contraseña = '';
    for (let i = 0; i < PASSWORD_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * caracteres.length);
        contraseña += caracteres[randomIndex];
    }
    return contraseña;
};

// Función para manejar el evento de generar una contraseña segura
const handleGenerarContraseña = () => {
    const contraseñaSegura = generarContraseñaSegura();
    getElementById('contraseña').value = contraseñaSegura;
};

// Función para registrar un usuario
const registrarUsuario = async (datosUsuario) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosUsuario)
        });

        if (response.ok) {
            showAlert('Registro exitoso');
            limpiarFormulario();
        } else {
            const error = await response.text();
            showAlert('Error en el registro: ' + error);
        }
    } catch (error) {
        showAlert('Error en el registro: ' + error.message);
    }
};

// Función para manejar el evento de registro
const handleRegistro = async (e) => {
    e.preventDefault();

    const nombre = getInputValue('nombre');
    const correo = getInputValue('correo');
    const contraseña = getInputValue('contraseña');
    const plataforma = getInputValue('plataforma');
    const nombreCuenta = getInputValue('nombre_cuenta');

    // Validar datos de entrada
    if (!nombre || !correo || !contraseña || !plataforma || !nombreCuenta) {
        return showAlert('Todos los campos son requeridos');
    }

    // Datos del usuario
    const datosUsuario = { nombre, correo, contraseña, plataforma, nombreCuenta };

    // Registrar usuario
    await registrarUsuario(datosUsuario);
};

// Asignar evento al botón Ver Usuarios
getElementById('verUsuarios').addEventListener('click', () => {
    window.location.href = 'usuarios.html'; // Reemplaza con la ruta correcta
});


// Asignar eventos
getElementById('registroForm').addEventListener('submit', handleRegistro);
getElementById('generarContraseña').addEventListener('click', handleGenerarContraseña);
