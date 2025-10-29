// ==================== INICIALIZACIÓN DE LA APLICACIÓN ====================

// Cargar datos de localStorage al iniciar
function loadStoredData() {
    const storedProducts = loadFromLocalStorage('products');
    if (storedProducts) AppState.products = storedProducts;
    
    const storedTransactions = loadFromLocalStorage('transactions');
    if (storedTransactions) AppState.transactions = storedTransactions;
    
    const storedEmployees = loadFromLocalStorage('employees');
    if (storedEmployees) AppState.employees = storedEmployees;
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la aplicación
    initApp();
});

async function initApp() {
    // Cargar datos iniciales
    await Promise.all([
        loadProducts('active'),
        loadProducts('inactive'),
        loadEmployees(),
        loadTransactions()
    ]);

    // Configurar listeners de eventos
    setupEventListeners();

    // Comprobar si hay un usuario en localStorage
    const storedUser = loadFromLocalStorage('currentUser');
    if (storedUser) {
        AppState.currentUser = storedUser;
        showMainApp();
    } else {
        // No hay usuario, asegurarse de que la pantalla de login se muestre
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }
}

function setupEventListeners() {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', showLogoutDialog);
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', confirmLogout);
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', closeLogoutDialog);

    // Recuperación de contraseña
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', showPasswordRecovery);
    const closeRecoveryBtn = document.getElementById('closeRecoveryBtn');
    if (closeRecoveryBtn) closeRecoveryBtn.addEventListener('click', closePasswordRecovery);
    const recoveryActionBtn = document.getElementById('recoveryActionBtn');
    if (recoveryActionBtn) recoveryActionBtn.addEventListener('click', handleRecoveryAction);

    // Editar perfil
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) editProfileBtn.addEventListener('click', showEditProfile);
    const closeProfileBtn = document.getElementById('closeProfileBtn');
    if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeEditProfile);
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);

    // Modales de transacción (el de producto se maneja en inventory.js)
    const closeTransactionModalBtn = document.getElementById('closeTransactionModalBtn');
    if (closeTransactionModalBtn) closeTransactionModalBtn.addEventListener('click', closeTransactionModal);
    const saveTransactionBtn = document.getElementById('saveTransactionBtn');
    if (saveTransactionBtn) saveTransactionBtn.addEventListener('click', saveTransaction);

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
}
