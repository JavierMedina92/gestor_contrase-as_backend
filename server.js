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

// Ruta para obtener datos de la base de datos
app.get('/datos', (req, res) => {
    db.query('SELECT * FROM Cuentas', (err, result) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(result); // Devolver los datos como respuesta en formato JSON
    });
});

// Ruta para registrar usuarios y sus cuentas
app.post('/api/registro', async (req, res) => {
    const { nombre, correo, contraseña, plataforma, nombreCuenta } = req.body;

    console.log('Datos recibidos:', { nombre, correo, contraseña, plataforma, nombreCuenta });

    // Validar datos de entrada
    if (!nombre || !correo || !contraseña || !plataforma || !nombreCuenta) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    try {
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Iniciar transacción
        db.beginTransaction((err) => {
            if (err) {
                return res.status(500).send('Error al iniciar la transacción');
            }

            // Insertar el nuevo usuario en la base de datos
            const insertUserQuery = 'INSERT INTO Usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)';
            db.query(insertUserQuery, [nombre, correo, hashedPassword], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error al registrar usuario:', err.stack);
                        return res.status(500).send('Error al registrar usuario: ' + err.message);
                    });
                }

                const userId = result.insertId;

                // Insertar la nueva cuenta en la base de datos
                const insertAccountQuery = 'INSERT INTO Cuentas (usuario_id, plataforma, nombre_cuenta, contraseña) VALUES (?, ?, ?, ?)';
                db.query(insertAccountQuery, [userId, plataforma, nombreCuenta, contraseña], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error al registrar cuenta:', err.stack);
                            return res.status(500).send('Error al registrar cuenta: ' + err.message);
                        });
                    }

                    const accountId = result.insertId;

                    // Insertar en la bitácora de accesos
                    const insertLogQuery = 'INSERT INTO BitacoraAccesos (usuario_id, cuenta_id) VALUES (?, ?)';
                    db.query(insertLogQuery, [userId, accountId], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error al registrar en bitácora de accesos:', err.stack);
                                return res.status(500).send('Error al registrar en bitácora de accesos: ' + err.message);
                            });
                        }

                        // Confirmar transacción
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error('Error al confirmar la transacción:', err.stack);
                                    return res.status(500).send('Error al confirmar la transacción');
                                });
                            }
                            res.status(200).send('Usuario registrado exitosamente');
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send('Error al registrar usuario');
    }
});

// Ruta para obtener la lista de usuarios
app.get('/api/usuarios', (req, res) => {
    db.query('SELECT * FROM Usuarios', (err, result) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(result);
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
