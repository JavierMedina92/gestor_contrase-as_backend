const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

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
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send('Error al registrar usuario');
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
