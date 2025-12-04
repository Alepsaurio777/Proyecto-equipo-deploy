// ==================== CARGADOR DE TEMPLATES HTML ====================

async function loadTemplate(templateName) {
  try {
    const response = await fetch(`/src/${templateName}.html`);
    if (!response.ok) {
      throw new Error(`Template ${templateName} not found`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading template:', error);
    return '';
  }
}

// Función para actualizar KPIs dinámicamente
function updateEmployeeKPIs() {
  const totalEmployees = AppState.employees.length;
  const activeEmployees = AppState.employees.filter(e => e.status === 'active').length;
  const totalPayroll = AppState.employees
    .filter(e => e.status === 'active')
    .reduce((sum, e) => sum + parseFloat(e.salary || 0), 0);

  document.getElementById('totalEmployees').textContent = totalEmployees;
  document.getElementById('activeEmployees').textContent = activeEmployees;
  document.getElementById('totalPayroll').textContent = formatCurrency(totalPayroll);
}

// Función para llenar categorías dinámicamente
function fillCategoryOptions() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter && AppState.categories) {
    const options = AppState.categories
      .map(cat => `<option value="${cat}">${cat}</option>`)
      .join('');
    categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' + options;
  }
}

// Función para cargar modales HTML
async function loadModals() {
  try {
    const [productModal, transactionModal, employeeModal] = await Promise.all([
      loadTemplate('product-modal'),
      loadTemplate('transaction-modal'),
      loadTemplate('employee-modal')
    ]);
    
    document.getElementById('productModalContainer').innerHTML = productModal;
    document.getElementById('transactionModalContainer').innerHTML = transactionModal;
    document.getElementById('employeeModalContainer').innerHTML = employeeModal;
  } catch (error) {
    console.error('Error loading modals:', error);
  }
}