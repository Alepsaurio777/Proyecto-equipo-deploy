<?php
/**
 * ENDPOINT DE ROLES
 * ==================
 * 
 * Obtiene la lista de roles disponibles en el sistema
 */

require_once 'config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    jsonResponse(false, 'Método no soportado');
}

$conn = getConnection();

$sql = 'SELECT id_rol, nombre_rol FROM roles ORDER BY nombre_rol ASC';
$result = $conn->query($sql);

$roles = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $roles[] = [
            'id' => (int)$row['id_rol'],
            'name' => $row['nombre_rol']
        ];
    }
}

$conn->close();

jsonResponse(true, 'Roles obtenidos', $roles);
