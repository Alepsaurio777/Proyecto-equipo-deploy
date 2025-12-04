<?php

use PHPUnit\Framework\TestCase;

class ConexionDBTest extends TestCase
{
    private $conn;

    protected function setUp(): void
    {
        // Configurar conexión de prueba
        $this->conn = new mysqli('localhost', 'root', 'parra', 'ferreteria_db');
    }

    protected function tearDown(): void
    {
        if ($this->conn) {
            $this->conn->close();
        }
    }

    public function testConexionExitosa()
    {
        // Verificar que la conexión sea exitosa
        $this->assertFalse($this->conn->connect_error, 'Error de conexión: ' . $this->conn->connect_error);
        $this->assertTrue($this->conn->ping(), 'La conexión no está activa');
    }

    public function testBaseDatosExiste()
    {
        // Verificar que la base de datos existe
        $result = $this->conn->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'ferreteria_db'");
        $this->assertEquals(1, $result->num_rows, 'La base de datos ferreteria_db no existe');
    }

    public function testTablasExisten()
    {
        // Verificar que las tablas principales existen
        $tablas = ['usuario', 'empleado', 'producto', 'categoria', 'roles'];
        
        foreach ($tablas as $tabla) {
            $result = $this->conn->query("SHOW TABLES LIKE '$tabla'");
            $this->assertEquals(1, $result->num_rows, "La tabla $tabla no existe");
        }
    }

    public function testUsuariosExisten()
    {
        // Verificar que existen usuarios de prueba
        $result = $this->conn->query("SELECT COUNT(*) as total FROM usuario");
        $row = $result->fetch_assoc();
        $this->assertGreaterThan(0, $row['total'], 'No hay usuarios en la base de datos');
    }
}