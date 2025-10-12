import JSZip from 'jszip';
import type { SystemConfig } from '../context/AdminContext';
import { getAllProjectFiles, getConfigFiles } from './fileReader';

// Función principal para generar el código fuente completo con configuración embebida
export async function generateCompleteSourceCode(systemConfig: any): Promise<void> {
  try {
    const zip = new JSZip();

    // Obtener todos los archivos del proyecto
    const projectFiles = await getAllProjectFiles();
    const configFiles = getConfigFiles();

    // Combinar archivos del proyecto y configuración
    const allFiles = new Map([...projectFiles, ...configFiles]);

    // Procesar y agregar archivos al ZIP con configuración embebida
    for (const [filePath, content] of allFiles.entries()) {
      let finalContent = content;

      // Si es AdminContext.tsx, inyectar la configuración actual
      if (filePath.includes('context/AdminContext.tsx')) {
        finalContent = injectConfigIntoAdminContext(content, systemConfig);
      }

      // Si es CartContext.tsx, inyectar la configuración de precios
      if (filePath.includes('context/CartContext.tsx')) {
        finalContent = injectConfigIntoCartContext(content, systemConfig);
      }

      // Agregar archivo al ZIP manteniendo la estructura de carpetas
      zip.file(filePath, finalContent);
    }

    // Agregar archivos de configuración adicionales
    zip.file('README.md', generateReadme(systemConfig));
    zip.file('.env.example', generateEnvExample());
    zip.file('eslint.config.js', generateEslintConfig());
    zip.file('index.html', generateIndexHtml());

    // Generar y descargar el ZIP
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TV_a_la_Carta_Sistema_Completo_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error generating complete source code:', error);
    throw error;
  }
}

// Función para inyectar configuración en AdminContext
function injectConfigIntoAdminContext(content: string, systemConfig: any): string {
  // Buscar el bloque de EMBEDDED_CONFIG y reemplazarlo
  const configBlock = `const EMBEDDED_CONFIG = ${JSON.stringify({
    version: systemConfig.version || '2.1.0',
    prices: systemConfig.prices || {},
    deliveryZones: systemConfig.deliveryZones || [],
    novels: systemConfig.novels || [],
    settings: systemConfig.settings || {},
    exportDate: systemConfig.exportDate || new Date().toISOString()
  }, null, 2)};`;

  // Si ya existe un bloque EMBEDDED_CONFIG, reemplazarlo
  if (content.includes('const EMBEDDED_CONFIG =')) {
    return content.replace(
      /const EMBEDDED_CONFIG = \{[\s\S]*?\};/,
      configBlock
    );
  }

  // Si no existe, agregarlo después de los imports
  const importEndIndex = content.lastIndexOf('import ');
  const nextLineIndex = content.indexOf('\n', importEndIndex);

  return (
    content.slice(0, nextLineIndex + 1) +
    '\n// CONFIGURACIÓN EMBEBIDA - Generada automáticamente\n' +
    configBlock +
    '\n' +
    content.slice(nextLineIndex + 1)
  );
}

// Función para inyectar configuración en CartContext
function injectConfigIntoCartContext(content: string, systemConfig: any): string {
  const pricesConfig = `const EMBEDDED_PRICES = ${JSON.stringify(systemConfig.prices || {}, null, 2)};`;
  const zonesConfig = `const EMBEDDED_DELIVERY_ZONES = ${JSON.stringify(systemConfig.deliveryZones || [], null, 2)};`;

  if (content.includes('const EMBEDDED_PRICES =')) {
    content = content.replace(
      /const EMBEDDED_PRICES = \{[\s\S]*?\};/,
      pricesConfig
    );
  } else {
    const importEndIndex = content.lastIndexOf('import ');
    const nextLineIndex = content.indexOf('\n', importEndIndex);
    content = (
      content.slice(0, nextLineIndex + 1) +
      '\n// PRECIOS EMBEBIDOS - Generados automáticamente\n' +
      pricesConfig +
      '\n' +
      content.slice(nextLineIndex + 1)
    );
  }

  if (content.includes('const EMBEDDED_DELIVERY_ZONES =')) {
    content = content.replace(
      /const EMBEDDED_DELIVERY_ZONES = \[[\s\S]*?\];/,
      zonesConfig
    );
  } else {
    const embedPricesIndex = content.indexOf('const EMBEDDED_PRICES =');
    if (embedPricesIndex !== -1) {
      const nextLineIndex = content.indexOf('\n', embedPricesIndex);
      content = (
        content.slice(0, nextLineIndex + 1) +
        '\n// ZONAS DE ENTREGA EMBEBIDAS - Generadas automáticamente\n' +
        zonesConfig +
        '\n' +
        content.slice(nextLineIndex + 1)
      );
    }
  }

  return content;
}

// Función para generar README
function generateReadme(systemConfig: any): string {
  return `# TV a la Carta - Sistema Completo

## Descripción
Sistema completo de gestión para TV a la Carta con panel de administración, carrito de compras y sincronización en tiempo real.

## Versión
${systemConfig.version || '2.1.0'}

## Fecha de Exportación
${systemConfig.exportDate || new Date().toISOString()}

## Configuración Actual

### Precios
- Películas: $${systemConfig.prices?.moviePrice || 80} CUP
- Series: $${systemConfig.prices?.seriesPrice || 300} CUP por temporada
- Novelas: $${systemConfig.prices?.novelPricePerChapter || 5} CUP por capítulo
- Recargo transferencia: ${systemConfig.prices?.transferFeePercentage || 10}%

### Zonas de Entrega
Total configuradas: ${systemConfig.deliveryZones?.length || 0}

${systemConfig.deliveryZones && systemConfig.deliveryZones.length > 0
  ? systemConfig.deliveryZones.map((zone: any) =>
    `- ${zone.name}: $${zone.cost} CUP`
  ).join('\n')
  : 'No hay zonas configuradas'
}

### Novelas Administradas
Total: ${systemConfig.novels?.length || 0}

${systemConfig.novels && systemConfig.novels.length > 0
  ? systemConfig.novels.slice(0, 10).map((novel: any) =>
    `- ${novel.titulo} (${novel.genero}, ${novel.capitulos} caps, ${novel.pais})`
  ).join('\n')
  : 'No hay novelas configuradas'
}

${systemConfig.novels && systemConfig.novels.length > 10 ? `\n... y ${systemConfig.novels.length - 10} más` : ''}

## Características
- ✅ Panel de administración completo
- ✅ Sincronización en tiempo real
- ✅ Gestión de precios dinámicos
- ✅ Zonas de entrega personalizables
- ✅ Catálogo de novelas administrable
- ✅ Sistema de notificaciones
- ✅ Exportación/Importación de configuración
- ✅ Optimización de rendimiento
- ✅ Carrito de compras avanzado
- ✅ Integración con WhatsApp
- ✅ Interfaz responsiva y moderna
- ✅ Búsqueda avanzada de contenido
- ✅ Integración con TMDB

## Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env y agrega tu API key de TMDB

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
\`\`\`

## Uso del Panel de Administración

1. Acceder a la ruta \`/admin\`
2. Usar las credenciales de administrador
3. Gestionar novelas, zonas de entrega y precios
4. Exportar/importar configuraciones

## Tecnologías Utilizadas

- **React 18** - Framework de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **Lucide Icons** - Iconos
- **JSZip** - Generación de archivos ZIP
- **TMDB API** - Base de datos de películas

## Estructura del Proyecto

\`\`\`
tv-a-la-carta/
├── public/           # Archivos estáticos
├── src/
│   ├── components/   # Componentes React
│   ├── context/      # Contextos de React
│   ├── hooks/        # Custom hooks
│   ├── pages/        # Páginas de la aplicación
│   ├── services/     # Servicios (API, etc.)
│   ├── types/        # Definiciones de tipos
│   ├── utils/        # Utilidades
│   ├── App.tsx       # Componente principal
│   ├── main.tsx      # Punto de entrada
│   └── index.css     # Estilos globales
├── index.html        # HTML base
├── package.json      # Dependencias y scripts
├── vite.config.ts    # Configuración de Vite
├── tailwind.config.js # Configuración de Tailwind
└── tsconfig.json     # Configuración de TypeScript
\`\`\`

## Configuración

Este backup incluye la configuración completa del sistema aplicada en el momento de la exportación. Los archivos \`AdminContext.tsx\` y \`CartContext.tsx\` contienen la configuración embebida.

## Contacto

WhatsApp: +5354690878
Email: contacto@tvalacarta.com

## Licencia

MIT License - Este proyecto es de código abierto

---

**Nota**: Este es un backup completo generado automáticamente el ${new Date().toISOString().split('T')[0]}.
Todos los archivos incluyen el código fuente real con la configuración aplicada.
`;
}

// Función para generar .env.example
function generateEnvExample(): string {
  return `# TMDB API Configuration
VITE_TMDB_API_KEY=tu_api_key_aqui
VITE_TMDB_ACCESS_TOKEN=tu_access_token_aqui

# WhatsApp Configuration
VITE_WHATSAPP_NUMBER=5354690878

# Admin Configuration
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin123

# Application Configuration
VITE_APP_NAME=TV a la Carta
VITE_APP_VERSION=2.1.0
`;
}

// Función para generar eslint.config.js
function generateEslintConfig(): string {
  return `import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
`;
}

// Función para generar index.html
function generateIndexHtml(): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/unnamed.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <base href="/" />
    <title>TV a la Carta: Películas y series ilimitadas y mucho más</title>
    <meta name="description" content="Sistema completo de gestión para TV a la Carta con películas, series, anime y novelas" />
    <style>
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }

      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }

      body {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        text-size-adjust: 100%;
        touch-action: manipulation;
      }

      input[type="text"],
      input[type="email"],
      input[type="tel"],
      input[type="password"],
      input[type="number"],
      input[type="search"],
      textarea,
      select {
        font-size: 16px !important;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}
