-- ==================== MIGRACIÓN: TABLA DE PERMISOS POR ROL ====================
-- 
-- INSTRUCCIONES:
-- 1. Ejecutar en phpMyAdmin sobre la base de datos 'ferreteria_db'
-- 2. Esto creará la tabla de permisos y asignará permisos por defecto
-- 
-- ================================================================================

USE ferreteria_db;

-- ==================== TABLA PERMISOS_ROL ====================
CREATE TABLE IF NOT EXISTS permisos_rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    permiso VARCHAR(50) NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
    UNIQUE KEY unique_rol_permiso (id_rol, permiso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== PERMISOS POR DEFECTO ====================

-- Administrador del Sistema (id_rol = 1) - Todos los permisos
INSERT INTO permisos_rol (id_rol, permiso, activo) VALUES
(1, 'products.create', 1),
(1, 'products.update', 1),
(1, 'products.delete', 1),
(1, 'products.view', 1)
ON DUPLICATE KEY UPDATE activo = VALUES(activo);

-- Supervisor de Inventario (id_rol = 2) - Todos excepto eliminar
INSERT INTO permisos_rol (id_rol, permiso, activo) VALUES
(2, 'products.create', 1),
(2, 'products.update', 1),
(2, 'products.delete', 0),
(2, 'products.view', 1)
ON DUPLICATE KEY UPDATE activo = VALUES(activo);

-- Encargado de Almacén (id_rol = 3) - Solo consultar
INSERT INTO permisos_rol (id_rol, permiso, activo) VALUES
(3, 'products.create', 0),
(3, 'products.update', 0),
(3, 'products.delete', 0),
(3, 'products.view', 1)
ON DUPLICATE KEY UPDATE activo = VALUES(activo);
