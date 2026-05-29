CREATE DATABASE IF NOT EXISTS ferreteria_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE ferreteria_db;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ❗ Mantener desactivadas las FK durante TODO el setup
SET FOREIGN_KEY_CHECKS = 0;

-- ================================
-- LIMPIEZA DE TABLAS
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
-- TABLA ROLES
-- ================================
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(255) NOT NULL,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO roles (nombre_rol) VALUES
('Administrador del Sistema'),
('Supervisor de Inventario'),
('Encargado de Almacén');

-- ================================
-- TABLA USUARIO
-- ================================
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    activo TINYINT(1) DEFAULT 1,
    ultimo_acceso DATETIME,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================================
-- TABLA EMPLEADO
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

-- ================================
-- TABLA CATEGORIA
-- ================================
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE categoria AUTO_INCREMENT = 1;

INSERT INTO categoria (nombre_categoria, descripcion) VALUES
('Herramientas', 'Herramientas manuales y eléctricas'),
('Construcción', 'Materiales de construcción'),
('Electricidad', 'Material eléctrico y cableado'),
('Plomería', 'Tuberías, conexiones y accesorios'),
('Pintura', 'Pinturas, barnices y accesorios'),
('Seguridad', 'Equipo de protección personal');

-- ================================
-- TABLA PRODUCTO
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

ALTER TABLE producto AUTO_INCREMENT = 1;

INSERT INTO producto 
(codigo, nombre_producto, descripcion, precio, stock_actual, stock_minimo, stock_maximo, ubicacion, id_categoria)
VALUES
('MART-001', 'Martillo de Carpintero 16oz', 'Martillo profesional de carpintero', 299.99, 25, 10, 50, 'Pasillo A - Estante 2', 1),
('CEM-001', 'Cemento Gris 50kg', 'Cemento de alta resistencia', 189.50, 45, 20, 100, 'Almacén Principal - Zona B', 2),
('CABL-001', 'Cable Eléctrico Calibre 12', 'Cable eléctrico calibre 12 por metro', 45.00, 8, 15, 80, 'Pasillo C - Estante 1', 3),
('PINT-001', 'Pintura Vinílica Blanca 19L', 'Pintura vinílica lavable', 459.00, 22, 10, 40, 'Almacén Secundario - Zona A', 5),
('TUB-045', 'Tubería PVC 2\" (6m)', 'Tubería PVC de 2 pulgadas', 125.00, 15, 12, 60, 'Pasillo B - Estante 3', 4);

-- ================================
-- TABLA PROVEEDOR
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
-- TABLA RELACIÓN PRODUCTO - PROVEEDOR
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
-- TABLA MOVIMIENTO INVENTARIO
-- ================================
CREATE TABLE movimiento_inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida') NOT NULL,
    cantidad INT NOT NULL,
    motivo VARCHAR(255),
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ================================
-- TABLA HISTORIAL PRECIOS
-- ================================
CREATE TABLE historial_precios (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    precio_anterior DECIMAL(10,2),
    precio_nuevo DECIMAL(10,2),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- 🔥 Ahora sí habilitamos FK checks
SET FOREIGN_KEY_CHECKS = 1;
