// ==================== MÓDULO DE INVENTARIO (CRUD COMPLETO) ====================

let inventoryFilterCategory = "";
let inventorySearchTerm = "";
let currentEditingProduct = null;

// Función para limpiar el módulo de inventario
function cleanupInventoryModule() {
  if (window.originalShowToast) {
    window.showToast = window.originalShowToast;
    delete window.originalShowToast;
  }
}

// ==================== 1. GETTERS DE DATOS LOCALES ====================
// Nota: Las funciones de carga de datos ahora están en api.js

function getProducts(filters = {}) {
  let filtered = [...(AppState.products || [])];
  if (filters.category && filters.category !== "") {
    filtered = filtered.filter((p) => p.category === filters.category);
  }
  if (filters.searchTerm && filters.searchTerm !== "") {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term)
    );
  }
  return filtered;
}

function getTransactions(filters = {}) {
  let filtered = [...(AppState.transactions || [])];
  if (filters.status) {
    filtered = filtered.filter((t) => t.status === filters.status);
  }
  if (filters.type) {
    filtered = filtered.filter((t) => t.type === filters.type);
  }
  return filtered.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

// ==================== 3. MANEJADORES DE CRUD (BACKEND) ====================

async function sendProductUpdate(method, productData) {
  try {
    const response = await fetch(
      "http://localhost/Proyecto-de-Equipo/api/products.php",
      {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      }
    );
    const data = await response.json();
    if (data.success) {
      await Promise.all([loadProducts("active"), loadProducts("inactive")]);
      return true;
    } else {
      showToast(data.message, "error");
      return false;
    }
  } catch (error) {
    showToast(
      `Error de red al ${method === "POST" ? "crear" : "actualizar"} producto`,
      "error"
    );
    return false;
  }
}

// ==================== 2. OPERACIONES CRUD (usando módulo API) ====================

async function createProduct(productData) {
  const result = await apiCreateProduct(productData);
  if (!result.success) {
    showToast(result.message, "error");
  }
  return result.success;
}

async function updateProduct(productId, productData) {
  const result = await apiUpdateProduct(productId, productData);
  if (!result.success) {
    showToast(result.message, "error");
  }
  return result.success;
}



async function deleteProduct(productId) {
  const result = await apiDeleteProduct(productId);
  if (!result.success) {
    showToast(result.message, "error");
  }
  return result.success;
}

async function createTransaction(transactionData) {
  const result = await apiCreateTransaction(transactionData);
  return result.success;
}

async function approveTransaction(transactionId) {
  const result = await apiApproveTransaction(transactionId);
  return result.success;
}

async function rejectTransaction(transactionId) {
  const result = await apiRejectTransaction(transactionId);
  return result.success;
}

async function deleteTransaction(transactionId) {
  const result = await apiDeleteTransaction(transactionId);
  return result.success;
}

// ==================== 4. MANEJADORES DE INTERFAZ Y MODALES ====================

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

async function saveProduct() {
  const productData = {
    name: document.getElementById("productName").value.trim(),
    code: document.getElementById("productCode").value.trim(),
    category: document.getElementById("productCategory").value.trim(),
    stock: parseInt(document.getElementById("productStock").value, 10),
    min_stock: parseInt(document.getElementById("productMinStock").value, 10),
    max_stock: parseInt(document.getElementById("productMaxStock").value, 10),
    price: parseFloat(document.getElementById("productPrice").value),
    location: document.getElementById("productLocation").value.trim(),
    description: document.getElementById("productDescription").value.trim(),
  };

  // Normalizar NaN a 0 para inputs vacíos
  if (Number.isNaN(productData.stock)) productData.stock = 0;
  if (Number.isNaN(productData.min_stock)) productData.min_stock = 0;
  if (Number.isNaN(productData.max_stock)) productData.max_stock = 0;
  if (Number.isNaN(productData.price)) productData.price = 0;

  // Campos requeridos
  if (!productData.name || !productData.code || !productData.category) {
    showToast("Por favor completa los campos requeridos", "error");
    return;
  }

  // Validar precio: no puede ser negativo o cero
  if (productData.price <= 0) {
    showToast("El precio debe ser mayor que 0", "error");
    return;
  }

  // No permitir stock, min_stock o max_stock negativos
  if (productData.stock < 0) {
    showToast("El stock actual no puede ser negativo", "error");
    return;
  }
  if (productData.min_stock < 0) {
    showToast("El stock mínimo no puede ser negativo", "error");
    return;
  }
  if (productData.max_stock < 0) {
    showToast("El stock máximo no puede ser negativo", "error");
    return;
  }

  // min_stock debe ser <= max_stock
  if (productData.min_stock > productData.max_stock) {
    showToast(
      `El stock mínimo (${productData.min_stock}) no puede ser mayor que el stock máximo (${productData.max_stock})`,
      "error"
    );
    return;
  }

  // stock debe estar entre min_stock y max_stock
  if (productData.stock > productData.max_stock) {
    showToast(
      `El stock actual (${productData.stock}) no puede ser mayor que el stock máximo (${productData.max_stock})`,
      "error"
    );
    return;
  }
  if (productData.stock < productData.min_stock) {
    showToast(
      `El stock actual (${productData.stock}) no puede ser menor que el stock mínimo (${productData.min_stock})`,
      "error"
    );
    return;
  }

  // Si todas las validaciones pasan, enviar al backend
  let success = false;
  if (currentEditingProduct) {
    success = await updateProduct(currentEditingProduct, productData);
  } else {
    success = await createProduct(productData);
  }
  if (success) {
    closeProductModal();
    renderProductsTable();
    showToast(
      currentEditingProduct ? "Producto actualizado" : "Producto creado exitosamente",
      "success"
    );
  }
}

async function confirmDeleteProduct(productId) {
  if (confirm("¿Estás seguro de ELIMINAR este producto? Esta acción no se puede deshacer.")) {
    const success = await deleteProduct(productId);
    if (success) {
      showToast("Producto eliminado correctamente", "success");
      renderProductsTable();
    }
  }
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

async function saveTransaction() {
  const transactionData = {
    productId: parseInt(document.getElementById("transactionProduct").value, 10),
    quantity: parseInt(document.getElementById("transactionQuantity").value, 10),
    type: document.getElementById("transactionType").value.trim(),
    reason: document.getElementById("transactionReason").value.trim(),
    userId: AppState.currentUser.id,
  };

  // Validar campos requeridos
  if (!transactionData.productId || !transactionData.quantity || !transactionData.type) {
    return;
  }

  // Validar cantidad: debe ser positiva
  if (Number.isNaN(transactionData.quantity) || transactionData.quantity <= 0) {
    return;
  }

  // Verificar que el producto exista
  const product = AppState.products.find((p) => p.id === transactionData.productId);
  if (!product) {
    return;
  }

  // Si es salida, verificar que haya stock suficiente
  if (transactionData.type === "salida" && product.stock < transactionData.quantity) {
    return;
  }

  // Enviar transacción al backend
  const success = await createTransaction(transactionData);
  if (success) {
    closeTransactionModal();
    renderTransactionsTable();
  }
}

async function confirmApproveTransaction(transactionId) {
  const success = await approveTransaction(transactionId);
  if (success) {
    renderTransactionsTable();
  }
}

async function confirmRejectTransaction(transactionId) {
  const success = await rejectTransaction(transactionId);
  if (success) {
    renderTransactionsTable();
  }
}

async function confirmDeleteTransaction(transactionId) {
  const success = await deleteTransaction(transactionId);
  if (success) {
    renderTransactionsTable();
  }
}

// ==================== 5. RENDERIZADO DE TABLAS ====================

function renderProductsTable() {
  const container = document.getElementById("productsTableContainer");
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
                <td><strong>${product.code}</strong></td>
                <td>${product.name}</td>
                <td><span class="badge badge-primary">${
                  product.category
                }</span></td>
                <td class="${stockClass}"><strong>${
      product.stock
    }</strong> / ${maxStock}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.location}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-ghost btn-edit" title="Editar"><svg class="svg-icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
              ${canDelete() ? '<button class="btn btn-sm btn-danger btn-delete" title="Eliminar"><svg class="svg-icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>' : ''}
                    </div>
                </td>
            </tr>
        `;
  });
  html += "</tbody></table></div>";
  container.innerHTML = html;

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
  const transactions = getTransactions();
  if (transactions.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon">🔄</div><p>No hay movimientos registrados</p></div>';
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
                <td>${transaction.product_name} <small>(${
      transaction.product_code
    })</small></td>
                <td><strong>${transaction.quantity}</strong></td>
                <td>${transaction.created_by_name}</td>
                <td><span class="badge ${statusClass}">${
      transaction.status
    }</span></td>
                <td>
                    <div class="table-actions">
                        ${
                          transaction.status === "pendiente" &&
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

// ==================== 6. FUNCIÓN PRINCIPAL DEL MÓDULO ====================

function filterInventory() {
  inventorySearchTerm = document.getElementById("productSearch").value;
  inventoryFilterCategory = document.getElementById("categoryFilter").value;
  renderProductsTable();
}

function renderInventoryModule() {
  // Deshabilitar mensajes emergentes en inventario
  window.originalShowToast = window.showToast;
  window.showToast = () => {};
  
  const content = document.getElementById("mainContent");
  content.innerHTML = `
        <div class="content-header-actions">
            <div>
                <h2>Gestión de Inventario</h2>
                <p class="text-muted">Administra productos y movimientos</p>
            </div>
            <button class="btn btn-primary" id="newProductBtn">
                <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nuevo Producto
            </button>
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
                 <div class="content-header-actions" style="margin-bottom: 1rem;">
                    <div></div>
                    <button class="btn btn-primary" id="newTransactionBtn">
                         <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Registrar Movimiento
                    </button>
                </div>
                <div id="transactionsTableContainer"></div>
            </div>

        </div>
    `;

  // Event listeners únicos usando delegación
  document.getElementById("newProductBtn").onclick = () => showProductModal();
  document.getElementById("productSearch").oninput = () => filterInventory();
  document.getElementById("categoryFilter").onchange = () => filterInventory();
  document.getElementById("closeProductModalBtn").onclick = () => closeProductModal();
  document.getElementById("saveProductBtn").onclick = () => saveProduct();
  document.getElementById("newTransactionBtn").onclick = () => showTransactionModal();
  document.getElementById("closeTransactionModalBtn").onclick = () => closeTransactionModal();
  document.getElementById("saveTransactionBtn").onclick = (e) => {
    e.target.disabled = true;
    saveTransaction().finally(() => {
      e.target.disabled = false;
    });
  };

  setupTabListeners();
  renderProductsTable();
  renderTransactionsTable();
}

function filterInventory() {
  inventorySearchTerm = document.getElementById("productSearch").value;
  inventoryFilterCategory = document.getElementById("categoryFilter").value;
  renderProductsTable();
}




