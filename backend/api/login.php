<?php
/**
 * ENDPOINT DE AUTENTICACIÓN
 * ==========================
 * 
 * Este archivo maneja el inicio de sesión de usuarios
 * 
 * INSTRUCCIONES DE USO:
 * 1. Sube este archivo a tu servidor local (htdocs en XAMPP)
 * 2. Modifica el archivo /js/auth.js para que use este endpoint
 * 3. Asegúrate de que la base de datos esté configurada correctamente
 */

// Incluir archivo de configuración
require_once 'config.php';

// Configurar headers
setCorsHeaders();

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método no permitido');
}

// Obtener datos JSON del body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validar que se recibieron los datos
if (!isset($data['username']) || !isset($data['password'])) {
    jsonResponse(false, 'Usuario y contraseña son requeridos');
}

// Sanitizar datos (solo usuario); la contraseña se maneja tal cual para permitir símbolos
$username = sanitizeInput($data['username']);
$password = $data['password'];

// Conectar a la base de datos
$conn = getConnection();

// Preparar consulta para evitar inyección SQL y ajustarse al nuevo esquema (database2.sql)
$stmt = $conn->prepare(
    "SELECT 
        u.id_usuario,
        u.usuario,
        u.password_hash,
        u.email,
        u.telefono,
        u.activo,
        e.id_empleado,
        e.id_rol,
        e.nombre_completo,
        e.direccion,
        e.status AS empleado_status,
        r.nombre_rol
    FROM usuario u
    LEFT JOIN empleado e ON e.id_usuario = u.id_usuario
    LEFT JOIN roles r ON e.id_rol = r.id_rol
    WHERE u.usuario = ? AND u.activo = 1
    LIMIT 1"
);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    jsonResponse(false, 'Usuario o contraseña incorrectos');
}

$user = $result->fetch_assoc();
$stmt->close();

// Verificar contraseña (compatibilidad con hash y contraseñas sin hash)
$hashedPassword = $user['password_hash'] ?? '';
$isValidPassword = false;
if (!empty($hashedPassword)) {
    $isValidPassword = password_verify($password, $hashedPassword);
}

if (!$isValidPassword && $hashedPassword === $password) {
    $isValidPassword = true;
}

if (!$isValidPassword) {
    jsonResponse(false, 'Usuario o contraseña incorrectos');
}

// Iniciar sesión PHP
session_start();
$_SESSION['user_id'] = (int)$user['id_usuario'];
$_SESSION['username'] = $user['usuario'];
$_SESSION['role'] = $user['nombre_rol'] ?? '';

// Registrar último acceso
$updateStmt = $conn->prepare("UPDATE usuario SET ultimo_acceso = NOW() WHERE id_usuario = ?");
$updateStmt->bind_param("i", $user['id_usuario']);
$updateStmt->execute();
$updateStmt->close();

// Mapear el nombre del rol a los slugs utilizados en el frontend
$roleName = $user['nombre_rol'] ?? '';
$roleSlugMap = [
    'administrador del sistema' => 'admin',
    'supervisor de inventario' => 'cashier',
    'encargado de almacén' => 'warehouse',
    'cajero' => 'cashier',
    'vendedor' => 'warehouse'
];
$roleSlug = 'admin';
if (!empty($roleName)) {
    $roleKey = mb_strtolower(trim($roleName));
    if (isset($roleSlugMap[$roleKey])) {
        $roleSlug = $roleSlugMap[$roleKey];
    } else {
        $roleSlug = preg_replace('/[^a-z]/', '', strtolower(substr($roleKey, 0, 10))) ?: 'warehouse';
    }
}

$userData = [
    'id' => (int)$user['id_usuario'],
    'username' => $user['usuario'],
    'role' => $roleSlug,
    'role_id' => isset($user['id_rol']) ? (int)$user['id_rol'] : null,
    'role_name' => $roleName ?: 'Sin Rol',
    'full_name' => $user['nombre_completo'] ?? $user['usuario'],
    'email' => $user['email'] ?? '',
    'phone' => $user['telefono'] ?? '',
    'address' => $user['direccion'] ?? '',
    'employee_id' => isset($user['id_empleado']) ? (int)$user['id_empleado'] : null
];

$conn->close();

jsonResponse(true, 'Inicio de sesión exitoso', [
    'user' => $userData,
    'session_id' => session_id()
]);
?>
