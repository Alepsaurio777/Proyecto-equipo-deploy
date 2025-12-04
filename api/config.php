<?php

/**
 * ARCHIVO DE CONFIGURACIÓN DE BASE DE DATOS
 * ==========================================
 * 
 * Configuración para InfinityFree
 */

// ==================== CORS - Para desarrollo local ====================
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==================== CREDENCIALES INFINITYFREE ====================
define('DB_HOST', 'sql100.infinityfree.com');
define('DB_USER', 'if0_40600490');
define('DB_PASS', 'mJxilY7IH0GYZ');
define('DB_NAME', 'if0_40600490_ferreteria_db');

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
