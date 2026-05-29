// ==================== MÓDULO DE EMPLEADOS ====================
// CRUD completo para la gestión de empleados del sistema

// ==================== ESTADO DEL MÓDULO ====================

let currentEditingEmployee = null;
let employeeSearchTerm = "";
let employeeStatusFilter = "";

// ==================== FUNCIONES DE FILTRADO ====================

function getFilteredEmployees(filters = {}) {
  let result = [...AppState.employees];

  if (filters.status) {
    result = result.filter((e) => e.status === filters.status);
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.position.toLowerCase().includes(term) ||
        (e.email && e.email.toLowerCase().includes(term))
    );
  }

  return result;
}

function filterEmployees() {
  employeeSearchTerm = document.getElementById("employeeSearch")?.value || "";
  employeeStatusFilter = document.getElementById("statusFilter")?.value || "";
  renderEmployeesTable();
}

// ==================== RENDERIZADO DE UI ====================

function calculateEmployeeStats() {
  const total = AppState.employees.length;
  const active = AppState.employees.filter((e) => e.status === "active").length;
  const totalSalary = AppState.employees
    .filter((e) => e.status === "active")
    .reduce((sum, e) => sum + parseFloat(e.salary || 0), 0);

  return { total, active, totalSalary };
}

function renderEmployeesModule() {
  const content = document.getElementById("mainContent");
  if (!content) return;

  const stats = calculateEmployeeStats();

  content.innerHTML = `
    <div class="content-header-actions">
      <div>
        <h2>Gestión de Empleados</h2>
        <p class="text-muted">Administra el personal de la ferretería</p>
      </div>
      <button class="btn btn-primary" onclick="showEmployeeModal()">
        <svg class="svg-icon" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nuevo Empleado
      </button>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Total Empleados</span>
          <span class="kpi-icon">👥</span>
        </div>
        <div class="kpi-value">${stats.total}</div>
        <div class="kpi-description">Personal registrado</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Empleados Activos</span>
          <span class="kpi-icon">✓</span>
        </div>
        <div class="kpi-value">${stats.active}</div>
        <div class="kpi-description">En servicio actualmente</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Nómina Total</span>
          <span class="kpi-icon">💰</span>
        </div>
        <div class="kpi-value">${formatCurrency(stats.totalSalary)}</div>
        <div class="kpi-description">Salarios mensuales</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 1rem;">
      <div class="form-group" style="margin-bottom: 0; display: flex; gap: 1rem;">
        <div style="flex: 1;">
          <input type="text" 
                 id="employeeSearch" 
                 class="form-input" 
                 placeholder="Buscar por nombre, puesto o email..." 
                 oninput="filterEmployees()">
        </div>
        <select id="statusFilter" 
                class="form-select" 
                style="width: 200px;" 
                onchange="filterEmployees()">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>

    <div id="employeesTableContainer"></div>
  `;

  renderEmployeesTable();
}

function renderEmployeesTable() {
  const container = document.getElementById("employeesTableContainer");
  if (!container) return;

  const employees = getFilteredEmployees({
    searchTerm: employeeSearchTerm,
    status: employeeStatusFilter,
  });

  if (employees.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <p>No se encontraron empleados</p>
      </div>
    `;
    return;
  }

  const rows = employees
    .map((employee) => {
      const statusClass =
        employee.status === "active" ? "badge-success" : "badge-danger";
      const statusText = employee.status === "active" ? "Activo" : "Inactivo";

      return `
      <tr data-id="${employee.id}">
        <td><strong>${employee.name}</strong></td>
        <td>${employee.position}</td>
        <td>${employee.email || "-"}</td>
        <td>${employee.phone || "-"}</td>
        <td>${formatCurrency(employee.salary)}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-ghost btn-edit" title="Editar">
              <svg class="svg-icon" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn btn-sm btn-ghost btn-delete" title="Eliminar">
              <svg class="svg-icon" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");

  container.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Salario</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  // Adjuntar event listeners
  container.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", function () {
      const employeeId = this.closest("tr").dataset.id;
      showEmployeeModal(employeeId);
    });
  });

  container.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      const employeeId = this.closest("tr").dataset.id;
      confirmDeleteEmployee(employeeId);
    });
  });
}

// ==================== MANEJO DE MODALES ====================

async function showEmployeeModal(employeeId = null) {
  currentEditingEmployee = employeeId;

  if (!AppState.roles || AppState.roles.length === 0) {
    await apiLoadRoles();
  }

  const modal = document.getElementById("employeeModal");
  const title = document.getElementById("employeeModalTitle");
  const form = document.getElementById("employeeForm");
  const positionSelect = document.getElementById("employeePosition");
  const usernameInput = document.getElementById("employeeUsername");
  const passwordInput = document.getElementById("employeePassword");
  const usernameLabel = usernameInput?.previousElementSibling;
  const passwordLabel = passwordInput?.parentElement?.previousElementSibling;

  if (!modal || !form) return;

  positionSelect.innerHTML = '<option value="">Selecciona un rol</option>';
  AppState.roles.forEach((role) => {
    positionSelect.innerHTML += `<option value="${role.name}">${role.name}</option>`;
  });

  if (employeeId) {
    const employee = AppState.employees.find(
      (e) => e.id === parseInt(employeeId, 10)
    );
    if (!employee) return;

    title.textContent = "Editar Empleado";
    usernameInput?.removeAttribute("required");
    passwordInput?.removeAttribute("required");
    if (usernameLabel) usernameLabel.textContent = "Nombre de Usuario";
    if (passwordLabel) passwordLabel.textContent = "Contraseña";
    if (usernameInput)
      usernameInput.placeholder = "Dejar vacío para no cambiar";
    if (passwordInput)
      passwordInput.placeholder = "Dejar vacío para no cambiar";

    document.getElementById("employeeName").value = employee.name || "";
    document.getElementById("employeePosition").value = employee.position || "";
    document.getElementById("employeeUsername").value = employee.username || "";
    document.getElementById("employeePassword").value = "";
    document.getElementById("employeeEmail").value = employee.email || "";
    document.getElementById("employeePhone").value = employee.phone || "";
    document.getElementById("employeeSalary").value = employee.salary || "";
    document.getElementById("employeeStatus").value =
      employee.status || "active";
    document.getElementById("employeeHireDate").value =
      employee.hire_date || "";
    document.getElementById("employeeAddress").value = employee.address || "";
  } else {
    title.textContent = "Nuevo Empleado";
    usernameInput?.setAttribute("required", "required");
    passwordInput?.setAttribute("required", "required");
    if (usernameLabel) usernameLabel.textContent = "Nombre de Usuario *";
    if (passwordLabel) passwordLabel.textContent = "Contraseña *";
    if (usernameInput)
      usernameInput.placeholder = "Ingresa el nombre de usuario";
    if (passwordInput) passwordInput.placeholder = "Mínimo 6 caracteres";

    form.reset();
    document.getElementById("employeeStatus").value = "active";
    document.getElementById("employeeHireDate").value = new Date()
      .toISOString()
      .split("T")[0];
  }

  modal.classList.remove("hidden");
}

function closeEmployeeModal() {
  const modal = document.getElementById("employeeModal");
  if (modal) modal.classList.add("hidden");
  currentEditingEmployee = null;
}

async function saveEmployee() {
  const employeeData = {
    name: document.getElementById("employeeName").value.trim(),
    position: document.getElementById("employeePosition").value,
    username: document.getElementById("employeeUsername").value.trim(),
    password: document.getElementById("employeePassword").value,
    email: document.getElementById("employeeEmail").value.trim(),
    phone: document.getElementById("employeePhone").value.trim(),
    salary: document.getElementById("employeeSalary").value,
    status: document.getElementById("employeeStatus").value,
    hire_date: document.getElementById("employeeHireDate").value,
    address: document.getElementById("employeeAddress").value.trim(),
  };

  // Usar validación centralizada de validations.js
  const isNew = !currentEditingEmployee;
  const validation = validateEmployeeData(employeeData, isNew);
  if (!validation.valid) {
    showToast(validation.message, "error");
    return;
  }

  let result;

  if (currentEditingEmployee) {
    result = await apiUpdateEmployee(currentEditingEmployee, employeeData);
  } else {
    result = await apiCreateEmployee(employeeData);
  }

  if (result.success) {
    closeEmployeeModal();
    renderEmployeesModule();

    if (result.data?.generatedCredentials && !currentEditingEmployee) {
      const creds = result.data.generatedCredentials;
      if (creds.password) {
        const message = `Empleado creado correctamente.\n\n⚠️ CREDENCIALES GENERADAS:\nUsuario: ${creds.username}\nContraseña: ${creds.password}\n\n¡Guarda esta información! La contraseña no se mostrará de nuevo.`;
        alert(message);
      } else {
        showToast("Empleado creado correctamente", "success");
      }
    } else {
      const message = currentEditingEmployee
        ? "Empleado actualizado correctamente"
        : "Empleado creado correctamente";
      showToast(message, "success");
    }
  } else {
    showToast(result.message || "Error al guardar empleado", "error");
  }
}

async function confirmDeleteEmployee(employeeId) {
  if (!confirm("¿Estás seguro de eliminar este empleado?")) {
    return;
  }

  const result = await apiDeleteEmployee(employeeId);

  if (result.success) {
    showToast("Empleado eliminado correctamente", "success");
    renderEmployeesModule();
  } else {
    showToast(result.message || "Error al eliminar empleado", "error");
  }
}
