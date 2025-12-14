/**
 * Módulo Principal de Inventario
 * Inicialización y gestión de eventos.
 */

function setupInventoryListeners() {
    const newProductBtn = document.getElementById("newProductBtn");
    if (newProductBtn) newProductBtn.onclick = () => showProductModal();

    const productSearch = document.getElementById("productSearch");
    if (productSearch) productSearch.oninput = filterInventory;

    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) categoryFilter.onchange = filterInventory;

    // Modales (pueden no estar cargados aún)
    const closeProductModalBtn = document.getElementById("closeProductModalBtn");
    if (closeProductModalBtn) closeProductModalBtn.onclick = closeProductModal;

    // Fallback: Delegación de eventos para el modal si no existe al cargar
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "closeProductModalBtn") closeProductModal();
        if (e.target && e.target.id === "closeProductModalBtn2") closeProductModal();
        if (e.target && e.target.id === "closeTransactionModalBtn") closeTransactionModal();
    });

    const saveProductBtn = document.getElementById("saveProductBtn");
    if (saveProductBtn) saveProductBtn.onclick = saveProduct;

    const newTransactionBtn = document.getElementById("newTransactionBtn");
    if (newTransactionBtn) newTransactionBtn.onclick = showTransactionModal;

    const closeTransactionModalBtn = document.getElementById("closeTransactionModalBtn");
    if (closeTransactionModalBtn) closeTransactionModalBtn.onclick = closeTransactionModal;

    const saveTransactionBtn = document.getElementById("saveTransactionBtn");
    if (saveTransactionBtn) {
        saveTransactionBtn.onclick = (e) => {
            e.target.disabled = true;
            saveTransaction().finally(() => {
                e.target.disabled = false;
            });
        };
    }
}

function filterInventory() {
    const searchInput = document.getElementById("productSearch");
    const categorySelect = document.getElementById("categoryFilter");

    inventorySearchTerm = searchInput ? searchInput.value : "";
    inventoryFilterCategory = categorySelect ? categorySelect.value : "";
    renderProductsTable();
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

    // Normalizar NaN
    if (Number.isNaN(productData.stock)) productData.stock = 0;
    if (Number.isNaN(productData.min_stock)) productData.min_stock = 0;
    if (Number.isNaN(productData.max_stock)) productData.max_stock = 0;
    if (Number.isNaN(productData.price)) productData.price = 0;

    // VALIDACIÓN (Usando Módulo de Validación)
    const validation = validateProduct(productData);
    if (!validation.isValid) {
        // Mostrar solo el primer error o un resumen para no spamear
        if (validation.errors.length > 0) {
            showToast(validation.errors[0], "error");
        }
        return;
    }

    // Guardar
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

async function saveTransaction() {
    const transactionData = {
        productId: parseInt(document.getElementById("transactionProduct").value, 10),
        quantity: parseInt(document.getElementById("transactionQuantity").value, 10),
        type: document.getElementById("transactionType").value.trim(),
        reason: document.getElementById("transactionReason").value.trim(),
        userId: AppState.currentUser.id,
    };

    const product = AppState.products.find((p) => p.id === transactionData.productId);

    // VALIDACIÓN (Usando Módulo de Validación)
    const validation = validateTransaction(transactionData, product);
    if (!validation.isValid) {
        validation.errors.forEach(err => showToast(err, "error"));
        return;
    }

    // Guardar
    const success = await createTransaction(transactionData);
    if (success) {
        closeTransactionModal();
        renderTransactionsTable();
        showToast("Movimiento registrado", "success");
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

async function confirmApproveTransaction(transactionId) {
    const success = await approveTransaction(transactionId);
    if (success) renderTransactionsTable();
}

async function confirmRejectTransaction(transactionId) {
    const success = await rejectTransaction(transactionId);
    if (success) renderTransactionsTable();
}

async function confirmDeleteTransaction(transactionId) {
    const success = await deleteTransaction(transactionId);
    if (success) renderTransactionsTable();
}
