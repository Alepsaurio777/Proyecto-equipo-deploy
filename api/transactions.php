<?php
/**
 * ENDPOINT DE TRANSACCIONES (CRUD)
 * =============================
 *
 * Maneja las operaciones CRUD de transacciones de inventario.
 */

require_once 'config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$conn = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    handleGetTransactions($conn);
} elseif ($method === 'POST') {
    handleCreateTransaction($conn);
} elseif ($method === 'PUT') {
    handleUpdateTransaction($conn);
} else {
    jsonResponse(false, 'Método no soportado');
}

$conn->close();

function handleGetTransactions(mysqli $conn): void
{
    $sql = '
        SELECT
            m.id_movimiento,
            m.id_producto,
            m.id_empleado,
            m.tipo_movimiento,
            m.cantidad,
            m.motivo,
            m.status,
            m.creado_por,
            m.aprobado_por,
            m.fecha_movimiento,
            m.fecha_aprobacion,
            p.codigo AS codigo_producto,
            p.nombre_producto,
            c.nombre_categoria,
            u.usuario AS creado_por_usuario,
            u.email AS creado_por_email,
            e.nombre_completo AS empleado_nombre,
            ua.usuario AS aprobado_por_usuario
        FROM movimiento_inventario m
        INNER JOIN producto p ON p.id_producto = m.id_producto
        LEFT JOIN categoria c ON c.id_categoria = p.id_categoria
        LEFT JOIN usuario u ON u.id_usuario = m.creado_por
        LEFT JOIN empleado e ON e.id_empleado = m.id_empleado
        LEFT JOIN usuario ua ON ua.id_usuario = m.aprobado_por
        ORDER BY m.fecha_movimiento DESC
    ';

    $result = $conn->query($sql);
    $transactions = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $transactions[] = mapTransactionRow($row);
        }
    }

    jsonResponse(true, 'Transacciones obtenidas', $transactions);
}

function handleCreateTransaction(mysqli $conn): void
{
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        jsonResponse(false, 'Datos inválidos');
    }

    $required = ['productId', 'quantity', 'type', 'userId'];
    foreach ($required as $field) {
        if (empty($payload[$field])) {
            jsonResponse(false, "El campo '$field' es requerido.");
        }
    }

    $type = strtolower($payload['type']);
    if (!in_array($type, ['entrada', 'salida'], true)) {
        jsonResponse(false, 'Tipo de movimiento no válido');
    }

    $productId = intval($payload['productId']);
    if (!productExists($conn, $productId)) {
        jsonResponse(false, 'El producto indicado no existe');
    }

    $employeeId = null;
    if (!empty($payload['employeeId'])) {
        $employeeId = intval($payload['employeeId']);
    } else {
        $employeeId = getEmployeeIdByUser($conn, intval($payload['userId']));
    }

    if (!$employeeId) {
        jsonResponse(false, 'No se encontró un empleado asociado al usuario');
    }

    $stmt = $conn->prepare('
        INSERT INTO movimiento_inventario (
            id_producto,
            id_empleado,
            tipo_movimiento,
            cantidad,
            motivo,
            status,
            creado_por
        ) VALUES (?, ?, ?, ?, ?, \'pendiente\', ?)
    ');

    $quantity = intval($payload['quantity']);
    $reason = $payload['reason'] ?? '';
    $userId = intval($payload['userId']);

    $stmt->bind_param(
        'iisisi',
        $productId,
        $employeeId,
        $type,
        $quantity,
        $reason,
        $userId
    );

    if (!$stmt->execute()) {
        jsonResponse(false, 'Error al crear la transacción: ' . $stmt->error);
    }

    $newId = $conn->insert_id;
    $stmt->close();

    $transaction = getTransactionById($conn, $newId);
    jsonResponse(true, 'Transacción creada exitosamente', $transaction);
}

function handleUpdateTransaction(mysqli $conn): void
{
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        jsonResponse(false, 'Datos inválidos');
    }

    $required = ['id', 'status', 'userId'];
    foreach ($required as $field) {
        if (empty($payload[$field])) {
            jsonResponse(false, "El campo '$field' es requerido.");
        }
    }

    $status = strtolower($payload['status']);
    if (!in_array($status, ['aprobada', 'rechazada'], true)) {
        jsonResponse(false, 'Estado no válido.');
    }

    $stmt = $conn->prepare('
        UPDATE movimiento_inventario
        SET status = ?,
            aprobado_por = ?
        WHERE id_movimiento = ?
          AND status = \'pendiente\'
    ');

    $userId = intval($payload['userId']);
    $transactionId = intval($payload['id']);

    $stmt->bind_param('sii', $status, $userId, $transactionId);

    if (!$stmt->execute()) {
        jsonResponse(false, 'Error al actualizar la transacción: ' . $stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        $stmt->close();
        jsonResponse(false, 'No se pudo actualizar la transacción (puede que ya no esté pendiente)');
    }

    $stmt->close();

    $transaction = getTransactionById($conn, $transactionId);
    jsonResponse(true, 'Transacción actualizada exitosamente', $transaction);
}

function productExists(mysqli $conn, int $productId): bool
{
    $stmt = $conn->prepare('SELECT 1 FROM producto WHERE id_producto = ? LIMIT 1');
    $stmt->bind_param('i', $productId);
    $stmt->execute();
    $stmt->store_result();
    $exists = $stmt->num_rows > 0;
    $stmt->close();
    return $exists;
}

function getEmployeeIdByUser(mysqli $conn, int $userId): ?int
{
    $stmt = $conn->prepare('SELECT id_empleado FROM empleado WHERE id_usuario = ? LIMIT 1');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $stmt->bind_result($employeeId);
    if ($stmt->fetch()) {
        $stmt->close();
        return (int)$employeeId;
    }
    $stmt->close();
    return null;
}

function getTransactionById(mysqli $conn, int $transactionId): ?array
{
    $stmt = $conn->prepare('
        SELECT
            m.id_movimiento,
            m.id_producto,
            m.id_empleado,
            m.tipo_movimiento,
            m.cantidad,
            m.motivo,
            m.status,
            m.creado_por,
            m.aprobado_por,
            m.fecha_movimiento,
            m.fecha_aprobacion,
            p.codigo AS codigo_producto,
            p.nombre_producto,
            c.nombre_categoria,
            u.usuario AS creado_por_usuario,
            u.email AS creado_por_email,
            e.nombre_completo AS empleado_nombre,
            ua.usuario AS aprobado_por_usuario
        FROM movimiento_inventario m
        INNER JOIN producto p ON p.id_producto = m.id_producto
        LEFT JOIN categoria c ON c.id_categoria = p.id_categoria
        LEFT JOIN usuario u ON u.id_usuario = m.creado_por
        LEFT JOIN empleado e ON e.id_empleado = m.id_empleado
        LEFT JOIN usuario ua ON ua.id_usuario = m.aprobado_por
        WHERE m.id_movimiento = ?
        LIMIT 1
    ');
    $stmt->bind_param('i', $transactionId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    if (!$row) {
        return null;
    }

    return mapTransactionRow($row);
}

function mapTransactionRow(array $row): array
{
    $createdByName = $row['empleado_nombre'] ?? $row['creado_por_usuario'] ?? '';
    return [
        'id' => (int)$row['id_movimiento'],
        'product_id' => (int)$row['id_producto'],
        'employee_id' => isset($row['id_empleado']) ? (int)$row['id_empleado'] : null,
        'type' => $row['tipo_movimiento'],
        'quantity' => (int)$row['cantidad'],
        'reason' => $row['motivo'] ?? '',
        'status' => $row['status'],
        'created_by' => isset($row['creado_por']) ? (int)$row['creado_por'] : null,
        'createdBy' => $createdByName,
        'created_by_name' => $createdByName,
        'created_by_username' => $row['creado_por_usuario'] ?? '',
        'created_by_email' => $row['creado_por_email'] ?? '',
        'approved_by' => isset($row['aprobado_por']) ? (int)$row['aprobado_por'] : null,
        'approved_by_username' => $row['aprobado_por_usuario'] ?? null,
        'created_at' => $row['fecha_movimiento'],
        'date' => $row['fecha_movimiento'],
        'approved_at' => $row['fecha_aprobacion'],
        'product_code' => $row['codigo_producto'],
        'productCode' => $row['codigo_producto'],
        'product_name' => $row['nombre_producto'],
        'productName' => $row['nombre_producto'],
        'product_category' => $row['nombre_categoria'] ?? '',
    ];
}
?>