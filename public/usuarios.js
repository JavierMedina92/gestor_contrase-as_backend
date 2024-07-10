const API_URL = '/api/usuarios';
let usuarios = []; // Variable global para almacenar los usuarios cargados

// Función para cargar los usuarios desde la API
const cargarUsuarios = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Error al obtener los usuarios');
        }
        usuarios = await response.json();

        // Limpiar tabla actual
        const tablaUsuarios = document.getElementById('table_data');
        if (tablaUsuarios) {
            tablaUsuarios.innerHTML = ''; // Limpiar contenido anterior

            // Insertar datos en la tabla
            usuarios.forEach(usuario => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${usuario.id}</td>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.correo}</td>
                    <td>${usuario.contraseña}</td>
                    <td>${usuario.plataforma}</td>
                    <td>${usuario.nombre_cuenta}</td>
                    <td>
                        <button class="editarBtn" data-id="${usuario.id}">Editar</button>
                        <button class="eliminarBtn" data-id="${usuario.id}">Eliminar</button>
                    </td>
                `;
                tablaUsuarios.appendChild(fila);
            });

            // Agregar eventos a los botones de editar y eliminar
            agregarEventosEditar();
            agregarEventosEliminar();
        } else {
            console.error('Elemento table_data no encontrado');
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
};

// Función para registrar un usuario (POST)
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
            alert('Usuario registrado exitosamente');
            cargarUsuarios(); // Actualizar tabla después de registro
        } else {
            const error = await response.text();
            alert('Error en el registro: ' + error);
        }
    } catch (error) {
        alert('Error en el registro: ' + error.message);
    }
};

// Función para editar un usuario (PUT)
const editarUsuario = async (id, datosActualizados) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });

        if (response.ok) {
            alert('Usuario actualizado exitosamente');
            cargarUsuarios(); // Actualizar tabla después de editar
        } else {
            const error = await response.text();
            alert('Error al actualizar usuario: ' + error);
        }
    } catch (error) {
        alert('Error al actualizar usuario: ' + error.message);
    }
};

// Función para eliminar un usuario (DELETE)
const eliminarUsuario = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Usuario eliminado exitosamente');
            cargarUsuarios(); // Actualizar tabla después de eliminar
        } else {
            const error = await response.text();
            alert('Error al eliminar usuario: ' + error);
        }
    } catch (error) {
        alert('Error al eliminar usuario: ' + error.message);
    }
};

// Función para agregar eventos a los botones de editar
const agregarEventosEditar = () => {
    const editarBtns = document.querySelectorAll('.editarBtn');
    editarBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = e.target.getAttribute('data-id');
            const usuario = usuarios.find(user => user.id == userId);
            if (usuario) {
                // Llenar el formulario de edición con los datos del usuario
                document.getElementById('editUserId').value = usuario.id;
                document.getElementById('editNombre').value = usuario.nombre;
                document.getElementById('editCorreo').value = usuario.correo;
                document.getElementById('editContraseña').value = usuario.contraseña;
                document.getElementById('editPlataforma').value = usuario.plataforma;
                document.getElementById('editNombreCuenta').value = usuario.nombre_cuenta;

                // Mostrar el modal de edición
                const modal = document.getElementById('modalEditar');
                modal.style.display = 'block';

                // Agregar evento para guardar cambios
                const formEditar = document.getElementById('formEditarUsuario');
                formEditar.addEventListener('submit', async (event) => {
                    event.preventDefault();

                    // Obtener datos actualizados del formulario
                    const id = document.getElementById('editUserId').value;
                    const nombre = document.getElementById('editNombre').value;
                    const correo = document.getElementById('editCorreo').value;
                    const contraseña = document.getElementById('editContraseña').value;
                    const plataforma = document.getElementById('editPlataforma').value;
                    const nombreCuenta = document.getElementById('editNombreCuenta').value;

                    // Validar datos de entrada
                    if (!nombre || !correo || !contraseña || !plataforma || !nombreCuenta) {
                        return alert('Todos los campos son requeridos');
                    }

                    const datosActualizados = { id, nombre, correo, contraseña, plataforma, nombre_cuenta: nombreCuenta };

                    // Enviar solicitud para actualizar el usuario
                    await editarUsuario(id, datosActualizados);

                    // Cerrar modal después de editar
                    modal.style.display = 'none';
                });

                // Agregar evento para cerrar modal
                const spanCerrar = modal.querySelector('.close');
                spanCerrar.addEventListener('click', () => {
                    modal.style.display = 'none';
                });

                // Cerrar modal si se hace clic fuera de él
                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.style.display = 'none';
                    }
                };
            } else {
                alert('Usuario no encontrado');
            }
        });
    });
};

// Función para agregar eventos a los botones de eliminar
const agregarEventosEliminar = () => {
    const eliminarBtns = document.querySelectorAll('.eliminarBtn');
    eliminarBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = e.target.getAttribute('data-id');
            const confirmarEliminar = confirm('¿Estás seguro de que deseas eliminar este usuario?');
            if (confirmarEliminar) {
                // Enviar solicitud para eliminar el usuario
                await eliminarUsuario(userId);
            }
        });
    });
};

// Evento para regresar a la interfaz principal
document.getElementById('home').addEventListener('click', () => {
    window.location.href = 'http://localhost:3000/registros';
});

// Ejecutar cargarUsuarios cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', cargarUsuarios);
