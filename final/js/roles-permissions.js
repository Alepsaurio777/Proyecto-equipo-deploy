/**
 * Módulo de Roles y Permisos
 * Gestión de permisos granulares por rol
 */

// Permisos disponibles con sus etiquetas
const AVAILABLE_PERMISSIONS = [
    { id: 'products.create', label: 'Registrar productos', icon: '➕' },
    { id: 'products.update', label: 'Modificar productos', icon: '✏️' },
    { id: 'products.delete', label: 'Eliminar productos', icon: '🗑️' },
    { id: 'products.view', label: 'Consultar productos', icon: '👁️' }
];

/**
 * Renderiza el módulo de Roles y Permisos
 */
function renderRolesPermissionsModule() {
    const content = document.getElementById('mainContent');

    content.innerHTML = `
        <div class="content-header-actions">
            <div>
                <h2>🔐 Roles y Permisos</h2>
                <p class="text-muted">Configura los permisos de cada rol del sistema</p>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header" style="padding-bottom: 1rem; border-bottom: 1px solid var(--gray-200); margin-bottom: 1rem;">
                <h3 style="margin: 0; font-size: 1rem;">📋 Permisos de Productos</h3>
                <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">
                    Define qué acciones puede realizar cada rol sobre los productos
                </p>
            </div>
            <div id="permissionsTableContainer">
                <div class="empty-state">
                    <p>Cargando permisos...</p>
                </div>
            </div>
        </div>
    `;

    // Cargar permisos desde el servidor
    loadRolePermissions();
}

/**
 * Carga los permisos desde el servidor
 */
async function loadRolePermissions() {
    try {
        const response = await fetch(`${API_BASE_URL}/permissions.php`);
        const data = await response.json();

        if (data.success) {
            AppState.rolesWithPermissions = data.data;
            renderPermissionsTable();
        } else {
            showToast('Error al cargar permisos: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading permissions:', error);
        showToast('Error de conexión al cargar permisos', 'error');
    }
}

/**
 * Renderiza la tabla de permisos
 */
function renderPermissionsTable() {
    const container = document.getElementById('permissionsTableContainer');
    const roles = AppState.rolesWithPermissions || [];

    if (roles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No se encontraron roles</p>
            </div>
        `;
        return;
    }

    let html = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th style="width: 200px;">Rol</th>
                        ${AVAILABLE_PERMISSIONS.map(p => `
                            <th style="text-align: center;">
                                <span title="${p.label}">${p.icon}</span>
                                <div style="font-size: 0.75rem; font-weight: normal; color: var(--gray-500);">
                                    ${p.label}
                                </div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    roles.forEach(role => {
        html += `
            <tr>
                <td>
                    <strong>${escapeHtml(role.name)}</strong>
                </td>
                ${AVAILABLE_PERMISSIONS.map(perm => {
            const isActive = role.permissions[perm.id] === true;
            const checkboxId = `perm_${role.id}_${perm.id.replace('.', '_')}`;
            return `
                        <td style="text-align: center;">
                            <label class="permission-toggle" for="${checkboxId}">
                                <input 
                                    type="checkbox" 
                                    id="${checkboxId}"
                                    ${isActive ? 'checked' : ''}
                                    onchange="togglePermission(${role.id}, '${perm.id}', this.checked)"
                                >
                                <span class="permission-slider"></span>
                            </label>
                        </td>
                    `;
        }).join('')}
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: var(--gray-100); border-radius: var(--border-radius);">
            <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">
                💡 <strong>Nota:</strong> Los cambios se guardan automáticamente al activar o desactivar un permiso.
            </p>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Actualiza un permiso en el servidor
 */
async function togglePermission(roleId, permission, active) {
    try {
        const response = await fetch(`${API_BASE_URL}/permissions.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roleId: roleId,
                permission: permission,
                active: active
            })
        });

        const data = await response.json();

        if (data.success) {
            // Actualizar estado local
            const role = AppState.rolesWithPermissions.find(r => r.id === roleId);
            if (role) {
                role.permissions[permission] = active;
            }

            // Actualizar permisos de acción
            await loadActionPermissionsForCurrentUser();

            // Verificar si el permiso afecta al usuario actual
            const currentUserRoleId = AppState.currentUser?.roleId;
            if (currentUserRoleId === roleId) {
                // El permiso afecta al usuario actual - recargar página para aplicar cambios
                showToast('Permiso actualizado ✓ Recargando para aplicar cambios...', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showToast('Permiso actualizado ✓', 'success');
            }
        } else {
            showToast('Error: ' + data.message, 'error');
            // Revertir checkbox
            loadRolePermissions();
        }
    } catch (error) {
        console.error('Error updating permission:', error);
        showToast('Error de conexión', 'error');
        loadRolePermissions();
    }
}

/**
 * Carga los permisos de acción para el usuario actual
 */
async function loadActionPermissionsForCurrentUser() {
    if (!AppState.currentUser) return;

    try {
        const response = await fetch(`${API_BASE_URL}/permissions.php`);
        const data = await response.json();

        if (data.success) {
            // Guardar permisos indexados por roleId
            AppState.actionPermissions = {};
            data.data.forEach(role => {
                AppState.actionPermissions[role.id] = role.permissions;
            });
        }
    } catch (error) {
        console.error('Error loading action permissions:', error);
    }
}

// ==================== POLLING DE PERMISOS ====================

// Intervalo de polling (en milisegundos)
const PERMISSION_POLL_INTERVAL = 5000; // 5 segundos
let permissionPollingId = null;

/**
 * Inicia el polling de permisos
 */
function startPermissionPolling() {
    if (permissionPollingId) {
        clearInterval(permissionPollingId);
    }

    console.log('🔄 Iniciando polling de permisos (cada 30s)');

    permissionPollingId = setInterval(async () => {
        await checkPermissionChanges();
    }, PERMISSION_POLL_INTERVAL);
}

/**
 * Detiene el polling de permisos
 */
function stopPermissionPolling() {
    if (permissionPollingId) {
        clearInterval(permissionPollingId);
        permissionPollingId = null;
        console.log('⏹️ Polling de permisos detenido');
    }
}

/**
 * Verifica si los permisos del usuario actual han cambiado
 */
async function checkPermissionChanges() {
    if (!AppState.currentUser || !AppState.currentUser.roleId) return;

    const currentRoleId = AppState.currentUser.roleId;
    const oldPermissions = AppState.actionPermissions?.[currentRoleId] || {};

    try {
        const response = await fetch(`${API_BASE_URL}/permissions.php`);
        const data = await response.json();

        if (data.success) {
            // Buscar los permisos del rol actual
            const currentRole = data.data.find(r => r.id === currentRoleId);
            if (!currentRole) return;

            const newPermissions = currentRole.permissions || {};

            // Comparar permisos
            const permissionKeys = ['products.create', 'products.update', 'products.delete', 'products.view'];
            let hasChanges = false;

            for (const key of permissionKeys) {
                if (oldPermissions[key] !== newPermissions[key]) {
                    console.log(`🔔 Permiso cambiado: ${key} = ${newPermissions[key]}`);
                    hasChanges = true;
                    break;
                }
            }

            if (hasChanges) {
                showToast('⚠️ Tus permisos han cambiado. Recargando...', 'info');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Error checking permission changes:', error);
    }
}

// Exponer funciones globalmente
window.startPermissionPolling = startPermissionPolling;
window.stopPermissionPolling = stopPermissionPolling;
