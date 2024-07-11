-- Tabla de usuarios
CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cuentas
CREATE TABLE Cuentas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    plataforma VARCHAR(100) NOT NULL,
    nombre_cuenta VARCHAR(100) NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

-- Tabla de bitácora de accesos
CREATE TABLE BitacoraAccesos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    cuenta_id INT,
    fecha_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
    FOREIGN KEY (cuenta_id) REFERENCES Cuentas(id)
);
