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

$method = $_SERVER['REQUEST_METHOD'];
$conn = getConnection();

if ($method === 'GET') {
    handleGetEmployees($conn);
} elseif ($method === 'POST') {
    handleCreateEmployee($conn);
} elseif ($method === 'PUT') {
    handleUpdateEmployee($conn);
} elseif ($method === 'DELETE') {
    handleDeleteEmployee($conn);
} else {
    jsonResponse(false, 'Método no soportado');
}

$conn->close();

function handleGetEmployees(mysqli $conn): void
{
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : '';
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : '';

    $conditions = [];
    $params = [];
    $types = '';

    if ($status !== '') {
        $conditions[] = 'e.status = ?';
        $types .= 's';
        $params[] = $status;
    }

    if ($search !== '') {
        $conditions[] = '(e.nombre_completo LIKE ? OR r.nombre_rol LIKE ? OR u.email LIKE ? OR u.telefono LIKE ?)';
        $types .= 'ssss';
        $like = '%' . $search . '%';
        $params = array_merge($params, [$like, $like, $like, $like]);
    }

    $sql = '
        SELECT
            e.id_empleado,
            e.nombre_completo,
            e.id_usuario,
            e.id_rol,
            e.salario,
            e.fecha_contratacion,
            e.status,
            e.direccion,
            r.nombre_rol,
            u.usuario,
            u.email,
            u.telefono
        FROM empleado e
        LEFT JOIN roles r ON r.id_rol = e.id_rol
        LEFT JOIN usuario u ON u.id_usuario = e.id_usuario
    ';

    if ($conditions) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $sql .= ' ORDER BY e.nombre_completo ASC';

    if ($params) {
        $stmt = $conn->prepare($sql);
        bindStatementParams($stmt, $types, $params);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($sql);
    }

    $employees = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $employees[] = mapEmployeeRow($row);
        }
    }

    if (isset($stmt)) {
        $stmt->close();
    }

    jsonResponse(true, 'Empleados obtenidos', $employees);
}

function handleCreateEmployee(mysqli $conn): void
{
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!is_array($payload)) {
        jsonResponse(false, 'Datos inválidos');
    }

    $required = ['name', 'position'];
    foreach ($required as $field) {
        if (empty($payload[$field])) {
            jsonResponse(false, "El campo $field es requerido");
        }
    }

    $roleId = ensureRoleId($conn, $payload['position']);
    if (!$roleId) {
        jsonResponse(false, 'No se pudo determinar el rol');
    }

    $userResult = ensureUserAccount($conn, $payload);
    $userId = $userResult['id_usuario'] ?? null;

    $stmt = $conn->prepare('
        INSERT INTO empleado (
            nombre_completo,
            id_usuario,
            id_rol,
            salario,
            fecha_contratacion,
            status,
            direccion
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ');

    $salary = isset($payload['salary']) ? floatval($payload['salary']) : 0.0;
    $hireDate = $payload['hire_date'] ?? null;
    $status = $payload['status'] ?? 'active';
    $address = $payload['address'] ?? '';

    $stmt->bind_param(
        'siidsss',
        $payload['name'],
        $userId,
        $roleId,
        $salary,
        $hireDate,
        $status,
        $address
    );

    if (!$stmt->execute()) {
        jsonResponse(false, 'Error al crear empleado: ' . $stmt->error);
    }

    $employeeId = $conn->insert_id;
    $stmt->close();

    $employee = getEmployeeById($conn, $employeeId);
    $responseData = ['id' => $employeeId, 'employee' => $employee];
    if (!empty($userResult['generated_credentials'])) {
        $responseData['generatedCredentials'] = $userResult['generated_credentials'];
    }

    jsonResponse(true, 'Empleado creado exitosamente', $responseData);
}

function handleUpdateEmployee(mysqli $conn): void
{
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!is_array($payload) || empty($payload['id'])) {
        jsonResponse(false, 'ID de empleado es requerido');
    }

    $employee = getEmployeeById($conn, intval($payload['id']));
    if (!$employee) {
        jsonResponse(false, 'Empleado no encontrado');
    }

    $roleId = $employee['role_id'] ?? null;
    if (!empty($payload['position'])) {
        $roleId = ensureRoleId($conn, $payload['position']);
        if (!$roleId) {
            jsonResponse(false, 'No se pudo determinar el rol');
        }
    }

    $userResult = ensureUserAccount($conn, $payload, $employee['user_id']);
    $userId = $userResult['id_usuario'] ?? $employee['user_id'];

    $stmt = $conn->prepare('
        UPDATE empleado
        SET nombre_completo = ?,
            id_usuario = ?,
            id_rol = ?,
            salario = ?,
            fecha_contratacion = ?,
            status = ?,
            direccion = ?
        WHERE id_empleado = ?
    ');

    $salary = isset($payload['salary']) ? floatval($payload['salary']) : (float)$employee['salary'];
    $hireDate = $payload['hire_date'] ?? $employee['hire_date'];
    $status = $payload['status'] ?? $employee['status'];
    $address = $payload['address'] ?? $employee['address'];
    $name = $payload['name'] ?? $employee['name'];

    $stmt->bind_param(
        'siidsssi',
        $name,
        $userId,
        $roleId,
        $salary,
        $hireDate,
        $status,
        $address,
        $employee['id']
    );

    if (!$stmt->execute()) {
        jsonResponse(false, 'Error al actualizar empleado: ' . $stmt->error);
    }

    $stmt->close();

    $updatedEmployee = getEmployeeById($conn, $employee['id']);
    $data = ['employee' => $updatedEmployee];
    if (!empty($userResult['generated_credentials'])) {
        $data['generatedCredentials'] = $userResult['generated_credentials'];
    }

    jsonResponse(true, 'Empleado actualizado exitosamente', $data);
}

function handleDeleteEmployee(mysqli $conn): void
{
    $employeeId = null;
    if (isset($_GET['id'])) {
        $employeeId = intval($_GET['id']);
    } else {
        $payload = json_decode(file_get_contents('php://input'), true);
        if (is_array($payload) && !empty($payload['id'])) {
            $employeeId = intval($payload['id']);
        }
    }

    if (!$employeeId) {
        jsonResponse(false, 'ID de empleado es requerido');
    }

    $stmt = $conn->prepare('DELETE FROM empleado WHERE id_empleado = ?');
    $stmt->bind_param('i', $employeeId);

    if (!$stmt->execute()) {
        jsonResponse(false, 'Error al eliminar empleado: ' . $stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        $stmt->close();
        jsonResponse(false, 'El empleado no fue encontrado');
    }

    $stmt->close();
    jsonResponse(true, 'Empleado eliminado exitosamente');
}

function mapEmployeeRow(array $row): array
{
    return [
        'id' => (int)$row['id_empleado'],
        'name' => $row['nombre_completo'],
        'position' => $row['nombre_rol'] ?? '',
        'role_id' => isset($row['id_rol']) ? (int)$row['id_rol'] : null,
        'user_id' => isset($row['id_usuario']) ? (int)$row['id_usuario'] : null,
        'username' => $row['usuario'] ?? '',
        'email' => $row['email'] ?? '',
        'phone' => $row['telefono'] ?? '',
        'salary' => isset($row['salario']) ? (float)$row['salario'] : 0.0,
        'status' => $row['status'] ?? 'active',
        'hire_date' => $row['fecha_contratacion'],
        'address' => $row['direccion'] ?? ''
    ];
}

function getEmployeeById(mysqli $conn, int $employeeId): ?array
{
    $stmt = $conn->prepare('
        SELECT
            e.id_empleado,
            e.nombre_completo,
            e.id_usuario,
            e.id_rol,
            e.salario,
            e.fecha_contratacion,
            e.status,
            e.direccion,
            r.nombre_rol,
            u.usuario,
            u.email,
            u.telefono
        FROM empleado e
        LEFT JOIN roles r ON r.id_rol = e.id_rol
        LEFT JOIN usuario u ON u.id_usuario = e.id_usuario
        WHERE e.id_empleado = ?
        LIMIT 1
    ');
    $stmt->bind_param('i', $employeeId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    if (!$row) {
        return null;
    }

    return mapEmployeeRow($row);
}

function ensureRoleId(mysqli $conn, string $roleName): ?int
{
    $roleName = trim($roleName);
    if ($roleName === '') {
        return null;
    }

    $stmt = $conn->prepare('SELECT id_rol FROM roles WHERE LOWER(nombre_rol) = LOWER(?) LIMIT 1');
    $stmt->bind_param('s', $roleName);
    $stmt->execute();
    $stmt->bind_result($roleId);
    if ($stmt->fetch()) {
        $stmt->close();
        return (int)$roleId;
    }
    $stmt->close();

    $insert = $conn->prepare('INSERT INTO roles (nombre_rol) VALUES (?)');
    $insert->bind_param('s', $roleName);
    if (!$insert->execute()) {
        return null;
    }
    $newId = (int)$insert->insert_id;
    $insert->close();
    return $newId;
}

function ensureUserAccount(mysqli $conn, array $payload, ?int $existingUserId = null): array
{
    $email = $payload['email'] ?? '';
    $phone = $payload['phone'] ?? '';
    $username = $payload['username'] ?? '';
    $password = $payload['password'] ?? '';

    if ($existingUserId) {
        $fields = [];
        $types = '';
        $params = [];

        if ($email !== '') {
            $fields[] = 'email = ?';
            $types .= 's';
            $params[] = $email;
        }
        if ($phone !== '') {
            $fields[] = 'telefono = ?';
            $types .= 's';
            $params[] = $phone;
        }
        if ($username !== '') {
            if (!isUniqueUsername($conn, $username, $existingUserId)) {
                jsonResponse(false, 'El nombre de usuario ya existe');
            }
            $fields[] = 'usuario = ?';
            $types .= 's';
            $params[] = $username;
        }
        if ($password !== '') {
            $fields[] = 'password_hash = ?';
            $types .= 's';
            $params[] = password_hash($password, PASSWORD_BCRYPT);
        }

        if ($fields) {
            $sql = 'UPDATE usuario SET ' . implode(', ', $fields) . ' WHERE id_usuario = ?';
            $types .= 'i';
            $params[] = $existingUserId;

            $stmt = $conn->prepare($sql);
            bindStatementParams($stmt, $types, $params);
            $stmt->execute();
            $stmt->close();
        }

        return ['id_usuario' => $existingUserId];
    }

    if ($email === '' && $phone === '' && $username === '') {
        return ['id_usuario' => null];
    }

    $finalUsername = $username !== '' ? $username : generateUsername($conn, $payload['name'] ?? $email);
    if (!isUniqueUsername($conn, $finalUsername)) {
        $finalUsername = makeUniqueUsername($conn, $finalUsername);
    }

    $plainPassword = $password !== '' ? $password : generateTemporaryPassword();
    $passwordHash = password_hash($plainPassword, PASSWORD_BCRYPT);

    $stmt = $conn->prepare('
        INSERT INTO usuario (usuario, password_hash, email, telefono, activo)
        VALUES (?, ?, ?, ?, 1)
    ');
    $stmt->bind_param('ssss', $finalUsername, $passwordHash, $email, $phone);

    if (!$stmt->execute()) {
        jsonResponse(false, 'Error al crear usuario de empleado: ' . $stmt->error);
    }

    $userId = $stmt->insert_id;
    $stmt->close();

    return [
        'id_usuario' => (int)$userId,
        'generated_credentials' => [
            'username' => $finalUsername,
            'password' => $password === '' ? $plainPassword : null
        ]
    ];
}

function isUniqueUsername(mysqli $conn, string $username, ?int $excludeId = null): bool
{
    $sql = 'SELECT 1 FROM usuario WHERE usuario = ?';
    if ($excludeId) {
        $sql .= ' AND id_usuario != ?';
    }

    $stmt = $conn->prepare($sql . ' LIMIT 1');
    if ($excludeId) {
        $stmt->bind_param('si', $username, $excludeId);
    } else {
        $stmt->bind_param('s', $username);
    }
    $stmt->execute();
    $stmt->store_result();
    $exists = $stmt->num_rows > 0;
    $stmt->close();
    return !$exists;
}

function generateUsername(mysqli $conn, string $base): string
{
    $base = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '.', $base)));
    $base = trim($base, '.');
    if ($base === '') {
        $base = 'usuario';
    }
    if (isUniqueUsername($conn, $base)) {
        return $base;
    }
    return makeUniqueUsername($conn, $base);
}

function makeUniqueUsername(mysqli $conn, string $base): string
{
    $suffix = 1;
    $candidate = $base;
    while (!isUniqueUsername($conn, $candidate)) {
        $candidate = $base . $suffix;
        $suffix++;
    }
    return $candidate;
}

function generateTemporaryPassword(int $length = 10): string
{
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$!%*?&';
    $password = '';
    $max = strlen($chars) - 1;
    for ($i = 0; $i < $length; $i++) {
        $password .= $chars[random_int(0, $max)];
    }
    return $password;
}

function bindStatementParams(mysqli_stmt $stmt, string $types, array &$params): void
{
    $bindParams = [];
    $bindParams[] = &$types;
    foreach ($params as $key => $value) {
        $bindParams[] = &$params[$key];
    }
    call_user_func_array([$stmt, 'bind_param'], $bindParams);
}