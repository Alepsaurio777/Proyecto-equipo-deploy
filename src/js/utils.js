// ==================== UTILIDADES ====================

// Función para mostrar notificaciones toast
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    
    const icons = { success: '✓', error: '✗', info: 'ℹ' };
    
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
                    '<span class="toast-message">' + message + '</span>';
    
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

// Función para formatear moneda
function formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

// Función para formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

// Función para cargar de LocalStorage
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error al cargar de localStorage:', e);
        return null;
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error al guardar en localStorage:', e);
        return false;
    }
}
