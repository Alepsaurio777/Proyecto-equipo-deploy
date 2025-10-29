<?php
/**
 * ENDPOINT DE TRANSACCIONES (CRUD)
 * =============================
 *
 * Maneja las operaciones CRUD de transacciones de inventario.
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

// ==================== GET: LISTAR TRANSACCIONES ====================
if ($method === 'GET') {
    $sql = "
        SELECT 
            t.id, t.type, t.quantity, t.reason, t.status, t.created_at,
            p.code as product_code, p.name as product_name,
            u.full_name as created_by_name
        FROM transactions t
        INNER JOIN products p ON t.product_id = p.id
        INNER JOIN users u ON t.created_by = u.id
        ORDER BY t.created_at DESC
    ";
    
    $result = $conn->query($sql);
    $transactions = $result->fetch_all(MYSQLI_ASSOC);
    
    jsonResponse(true, 'Transacciones obtenidas', $transactions);
}

// ==================== POST: CREAR TRANSACCIÓN ====================
elseif ($method === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $required = ['productId', 'quantity', 'type', 'userId'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            jsonResponse(false, "El campo '$field' es requerido.");
        }
    }

    $stmt = $conn->prepare("
        INSERT INTO transactions (product_id, type, quantity, reason, created_by, status)
        VALUES (?, ?, ?, ?, ?, 'pendiente')
    ");

    $reason = isset($data['reason']) ? $data['reason'] : '';

    $stmt->bind_param(
        "isisi",
        $data['productId'],
        $data['type'],
        $data['quantity'],
        $reason,
        $data['userId']
    );

    if ($stmt->execute()) {
        $newId = $conn->insert_id;
        jsonResponse(true, 'Transacción creada exitosamente', ['id' => $newId]);
    } else {
        jsonResponse(false, 'Error al crear la transacción: ' . $stmt->error);
    }
}

// ==================== PUT: ACTUALIZAR ESTADO DE TRANSACCIÓN ====================
elseif ($method === 'PUT') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $required = ['id', 'status', 'userId'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            jsonResponse(false, "El campo '$field' es requerido.");
        }
    }

    $valid_statuses = ['aprobada', 'rechazada'];
    if (!in_array($data['status'], $valid_statuses)) {
        jsonResponse(false, "Estado no válido.");
    }

    $stmt = $conn->prepare("
        UPDATE transactions 
        SET status = ?, approved_by = ?
        WHERE id = ? AND status = 'pendiente'
    ");

    $stmt->bind_param("sii", $data['status'], $data['userId'], $data['id']);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            jsonResponse(true, 'Transacción actualizada exitosamente');
        } else {
            jsonResponse(false, 'No se pudo actualizar la transacción (puede que no esté pendiente o no exista)');
        }
    } else {
        jsonResponse(false, 'Error al actualizar la transacción: ' . $stmt->error);
    }
}

else {
    jsonResponse(false, 'Método no soportado');
}

$conn->close();
?>