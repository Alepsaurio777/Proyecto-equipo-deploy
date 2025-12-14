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
  rolesWithPermissions: [], // Roles con sus permisos granulares
  actionPermissions: {}, // Permisos de acción cargados del servidor
  rolePermissions: {
    admin: ["inventory", "reports", "employees", "notifications", "roles"],
    cashier: ["inventory", "reports", "employees"],
    warehouse: ["inventory"],
  },
};
