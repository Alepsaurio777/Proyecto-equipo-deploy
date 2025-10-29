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

// Manejar solicitud OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// ==================== GET: LISTAR PRODUCTOS ====================
if ($method === 'GET') {
    // Permite filtrar por ?status=inactive, por defecto muestra los activos
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : 'active';
    $active_flag = ($status === 'inactive') ? 0 : 1;

    $sql = "SELECT * FROM products WHERE active = ? ORDER BY name ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $active_flag);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $products = $result->fetch_all(MYSQLI_ASSOC);
    
    jsonResponse(true, 'Productos obtenidos', $products);
}

// ==================== POST: CREAR PRODUCTO ====================
elseif ($method === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $required = ['code', 'name', 'category'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            jsonResponse(false, "El campo $field es requerido");
        }
    }
    
    $checkStmt = $conn->prepare("SELECT id FROM products WHERE code = ?");
    $checkStmt->bind_param("s", $data['code']);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows > 0) {
        jsonResponse(false, 'El código de producto ya existe');
    }
    $checkStmt->close();
    
    $stmt = $conn->prepare("
        INSERT INTO products (code, name, category, description, price, stock, min_stock, max_stock, location, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ");
    
    $description = isset($data['description']) ? $data['description'] : '';
    $price = isset($data['price']) ? floatval($data['price']) : 0.00;
    $stock = isset($data['stock']) ? intval($data['stock']) : 0;
    $min_stock = isset($data['min_stock']) ? intval($data['min_stock']) : 0;
    $max_stock = isset($data['max_stock']) ? intval($data['max_stock']) : 100;
    $location = isset($data['location']) ? $data['location'] : '';

    $stmt->bind_param(
        "ssssdiiis",
        $data['code'],
        $data['name'],
        $data['category'],
        $description,
        $price,
        $stock,
        $min_stock,
        $max_stock,
        $location
    );
    
    if ($stmt->execute()) {
        $newId = $conn->insert_id;
        jsonResponse(true, 'Producto creado exitosamente', ['id' => $newId]);
    } else {
        jsonResponse(false, 'Error al crear el producto: ' . $stmt->error);
    }
}

// ==================== PUT: ACTUALIZAR PRODUCTO (Y RESTAURAR) ====================
elseif ($method === 'PUT') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!isset($data['id'])) {
        jsonResponse(false, 'El ID del producto es requerido');
    }
    $id = intval($data['id']);

    $checkStmt = $conn->prepare("SELECT id FROM products WHERE code = ? AND id != ?");
    $checkStmt->bind_param("si", $data['code'], $id);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows > 0) {
        jsonResponse(false, 'El código de producto ya está en uso por otro producto');
    }
    $checkStmt->close();
    
    $stmt = $conn->prepare("
        UPDATE products 
        SET code = ?, name = ?, category = ?, description = ?, price = ?, 
            stock = ?, min_stock = ?, max_stock = ?, location = ?, active = ?
        WHERE id = ?
    ");

    $description = isset($data['description']) ? $data['description'] : '';
    $price = isset($data['price']) ? floatval($data['price']) : 0.00;
    $stock = isset($data['stock']) ? intval($data['stock']) : 0;
    $min_stock = isset($data['min_stock']) ? intval($data['min_stock']) : 0;
    $max_stock = isset($data['max_stock']) ? intval($data['max_stock']) : 100;
    $location = isset($data['location']) ? $data['location'] : '';
    // Permite restaurar un producto. Si no se envía 'active', se mantiene activo por defecto.
    $active = isset($data['active']) ? intval($data['active']) : 1;

    $stmt->bind_param(
        "ssssdiiisii",
        $data['code'],
        $data['name'],
        $data['category'],
        $description,
        $price,
        $stock,
        $min_stock,
        $max_stock,
        $location,
        $active,
        $id
    );

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            jsonResponse(true, 'Producto actualizado exitosamente');
        } else {
            jsonResponse(false, 'No se encontró el producto o no hubo cambios');
        }
    } else {
        jsonResponse(false, 'Error al actualizar el producto: ' . $stmt->error);
    }
}

// ==================== DELETE: DESACTIVAR PRODUCTO ====================
elseif ($method === 'DELETE') {
    // Este método ahora solo desactiva (soft delete). La restauración se hace con PUT.
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!isset($data['id'])) {
        jsonResponse(false, 'El ID del producto es requerido');
    }
    $id = intval($data['id']);

    $stmt = $conn->prepare("UPDATE products SET active = 0 WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            jsonResponse(true, 'Producto desactivado exitosamente');
        } else {
            jsonResponse(false, 'No se encontró el producto a desactivar');
        }
    } else {
        jsonResponse(false, 'Error al desactivar el producto: ' . $stmt->error);
    }
}

else {
    jsonResponse(false, 'Método no soportado');
}

$conn->close();
?>