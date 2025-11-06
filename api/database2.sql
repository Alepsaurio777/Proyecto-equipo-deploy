-- ==================== BASE DE DATOS FERRETERÍA - VERSIÓN COMPLETA ====================
-- 
-- INSTRUCCIONES:
-- 1. Abre phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Crea una nueva base de datos llamada 'ferreteria_db'
-- 3. Selecciona la base de datos y ve a la pestaña 'SQL'
-- 4. Copia y pega todo este contenido y presiona 'Continuar'
-- 
-- ================================================================================

CREATE DATABASE IF NOT EXISTS ferreteria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ferreteria_db;

-- ==================== TABLA ROLES ====================
CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(255) NOT NULL,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (nombre_rol) VALUES
('Administrador del Sistema'),
('Supervisor de Inventario'),
('Encargado de Almacén');

-- ==================== TABLA USUARIO ====================
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    activo TINYINT(1) DEFAULT 1,
    ultimo_acceso DATETIME,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuario_activo(activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA EMPLEADO ====================
CREATE TABLE IF NOT EXISTS empleado (
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
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    INDEX idx_empleado_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA CATEGORIA ====================
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categoria (nombre_categoria, descripcion) VALUES
('Herramientas', 'Herramientas manuales y eléctricas'),
('Construcción', 'Materiales de construcción'),
('Electricidad', 'Material eléctrico y cableado'),
('Plomería', 'Tuberías, conexiones y accesorios'),
('Pintura', 'Pinturas, barnices y accesorios'),
('Seguridad', 'Equipo de protección personal');

-- ==================== TABLA PRODUCTO ====================
CREATE TABLE IF NOT EXISTS producto (
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
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    INDEX idx_codigo(codigo),
    INDEX idx_nombre(nombre_producto),
    INDEX idx_producto_categoria(id_categoria),
    INDEX idx_producto_stock(stock_actual, stock_minimo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar productos de prueba
INSERT INTO producto (codigo, nombre_producto, descripcion, precio, stock_actual, stock_minimo, stock_maximo, ubicacion, id_categoria) VALUES
('MART-001', 'Martillo de Carpintero 16oz', 'Martillo profesional de carpintero', 299.99, 25, 10, 50, 'Pasillo A - Estante 2', 1),
('CEM-001', 'Cemento Gris 50kg', 'Cemento de alta resistencia', 189.50, 45, 20, 100, 'Almacén Principal - Zona B', 2),
('CABL-001', 'Cable Eléctrico Calibre 12', 'Cable eléctrico calibre 12 por metro', 45.00, 8, 15, 80, 'Pasillo C - Estante 1', 3),
('PINT-001', 'Pintura Vinílica Blanca 19L', 'Pintura vinílica lavable', 459.00, 22, 10, 40, 'Almacén Secundario - Zona A', 5),
('TUB-045', 'Tubería PVC 2" (6m)', 'Tubería PVC de 2 pulgadas', 125.00, 15, 12, 60, 'Pasillo B - Estante 3', 4);

-- ==================== TABLA PROVEEDORES ====================
CREATE TABLE IF NOT EXISTS proveedor (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre_proveedor VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    activo TINYINT(1) DEFAULT 1,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_proveedor_nombre(nombre_proveedor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA PRODUCTO_PROVEEDOR ====================
CREATE TABLE IF NOT EXISTS producto_proveedor (
    id_producto_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    id_proveedor INT NOT NULL,
    precio_compra DECIMAL(10,2),
    tiempo_entrega VARCHAR(100),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA MOVIMIENTO_INVENTARIO (CON SISTEMA DE APROBACIÓN) ====================
CREATE TABLE IF NOT EXISTS movimiento_inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    id_empleado INT NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida') NOT NULL,
    cantidad INT NOT NULL,
    motivo TEXT,
    status ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    creado_por INT NOT NULL,
    aprobado_por INT,
    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion DATETIME,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    FOREIGN KEY (creado_por) REFERENCES usuario(id_usuario),
    FOREIGN KEY (aprobado_por) REFERENCES usuario(id_usuario),
    INDEX idx_movimiento_fecha(fecha_movimiento),
    INDEX idx_movimiento_status(status),
    INDEX idx_movimiento_tipo(tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA HISTORIAL_PRECIOS ====================
CREATE TABLE IF NOT EXISTS historial_precios (
    id_historial_precio INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    precio_anterior DECIMAL(10,2) NOT NULL,
    precio_nuevo DECIMAL(10,2) NOT NULL,
    id_usuario INT NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    INDEX idx_historial_fecha(fecha_cambio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== VISTAS ====================

-- Vista: Productos con stock bajo
CREATE OR REPLACE VIEW v_stock_bajo AS
SELECT 
    p.id_producto,
    p.codigo,
    p.nombre_producto,
    p.stock_actual,
    p.stock_minimo,
    (p.stock_minimo - p.stock_actual) AS deficit,
    p.ubicacion,
    c.nombre_categoria
FROM producto p
INNER JOIN categoria c ON p.id_categoria = c.id_categoria
WHERE p.stock_actual <= p.stock_minimo AND p.activo = 1;

-- Vista: Movimientos de inventario recientes
CREATE OR REPLACE VIEW v_movimientos_inventario AS
SELECT
    m.id_movimiento,
    m.tipo_movimiento,
    m.cantidad,
    m.motivo,
    m.status,
    m.fecha_movimiento,
    e.nombre_completo AS empleado,
    p.nombre_producto AS producto,
    p.codigo AS codigo_producto,
    u.usuario AS creado_por_usuario
FROM movimiento_inventario m
INNER JOIN empleado e ON m.id_empleado = e.id_empleado
INNER JOIN producto p ON m.id_producto = p.id_producto
INNER JOIN usuario u ON m.creado_por = u.id_usuario
ORDER BY m.fecha_movimiento DESC;

-- Vista: Transacciones pendientes de aprobación
CREATE OR REPLACE VIEW v_movimientos_pendientes AS
SELECT 
    m.id_movimiento,
    m.tipo_movimiento,
    m.cantidad,
    m.motivo,
    m.fecha_movimiento,
    p.codigo AS codigo_producto,
    p.nombre_producto,
    u.usuario AS creado_por,
    e.nombre_completo AS empleado_responsable
FROM movimiento_inventario m
INNER JOIN producto p ON m.id_producto = p.id_producto
INNER JOIN usuario u ON m.creado_por = u.id_usuario
INNER JOIN empleado e ON m.id_empleado = e.id_empleado
WHERE m.status = 'pendiente'
ORDER BY m.fecha_movimiento DESC;

-- Vista: Historial de cambios de precios
CREATE OR REPLACE VIEW v_historial_precios AS
SELECT 
    hp.id_historial_precio,
    p.codigo,
    p.nombre_producto,
    hp.precio_anterior,
    hp.precio_nuevo,
    (hp.precio_nuevo - hp.precio_anterior) AS diferencia,
    ROUND(((hp.precio_nuevo - hp.precio_anterior) / hp.precio_anterior * 100), 2) AS porcentaje_cambio,
    u.usuario AS modificado_por,
    hp.fecha_cambio
FROM historial_precios hp
INNER JOIN producto p ON hp.id_producto = p.id_producto
INNER JOIN usuario u ON hp.id_usuario = u.id_usuario
ORDER BY hp.fecha_cambio DESC;

-- ==================== TRIGGERS ====================

DELIMITER //

-- Trigger: Actualizar stock al APROBAR movimiento de tipo 'entrada'
CREATE TRIGGER trg_aprobar_entrada
AFTER UPDATE ON movimiento_inventario
FOR EACH ROW
BEGIN
    IF NEW.status = 'aprobada' AND OLD.status = 'pendiente' AND NEW.tipo_movimiento = 'entrada' THEN
        UPDATE producto 
        SET stock_actual = stock_actual + NEW.cantidad,
            actualizado = CURRENT_TIMESTAMP
        WHERE id_producto = NEW.id_producto;
    END IF;
END//

-- Trigger: Actualizar stock al APROBAR movimiento de tipo 'salida'
CREATE TRIGGER trg_aprobar_salida
AFTER UPDATE ON movimiento_inventario
FOR EACH ROW
BEGIN
    IF NEW.status = 'aprobada' AND OLD.status = 'pendiente' AND NEW.tipo_movimiento = 'salida' THEN
        UPDATE producto 
        SET stock_actual = stock_actual - NEW.cantidad,
            actualizado = CURRENT_TIMESTAMP
        WHERE id_producto = NEW.id_producto;
    END IF;
END//

-- Trigger: Registrar cambios de precio en historial
CREATE TRIGGER trg_historial_precios
AFTER UPDATE ON producto
FOR EACH ROW
BEGIN
    IF NEW.precio != OLD.precio THEN
        INSERT INTO historial_precios (id_producto, precio_anterior, precio_nuevo, id_usuario)
        VALUES (NEW.id_producto, OLD.precio, NEW.precio, 1);
    END IF;
END//

-- Trigger: Registrar fecha de aprobación
CREATE TRIGGER trg_fecha_aprobacion
BEFORE UPDATE ON movimiento_inventario
FOR EACH ROW
BEGIN
    IF NEW.status IN ('aprobada', 'rechazada') AND OLD.status = 'pendiente' THEN
        SET NEW.fecha_aprobacion = CURRENT_TIMESTAMP;
    END IF;
END//

DELIMITER ;

-- ==================== PROCEDIMIENTOS ALMACENADOS ====================

DELIMITER //

-- Procedimiento: Aprobar movimiento de inventario
CREATE PROCEDURE sp_aprobar_movimiento(
    IN p_id_movimiento INT,
    IN p_id_usuario_aprueba INT,
    IN p_aprobar BOOLEAN
)
BEGIN
    DECLARE v_status ENUM('pendiente', 'aprobada', 'rechazada');
    
    IF p_aprobar THEN
        SET v_status = 'aprobada';
    ELSE
        SET v_status = 'rechazada';
    END IF;
    
    UPDATE movimiento_inventario
    SET status = v_status,
        aprobado_por = p_id_usuario_aprueba
    WHERE id_movimiento = p_id_movimiento
    AND status = 'pendiente';
    
    SELECT ROW_COUNT() AS registros_afectados;
END//

-- Procedimiento: Obtener productos con stock crítico
CREATE PROCEDURE sp_productos_stock_critico()
BEGIN
    SELECT 
        p.id_producto,
        p.codigo,
        p.nombre_producto,
        p.stock_actual,
        p.stock_minimo,
        c.nombre_categoria,
        p.ubicacion
    FROM producto p
    INNER JOIN categoria c ON p.id_categoria = c.id_categoria
    WHERE p.stock_actual <= p.stock_minimo
    AND p.activo = 1
    ORDER BY (p.stock_minimo - p.stock_actual) DESC;
END//

DELIMITER ;

-- ==================== DATOS DE PRUEBA ====================

-- Insertar usuarios de prueba
INSERT INTO usuario (usuario, password_hash, email, telefono) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@ferreteria.com', '555-0001'),
('supervisor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'supervisor@ferreteria.com', '555-0002'),
('almacenista', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'almacen@ferreteria.com', '555-0003');

-- Insertar empleados de prueba
INSERT INTO empleado (nombre_completo, id_usuario, id_rol, salario, fecha_contratacion, direccion) VALUES
('Administrador del Sistema', 1, 1, 15000.00, '2022-01-15', 'Av. Principal 123'),
('Supervisor de Inventario', 2, 2, 12000.00, '2023-03-20', 'Calle Secundaria 456'),
('Encargado de Almacén', 3, 3, 9000.00, '2023-06-10', 'Av. Central 789');

-- Nota: Los movimientos de inventario se crean desde la aplicación web.
-- No insertar datos de prueba para evitar notificaciones hardcodeadas.
-- Si necesitas datos de prueba, descomenta las siguientes líneas:
/*
INSERT INTO movimiento_inventario (id_producto, id_empleado, tipo_movimiento, cantidad, motivo, status, creado_por) VALUES
(1, 1, 'entrada', 10, 'Reabastecimiento semanal', 'aprobada', 1),
(3, 1, 'salida', 5, 'Pedido especial cliente #45', 'aprobada', 1);
*/

