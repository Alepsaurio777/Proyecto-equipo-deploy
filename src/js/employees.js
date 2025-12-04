// ==================== MÓDULO DE EMPLEADOS (CRUD COMPLETO) ====================

let currentEditingEmployee = null;

// Nota: La carga de empleados ahora se hace desde api.js usando apiLoadEmployees()

// ==================== CRUD DE EMPLEADOS (CONECTADO A BACKEND) ====================

async function createEmployee(employeeData) {
  const result = await apiCreateEmployee(employeeData);
  if (!result.success) {
    showToast(result.message, "error");
  }
  return result.success;
}

function getEmployees(filters = {}) {
  let filtered = [...AppState.employees];
  if (filters.status) {
    filtered = filtered.filter((e) => e.status === filters.status);
  }
  if (filters.searchTerm && filters.searchTerm !== "") {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.position.toLowerCase().includes(term) ||
        (e.email && e.email.toLowerCase().includes(term))
    );
  }
  return filtered;
}

async function updateEmployee(employeeId, employeeData) {
  const result = await apiUpdateEmployee(employeeId, employeeData);
  if (!result.success) {
    showToast(result.message, "error");
  }
  return result.success;
}

async function deleteEmployee(employeeId) {
  const result = await apiDeleteEmployee(employeeId);
  if (!result.success) {
    showToast(result.message, "error");
  }
  return result.success;
}

// ==================== INTERFAZ DEL MÓDULO ====================

function renderEmployeesModule() {
  const content = document.getElementById("mainContent");
  content.innerHTML = `
        <div class="content-header-actions">
            <div>
                <h2>Gestión de Empleados</h2>
                <p class="text-muted">Administra el personal de la ferretería</p>
            </div>
            <button class="btn btn-primary" onclick="showEmployeeModal()">
                <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nuevo Empleado
            </button>
        </div>
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-header"><span class="kpi-label">Total Empleados</span><span class="kpi-icon">👥</span></div>
                <div class="kpi-value">${AppState.employees.length}</div>
                <div class="kpi-description">Personal registrado</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header"><span class="kpi-label">Nómina Total</span><span class="kpi-icon">💰</span></div>
                <div class="kpi-value">${formatCurrency(
                  AppState.employees
                    .reduce((sum, e) => sum + parseFloat(e.salary || 0), 0)
                )}</div>
                <div class="kpi-description">Salarios mensuales</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header"><span class="kpi-label">Promedio Salarial</span><span class="kpi-icon">📊</span></div>
                <div class="kpi-value">${formatCurrency(
                  AppState.employees.length > 0 ? 
                  AppState.employees.reduce((sum, e) => sum + parseFloat(e.salary || 0), 0) / AppState.employees.length : 0
                )}</div>
                <div class="kpi-description">Salario promedio</div>
            </div>
        </div>
        <div class="card" style="margin-bottom: 1rem;">
            <div class="form-group" style="margin-bottom: 0; display: flex; gap: 1rem;">
                <div style="flex: 1;">
                    <input type="text" id="employeeSearch" class="form-input" placeholder="Buscar por nombre, puesto o email..." oninput="filterEmployees()">
                </div>

            </div>
        </div>
        <div id="employeesTableContainer"></div>
    `;
  renderEmployeesTable();
}

let employeeSearchTerm = "";
function filterEmployees() {
  employeeSearchTerm = document.getElementById("employeeSearch").value;
  renderEmployeesTable();
}

function renderEmployeesTable() {
  const container = document.getElementById("employeesTableContainer");
  const employees = getEmployees({
    searchTerm: employeeSearchTerm,
  });
  if (employees.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon">👥</div><p>No se encontraron empleados</p></div>';
    return;
  }
  let html = `
        <div class="table-container">
            <table>
                <thead><tr><th>Nombre</th><th>Puesto</th><th>Email</th><th>Teléfono</th><th>Salario</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
    `;
  employees.forEach((employee) => {
    const isOnline = AppState.currentUser && AppState.currentUser.id === employee.user_id;
    const statusClass = isOnline ? "badge-success" : "badge-danger";
    const statusText = isOnline ? "Conectado" : "Desconectado";
    html += `
            <tr data-id="${employee.id}">
                <td><strong>${employee.name}</strong></td>
                <td>${employee.position}</td>
                <td>${employee.email}</td>
                <td>${employee.phone}</td>
                <td>${formatCurrency(employee.salary)}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-ghost btn-edit" title="Editar"><svg class="svg-icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                        <button class="btn btn-sm btn-ghost btn-delete" title="Eliminar"><svg class="svg-icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                    </div>
                </td>
            </tr>
        `;
  });
  html += "</tbody></table></div>";
  container.innerHTML = html;

  // Re-attach event listeners
  container.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const employeeId = e.currentTarget.closest("tr").dataset.id;
      editEmployee(employeeId);
    });
  });
  container.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const employeeId = e.currentTarget.closest("tr").dataset.id;
      confirmDeleteEmployee(employeeId);
    });
  });
}

async function showEmployeeModal(employeeId = null) {
  currentEditingEmployee = employeeId;

  // Cargar roles si no están en memoria
  if (!AppState.roles || AppState.roles.length === 0) {
    await apiLoadRoles();
  }

  // Poblar el dropdown de roles
  const positionSelect = document.getElementById("employeePosition");
  positionSelect.innerHTML = '<option value="">Selecciona un rol</option>';
  AppState.roles.forEach((role) => {
    positionSelect.innerHTML += `<option value="${role.name}">${role.name}</option>`;
  });

  const modal = document.getElementById("employeeModal");
  const title = document.getElementById("employeeModalTitle");
  const usernameInput = document.getElementById("employeeUsername");
  const passwordInput = document.getElementById("employeePassword");
  const usernameLabel = usernameInput.previousElementSibling;
  const passwordLabel = passwordInput.parentElement.previousElementSibling;

  if (employeeId) {
    const employee = AppState.employees.find(
      (e) => e.id === parseInt(employeeId, 10)
    );
    if (!employee) return;
    title.textContent = "Editar Empleado";

    // Campos opcionales al editar
    usernameInput.removeAttribute("required");
    passwordInput.removeAttribute("required");
    usernameLabel.textContent = "Nombre de Usuario";
    passwordLabel.textContent = "Contraseña";
    usernameInput.placeholder = "Dejar vacío para no cambiar";
    passwordInput.placeholder = "Dejar vacío para no cambiar";

    document.getElementById("employeeName").value = employee.name;
    document.getElementById("employeePosition").value = employee.position;
    usernameInput.value = employee.username || "";
    passwordInput.value = ""; // Nunca mostrar contraseña
    document.getElementById("employeeEmail").value = employee.email;
    document.getElementById("employeePhone").value = employee.phone;
    document.getElementById("employeeSalary").value = employee.salary;

    document.getElementById("employeeHireDate").value = employee.hire_date;
    document.getElementById("employeeAddress").value = employee.address;
  } else {
    title.textContent = "Nuevo Empleado";

    // Campos obligatorios al crear
    usernameInput.setAttribute("required", "required");
    passwordInput.setAttribute("required", "required");
    usernameLabel.textContent = "Nombre de Usuario *";
    passwordLabel.textContent = "Contraseña *";
    usernameInput.placeholder = "Ingresa el nombre de usuario";
    passwordInput.placeholder = "Mínimo 6 caracteres";

    document.getElementById("employeeForm").reset();

    document.getElementById("employeeHireDate").value = new Date()
      .toISOString()
      .split("T")[0];
  }
  modal.classList.remove("hidden");
}

function editEmployee(employeeId) {
  showEmployeeModal(employeeId);
}

function closeEmployeeModal() {
  document.getElementById("employeeModal").classList.add("hidden");
  currentEditingEmployee = null;
}

async function saveEmployee() {
  const employeeData = {
    name: document.getElementById("employeeName").value,
    position: document.getElementById("employeePosition").value,
    username: document.getElementById("employeeUsername").value,
    password: document.getElementById("employeePassword").value,
    email: document.getElementById("employeeEmail").value,
    phone: document.getElementById("employeePhone").value,
    salary: document.getElementById("employeeSalary").value,
    status: "active",
    hire_date: document.getElementById("employeeHireDate").value,
    address: document.getElementById("employeeAddress").value,
  };

  // Validaciones base
  if (!employeeData.name || !employeeData.position) {
    showToast("Por favor completa el nombre y puesto", "error");
    return;
  }

  // Para nuevo empleado, usuario y contraseña son obligatorios
  if (!currentEditingEmployee) {
    if (!employeeData.username || !employeeData.password) {
      showToast(
        "Usuario y contraseña son obligatorios para nuevos empleados",
        "error"
      );
      return;
    }
  }

  // Validación de contraseña mínima (si se proporciona)
  if (employeeData.password && employeeData.password.length < 6) {
    showToast("La contraseña debe tener al menos 6 caracteres", "error");
    return;
  }

  let success = false;
  let response = null;

  if (currentEditingEmployee) {
    response = await apiUpdateEmployee(currentEditingEmployee, employeeData);
    success = response.success;
  } else {
    response = await apiCreateEmployee(employeeData);
    success = response.success;
  }

  if (success) {
    closeEmployeeModal();
    renderEmployeesModule(); // Re-render the whole module to update KPIs

    // Si se generaron credenciales automáticamente, mostrarlas
    if (response.data?.generatedCredentials && !currentEditingEmployee) {
      const creds = response.data.generatedCredentials;
      let message = "Empleado creado correctamente.";

      if (creds.password) {
        message += `\n\n⚠️ CREDENCIALES GENERADAS:\nUsuario: ${creds.username}\nContraseña: ${creds.password}\n\n¡Guarda esta información! La contraseña no se mostrará de nuevo.`;
        alert(message);
      } else {
        showToast(message, "success");
      }
    } else {
      showToast(
        currentEditingEmployee
          ? "Empleado actualizado correctamente"
          : "Empleado creado correctamente",
        "success"
      );
    }
  } else {
    showToast(response.message || "Error al guardar empleado", "error");
  }
}

async function confirmDeleteEmployee(employeeId) {
  if (confirm("¿Estás seguro de ELIMINAR este empleado? Esta acción no se puede deshacer.")) {
    const success = await deleteEmployee(employeeId);
    if (success) {
      showToast("Empleado eliminado correctamente", "success");
      renderEmployeesModule(); // Re-render the whole module to update KPIs
    }
  }
}
