<?php
/**
 * TEST DE CONFIGURACIÓN DE EMAIL
 * ================================
 * 
 * Ejecuta este archivo para verificar que la configuración de email funciona:
 * php test-email.php tu-email@gmail.com
 */

require_once 'EmailService.php';

// Obtener email de destino desde argumentos de línea de comandos
$toEmail = $argv[1] ?? null;

if (!$toEmail) {
    echo "❌ ERROR: Debes proporcionar un email de destino\n";
    echo "Uso: php test-email.php tu-email@gmail.com\n";
    exit(1);
}

echo "==================================\n";
echo "TEST DE CONFIGURACIÓN DE EMAIL\n";
echo "==================================\n\n";

try {
    // Obtener instancia del servicio
    $emailService = EmailService::getInstance();
    
    // Mostrar configuración actual
    echo "📋 CONFIGURACIÓN ACTUAL:\n";
    $config = $emailService->getConfig();
    foreach ($config as $key => $value) {
        echo "   {$key}: {$value}\n";
    }
    echo "\n";
    
    // Preparar email de prueba
    $subject = "🔧 Test de Email - Ferretería El Tornillo";
    $htmlBody = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #2563eb;'>✅ Email de Prueba</h2>
            <p>Este es un email de prueba para verificar la configuración SMTP.</p>
            <div style='background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;'>
                <p><strong>Fecha y hora:</strong> " . date('Y-m-d H:i:s') . "</p>
                <p><strong>Sistema:</strong> Ferretería El Tornillo</p>
            </div>
            <p>Si recibes este email, la configuración funciona correctamente. 🎉</p>
        </div>
    </body>
    </html>
    ";
    
    echo "📤 ENVIANDO EMAIL DE PRUEBA...\n";
    echo "   Destinatario: {$toEmail}\n";
    echo "   Asunto: {$subject}\n\n";
    
    // Enviar email
    $result = $emailService->send($toEmail, $subject, $htmlBody);
    
    if ($result) {
        echo "✅ EMAIL ENVIADO EXITOSAMENTE\n\n";
        echo "Revisa tu bandeja de entrada (y carpeta de spam)\n";
        echo "Si no llega el email:\n";
        echo "  1. Verifica que SMTP_USERNAME y SMTP_PASSWORD son correctos en .env\n";
        echo "  2. Verifica que usas una 'Contraseña de aplicación' de Gmail\n";
        echo "  3. Revisa que tu cuenta de Gmail tiene verificación en 2 pasos activa\n";
        exit(0);
    } else {
        echo "❌ ERROR AL ENVIAR EMAIL\n\n";
        echo "Revisa los logs de errores en:\n";
        echo "  - C:\\xampp\\php\\logs\\php_error_log\n";
        echo "  - C:\\xampp\\apache\\logs\\error.log\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "❌ EXCEPCIÓN: {$e->getMessage()}\n\n";
    
    if (strpos($e->getMessage(), '.env file not found') !== false) {
        echo "El archivo .env no existe. Crea uno con:\n";
        echo "  copy .env.example .env\n";
    }
    
    exit(1);
}
