<?php
/**
 * ENDPOINT DE EMPLEADOS (CRUD)
 * =============================
 * 
 * Maneja las operaciones CRUD de empleados
 * 
 * MÉTODOS SOPORTADOS:
 * - GET:    Listar empleados (con filtros opcionales)
 * - POST:   Crear nuevo empleado
 * - PUT:    Actualizar empleado existente
 * - DELETE: Eliminar empleado
 */

require_once 'config.php';
setCorsHeaders();

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Conectar a la base de datos
$conn = getConnection();

// ==================== GET: LISTAR EMPLEADOS ====================
if ($method === 'GET') {
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : '';
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : '';
    
    $sql = "SELECT * FROM employees WHERE 1=1";
    
    if ($status !== '') {
        $sql .= " AND status = ?";
    }
    
    if ($search !== '') {
        $sql .= " AND (name LIKE ? OR position LIKE ? OR email LIKE ?)";
    }
    
    $sql .= " ORDER BY name ASC";
    
    $stmt = $conn->prepare($sql);
    
    // Bind parameters según los filtros
    if ($status !== '' && $search !== '') {
        $searchParam = "%$search%";
        $stmt->bind_param("ssss", $status, $searchParam, $searchParam, $searchParam);
    } elseif ($status !== '') {
        $stmt->bind_param("s", $status);
    } elseif ($search !== '') {
        $searchParam = "%$search%";
        $stmt->bind_param("sss", $searchParam, $searchParam, $searchParam);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $employees = $result->fetch_all(MYSQLI_ASSOC);
    
    jsonResponse(true, 'Empleados obtenidos', $employees);
}

// ==================== POST: CREAR EMPLEADO ====================
elseif ($method === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validar campos requeridos
    $required = ['name', 'position'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            jsonResponse(false, "El campo $field es requerido");
        }
    }
    
    // Insertar empleado
    $stmt = $conn->prepare("
        INSERT INTO employees (name, position, email, phone, salary, status, hire_date, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $email = isset($data['email']) ? $data['email'] : '';
    $phone = isset($data['phone']) ? $data['phone'] : '';
    $salary = isset($data['salary']) ? floatval($data['salary']) : 0.00;
    $status = isset($data['status']) ? $data['status'] : 'active';
    $hire_date = isset($data['hire_date']) ? $data['hire_date'] : null;
    $address = isset($data['address']) ? $data['address'] : '';
    
    $stmt->bind_param(
        "ssssdsss",
        $data['name'],
        $data['position'],
        $email,
        $phone,
        $salary,
        $status,
        $hire_date,
        $address
    );
    
    if ($stmt->execute()) {
        $newId = $conn->insert_id;
        jsonResponse(true, 'Empleado creado exitosamente', ['id' => $newId]);
    } else {
        jsonResponse(false, 'Error al crear empleado');
    }
}

// ==================== PUT: ACTUALIZAR EMPLEADO ====================
elseif ($method === 'PUT') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!isset($data['id'])) {
        jsonResponse(false, 'ID de empleado es requerido');
    }
    
    $stmt = $conn->prepare("
        UPDATE employees 
        SET name = ?, position = ?, email = ?, phone = ?, salary = ?, status = ?, hire_date = ?, address = ?
        WHERE id = ?
    ");
    
    $email = isset($data['email']) ? $data['email'] : '';
    $phone = isset($data['phone']) ? $data['phone'] : '';
    $salary = isset($data['salary']) ? floatval($data['salary']) : 0.00;
    $status = isset($data['status']) ? $data['status'] : 'active';
    $hire_date = isset($data['hire_date']) ? $data['hire_date'] : null;
    $address = isset($data['address']) ? $data['address'] : '';
    
    $stmt->bind_param(
        "ssssdsssi",
        $data['name'],
        $data['position'],
        $email,
        $phone,
        $salary,
        $status,
        $hire_date,
        $address,
        $data['id']
    );
    
    if ($stmt->execute()) {
        jsonResponse(true, 'Empleado actualizado exitosamente');
    } else {
        jsonResponse(false, 'Error al actualizar empleado');
    }
}

// ==================== DELETE: ELIMINAR EMPLEADO ====================
elseif ($method === 'DELETE') {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        jsonResponse(false, 'ID de empleado es requerido en la URL');
    }
    
    $employeeId = intval($_GET['id']);

    // Soft delete (marcar como inactivo)
    $stmt = $conn->prepare("UPDATE employees SET status = 'inactive' WHERE id = ?");
    $stmt->bind_param("i", $employeeId);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            jsonResponse(true, 'Empleado eliminado exitosamente');
        } else {
            jsonResponse(false, 'El empleado no fue encontrado o ya estaba inactivo');
        }
    } else {
        jsonResponse(false, 'Error al eliminar empleado: ' . $stmt->error);
    }
}

else {
    jsonResponse(false, 'Método no soportado');
}

$conn->close();
?>