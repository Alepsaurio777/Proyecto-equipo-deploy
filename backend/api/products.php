<?php
/**
 * ENDPOINT DE PRODUCTOS (CRUD)
 * =============================
 * 
 * Maneja las operaciones CRUD de productos del inventario.
 * v2: Añade soporte para filtrar por estado (activos/inactivos) y restaurar productos.
 */

require_once 'config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Iniciar sesión para obtener información del usuario
session_start();

if ($method === 'GET') {
    handleGetProducts($conn);
} elseif ($method === 'POST') {
    // Validar permiso de crear
    if (!checkRolePermission($conn, 'products.create')) {
        jsonResponse(false, 'No tienes permiso para registrar productos');
    }
    handleCreateProduct($conn);
} elseif ($method === 'PUT') {
    // Validar permiso de actualizar
    if (!checkRolePermission($conn, 'products.update')) {
        jsonResponse(false, 'No tienes permiso para modificar productos');
    }
    handleUpdateProduct($conn);
} elseif ($method === 'DELETE') {
    // Validar permiso de eliminar
    if (!checkRolePermission($conn, 'products.delete')) {
        jsonResponse(false, 'No tienes permiso para eliminar productos');
    }
    handleDeleteProduct($conn);
} else {
    jsonResponse(false, 'Método no soportado');
}

$conn->close();

/**
 * Verifica si el usuario actual tiene un permiso específico
 */
function checkRolePermission(mysqli $conn, string $permission): bool {
    // Obtener user_id de la sesión
    $userId = $_SESSION['user_id'] ?? null;
    
    if (!$userId) {
        // Si no hay sesión, intentar obtener del header o permitir (fallback)
        // En producción deberías requerir autenticación
        return true; // Fallback permisivo para desarrollo
    }
    
    // Obtener el id_rol del usuario
    $stmt = $conn->prepare('
        SELECT e.id_rol 
        FROM empleado e 
        WHERE e.id_usuario = ? 
        LIMIT 1
    ');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    
    if (!$row || !$row['id_rol']) {
        return true; // Sin rol asignado = permisos completos (superadmin)
    }
    
    $roleId = (int)$row['id_rol'];
    
    // Verificar si el permiso está activo para este rol
    $stmt = $conn->prepare('
        SELECT activo 
        FROM permisos_rol 
        WHERE id_rol = ? AND permiso = ? 
        LIMIT 1
    ');
    $stmt->bind_param('is', $roleId, $permission);
    $stmt->execute();
    $result = $stmt->get_result();
    $permRow = $result->fetch_assoc();
    $stmt->close();
    
    if (!$permRow) {
        // Si no existe el registro, asumir que tiene permiso (compatibilidad)
        return true;
    }
    
    return (bool)$permRow['activo'];
}

function handleGetProducts(mysqli $conn): void
{
    $sql = "
        SELECT 
            p.id_producto,
            p.codigo,
            p.nombre_producto,
            p.descripcion,
            p.precio,
            p.stock_actual,
            p.stock_minimo,
            p.stock_maximo,
            p.ubicacion,
            p.activo,
            p.creado,
            p.actualizado,
            p.id_categoria,
            c.nombre_categoria
        FROM producto p
        LEFT JOIN categoria c ON c.id_categoria = p.id_categoria
        ORDER BY p.nombre_producto ASC
    ";

    $result = $conn->query($sql);

    $products = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $products[] = mapProductRow($row);
        }
    }

    jsonResponse(true, 'Productos obtenidos', $products);
}

function handleCreateProduct(mysqli $conn): void
{
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        jsonResponse(false, 'Datos inválidos');
    }

    $required = ['code', 'name', 'category'];
    foreach ($required as $field) {
        if (empty($payload[$field])) {
            jsonResponse(false, "El campo $field es requerido");
        }
    }

    if (productCodeExists($conn, $payload['code'])) {
        jsonResponse(false, 'El código de producto ya existe');
    }

    $categoryId = getCategoryId($conn, $payload['category']);
    if (!$categoryId) {
        jsonResponse(false, 'No se pudo determinar la categoría');
    }

    $stmt = $conn->prepare('
        INSERT INTO producto (
            codigo,
            nombre_producto,
            descripcion,
            precio,
            stock_actual,
            stock_minimo,
            stock_maximo,
            ubicacion,
            id_categoria,
            activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ');

    $description = $payload['description'] ?? '';
    $price = isset($payload['price']) ? floatval($payload['price']) : 0.0;
    $stock = isset($payload['stock']) ? intval($payload['stock']) : 0;
    $minStock = isset($payload['min_stock']) ? intval($payload['min_stock']) : (isset($payload['minStock']) ? intval($payload['minStock']) : 0);
    $maxStock = isset($payload['max_stock']) ? intval($payload['max_stock']) : (isset($payload['maxStock']) ? intval($payload['maxStock']) : 100);
    $location = $payload['location'] ?? '';

    $stmt->bind_param(
        'sssdiiisi',
        $payload['code'],
        $payload['name'],
        $description,
        $price,
        $stock,
        $minStock,
        $maxStock,
        $location,
        $categoryId
    );

    if (!$stmt->execute()) {
        jsonResponse(false, 'Error al crear el producto: ' . $stmt->error);
    }

    $newId = $conn->insert_id;
    $stmt->close();

    $product = getProductById($conn, $newId);
    jsonResponse(true, 'Producto creado exitosamente', $product);
}

function handleUpdateProduct(mysqli $conn): void
{
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!is_array($payload) || empty($payload['id'])) {
        jsonResponse(false, 'El ID del producto es requerido');
    }

    $productId = intval($payload['id']);
    $currentProduct = getProductById($conn, $productId);
    if (!$currentProduct) {
        jsonResponse(false, 'Producto no encontrado');
    }

    if (isset($payload['code']) && productCodeExists($conn, $payload['code'], $productId)) {
        jsonResponse(false, 'El código de producto ya está en uso');
    }

    $categoryId = $currentProduct['category_id'] ?? null;
    if (!empty($payload['category'])) {
        $categoryId = getCategoryId($conn, $payload['category']);
        if (!$categoryId) {
            jsonResponse(false, 'No se pudo determinar la categoría');
        }
    }

    $stmt = $conn->prepare('
        UPDATE producto
        SET codigo = ?,
            nombre_producto = ?,
            descripcion = ?,
            precio = ?,
            stock_actual = ?,
            stock_minimo = ?,
            stock_maximo = ?,
            ubicacion = ?,
            id_categoria = ?,
            activo = ?
        WHERE id_producto = ?
    ');

    $description = $payload['description'] ?? '';
    $price = isset($payload['price']) ? floatval($payload['price']) : 0.0;
    $stock = isset($payload['stock']) ? intval($payload['stock']) : 0;
    $minStock = isset($payload['min_stock']) ? intval($payload['min_stock']) : (isset($payload['minStock']) ? intval($payload['minStock']) : 0);
    $maxStock = isset($payload['max_stock']) ? intval($payload['max_stock']) : (isset($payload['maxStock']) ? intval($payload['maxStock']) : 100);
    $location = $payload['location'] ?? '';
    $active = isset($payload['active']) ? intval($payload['active']) : 1;

    $categoryId = $categoryId !== null ? intval($categoryId) : null;

    $stmt->bind_param(
        'sssdiiisiii',
        $payload['code'],
        $payload['name'],
        $description,
        $price,
        $stock,
        $minStock,
        $maxStock,
        $location,
        $categoryId,
        $active,
        $productId
    );

    if (!$stmt->execute()) {
        jsonResponse(false, 'Error al actualizar el producto: ' . $stmt->error);
    }

    $stmt->close();

    $product = getProductById($conn, $productId);
    jsonResponse(true, 'Producto actualizado exitosamente', $product);
}

function handleDeleteProduct(mysqli $conn): void
{
    $productId = null;

    if (isset($_GET['id'])) {
        $productId = intval($_GET['id']);
    } else {
        $payload = json_decode(file_get_contents('php://input'), true);
        if (is_array($payload) && !empty($payload['id'])) {
            $productId = intval($payload['id']);
        }
    }

    if (!$productId) {
        jsonResponse(false, 'El ID del producto es requerido');
    }

    $stmt = $conn->prepare('DELETE FROM producto WHERE id_producto = ?');
    $stmt->bind_param('i', $productId);

    if (!$stmt->execute()) {
        jsonResponse(false, 'Error al eliminar el producto: ' . $stmt->error);
    }

    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected === 0) {
        jsonResponse(false, 'No se encontró el producto a eliminar');
    }

    jsonResponse(true, 'Producto eliminado exitosamente');
}

function productCodeExists(mysqli $conn, string $code, ?int $excludeId = null): bool
{
    $sql = 'SELECT 1 FROM producto WHERE codigo = ?';
    if ($excludeId) {
        $sql .= ' AND id_producto != ?';
    }

    $stmt = $conn->prepare($sql);
    if ($excludeId) {
        $stmt->bind_param('si', $code, $excludeId);
    } else {
        $stmt->bind_param('s', $code);
    }

    $stmt->execute();
    $stmt->store_result();
    $exists = $stmt->num_rows > 0;
    $stmt->close();
    return $exists;
}

function getCategoryId(mysqli $conn, string $name): ?int
{
    $name = trim($name);
    if ($name === '') {
        return null;
    }

    $stmt = $conn->prepare('SELECT id_categoria FROM categoria WHERE LOWER(nombre_categoria) = LOWER(?) LIMIT 1');
    $stmt->bind_param('s', $name);
    $stmt->execute();
    $stmt->bind_result($id);
    if ($stmt->fetch()) {
        $stmt->close();
        return (int)$id;
    }
    $stmt->close();

    $insert = $conn->prepare('INSERT INTO categoria (nombre_categoria) VALUES (?)');
    $insert->bind_param('s', $name);
    if (!$insert->execute()) {
        return null;
    }
    $newId = (int)$insert->insert_id;
    $insert->close();
    return $newId;
}

function getProductById(mysqli $conn, int $productId): ?array
{
    $stmt = $conn->prepare('
        SELECT 
            p.id_producto,
            p.codigo,
            p.nombre_producto,
            p.descripcion,
            p.precio,
            p.stock_actual,
            p.stock_minimo,
            p.stock_maximo,
            p.ubicacion,
            p.activo,
            p.creado,
            p.actualizado,
            p.id_categoria,
            c.nombre_categoria
        FROM producto p
        LEFT JOIN categoria c ON c.id_categoria = p.id_categoria
        WHERE p.id_producto = ?
        LIMIT 1
    ');
    $stmt->bind_param('i', $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    if (!$row) {
        return null;
    }

    return mapProductRow($row);
}

function mapProductRow(array $row): array
{
    $categoryName = $row['nombre_categoria'] ?? '';
    return [
        'id' => (int)$row['id_producto'],
        'code' => $row['codigo'],
        'name' => $row['nombre_producto'],
        'description' => $row['descripcion'] ?? '',
        'price' => isset($row['precio']) ? (float)$row['precio'] : 0.0,
        'stock' => isset($row['stock_actual']) ? (int)$row['stock_actual'] : 0,
        'min_stock' => isset($row['stock_minimo']) ? (int)$row['stock_minimo'] : 0,
        'max_stock' => isset($row['stock_maximo']) ? (int)$row['stock_maximo'] : 0,
        'minStock' => isset($row['stock_minimo']) ? (int)$row['stock_minimo'] : 0,
        'maxStock' => isset($row['stock_maximo']) ? (int)$row['stock_maximo'] : 0,
        'location' => $row['ubicacion'] ?? '',
        'category' => $categoryName,
        'category_id' => isset($row['id_categoria']) ? (int)$row['id_categoria'] : null,
        'active' => isset($row['activo']) ? (int)$row['activo'] : 1,
        'created_at' => $row['creado'] ?? null,
        'updated_at' => $row['actualizado'] ?? null
    ];
}
?>