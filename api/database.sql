-- ==================== BASE DE DATOS FERRETERÍA EL TORNILLO ====================
-- 
-- INSTRUCCIONES:
-- 1. Abre phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Crea una nueva base de datos llamada 'ferreteria_db'
-- 3. Selecciona la base de datos y ve a la pestaña 'SQL'
-- 4. Copia y pega todo este contenido y presiona 'Continuar'
-- 
-- ================================================================================

-- Crear base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS ferreteria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ferreteria_db;

-- ==================== TABLA: USUARIOS ====================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cashier', 'warehouse') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuarios de prueba
INSERT INTO users (username, password, role, full_name, email, phone) VALUES
('administrador', 'admin123', 'admin', 'Administrador del Sistema', 'admin@ferreteria.com', '555-0001'),
('supervisor', 'super123', 'cashier', 'Supervisor de Inventario', 'supervisor@ferreteria.com', '555-0002'),
('almacenista', 'almacen123', 'warehouse', 'Encargado de Almacén', 'almacen@ferreteria.com', '555-0003');

-- ==================== TABLA: PRODUCTOS ====================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category ENUM('Herramientas', 'Construcción', 'Electricidad', 'Plomería', 'Pintura', 'Seguridad') NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    max_stock INT NOT NULL DEFAULT 100,
    location VARCHAR(100),
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_category (category),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar productos de prueba
INSERT INTO products (code, name, category, description, price, stock, min_stock, max_stock, location) VALUES
('MART-001', 'Martillo de Carpintero 16oz', 'Herramientas', 'Martillo profesional de carpintero', 299.99, 25, 10, 50, 'Pasillo A - Estante 2'),
('CEM-001', 'Cemento Gris 50kg', 'Construcción', 'Cemento de alta resistencia', 189.50, 45, 20, 100, 'Almacén Principal - Zona B'),
('CABL-001', 'Cable Eléctrico Calibre 12', 'Electricidad', 'Cable eléctrico calibre 12 por metro', 45.00, 8, 15, 80, 'Pasillo C - Estante 1'),
('PINT-001', 'Pintura Vinílica Blanca 19L', 'Pintura', 'Pintura vinílica lavable', 459.00, 22, 10, 40, 'Almacén Secundario - Zona A'),
('TUB-045', 'Tubería PVC 2" (6m)', 'Plomería', 'Tubería PVC de 2 pulgadas', 125.00, 15, 12, 60, 'Pasillo B - Estante 3');

-- ==================== TABLA: TRANSACCIONES ====================
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type ENUM('entrada', 'salida') NOT NULL,
    quantity INT NOT NULL,
    reason TEXT,
    status ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    created_by INT NOT NULL,
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_product (product_id),
    INDEX idx_status (status),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar transacciones de prueba
INSERT INTO transactions (product_id, type, quantity, reason, status, created_by) VALUES
(1, 'entrada', 10, 'Reabastecimiento semanal', 'pendiente', 3),
(3, 'salida', 5, 'Pedido especial cliente #45', 'pendiente', 3);

-- ==================== TABLA: EMPLEADOS ====================
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    salary DECIMAL(10, 2),
    status ENUM('active', 'inactive') DEFAULT 'active',
    hire_date DATE,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar empleados de prueba
INSERT INTO employees (name, position, email, phone, salary, status, hire_date, address) VALUES
('Juan Pérez García', 'Gerente', 'juan.perez@ferreteria.com', '555-1234', 15000.00, 'active', '2022-01-15', 'Av. Principal 123'),
('María López Hernández', 'Cajero', 'maria.lopez@ferreteria.com', '555-5678', 8000.00, 'active', '2023-03-20', 'Calle Secundaria 456'),
('Carlos Ramírez Díaz', 'Almacenista', 'carlos.ramirez@ferreteria.com', '555-9012', 9000.00, 'active', '2023-06-10', 'Av. Central 789'),
('Ana Martínez Soto', 'Vendedor', 'ana.martinez@ferreteria.com', '555-3456', 7500.00, 'inactive', '2021-11-05', 'Col. Norte 321');

-- ==================== TABLA: CONFIGURACIÓN ====================
CREATE TABLE IF NOT EXISTS config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuración inicial
INSERT INTO config (config_key, config_value, description) VALUES
('admin_pin', '1234', 'PIN de recuperación de contraseña'),
('app_name', 'Ferretería El Tornillo', 'Nombre de la aplicación'),
('currency', 'MXN', 'Moneda del sistema');

-- ==================== VISTAS ÚTILES ====================

-- Vista de productos con stock bajo
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
    p.id,
    p.code,
    p.name,
    p.category,
    p.stock,
    p.min_stock,
    (p.min_stock - p.stock) as deficit,
    p.location
FROM products p
WHERE p.stock <= p.min_stock AND p.active = 1;

-- Vista de transacciones pendientes
CREATE OR REPLACE VIEW v_pending_transactions AS
SELECT 
    t.id,
    t.type,
    t.quantity,
    t.reason,
    t.created_at,
    p.code as product_code,
    p.name as product_name,
    u.full_name as created_by_name
FROM transactions t
INNER JOIN products p ON t.product_id = p.id
INNER JOIN users u ON t.created_by = u.id
WHERE t.status = 'pendiente'
ORDER BY t.created_at DESC;

-- ==================== TRIGGERS ====================

-- Trigger para actualizar stock al aprobar entrada
DELIMITER //
CREATE TRIGGER trg_approve_entrada 
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'aprobada' AND OLD.status = 'pendiente' AND NEW.type = 'entrada' THEN
        UPDATE products 
        SET stock = stock + NEW.quantity 
        WHERE id = NEW.product_id;
    END IF;
END//
DELIMITER ;

-- Trigger para actualizar stock al aprobar salida
DELIMITER //
CREATE TRIGGER trg_approve_salida 
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'aprobada' AND OLD.status = 'pendiente' AND NEW.type = 'salida' THEN
        UPDATE products 
        SET stock = stock - NEW.quantity 
        WHERE id = NEW.product_id;
    END IF;
END//
DELIMITER ;

-- ==================== ÍNDICES ADICIONALES PARA OPTIMIZACIÓN ====================
CREATE INDEX idx_products_stock ON products(stock, min_stock);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_users_active ON users(active);

-- ==================== FINALIZADO ====================
-- Base de datos creada exitosamente
-- Puedes verificar las tablas ejecutando: SHOW TABLES;
