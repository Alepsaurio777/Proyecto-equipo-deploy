// Setup global para las pruebas
global.AppState = {
  products: [],
  employees: [],
  transactions: [],
  categories: [],
  roles: [],
  currentUser: { id: 1, username: 'test' }
};

// Mock de funciones globales
global.showToast = jest.fn();
global.formatCurrency = jest.fn((amount) => `$${amount}`);
global.formatDate = jest.fn((date) => date);
global.hasPermission = jest.fn(() => true);

// Importar las funciones que se van a probar
require('../src/js/inventory.js');
require('../src/js/employees.js');