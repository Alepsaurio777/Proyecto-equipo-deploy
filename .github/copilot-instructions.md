# Guía de Instrucciones para Agentes de Codificación de IA

Este documento proporciona una guía esencial para agentes de codificación de IA que trabajan en el proyecto "Sistema de Gestión Integral - Ferretería El Tornillo". El objetivo es facilitar una comprensión rápida de la arquitectura, flujos de trabajo clave y convenciones del proyecto para maximizar la productividad.

## 1. Arquitectura General

El proyecto sigue una arquitectura cliente-servidor tradicional:

- **Frontend (Cliente):** Desarrollado con JavaScript vanilla, HTML y CSS. Utiliza Vite para el entorno de desarrollo y la construcción. Los módulos JavaScript (`src/js/`) están organizados por funcionalidad (autenticación, API, inventario, empleados, reportes, notificaciones, UI, utilidades).
- **Backend (Servidor):** Implementado en PHP y MySQL. La carpeta `api/` contiene los endpoints PHP que gestionan la lógica de negocio y la interacción con la base de datos. Composer se utiliza para gestionar las dependencias de PHP (ej., PHPMailer para el envío de correos).
- **Base de Datos:** MySQL, gestionada a través de XAMPP. La estructura se define en `api/database2.sql`.

### Flujo de Datos Principal:

1.  El Frontend realiza solicitudes HTTP (usando `fetch`) a los endpoints PHP del Backend.
2.  El Backend procesa las solicitudes, interactúa con la base de datos MySQL y devuelve respuestas JSON al Frontend.
3.  El Backend también puede interactuar con servicios externos, como el envío de correos electrónicos a través de PHPMailer.

## 2. Flujos de Trabajo Críticos para Desarrolladores

### 2.1. Configuración del Entorno

Para configurar el proyecto localmente, se requieren los siguientes pasos (detalles completos en `README.md`):

1.  **XAMPP:** Instalar y asegurar que Apache, MySQL y PHP 8.2+ estén configurados y en ejecución.
2.  **Node.js:** Instalar v18.x o superior.
3.  **Composer:** Instalar globalmente o localmente en la carpeta `api/`.
4.  **PHP en PATH:** Asegurarse de que el ejecutable de PHP (`C:\xampp\php`) esté en la variable de entorno PATH del sistema.
5.  **Dependencias Frontend:** Ejecutar `npm install` en la raíz del proyecto.
6.  **Dependencias Backend:** Navegar a `api/` y ejecutar `composer install`.
7.  **Base de Datos:**
    - Crear la base de datos `ferreteria_db` en phpMyAdmin.
    - Importar `api/database2.sql`.
8.  **Variables de Entorno:** Copiar `.env.example` a `.env` y configurar las credenciales de la base de datos y SMTP.

### 2.2. Ejecución del Proyecto

- **Iniciar XAMPP:** Asegurarse de que Apache y MySQL estén activos.
- **Iniciar Servidor de Desarrollo Frontend:** En la raíz del proyecto, ejecutar `npm run dev`. Esto inicia Vite en `http://localhost:3000`.
- **Acceso:** Abrir el navegador en `http://localhost:3000`.

### 2.3. Pruebas

- **Prueba de Email:** Para verificar la configuración SMTP, navegar a `api/` y ejecutar `php test-email.php tu-email@gmail.com`.

## 3. Convenciones y Patrones Específicos del Proyecto

- **Frontend:**
  - No se utilizan frameworks de JavaScript (ej., React, Vue). Todo es JavaScript vanilla.
  - La comunicación con el backend se realiza a través del módulo `src/js/api.js`.
  - La gestión del estado de la aplicación se centraliza en un objeto `AppState` (definido en `src/js/app.js` o `src/js/data.js`).
  - Las funciones de renderizado de UI se encuentran en `src/js/ui.js` y en los módulos específicos (ej., `renderProductsTable` en `src/js/inventory.js`).
- **Backend:**
  - Los endpoints PHP son archivos individuales que manejan solicitudes específicas (ej., `products.php` para operaciones CRUD de productos).
  - La configuración de la base de datos y CORS se maneja en `api/config.php`.
  - Las credenciales sensibles se cargan desde el archivo `.env`.

## 4. Puntos de Integración y Comunicación

- **Frontend <-> Backend:**
  - Todas las llamadas a la API se gestionan a través de `src/js/api.js`.
  - La URL base de la API se define en `src/js/api.js` (por defecto `http://localhost/Proyecto-de-Equipo/api`). Si Apache se ejecuta en un puerto diferente, esta URL debe actualizarse.
- **Backend <-> Base de Datos:**
  - La conexión a la base de datos se establece en `api/config.php` utilizando las variables de entorno.
  - Las consultas SQL se ejecutan directamente en los archivos PHP de los endpoints.
- **Backend <-> Servicio de Email:**
  - El servicio de envío de correos se implementa en `api/EmailService.php` y utiliza PHPMailer.
  - La configuración SMTP se obtiene del archivo `.env`.

## 5. Archivos y Directorios Clave

- `README.md`: Documentación principal del proyecto, incluyendo instalación y ejecución.
- `.env.example` / `.env`: Configuración de variables de entorno.
- `api/`: Contiene todo el código del backend PHP.
  - `api/config.php`: Configuración de la base de datos y CORS.
  - `api/database2.sql`: Esquema de la base de datos.
  - `api/EmailService.php`: Lógica para el envío de correos.
  - `api/*.php`: Endpoints de la API (ej., `login.php`, `products.php`).
- `src/`: Contiene todo el código del frontend.
  - `src/js/api.js`: Funciones para interactuar con la API.
  - `src/js/app.js`: Punto de entrada de la aplicación.
  - `src/js/auth.js`: Lógica de autenticación.
  - `src/js/inventory.js`: Lógica y UI para la gestión de inventario.
  - `src/js/employees.js`: Lógica y UI para la gestión de empleados.
  - `src/js/notifications.js`: Gestión de notificaciones.
  - `src/js/ui.js`: Funciones de utilidad para la interfaz de usuario.
- `vite.config.mts`: Configuración del servidor de desarrollo Vite.

---

Por favor, proporciona retroalimentación si alguna sección no es clara o está incompleta.
