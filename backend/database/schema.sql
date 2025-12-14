CREATE DATABASE IF NOT EXISTS ferreteria_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE ferreteria_db;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

-- ================================
-- LIMPIEZA
-- ================================
DROP TABLE IF EXISTS historial_precios;
DROP TABLE IF EXISTS movimiento_inventario;
DROP TABLE IF EXISTS producto_proveedor;
DROP TABLE IF EXISTS proveedor;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS empleado;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS roles;

-- ================================
-- 1. TABLA ROLES (CON DATOS)
-- ================================
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(255) NOT NULL,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertamos los roles básicos necesarios
INSERT INTO roles (nombre_rol) VALUES
('Administrador del Sistema'),
('Vendedor'),
('Almacenista');

-- ================================
-- 2. TABLA USUARIO (CON DATOS)
-- ================================
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Recuerda que en producción esto debe ser un hash real (Bcrypt/Argon2)
    email VARCHAR(100),
    telefono VARCHAR(20),
    activo TINYINT(1) DEFAULT 1,
    ultimo_acceso DATETIME,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertamos un usuario Admin por defecto
-- NOTA: El password aquí es un ejemplo. Si tu sistema usa hash, asegúrate de generar el hash de 'admin123'
INSERT INTO usuario (usuario, password_hash, email, telefono) VALUES
('admin', 'admin123', 'admin@ferreteria.com', '555-0000');

-- ================================
-- 3. TABLA EMPLEADO (CON DATOS)
-- ================================
CREATE TABLE empleado (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    id_usuario INT,
    id_rol INT,
    salario DECIMAL(10,2),
    fecha_contratacion DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    direccion VARCHAR(255),
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- Vinculamos al usuario 'admin' con el rol 'Administrador del Sistema'
INSERT INTO empleado (nombre_completo, id_usuario, id_rol, salario, fecha_contratacion, direccion) VALUES
('Super Administrador', 1, 1, 0.00, CURDATE(), 'Oficina Central');

-- ================================
-- 4. TABLA CATEGORIA (VACÍA)
-- ================================
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================================
-- 5. TABLA PRODUCTO (VACÍA)
-- ================================
CREATE TABLE producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    codigo VARCHAR(50) UNIQUE,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0,
    stock_maximo INT NOT NULL DEFAULT 100,
    ubicacion VARCHAR(100),
    id_categoria INT NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- ================================
-- 6. TABLA PROVEEDOR (VACÍA)
-- ================================
CREATE TABLE proveedor (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre_proveedor VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================================
-- 7. TABLA RELACIÓN PRODUCTO - PROVEEDOR (VACÍA)
-- ================================
CREATE TABLE producto_proveedor (
    id_producto INT NOT NULL,
    id_proveedor INT NOT NULL,
    precio_compra DECIMAL(10,2),
    PRIMARY KEY (id_producto, id_proveedor),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
);

-- ================================
-- 8. TABLA MOVIMIENTO INVENTARIO (VACÍA)
-- ================================
CREATE TABLE movimiento_inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    id_empleado INT,
    tipo_movimiento ENUM('entrada', 'salida') NOT NULL,
    cantidad INT NOT NULL,
    motivo VARCHAR(255),
    status ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    creado_por INT,
    aprobado_por INT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion DATETIME,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    FOREIGN KEY (creado_por) REFERENCES usuario(id_usuario),
    FOREIGN KEY (aprobado_por) REFERENCES usuario(id_usuario)
);

-- ================================
-- 9. TABLA HISTORIAL PRECIOS (VACÍA)
-- ================================
CREATE TABLE historial_precios (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    precio_anterior DECIMAL(10,2),
    precio_nuevo DECIMAL(10,2),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ================================
-- 10. TRIGGER PARA HISTORIAL DE PRECIOS
-- ================================
DELIMITER //

CREATE TRIGGER after_producto_update
AFTER UPDATE ON producto
FOR EACH ROW
BEGIN
    -- Solo insertamos si el precio ha cambiado
    IF OLD.precio <> NEW.precio THEN
        INSERT INTO historial_precios (id_producto, precio_anterior, precio_nuevo, fecha_cambio)
        VALUES (OLD.id_producto, OLD.precio, NEW.precio, NOW());
    END IF;
END//

DELIMITER ;

-- Reactivar FK checks
SET FOREIGN_KEY_CHECKS = 1;