// ==================== CARGADOR DE TEMPLATES HTML ====================

async function loadTemplate(templatePath) {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Template ${templatePath} not found`);
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

// Función para cargar modales HTML desde archivos separados
async function loadModals() {
  const modalFiles = [
    'password-recovery-modal',
    'logout-modal',
    'edit-profile-modal',
    'change-password-modal',
    'product-modal',
    'transaction-modal',
    'employee-modal',
    'export-modal'
  ];

  try {
    const modalsContainer = document.getElementById('modalsContainer');
    if (!modalsContainer) {
      console.error('Modals container not found');
      return;
    }

    const modals = await Promise.all(
      modalFiles.map(name => loadTemplate(`modals/${name}.html`))
    );
    
    modalsContainer.innerHTML = modals.join('\n');
    console.log('All modals loaded successfully');
  } catch (error) {
    console.error('Error loading modals:', error);
  }
}