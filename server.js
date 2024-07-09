const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gestor_contraseñas'
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Middleware para manejar datos JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API funcionando');
});

// Ruta para registrar usuarios
app.post('/api/registro', async (req, res) => {
    const { nombre, correo, contraseña } = req.body;

    console.log('Datos recibidos:', { nombre, correo, contraseña });

    // Validar datos de entrada
    if (!nombre || !correo || !contraseña) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    try {
        // Verificar si el usuario o correo ya existen
        const checkQuery = 'SELECT * FROM Usuarios WHERE nombre = ? OR correo = ?';
        db.query(checkQuery, [nombre, correo], async (err, results) => {
            if (err) {
                console.error('Error al verificar usuario:', err);
                return res.status(500).send('Error al verificar usuario');
            }

            if (results.length > 0) {
                return res.status(409).send('El nombre de usuario o correo ya existe');
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(contraseña, 10);

            // Insertar el nuevo usuario en la base de datos
            const query = 'INSERT INTO Usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)';
            db.query(query, [nombre, correo, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Error al registrar usuario:', err.stack);
                    return res.status(500).send('Error al registrar usuario: ' + err.message);
                }
                console.log('Resultado de la inserción:', result);
                res.status(200).send('Usuario registrado exitosamente');
            });
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send('Error al registrar usuario');
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Ruta para iniciar sesión
app.post('/api/login', (req, res) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).send('Correo y contraseña son requeridos');
    }

    const query = 'SELECT * FROM Usuarios WHERE correo = ?';
    db.query(query, [correo], async (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err.stack);
            return res.status(500).send('Error al iniciar sesión');
        }

        if (results.length === 0) {
            return res.status(400).send('Usuario no encontrado');
        }

        const usuario = results[0];
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

        if (!contraseñaValida) {
            return res.status(400).send('Contraseña incorrecta');
        }

        res.status(200).send('Inicio de sesión exitoso');
    });
});

// Ruta para agregar una contraseña
app.post('/api/contraseñas', (req, res) => {
    const { usuarioId, plataforma, contraseña } = req.body;

    if (!usuarioId || !plataforma || !contraseña) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    const query = 'INSERT INTO Cuentas (usuarioId, plataforma, contraseña) VALUES (?, ?, ?)';
    db.query(query, [usuarioId, plataforma, contraseña], (err, result) => {
        if (err) {
            console.error('Error al agregar contraseña:', err.stack);
            return res.status(500).send('Error al agregar contraseña');
        }
        res.status(200).send('Contraseña agregada exitosamente');
    });
});

// Ruta para obtener todas las contraseñas de un usuario
app.get('/api/contraseñas/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;

    const query = 'SELECT * FROM Cuentas WHERE usuarioId = ?';
    db.query(query, [usuarioId], (err, results) => {
        if (err) {
            console.error('Error al obtener contraseñas:', err.stack);
            return res.status(500).send('Error al obtener contraseñas');
        }
        res.status(200).json(results);
    });
});

// Ruta para eliminar una contraseña
app.delete('/api/contraseñas/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM Cuentas WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar contraseña:', err.stack);
            return res.status(500).send('Error al eliminar contraseña');
        }
        res.status(200).send('Contraseña eliminada exitosamente');
    });
});