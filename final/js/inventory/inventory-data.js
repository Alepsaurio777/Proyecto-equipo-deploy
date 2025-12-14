/**
 * Módulo de Datos de Inventario
 * Maneja la obtención y gestión de datos (API y Filtros locales).
 */

// Filtros globales (accesibles por el UI)
let inventoryFilterCategory = "";
let inventorySearchTerm = "";

// Getters de datos locales con filtros
function getProducts(filters = {}) {
    let filtered = [...(AppState.products || [])];

    // Filtro por categoría
    if (filters.category && filters.category !== "") {
        filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Filtro por término (nombre o código)
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

    // Filtro por término de búsqueda (producto o usuario)
    if (filters.searchTerm && filters.searchTerm !== "") {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter((t) =>
            (t.product_name && t.product_name.toLowerCase().includes(term)) ||
            (t.product_code && t.product_code.toLowerCase().includes(term)) ||
            (t.created_by_name && t.created_by_name.toLowerCase().includes(term))
        );
    }

    return filtered.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
}

// Wrapper para actualizar producto via API
async function sendProductUpdate(method, productData) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/products.php`,
            {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            }
        );
        const data = await response.json();
        if (data.success) {
            // Recargar productos
            await Promise.all([
                // Asumiendo que apiLoadProducts refresca AppState
                apiLoadProducts()
            ]);
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

// Operaciones CRUD Wrappers
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

// Transacciones
async function createTransaction(transactionData) {
    const result = await apiCreateTransaction(transactionData);
    if (!result.success) showToast(result.message, "error");
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
