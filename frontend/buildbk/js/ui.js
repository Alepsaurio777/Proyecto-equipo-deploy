// ==================== INTERFAZ DE USUARIO ====================

// Event listener global para tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Cerrar modales abiertos
        const modals = [
            'productModal',
            'employeeModal', 
            'transactionModal',
            'editProfileModal',
            'changePasswordModal',
            'passwordRecoveryModal',
            'exportModal'
        ];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                // Limpiar estado si es necesario
                if (modalId === 'employeeModal') {
                    currentEditingEmployee = null;
                }
            }
        });
    }
});

// Renderizar sidebar
function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav || !AppState.currentUser) return;
    
    const menuItems = [
        { id: 'inventory', icon: '📦', label: 'Inventario', permission: 'inventory' },
        { id: 'reports', icon: '📊', label: 'Reportes', permission: 'reports' },
        { id: 'employees', icon: '👥', label: 'Empleados', permission: 'employees' },
        { id: 'notifications', icon: '🔔', label: 'Notificaciones', permission: 'notifications' }
    ];
    
    let html = '';
    menuItems.forEach(item => {
        if (hasPermission(item.permission)) {
            const active = AppState.currentModule === item.id ? 'active' : '';
            const badge = item.id === 'notifications' ? getPendingNotificationsCount() : 0;
            
            html += `
                <button class="nav-item ${active}" onclick="loadModule('${item.id}')">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-text">${item.label}</span>
                    ${badge > 0 ? `<span class="nav-badge">${badge}</span>` : ''}
                </button>
            `;
        }
    });
    
    nav.innerHTML = html;
}

// Cargar módulo
function loadModule(moduleName) {
    if (!hasPermission(moduleName)) {
        showToast('No tienes permiso para acceder a este módulo', 'error');
        return;
    }
    
    AppState.currentModule = moduleName;
    renderSidebar();
    
    const modules = {
        'inventory': renderInventoryModule,
        'reports': renderReportsModule,
        'employees': renderEmployeesModule,
        'notifications': renderNotificationsModule
    };
    
    if (modules[moduleName]) {
        modules[moduleName]();
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
        if (AppState.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }
}

// Setup de listeners para tabs
function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

// Cambiar de tab
function switchTab(tabName) {
    // Remover active de todos los botones y contenidos
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Activar el tab seleccionado
    const button = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    const content = document.getElementById(tabName + 'Tab');
    
    if (button) button.classList.add('active');
    if (content) content.classList.add('active');
}
