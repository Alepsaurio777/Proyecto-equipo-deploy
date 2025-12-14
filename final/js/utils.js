// ==================== UTILIDADES ====================

// Función para mostrar notificaciones toast
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast toast-" + type;

  const icons = { success: "✓", error: "✗", info: "ℹ" };

  toast.innerHTML =
    '<span class="toast-icon">' +
    (icons[type] || icons.info) +
    "</span>" +
    '<span class="toast-message">' +
    message +
    "</span>";

  container.appendChild(toast);
  setTimeout(function () {
    toast.remove();
  }, 3000);
}

// Función para formatear moneda
function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

// Función para formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Función para generar ID único
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Función para validar permisos
function hasPermission(module) {
  if (!AppState.currentUser) return false;
  const permissions = AppState.rolePermissions[AppState.currentUser.role];
  return permissions && permissions.includes(module);
}

// Función para validar permisos de eliminación (admin y supervisor)
function canDelete() {
  return AppState.currentUser && (AppState.currentUser.role === 'admin' || AppState.currentUser.role === 'cashier');
}

// Función para validar permisos de acciones específicas (products.create, products.update, etc.)
function hasActionPermission(action) {
  if (!AppState.currentUser) return false;

  // Si no hay permisos cargados, permitir por defecto
  const roleId = AppState.currentUser.roleId;
  if (!roleId || !AppState.actionPermissions[roleId]) {
    // Fallback: admin tiene todos los permisos
    return AppState.currentUser.role === 'admin';
  }

  return AppState.actionPermissions[roleId][action] === true;
}

// Función para cargar de LocalStorage
function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error al cargar de localStorage:", e);
    return null;
  }
}

function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Error al guardar en localStorage:", e);
    return false;
  }
}

function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error("Error al eliminar de localStorage:", e);
    return false;
  }
}

// Función para mostrar/ocultar contraseñas
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentElement.querySelector(".password-toggle");
  const icon = button.querySelector(".eye-icon");

  if (input.type === "password") {
    input.type = "text";
    // Cambiar a ícono de ojo cerrado
    icon.innerHTML =
      '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
  } else {
    input.type = "password";
    // Cambiar a ícono de ojo abierto
    icon.innerHTML =
      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
  }
}

// Función para escapar HTML (Prevención XSS)
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
