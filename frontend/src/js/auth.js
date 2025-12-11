// ==================== AUTENTICACIÓN ====================

// Login de usuario
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  const data = await apiLogin(username, password);
  if (data.success) {
    AppState.currentUser = {
      id: data.data.user.id,
      employeeId: data.data.user.employee_id,
      username: data.data.user.username,
      role: data.data.user.role,
      fullName: data.data.user.full_name,
      email: data.data.user.email || "",
      phone: data.data.user.phone || "",
      address: data.data.user.address || "",
    };
    saveToLocalStorage("currentUser", AppState.currentUser);
    showToast("Bienvenido " + data.data.user.full_name, "success");
    showMainApp();
  } else {
    showToast(data.message, "error");
  }
}

// Mostrar aplicación principal
async function showMainApp() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");

  await apiLoadCategories();
  updateUserInfo();
  renderSidebar();
  loadModule(AppState.currentModule);
}

// Actualizar información del usuario
function updateUserInfo() {
  const userName = document.getElementById("userName");
  const userRole = document.getElementById("userRole");

  if (userName) userName.textContent = AppState.currentUser.fullName;
  if (userRole) {
    const roleNames = {
      admin: "Administrador",
      cashier: "Supervisor",
      warehouse: "Almacenista",
    };
    userRole.textContent =
      roleNames[AppState.currentUser.role] || AppState.currentUser.role;
  }
}

// Mostrar diálogo de logout
function showLogoutDialog() {
  document.getElementById("logoutDialog").classList.remove("hidden");
}

// Cerrar diálogo de logout
function closeLogoutDialog() {
  document.getElementById("logoutDialog").classList.add("hidden");
}

// Confirmar logout
function confirmLogout() {
  AppState.currentUser = null;
  removeFromLocalStorage("currentUser");
  AppState.currentModule = "inventory";

  document.getElementById("logoutDialog").classList.add("hidden");
  document.getElementById("mainApp").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");

  document.getElementById("loginForm").reset();
  showToast("Sesión cerrada correctamente", "info");
}

// Mostrar modal de recuperación de contraseña
function showPasswordRecovery() {
  AppState.recoveryStep = "email";
  AppState.recoveryUserId = null;
  AppState.recoveryUsername = null;
  document.getElementById("passwordRecoveryModal").classList.remove("hidden");
  document.getElementById("pinStep").classList.add("hidden");
  document.getElementById("emailCodeStep").classList.remove("hidden");
  document.getElementById("verifyCodeStep").classList.add("hidden");
  document.getElementById("passwordStep").classList.add("hidden");
  document.getElementById("recoveryActionBtn").textContent = "Enviar Código";
  document.getElementById("adminPin").value = "";
  document.getElementById("recoveryEmailUsername").value = "";
  document.getElementById("verificationCode").value = "";
}

// Cerrar modal de recuperación
function closePasswordRecovery() {
  document.getElementById("passwordRecoveryModal").classList.add("hidden");
  document.getElementById("adminPin").value = "";
  document.getElementById("recoveryEmailUsername").value = "";
  document.getElementById("verificationCode").value = "";
  document.getElementById("recoveryUsername").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
  AppState.recoveryUserId = null;
  AppState.recoveryUsername = null;
  AppState.recoveryCodeCooldown = null; // Reset cooldown
}

// Manejar acción de recuperación (flujo de 3 pasos)
let isProcessingRecovery = false;
async function handleRecoveryAction() {
  // Evitar múltiples clics
  if (isProcessingRecovery) return;
  isProcessingRecovery = true;

  try {
    if (AppState.recoveryStep === "email") {
      await sendVerificationEmail();
    } else if (AppState.recoveryStep === "verify") {
      await verifyEmailCode();
    } else if (AppState.recoveryStep === "password") {
      await resetPassword();
    }
  } finally {
    isProcessingRecovery = false;
  }
}

// Paso 1: Validar PIN de administrador
async function validateAdminPin() {
  const pin = document.getElementById("adminPin").value;

  if (!pin) {
    showToast("Por favor ingresa el PIN del administrador", "error");
    return;
  }

  // PIN del administrador hardcodeado (puedes cambiarlo o hacerlo configurable)
  const ADMIN_PIN = "1234"; // TODO: Cambiar por configuración de BD

  if (pin !== ADMIN_PIN) {
    showToast("PIN incorrecto", "error");
    return;
  }

  // PIN correcto, pasar al paso 2 (solicitar código por email)
  document.getElementById("pinStep").classList.add("hidden");
  document.getElementById("emailCodeStep").classList.remove("hidden");
  document.getElementById("recoveryActionBtn").textContent = "Enviar Código";
  AppState.recoveryStep = "email";
  showToast(
    "PIN validado. Ingresa tu usuario para recibir el código",
    "success"
  );
}

// Paso 2: Enviar código de verificación por email
async function sendVerificationEmail() {
  const username = document.getElementById("recoveryEmailUsername").value;

  if (!username) {
    showToast("Por favor ingresa tu nombre de usuario", "error");
    return;
  }

  // Verificar cooldown (60 segundos entre solicitudes)
  const COOLDOWN_SECONDS = 60;
  const now = Date.now();
  if (
    AppState.recoveryCodeCooldown &&
    now - AppState.recoveryCodeCooldown < COOLDOWN_SECONDS * 1000
  ) {
    const remainingSeconds = Math.ceil(
      (COOLDOWN_SECONDS * 1000 - (now - AppState.recoveryCodeCooldown)) / 1000
    );
    showToast(
      `⏱️ Espera ${remainingSeconds} segundos antes de solicitar otro código`,
      "error"
    );
    return;
  }

  // Deshabilitar botón mientras se envía
  const btn = document.getElementById("recoveryActionBtn");
  btn.disabled = true;
  btn.textContent = "Enviando...";

  // Llamar al API para enviar código
  const result = await apiSendVerificationCode(username);

  btn.disabled = false;

  if (result.success) {
    // Guardar timestamp del último código enviado
    AppState.recoveryCodeCooldown = Date.now();
    AppState.recoveryUsername = username;

    // Mostrar email enmascarado
    document.getElementById("emailHint").value =
      result.data.email_hint || "tu email registrado";

    // Pasar al paso 2 (verificar código)
    document.getElementById("emailCodeStep").classList.add("hidden");
    document.getElementById("verifyCodeStep").classList.remove("hidden");
    document.getElementById("recoveryActionBtn").textContent =
      "Verificar Código";
    AppState.recoveryStep = "verify";

    // MODO DESARROLLO: Mostrar código en la interfaz para testing
    if (result.data.debug_code) {
      showToast(
        `✅ Código generado: ${result.data.debug_code} (válido por ${result.data.expires_in_minutes} minutos)`,
        "success"
      );

      // Prellenar el campo con el código para facilitar testing
      //document.getElementById("verificationCode").value =
      result.data.debug_code;
    } else {
      showToast(
        "Código enviado a tu email. Revisa tu bandeja de entrada.",
        "success"
      );
    }
  } else {
    btn.textContent = "Enviar Código";
    showToast(result.message || "Error al enviar código", "error");
  }
}

// Función para reenviar código
async function resendVerificationCode() {
  if (!AppState.recoveryUsername) {
    showToast("Error al reenviar código", "error");
    return;
  }

  // Verificar cooldown (60 segundos entre solicitudes)
  const COOLDOWN_SECONDS = 60;
  const now = Date.now();
  if (
    AppState.recoveryCodeCooldown &&
    now - AppState.recoveryCodeCooldown < COOLDOWN_SECONDS * 1000
  ) {
    const remainingSeconds = Math.ceil(
      (COOLDOWN_SECONDS * 1000 - (now - AppState.recoveryCodeCooldown)) / 1000
    );
    showToast(
      `⏱️ Espera ${remainingSeconds} segundos antes de solicitar otro código`,
      "error"
    );
    return;
  }

  const result = await apiSendVerificationCode(AppState.recoveryUsername);

  if (result.success) {
    // Guardar timestamp del último código enviado
    AppState.recoveryCodeCooldown = Date.now();

    // MODO DESARROLLO: Mostrar nuevo código
    if (result.data.debug_code) {
      showToast(
        `✅ Nuevo código: ${result.data.debug_code} (válido por ${result.data.expires_in_minutes} minutos)`,
        "success"
      );
      document.getElementById("verificationCode").value =
        result.data.debug_code;
    } else {
      showToast("Código reenviado. Revisa tu email.", "success");
    }
  } else {
    showToast(result.message || "Error al reenviar código", "error");
  }
}

// Paso 2: Verificar código enviado por email
async function verifyEmailCode() {
  const code = document.getElementById("verificationCode").value;

  if (!code || code.length !== 6) {
    showToast("Por favor ingresa el código de 6 dígitos", "error");
    return;
  }

  // Deshabilitar botón mientras se verifica
  const btn = document.getElementById("recoveryActionBtn");
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = "Verificando...";

  // Llamar al API para verificar código
  const result = await apiVerifyEmailCode(AppState.recoveryUsername, code);

  btn.disabled = false;

  if (result.success) {
    // Código correcto, pasar al paso 3 (cambiar contraseña)
    AppState.recoveryUserId = result.data.user_id;
    document.getElementById("verifyCodeStep").classList.add("hidden");
    document.getElementById("passwordStep").classList.remove("hidden");
    document.getElementById("recoveryUsername").value =
      AppState.recoveryUsername;
    document.getElementById("recoveryActionBtn").textContent =
      "Cambiar Contraseña";
    AppState.recoveryStep = "password";
    showToast("Código verificado correctamente", "success");
  } else {
    btn.textContent = originalText;
    showToast(result.message || "Código incorrecto o expirado", "error");
  }
}

// Paso 3: Cambiar contraseña
async function resetPassword() {
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!newPassword || !confirmPassword) {
    showToast("Por favor completa todos los campos", "error");
    return;
  }

  if (newPassword.length < 6) {
    showToast("La contraseña debe tener al menos 6 caracteres", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("Las contraseñas no coinciden", "error");
    return;
  }

  // Deshabilitar botón mientras se cambia la contraseña
  const btn = document.getElementById("recoveryActionBtn");
  btn.disabled = true;
  btn.textContent = "Cambiando...";

  // Llamar al API para cambiar contraseña
  const result = await apiChangePassword(
    AppState.recoveryUserId,
    null, // No se necesita contraseña actual en recuperación
    newPassword
  );

  btn.disabled = false;
  btn.textContent = "Cambiar Contraseña";

  if (result.success) {
    showToast(
      "Contraseña cambiada exitosamente. Ahora puedes iniciar sesión",
      "success"
    );
    closePasswordRecovery();
  } else {
    showToast(result.message || "Error al cambiar contraseña", "error");
  }
}

// Mostrar modal de editar perfil
function showEditProfile() {
  document.getElementById("editProfileModal").classList.remove("hidden");
  document.getElementById("profileName").value =
    AppState.currentUser.fullName || "";
  document.getElementById("profileEmail").value =
    AppState.currentUser.email || "";
  document.getElementById("profilePhone").value =
    AppState.currentUser.phone || "";
  document.getElementById("profileAddress").value =
    AppState.currentUser.address || "";
}

// Cerrar modal de editar perfil
function closeEditProfile() {
  document.getElementById("editProfileModal").classList.add("hidden");
}

// Guardar perfil
async function saveProfile() {
  const name = document.getElementById("profileName").value;
  const email = document.getElementById("profileEmail").value;
  const phone = document.getElementById("profilePhone").value;
  const address = document.getElementById("profileAddress").value;

  if (!name) {
    showToast("El nombre es requerido", "error");
    return;
  }

  // Validación de Email (básica)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    showToast("El formato del correo electrónico no es válido", "error");
    return;
  }

  // Validación de Teléfono
  const phoneCheck = phone.replace(/[^0-9]/g, '');
  if (phone && phoneCheck.length < 7) {
    showToast("El número de teléfono parece incompleto", "error");
    return;
  }

  // Verificar que el usuario tenga un employeeId
  if (!AppState.currentUser.employeeId) {
    showToast(
      "No se puede actualizar: usuario sin registro de empleado",
      "error"
    );
    return;
  }

  // Preparar datos para la API (mismo formato que employees.php espera)
  const employeeData = {
    name: name,
    email: email,
    phone: phone,
    address: address,
    // No enviar campos que el usuario no debe modificar (position, salary, etc.)
  };

  // Llamar a la API para actualizar
  const response = await apiUpdateEmployee(
    AppState.currentUser.employeeId,
    employeeData
  );

  if (response.success) {
    // Actualizar el estado local con los nuevos datos
    AppState.currentUser.fullName = name;
    AppState.currentUser.email = email;
    AppState.currentUser.phone = phone;
    AppState.currentUser.address = address;
    saveToLocalStorage("currentUser", AppState.currentUser);

    updateUserInfo();
    closeEditProfile();
    showToast("Perfil actualizado correctamente", "success");
  } else {
    showToast(response.message || "Error al actualizar perfil", "error");
  }
}

// Mostrar modal de cambiar contraseña
function showChangePasswordModal() {
  closeEditProfile();
  document.getElementById("changePasswordForm").reset();
  document.getElementById("changePasswordModal").classList.remove("hidden");
}

// Cerrar modal de cambiar contraseña
function closeChangePasswordModal() {
  document.getElementById("changePasswordModal").classList.add("hidden");
  document.getElementById("changePasswordForm").reset();
}

// Guardar nueva contraseña
async function saveNewPassword() {
  const currentPassword = document.getElementById(
    "changeCurrentPassword"
  ).value;
  const newPassword = document.getElementById("changeNewPassword").value;
  const confirmPassword = document.getElementById(
    "changeConfirmPassword"
  ).value;

  // Validaciones
  if (!currentPassword || !newPassword || !confirmPassword) {
    showToast("Por favor completa todos los campos", "error");
    return;
  }

  if (newPassword.length < 6) {
    showToast("La nueva contraseña debe tener al menos 6 caracteres", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("Las contraseñas no coinciden", "error");
    return;
  }

  if (currentPassword === newPassword) {
    showToast("La nueva contraseña debe ser diferente a la actual", "error");
    return;
  }

  // Llamar a la API
  const result = await apiChangePassword(
    AppState.currentUser.id,
    currentPassword,
    newPassword
  );

  if (result.success) {
    showToast("Contraseña actualizada correctamente", "success");
    closeChangePasswordModal();
  } else {
    showToast(result.message || "Error al cambiar contraseña", "error");
  }
}
