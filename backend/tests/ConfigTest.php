<?php

use PHPUnit\Framework\TestCase;

/**
 * Test para las funciones de utilidad en config.php
 */
class ConfigTest extends TestCase
{
    protected function setUp(): void
    {
        // Definir TESTING para evitar ejecución de código de API
        if (!defined('TESTING')) {
            define('TESTING', true);
        }
        
        // Cargar config.php
        require_once __DIR__ . '/../api/config.php';
    }

    public function testSanitizeInputRemovesHtmlTags(): void
    {
        $input = '<script>alert("xss")</script>';
        $expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
        $this->assertEquals($expected, sanitizeInput($input));
    }

    public function testSanitizeInputTrimsWhitespace(): void
    {
        $input = '   hello world   ';
        $this->assertEquals('hello world', sanitizeInput($input));
    }

    public function testSanitizeInputHandlesEmptyString(): void
    {
        $this->assertEquals('', sanitizeInput(''));
    }

    public function testDatabaseConstantsAreDefined(): void
    {
        $this->assertTrue(defined('DB_HOST'));
        $this->assertTrue(defined('DB_USER'));
        $this->assertTrue(defined('DB_PASS'));
        $this->assertTrue(defined('DB_NAME'));
    }

    public function testDefaultDatabaseHost(): void
    {
        // Verificar que el host por defecto es 127.0.0.1
        $this->assertEquals('127.0.0.1', DB_HOST);
    }
}
