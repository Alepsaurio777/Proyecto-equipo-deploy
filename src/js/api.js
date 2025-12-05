// ==================== MÓDULO DE API CENTRALIZADO ====================
// Centraliza todas las llamadas a la API del backend

const API_BASE_URL = "http://localhost/Proyecto-de-Equipo/api";

// ==================== PRODUCTOS ====================
async function apiLoadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php`);
    const data = await response.json();
    if (data.success) {
      AppState.products = data.data;
      return { success: true, data: data.data };
    } else {
      console.error("Error al cargar productos:", data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Error de red al cargar productos:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiCreateProduct(productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (data.success) {
      await apiLoadProducts();
    }
    return data;
  } catch (error) {
    console.error("Error al crear producto:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiUpdateProduct(productId, productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId, ...productData }),
    });
    const data = await response.json();
    if (data.success) {
      await apiLoadProducts();
    }
    return data;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiDeleteProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId }),
    });
    const data = await response.json();
    if (data.success) {
      await apiLoadProducts();
    }
    return data;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return { success: false, message: "Error de conexión" };
  }
}



// ==================== TRANSACCIONES ====================
async function apiLoadTransactions() {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions.php`);
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (data.success) {
        AppState.transactions = data.data;
        return { success: true, data: data.data };
      } else {
        console.error("Error al cargar transacciones:", data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error al parsear JSON de transacciones:", error);
      console.error("Respuesta recibida:", text);
      return { success: false, message: "Error al parsear respuesta" };
    }
  } catch (error) {
    console.error("Error de red al cargar transacciones:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiCreateTransaction(transactionData) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transactionData),
    });
    const data = await response.json();
    if (data.success) {
      await apiLoadTransactions();
    }
    return data;
  } catch (error) {
    console.error("Error al crear transacción:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiApproveTransaction(transactionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: transactionId,
        action: "approve",
        user_id: AppState.currentUser.id || 1,
      }),
    });
    const data = await response.json();
    if (data.success) {
      await apiLoadTransactions();
      await apiLoadProducts();
    }
    return data;
  } catch (error) {
    console.error("Error al aprobar transacción:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiRejectTransaction(transactionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: transactionId,
        action: "reject",
        user_id: AppState.currentUser.id || 1,
      }),
    });
    const data = await response.json();
    if (data.success) {
      await apiLoadTransactions();
    }
    return data;
  } catch (error) {
    console.error("Error al rechazar transacción:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiDeleteTransaction(transactionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: transactionId }),
    });
    const data = await response.json();
    if (data.success) {
      await apiLoadTransactions();
    }
    return data;
  } catch (error) {
    console.error("Error al eliminar transacción:", error);
    return { success: false, message: "Error de conexión" };
  }
}

// ==================== EMPLEADOS ====================
async function apiLoadEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/employees.php`);
    const data = await response.json();
    if (data.success) {
      AppState.employees = data.data;
      return { success: true, data: data.data };
    } else {
      console.error("Error al cargar empleados:", data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Error de red al cargar empleados:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiCreateEmployee(employeeData) {
  try {
    console.log('Enviando datos del empleado:', employeeData);
    const response = await fetch(`${API_BASE_URL}/employees.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });
    console.log('Respuesta del servidor:', response.status, response.statusText);
    const data = await response.json();
    console.log('Datos recibidos:', data);
    if (data.success) {
      await apiLoadEmployees();
    }
    return data;
  } catch (error) {
    console.error("Error al crear empleado:", error);
    return { success: false, message: "Error de conexión: " + error.message };
  }
}

async function apiUpdateEmployee(employeeId, employeeData) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: employeeId, ...employeeData }),
    });
    const data = await response.json();
    if (data.success) {
      await apiLoadEmployees();
    }
    return data;
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiDeleteEmployee(employeeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: employeeId }),
    });
    const data = await response.json();
    if (data.success) {
      await apiLoadEmployees();
    }
    return data;
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    return { success: false, message: "Error de conexión" };
  }
}

// ==================== CATEGORÍAS ====================
async function apiLoadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/products.php`);
    const data = await response.json();
    if (data.success) {
      AppState.categories = [...new Set(data.data.map((p) => p.category))];
      return { success: true, data: AppState.categories };
    } else {
      console.error("Error al cargar categorías:", data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Error de red al cargar categorías:", error);
    return { success: false, message: "Error de conexión" };
  }
}

// ==================== ROLES ====================
async function apiLoadRoles() {
  try {
    const response = await fetch(`${API_BASE_URL}/roles.php`);
    const data = await response.json();
    if (data.success) {
      AppState.roles = data.data;
      return { success: true, data: data.data };
    } else {
      console.error("Error al cargar roles:", data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Error de red al cargar roles:", error);
    return { success: false, message: "Error de conexión" };
  }
}

// ==================== AUTENTICACIÓN ====================
async function apiLogin(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error de red al hacer login:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiChangePassword(userId, currentPassword, newPassword) {
  try {
    const response = await fetch(`${API_BASE_URL}/change_password.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error de red al cambiar contraseña:", error);
    return { success: false, message: "Error de conexión" };
  }
}

// ==================== RECUPERACIÓN DE CONTRASEÑA VÍA EMAIL ====================

async function apiSendVerificationCode(username) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/password_recovery.php?action=send-code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username }),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al enviar código de verificación:", error);
    return { success: false, message: "Error de conexión" };
  }
}

async function apiVerifyEmailCode(username, code) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/password_recovery.php?action=verify-code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, code: code }),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al verificar código:", error);
    return { success: false, message: "Error de conexión" };
  }
}
