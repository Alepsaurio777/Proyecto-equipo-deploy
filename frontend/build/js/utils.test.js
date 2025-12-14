/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

// Cargar el archivo original para no duplicar lógica
const utilsCode = fs.readFileSync(path.resolve(__dirname, 'utils.js'), 'utf8');
eval(utilsCode);

describe('Utils - escapeHtml', () => {
    test('deberia escapar caracteres especiales HTML', () => {
        const input = '<script>alert("xss")</script>';
        const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
        expect(escapeHtml(input)).toBe(expected);
    });

    test('deberia manejar cadenas vacias o nulas', () => {
        expect(escapeHtml(null)).toBe("");
        expect(escapeHtml(undefined)).toBe("");
        expect(escapeHtml("")).toBe("");
    });
});
