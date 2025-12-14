<?php
// Test del endpoint de login
$url = 'http://localhost/Proyecto-de-Equipo/api/login.php';
$data = json_encode([
    'username' => 'admin',
    'password' => 'admin123'
]);

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'POST',
        'content' => $data
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Respuesta del login:\n";
echo $result . "\n";