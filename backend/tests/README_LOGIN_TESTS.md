# Documentación de Tests de Autenticación de Login

Este documento describe los 6 tests unitarios para validar el sistema de autenticación de login del sistema de ferretería.

## Comando General de Ejecución

```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit ../tests/LoginAuthenticationTest.php --testdox
```

## Resultado de la Ejecución

```
PHPUnit 9.6.31 by Sebastian Bergmann and contributors.

Login Authentication
 ✔ 01 Login CredencialesValidas RetornaExito  3 ms
 ✔ 02 Login UsuarioInexistente RetornaError  1 ms
 ✔ 03 Login ContrasenaIncorrecta RetornaError  1 ms
 ✔ 04 Login CamposVacios RetornaError  1 ms
 ✔ 05 Login InyeccionSQL RetornaErrorSinCompromiso  2 ms
 ✔ 06 Login RespuestaExitosa ContieneEstructuraCompleta  1 ms

Time: 00:00.008, Memory: 4.00 MB

OK (6 tests, 47 assertions)
```

---

## a) Login con Credenciales Válidas

**Nombre de prueba:** `test_01_Login_CredencialesValidas_RetornaExito`

**Finalidad del test:** Verificar que un usuario con credenciales correctas pueda iniciar sesión exitosamente y reciba los datos de usuario esperados.

**Descripción:** El objetivo principal del test `test_01_Login_CredencialesValidas_RetornaExito` es validar el flujo de autenticación bajo un escenario ideal. Específicamente, se busca confirmar que al enviar un usuario y contraseña válidos (admin/admin123), el sistema:
- Retorne `success: true`
- Incluya el mensaje "Inicio de sesión exitoso"
- Devuelva los datos del usuario autenticado

**Comando de ejecución:**
```bash
./vendor/bin/phpunit --filter test_01_Login_CredencialesValidas_RetornaExito ../tests/LoginAuthenticationTest.php
```

**Captura de ejecución exitosa:**
```
✓ TEST 01 PASSED: Login exitoso con credenciales válidas
```

---

## b) Login con Usuario Inexistente

**Nombre de prueba:** `test_02_Login_UsuarioInexistente_RetornaError`

**Finalidad del test:** Verificar que el sistema rechace correctamente un intento de login con un nombre de usuario que no existe en la base de datos.

**Descripción:** El objetivo del test `test_02_Login_UsuarioInexistente_RetornaError` es confirmar que cuando un usuario intenta iniciar sesión con un nombre de usuario que no está registrado en el sistema, la respuesta sea:
- `success: false`
- Un mensaje que indique "Usuario o contraseña incorrectos"
- Sin revelar si el usuario existe o no (medida de seguridad)

**Comando de ejecución:**
```bash
./vendor/bin/phpunit --filter test_02_Login_UsuarioInexistente_RetornaError ../tests/LoginAuthenticationTest.php
```

**Captura de ejecución exitosa:**
```
✓ TEST 02 PASSED: Login rechazado para usuario inexistente
```

---

## c) Login con Contraseña Incorrecta

**Nombre de prueba:** `test_03_Login_ContrasenaIncorrecta_RetornaError`

**Finalidad del test:** Verificar que el sistema rechace un intento de login cuando el usuario existe pero la contraseña es incorrecta.

**Descripción:** El objetivo del test `test_03_Login_ContrasenaIncorrecta_RetornaError` es validar que el sistema de autenticación maneje correctamente un fallo de contraseña. Se verifica que:
- El login falle con `success: false`
- El mensaje de error sea genérico ("Usuario o contraseña incorrectos")
- No se revele información sobre si el usuario existe o no
- La seguridad del sistema no sea comprometida

**Comando de ejecución:**
```bash
./vendor/bin/phpunit --filter test_03_Login_ContrasenaIncorrecta_RetornaError ../tests/LoginAuthenticationTest.php
```

**Captura de ejecución exitosa:**
```
✓ TEST 03 PASSED: Login rechazado con contraseña incorrecta
```

---

## d) Validación de Campos Vacíos

**Nombre de prueba:** `test_04_Login_CamposVacios_RetornaError`

**Finalidad del test:** Verificar que el sistema valide y rechace peticiones de login cuando los campos de usuario o contraseña están vacíos.

**Descripción:** El objetivo del test `test_04_Login_CamposVacios_RetornaError` es confirmar la validación de entrada del formulario de login. Se prueban tres escenarios:
1. Usuario vacío con contraseña válida
2. Usuario válido con contraseña vacía
3. Ambos campos vacíos

En todos los casos, el sistema debe rechazar la petición con el mensaje "Usuario y contraseña son requeridos".

**Comando de ejecución:**
```bash
./vendor/bin/phpunit --filter test_04_Login_CamposVacios_RetornaError ../tests/LoginAuthenticationTest.php
```

**Captura de ejecución exitosa:**
```
✓ TEST 04 PASSED: Validación correcta de campos vacíos
```

---

## e) Protección contra Inyección SQL

**Nombre de prueba:** `test_05_Login_InyeccionSQL_RetornaErrorSinCompromiso`

**Finalidad del test:** Verificar que el sistema esté protegido contra intentos de inyección SQL en los campos de usuario y contraseña.

**Descripción:** El objetivo del test `test_05_Login_InyeccionSQL_RetornaErrorSinCompromiso` es garantizar la seguridad del sistema ante ataques de inyección SQL. Se prueban múltiples payloads maliciosos:
- `admin' OR '1'='1`
- `admin'--`
- `'; DROP TABLE usuario; --`
- `admin' OR 1=1 --`
- `1' OR '1'='1`

Para cada intento, se verifica que:
- El login falle de forma segura
- No se expongan errores SQL en el mensaje
- La tabla `usuario` siga existiendo después de los ataques

**Comando de ejecución:**
```bash
./vendor/bin/phpunit --filter test_05_Login_InyeccionSQL_RetornaErrorSinCompromiso ../tests/LoginAuthenticationTest.php
```

**Captura de ejecución exitosa:**
```
✓ TEST 05 PASSED: Sistema protegido contra inyección SQL
```

---

## f) Estructura de Respuesta del Login

**Nombre de prueba:** `test_06_Login_RespuestaExitosa_ContieneEstructuraCompleta`

**Finalidad del test:** Verificar que la respuesta del login exitoso contenga todos los campos necesarios para la aplicación frontend.

**Descripción:** El objetivo del test `test_06_Login_RespuestaExitosa_ContieneEstructuraCompleta` es validar que la estructura JSON de respuesta del login contenga todos los elementos requeridos:

**Estructura esperada:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    },
    "session_id": "abc123..."
  }
}
```

Se verifican:
- Tipos de datos correctos (id: integer, username: string, role: string)
- Presencia de todos los campos requeridos
- Session_id no vacío

**Comando de ejecución:**
```bash
./vendor/bin/phpunit --filter test_06_Login_RespuestaExitosa_ContieneEstructuraCompleta ../tests/LoginAuthenticationTest.php
```

**Captura de ejecución exitosa:**
```
✓ TEST 06 PASSED: Estructura de respuesta completa verificada
```

---

## Resumen de Comandos

| Test | Comando |
|------|---------|
| Todos los tests | `./vendor/bin/phpunit ../tests/LoginAuthenticationTest.php --testdox` |
| a) Credenciales Válidas | `./vendor/bin/phpunit --filter test_01_Login_CredencialesValidas_RetornaExito ../tests/LoginAuthenticationTest.php` |
| b) Usuario Inexistente | `./vendor/bin/phpunit --filter test_02_Login_UsuarioInexistente_RetornaError ../tests/LoginAuthenticationTest.php` |
| c) Contraseña Incorrecta | `./vendor/bin/phpunit --filter test_03_Login_ContrasenaIncorrecta_RetornaError ../tests/LoginAuthenticationTest.php` |
| d) Campos Vacíos | `./vendor/bin/phpunit --filter test_04_Login_CamposVacios_RetornaError ../tests/LoginAuthenticationTest.php` |
| e) Inyección SQL | `./vendor/bin/phpunit --filter test_05_Login_InyeccionSQL_RetornaErrorSinCompromiso ../tests/LoginAuthenticationTest.php` |
| f) Estructura Respuesta | `./vendor/bin/phpunit --filter test_06_Login_RespuestaExitosa_ContieneEstructuraCompleta ../tests/LoginAuthenticationTest.php` |

---

*Nota: Todos los comandos deben ejecutarse desde el directorio `/usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api`*

*Fecha de ejecución: 2025-12-11*
*Resultado: 6 tests, 47 assertions - OK*
