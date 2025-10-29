# Proyecto Frontend - Ferretería El Tornillo

Este proyecto contiene la interfaz de usuario (frontend) para el Sistema de Gestión Integral de la ferretería. Es una aplicación web moderna construida con JavaScript puro y Vite como herramienta de desarrollo.

---

## Requisitos Previos

1.  **Backend Activo:** La API del backend debe estar instalada, configurada y en ejecución. El frontend espera que la API sea accesible en `http://localhost/backend/api/`.
2.  **Node.js:** Es necesario tener Node.js instalado para manejar las dependencias y correr el servidor de desarrollo. Se recomienda una versión `v18.x` o superior.

## Instalación

1.  Clona o descarga este repositorio en tu máquina local.
2.  Abre una terminal en la raíz del proyecto.
3.  Instala las dependencias necesarias ejecutando:
    ```bash
    npm install
    ```

## Configuración

La URL de la API del backend está definida directamente en los archivos JavaScript que realizan las llamadas (ej. `src/js/inventory.js`, `src/js/employees.js`).

Ejemplo en `src/js/inventory.js`:
```javascript
const response = await fetch('http://localhost/backend/api/products.php');
```

Si tu backend corre en una URL diferente, deberás buscar y reemplazar esta dirección en todos los archivos `.js` dentro de la carpeta `src/js/`.

## Cómo Correr el Proyecto

### Modo Desarrollo

Para iniciar el servidor de desarrollo de Vite, que se recarga automáticamente al hacer cambios, ejecuta:

```bash
npm run dev
```

Vite te mostrará en la terminal la URL local donde puedes acceder a la aplicación (generalmente `http://localhost:5173` o un puerto similar).

