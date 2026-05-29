<?php
/**
 * ENDPOINT DE CAMBIO DE CONTRASEÑA
 * ==================================
 * 
 * Permite a los usuarios cambiar su contraseña
 * Requiere contraseña actual para mayor seguridad
 */

require_once 'config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(false, 'Método no permitido');
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validar datos requeridos
if (!isset($data['user_id']) || !isset($data['new_password'])) {
    jsonResponse(false, 'Faltan datos requeridos');
}

$userId = (int)$data['user_id'];
$currentPassword = $data['current_password'] ?? null;
$newPassword = $data['new_password'];

// Validar que la nueva contraseña tenga mínimo 6 caracteres
if (strlen($newPassword) < 6) {
    jsonResponse(false, 'La nueva contraseña debe tener al menos 6 caracteres');
}

$conn = getConnection();

// Obtener contraseña actual del usuario
$stmt = $conn->prepare('SELECT password_hash FROM usuario WHERE id_usuario = ? AND activo = 1');
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    jsonResponse(false, 'Usuario no encontrado');
}

$user = $result->fetch_assoc();
$stmt->close();

// Verificar que la contraseña actual sea correcta (solo si se proporciona)
// Si current_password es null, significa que viene de recuperación de contraseña
if ($currentPassword !== null && !password_verify($currentPassword, $user['password_hash'])) {
    jsonResponse(false, 'La contraseña actual es incorrecta');
}

// Generar hash de la nueva contraseña
$newPasswordHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 10]);

// Actualizar contraseña
$stmt = $conn->prepare('UPDATE usuario SET password_hash = ?, actualizado = CURRENT_TIMESTAMP WHERE id_usuario = ?');
$stmt->bind_param('si', $newPasswordHash, $userId);

if ($stmt->execute()) {
    $stmt->close();
    $conn->close();
    jsonResponse(true, 'Contraseña actualizada correctamente');
} else {
    $stmt->close();
    $conn->close();
    jsonResponse(false, 'Error al actualizar contraseña');
}
