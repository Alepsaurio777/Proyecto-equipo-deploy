/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

// Cargar el archivo original
const validationCode = fs.readFileSync(path.resolve(__dirname, 'inventory-validation.js'), 'utf8');
eval(validationCode);

describe('Inventory Validation', () => {
    describe('validateProduct', () => {
        test('deberia validar correctamente un producto válido', () => {
            const product = {
                name: 'Martillo',
                code: 'HER-001',
                category: 'Herramientas',
                price: 100,
                stock: 10,
                min_stock: 5,
                max_stock: 50
            };
            const result = validateProduct(product);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('deberia detectar campos faltantes', () => {
            const product = { name: '', code: '' };
            const result = validateProduct(product);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Por favor completa los campos requeridos");
        });

        test('deberia detectar stock negativo', () => {
            const product = {
                name: 'Test',
                code: 'T-001',
                category: 'Test',
                price: 10,
                stock: -1,
                min_stock: 0,
                max_stock: 10
            };
            const result = validateProduct(product);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("El stock actual no puede ser negativo");
        });

        test('deberia permitir stock menor al minimo (Advertencia, no error)', () => {
            const product = {
                name: 'Test',
                code: 'T-001',
                category: 'Test',
                price: 10,
                stock: 2,
                min_stock: 10, // Stock < Min
                max_stock: 20
            };
            const result = validateProduct(product);
            // Segun cambios recientes, esto YA NO es un error de validacion.
            expect(result.isValid).toBe(true);
        });
    });
});
