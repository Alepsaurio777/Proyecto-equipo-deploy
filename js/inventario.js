// JavaScript para módulo de inventario

function showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover clase active de botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar tab seleccionado
    document.getElementById(tabName).classList.add('active');
    
    // Activar botón correspondiente
    event.target.classList.add('active');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    
    // Limpiar formulario si es de producto
    if (modalId === 'modalProducto') {
        document.getElementById('formProducto').reset();
        document.getElementById('productoId').value = '';
        document.getElementById('tituloModalProducto').textContent = 'Nuevo Producto';
        document.getElementById('formProducto').action = 'agregar_producto_inventario.php';
    }
    
    // Limpiar formulario si es de movimiento
    if (modalId === 'modalMovimiento') {
        document.getElementById('formMovimiento').reset();
    }
}

function filtrarProductos() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoria').value;
    const filas = document.querySelectorAll('#tablaProductos tbody tr');
    
    filas.forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        const categoriaFila = fila.dataset.categoria;
        
        const coincideBusqueda = texto.includes(busqueda);
        const coincideCategoria = !categoria || categoriaFila === categoria;
        
        if (coincideBusqueda && coincideCategoria) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

function editarProducto(id) {
    // Aquí cargarías los datos del producto para editar
    document.getElementById('tituloModalProducto').textContent = 'Editar Producto';
    document.getElementById('formProducto').action = 'modificar_producto_inventario.php';
    document.getElementById('productoId').value = id;
    showModal('modalProducto');
}

function eliminarProducto(id) {
    window.location.href = `eliminar_producto_inventario.php?id=${id}`;
}

function aprobarMovimiento(id) {
    window.location.href = `aprobar_movimiento_inventario.php?id=${id}&action=aprobar`;
}

function rechazarMovimiento(id) {
    window.location.href = `aprobar_movimiento_inventario.php?id=${id}&action=rechazar`;
}

function eliminarMovimiento(id) {
    window.location.href = `eliminar_movimiento_inventario.php?id=${id}`;
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.add('hidden');
    }
}