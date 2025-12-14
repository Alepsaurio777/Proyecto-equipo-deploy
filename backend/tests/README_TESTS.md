# Documentación de Tests de Login - Sistema de Ferretería

Este documento describe los tests unitarios para validar el subsistema de conexión y autenticación del sistema de ferretería.

## Comando General de Ejecución

Para ejecutar todos los tests de login:

```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit ../tests/LoginConnectionTest.php
```

---

## a) Validar Conexión

**Finalidad del test:** `test_01_ValidarConexion_Localhost_ReturnsSuccess`

**Descripción del test:** El objetivo principal del test `test_01_ValidarConexion_Localhost_ReturnsSuccess` es verificar el comportamiento esperado del subsistema de conexión a la base de datos bajo un escenario ideal. Específicamente, se busca confirmar que la función que valida la conexión (`getConnection`) reporte éxito (`True`) cuando todos los parámetros de conexión son correctos: host localhost, usuario válido, contraseña correcta y base de datos existente.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_01_ValidarConexion_Localhost_ReturnsSuccess ../tests/LoginConnectionTest.php
```

---

## b) Obtener Conexión (Host Inválido)

**Finalidad del test:** `test_02_ObtenerConexion_InvalidHost_ReturnsNull`

**Descripción del test:** El objetivo del test `test_02_ObtenerConexion_InvalidHost_ReturnsNull` es verificar que la función principal para obtener un objeto de conexión (`getConnection()`) falle de manera controlada y devuelva error cuando el servidor (host) de la base de datos es inaccesible o incorrecto. Este es un escenario de fallo esperado, y el test asegura que la aplicación no intente utilizar un objeto de conexión inválido, previniendo excepciones no controladas en el código de la aplicación.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_02_ObtenerConexion_InvalidHost_ReturnsNull ../tests/LoginConnectionTest.php
```

---

## c) Credenciales Inválidas

**Finalidad del test:** `test_03_ObtenerConexion_InvalidCredentials_ReturnsNull`

**Descripción del test:** El objetivo del test `test_03_ObtenerConexion_InvalidCredentials_ReturnsNull` es verificar que el sistema de conexión (`getConnection()`) maneje correctamente un fallo de autenticación. Esto ocurre cuando el host es correcto, pero el nombre de usuario (`uid`) o la contraseña (`pwd`) son inválidos. Al igual que en el Test 2, se espera que, ante este error grave, la función devuelva error con el mensaje "Access denied" para evitar que la aplicación intente ejecutar comandos sin una conexión válida.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_03_ObtenerConexion_InvalidCredentials_ReturnsNull ../tests/LoginConnectionTest.php
```

---

## d) BD Inexistente

**Finalidad del test:** `test_04_ValidarConexion_DatabaseNotExists_ReturnsFalseWithMessage`

**Descripción del test:** El objetivo del test `test_04_ValidarConexion_DatabaseNotExists_ReturnsFalseWithMessage` es confirmar que el sistema de validación de conexión (`ValidarConexion`) maneje un escenario de fallo de configuración donde el Host y las credenciales son correctos, pero la base de datos solicitada no existe en el servidor MySQL. El mensaje de error debe indicar "Unknown database" para ayudar en el diagnóstico del problema.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_04_ValidarConexion_DatabaseNotExists_ReturnsFalseWithMessage ../tests/LoginConnectionTest.php
```

---

## e) Timeout_ReturnsFalseOrHandled

**Finalidad del test:** `test_05_ValidarConexion_Timeout_ReturnsFalseOrHandled`

**Descripción del test:** El objetivo del test `test_05_ValidarConexion_Timeout_ReturnsFalseOrHandled` es garantizar que el sistema de conexión pueda manejar y reportar correctamente un error de Tiempo de Espera (Timeout). Un timeout ocurre típicamente cuando la aplicación intenta conectarse a un host que está en línea, pero la respuesta es demasiado lenta o la conexión se interrumpe después de un período de espera predefinido. El test configura un timeout de 1 segundo y verifica que la conexión se complete o maneje el timeout apropiadamente.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_05_ValidarConexion_Timeout_ReturnsFalseOrHandled ../tests/LoginConnectionTest.php
```

---

## f) Select1_Se ejecuta correctamente

**Finalidad del test:** `test_06_ObtenerConexion_Select1_ExecutesSuccessfully`

**Descripción del test:** El objetivo del test `test_06_ObtenerConexion_Select1_ExecutesSuccessfully` es confirmar la operatividad completa de la conexión a la base de datos. A diferencia de las pruebas 1-5, que se enfocaron en el manejo de fallos simulados, esta prueba se centra en el flujo de éxito del componente de conexión. Específicamente, verifica que:
- Se pueda obtener un proveedor de conexión (`getConnection()`).
- El método `ValidarConexion()`, que internamente ejecuta una consulta simple (`SELECT 1;`), se complete sin errores y devuelva `success = True`.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_06_ObtenerConexion_Select1_ExecutesSuccessfully ../tests/LoginConnectionTest.php
```

---

## g) Abrir y cerrar varias veces sin fugas

**Finalidad del test:** `test_07_ObtenerConexion_OpenClose_MultipleTimes_NoLeak`

**Descripción del test:** El objetivo del test `test_07_ObtenerConexion_OpenClose_MultipleTimes_NoLeak` es verificar que el componente de conexión puede ser instanciado, utilizado y cerrado/liberado repetidamente sin fallar o causar pérdidas de recursos (resource leaks). El test realiza 10 iteraciones de abrir conexión, ejecutar una consulta simple, y cerrar la conexión, verificando que todas las operaciones sean exitosas.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_07_ObtenerConexion_OpenClose_MultipleTimes_NoLeak ../tests/LoginConnectionTest.php
```

---

## h) Error de retorno de cadena de conexión

**Finalidad del test:** `test_08_ValidarConexion_MalformedConnectionString_ReturnsErrorHandled`

**Descripción del test:** El objetivo del test `test_08_ValidarConexion_MalformedConnectionString_ReturnsErrorHandled` es verificar la capacidad del sistema de conexión para manejar un error en la sintaxis de la cadena de conexión (connection string). Si la cadena no está bien formada (por ejemplo, le falta un parámetro clave como el host vacío), el driver de la base de datos debería lanzar una excepción al intentar analizarla o conectarse. El test verifica que este error sea manejado apropiadamente sin causar un crash de la aplicación.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_08_ValidarConexion_MalformedConnectionString_ReturnsErrorHandled ../tests/LoginConnectionTest.php
```

---

## i) Permiso denegado

**Finalidad del test:** `test_09_ValidarConexion_PermissionDeniedOnDDL_ReturnsError`

**Descripción del test:** El objetivo del test `test_09_ValidarConexion_PermissionDeniedOnDDL_ReturnsError` es verificar que el código de la aplicación puede detectar y manejar correctamente una excepción de "Permiso Denegado" a nivel de la base de datos, específicamente cuando se intenta una operación de Definición de Datos (DDL) como `CREATE TABLE`. El test intenta crear una tabla temporal y valida que si falla por permisos, el error sea reportado correctamente, o si tiene permisos, la operación se complete y limpie apropiadamente.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_09_ValidarConexion_PermissionDeniedOnDDL_ReturnsError ../tests/LoginConnectionTest.php
```

---

## j) SSL Required

**Finalidad del test:** `test_10_ValidarConexion_SSLRequiredButNotSet_ReturnsSslError`

**Descripción del test:** El objetivo del test `test_10_ValidarConexion_SSLRequiredButNotSet_ReturnsSslError` es asegurar que el sistema de conexión puede detectar y reportar fallos relacionados con la configuración de seguridad de la conexión, específicamente un error de Capa de Sockets Segura (SSL/TLS). El test configura certificados SSL ficticios y verifica que la función `ssl_set` se ejecute sin errores fatales, permitiendo que la conexión falle de manera controlada si SSL es requerido pero no está correctamente configurado.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_10_ValidarConexion_SSLRequiredButNotSet_ReturnsSslError ../tests/LoginConnectionTest.php
```

---

## k) Cadena de conexión cifrada

**Finalidad del test:** `test_11_ValidarConexion_DpapiEncryptedConnectionString_Resolvable`

**Descripción del test:** El objetivo del test `test_11_ValidarConexion_DpapiEncryptedConnectionString_Resolvable` es verificar la capacidad de la capa de conexión para trabajar con una cadena de conexión que se supone cifrada por mecanismos de seguridad locales (como DPAPI - Data Protection API en Windows). El test simula este comportamiento cifrando las credenciales con base64, descifrándolas, y luego conectándose a la base de datos para verificar que el proceso completo funciona correctamente.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_11_ValidarConexion_DpapiEncryptedConnectionString_Resolvable ../tests/LoginConnectionTest.php
```

---

## l) Parámetros de grupo aplicados

**Finalidad del test:** `test_12_ValidarConexion_PoolParameters_Applied`

**Descripción del test:** El objetivo del test `test_12_ValidarConexion_PoolParameters_Applied` es verificar el correcto ciclo de vida de apertura y cierre de múltiples conexiones en secuencia. Esto simula el comportamiento esperado cuando el sistema de base de datos está utilizando la técnica de Connection Pooling (agrupación de conexiones). El test crea un pool de 5 conexiones, verifica que todas sean funcionales ejecutando `SELECT CONNECTION_ID()`, y luego las cierra correctamente.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_12_ValidarConexion_PoolParameters_Applied ../tests/LoginConnectionTest.php
```

---

## m) Comportamiento del Pool

**Finalidad del test:** `test_13_ValidarConexion_OpenManyConnections_PoolBehavior`

**Descripción del test:** El objetivo del test `test_13_ValidarConexion_OpenManyConnections_PoolBehavior` es simular una alta demanda de recursos de conexión para verificar que el sistema puede solicitar y liberar un número significativamente mayor de objetos de conexión sin experimentar fallos inesperados. El test intenta crear 20 conexiones consecutivas y espera que al menos el 80% sean exitosas, demostrando la estabilidad del sistema bajo carga.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_13_ValidarConexion_OpenManyConnections_PoolBehavior ../tests/LoginConnectionTest.php
```

---

## n) Tiempo de espera gestionado

**Finalidad del test:** `test_14_ValidarConexion_SlowQuery_TimeoutHandled`

**Descripción del test:** El objetivo del test `test_14_ValidarConexion_SlowQuery_TimeoutHandled` es verificar que la capa de acceso a datos maneje adecuadamente los tiempos de espera de comandos (Command Timeout). Este es un mecanismo esencial para la estabilidad de la aplicación, ya que evita que las consultas lentas o fallidas bloqueen indefinidamente el flujo de la aplicación. El test ejecuta una consulta con `SLEEP(0.1)` (100ms) y verifica que se complete en un tiempo razonable (entre 50ms y 5 segundos).

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_14_ValidarConexion_SlowQuery_TimeoutHandled ../tests/LoginConnectionTest.php
```

---

## o) Seleccionar valor conocido devuelve esperado

**Finalidad del test:** `test_15_ValidarConexion_SelectKnownValue_ReturnsExpected`

**Descripción del test:** El objetivo del test `test_15_ValidarConexion_SelectKnownValue_ReturnsExpected` es la prueba fundamental de lectura de datos. Este test valida el flujo de trabajo completo y crítico de una aplicación de base de datos: establecer conexión, ejecutar una consulta, y leer datos reales. El test consulta `DATABASE()` y `VERSION()` para verificar que el nombre de la base de datos coincida con la configuración y que la versión de MySQL sea retornada correctamente.

**Comando de ejecución:**
```bash
cd /usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api
./vendor/bin/phpunit --filter test_15_ValidarConexion_SelectKnownValue_ReturnsExpected ../tests/LoginConnectionTest.php
```

---

## Resumen de Comandos

| Test | Comando |
|------|---------|
| Todos los tests | `./vendor/bin/phpunit ../tests/LoginConnectionTest.php` |
| a) Validar Conexión | `./vendor/bin/phpunit --filter test_01_ValidarConexion_Localhost_ReturnsSuccess ../tests/LoginConnectionTest.php` |
| b) Obtener Conexión | `./vendor/bin/phpunit --filter test_02_ObtenerConexion_InvalidHost_ReturnsNull ../tests/LoginConnectionTest.php` |
| c) Credenciales Inválidas | `./vendor/bin/phpunit --filter test_03_ObtenerConexion_InvalidCredentials_ReturnsNull ../tests/LoginConnectionTest.php` |
| d) BD Inexistente | `./vendor/bin/phpunit --filter test_04_ValidarConexion_DatabaseNotExists_ReturnsFalseWithMessage ../tests/LoginConnectionTest.php` |
| e) Timeout | `./vendor/bin/phpunit --filter test_05_ValidarConexion_Timeout_ReturnsFalseOrHandled ../tests/LoginConnectionTest.php` |
| f) Select 1 | `./vendor/bin/phpunit --filter test_06_ObtenerConexion_Select1_ExecutesSuccessfully ../tests/LoginConnectionTest.php` |
| g) Sin Fugas | `./vendor/bin/phpunit --filter test_07_ObtenerConexion_OpenClose_MultipleTimes_NoLeak ../tests/LoginConnectionTest.php` |
| h) Cadena Malformada | `./vendor/bin/phpunit --filter test_08_ValidarConexion_MalformedConnectionString_ReturnsErrorHandled ../tests/LoginConnectionTest.php` |
| i) Permiso Denegado | `./vendor/bin/phpunit --filter test_09_ValidarConexion_PermissionDeniedOnDDL_ReturnsError ../tests/LoginConnectionTest.php` |
| j) SSL Required | `./vendor/bin/phpunit --filter test_10_ValidarConexion_SSLRequiredButNotSet_ReturnsSslError ../tests/LoginConnectionTest.php` |
| k) Cadena Cifrada | `./vendor/bin/phpunit --filter test_11_ValidarConexion_DpapiEncryptedConnectionString_Resolvable ../tests/LoginConnectionTest.php` |
| l) Pool Aplicado | `./vendor/bin/phpunit --filter test_12_ValidarConexion_PoolParameters_Applied ../tests/LoginConnectionTest.php` |
| m) Pool Bajo Carga | `./vendor/bin/phpunit --filter test_13_ValidarConexion_OpenManyConnections_PoolBehavior ../tests/LoginConnectionTest.php` |
| n) Timeout Query | `./vendor/bin/phpunit --filter test_14_ValidarConexion_SlowQuery_TimeoutHandled ../tests/LoginConnectionTest.php` |
| o) Valor Conocido | `./vendor/bin/phpunit --filter test_15_ValidarConexion_SelectKnownValue_ReturnsExpected ../tests/LoginConnectionTest.php` |

---

*Nota: Todos los comandos deben ejecutarse desde el directorio `/usr/local/apache2/htdocs/Proyecto-de-Equipo/backend/api`*
