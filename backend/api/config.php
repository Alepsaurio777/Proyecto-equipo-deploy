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
$envFile = __DIR__ . '/../../.env';
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
define('DB_HOST', $_ENV['DB_HOST'] ?? '127.0.0.1');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASS', $_ENV['DB_PASS'] ?? '123');
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

// Configurar headers para CORS (permite peticiones desde cualquier origen)
function setCorsHeaders()
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    
    // Permitir cualquier origen (para desarrollo con ngrok, etc.)
    // En producción, considera restringir esto a dominios específicos
    header("Access-Control-Allow-Origin: $origin");
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json; charset=utf-8');
    
    // Manejar peticiones preflight OPTIONS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
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
