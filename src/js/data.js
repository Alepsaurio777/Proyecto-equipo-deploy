// ==================== ESTADO GLOBAL ====================
const AppState = {
    currentUser: null,
    currentModule: 'inventory',
    sidebarCollapsed: false,
    recoveryStep: 'pin',
    products: [],
    transactions: [],
    employees: [],
    notifications: [],
    rolePermissions: {
        admin: ['inventory', 'reports', 'employees', 'notifications'],
        cashier: ['inventory', 'reports'],
        warehouse: ['inventory', 'reports']
    }
};



