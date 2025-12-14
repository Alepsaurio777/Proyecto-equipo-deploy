/**
 * Módulo de UI de Inventario
 * Maneja el renderizado de tablas, modales y DOM.
 */

let currentEditingProduct = null;

// ==================== MODALES ====================

function closeProductModal() {
    document.getElementById("productModal").classList.add("hidden");
    currentEditingProduct = null;
}

function showProductModal(productId = null, context = "active") {
    currentEditingProduct = productId;
    const modal = document.getElementById("productModal");
    const title = document.getElementById("productModalTitle");
    if (productId) {
        const productSource =
            context === "inactive" ? AppState.inactiveProducts : AppState.products;
        const product = productSource.find((p) => p.id === parseInt(productId, 10));
        if (!product) return;
        title.textContent = "Editar Producto";
        document.getElementById("productName").value = product.name;
        document.getElementById("productCode").value = product.code;
        document.getElementById("productCategory").value = product.category;
        document.getElementById("productStock").value = product.stock;
        document.getElementById("productMinStock").value =
            product.min_stock || product.minStock || 0;
        document.getElementById("productMaxStock").value =
            product.max_stock || product.maxStock || 100;
        document.getElementById("productPrice").value = product.price;
        document.getElementById("productLocation").value = product.location;
        document.getElementById("productDescription").value = product.description;
    } else {
        title.textContent = "Nuevo Producto";
        document.getElementById("productForm").reset();
    }
    modal.classList.remove("hidden");
}

function closeTransactionModal() {
    document.getElementById("transactionModal").classList.add("hidden");
}

function showTransactionModal() {
    const modal = document.getElementById("transactionModal");
    const productSelect = document.getElementById("transactionProduct");
    productSelect.innerHTML = '<option value="">Selecciona un producto</option>';
    AppState.products.forEach((product) => {
        productSelect.innerHTML += `<option value="${product.id}">${product.name} (${product.code})</option>`;
    });
    document.getElementById("transactionForm").reset();
    modal.classList.remove("hidden");
}


// ==================== RENDERIZADO ====================

function renderInventoryModule() {
    // Deshabilitar mensajes emergentes duplicados si los hubiera
    if (!window.originalShowToast) {
        window.originalShowToast = window.showToast;
    }

    const content = document.getElementById("mainContent");
    content.innerHTML = `
          <div class="content-header-actions">
              <div>
                  <h2>Gestión de Inventario</h2>
                  <p class="text-muted">Administra productos y movimientos</p>
              </div>
              ${hasActionPermission('products.create') ? `
              <button class="btn btn-primary" id="newProductBtn">
                  <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Nuevo Producto
              </button>
              ` : ''}
          </div>
          <div class="tabs">
              <div class="tab-list">
                  <button class="tab-button active" data-tab="products">📦 Productos</button>
                  <button class="tab-button" data-tab="movements">🔄 Movimientos</button>
              </div>
              <div id="productsTab" class="tab-content active">
                  <div class="card" style="margin-bottom: 1rem;">
                      <div class="form-group" style="margin-bottom: 0; display: flex; gap: 1rem;">
                          <div style="flex: 1;">
                              <input type="text" id="productSearch" class="form-input" placeholder="Buscar por nombre o código...">
                          </div>
                          <select id="categoryFilter" class="form-select" style="width: 200px;">
                              <option value="">Todas las categorías</option>
                              ${(AppState.categories || [])
            .map(
                (cat) =>
                    `<option value="${cat}">${cat}</option>`
            )
            .join("")}
                          </select>
                      </div>
                  </div>
                  <div id="productsTableContainer"></div>
              </div>
              <div id="movementsTab" class="tab-content">
                   <div class="card" style="margin-bottom: 1rem;">
                       <div class="form-group" style="margin-bottom: 0; display: flex; gap: 1rem; align-items: center;">
                           <div style="flex: 1;">
                               <input type="text" id="transactionSearch" class="form-input" placeholder="Buscar por producto o usuario...">
                           </div>
                           <select id="transactionTypeFilter" class="form-select" style="width: 150px;">
                               <option value="">Todos los tipos</option>
                               <option value="entrada">Entrada</option>
                               <option value="salida">Salida</option>
                           </select>
                           <select id="transactionStatusFilter" class="form-select" style="width: 150px;">
                               <option value="">Todos los estados</option>
                               <option value="pendiente">Pendiente</option>
                               <option value="aprobada">Aprobada</option>
                               <option value="rechazada">Rechazada</option>
                           </select>
                           <button class="btn btn-primary" id="newTransactionBtn">
                               <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                               Registrar Movimiento
                           </button>
                       </div>
                   </div>
                   <div id="transactionsTableContainer"></div>
              </div>
  
          </div>
      `;

    // Inicializar listeners
    setupInventoryListeners();
    setupTabListeners();
    renderProductsTable();
    renderTransactionsTable();
}

function renderProductsTable() {
    const container = document.getElementById("productsTableContainer");

    // Verificar permiso de consultar productos
    if (!hasActionPermission('products.view')) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🚫</div>
                <p>No tienes permiso para consultar productos</p>
                <p class="text-muted" style="font-size: 0.875rem;">Contacta al administrador si necesitas acceso</p>
            </div>
        `;
        return;
    }

    const products = getProducts({
        searchTerm: inventorySearchTerm,
        category: inventoryFilterCategory,
    });

    if (!products || products.length === 0) {
        container.innerHTML =
            '<div class="empty-state"><div class="empty-state-icon">📦</div><p>No se encontraron productos</p></div>';
        return;
    }

    let html = `
          <div class="table-container">
              <table>
                  <thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio</th><th>Ubicación</th><th>Acciones</th></tr></thead>
                  <tbody>
      `;
    products.forEach((product) => {
        const minStock = product.min_stock || product.minStock || 0;
        const maxStock = product.max_stock || product.maxStock || 100;
        const stockClass =
            product.stock <= minStock ? "text-danger" : "text-success";
        html += `
              <tr data-id="${product.id}">
                  <td><strong>${escapeHtml(product.code)}</strong></td>
                  <td>${escapeHtml(product.name)}</td>
                  <td><span class="badge badge-primary">${escapeHtml(product.category)}</span></td>
                  <td class="${stockClass}"><strong>${product.stock}</strong> / ${maxStock}</td>
                  <td>${formatCurrency(product.price)}</td>
                  <td>${escapeHtml(product.location)}</td>
                  <td>
                      <div class="table-actions">
                          ${hasActionPermission('products.update') ? '<button class="btn btn-sm btn-ghost btn-edit" title="Editar"><svg class="svg-icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>' : ''}
                ${hasActionPermission('products.delete') ? '<button class="btn btn-sm btn-danger btn-delete" title="Eliminar"><svg class="svg-icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>' : ''}
                      </div>
                  </td>
              </tr>
          `;
    });
    html += "</tbody></table></div>";
    container.innerHTML = html;

    // Asignar eventos a botones generados dinámicamente
    container.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const productId = e.currentTarget.closest("tr").dataset.id;
            showProductModal(productId, "active");
        });
    });
    container.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const productId = e.currentTarget.closest("tr").dataset.id;
            confirmDeleteProduct(productId);
        });
    });
}

function renderTransactionsTable() {
    const container = document.getElementById("transactionsTableContainer");
    const transactions = getTransactions({
        searchTerm: transactionSearchTerm,
        type: transactionTypeFilterValue,
        status: transactionStatusFilterValue
    });

    if (transactions.length === 0) {
        container.innerHTML =
            '<div class="empty-state"><div class="empty-state-icon">🔄</div><p>No se encontraron movimientos</p></div>';
        return;
    }

    let html = `
          <div class="table-container">
              <table>
                  <thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Usuario</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
      `;
    transactions.forEach((transaction) => {
        const typeClass =
            transaction.type === "entrada" ? "badge-success" : "badge-warning";
        const statusClass =
            transaction.status === "aprobada"
                ? "badge-success"
                : transaction.status === "rechazada"
                    ? "badge-danger"
                    : "badge-warning";
        html += `
              <tr>
                  <td>${formatDate(transaction.created_at)}</td>
                  <td><span class="badge ${typeClass}">${transaction.type.toUpperCase()}</span></td>
                  <td>${escapeHtml(transaction.product_name)} <small>(${escapeHtml(transaction.product_code)})</small></td>
                  <td><strong>${transaction.quantity}</strong></td>
                  <td>${escapeHtml(transaction.created_by_name)}</td>
                  <td><span class="badge ${statusClass}">${transaction.status}</span></td>
                  <td>
                      <div class="table-actions">
                          ${transaction.status === "pendiente" &&
                hasPermission("notifications")
                ? `
                              <button class="btn btn-sm btn-success btn-approve" data-id="${transaction.id}" title="Aprobar">✓</button>
                              <button class="btn btn-sm btn-danger btn-reject" data-id="${transaction.id}" title="Rechazar">✗</button>
                          `
                : ""
            }
                          <button class="btn btn-sm btn-danger btn-delete-transaction" data-id="${transaction.id}" title="Eliminar">🗑️</button>
                      </div>
                  </td>
              </tr>
          `;
    });
    html += "</tbody></table></div>";
    container.innerHTML = html;

    container.querySelectorAll(".btn-approve").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const transactionId = e.currentTarget.dataset.id;
            confirmApproveTransaction(transactionId);
        });
    });
    container.querySelectorAll(".btn-reject").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const transactionId = e.currentTarget.dataset.id;
            confirmRejectTransaction(transactionId);
        });
    });
    container.querySelectorAll(".btn-delete-transaction").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const transactionId = e.currentTarget.dataset.id;
            confirmDeleteTransaction(transactionId);
        });
    });
}
