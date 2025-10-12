// Utilidad para leer archivos del proyecto usando import.meta.glob
// Este módulo permite acceder al código fuente real de todos los archivos

export async function getAllProjectFiles(): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  // Usar import.meta.glob para obtener todos los archivos del proyecto
  const modules = import.meta.glob([
    '../../**/*.{ts,tsx,js,jsx,css,json,html,md}',
    '!../../node_modules/**',
    '!../../dist/**',
    '!../../build/**'
  ], {
    query: '?raw',
    import: 'default',
    eager: false
  });

  // Cargar todos los archivos
  for (const [path, importFn] of Object.entries(modules)) {
    try {
      const content = await importFn() as string;
      // Convertir la ruta relativa a ruta de proyecto
      const projectPath = path.replace('../..', '').replace(/^\//, '');
      files.set(projectPath, content);
    } catch (error) {
      console.warn(`Could not load file: ${path}`, error);
    }
  }

  return files;
}

// Función para obtener archivos de configuración estáticos
export function getConfigFiles(): Map<string, string> {
  const files = new Map<string, string>();

  // Estos archivos serán generados estáticamente ya que import.meta.glob
  // no puede leer archivos fuera de src/
  files.set('.gitignore', `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`);

  files.set('package.json', JSON.stringify({
    "name": "tv-a-la-carta-sistema-completo",
    "private": true,
    "version": "2.1.0",
    "type": "module",
    "description": "Sistema completo de gestión para TV a la Carta con panel de administración",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "lint": "eslint .",
      "preview": "vite preview"
    },
    "dependencies": {
      "@types/node": "^24.2.1",
      "jszip": "^3.10.1",
      "lucide-react": "^0.344.0",
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "react-router-dom": "^7.8.0"
    },
    "devDependencies": {
      "@eslint/js": "^9.9.1",
      "@types/react": "^18.3.5",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.1",
      "autoprefixer": "^10.4.18",
      "eslint": "^9.9.1",
      "eslint-plugin-react-hooks": "^5.1.0-rc.0",
      "eslint-plugin-react-refresh": "^0.4.11",
      "globals": "^15.9.0",
      "postcss": "^8.4.35",
      "tailwindcss": "^3.4.1",
      "typescript": "^5.5.3",
      "typescript-eslint": "^8.3.0",
      "vite": "^5.4.2"
    },
    "keywords": [
      "tv",
      "movies",
      "series",
      "anime",
      "streaming",
      "cart",
      "admin",
      "react",
      "typescript"
    ],
    "author": "TV a la Carta",
    "license": "MIT"
  }, null, 2));

  files.set('vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});`);

  files.set('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};`);

  files.set('postcss.config.js', `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`);

  files.set('tsconfig.json', JSON.stringify({
    "files": [],
    "references": [
      { "path": "./tsconfig.app.json" },
      { "path": "./tsconfig.node.json" }
    ]
  }, null, 2));

  files.set('tsconfig.app.json', JSON.stringify({
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "isolatedModules": true,
      "moduleDetection": "force",
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src"]
  }, null, 2));

  files.set('tsconfig.node.json', JSON.stringify({
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["ES2023"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true,
      "strict": true,
      "noEmit": true
    },
    "include": ["vite.config.ts"]
  }, null, 2));

  files.set('vercel.json', `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`);

  files.set('public/_redirects', `# Netlify redirects for SPA routing
/*    /index.html   200

# Handle specific routes
/movies    /index.html   200
/tv        /index.html   200
/anime     /index.html   200
/cart      /index.html   200
/search    /index.html   200
/movie/*   /index.html   200
/tv/*      /index.html   200
/admin     /index.html   200`);

  return files;
}
