# 🔧 Sistema de Gestión Integral - Ferretería El Tornillo

Sistema completo de gestión de inventario, empleados, transacciones y reportes para ferreterías. Desarrollado con JavaScript vanilla, PHP y MySQL.

---

## 📋 Requisitos Previos

### 1. XAMPP

- **Versión recomendada:** XAMPP 8.2.x o superior
- **Componentes necesarios:**
  - Apache (servidor web)
  - MySQL/MariaDB (base de datos)
  - PHP 8.2+ (con extensión `gd` habilitada)
- **Descarga:** [https://www.apachefriends.org](https://www.apachefriends.org)

### 2. Node.js

- **Versión recomendada:** v18.x o superior
- **Descarga:** [https://nodejs.org](https://nodejs.org)
- Se usa para el servidor de desarrollo (Vite) y gestión de dependencias del frontend

### 3. Composer (Gestor de dependencias de PHP)

- **Necesario para:** PHPMailer (envío de emails) y otras librerías PHP
- **Instalación:** Ver sección de configuración más abajo

---

## 🚀 Instalación Paso a Paso

### Paso 1: Clonar el Proyecto

```bash
# Clona el repositorio dentro de htdocs de XAMPP
cd C:\xampp\htdocs
git clone https://github.com/saiko3000/Proyecto-de-Equipo.git
cd Proyecto-de-Equipo
```

### Paso 2: Instalar Dependencias del Frontend

```bash
# Instalar paquetes de Node.js
npm install
```

### Paso 3: Configurar PHP en el PATH (Importante)

Para que Composer funcione correctamente, PHP debe estar en el PATH del sistema.

**Verificar si PHP ya está en el PATH:**

```bash
php -v
```

Si ves la versión de PHP (ej: `PHP 8.2.12`), ya está configurado. **Si no:**

**Agregar PHP al PATH (Windows):**

1. **Opción A - PowerShell (Temporal, solo para esta sesión):**

   ```powershell
   $env:Path += ";C:\xampp\php"
   php -v
   ```

2. **Opción B - Variables de Entorno (Permanente):**

   - Presiona `Win + R`, escribe `sysdm.cpl` y presiona Enter
   - Ve a la pestaña **"Opciones avanzadas"**
   - Click en **"Variables de entorno"**
   - En **"Variables del sistema"**, selecciona **Path** y click en **"Editar"**
   - Click en **"Nuevo"** y agrega: `C:\xampp\php`
   - Click en **"Aceptar"** en todas las ventanas
   - **Cierra y vuelve a abrir** PowerShell/CMD para que tome efecto

3. **Opción C - PowerShell Administrativo (Permanente):**
   ```powershell
   # Ejecutar PowerShell como Administrador
   [Environment]::SetEnvironmentVariable(
       "Path",
       [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\xampp\php",
       "Machine"
   )
   ```
   **Después reinicia tu terminal** para que tome efecto.

### Paso 4: Instalar Composer (Si no lo tienes)

**Opción A: Instalación Global (Recomendada)**

1. Descarga el instalador: [https://getcomposer.org/Composer-Setup.exe](https://getcomposer.org/Composer-Setup.exe)
2. Ejecuta el instalador y sigue las instrucciones
3. Asegúrate de que seleccione el PHP de XAMPP (`C:\xampp\php\php.exe`)
4. Verifica la instalación:
   ```bash
   composer --version
   ```

**Opción B: Instalación Local (Para este proyecto únicamente)**

```bash
# Descargar composer en la carpeta api/
cd api
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
cd ..
```

### Paso 5: Instalar Dependencias de PHP

**Si instalaste Composer globalmente:**

```bash
cd api
composer install
```

**Si instalaste Composer localmente:**

```bash
cd api
php composer.phar install
```

**⚠️ Posibles Errores y Soluciones:**

**Error: "php: The term 'php' is not recognized"**

- **Causa:** PHP no está en el PATH
- **Solución:** Regresa al Paso 3 y configura PHP en el PATH

**Error: "composer: The term 'composer' is not recognized"**

- **Causa:** Composer no está instalado globalmente
- **Solución:** Usa `php composer.phar` en lugar de `composer`

**Error: "ext-gd is missing from your system"**

- **Causa:** Extensión GD de PHP no habilitada
- **Solución:** Ver sección "Habilitar Extensión GD" más abajo

**Error: "Your requirements could not be resolved"**

- **Causa:** Versión de PHP incompatible
- **Solución:** Verifica que uses PHP 8.2+: `php -v`

Esto instalará:

- ✅ PHPMailer (envío de emails via SMTP)
- ✅ Otras dependencias necesarias

### Paso 6: Configurar la Base de Datos

1. **Inicia XAMPP:**

   - Abre el XAMPP Control Panel
   - Inicia **Apache** y **MySQL**

2. **Crea la base de datos:**

   - Abre phpMyAdmin: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
   - Crea una nueva base de datos llamada: `ferreteria_db`
   - Importa el archivo: `api/database2.sql`

   **Alternativa por línea de comandos:**

   ```bash
   C:\xampp\mysql\bin\mysql.exe -u root -p123 -e "CREATE DATABASE IF NOT EXISTS ferreteria_db;"
   C:\xampp\mysql\bin\mysql.exe -u root -p123 ferreteria_db < api/database2.sql
   ```

### Paso 6: Configurar Variables de Entorno

1. **Copia el archivo de ejemplo:**

   ```bash
   copy .env.example .env
   ```

2. **Edita el archivo `.env`** con tus credenciales:

   ```properties
   # ==================== BASE DE DATOS ====================
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=123
   DB_NAME=ferreteria_db

   # ==================== EMAIL (SMTP) ====================
   MAIL_PROVIDER=gmail
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=tls
   SMTP_USERNAME=tu-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   MAIL_FROM_ADDRESS=tu-email@gmail.com
   MAIL_FROM_NAME=Ferretería El Tornillo
   ```

3. **Configura el email (opcional pero recomendado):**
   - Ve a: [https://myaccount.google.com/security](https://myaccount.google.com/security)
   - Activa **Verificación en 2 pasos**
   - Genera una **Contraseña de aplicación** para "Correo"
   - Copia la contraseña de 16 caracteres en `SMTP_PASSWORD`
   - **Guía completa:** Ver archivo `INICIO_RAPIDO_EMAIL.md`

---

## ▶️ Ejecutar el Proyecto

### 1. Iniciar Servicios de XAMPP

- Abre **XAMPP Control Panel**
- Inicia **Apache** (puerto 80)
- Inicia **MySQL** (puerto 3306)

### 2. Iniciar Servidor de Desarrollo (Frontend)

```bash
npm run dev
```

Esto iniciará Vite en [http://localhost:3000](http://localhost:3000)

### 3. Acceder a la Aplicación

Abre tu navegador en: **[http://localhost:3000](http://localhost:3000)**

**Usuarios por defecto:**

- **Usuario:** `admin` / **Contraseña:** `admin123` (Administrador)
- **Usuario:** `cajero1` / **Contraseña:** `cajero123` (Supervisor)
- **Usuario:** `almacen1` / **Contraseña:** `almacen123` (Almacenista)

---

## 🏗️ Estructura del Proyecto

```
Proyecto-de-Equipo/
├── api/                          # Backend PHP
│   ├── vendor/                   # Dependencias de Composer (no subir a git)
│   ├── composer.json             # Definición de dependencias PHP
│   ├── composer.lock             # Versiones exactas de dependencias
│   ├── config.php                # Configuración de BD y CORS
│   ├── EmailService.php          # Servicio de envío de emails
│   ├── login.php                 # Endpoint de autenticación
│   ├── products.php              # CRUD de productos
│   ├── employees.php             # CRUD de empleados
│   ├── transactions.php          # Gestión de transacciones
│   ├── password_recovery.php     # Recuperación de contraseña
│   ├── database2.sql             # Estructura de la base de datos
│   └── test-email.php            # Script de prueba de emails
│
├── src/                          # Frontend
│   ├── index.html                # HTML principal
│   ├── index.css                 # Estilos globales
│   ├── js/
│   │   ├── app.js                # Punto de entrada de la aplicación
│   │   ├── auth.js               # Autenticación y sesiones
│   │   ├── api.js                # Llamadas a la API
│   │   ├── inventory.js          # Módulo de inventario
│   │   ├── employees.js          # Módulo de empleados
│   │   ├── reports.js            # Módulo de reportes
│   │   ├── notifications.js      # Gestión de notificaciones
│   │   ├── ui.js                 # Componentes de interfaz
│   │   └── utils.js              # Utilidades
│   └── styles/
│       └── globals.css           # Variables CSS
│
├── .env                          # Configuración local (NO subir a git)
├── .env.example                  # Plantilla de configuración
├── .gitignore                    # Archivos ignorados por git
├── package.json                  # Dependencias de Node.js
├── vite.config.mts               # Configuración de Vite
├── README.md                     # Este archivo
├── INICIO_RAPIDO_EMAIL.md        # Guía rápida de configuración de emails
└── GUIA_CONFIGURACION_EMAIL.md   # Guía completa de emails
```

---

## 🔧 Configuración Avanzada

### Habilitar Extensión GD de PHP (Requerida)

Si Composer muestra errores sobre extensión `gd` faltante:

1. **Edita `php.ini`:**

   ```
   C:\xampp\php\php.ini
   ```

2. **Busca y descomenta la línea:**

   ```ini
   ;extension=gd
   ```

   Cambiar a:

   ```ini
   extension=gd
   ```

3. **Reinicia Apache** desde XAMPP Control Panel

4. **Verifica que se habilitó:**

   ```bash
   php -m | findstr gd
   ```

   Debería mostrar: `gd`

### Configurar Límites de PHP (Recomendado)

Para evitar errores de memoria o timeout durante operaciones grandes:

**Edita `C:\xampp\php\php.ini`:**

```ini
; Límites de memoria y tiempo
memory_limit = 256M          ; Aumentar si hay errores de memoria
max_execution_time = 300     ; Tiempo máximo de ejecución (5 minutos)
upload_max_filesize = 20M    ; Tamaño máximo de archivos
post_max_size = 20M          ; Tamaño máximo de POST

; Mostrar errores (solo desarrollo)
display_errors = On
error_reporting = E_ALL
```

**Reinicia Apache** después de cambiar `php.ini`.

### Recargar Variables de Entorno en Terminal

Después de configurar PHP en el PATH, la terminal actual no lo reconocerá hasta que:

**Opción 1: Cierra y abre nuevamente la terminal** (Recomendado)

**Opción 2: Recarga manualmente (PowerShell):**

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

### Solucionar Conflicto de Puertos

**Apache no inicia (Puerto 80 ocupado):**

1. **Ver qué proceso usa el puerto 80:**

   ```powershell
   netstat -ano | findstr :80
   ```

2. **Si es Apache de WSL:**

   ```bash
   wsl sudo service apache2 stop
   ```

3. **Si es otro servicio (ej: Skype, IIS):**
   - Detén el servicio desde el Administrador de Tareas
   - O cambia el puerto de Apache en `C:\xampp\apache\conf\httpd.conf`:
     ```apache
     Listen 8080  # Cambiar de 80 a 8080
     ```

**MySQL no inicia (Puerto 3306 ocupado):**

1. **Ver qué proceso usa el puerto 3306:**

   ```powershell
   netstat -ano | findstr :3306
   ```

2. **Cambia el puerto en `C:\xampp\mysql\bin\my.ini`:**

   ```ini
   [mysqld]
   port=3307
   ```

3. **Actualiza `.env`:**

   ```properties
   DB_HOST=localhost:3307
   ```

### Configurar Permisos de Carpetas

Si hay errores de permisos al crear archivos (logs, cache, etc.):

```bash
# Dar permisos a carpetas del proyecto
icacls "C:\xampp\htdocs\Proyecto-de-Equipo" /grant Users:F /T
```

### Cambiar Puerto de Vite (si 3000 está ocupado)

Edita `vite.config.mts`:

```typescript
server: {
  port: 3001,  // Cambia a otro puerto
  open: true,
}
```

### Cambiar URL de la API

Si Apache corre en un puerto diferente (ej: 8080):

1. Edita `src/js/api.js`:
   ```javascript
   const API_BASE_URL = "http://localhost:8080/Proyecto-de-Equipo/api";
   ```

---

## 🧪 Probar el Sistema de Emails

Verifica que la configuración SMTP funciona:

```bash
cd api
php test-email.php tu-email@gmail.com
```

Deberías ver:

```
✅ EMAIL ENVIADO EXITOSAMENTE
```

Y recibir un email de prueba en tu bandeja de entrada.

---

## 🛠️ Comandos Útiles

### Frontend (Node.js)

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de build de producción
```

### Backend (Composer)

```bash
# Si tienes Composer global:
composer install     # Instalar dependencias
composer update      # Actualizar dependencias

# Si usas composer.phar local:
php composer.phar install
php composer.phar update
```

### Base de Datos

```bash
# Importar base de datos
C:\xampp\mysql\bin\mysql.exe -u root -p123 ferreteria_db < api/database2.sql

# Backup de base de datos
C:\xampp\mysql\bin\mysqldump.exe -u root -p123 ferreteria_db > backup.sql

# Limpiar notificaciones de prueba
C:\xampp\mysql\bin\mysql.exe -u root -p123 -e "source api/clean_notifications.sql"
```

---

## 🐛 Solución de Problemas Comunes

### Error: "php: The term 'php' is not recognized"

**Causa:** PHP no está en el PATH del sistema

**Solución:**

```powershell
# Temporal (solo esta sesión):
$env:Path += ";C:\xampp\php"

# Permanente: Ver "Paso 3: Configurar PHP en el PATH"
```

### Error: "composer: The term 'composer' is not recognized"

**Causa:** Composer no está instalado globalmente

**Solución:**

```bash
# Usa composer.phar local en su lugar:
cd api
php composer.phar install
```

### Error: "ext-gd is missing from your system"

**Causa:** Extensión GD de PHP no está habilitada

**Solución:**

1. Abre `C:\xampp\php\php.ini`
2. Busca `;extension=gd` y quita el `;`
3. Guarda el archivo
4. Reinicia Apache desde XAMPP Control Panel
5. Verifica: `php -m | findstr gd`

### Error: "Your requirements could not be resolved"

**Causa:** Versión de PHP incompatible

**Solución:**

```bash
# Verifica tu versión de PHP:
php -v

# Debe ser PHP 8.2 o superior
# Si no, actualiza XAMPP
```

### Error: "CORS policy blocked"

**Causa:** Apache de WSL interfiriendo con XAMPP

**Solución:**

```bash
# Detener Apache de WSL
wsl sudo service apache2 stop

# Verificar que XAMPP Apache esté corriendo en puerto 80
```

### Error: "Class PHPMailer not found"

**Causa:** Dependencias de Composer no instaladas

**Solución:**

```bash
cd api
composer install
# O si usas composer local:
php composer.phar install
```

### Error: "Access denied for user 'root'"

**Causa:** Contraseña de MySQL incorrecta

**Solución:**

1. Abre `.env` y verifica `DB_PASS`
2. O cambia la contraseña de MySQL desde phpMyAdmin

### Email no se envía

**Causa:** Credenciales SMTP incorrectas

**Solución:**

1. Verifica que usas **Contraseña de aplicación** de Gmail (no tu contraseña normal)
2. Revisa que la verificación en 2 pasos esté activa
3. Lee `INICIO_RAPIDO_EMAIL.md` para más detalles

### Puerto 3000 ya en uso

**Solución:**

```bash
# Matar proceso en puerto 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <numero_de_pid> /F

# O cambiar puerto en vite.config.mts
```

### Error: "Failed to fetch" o 404 Not Found

**Causa:** Apache no está corriendo o la URL de la API es incorrecta

**Solución:**

1. Verifica que Apache esté corriendo en XAMPP Control Panel
2. Verifica que la URL en `src/js/api.js` sea correcta:
   ```javascript
   const API_BASE_URL = "http://localhost/Proyecto-de-Equipo/api";
   ```
3. Prueba acceder manualmente: `http://localhost/Proyecto-de-Equipo/api/products.php`

### Error: "Access denied for user 'root'@'localhost'"

**Causa:** Contraseña de MySQL incorrecta en `.env`

**Solución:**

1. Abre `.env` y verifica `DB_PASS`
2. Por defecto en XAMPP la contraseña está vacía:
   ```properties
   DB_PASS=
   ```
3. Si cambiaste la contraseña, actualiza el `.env` con la correcta

### Terminal no reconoce comandos después de configurar PATH

**Causa:** La terminal actual no recargó las variables de entorno

**Solución:**

```powershell
# Opción 1: Cierra y abre una nueva terminal (Recomendado)

# Opción 2: Recarga manualmente (PowerShell):
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

### Apache/MySQL no inician en XAMPP

**Causa:** Puertos 80/3306 ocupados por otros servicios

**Solución:**

```bash
# Ver qué usa el puerto:
netstat -ano | findstr :80
netstat -ano | findstr :3306

# Detener Apache de WSL (si aplica):
wsl sudo service apache2 stop

# Cambiar puerto de Apache:
# Edita C:\xampp\apache\conf\httpd.conf
# Busca "Listen 80" y cámbialo a "Listen 8080"
```

### Composer toma mucho tiempo o falla

**Causa:** Problemas de red o límites de memoria

**Solución:**

```bash
# Aumentar límite de memoria para Composer:
php -d memory_limit=-1 composer.phar install

# Limpiar caché de Composer:
composer clear-cache
```

### Error: "npm install" falla

**Causa:** Versión de Node.js incompatible o caché corrupta

**Solución:**

```bash
# Limpiar caché de npm:
npm cache clean --force

# Eliminar node_modules y reinstalar:
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 🔍 Verificación de Instalación Correcta

Ejecuta estos comandos para verificar que todo está configurado:

```bash
# 1. Verificar versión de PHP
php -v
# Debe mostrar: PHP 8.2.x

# 2. Verificar extensión GD
php -m | findstr gd
# Debe mostrar: gd

# 3. Verificar Composer
composer --version
# O si usas local:
php composer.phar --version

# 4. Verificar Node.js
node -v
# Debe mostrar: v18.x o superior

# 5. Verificar npm
npm -v

# 6. Probar conexión a MySQL
C:\xampp\mysql\bin\mysql.exe -u root -p123 -e "SELECT VERSION();"

# 7. Probar envío de email
cd api
php test-email.php tu-email@gmail.com
```

Si todos estos comandos funcionan correctamente, la instalación está completa. ✅

---

## 📚 Documentación Adicional

- **Configuración de Emails:** `INICIO_RAPIDO_EMAIL.md` y `GUIA_CONFIGURACION_EMAIL.md`
- **API Endpoints:** Ver comentarios en archivos `api/*.php`
- **Base de Datos:** Estructura completa en `api/database2.sql`

---

## 👥 Equipo de Desarrollo

- Sistema desarrollado para Ferretería El Tornillo
- **Stack:** JavaScript Vanilla, PHP 8.2, MySQL, Vite
- **Librerías:** PHPMailer, Vite, Chart.js (reportes)

---

## 📝 Notas Importantes

- ⚠️ **NO subas el archivo `.env` a git** (ya está en `.gitignore`)
- ⚠️ **NO subas la carpeta `vendor/` a git** (se regenera con `composer install`)
- ✅ Cambia las contraseñas por defecto antes de producción
- ✅ Elimina el `debug_code` de `password_recovery.php` en producción
- ✅ Configura un proveedor SMTP profesional (SendGrid, Brevo) para producción

---

## 🔒 Seguridad

- Contraseñas hasheadas con BCrypt
- Protección CSRF en formularios
- Validación de inputs en backend
- Sesiones seguras con PHP
- CORS configurado correctamente
- Credenciales en archivo `.env` protegido

---

## 📞 Soporte

Si tienes problemas durante la instalación:

1. Verifica que todos los servicios de XAMPP estén corriendo
2. Revisa los logs de errores:
   - Apache: `C:\xampp\apache\logs\error.log`
   - PHP: `C:\xampp\php\logs\php_error_log`
3. Ejecuta los scripts de prueba (`test-email.php`)
4. Consulta la documentación en los archivos `.md`

---

**¡Listo para empezar! 🚀**
