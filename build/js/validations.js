// ==================== MÓDULO DE VALIDACIONES ====================
// Funciones de validación reutilizables y testeables

/**
 * Valida los datos de un producto
 * @param {Object} productData - Datos del producto a validar
 * @param {string} productData.name - Nombre del producto
 * @param {string} productData.code - Código del producto
 * @param {string} productData.category - Categoría del producto
 * @param {number} productData.price - Precio del producto
 * @param {number} productData.stock - Stock actual
 * @param {number} productData.min_stock - Stock mínimo
 * @param {number} productData.max_stock - Stock máximo
 * @returns {Object} Resultado de validación {valid: boolean, message?: string, warning?: string}
 */
function validateProductData(productData) {
  // Crear copia para no mutar el original
  const data = { ...productData };

  // Normalizar valores NaN a 0
  if (
    Number.isNaN(data.stock) ||
    data.stock === null ||
    data.stock === undefined
  ) {
    data.stock = 0;
  }
  if (
    Number.isNaN(data.min_stock) ||
    data.min_stock === null ||
    data.min_stock === undefined
  ) {
    data.min_stock = 0;
  }
  if (
    Number.isNaN(data.max_stock) ||
    data.max_stock === null ||
    data.max_stock === undefined
  ) {
    data.max_stock = 0;
  }
  if (
    Number.isNaN(data.price) ||
    data.price === null ||
    data.price === undefined
  ) {
    data.price = 0;
  }

  // 1. Campos requeridos
  if (!data.name || data.name.trim() === "") {
    return {
      valid: false,
      message: "El nombre del producto es requerido",
    };
  }

  if (!data.code || data.code.trim() === "") {
    return {
      valid: false,
      message: "El código del producto es requerido",
    };
  }

  if (!data.category || data.category.trim() === "") {
    return {
      valid: false,
      message: "La categoría del producto es requerida",
    };
  }

  // 2. Validar precio
  if (typeof data.price !== "number" || data.price <= 0) {
    return {
      valid: false,
      message: "El precio debe ser un número mayor que 0",
    };
  }

  // 3. Validar que no haya valores negativos
  if (data.stock < 0) {
    return {
      valid: false,
      message: "El stock actual no puede ser negativo",
    };
  }

  if (data.min_stock < 0) {
    return {
      valid: false,
      message: "El stock mínimo no puede ser negativo",
    };
  }

  if (data.max_stock < 0) {
    return {
      valid: false,
      message: "El stock máximo no puede ser negativo",
    };
  }

  // 4. Validar que max_stock sea mayor que 0 si se especifica
  if (data.max_stock === 0 && data.min_stock > 0) {
    return {
      valid: false,
      message:
        "El stock máximo debe ser mayor que 0 si se especifica un stock mínimo",
    };
  }

  // 5. Validar lógica de stock mínimo vs máximo
  if (data.max_stock > 0 && data.min_stock > data.max_stock) {
    return {
      valid: false,
      message: `Error lógico: El stock mínimo (${data.min_stock}) no puede ser mayor que el máximo (${data.max_stock})`,
    };
  }

  // 6. Validar que el stock actual no exceda el máximo
  if (data.max_stock > 0 && data.stock > data.max_stock) {
    return {
      valid: false,
      message: `El stock actual (${data.stock}) excede el máximo permitido (${data.max_stock})`,
    };
  }

  // 7. Advertencia si stock está por debajo del mínimo (permitir guardar)
  if (data.min_stock > 0 && data.stock < data.min_stock) {
    return {
      valid: true,
      warning: `⚠️ Advertencia: El stock actual (${data.stock}) está por debajo del mínimo recomendado (${data.min_stock})`,
      normalizedData: data,
    };
  }

  return { valid: true, normalizedData: data };
}

/**
 * Valida los datos de una transacción
 * @param {Object} transactionData - Datos de la transacción
 * @param {number} transactionData.productId - ID del producto
 * @param {number} transactionData.quantity - Cantidad
 * @param {string} transactionData.type - Tipo (entrada/salida)
 * @param {Array} products - Lista de productos para verificar existencia y stock
 * @returns {Object} Resultado de validación
 */
function validateTransactionData(transactionData, products = []) {
  // Campos requeridos
  if (!transactionData.productId) {
    return {
      valid: false,
      message: "Debe seleccionar un producto",
    };
  }

  if (
    !transactionData.type ||
    !["entrada", "salida"].includes(transactionData.type)
  ) {
    return {
      valid: false,
      message:
        "Debe seleccionar un tipo de movimiento válido (entrada o salida)",
    };
  }

  // Validar cantidad
  const quantity = Number(transactionData.quantity);
  if (Number.isNaN(quantity) || quantity <= 0) {
    return {
      valid: false,
      message: "La cantidad debe ser un número mayor que 0",
    };
  }

  if (!Number.isInteger(quantity)) {
    return {
      valid: false,
      message: "La cantidad debe ser un número entero",
    };
  }

  // Verificar que el producto existe
  const product = products.find((p) => p.id === transactionData.productId);
  if (!product) {
    return {
      valid: false,
      message: "El producto seleccionado no existe",
    };
  }

  // Validar stock suficiente para salidas
  if (transactionData.type === "salida") {
    if (product.stock < quantity) {
      return {
        valid: false,
        message: `Stock insuficiente. Disponible: ${product.stock}, Solicitado: ${quantity}`,
      };
    }
  }

  // Validar que entrada no exceda stock máximo
  if (transactionData.type === "entrada" && product.max_stock > 0) {
    const newStock = product.stock + quantity;
    if (newStock > product.max_stock) {
      return {
        valid: false,
        message: `La entrada excedería el stock máximo. Actual: ${product.stock}, Máximo: ${product.max_stock}, Entrada: ${quantity}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Valida los datos de un empleado
 * @param {Object} employeeData - Datos del empleado
 * @param {boolean} isNew - Si es un nuevo empleado
 * @returns {Object} Resultado de validación
 */
function validateEmployeeData(employeeData, isNew = true) {
  if (!employeeData.name || employeeData.name.trim() === "") {
    return {
      valid: false,
      message: "El nombre del empleado es requerido",
    };
  }

  if (!employeeData.position || employeeData.position.trim() === "") {
    return {
      valid: false,
      message: "El puesto del empleado es requerido",
    };
  }

  // Para nuevos empleados, usuario y contraseña son obligatorios
  if (isNew) {
    if (!employeeData.username || employeeData.username.trim() === "") {
      return {
        valid: false,
        message: "El nombre de usuario es requerido para nuevos empleados",
      };
    }

    if (!employeeData.password || employeeData.password.length < 6) {
      return {
        valid: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      };
    }
  }

  // Validar contraseña si se proporciona (para edición)
  if (!isNew && employeeData.password && employeeData.password.length > 0) {
    if (employeeData.password.length < 6) {
      return {
        valid: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      };
    }
  }

  // Validar email si se proporciona
  if (employeeData.email && employeeData.email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeData.email)) {
      return {
        valid: false,
        message: "El formato del email no es válido",
      };
    }
  }

  // Validar salario
  if (employeeData.salary !== undefined && employeeData.salary !== "") {
    const salary = Number(employeeData.salary);
    if (Number.isNaN(salary) || salary < 0) {
      return {
        valid: false,
        message: "El salario debe ser un número positivo",
      };
    }
  }

  return { valid: true };
}

// Exportar para pruebas (si se usa en entorno Node.js/Jest)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validateProductData,
    validateTransactionData,
    validateEmployeeData,
  };
}
