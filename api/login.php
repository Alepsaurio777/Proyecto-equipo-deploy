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

// Sanitizar datos
$username = sanitizeInput($data['username']);
$password = sanitizeInput($data['password']);

// Conectar a la base de datos
$conn = getConnection();

// Preparar consulta para evitar inyección SQL
$stmt = $conn->prepare("SELECT id, username, password, role, full_name, email, phone, address FROM users WHERE username = ? AND active = 1");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

// Verificar si existe el usuario
if ($result->num_rows === 0) {
    jsonResponse(false, 'Usuario o contraseña incorrectos');
}

$user = $result->fetch_assoc();

// Verificar contraseña
// NOTA: En producción, usa password_hash() y password_verify()
// Por ahora verificamos contraseña en texto plano (solo para desarrollo)
if ($password !== $user['password']) {
    // Si usas password_hash en la BD, descomenta esta línea:
    // if (!password_verify($password, $user['password'])) {
    jsonResponse(false, 'Usuario o contraseña incorrectos');
}

// Iniciar sesión
session_start();
$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role'] = $user['role'];

// Registrar último acceso
$updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
$updateStmt->bind_param("i", $user['id']);
$updateStmt->execute();
$updateStmt->close();

// Respuesta exitosa
unset($user['password']); // No enviar contraseña al cliente
jsonResponse(true, 'Inicio de sesión exitoso', [
    'user' => $user,
    'session_id' => session_id()
]);

$stmt->close();
$conn->close();
?>
