import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const appRoot = path.resolve(projectRoot, 'src');

// Plugin personalizado para copiar archivos estáticos
function copyStaticFilesPlugin() {
  return {
    name: 'copy-static-files',
    closeBundle: async () => {
      const buildDir = path.resolve(projectRoot, 'build');
      const srcDir = path.resolve(projectRoot, 'src');

      // Función para copiar directorio recursivamente
      const copyDir = (src: string, dest: string) => {
        if (!fs.existsSync(src)) return;
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };

      // Copiar carpeta js
      copyDir(path.join(srcDir, 'js'), path.join(buildDir, 'js'));
      console.log('✓ Copiada carpeta js/');

      // Copiar carpeta styles
      copyDir(path.join(srcDir, 'styles'), path.join(buildDir, 'styles'));
      console.log('✓ Copiada carpeta styles/');

      // Copiar carpeta modals
      copyDir(path.join(srcDir, 'modals'), path.join(buildDir, 'modals'));
      console.log('✓ Copiada carpeta modals/');

      // Copiar carpeta templates si existe
      if (fs.existsSync(path.join(srcDir, 'templates'))) {
        copyDir(path.join(srcDir, 'templates'), path.join(buildDir, 'templates'));
        console.log('✓ Copiada carpeta templates/');
      }

      // Inyectar link a styles/main.css en el HTML generado
      const htmlPath = path.join(buildDir, 'index.html');
      if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf-8');
        // Agregar link a main.css después del CSS de assets
        if (!html.includes('styles/main.css')) {
          html = html.replace(
            /<link rel="stylesheet"([^>]*)href="[^"]*assets[^"]*\.css"([^>]*)>/,
            (match) => `${match}\n  <link rel="stylesheet" href="./styles/main.css">`
          );
          fs.writeFileSync(htmlPath, html);
          console.log('✓ Inyectado link a styles/main.css en index.html');
        }
      }

      console.log('✓ Todos los archivos estáticos copiados a build/');
    }
  };
}

export default defineConfig({
  plugins: [react(), copyStaticFilesPlugin()],
  root: appRoot,
  publicDir: path.resolve(projectRoot, 'public'),
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'vaul@1.1.2': 'vaul',
      'sonner@2.0.3': 'sonner',
      'recharts@2.15.2': 'recharts',
      'react-resizable-panels@2.1.7': 'react-resizable-panels',
      'react-hook-form@7.55.0': 'react-hook-form',
      'react-day-picker@8.10.1': 'react-day-picker',
      'next-themes@0.4.6': 'next-themes',
      'lucide-react@0.487.0': 'lucide-react',
      'input-otp@1.4.2': 'input-otp',
      'embla-carousel-react@8.6.0': 'embla-carousel-react',
      'cmdk@1.1.1': 'cmdk',
      'class-variance-authority@0.7.1': 'class-variance-authority',
      '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
      '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
      '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
      '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
      '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
      '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
      '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
      '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
      '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
      '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
      '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
      '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
      '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
      '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
      '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
      '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
      '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
      '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
      '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
      '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
      '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
      '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
      '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
      // Map "@" to the local src directory for cleaner imports.
      '@': appRoot,
    },
  },
  base: './', // Rutas relativas para hosting
  build: {
    target: 'esnext',
    outDir: path.resolve(projectRoot, 'build'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(appRoot, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});