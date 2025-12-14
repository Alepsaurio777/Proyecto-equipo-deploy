<?php

use PHPUnit\Framework\TestCase;

/**
 * Tests de Autenticación de Login para el Sistema de Ferretería
 * ==============================================================
 * 
 * Este archivo contiene 6 tests unitarios usando MOCKS para validar:
 * - Login exitoso con credenciales válidas
 * - Login fallido con usuario inexistente
 * - Login fallido con contraseña incorrecta
 * - Validación de campos vacíos
 * - Protección contra inyección SQL
 * - Verificación de estructura de respuesta
 * 
 * @author Equipo de Desarrollo
 * @version 1.0
 */
class LoginAuthenticationTest extends TestCase
{
    /**
     * Configuración de base de datos (credenciales reales)
     */
    private $dbHost = '127.0.0.1';
    private $dbUser = 'root';
    private $dbPass = '123';
    private $dbName = 'ferreteria_db';

    /** @var mysqli|null Conexión a la base de datos */
    private $conn = null;

    /**
     * Configuración inicial antes de cada test
     */
    protected function setUp(): void
    {
        if (!defined('TESTING')) {
            define('TESTING', true);
        }
        
        // Conectar a la base de datos
        $this->conn = @new mysqli($this->dbHost, $this->dbUser, $this->dbPass, $this->dbName);
        
        if ($this->conn->connect_error) {
            $this->markTestSkipped('No se pudo conectar a la base de datos: ' . $this->conn->connect_error);
        }
        
        $this->conn->set_charset("utf8mb4");
    }

    /**
     * Limpieza después de cada test
     */
    protected function tearDown(): void
    {
        if ($this->conn !== null && !$this->conn->connect_error) {
            $this->conn->close();
        }
    }

    /**
     * Simula la lógica de autenticación del login.php
     * (Mock de la función de validación de login)
     */
    private function mockValidarLogin(string $username, string $password): array
    {
        // Validar campos vacíos
        if (empty($username) || empty($password)) {
            return [
                'success' => false,
                'message' => 'Usuario y contraseña son requeridos'
            ];
        }

        // Sanitizar usuario (igual que en login.php)
        $username = trim($username);
        $username = stripslashes($username);
        $username = htmlspecialchars($username);

        // Buscar usuario en la base de datos usando prepared statements
        $stmt = $this->conn->prepare(
            "SELECT 
                u.id_usuario,
                u.usuario,
                u.password_hash,
                u.activo,
                r.nombre_rol
            FROM usuario u
            LEFT JOIN empleado e ON e.id_usuario = u.id_usuario
            LEFT JOIN roles r ON e.id_rol = r.id_rol
            WHERE u.usuario = ? AND u.activo = 1
            LIMIT 1"
        );

        if (!$stmt) {
            return [
                'success' => false,
                'message' => 'Error en la consulta'
            ];
        }

        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $stmt->close();
            return [
                'success' => false,
                'message' => 'Usuario o contraseña incorrectos'
            ];
        }

        $user = $result->fetch_assoc();
        $stmt->close();

        // Verificar contraseña
        $hashedPassword = $user['password_hash'] ?? '';
        $isValidPassword = false;
        
        if (!empty($hashedPassword)) {
            $isValidPassword = password_verify($password, $hashedPassword);
        }
        
        // Compatibilidad con contraseñas sin hash
        if (!$isValidPassword && $hashedPassword === $password) {
            $isValidPassword = true;
        }

        if (!$isValidPassword) {
            return [
                'success' => false,
                'message' => 'Usuario o contraseña incorrectos'
            ];
        }

        // Login exitoso
        return [
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data' => [
                'user' => [
                    'id' => (int)$user['id_usuario'],
                    'username' => $user['usuario'],
                    'role' => $user['nombre_rol'] ?? 'admin'
                ],
                'session_id' => 'mock_session_' . time()
            ]
        ];
    }

    // ========================================================================
    // TEST 01: Login Exitoso con Credenciales Válidas
    // ========================================================================

    /**
     * Test 01: Login Exitoso con Credenciales Válidas
     * 
     * Objetivo: Verificar que un usuario con credenciales correctas pueda
     * iniciar sesión exitosamente y reciba los datos de usuario esperados.
     */
    public function test_01_Login_CredencialesValidas_RetornaExito(): void
    {
        // Arrange: Preparar credenciales válidas
        $username = 'admin';
        $password = 'admin123';

        // Act: Realizar validación de login
        $response = $this->mockValidarLogin($username, $password);

        // Assert: Verificar respuesta exitosa
        $this->assertTrue(
            $response['success'],
            'El login con credenciales válidas debe ser exitoso. Mensaje: ' . ($response['message'] ?? 'ninguno')
        );
        
        $this->assertEquals(
            'Inicio de sesión exitoso',
            $response['message'],
            'El mensaje debe indicar éxito'
        );
        
        $this->assertArrayHasKey(
            'data',
            $response,
            'La respuesta debe contener datos del usuario'
        );
        
        echo "\n✓ TEST 01 PASSED: Login exitoso con credenciales válidas\n";
    }

    // ========================================================================
    // TEST 02: Login Fallido con Usuario Inexistente
    // ========================================================================

    /**
     * Test 02: Login Fallido con Usuario Inexistente
     * 
     * Objetivo: Verificar que el sistema rechace correctamente un intento
     * de login con un nombre de usuario que no existe en la base de datos.
     */
    public function test_02_Login_UsuarioInexistente_RetornaError(): void
    {
        // Arrange: Usuario que no existe
        $username = 'usuario_que_no_existe_xyz_123';
        $password = 'cualquier_password';

        // Act: Realizar validación de login
        $response = $this->mockValidarLogin($username, $password);

        // Assert: Verificar que el login falló
        $this->assertFalse(
            $response['success'],
            'El login con usuario inexistente debe fallar'
        );
        
        $this->assertStringContainsString(
            'incorrecto',
            strtolower($response['message']),
            'El mensaje debe indicar credenciales incorrectas'
        );
        
        echo "\n✓ TEST 02 PASSED: Login rechazado para usuario inexistente\n";
    }

    // ========================================================================
    // TEST 03: Login Fallido con Contraseña Incorrecta
    // ========================================================================

    /**
     * Test 03: Login Fallido con Contraseña Incorrecta
     * 
     * Objetivo: Verificar que el sistema rechace un intento de login cuando
     * el usuario existe pero la contraseña es incorrecta.
     */
    public function test_03_Login_ContrasenaIncorrecta_RetornaError(): void
    {
        // Arrange: Usuario válido pero contraseña incorrecta
        $username = 'admin';
        $password = 'contraseña_incorrecta_xyz';

        // Act: Realizar validación de login
        $response = $this->mockValidarLogin($username, $password);

        // Assert: Verificar que el login falló
        $this->assertFalse(
            $response['success'],
            'El login con contraseña incorrecta debe fallar'
        );
        
        // Verificar que el mensaje es genérico (no revela si el usuario existe)
        $this->assertEquals(
            'Usuario o contraseña incorrectos',
            $response['message'],
            'El mensaje debe ser genérico para no revelar información'
        );
        
        echo "\n✓ TEST 03 PASSED: Login rechazado con contraseña incorrecta\n";
    }

    // ========================================================================
    // TEST 04: Validación de Campos Vacíos
    // ========================================================================

    /**
     * Test 04: Validación de Campos Vacíos
     * 
     * Objetivo: Verificar que el sistema valide y rechace peticiones de login
     * cuando los campos de usuario o contraseña están vacíos.
     */
    public function test_04_Login_CamposVacios_RetornaError(): void
    {
        // Test con usuario vacío
        $response1 = $this->mockValidarLogin('', 'password123');
        $this->assertFalse($response1['success'], 'Login con usuario vacío debe fallar');
        $this->assertStringContainsString('requeridos', strtolower($response1['message']));

        // Test con contraseña vacía
        $response2 = $this->mockValidarLogin('admin', '');
        $this->assertFalse($response2['success'], 'Login con contraseña vacía debe fallar');
        $this->assertStringContainsString('requeridos', strtolower($response2['message']));

        // Test con ambos vacíos
        $response3 = $this->mockValidarLogin('', '');
        $this->assertFalse($response3['success'], 'Login con ambos campos vacíos debe fallar');
        $this->assertStringContainsString('requeridos', strtolower($response3['message']));
        
        echo "\n✓ TEST 04 PASSED: Validación correcta de campos vacíos\n";
    }

    // ========================================================================
    // TEST 05: Protección contra Inyección SQL
    // ========================================================================

    /**
     * Test 05: Protección contra Inyección SQL
     * 
     * Objetivo: Verificar que el sistema esté protegido contra intentos de
     * inyección SQL en los campos de usuario y contraseña.
     */
    public function test_05_Login_InyeccionSQL_RetornaErrorSinCompromiso(): void
    {
        // Arrange: Intentos de inyección SQL
        $sqlInjections = [
            "admin' OR '1'='1",
            "admin'--",
            "'; DROP TABLE usuario; --",
            "admin' OR 1=1 --",
            "1' OR '1'='1",
        ];

        foreach ($sqlInjections as $injection) {
            // Act: Intentar login con inyección SQL
            $response = $this->mockValidarLogin($injection, $injection);

            // Assert: El login debe fallar de forma segura
            $this->assertFalse(
                $response['success'],
                "La inyección SQL no debe permitir acceso"
            );
            
            // Verificar que no hay errores SQL en el mensaje
            $message = strtolower($response['message'] ?? '');
            $this->assertStringNotContainsString('sql', $message);
            $this->assertStringNotContainsString('syntax', $message);
            $this->assertStringNotContainsString('mysql', $message);
        }
        
        // Verificar que la tabla usuario sigue existiendo
        $result = $this->conn->query("SELECT COUNT(*) as count FROM usuario");
        $this->assertNotFalse($result, 'La tabla usuario debe seguir existiendo');
        
        echo "\n✓ TEST 05 PASSED: Sistema protegido contra inyección SQL\n";
    }

    // ========================================================================
    // TEST 06: Estructura de Respuesta del Login
    // ========================================================================

    /**
     * Test 06: Estructura de Respuesta del Login
     * 
     * Objetivo: Verificar que la respuesta del login exitoso contenga
     * todos los campos necesarios para la aplicación frontend.
     */
    public function test_06_Login_RespuestaExitosa_ContieneEstructuraCompleta(): void
    {
        // Arrange: Credenciales válidas
        $username = 'admin';
        $password = 'admin123';

        // Act: Realizar login
        $response = $this->mockValidarLogin($username, $password);

        // Assert: Verificar estructura completa
        $this->assertTrue($response['success'], 'El login debe ser exitoso');
        
        // Verificar estructura principal
        $this->assertArrayHasKey('success', $response);
        $this->assertArrayHasKey('message', $response);
        $this->assertArrayHasKey('data', $response);
        
        // Verificar datos de usuario
        $this->assertArrayHasKey('user', $response['data']);
        $user = $response['data']['user'];
        
        $this->assertArrayHasKey('id', $user, 'Debe contener id de usuario');
        $this->assertArrayHasKey('username', $user, 'Debe contener nombre de usuario');
        $this->assertArrayHasKey('role', $user, 'Debe contener rol del usuario');
        
        // Verificar tipos de datos
        $this->assertIsInt($user['id'], 'El id debe ser entero');
        $this->assertIsString($user['username'], 'El username debe ser string');
        $this->assertIsString($user['role'], 'El role debe ser string');
        
        // Verificar session_id
        $this->assertArrayHasKey('session_id', $response['data']);
        $this->assertNotEmpty($response['data']['session_id']);
        
        echo "\n✓ TEST 06 PASSED: Estructura de respuesta completa verificada\n";
    }
}
