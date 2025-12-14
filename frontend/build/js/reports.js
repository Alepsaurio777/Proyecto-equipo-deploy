// ==================== MÓDULO DE REPORTES ====================

function renderReportsModule() {
  const content = document.getElementById("mainContent");

  // Calcular KPIs
  const totalProducts = AppState.products.length;
  const totalEntries = AppState.transactions.filter(t => t.type === "entrada").length;
  const totalMovements = AppState.transactions.length;
  const totalExits = AppState.transactions.filter(t => t.type === "salida").length;
  const stockValue = AppState.products.reduce((sum, p) => sum + p.stock * p.price, 0);

  content.innerHTML = `
        <div class="content-header-actions">
            <div>
                <h2>Reportes de Inventario</h2>
                <p class="text-muted">Analiza el estado y movimientos del inventario</p>
            </div>
            <button class="btn btn-primary" onclick="showExportModal()">
                <svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Exportar Reporte
            </button>
        </div>

        <style>
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
          }

          @media (max-width: 1024px) {
            .kpi-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 0.8rem;
            }
          }

          @media (max-width: 768px) {
            .kpi-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 0.8rem;
              margin-bottom: 1.5rem;
            }
          }

          @media (max-width: 480px) {
            .kpi-grid {
              grid-template-columns: 1fr;
              gap: 0.8rem;
              margin-bottom: 1.5rem;
            }
          }

          .kpi-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            flex-direction: column;
          }

          .kpi-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }

          .kpi-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            gap: 0.5rem;
          }

          .kpi-label {
            font-size: 0.85rem;
            color: #888;
            font-weight: 500;
            flex: 1;
          }

          .kpi-icon {
            font-size: 1.3rem;
            flex-shrink: 0;
          }

          .kpi-value {
            font-size: 2rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 0.5rem;
            word-break: break-word;
          }

          .kpi-subtitle {
            font-size: 0.85rem;
            color: #999;
          }

          @media (max-width: 768px) {
            .kpi-card {
              padding: 1.2rem;
            }

            .kpi-label {
              font-size: 0.8rem;
            }

            .kpi-value {
              font-size: 1.75rem;
            }

            .kpi-icon {
              font-size: 1.2rem;
            }

            .kpi-subtitle {
              font-size: 0.8rem;
            }
          }

          @media (max-width: 480px) {
            .kpi-card {
              padding: 1rem;
            }

            .kpi-header {
              margin-bottom: 0.8rem;
            }

            .kpi-label {
              font-size: 0.75rem;
            }

            .kpi-value {
              font-size: 1.5rem;
            }

            .kpi-icon {
              font-size: 1.1rem;
            }

            .kpi-subtitle {
              font-size: 0.75rem;
            }
          }

          .reports-filters-container {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            align-items: center;
          }

          @media (max-width: 768px) {
            .reports-filters-container {
              flex-direction: column;
              gap: 0.8rem;
            }

            .reports-filters-container > * {
              width: 100%;
            }
          }

          .reports-table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .reports-table {
            min-width: 600px;
          }

          @media (max-width: 768px) {
            .reports-table th,
            .reports-table td {
              padding: 0.75rem 0.5rem;
              font-size: 0.9rem;
            }
          }

          @media (max-width: 480px) {
            .reports-table th,
            .reports-table td {
              padding: 0.5rem 0.3rem;
              font-size: 0.85rem;
            }
          }
        </style>

        <div class="kpi-grid">
            <div class="kpi-card" style="border-left-color: #4CAF50;">
                <div class="kpi-header">
                    <span class="kpi-label">Valor Total</span>
                    <span class="kpi-icon">💰</span>
                </div>
                <div class="kpi-value">${formatCurrency(stockValue)}</div>
                <div class="kpi-subtitle">${totalProducts} productos</div>
            </div>

            <div class="kpi-card" style="border-left-color: #2196F3;">
                <div class="kpi-header">
                    <span class="kpi-label">Total Entradas</span>
                    <span class="kpi-icon">📈</span>
                </div>
                <div class="kpi-value">${totalEntries}</div>
                <div class="kpi-subtitle">Movimientos de entrada</div>
            </div>

            <div class="kpi-card" style="border-left-color: #FF9800;">
                <div class="kpi-header">
                    <span class="kpi-label">Movimientos</span>
                    <span class="kpi-icon">🔄</span>
                </div>
                <div class="kpi-value">${totalMovements}</div>
                <div class="kpi-subtitle">Últimos 7 días</div>
            </div>

            <div class="kpi-card" style="border-left-color: #F44336;">
                <div class="kpi-header">
                    <span class="kpi-label">Total Salidas</span>
                    <span class="kpi-icon">⚠️</span>
                </div>
                <div class="kpi-value">${totalExits}</div>
                <div class="kpi-subtitle">Movimientos de salida</div>
            </div>
        </div>

        <div class="tabs">
            <div class="tab-list">
                <button class="tab-button active" data-tab="movements">
                    � Todos los Movimientos de Inventario
                </button>
                <button class="tab-button" data-tab="stock">
                    � Stock Bajo
                </button>
                <button class="tab-button" data-tab="category">
                    📊 Por Categoría
                </button>
            </div>

            <div id="movementsTab" class="tab-content active">
                ${renderMovementsReport()}
            </div>

            <div id="stockTab" class="tab-content">
                ${renderLowStockReport()}
            </div>

            <div id="categoryTab" class="tab-content">
                ${renderCategoryReport()}
            </div>
        </div>
    `;

  setupTabListeners();
  setupReportsFilters();
}

function renderLowStockReport() {
  const lowStockProducts = AppState.products.filter(
    (p) => p.stock <= (p.min_stock || p.minStock || 0)
  );

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

  lowStockProducts.forEach((product) => {
    const minStock = product.min_stock || product.minStock || 0;
    const deficit = minStock - product.stock;

    html += `
            <tr>
                <td><strong>${product.code}</strong></td>
                <td>${product.name}</td>
                <td><span class="badge badge-primary">${
                  product.category
                }</span></td>
                <td class="text-danger"><strong>${product.stock}</strong></td>
                <td>${minStock}</td>
                <td class="text-warning"><strong>${
                  deficit > 0 ? deficit : 0
                }</strong></td>
                <td>${product.location}</td>
            </tr>
        `;
  });

  html += "</tbody></table></div></div>";
  return html;
}

function renderMovementsReport() {
  const recentTransactions = AppState.transactions
    .sort(
      (a, b) =>
        new Date(b.created_at || b.date) - new Date(a.created_at || a.date)
    )
    .slice(0, 50);

  if (recentTransactions.length === 0) {
    return '<div class="empty-state"><div class="empty-state-icon">🔄</div><p>No hay movimientos registrados</p></div>';
  }

  // Generar opciones de categorías
  const categories = [...new Set(AppState.products.map(p => p.category))].sort();
  let categoryOptions = '<option value="">Todas las categorías</option>';
  categories.forEach(cat => {
    if (cat) categoryOptions += `<option value="${cat}">${cat}</option>`;
  });

  let html = `
        <div class="card" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; font-size: 1.2rem;">Todos los Movimientos de Inventario</h3>
                <div class="reports-filters-container">
                    <input id="reportsSearchInput" type="text" placeholder="Buscar por producto, código o empleado" style="padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 4px; flex: 1; min-width: 200px; font-size: 0.9rem;">
                    <select id="reportsTimeFilter" style="padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                        <option value="all">Todo el tiempo</option>
                        <option value="week">Semana</option>
                        <option value="month">Mes</option>
                        <option value="year">Año</option>
                    </select>
                    <select id="reportsTypeFilter" style="padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                        <option value="">Todos</option>
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                    </select>
                    <select id="reportsCategoryFilter" style="padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                        ${categoryOptions}
                    </select>
                </div>
            </div>
            <div class="reports-table-wrapper">
                <table id="reportsMovementsTable" class="reports-table" style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #f5f5f5; border-bottom: 1px solid #ddd;">
                        <tr>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #333;">Fecha y Hora</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #333;">Código</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #333;">Producto</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #333;">Tipo</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #333;">Cantidad</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #333;">Empleado</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #333;">Motivo</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600; color: #333;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

  recentTransactions.forEach((transaction) => {
    const typeClass = transaction.type === "entrada" ? "#FFF3E0" : "#FCE4EC";
    const typeBadgeClass = transaction.type === "entrada" ? "background: #FFB74D; color: white;" : "background: #EF5350; color: white;";
    const statusClass =
      transaction.status === "aprobada"
        ? "background: #4CAF50; color: white;"
        : transaction.status === "rechazada"
        ? "background: #F44336; color: white;"
        : "background: #FF9800; color: white;";

    const productName = transaction.product_name || transaction.productName || "";
    const productCode = transaction.product_code || transaction.productCode || "";
    const createdBy = transaction.created_by_name || transaction.createdBy || "";
    const transDate = transaction.created_at || transaction.date;
    const reason = transaction.reason || transaction.motivo || "-";

    html += `
            <tr style="border-bottom: 1px solid #eee; background: ${typeClass};">
                <td style="padding: 1rem;">${formatDate(transDate)}</td>
                <td style="padding: 1rem;"><strong style="color: #333;">${productCode}</strong></td>
                <td style="padding: 1rem;">
                    <div style="font-weight: 600; color: #333;">${productName}</div>
                </td>
                <td style="padding: 1rem;"><span style="${typeBadgeClass} padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">${transaction.type.toUpperCase()}</span></td>
                <td style="padding: 1rem;"><strong>${transaction.quantity}</strong></td>
                <td style="padding: 1rem; color: #666;">${createdBy}</td>
                <td style="padding: 1rem; color: #666;">${reason}</td>
                <td style="padding: 1rem;"><span style="${statusClass} padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">${transaction.status.toUpperCase()}</span></td>
            </tr>
        `;
  });

  html += "</tbody></table></div></div>";
  return html;
}

function renderCategoryReport() {
  const categoryStats = {};

  (AppState.categories || []).forEach((category) => {
    const products = AppState.products.filter((p) => p.category === category);
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

    categoryStats[category] = {
      products: products.length,
      stock: totalStock,
      value: totalValue,
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
  const totals = Object.values(categoryStats).reduce(
    (acc, curr) => ({
      products: acc.products + curr.products,
      stock: acc.stock + curr.stock,
      value: acc.value + curr.value,
    }),
    { products: 0, stock: 0, value: 0 }
  );

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

// ==================== FUNCIONES DE FILTRADO DE REPORTES ====================

function setupReportsFilters() {
  const searchInput = document.getElementById("reportsSearchInput");
  const timeFilter = document.getElementById("reportsTimeFilter");
  const typeFilter = document.getElementById("reportsTypeFilter");
  const categoryFilter = document.getElementById("reportsCategoryFilter");

  if (!searchInput || !timeFilter || !typeFilter || !categoryFilter) return;

  // Guardar todas las transacciones originales en un almacén temporal
  AppState.allTransactions = [...AppState.transactions];

  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const timeValue = timeFilter.value;
    const typeValue = typeFilter.value;
    const categoryValue = categoryFilter.value;

    let filtered = [...AppState.allTransactions];

    // Filtro por tiempo
    if (timeValue !== "all") {
      const now = new Date();
      let cutoffDate = new Date();

      if (timeValue === "week") {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (timeValue === "month") {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (timeValue === "year") {
        cutoffDate.setFullYear(now.getFullYear() - 1);
      }

      filtered = filtered.filter((t) => {
        const transDate = new Date(t.created_at || t.date);
        return transDate >= cutoffDate;
      });
    }

    // Filtro por tipo (entrada/salida)
    if (typeValue) {
      filtered = filtered.filter((t) => t.type === typeValue);
    }

    // Filtro por categoría
    if (categoryValue) {
      filtered = filtered.filter((t) => {
        const product = AppState.products.find(
          (p) => p.id === t.product_id || p.id === t.productId
        );
        return product && product.category === categoryValue;
      });
    }

    // Búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter((t) => {
        const productName = (
          t.product_name ||
          t.productName ||
          ""
        ).toLowerCase();
        const productCode = (
          t.product_code ||
          t.productCode ||
          ""
        ).toLowerCase();
        const createdBy = (
          t.created_by_name ||
          t.createdBy ||
          ""
        ).toLowerCase();
        const reason = (t.reason || t.motivo || "").toLowerCase();

        return (
          productName.includes(searchTerm) ||
          productCode.includes(searchTerm) ||
          createdBy.includes(searchTerm) ||
          reason.includes(searchTerm)
        );
      });
    }

    // Actualizar tabla
    updateReportsTable(filtered);
  };

  // Agregar listeners a los filtros
  searchInput.addEventListener("input", applyFilters);
  timeFilter.addEventListener("change", applyFilters);
  typeFilter.addEventListener("change", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
}

function updateReportsTable(transactions) {
  const table = document.getElementById("reportsMovementsTable");
  if (!table) return;

  const tbody = table.querySelector("tbody");
  if (!tbody) return;

  // Limpiar filas existentes
  const rows = tbody.querySelectorAll("tr");
  rows.forEach((row) => {
    if (row.style.fontWeight !== "bold") {
      row.remove();
    }
  });

  // Si no hay transacciones, mostrar mensaje
  if (transactions.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="8" style="padding: 2rem; text-align: center; color: #999;">
        No hay movimientos que coincidan con los filtros
      </td>
    `;
    tbody.appendChild(emptyRow);
    return;
  }

  // Agregar filas filtradas
  transactions.forEach((transaction) => {
    const typeClass =
      transaction.type === "entrada" ? "#FFF3E0" : "#FCE4EC";
    const typeBadgeClass =
      transaction.type === "entrada"
        ? "background: #FFB74D; color: white;"
        : "background: #EF5350; color: white;";
    const statusClass =
      transaction.status === "aprobada"
        ? "background: #4CAF50; color: white;"
        : transaction.status === "rechazada"
        ? "background: #F44336; color: white;"
        : "background: #FF9800; color: white;";

    const productName = transaction.product_name || transaction.productName || "";
    const productCode =
      transaction.product_code || transaction.productCode || "";
    const createdBy =
      transaction.created_by_name || transaction.createdBy || "";
    const transDate = transaction.created_at || transaction.date;
    const reason = transaction.reason || transaction.motivo || "-";

    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid #eee";
    row.style.background = typeClass;
    row.innerHTML = `
      <td style="padding: 1rem;">${formatDate(transDate)}</td>
      <td style="padding: 1rem;"><strong style="color: #333;">${productCode}</strong></td>
      <td style="padding: 1rem;">
        <div style="font-weight: 600; color: #333;">${productName}</div>
      </td>
      <td style="padding: 1rem;"><span style="${typeBadgeClass} padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">${transaction.type.toUpperCase()}</span></td>
      <td style="padding: 1rem;"><strong>${transaction.quantity}</strong></td>
      <td style="padding: 1rem; color: #666;">${createdBy}</td>
      <td style="padding: 1rem; color: #666;">${reason}</td>
      <td style="padding: 1rem;"><span style="${statusClass} padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">${transaction.status.toUpperCase()}</span></td>
    `;
    tbody.appendChild(row);
  });
}

// ==================== FUNCIONES DE EXPORTACIÓN ====================

function showExportModal() {
  const modal = document.getElementById("exportModal");
  // Establecer fecha de hoy como máximo
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("exportDateTo").value = today;
  document.getElementById("exportDateTo").max = today;
  document.getElementById("exportDateFrom").max = today;
  modal.classList.remove("hidden");
}

function closeExportModal() {
  document.getElementById("exportModal").classList.add("hidden");
}

function executeExport() {
  const format = document.getElementById("exportFormat").value;
  const dateFrom = document.getElementById("exportDateFrom").value;
  const dateTo = document.getElementById("exportDateTo").value;
  const reportType = document.getElementById("exportReportType").value;

  // Validar fechas
  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    showToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'", "error");
    return;
  }

  // Filtrar datos según las fechas
  let filteredData = getFilteredDataForExport(reportType, dateFrom, dateTo);
  
  if (filteredData.length === 0) {
    showToast("No hay datos para exportar en el rango de fechas seleccionado", "error");
    return;
  }

  // Exportar según el formato
  if (format === "pdf") {
    exportToPDF(reportType, filteredData, dateFrom, dateTo);
  } else {
    exportToExcel(reportType, filteredData, dateFrom, dateTo);
  }

  closeExportModal();
  showToast(`Reporte exportado exitosamente en formato ${format.toUpperCase()}`, "success");
}

function getFilteredDataForExport(reportType, dateFrom, dateTo) {
  let data = [];
  
  if (reportType === "movements") {
    data = [...AppState.transactions];
    
    // Filtrar por fechas si se especificaron
    if (dateFrom || dateTo) {
      data = data.filter(transaction => {
        const transDate = new Date(transaction.created_at || transaction.date);
        const fromDate = dateFrom ? new Date(dateFrom) : new Date('1900-01-01');
        const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : new Date();
        return transDate >= fromDate && transDate <= toDate;
      });
    }
  } else if (reportType === "stock") {
    data = AppState.products.filter(p => p.stock <= (p.min_stock || p.minStock || 0));
  } else if (reportType === "category") {
    const categoryStats = {};
    (AppState.categories || []).forEach(category => {
      const products = AppState.products.filter(p => p.category === category);
      const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
      const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
      categoryStats[category] = {
        category,
        products: products.length,
        stock: totalStock,
        value: totalValue
      };
    });
    data = Object.values(categoryStats);
  }
  
  return data;
}

function exportToPDF(reportType, data, dateFrom, dateTo) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Configuración del documento
  doc.setFontSize(16);
  doc.text('Ferretería El Tornillo', 20, 20);
  doc.setFontSize(12);
  doc.text('Reporte de ' + getReportTitle(reportType), 20, 30);
  
  // Agregar rango de fechas si se especificó
  if (dateFrom || dateTo) {
    const fromText = dateFrom ? formatDate(dateFrom) : 'Inicio';
    const toText = dateTo ? formatDate(dateTo) : 'Hoy';
    doc.text(`Período: ${fromText} - ${toText}`, 20, 40);
  }
  
  doc.text(`Generado: ${formatDate(new Date())}`, 20, dateFrom || dateTo ? 50 : 40);
  
  const startY = dateFrom || dateTo ? 60 : 50;
  
  if (reportType === "movements") {
    const tableData = data.map(t => [
      formatDate(t.created_at || t.date),
      t.product_code || t.productCode || '',
      t.product_name || t.productName || '',
      t.type.toUpperCase(),
      t.quantity.toString(),
      t.created_by_name || t.createdBy || '',
      t.status.toUpperCase()
    ]);
    
    doc.autoTable({
      head: [['Fecha', 'Código', 'Producto', 'Tipo', 'Cantidad', 'Usuario', 'Estado']],
      body: tableData,
      startY: startY,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [29, 30, 30] }
    });
  } else if (reportType === "stock") {
    const tableData = data.map(p => [
      p.code,
      p.name,
      p.category,
      p.stock.toString(),
      (p.min_stock || p.minStock || 0).toString(),
      p.location || ''
    ]);
    
    doc.autoTable({
      head: [['Código', 'Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Ubicación']],
      body: tableData,
      startY: startY,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [29, 30, 30] }
    });
  } else if (reportType === "category") {
    const tableData = data.map(c => [
      c.category,
      c.products.toString(),
      c.stock.toString(),
      formatCurrency(c.value)
    ]);
    
    doc.autoTable({
      head: [['Categoría', 'Productos', 'Stock Total', 'Valor Total']],
      body: tableData,
      startY: startY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [29, 30, 30] }
    });
  }
  
  // Descargar el PDF
  const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function exportToExcel(reportType, data, dateFrom, dateTo) {
  let worksheetData = [];
  let headers = [];
  
  if (reportType === "movements") {
    headers = ['Fecha', 'Código', 'Producto', 'Tipo', 'Cantidad', 'Usuario', 'Estado', 'Motivo'];
    worksheetData = data.map(t => [
      formatDate(t.created_at || t.date),
      t.product_code || t.productCode || '',
      t.product_name || t.productName || '',
      t.type.toUpperCase(),
      t.quantity,
      t.created_by_name || t.createdBy || '',
      t.status.toUpperCase(),
      t.reason || t.motivo || ''
    ]);
  } else if (reportType === "stock") {
    headers = ['Código', 'Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Faltante', 'Ubicación'];
    worksheetData = data.map(p => [
      p.code,
      p.name,
      p.category,
      p.stock,
      p.min_stock || p.minStock || 0,
      Math.max(0, (p.min_stock || p.minStock || 0) - p.stock),
      p.location || ''
    ]);
  } else if (reportType === "category") {
    headers = ['Categoría', 'Productos', 'Stock Total', 'Valor Total'];
    worksheetData = data.map(c => [
      c.category,
      c.products,
      c.stock,
      c.value
    ]);
  }
  
  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...worksheetData]);
  
  // Agregar información del reporte
  const reportInfo = [
    ['Ferretería El Tornillo'],
    [`Reporte de ${getReportTitle(reportType)}`],
    [`Generado: ${formatDate(new Date())}`]
  ];
  
  if (dateFrom || dateTo) {
    const fromText = dateFrom ? formatDate(dateFrom) : 'Inicio';
    const toText = dateTo ? formatDate(dateTo) : 'Hoy';
    reportInfo.push([`Período: ${fromText} - ${toText}`]);
  }
  
  reportInfo.push(['']); // Línea vacía
  
  // Combinar información del reporte con los datos
  const finalData = [...reportInfo, headers, ...worksheetData];
  const finalWs = XLSX.utils.aoa_to_sheet(finalData);
  
  XLSX.utils.book_append_sheet(wb, finalWs, getReportTitle(reportType));
  
  // Descargar el archivo Excel
  const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function getReportTitle(reportType) {
  const titles = {
    movements: 'Movimientos de Inventario',
    stock: 'Stock Bajo',
    category: 'Por Categoría'
  };
  return titles[reportType] || 'Reporte';
}
