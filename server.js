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
    password: '', // Coloca tu contraseña si la tienes configurada
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

// Ruta para obtener la lista de usuarios
app.get('/api/usuarios', (req, res) => {
    const query = 'SELECT * FROM Usuarios';
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(result);
    });
});

// Ruta para obtener un usuario por su ID
app.get('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Usuarios WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener usuario por ID:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result[0]);
    });
});

// Ruta para registrar usuarios
app.post('/api/usuarios', async (req, res) => {
    const { nombre, correo, contraseña, plataforma, nombre_cuenta } = req.body;

    // Validar datos de entrada
    if (!nombre || !correo || !contraseña || !plataforma || !nombre_cuenta) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    try {
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar el nuevo usuario en la base de datos
        const insertUserQuery = 'INSERT INTO Usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)';
        db.query(insertUserQuery, [nombre, correo, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error al registrar usuario:', err);
                return res.status(500).send('Error al registrar usuario');
            }

            const userId = result.insertId;

            // Insertar la nueva cuenta en la base de datos
            const insertAccountQuery = 'INSERT INTO Cuentas (usuario_id, plataforma, nombre_cuenta, contraseña) VALUES (?, ?, ?, ?)';
            db.query(insertAccountQuery, [userId, plataforma, nombre_cuenta, contraseña], (err, result) => {
                if (err) {
                    console.error('Error al registrar cuenta:', err);
                    return res.status(500).send('Error al registrar cuenta');
                }

                // Insertar en la bitácora de accesos
                const insertLogQuery = 'INSERT INTO BitacoraAccesos (usuario_id, cuenta_id) VALUES (?, ?)';
                db.query(insertLogQuery, [userId, result.insertId], (err, result) => {
                    if (err) {
                        console.error('Error al registrar en bitácora de accesos:', err);
                        return res.status(500).send('Error al registrar en bitácora de accesos');
                    }
                    res.status(200).send('Usuario registrado exitosamente');
                });
            });
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send('Error al registrar usuario');
    }
});

// Ruta para actualizar un usuario por su ID
app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, contraseña, plataforma, nombre_cuenta } = req.body;

    // Validar datos de entrada
    if (!nombre || !correo || !contraseña || !plataforma || !nombre_cuenta) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    try {
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Actualizar usuario en la base de datos
        const updateUserQuery = 'UPDATE Usuarios SET nombre = ?, correo = ?, contraseña = ? WHERE id = ?';
        db.query(updateUserQuery, [nombre, correo, hashedPassword, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar usuario:', err);
                return res.status(500).send('Error al actualizar usuario');
            }

            // Actualizar cuenta asociada
            const updateAccountQuery = 'UPDATE Cuentas SET plataforma = ?, nombre_cuenta = ?, contraseña = ? WHERE usuario_id = ?';
            db.query(updateAccountQuery, [plataforma, nombre_cuenta, contraseña, id], (err, result) => {
                if (err) {
                    console.error('Error al actualizar cuenta:', err);
                    return res.status(500).send('Error al actualizar cuenta');
                }
                res.status(200).send('Usuario actualizado correctamente');
            });
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).send('Error al actualizar usuario');
    }
});

// Ruta para eliminar un usuario por su ID
app.delete('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;

    // Eliminar usuario de la base de datos
    const deleteUserQuery = 'DELETE FROM Usuarios WHERE id = ?';
    db.query(deleteUserQuery, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar usuario:', err);
            return res.status(500).send('Error al eliminar usuario');
        }
        res.status(200).send('Usuario eliminado correctamente');
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
