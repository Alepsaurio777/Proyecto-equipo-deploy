-- ==========================================
-- LIMPIAR NOTIFICACIONES DE PRUEBA
-- ==========================================
-- Este script elimina las transacciones de prueba que aparecen como notificaciones

USE ferreteria_db;

-- Eliminar las transacciones de prueba hardcodeadas
DELETE FROM movimiento_inventario 
WHERE motivo IN ('Reabastecimiento semanal', 'Pedido especial cliente #45')
  AND status = 'pendiente';

-- Verificar que se eliminaron
SELECT COUNT(*) as transacciones_pendientes FROM movimiento_inventario WHERE status = 'pendiente';

SELECT '✅ Notificaciones de prueba eliminadas' AS resultado;
