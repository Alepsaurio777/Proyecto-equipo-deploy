// ==================== MÓDULO DE REPORTES ====================

function renderReportsModule() {
    const content = document.getElementById('mainContent');
    
    // Calcular KPIs
    const totalProducts = AppState.products.length;
    const totalStock = AppState.products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockProducts = AppState.products.filter(p => p.stock <= p.minStock);
    const stockValue = AppState.products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    
    content.innerHTML = `
        <div class="content-header">
            <h2>Reportes de Inventario</h2>
            <p class="text-muted">Análisis y estadísticas del sistema</p>
        </div>

        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-label">Total Productos</span>
                    <span class="kpi-icon">📦</span>
                </div>
                <div class="kpi-value">${totalProducts}</div>
                <div class="kpi-description">Productos registrados</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-label">Stock Total</span>
                    <span class="kpi-icon">📊</span>
                </div>
                <div class="kpi-value">${totalStock}</div>
                <div class="kpi-description">Unidades en inventario</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-label">Stock Bajo</span>
                    <span class="kpi-icon">⚠️</span>
                </div>
                <div class="kpi-value text-warning">${lowStockProducts.length}</div>
                <div class="kpi-description">Requieren reposición</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-label">Valor Inventario</span>
                    <span class="kpi-icon">💰</span>
                </div>
                <div class="kpi-value" style="font-size: 1.5rem;">${formatCurrency(stockValue)}</div>
                <div class="kpi-description">Valor total del stock</div>
            </div>
        </div>

        <div class="tabs">
            <div class="tab-list">
                <button class="tab-button active" data-tab="stock">
                    📉 Stock Bajo
                </button>
                <button class="tab-button" data-tab="movements">
                    🔄 Movimientos Recientes
                </button>
                <button class="tab-button" data-tab="category">
                    📊 Por Categoría
                </button>
            </div>

            <div id="stockTab" class="tab-content active">
                ${renderLowStockReport()}
            </div>

            <div id="movementsTab" class="tab-content">
                ${renderMovementsReport()}
            </div>

            <div id="categoryTab" class="tab-content">
                ${renderCategoryReport()}
            </div>
        </div>
    `;
    
    setupTabListeners();
}

function renderLowStockReport() {
    const lowStockProducts = AppState.products.filter(p => p.stock <= p.minStock);
    
    if (lowStockProducts.length === 0) {
        return '<div class="empty-state"><div class="empty-state-icon">✓</div><p>No hay productos con stock bajo</p></div>';
    }
    
    let html = `
        <div class="card">
            <h3 style="margin-bottom: 1rem;">Productos que Requieren Reposición</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Faltante</th>
                            <th>Ubicación</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    lowStockProducts.forEach(product => {
        const deficit = product.minStock - product.stock;
        
        html += `
            <tr>
                <td><strong>${product.code}</strong></td>
                <td>${product.name}</td>
                <td><span class="badge badge-primary">${product.category}</span></td>
                <td class="text-danger"><strong>${product.stock}</strong></td>
                <td>${product.minStock}</td>
                <td class="text-warning"><strong>${deficit > 0 ? deficit : 0}</strong></td>
                <td>${product.location}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div></div>';
    return html;
}

function renderMovementsReport() {
    const recentTransactions = AppState.transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);
    
    if (recentTransactions.length === 0) {
        return '<div class="empty-state"><div class="empty-state-icon">🔄</div><p>No hay movimientos registrados</p></div>';
    }
    
    let html = `
        <div class="card">
            <h3 style="margin-bottom: 1rem;">Últimos 20 Movimientos</h3>
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
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    recentTransactions.forEach(transaction => {
        const typeClass = transaction.type === 'entrada' ? 'badge-success' : 'badge-warning';
        const statusClass = transaction.status === 'aprobada' ? 'badge-success' : 
                           transaction.status === 'rechazada' ? 'badge-danger' : 'badge-warning';
        
        html += `
            <tr>
                <td>${formatDate(transaction.date)}</td>
                <td><span class="badge ${typeClass}">${transaction.type.toUpperCase()}</span></td>
                <td>${transaction.productName} <small>(${transaction.productCode})</small></td>
                <td><strong>${transaction.quantity}</strong></td>
                <td>${transaction.createdBy}</td>
                <td><span class="badge ${statusClass}">${transaction.status}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div></div>';
    return html;
}

function renderCategoryReport() {
    const categoryStats = {};
    
    (AppState.categories || []).forEach(category => {
        const products = AppState.products.filter(p => p.category === category);
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
        
        categoryStats[category] = {
            products: products.length,
            stock: totalStock,
            value: totalValue
        };
    });
    
    let html = `
        <div class="card">
            <h3 style="margin-bottom: 1rem;">Inventario por Categoría</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th>Productos</th>
                            <th>Stock Total</th>
                            <th>Valor Total</th>
                            <th>Promedio/Producto</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    Object.entries(categoryStats).forEach(([category, stats]) => {
        const avgValue = stats.products > 0 ? stats.value / stats.products : 0;
        
        html += `
            <tr>
                <td><span class="badge badge-primary">${category}</span></td>
                <td><strong>${stats.products}</strong></td>
                <td>${stats.stock}</td>
                <td>${formatCurrency(stats.value)}</td>
                <td>${formatCurrency(avgValue)}</td>
            </tr>
        `;
    });
    
    // Total
    const totals = Object.values(categoryStats).reduce((acc, curr) => ({
        products: acc.products + curr.products,
        stock: acc.stock + curr.stock,
        value: acc.value + curr.value
    }), { products: 0, stock: 0, value: 0 });
    
    html += `
                        <tr style="font-weight: bold; background: var(--gray-50);">
                            <td>TOTAL</td>
                            <td>${totals.products}</td>
                            <td>${totals.stock}</td>
                            <td>${formatCurrency(totals.value)}</td>
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return html;
}
