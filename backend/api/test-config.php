<?php
require_once 'config.php';

echo "Probando config.php...\n";
echo "DB_HOST: " . DB_HOST . "\n";
echo "DB_USER: " . DB_USER . "\n";
echo "DB_PASS: " . (DB_PASS ? "***" : "(vacío)") . "\n";
echo "DB_NAME: " . DB_NAME . "\n\n";

try {
    $conn = getConnection();
    echo "✅ getConnection() funciona OK\n";
    
    $result = $conn->query("SELECT COUNT(*) as total FROM producto");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "Productos en BD: " . $row['total'] . "\n";
    }
    $conn->close();
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}