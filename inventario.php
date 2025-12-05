<?php
require_once 'api/config.php';
session_start();

// Verificar autenticación (simplificado)
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$conn = getConnection();

// Obtener productos
$productos_sql = "SELECT p.*, c.nombre_categoria FROM producto p LEFT JOIN categoria c ON p.id_categoria = c.id_categoria WHERE p.activo = 1 ORDER BY p.nombre_producto";
$productos = $conn->query($productos_sql);

// Obtener movimientos
$movimientos_sql = "
    SELECT m.*, p.codigo AS codigo_producto, p.nombre_producto, 
           u.usuario AS creado_por_usuario, e.nombre_completo AS empleado_nombre
    FROM movimiento_inventario m
    INNER JOIN producto p ON p.id_producto = m.id_producto
    LEFT JOIN usuario u ON u.id_usuario = m.creado_por
    LEFT JOIN empleado e ON e.id_empleado = m.id_empleado
    ORDER BY m.fecha_movimiento DESC
";
$movimientos = $conn->query($movimientos_sql);

// Obtener categorías para el filtro
$categorias_sql = "SELECT DISTINCT nombre_categoria FROM categoria ORDER BY nombre_categoria";
$categorias = $conn->query($categorias_sql);
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Inventario</title>
    <link rel="stylesheet" href="css/inventario.css">
</head>

<body>
    <!-- ==================== APLICACIÓN PRINCIPAL ==================== -->
    <div id="mainApp" class="main-app">
        <?php include 'includes/header.php'; ?>

        <!-- Main Layout -->
        <div class="main-layout">
            <?php include 'includes/sidebar.php'; ?>

            <!-- Main Content -->
            <main class="main-content">
                <div class="content-header-actions">
                    <div>
                        <h2>Gestión de Inventario</h2>
                        <p class="text-muted">Administra productos y movimientos</p>
                    </div>
                </div>

        <div class="tabs">
            <div class="tab-list">
                <button class="tab-button active" data-tab="products" onclick="showTab('productos')">📦 Productos</button>
                <button class="tab-button" data-tab="movements" onclick="showTab('movimientos')">🔄 Movimientos</button>
            </div>

            <!-- TAB PRODUCTOS -->
            <div id="productos" class="tab-content active">
                <div class="content-header-actions" style="margin-bottom: 1rem;">
                    <div></div>
                    <button class="btn btn-primary" onclick="showModal('modalProducto')">
                        <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Nuevo Producto
                    </button>
                </div>
                <div class="card" style="margin-bottom: 1rem;">
                    <div class="form-group" style="margin-bottom: 0; display: flex; gap: 1rem;">
                        <div style="flex: 1;">
                            <input type="text" id="buscarProducto" class="form-input" placeholder="Buscar por nombre o código..." onkeyup="filtrarProductos()">
                        </div>
                        <select id="filtroCategoria" class="form-select" style="width: 200px;" onchange="filtrarProductos()">
                            <option value="">Todas las categorías</option>
                            <?php while ($cat = $categorias->fetch_assoc()): ?>
                                <option value="<?= htmlspecialchars($cat['nombre_categoria']) ?>">
                                    <?= htmlspecialchars($cat['nombre_categoria']) ?>
                                </option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                </div>

                <div class="table-container">
                    <table id="tablaProductos">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Stock</th>
                                <th>Precio</th>
                                <th>Ubicación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php while ($producto = $productos->fetch_assoc()): ?>
                                <tr data-categoria="<?= htmlspecialchars($producto['nombre_categoria'] ?? '') ?>">
                                    <td><strong><?= htmlspecialchars($producto['codigo']) ?></strong></td>
                                    <td><?= htmlspecialchars($producto['nombre_producto']) ?></td>
                                    <td><span class="badge"><?= htmlspecialchars($producto['nombre_categoria'] ?? 'Sin categoría') ?></span></td>
                                    <td class="<?= $producto['stock_actual'] <= $producto['stock_minimo'] ? 'text-danger' : 'text-success' ?>">
                                        <strong><?= $producto['stock_actual'] ?></strong> / <?= $producto['stock_maximo'] ?>
                                    </td>
                                    <td>$<?= number_format($producto['precio'], 2) ?></td>
                                    <td><?= htmlspecialchars($producto['ubicacion']) ?></td>
                                    <td>
                                        <button class="btn btn-sm btn-edit" onclick="editarProducto(<?= $producto['id_producto'] ?>)">✏️</button>
                                        <button class="btn btn-sm btn-delete" onclick="eliminarProducto(<?= $producto['id_producto'] ?>)">🗑️</button>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAB MOVIMIENTOS -->
            <div id="movimientos" class="tab-content">
                <div class="content-header-actions" style="margin-bottom: 1rem;">
                    <div></div>
                    <button class="btn btn-primary" onclick="showModal('modalMovimiento')">
                        <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Registrar Movimiento
                    </button>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Usuario</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php while ($mov = $movimientos->fetch_assoc()): ?>
                                <tr>
                                    <td><?= date('d/m/Y H:i', strtotime($mov['fecha_movimiento'])) ?></td>
                                    <td><span class="badge badge-<?= $mov['tipo_movimiento'] == 'entrada' ? 'success' : 'warning' ?>">
                                            <?= strtoupper($mov['tipo_movimiento']) ?>
                                        </span></td>
                                    <td><?= htmlspecialchars($mov['nombre_producto']) ?> <small>(<?= htmlspecialchars($mov['codigo_producto']) ?>)</small></td>
                                    <td><strong><?= $mov['cantidad'] ?></strong></td>
                                    <td><?= htmlspecialchars($mov['creado_por_usuario']) ?></td>
                                    <td><span class="badge badge-<?=
                                                                    $mov['status'] == 'aprobada' ? 'success' : ($mov['status'] == 'rechazada' ? 'danger' : 'warning')
                                                                    ?>"><?= ucfirst($mov['status']) ?></span></td>
                                    <td>
                                        <?php if ($mov['status'] == 'pendiente'): ?>
                                            <button class="btn btn-sm btn-success" onclick="aprobarMovimiento(<?= $mov['id_movimiento'] ?>)">✓</button>
                                            <button class="btn btn-sm btn-danger" onclick="rechazarMovimiento(<?= $mov['id_movimiento'] ?>)">✗</button>
                                        <?php endif; ?>
                                        <button class="btn btn-sm btn-delete" onclick="eliminarMovimiento(<?= $mov['id_movimiento'] ?>)">🗑️</button>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
            </main>
        </div>
    </div>

    <!-- ==================== MODAL: PRODUCTO ==================== -->
    <div id="modalProducto" class="modal-overlay hidden">
        <div class="modal">
            <div class="modal-header">
                <h3 id="tituloModalProducto">Nuevo Producto</h3>
            </div>
            <div class="modal-body">
                <form id="formProducto" action="agregar_producto_inventario.php" method="POST">
                    <input type="hidden" id="productoId" name="id">
                    <div class="form-group">
                        <label class="form-label">Nombre del Producto *</label>
                        <input type="text" name="nombre" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Código *</label>
                        <input type="text" name="codigo" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categoría *</label>
                        <input type="text" name="categoria" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stock Actual</label>
                        <input type="number" name="stock" class="form-input" value="0" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stock Mínimo</label>
                        <input type="number" name="stock_minimo" class="form-input" value="0" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stock Máximo</label>
                        <input type="number" name="stock_maximo" class="form-input" value="100" min="1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Precio</label>
                        <input type="number" name="precio" class="form-input" value="0" min="0.01" step="0.01">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ubicación</label>
                        <input type="text" name="ubicacion" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descripción</label>
                        <textarea name="descripcion" class="form-textarea"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="hideModal('modalProducto')">Cancelar</button>
                <button type="submit" form="formProducto" class="btn btn-primary">Guardar</button>
            </div>
        </div>
    </div>

    <!-- ==================== MODAL: TRANSACCIÓN ==================== -->
    <div id="modalMovimiento" class="modal-overlay hidden">
        <div class="modal">
            <div class="modal-header">
                <h3>Registrar Movimiento</h3>
            </div>
            <div class="modal-body">
                <form id="formMovimiento" action="agregar_movimiento_inventario.php" method="POST">
                    <div class="form-group">
                        <label class="form-label">Tipo de Movimiento *</label>
                        <select name="tipo" class="form-select" required>
                            <option value="">Selecciona el tipo</option>
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Producto *</label>
                        <select name="producto_id" class="form-select" required>
                            <option value="">Selecciona un producto</option>
                            <?php
                            $productos->data_seek(0);
                            while ($prod = $productos->fetch_assoc()):
                            ?>
                                <option value="<?= $prod['id_producto'] ?>">
                                    <?= htmlspecialchars($prod['nombre_producto']) ?> (<?= htmlspecialchars($prod['codigo']) ?>)
                                </option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cantidad *</label>
                        <input type="number" name="cantidad" class="form-input" min="1" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Motivo</label>
                        <textarea name="motivo" class="form-textarea"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="hideModal('modalMovimiento')">Cancelar</button>
                <button type="submit" form="formMovimiento" class="btn btn-primary">Registrar</button>
            </div>
        </div>
    </div>

    <script src="js/inventario.js"></script>
</body>

</html>

<?php $conn->close(); ?>