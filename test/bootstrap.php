<?php
// Bootstrap para las pruebas PHPUnit
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../api/config.php';

// Configurar variables de entorno para pruebas
$_ENV['DB_HOST'] = 'localhost';
$_ENV['DB_USER'] = 'root';
$_ENV['DB_PASS'] = 'parra';
$_ENV['DB_NAME'] = 'ferreteria_db_test';