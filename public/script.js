const API_URL = '/api/usuarios';
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

const registrarUsuario = async (datosUsuario) => {
    try {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosUsuario)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en el registro:', errorText);
            // Mostrar mensaje de error al usuario si es necesario
        } else {
            // Registro exitoso, procesar respuesta si es necesario
        }
    } catch (error) {
        console.error('Error en el registro:', error.message);
        // Mostrar mensaje de error al usuario si es necesario
    }
};

// Ejemplo de función para manejar el evento de registro en el cliente
const handleRegistro = async (e) => {
    e.preventDefault();

    const nombre = getInputValue('nombre');
    const correo = getInputValue('correo');
    const contraseña = getInputValue('contraseña');
    const plataforma = getInputValue('plataforma');
    const nombreCuenta = getInputValue('nombre_cuenta');

    // Validar datos antes de enviarlos
    if (!nombre || !correo || !contraseña || !plataforma || !nombreCuenta) {
        // Mostrar mensaje al usuario indicando que todos los campos son requeridos
        showAlert('Todos los campos son requeridos');
        return;
    }

    // Datos del usuario a enviar al servidor
    const datosUsuario = { nombre, correo, contraseña, plataforma, nombreCuenta };

    // Enviar solicitud POST para registrar usuario
    await registrarUsuario(datosUsuario);
};

// Asignar evento al botón Ver Usuarios
getElementById('verUsuarios').addEventListener('click', () => {
    window.location.href = 'usuarios.html'; // Reemplaza con la ruta correcta
});


// Asignar eventos
getElementById('registroForm').addEventListener('submit', handleRegistro);
getElementById('generarContraseña').addEventListener('click', handleGenerarContraseña);