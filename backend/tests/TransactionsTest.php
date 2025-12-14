<?php

use PHPUnit\Framework\TestCase;

/**
 * Test para las funciones de transactions.php usando Mocks
 */
class TransactionsTest extends TestCase
{
    protected function setUp(): void
    {
        if (!defined('TESTING')) {
            define('TESTING', true);
        }
        
        require_once __DIR__ . '/../api/transactions.php';
    }

    /**
     * Test: mapTransactionRow devuelve estructura correcta
     */
    public function testMapTransactionRowReturnsCorrectStructure(): void
    {
        $mockRow = [
            'id_movimiento' => 1,
            'id_producto' => 10,
            'id_empleado' => 5,
            'tipo_movimiento' => 'entrada',
            'cantidad' => 100,
            'motivo' => 'Reabastecimiento',
            'status' => 'pendiente',
            'creado_por' => 1,
            'aprobado_por' => null,
            'fecha_movimiento' => '2024-01-15 10:00:00',
            'fecha_aprobacion' => null,
            'codigo_producto' => 'PROD-001',
            'nombre_producto' => 'Martillo',
            'nombre_categoria' => 'Herramientas',
            'creado_por_usuario' => 'admin',
            'creado_por_email' => 'admin@test.com',
            'empleado_nombre' => 'Juan Pérez',
            'aprobado_por_usuario' => null
        ];

        $result = mapTransactionRow($mockRow);

        $this->assertIsArray($result);
        $this->assertEquals(1, $result['id']);
        $this->assertEquals(10, $result['product_id']);
        $this->assertEquals('entrada', $result['type']);
        $this->assertEquals(100, $result['quantity']);
        $this->assertEquals('pendiente', $result['status']);
        $this->assertEquals('PROD-001', $result['product_code']);
        $this->assertEquals('Martillo', $result['product_name']);
        $this->assertEquals('Juan Pérez', $result['created_by_name']);
    }

    /**
     * Test: mapTransactionRow maneja valores nulos correctamente
     */
    public function testMapTransactionRowHandlesNullValues(): void
    {
        $mockRow = [
            'id_movimiento' => 2,
            'id_producto' => 20,
            'id_empleado' => null,
            'tipo_movimiento' => 'salida',
            'cantidad' => 5,
            'motivo' => null,
            'status' => 'aprobada',
            'creado_por' => 1,
            'aprobado_por' => 2,
            'fecha_movimiento' => '2024-01-16 11:00:00',
            'fecha_aprobacion' => '2024-01-16 12:00:00',
            'codigo_producto' => 'PROD-002',
            'nombre_producto' => 'Destornillador',
            'nombre_categoria' => null,
            'creado_por_usuario' => 'vendedor',
            'creado_por_email' => 'vendedor@test.com',
            'empleado_nombre' => null,
            'aprobado_por_usuario' => 'admin'
        ];

        $result = mapTransactionRow($mockRow);

        $this->assertNull($result['employee_id']);
        $this->assertEquals('', $result['reason']);
        $this->assertEquals('', $result['product_category']);
        $this->assertEquals('vendedor', $result['created_by_name']); // Falls back to username
    }
}
