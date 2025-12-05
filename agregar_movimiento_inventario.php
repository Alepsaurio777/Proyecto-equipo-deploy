<?php
require_once 'api/config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: inventario.php');
    exit;
}

$conn = getConnection();

$producto_id = (int)$_POST['producto_id'];
$tipo = $_POST['tipo'];
$cantidad = (int)$_POST['cantidad'];
$motivo = $_POST['motivo'];
$user_id = $_SESSION['user_id'] ?? 1;

// Obtener empleado del usuario
$emp_stmt = $conn->prepare("SELECT id_empleado FROM empleado WHERE id_usuario = ?");
$emp_stmt->bind_param("i", $user_id);
$emp_stmt->execute();
$emp_result = $emp_stmt->get_result();
$empleado_id = $emp_result->fetch_assoc()['id_empleado'] ?? 1;

$stmt = $conn->prepare("
    INSERT INTO movimiento_inventario (id_producto, id_empleado, tipo_movimiento, cantidad, motivo, status, creado_por) 
    VALUES (?, ?, ?, ?, ?, 'pendiente', ?)
");

$stmt->bind_param("iisisi", $producto_id, $empleado_id, $tipo, $cantidad, $motivo, $user_id);

if ($stmt->execute()) {
    header('Location: inventario.php?success=movimiento_registrado');
} else {
    header('Location: inventario.php?error=error_registrar_movimiento');
}

$conn->close();
