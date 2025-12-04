<?php

/**
 * ARCHIVO DE CONFIGURACIÓN DE BASE DE DATOS
 * ==========================================
 * 
 * INSTRUCCIONES:
 * 1. Modifica los valores de las constantes con tus datos de conexión
 * 2. Asegúrate de tener instalado XAMPP, WAMP o similar
 * 3. Crea la base de datos '2' en phpMyAdmin
 * 4. Ejecuta el archivo 'database.sql' para crear las tablas
 */

// ==================== CARGAR VARIABLES DE ENTORNO ====================
// Cargar archivo .env
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// ==================== CONFIGURACIÓN DE CONEXIÓN ====================
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASS', $_ENV['DB_PASS'] ?? 'parra');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'ferreteria_db');

// ==================== CONEXIÓN A LA BASE DE DATOS ====================
function getConnection()
{
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        // Verificar conexión
        if ($conn->connect_error) {
            throw new Exception("Error de conexión: " . $conn->connect_error);
        }

        // Establecer charset UTF-8
        $conn->set_charset("utf8mb4");

        return $conn;
    } catch (Exception $e) {
        // En producción, no mostrar detalles del error
        error_log($e->getMessage());
        die(json_encode([
            'success' => false,
            'message' => 'Error al conectar con la base de datos'
        ]));
    }
}

// ==================== FUNCIONES DE UTILIDAD ====================

// Sanitizar entrada de usuario
function sanitizeInput($data)
{
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Configurar headers para CORS (si necesitas hacer peticiones desde otro dominio)
function setCorsHeaders()
{
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Content-Type: application/json; charset=utf-8');
}

// Respuesta JSON
function jsonResponse($success, $message = '', $data = null)
{
    header('Content-Type: application/json; charset=utf-8');
    $response = [
        'success' => $success,
        'message' => $message
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// Cuando se incluya este archivo no se debe generar ninguna salida automática
// para evitar romper la respuesta JSON de los endpoints que lo usan.
