<?php
/**
 * ENDPOINT DE PERMISOS
 * =====================
 * 
 * GET /permissions.php - Obtener todos los permisos por rol
 * PUT /permissions.php - Actualizar un permiso específico
 */

require_once 'config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

// Manejar preflight
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = getConnection();

switch ($method) {
    case 'GET':
        getPermissions($conn);
        break;
    case 'PUT':
        updatePermission($conn);
        break;
    default:
        jsonResponse(false, 'Método no soportado');
}

$conn->close();

/**
 * Obtener todos los permisos agrupados por rol
 */
function getPermissions($conn) {
    $sql = "SELECT r.id_rol, r.nombre_rol, p.permiso, p.activo
            FROM roles r
            LEFT JOIN permisos_rol p ON r.id_rol = p.id_rol
            ORDER BY r.id_rol, p.permiso";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        jsonResponse(false, 'Error al obtener permisos: ' . $conn->error);
        return;
    }
    
    $roles = [];
    $permissions_list = ['products.create', 'products.update', 'products.delete', 'products.view'];
    
    while ($row = $result->fetch_assoc()) {
        $roleId = (int)$row['id_rol'];
        
        if (!isset($roles[$roleId])) {
            $roles[$roleId] = [
                'id' => $roleId,
                'name' => $row['nombre_rol'],
                'permissions' => []
            ];
            // Inicializar todos los permisos como false
            foreach ($permissions_list as $perm) {
                $roles[$roleId]['permissions'][$perm] = false;
            }
        }
        
        if ($row['permiso']) {
            $roles[$roleId]['permissions'][$row['permiso']] = (bool)$row['activo'];
        }
    }
    
    // Convertir a array indexado
    $rolesArray = array_values($roles);
    
    jsonResponse(true, 'Permisos obtenidos', $rolesArray);
}

/**
 * Actualizar un permiso específico
 */
function updatePermission($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['roleId']) || !isset($data['permission']) || !isset($data['active'])) {
        jsonResponse(false, 'Datos incompletos. Se requiere: roleId, permission, active');
        return;
    }
    
    $roleId = (int)$data['roleId'];
    $permission = $conn->real_escape_string($data['permission']);
    $active = $data['active'] ? 1 : 0;
    
    // Validar que el permiso sea válido
    $validPermissions = ['products.create', 'products.update', 'products.delete', 'products.view'];
    if (!in_array($data['permission'], $validPermissions)) {
        jsonResponse(false, 'Permiso no válido');
        return;
    }
    
    // Upsert: insertar o actualizar
    $sql = "INSERT INTO permisos_rol (id_rol, permiso, activo) 
            VALUES ($roleId, '$permission', $active)
            ON DUPLICATE KEY UPDATE activo = $active";
    
    if ($conn->query($sql)) {
        jsonResponse(true, 'Permiso actualizado correctamente');
    } else {
        jsonResponse(false, 'Error al actualizar permiso: ' . $conn->error);
    }
}
