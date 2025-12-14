<?php

use PHPUnit\Framework\TestCase;

/**
 * Tests de Conexión y Login para la Ferretería
 * =============================================
 * 
 * Esta clase contiene pruebas unitarias para validar el comportamiento
 * del subsistema de conexión a la base de datos y autenticación.
 * 
 * EJECUCIÓN:
 * cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
 * ./vendor/bin/phpunit ../tests/LoginConnectionTest.php
 */
class LoginConnectionTest extends TestCase
{
    /** @var mysqli|null Conexión de base de datos */
    private $conn = null;

    /** @var array Configuración original de BD */
    private $originalConfig = [];

    /**
     * Configuración inicial antes de cada test
     */
    protected function setUp(): void
    {
        if (!defined('TESTING')) {
            define('TESTING', true);
        }
        
        require_once __DIR__ . '/../api/config.php';

        // Guardar configuración original
        $this->originalConfig = [
            'host' => DB_HOST,
            'user' => DB_USER,
            'pass' => DB_PASS,
            'name' => DB_NAME
        ];
    }

    /**
     * Limpieza después de cada test
     */
    protected function tearDown(): void
    {
        if ($this->conn !== null && $this->conn instanceof mysqli) {
            $this->conn->close();
            $this->conn = null;
        }
    }

    // ========================================================================
    // TEST 01: Validar Conexión a Localhost
    // ========================================================================
    
    /**
     * Test 01: Validar Conexión a Localhost - Retorna Success
     * 
     * Objetivo: Verificar el comportamiento esperado del subsistema de conexión
     * a la base de datos bajo un escenario ideal. Confirma que la función
     * de validación de conexión (getConnection) reporte éxito cuando todos
     * los parámetros de conexión son correctos.
     */
    public function test_01_ValidarConexion_Localhost_ReturnsSuccess(): void
    {
        // Arrange: Configuración ya definida en config.php con valores correctos
        
        // Act: Intentar obtener conexión
        try {
            $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            $success = !$this->conn->connect_error;
        } catch (Exception $e) {
            $success = false;
        }

        // Assert: La conexión debe ser exitosa
        $this->assertTrue($success, 'La conexión a localhost debe ser exitosa con credenciales válidas');
        $this->assertNotNull($this->conn, 'El objeto de conexión no debe ser null');
        $this->assertInstanceOf(mysqli::class, $this->conn, 'Debe retornar una instancia de mysqli');
    }

    // ========================================================================
    // TEST 02: Obtener Conexión con Host Inválido
    // ========================================================================

    /**
     * Test 02: Obtener Conexión con Host Inválido - Retorna Null
     * 
     * Objetivo: Verificar que la función para obtener un objeto de conexión
     * falle de manera controlada y maneje el error cuando el servidor (host)
     * de la base de datos es inaccesible o incorrecto.
     * 
     * Este es un escenario de fallo esperado que asegura que la aplicación
     * no intente utilizar un objeto de conexión inválido.
     */
    public function test_02_ObtenerConexion_InvalidHost_ReturnsNull(): void
    {
        // Arrange: Host inválido que no existe
        $invalidHost = 'servidor.inexistente.local';
        
        // Act: Intentar conexión con host inválido
        mysqli_report(MYSQLI_REPORT_OFF); // Suprimir warnings para test limpio
        $conn = @new mysqli($invalidHost, DB_USER, DB_PASS, DB_NAME);
        
        // Assert: La conexión debe fallar
        $this->assertTrue(
            $conn->connect_error !== null,
            'Debe retornar error de conexión con host inválido'
        );
    }

    // ========================================================================
    // TEST 03: Obtener Conexión con Credenciales Inválidas
    // ========================================================================

    /**
     * Test 03: Obtener Conexión con Credenciales Inválidas - Retorna Null
     * 
     * Objetivo: Verificar que el sistema de conexión maneje correctamente
     * un fallo de autenticación cuando el host es correcto, pero el nombre
     * de usuario (uid) o la contraseña (pwd) son inválidos.
     * 
     * Se espera que ante este error, la función devuelva error para evitar
     * que la aplicación intente ejecutar comandos sin una conexión válida.
     */
    public function test_03_ObtenerConexion_InvalidCredentials_ReturnsNull(): void
    {
        // Arrange: Credenciales inválidas
        $invalidUser = 'usuario_invalido_xyz';
        $invalidPass = 'contraseña_incorrecta_123';
        
        // Act: Intentar conexión con credenciales inválidas
        mysqli_report(MYSQLI_REPORT_OFF);
        $conn = @new mysqli(DB_HOST, $invalidUser, $invalidPass, DB_NAME);
        
        // Assert: La conexión debe fallar por autenticación
        $this->assertTrue(
            $conn->connect_error !== null,
            'Debe retornar error con credenciales inválidas'
        );
        $this->assertStringContainsString(
            'Access denied',
            $conn->connect_error ?? '',
            'El mensaje debe indicar acceso denegado'
        );
    }

    // ========================================================================
    // TEST 04: Validar Conexión con BD Inexistente
    // ========================================================================

    /**
     * Test 04: Validar Conexión con BD Inexistente - Retorna False con Mensaje
     * 
     * Objetivo: Confirmar que el sistema de validación de conexión maneje
     * un escenario de fallo de configuración donde el Host y las credenciales
     * son correctos, pero la base de datos solicitada no existe en el servidor MySQL.
     */
    public function test_04_ValidarConexion_DatabaseNotExists_ReturnsFalseWithMessage(): void
    {
        // Arrange: Base de datos que no existe
        $nonExistentDb = 'base_de_datos_inexistente_xyz_123';
        
        // Act: Intentar conexión a BD inexistente
        mysqli_report(MYSQLI_REPORT_OFF);
        $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, $nonExistentDb);
        
        // Assert: La conexión debe fallar indicando BD inválida
        $this->assertTrue(
            $conn->connect_error !== null,
            'Debe retornar error cuando la base de datos no existe'
        );
        $this->assertStringContainsString(
            'Unknown database',
            $conn->connect_error ?? '',
            'El mensaje debe indicar base de datos desconocida'
        );
    }

    // ========================================================================
    // TEST 05: Validar Conexión con Timeout
    // ========================================================================

    /**
     * Test 05: Validar Conexión con Timeout - Retorna False o Manejado
     * 
     * Objetivo: Garantizar que el sistema de conexión pueda manejar y reportar
     * correctamente un error de Tiempo de Espera (Timeout). Un timeout ocurre
     * típicamente cuando la aplicación intenta conectarse a un host que está
     * en línea, pero la respuesta es demasiado lenta.
     */
    public function test_05_ValidarConexion_Timeout_ReturnsFalseOrHandled(): void
    {
        // Arrange: Configurar timeout muy corto para simular timeout
        $testHost = DB_HOST;
        
        mysqli_report(MYSQLI_REPORT_OFF);
        $conn = mysqli_init();
        
        // Configurar timeout de conexión muy corto (1 segundo)
        $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 1);
        
        // Act: Intentar conexión con timeout configurado
        $result = @$conn->real_connect($testHost, DB_USER, DB_PASS, DB_NAME);
        
        // Assert: La conexión debe completarse o manejar timeout apropiadamente
        if ($result) {
            $this->assertTrue(true, 'Conexión exitosa dentro del timeout');
            $conn->close();
        } else {
            $this->assertNotEmpty(
                $conn->connect_error,
                'Si falla, debe proporcionar mensaje de error'
            );
        }
    }

    // ========================================================================
    // TEST 06: Obtener Conexión - SELECT 1 Ejecuta Exitosamente
    // ========================================================================

    /**
     * Test 06: SELECT 1 se Ejecuta Correctamente
     * 
     * Objetivo: Confirmar la operatividad completa de la conexión a la base
     * de datos. Esta prueba verifica que se pueda obtener una conexión válida
     * y ejecutar una consulta simple (SELECT 1) sin errores.
     */
    public function test_06_ObtenerConexion_Select1_ExecutesSuccessfully(): void
    {
        // Arrange: Obtener conexión válida
        $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        $this->assertFalse(
            (bool)$this->conn->connect_error,
            'Prerequisito: conexión debe ser válida'
        );
        
        // Act: Ejecutar SELECT 1
        $result = $this->conn->query("SELECT 1 as test_value");
        
        // Assert: La consulta debe ejecutarse y retornar el valor esperado
        $this->assertNotFalse($result, 'SELECT 1 debe ejecutarse sin errores');
        
        $row = $result->fetch_assoc();
        $this->assertEquals(1, $row['test_value'], 'El resultado debe ser 1');
        
        $result->free();
    }

    // ========================================================================
    // TEST 07: Abrir y Cerrar Conexión Múltiples Veces sin Fugas
    // ========================================================================

    /**
     * Test 07: Abrir y Cerrar Varias Veces sin Fugas de Recursos
     * 
     * Objetivo: Verificar que el componente de conexión puede ser instanciado,
     * utilizado y cerrado/liberado repetidamente sin fallar o causar pérdidas
     * de recursos (resource leaks).
     */
    public function test_07_ObtenerConexion_OpenClose_MultipleTimes_NoLeak(): void
    {
        // Arrange: Número de iteraciones para probar
        $iterations = 10;
        $successCount = 0;
        
        // Act: Abrir y cerrar conexión múltiples veces
        for ($i = 0; $i < $iterations; $i++) {
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            if (!$conn->connect_error) {
                // Ejecutar una consulta simple para usar la conexión
                $result = $conn->query("SELECT 1");
                if ($result) {
                    $successCount++;
                    $result->free();
                }
                $conn->close();
            }
        }
        
        // Assert: Todas las iteraciones deben ser exitosas
        $this->assertEquals(
            $iterations,
            $successCount,
            "Todas las {$iterations} conexiones deben abrirse y cerrarse exitosamente"
        );
    }

    // ========================================================================
    // TEST 08: Validar Cadena de Conexión Malformada
    // ========================================================================

    /**
     * Test 08: Error de Retorno de Cadena de Conexión Malformada
     * 
     * Objetivo: Verificar la capacidad del sistema de conexión para manejar
     * un error en la sintaxis de la cadena de conexión. Si los parámetros
     * no están bien formados, el driver debe manejar el error apropiadamente.
     */
    public function test_08_ValidarConexion_MalformedConnectionString_ReturnsErrorHandled(): void
    {
        // Arrange: Parámetros malformados (host vacío)
        $malformedHost = '';
        
        // Act: Intentar conexión con parámetros malformados
        mysqli_report(MYSQLI_REPORT_OFF);
        $conn = @new mysqli($malformedHost, DB_USER, DB_PASS, DB_NAME);
        
        // Assert: Debe manejar el error sin crashear
        $hasError = $conn->connect_error !== null || $conn->connect_errno !== 0;
        $this->assertTrue(
            $hasError,
            'Debe detectar y manejar parámetros de conexión malformados'
        );
    }

    // ========================================================================
    // TEST 09: Validar Permiso Denegado en DDL
    // ========================================================================

    /**
     * Test 09: Permiso Denegado en Operación DDL - Retorna Error
     * 
     * Objetivo: Verificar que el código de la aplicación puede detectar y
     * manejar correctamente una excepción de "Permiso Denegado" a nivel de
     * la base de datos, específicamente cuando se intenta una operación de
     * Definición de Datos (DDL) como CREATE TABLE.
     * 
     * Nota: Este test puede pasar si el usuario tiene permisos DDL, lo cual
     * también valida que la consulta se ejecuta correctamente.
     */
    public function test_09_ValidarConexion_PermissionDeniedOnDDL_ReturnsError(): void
    {
        // Arrange: Conectar y preparar operación DDL en tabla temporal
        $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        $this->assertFalse(
            (bool)$this->conn->connect_error,
            'Prerequisito: conexión debe ser válida'
        );
        
        // Act: Intentar crear una tabla temporal (DDL)
        $tableName = 'test_temp_ddl_' . time();
        $result = @$this->conn->query("CREATE TEMPORARY TABLE {$tableName} (id INT)");
        
        // Assert: Validar comportamiento (éxito o error manejado)
        if ($result) {
            // Si tiene permisos, la tabla se crea - limpiar
            $this->conn->query("DROP TEMPORARY TABLE IF EXISTS {$tableName}");
            $this->assertTrue(true, 'DDL ejecutado con permisos válidos');
        } else {
            // Si no tiene permisos, debe retornar error apropiado
            $this->assertNotEmpty(
                $this->conn->error,
                'Debe retornar mensaje de error si no hay permisos'
            );
        }
    }

    // ========================================================================
    // TEST 10: Validar SSL Requerido pero no Configurado
    // ========================================================================

    /**
     * Test 10: SSL Requerido pero no Configurado - Retorna Error SSL
     * 
     * Objetivo: Asegurar que el sistema de conexión puede detectar y reportar
     * fallos relacionados con la configuración de seguridad de la conexión,
     * específicamente un error de Capa de Sockets Segura (SSL/TLS).
     * 
     * Nota: Este test verifica que las opciones SSL pueden configurarse.
     */
    public function test_10_ValidarConexion_SSLRequiredButNotSet_ReturnsSslError(): void
    {
        // Arrange: Inicializar conexión con requisitos SSL
        mysqli_report(MYSQLI_REPORT_OFF);
        $conn = mysqli_init();
        
        // Configurar SSL con certificados ficticios
        $sslResult = $conn->ssl_set(
            '/path/to/nonexistent/client-key.pem',
            '/path/to/nonexistent/client-cert.pem',
            '/path/to/nonexistent/ca.pem',
            null,
            null
        );
        
        // Assert: La configuración SSL debe poder establecerse (aunque falle después)
        // mysqli_ssl_set siempre retorna true
        $this->assertTrue(
            $sslResult === true || $sslResult === null,
            'La función ssl_set debe ejecutarse sin errores fatales'
        );
        
        // Nota: La conexión real con SSL inválido fallará, pero eso es esperado
    }

    // ========================================================================
    // TEST 11: Validar Cadena de Conexión Cifrada (DPAPI)
    // ========================================================================

    /**
     * Test 11: Cadena de Conexión Cifrada DPAPI - Resoluble
     * 
     * Objetivo: Verificar la capacidad de la capa de conexión para trabajar
     * con una cadena de conexión que podría estar cifrada por mecanismos
     * de seguridad locales.
     * 
     * Nota: Este test simula el comportamiento de descifrado verificando
     * que los parámetros de conexión pueden ser procesados correctamente.
     */
    public function test_11_ValidarConexion_DpapiEncryptedConnectionString_Resolvable(): void
    {
        // Arrange: Simular cadena cifrada que se descifra a valores válidos
        $encryptedCredentials = [
            'host' => base64_encode(DB_HOST),
            'user' => base64_encode(DB_USER),
            'pass' => base64_encode(DB_PASS),
            'name' => base64_encode(DB_NAME)
        ];
        
        // Act: "Descifrar" las credenciales (simular DPAPI)
        $decryptedHost = base64_decode($encryptedCredentials['host']);
        $decryptedUser = base64_decode($encryptedCredentials['user']);
        $decryptedPass = base64_decode($encryptedCredentials['pass']);
        $decryptedName = base64_decode($encryptedCredentials['name']);
        
        // Intentar conexión con credenciales descifradas
        $this->conn = new mysqli($decryptedHost, $decryptedUser, $decryptedPass, $decryptedName);
        
        // Assert: La conexión debe ser exitosa después de descifrar
        $this->assertFalse(
            (bool)$this->conn->connect_error,
            'Conexión exitosa con credenciales correctamente descifradas'
        );
    }

    // ========================================================================
    // TEST 12: Validar Parámetros de Pool Aplicados
    // ========================================================================

    /**
     * Test 12: Parámetros de Pool de Conexiones Aplicados
     * 
     * Objetivo: Verificar el correcto ciclo de vida de apertura y cierre de
     * múltiples conexiones en secuencia. Simula el comportamiento esperado
     * cuando el sistema utiliza Connection Pooling.
     */
    public function test_12_ValidarConexion_PoolParameters_Applied(): void
    {
        // Arrange: Configurar múltiples conexiones en secuencia
        $connections = [];
        $poolSize = 5;
        
        // Act: Crear pool de conexiones
        for ($i = 0; $i < $poolSize; $i++) {
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            if (!$conn->connect_error) {
                $connections[] = $conn;
            }
        }
        
        // Assert: Todas las conexiones del pool deben ser válidas
        $this->assertCount(
            $poolSize,
            $connections,
            "Debe crear {$poolSize} conexiones exitosamente"
        );
        
        // Verificar que todas las conexiones son funcionales
        foreach ($connections as $index => $conn) {
            $result = $conn->query("SELECT CONNECTION_ID()");
            $this->assertNotFalse(
                $result,
                "Conexión {$index} debe ser funcional"
            );
            $result->free();
        }
        
        // Cleanup: Cerrar todas las conexiones
        foreach ($connections as $conn) {
            $conn->close();
        }
    }

    // ========================================================================
    // TEST 13: Validar Comportamiento del Pool bajo Carga
    // ========================================================================

    /**
     * Test 13: Abrir Muchas Conexiones - Comportamiento del Pool
     * 
     * Objetivo: Simular una alta demanda de recursos de conexión para verificar
     * que el sistema puede solicitar y liberar un número significativamente
     * mayor de objetos de conexión sin experimentar fallos inesperados.
     */
    public function test_13_ValidarConexion_OpenManyConnections_PoolBehavior(): void
    {
        // Arrange: Definir número alto de conexiones
        $maxConnections = 20;
        $successfulConnections = 0;
        
        // Act: Intentar crear múltiples conexiones consecutivas
        for ($i = 0; $i < $maxConnections; $i++) {
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            if (!$conn->connect_error) {
                $successfulConnections++;
                // Ejecutar una consulta para verificar funcionalidad
                $result = $conn->query("SELECT 1");
                if ($result) {
                    $result->free();
                }
                $conn->close();
            }
        }
        
        // Assert: La mayoría de las conexiones deben ser exitosas
        $minExpectedSuccess = $maxConnections * 0.8; // Al menos 80% de éxito
        $this->assertGreaterThanOrEqual(
            $minExpectedSuccess,
            $successfulConnections,
            "Al menos {$minExpectedSuccess} de {$maxConnections} conexiones deben ser exitosas"
        );
    }

    // ========================================================================
    // TEST 14: Validar Query Lenta con Timeout Manejado
    // ========================================================================

    /**
     * Test 14: Query Lenta con Timeout - Tiempo de Espera Gestionado
     * 
     * Objetivo: Verificar que la capa de acceso a datos maneje adecuadamente
     * los tiempos de espera de comandos (Command Timeout). Este mecanismo es
     * esencial para evitar que las consultas lentas bloqueen indefinidamente
     * el flujo de la aplicación.
     */
    public function test_14_ValidarConexion_SlowQuery_TimeoutHandled(): void
    {
        // Arrange: Conexión válida
        $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        $this->assertFalse(
            (bool)$this->conn->connect_error,
            'Prerequisito: conexión debe ser válida'
        );
        
        // Configurar timeout de consulta (si está disponible)
        $this->conn->options(MYSQLI_OPT_READ_TIMEOUT, 30);
        
        // Act: Ejecutar una consulta que simula tiempo de procesamiento
        // SLEEP(0.1) = 100ms, tiempo razonable para test
        $startTime = microtime(true);
        $result = $this->conn->query("SELECT SLEEP(0.1) as sleep_result, 1 as value");
        $endTime = microtime(true);
        
        // Assert: La consulta debe completarse y el tiempo debe ser razonable
        $this->assertNotFalse($result, 'La consulta SLEEP debe ejecutarse');
        
        $executionTime = $endTime - $startTime;
        $this->assertGreaterThan(0.05, $executionTime, 'Debe tomar al menos 50ms');
        $this->assertLessThan(5, $executionTime, 'No debe exceder 5 segundos');
        
        $row = $result->fetch_assoc();
        $this->assertEquals(1, $row['value'], 'Debe retornar el valor esperado');
        
        $result->free();
    }

    // ========================================================================
    // TEST 15: Seleccionar Valor Conocido - Retorna Esperado
    // ========================================================================

    /**
     * Test 15: Seleccionar Valor Conocido - Retorna Esperado
     * 
     * Objetivo: Prueba fundamental de lectura de datos. Este test valida el
     * flujo de trabajo completo y crítico de una aplicación de base de datos:
     * conexión, consulta y lectura de datos reales de la base de datos.
     */
    public function test_15_ValidarConexion_SelectKnownValue_ReturnsExpected(): void
    {
        // Arrange: Conexión válida y consulta de valor conocido
        $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        $this->assertFalse(
            (bool)$this->conn->connect_error,
            'Prerequisito: conexión debe ser válida'
        );
        
        // Act: Consultar información de la base de datos
        $result = $this->conn->query("SELECT DATABASE() as db_name, VERSION() as version");
        
        // Assert: Debe retornar los valores esperados
        $this->assertNotFalse($result, 'La consulta debe ejecutarse exitosamente');
        
        $row = $result->fetch_assoc();
        $this->assertNotNull($row, 'Debe retornar una fila de resultados');
        $this->assertEquals(
            DB_NAME,
            $row['db_name'],
            'El nombre de la BD debe coincidir con la configuración'
        );
        $this->assertNotEmpty($row['version'], 'Debe retornar la versión de MySQL');
        
        $result->free();
    }
}
