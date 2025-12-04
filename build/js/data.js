// ==================== ESTADO GLOBAL ====================
const AppState = {
  currentUser: null,
  currentModule: "inventory",
  sidebarCollapsed: false,
  recoveryStep: "pin",
  recoveryCodeCooldown: null, // Timestamp del último código enviado
  products: [],
  transactions: [],
  employees: [],
  notifications: [],
  roles: [],
  categories: [],
  rolePermissions: {
    admin: ["inventory", "reports", "employees", "notifications"],
    cashier: ["inventory", "reports"],
    warehouse: ["inventory", "reports"],
  },
};
