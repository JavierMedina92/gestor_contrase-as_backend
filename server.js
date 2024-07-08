const express = require('express');
const mysql = require('mysql2');
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
        throw err;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Middleware para manejar datos JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API funcionando');
});

// Ruta para registrar usuarios
app.post('/api/registro', (req, res) => {
    const { nombre, correo, contraseña } = req.body;

    // Validar datos de entrada
    if (!nombre || !correo || !contraseña) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    // Insertar el nuevo usuario en la base de datos
    const query = 'INSERT INTO Usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)';
    db.query(query, [nombre, correo, contraseña], (err, result) => {
        if (err) {
            return res.status(500).send('Error al registrar usuario');
        }
        res.status(200).send('Usuario registrado exitosamente');
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
