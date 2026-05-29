<?php
/**
 * ENDPOINT DE RECUPERACIÓN DE CONTRASEÑA VÍA EMAIL
 * =================================================
 * 
 * Genera y envía códigos de verificación por correo electrónico
 * 
 * MÉTODOS SOPORTADOS:
 * - POST /send-code    : Enviar código de verificación al email del usuario
 * - POST /verify-code  : Verificar código de verificación
 */

require_once 'config.php';
require_once 'EmailService.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    if ($action === 'send-code') {
        handleSendCode();
    } elseif ($action === 'verify-code') {
        handleVerifyCode();
    } else {
        jsonResponse(false, 'Acción no válida');
    }
} else {
    jsonResponse(false, 'Método no soportado');
}

/**
 * Enviar código de verificación por email
 */
function handleSendCode(): void
{
    $conn = getConnection();
    $payload = json_decode(file_get_contents('php://input'), true);
    
    if (empty($payload['username'])) {
        jsonResponse(false, 'Nombre de usuario requerido');
    }
    
    $username = sanitizeInput($payload['username']);
    
    // Obtener información del usuario
    $stmt = $conn->prepare('
        SELECT u.id_usuario, u.email, e.nombre_completo 
        FROM usuario u
        LEFT JOIN empleado e ON e.id_usuario = u.id_usuario
        WHERE u.usuario = ? AND u.activo = 1
    ');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    
    if (!$user) {
        $conn->close();
        jsonResponse(false, 'Usuario no encontrado');
    }
    
    if (empty($user['email'])) {
        $conn->close();
        jsonResponse(false, 'Este usuario no tiene un email registrado. Contacta al administrador.');
    }
    
    // Generar código de 6 dígitos
    $code = sprintf('%06d', mt_rand(0, 999999));
    
    // Guardar código en BD con expiración de 10 minutos
    $expiration = date('Y-m-d H:i:s', time() + 600); // 10 minutos (600 segundos)
    
    // Crear tabla si no existe
    $conn->query('
        CREATE TABLE IF NOT EXISTS password_reset_codes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            code VARCHAR(10) NOT NULL,
            expires_at DATETIME NOT NULL,
            used TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES usuario(id_usuario),
            INDEX idx_code_user(code, user_id),
            INDEX idx_expires(expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ');
    
    // Invalidar códigos anteriores del usuario
    $stmt = $conn->prepare('UPDATE password_reset_codes SET used = 1 WHERE user_id = ? AND used = 0');
    $stmt->bind_param('i', $user['id_usuario']);
    $stmt->execute();
    $stmt->close();
    
    // Insertar nuevo código
    $stmt = $conn->prepare('INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES (?, ?, ?)');
    $stmt->bind_param('iss', $user['id_usuario'], $code, $expiration);
    $stmt->execute();
    $stmt->close();
    
    // Enviar email (intentar, pero no fallar si no se puede)
    $emailSent = sendVerificationEmail($user['email'], $user['nombre_completo'] ?? $username, $code);
    
    $conn->close();
    
    // MODO DESARROLLO: Incluir código en la respuesta para testing
    // EN PRODUCCIÓN: Comentar o eliminar la línea "debug_code"
    $responseData = [
        'email_hint' => maskEmail($user['email']),
        'debug_code' => $code, // ⚠️ SOLO PARA DESARROLLO - Eliminar en producción
        'email_sent' => $emailSent,
        'expires_in_minutes' => 10
    ];
    
    jsonResponse(true, 'Código de verificación generado', $responseData);
}

/**
 * Verificar código de verificación
 */
function handleVerifyCode(): void
{
    $conn = getConnection();
    $payload = json_decode(file_get_contents('php://input'), true);
    
    if (empty($payload['username']) || empty($payload['code'])) {
        jsonResponse(false, 'Usuario y código requeridos');
    }
    
    $username = sanitizeInput($payload['username']);
    $code = sanitizeInput($payload['code']);
    
    // Buscar usuario y código válido
    $stmt = $conn->prepare('
        SELECT prc.id, prc.user_id, u.email
        FROM password_reset_codes prc
        JOIN usuario u ON u.id_usuario = prc.user_id
        WHERE u.usuario = ? 
        AND prc.code = ? 
        AND prc.used = 0 
        AND prc.expires_at > NOW()
        LIMIT 1
    ');
    $stmt->bind_param('ss', $username, $code);
    $stmt->execute();
    $result = $stmt->get_result();
    $resetCode = $result->fetch_assoc();
    $stmt->close();
    
    if (!$resetCode) {
        $conn->close();
        jsonResponse(false, 'Código inválido o expirado');
    }
    
    // Marcar código como usado
    $stmt = $conn->prepare('UPDATE password_reset_codes SET used = 1 WHERE id = ?');
    $stmt->bind_param('i', $resetCode['id']);
    $stmt->execute();
    $stmt->close();
    
    $conn->close();
    
    jsonResponse(true, 'Código verificado correctamente', [
        'user_id' => $resetCode['user_id'],
        'verified' => true
    ]);
}

/**
 * Enviar email con código de verificación
 */
function sendVerificationEmail(string $email, string $name, string $code): bool
{
    $subject = 'Código de Recuperación - Ferretería El Tornillo';
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .code-box { background: white; border: 2px solid #2563eb; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🔐 Recuperación de Contraseña</h1>
            </div>
            <div class='content'>
                <p>Hola <strong>{$name}</strong>,</p>
                <p>Recibimos una solicitud para recuperar tu contraseña en el Sistema de Gestión de Ferretería El Tornillo.</p>
                <p>Tu código de verificación es:</p>
                <div class='code-box'>{$code}</div>
                <div class='warning'>
                    <strong>⚠️ Importante:</strong>
                    <ul style='margin: 10px 0; padding-left: 20px;'>
                        <li>Este código expira en <strong>10 minutos</strong></li>
                        <li>Solo puede usarse una vez</li>
                        <li>Si no solicitaste este código, ignora este email</li>
                        <li>Nunca compartas este código con nadie</li>
                    </ul>
                </div>
                <p>Si tienes problemas, contacta al administrador del sistema.</p>
            </div>
            <div class='footer'>
                <p>Este es un email automático, por favor no respondas.</p>
                <p>&copy; " . date('Y') . " Ferretería El Tornillo - Sistema de Gestión de Inventario</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Enviar email usando EmailService con configuración del .env
    return sendEmail($email, $subject, $message);
}

/**
 * Enmascarar email para privacidad
 */
function maskEmail(string $email): string
{
    $parts = explode('@', $email);
    if (count($parts) !== 2) {
        return '***@***';
    }
    
    $name = $parts[0];
    $domain = $parts[1];
    
    if (strlen($name) <= 3) {
        $maskedName = substr($name, 0, 1) . '**';
    } else {
        $maskedName = substr($name, 0, 2) . str_repeat('*', strlen($name) - 3) . substr($name, -1);
    }
    
    return $maskedName . '@' . $domain;
}
