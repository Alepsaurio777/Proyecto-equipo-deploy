# Pruebas de Endpoints - API Ferretería

## 1. TEST LOGIN

### Login con usuario admin

```bash
curl -X POST http://localhost/Proyecto-de-Equipo/api/login.php \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"password\"}"
```

### Login con usuario supervisor

```bash
curl -X POST http://localhost/Proyecto-de-Equipo/api/login.php \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"supervisor\",\"password\":\"password\"}"
```

## 2. TEST PRODUCTOS

### Listar productos activos

```bash
curl http://localhost/Proyecto-de-Equipo/api/products.php
```

### Listar productos inactivos

```bash
curl "http://localhost/Proyecto-de-Equipo/api/products.php?status=inactive"
```

### Crear producto nuevo

```bash
curl -X POST http://localhost/Proyecto-de-Equipo/api/products.php \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"TEST-001\",\"name\":\"Producto de Prueba\",\"category\":\"Herramientas\",\"price\":150.00,\"stock\":20,\"min_stock\":5,\"max_stock\":50,\"location\":\"Pasillo A\",\"description\":\"Producto creado para pruebas\"}"
```

### Actualizar producto

```bash
curl -X PUT http://localhost/Proyecto-de-Equipo/api/products.php \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"code\":\"MART-001\",\"name\":\"Martillo Actualizado\",\"category\":\"Herramientas\",\"price\":349.99,\"stock\":30,\"min_stock\":10,\"max_stock\":50,\"location\":\"Pasillo A - Estante 2\"}"
```

### Desactivar producto

```bash
curl -X DELETE http://localhost/Proyecto-de-Equipo/api/products.php \
  -H "Content-Type: application/json" \
  -d "{\"id\":5}"
```

## 3. TEST TRANSACCIONES

### Listar todas las transacciones

```bash
curl http://localhost/Proyecto-de-Equipo/api/transactions.php
```

### Crear transacción de entrada

```bash
curl -X POST http://localhost/Proyecto-de-Equipo/api/transactions.php \
  -H "Content-Type: application/json" \
  -d "{\"productId\":1,\"quantity\":15,\"type\":\"entrada\",\"reason\":\"Reabastecimiento mensual\",\"userId\":1}"
```

### Crear transacción de salida

```bash
curl -X POST http://localhost/Proyecto-de-Equipo/api/transactions.php \
  -H "Content-Type: application/json" \
  -d "{\"productId\":2,\"quantity\":5,\"type\":\"salida\",\"reason\":\"Venta cliente\",\"userId\":2}"
```

### Aprobar transacción

```bash
curl -X PUT http://localhost/Proyecto-de-Equipo/api/transactions.php \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"status\":\"aprobada\",\"userId\":1}"
```

### Rechazar transacción

```bash
curl -X PUT http://localhost/Proyecto-de-Equipo/api/transactions.php \
  -H "Content-Type: application/json" \
  -d "{\"id\":2,\"status\":\"rechazada\",\"userId\":1}"
```

## 4. TEST EMPLEADOS

### Listar todos los empleados

```bash
curl http://localhost/Proyecto-de-Equipo/api/employees.php
```

### Listar empleados activos

```bash
curl "http://localhost/Proyecto-de-Equipo/api/employees.php?status=active"
```

### Buscar empleados

```bash
curl "http://localhost/Proyecto-de-Equipo/api/employees.php?search=admin"
```

### Crear empleado nuevo

```bash
curl -X POST http://localhost/Proyecto-de-Equipo/api/employees.php \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Juan Pérez\",\"position\":\"Vendedor\",\"email\":\"juan@ferreteria.com\",\"phone\":\"555-9999\",\"salary\":8500.00,\"status\":\"active\",\"hire_date\":\"2024-11-01\",\"address\":\"Calle Nueva 100\"}"
```

### Actualizar empleado

```bash
curl -X PUT http://localhost/Proyecto-de-Equipo/api/employees.php \
  -H "Content-Type: application/json" \
  -d "{\"id\":1,\"name\":\"Administrador General\",\"position\":\"Administrador del Sistema\",\"salary\":16000.00}"
```

### Desactivar empleado

```bash
curl -X DELETE http://localhost/Proyecto-de-Equipo/api/employees.php?id=4
```

## NOTAS IMPORTANTES

### Contraseñas por defecto

Los usuarios de prueba tienen la contraseña: **password**

El hash usado es: `$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`

### Verificar que Apache está corriendo

```bash
# Windows (PowerShell)
Get-Service | Where-Object {$_.Name -like "*apache*"}

# Linux/WSL
sudo systemctl status apache2
```

### Verificar que MySQL está corriendo

```bash
# Windows (PowerShell)
Get-Service | Where-Object {$_.Name -like "*mysql*"}

# Linux/WSL
sudo systemctl status mysql
```

### Ver logs de errores de PHP

```bash
# XAMPP Windows
tail -f C:/xampp/apache/logs/error.log

# Linux
tail -f /var/log/apache2/error.log
```

### Probar desde el navegador

También puedes abrir directamente en el navegador:

- http://localhost/Proyecto-de-Equipo/api/products.php
- http://localhost/Proyecto-de-Equipo/api/transactions.php
- http://localhost/Proyecto-de-Equipo/api/employees.php
