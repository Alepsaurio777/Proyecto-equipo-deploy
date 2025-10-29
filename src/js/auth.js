// ==================== AUTENTICACIÓN ====================

// Login de usuario
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Llamar a la API PHP
    fetch('http://localhost/Proyecto-de-Equipo/api/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            AppState.currentUser = {
                username: data.data.user.username,
                role: data.data.user.role,
                fullName: data.data.user.full_name,
                email: data.data.user.email || '',
                phone: data.data.user.phone || '',
                address: data.data.user.address || ''
            };
            saveToLocalStorage('currentUser', AppState.currentUser);
            showToast('Bienvenido ' + data.data.user.full_name, 'success');
            showMainApp();
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error al conectar con el servidor', 'error');
    });
}

// Mostrar aplicación principal
async function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    await loadCategories();
    updateUserInfo();
    renderSidebar();
    loadModule(AppState.currentModule);
}

// Actualizar información del usuario
function updateUserInfo() {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    
    if (userName) userName.textContent = AppState.currentUser.fullName;
    if (userRole) {
        const roleNames = {
            'admin': 'Administrador',
            'cashier': 'Supervisor',
            'warehouse': 'Almacenista'
        };
        userRole.textContent = roleNames[AppState.currentUser.role] || AppState.currentUser.role;
    }
}

// Mostrar diálogo de logout
function showLogoutDialog() {
    document.getElementById('logoutDialog').classList.remove('hidden');
}

// Cerrar diálogo de logout
function closeLogoutDialog() {
    document.getElementById('logoutDialog').classList.add('hidden');
}

// Confirmar logout
function confirmLogout() {
    AppState.currentUser = null;
    AppState.currentModule = 'inventory';
    
    document.getElementById('logoutDialog').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    
    document.getElementById('loginForm').reset();
    showToast('Sesión cerrada correctamente', 'info');
}

// Mostrar modal de recuperación de contraseña
function showPasswordRecovery() {
    AppState.recoveryStep = 'pin';
    document.getElementById('passwordRecoveryModal').classList.remove('hidden');
    document.getElementById('pinStep').classList.remove('hidden');
    document.getElementById('passwordStep').classList.add('hidden');
    document.getElementById('recoveryActionBtn').textContent = 'Validar PIN';
    document.getElementById('adminPin').value = '';
}

// Cerrar modal de recuperación
function closePasswordRecovery() {
    document.getElementById('passwordRecoveryModal').classList.add('hidden');
    document.getElementById('adminPin').value = '';
    document.getElementById('recoveryUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Manejar acción de recuperación
function handleRecoveryAction() {
    showToast('Esta función no está disponible en este momento.', 'info');
}

// Mostrar modal de editar perfil
function showEditProfile() {
    document.getElementById('editProfileModal').classList.remove('hidden');
    document.getElementById('profileName').value = AppState.currentUser.fullName || '';
    document.getElementById('profileEmail').value = AppState.currentUser.email || '';
    document.getElementById('profilePhone').value = AppState.currentUser.phone || '';
    document.getElementById('profileAddress').value = AppState.currentUser.address || '';
}

// Cerrar modal de editar perfil
function closeEditProfile() {
    document.getElementById('editProfileModal').classList.add('hidden');
}

// Guardar perfil
function saveProfile() {
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const address = document.getElementById('profileAddress').value;
    
    if (!name) {
        showToast('El nombre es requerido', 'error');
        return;
    }
    
    AppState.currentUser.fullName = name;
    AppState.currentUser.email = email;
    AppState.currentUser.phone = phone;
    AppState.currentUser.address = address;
    
    updateUserInfo();
    closeEditProfile();
    showToast('Perfil actualizado correctamente', 'success');
}
