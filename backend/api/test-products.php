<?php
// Test del endpoint de productos
$url = 'http://localhost/Proyecto-de-Equipo/api/products.php';

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "Content-type: application/json\r\n"
    ]
]);

$result = file_get_contents($url, false, $context);

echo "Respuesta de productos:\n";
$data = json_decode($result, true);
if ($data && $data['success']) {
    echo "✅ Productos obtenidos: " . count($data['data']) . "\n";
    foreach ($data['data'] as $product) {
        echo "- {$product['code']}: {$product['name']} (Stock: {$product['stock']})\n";
    }
} else {
    echo "❌ Error: " . ($data['message'] ?? 'Respuesta inválida') . "\n";
    echo $result . "\n";
}