/**
 * Módulo de Validación de Inventario
 * Maneja las validaciones lógicas para productos y transacciones.
 */

// Validar datos de producto
function validateProduct(productData) {
    const errors = [];

    // Campos requeridos
    if (!productData.name || !productData.code || !productData.category) {
        errors.push("Por favor completa los campos requeridos");
    }

    // Validar precio
    if (productData.price <= 0) {
        errors.push("El precio debe ser mayor que 0");
    }

    // Validar stocks negativos
    if (productData.stock < 0) errors.push("El stock actual no puede ser negativo");
    if (productData.min_stock < 0) errors.push("El stock mínimo no puede ser negativo");
    if (productData.max_stock < 0) errors.push("El stock máximo no puede ser negativo");

    // Validar consistencia de stocks
    if (productData.min_stock > productData.max_stock) {
        errors.push(`El stock mínimo (${productData.min_stock}) no puede ser mayor que el stock máximo (${productData.max_stock})`);
    }

    if (productData.stock > productData.max_stock) {
        // Advertencia o Error? El usuario pidió "no poner menos del que se permite", pero esto es "poner más".
        // Lo trataremos como Error según logica original.
        errors.push(`El stock actual (${productData.stock}) no puede ser mayor que el stock máximo (${productData.max_stock})`);
    }

    // Validar stock menor a mínimo (AHORA PERMITIDO: es solo advertencia operacional, no bloqueo)
    // if (productData.stock < productData.min_stock) { ... }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Validar transacción
function validateTransaction(transactionData, product) {
    const errors = [];

    // Campos requeridos
    if (!transactionData.productId || !transactionData.quantity || !transactionData.type) {
        errors.push("Todos los campos son obligatorios");
        return { isValid: false, errors };
    }

    // Validar cantidad
    if (Number.isNaN(transactionData.quantity) || transactionData.quantity <= 0) {
        errors.push("La cantidad debe ser mayor a 0");
    }

    // Verificar existencia de producto
    if (!product) {
        errors.push("Producto no válido");
        return { isValid: false, errors }; // Retorno temprano
    }

    // Validar stock insuficiente para salidas
    if (transactionData.type === "salida") {
        if (product.stock < transactionData.quantity) {
            errors.push(`Stock insuficiente. Stock actual: ${product.stock}, Cantidad solicitada: ${transactionData.quantity}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}
