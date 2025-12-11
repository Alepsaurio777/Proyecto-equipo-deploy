// ==================== MÓDULO DE NOTIFICACIONES ====================

// Nota: La carga de transacciones ahora se hace desde api.js usando apiLoadTransactions()

function renderNotificationsModule() {
  const content = document.getElementById("mainContent");

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
                <div class="kpi-value text-warning">${
                  pendingTransactions.length
                }</div>
                <div class="kpi-description">Requieren revisión</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-label">Aprobadas</span>
                    <span class="kpi-icon">✓</span>
                </div>
                <div class="kpi-value text-success">${
                  approvedTransactions.length
                }</div>
                <div class="kpi-description">Transacciones completadas</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-label">Rechazadas</span>
                    <span class="kpi-icon">✗</span>
                </div>
                <div class="kpi-value text-danger">${
                  rejectedTransactions.length
                }</div>
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
                <button class="tab-button" data-tab="approved">
                    ✓ Aprobadas
                </button>
                <button class="tab-button" data-tab="rejected">
                    ✗ Rechazadas
                </button>
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

  setupTabListeners();
}

function renderNotificationsTable(transactions, status) {
  if (transactions.length === 0) {
    const emptyMessages = {
      pendiente: "No hay solicitudes pendientes",
      aprobada: "No hay transacciones aprobadas",
      rechazada: "No hay transacciones rechazadas",
    };
    return `<div class="empty-state"><div class="empty-state-icon">📭</div><p>${emptyMessages[status]}</p></div>`;
  }

  let html = `
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
                <tbody>
    `;

  transactions.forEach((transaction) => {
    const typeClass =
      transaction.type === "entrada" ? "badge-success" : "badge-warning";
    const productName =
      transaction.product_name || transaction.productName || "";
    const productCode =
      transaction.product_code || transaction.productCode || "";
    const createdBy =
      transaction.created_by_name || transaction.createdBy || "";
    const transDate = transaction.created_at || transaction.date;

    html += `
            <tr>
                <td>${formatDate(transDate)}</td>
                <td><span class="badge ${typeClass}">${transaction.type.toUpperCase()}</span></td>
                <td>
                    <strong>${productName}</strong><br>
                    <small>${productCode}</small>
                </td>
                <td><strong>${transaction.quantity}</strong></td>
                <td>${createdBy}</td>
                <td>${transaction.reason || transaction.motivo || "-"}</td>
                ${
                  status === "pendiente"
                    ? `
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-success" onclick="handleApproveTransaction('${transaction.id}')" title="Aprobar">
                                <svg class="svg-icon" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="handleRejectTransaction('${transaction.id}')" title="Rechazar">
                                <svg class="svg-icon" viewBox="0 0 24 24">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </td>
                `
                    : ""
                }
            </tr>
        `;
  });

  html += "</tbody></table></div>";
  return html;
}

async function handleApproveTransaction(transactionId) {
  const result = await apiApproveTransaction(transactionId);
  if (result.success) {
    showToast("Transacción aprobada correctamente", "success");
    renderNotificationsModule();
  } else {
    showToast(result.message || "Error al aprobar la transacción", "error");
  }
}

async function handleRejectTransaction(transactionId) {
  if (confirm("¿Estás seguro de rechazar esta transacción?")) {
    const result = await apiRejectTransaction(transactionId);
    if (result.success) {
      showToast("Transacción rechazada", "info");
      renderNotificationsModule();
    } else {
      showToast(result.message || "Error al rechazar la transacción", "error");
    }
  }
}

// Obtener número de notificaciones pendientes
function getPendingNotificationsCount() {
  return AppState.transactions.filter((t) => t.status === "pendiente").length;
}
