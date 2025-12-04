// ==================== MÓDULO DE NOTIFICACIONES ====================
// Gestiona las notificaciones de transacciones pendientes (aprobación/rechazo)

// ==================== FUNCIONES AUXILIARES ====================

function getPendingNotificationsCount() {
  if (!AppState.transactions) return 0;
  return AppState.transactions.filter((t) => t.status === "pendiente").length;
}

function setupNotificationTabListeners() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.dataset.tab;
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      button.classList.add("active");
      const targetTab = document.getElementById(`${tabId}Tab`);
      if (targetTab) targetTab.classList.add("active");
    });
  });
}

// ==================== RENDERIZADO DEL MÓDULO ====================

function renderNotificationsModule() {
  const content = document.getElementById("mainContent");
  if (!content) return;

  const pendingTransactions = AppState.transactions.filter(
    (t) => t.status === "pendiente"
  );
  const approvedTransactions = AppState.transactions.filter(
    (t) => t.status === "aprobada"
  );
  const rejectedTransactions = AppState.transactions.filter(
    (t) => t.status === "rechazada"
  );

  content.innerHTML = `
    <div class="content-header">
      <h2>Gestión de Notificaciones</h2>
      <p class="text-muted">Aprueba o rechaza solicitudes de movimientos</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Pendientes</span>
          <span class="kpi-icon">⏳</span>
        </div>
        <div class="kpi-value text-warning">${pendingTransactions.length}</div>
        <div class="kpi-description">Requieren revisión</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Aprobadas</span>
          <span class="kpi-icon">✓</span>
        </div>
        <div class="kpi-value text-success">${approvedTransactions.length}</div>
        <div class="kpi-description">Transacciones completadas</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Rechazadas</span>
          <span class="kpi-icon">✗</span>
        </div>
        <div class="kpi-value text-danger">${rejectedTransactions.length}</div>
        <div class="kpi-description">No autorizadas</div>
      </div>
    </div>

    <div class="tabs">
      <div class="tab-list">
        <button class="tab-button active" data-tab="pending">
          ⏳ Pendientes ${
            pendingTransactions.length > 0
              ? `<span class="badge badge-warning" style="margin-left: 0.5rem;">${pendingTransactions.length}</span>`
              : ""
          }
        </button>
        <button class="tab-button" data-tab="approved">✓ Aprobadas</button>
        <button class="tab-button" data-tab="rejected">✗ Rechazadas</button>
      </div>

      <div id="pendingTab" class="tab-content active">
        ${renderNotificationsTable(pendingTransactions, "pendiente")}
      </div>
      <div id="approvedTab" class="tab-content">
        ${renderNotificationsTable(approvedTransactions, "aprobada")}
      </div>
      <div id="rejectedTab" class="tab-content">
        ${renderNotificationsTable(rejectedTransactions, "rechazada")}
      </div>
    </div>
  `;

  setupNotificationTabListeners();
  attachNotificationActionListeners();
}

// ==================== RENDERIZADO DE TABLAS ====================

function renderNotificationsTable(transactions, status) {
  if (transactions.length === 0) {
    const emptyMessages = {
      pendiente: "No hay solicitudes pendientes",
      aprobada: "No hay transacciones aprobadas",
      rechazada: "No hay transacciones rechazadas",
    };
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>${emptyMessages[status]}</p>
      </div>
    `;
  }

  const rows = transactions
    .map((transaction) => {
      const typeClass =
        transaction.type === "entrada" ? "badge-success" : "badge-warning";
      const productName =
        transaction.product_name || transaction.productName || "Producto";
      const productCode =
        transaction.product_code || transaction.productCode || "";
      const createdBy =
        transaction.created_by_name || transaction.createdBy || "Usuario";
      const transDate = transaction.created_at || transaction.date;

      return `
      <tr data-id="${transaction.id}">
        <td>${formatDate(transDate)}</td>
        <td>
          <span class="badge ${typeClass}">
            ${transaction.type === "entrada" ? "↓ Entrada" : "↑ Salida"}
          </span>
        </td>
        <td>
          <strong>${productName}</strong><br>
          <small class="text-muted">${productCode}</small>
        </td>
        <td>${transaction.quantity}</td>
        <td>${createdBy}</td>
        <td>${transaction.notes || "-"}</td>
        ${
          status === "pendiente"
            ? `
          <td>
            <div class="table-actions">
              <button class="btn btn-sm btn-success btn-approve" data-id="${transaction.id}">✓ Aprobar</button>
              <button class="btn btn-sm btn-danger btn-reject" data-id="${transaction.id}">✗ Rechazar</button>
            </div>
          </td>
        `
            : ""
        }
      </tr>
    `;
    })
    .join("");

  return `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Usuario</th>
            <th>Motivo</th>
            ${status === "pendiente" ? "<th>Acciones</th>" : ""}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function attachNotificationActionListeners() {
  document.querySelectorAll(".btn-approve").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const transactionId = this.dataset.id;
      await handleApproveTransaction(transactionId);
    });
  });

  document.querySelectorAll(".btn-reject").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const transactionId = this.dataset.id;
      await handleRejectTransaction(transactionId);
    });
  });
}

// ==================== MANEJADORES DE ACCIONES ====================

async function handleApproveTransaction(transactionId) {
  const userId = AppState.currentUser?.id;
  if (!userId) {
    showToast("Error: Usuario no autenticado", "error");
    return;
  }

  try {
    const result = await apiApproveTransaction(transactionId);
    if (result.success) {
      showToast(
        result.message || "Transacción aprobada correctamente",
        "success"
      );
      renderNotificationsModule();
      renderSidebar();
    } else {
      showToast(result.message || "Error al aprobar transacción", "error");
    }
  } catch (error) {
    console.error("Error aprobando transacción:", error);
    showToast("Error de conexión al aprobar", "error");
  }
}

async function handleRejectTransaction(transactionId) {
  const userId = AppState.currentUser?.id;
  if (!userId) {
    showToast("Error: Usuario no autenticado", "error");
    return;
  }

  if (!confirm("¿Está seguro de rechazar esta transacción?")) {
    return;
  }

  try {
    const result = await apiRejectTransaction(transactionId);
    if (result.success) {
      showToast(result.message || "Transacción rechazada", "success");
      renderNotificationsModule();
      renderSidebar();
    } else {
      showToast(result.message || "Error al rechazar transacción", "error");
    }
  } catch (error) {
    console.error("Error rechazando transacción:", error);
    showToast("Error de conexión al rechazar", "error");
  }
}
