<?php
/**
 * SERVICIO DE ENVÍO DE EMAILS
 * ============================
 * 
 * Maneja el envío de emails usando PHPMailer y configuración desde .env
 * Soporta múltiples proveedores SMTP (Gmail, SendGrid, Brevo, Mailgun, etc.)
 */

// Cargar autoloader de Composer
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private static $instance = null;
    private $mailer;
    private $config;
    
    private function __construct()
    {
        // Cargar variables de entorno desde .env
        $this->loadEnv();
        
        // Configurar PHPMailer
        $this->mailer = new PHPMailer(true);
        $this->configureMailer();
    }
    
    /**
     * Singleton: obtener instancia única
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Cargar variables del archivo .env
     */
    private function loadEnv(): void
    {
        $envPath = __DIR__ . '/../.env';
        
        if (!file_exists($envPath)) {
            throw new Exception('.env file not found. Copy .env.example to .env and configure it.');
        }
        
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            // Ignorar comentarios
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            
            // Parsear línea KEY=VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remover comillas si existen
                $value = trim($value, '"\'');
                
                $this->config[$key] = $value;
            }
        }
    }
    
    /**
     * Configurar PHPMailer con valores del .env
     */
    private function configureMailer(): void
    {
        try {
            // Configuración del servidor SMTP
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['SMTP_HOST'] ?? 'smtp.gmail.com';
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['SMTP_USERNAME'] ?? '';
            $this->mailer->Password = $this->config['SMTP_PASSWORD'] ?? '';
            
            // Puerto y encriptación
            $port = (int)($this->config['SMTP_PORT'] ?? 587);
            $this->mailer->Port = $port;
            
            $secure = strtolower($this->config['SMTP_SECURE'] ?? 'tls');
            if ($secure === 'ssl') {
                $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            }
            
            // Configuración del remitente
            $fromAddress = $this->config['MAIL_FROM_ADDRESS'] ?? 'noreply@example.com';
            $fromName = $this->config['MAIL_FROM_NAME'] ?? 'Sistema';
            $this->mailer->setFrom($fromAddress, $fromName);
            
            // Configuración adicional
            $this->mailer->CharSet = 'UTF-8';
            $this->mailer->isHTML(true);
            
            // Debug (solo en desarrollo)
            // $this->mailer->SMTPDebug = SMTP::DEBUG_SERVER;
            
        } catch (Exception $e) {
            throw new Exception("Error al configurar email: {$e->getMessage()}");
        }
    }
    
    /**
     * Enviar email
     * 
     * @param string $to Email del destinatario
     * @param string $subject Asunto del email
     * @param string $htmlBody Cuerpo del email en HTML
     * @param string $toName Nombre del destinatario (opcional)
     * @return bool True si se envió correctamente
     */
    public function send(string $to, string $subject, string $htmlBody, string $toName = ''): bool
    {
        try {
            // Limpiar destinatarios previos
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            
            // Configurar destinatario
            $this->mailer->addAddress($to, $toName);
            
            // Configurar contenido
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $htmlBody;
            
            // Versión texto plano (fallback)
            $this->mailer->AltBody = strip_tags($htmlBody);
            
            // Enviar
            return $this->mailer->send();
            
        } catch (Exception $e) {
            error_log("Error al enviar email: {$this->mailer->ErrorInfo}");
            return false;
        }
    }
    
    /**
     * Obtener información de configuración (para debugging)
     */
    public function getConfig(): array
    {
        return [
            'provider' => $this->config['MAIL_PROVIDER'] ?? 'unknown',
            'host' => $this->config['SMTP_HOST'] ?? 'not set',
            'port' => $this->config['SMTP_PORT'] ?? 'not set',
            'username' => $this->config['SMTP_USERNAME'] ?? 'not set',
            'from' => $this->config['MAIL_FROM_ADDRESS'] ?? 'not set',
        ];
    }
}

/**
 * FUNCIÓN HELPER GLOBAL
 * ======================
 * Simplifica el envío de emails desde cualquier parte del código
 */
function sendEmail(string $to, string $subject, string $htmlBody, string $toName = ''): bool
{
    try {
        $emailService = EmailService::getInstance();
        return $emailService->send($to, $subject, $htmlBody, $toName);
    } catch (Exception $e) {
        error_log("sendEmail error: {$e->getMessage()}");
        return false;
    }
}
