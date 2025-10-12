# TV a la Carta - Sistema Completo

## Descripción
Sistema completo de gestión para TV a la Carta con panel de administración, carrito de compras y sincronización en tiempo real.

## Versión
2.1.0

## Fecha de Exportación
2025-10-12T05:23:47.922Z

## Configuración Actual

### Precios
- Películas: $100 CUP
- Series: $300 CUP por temporada
- Novelas: $5 CUP por capítulo
- Recargo transferencia: 10%

### Zonas de Entrega
Total configuradas: 28

- Santiago de Cuba > Vista Hermosa: $400 CUP
- Santiago de Cuba > Antonio Maceo: $400 CUP
- Santiago de Cuba > Centro de la ciudad: $250 CUP
- Santiago de Cuba > Versalles Hasta el Hotel: $500 CUP
- Santiago de Cuba > Carretera del Morro: $300 CUP
- Santiago de Cuba > Altamira: $400 CUP
- Santiago de Cuba > Cangrejitos: $350 CUP
- Santiago de Cuba > Trocha: $250 CUP
- Santiago de Cuba > Veguita de Galo: $300 CUP
- Santiago de Cuba > Plaza de Martes: $250 CUP
- Santiago de Cuba > Portuondo: $300 CUP
- Santiago de Cuba > Sta Barbara: $300 CUP
- Santiago de Cuba > Sueño: $250 CUP
- Santiago de Cuba > San Pedrito: $150 CUP
- Santiago de Cuba > Agüero: $100 CUP
- Santiago de Cuba > Distrito Jose Martí: $150 CUP
- Santiago de Cuba > Los Pinos: $200 CUP
- Santiago de Cuba > Quintero: $500 CUP
- Santiago de Cuba > 30 de noviembre bajo: $400 CUP
- Santiago de Cuba > Rajayoga: $600 CUP
- Santiago de Cuba > Pastorita: $600 CUP
- Santiago de Cuba > Vista Alegre: $300 CUP
- Santiago de Cuba > Caney: $1000 CUP
- Santiago de Cuba > Nuevo Vista Alegre: $100 CUP
- Santiago de Cuba > Marimón: $100 CUP
- Santiago de Cuba > Versalle Edificios: $800 CUP
- Santiago de Cuba > Ferreiro: $300 CUP
- Santiago de Cuba > 30 de noviembre altos: $500 CUP

### Novelas Administradas
Total: 34

- Alaca (Drama, 120 caps, Turquía)
- Salvaje (Yabani) (Drama, 20 caps, Turquía)
- El Turco (Romance, 6 caps, Turquía)
- Amar, donde el amor teje sus redes (Romance, 90 caps, México)
- Amor en blanco y negro ES (Siyah Beyaz Ask) (Romance, 64 caps, Turquía)
- Amor perfecto (Romance, 60 caps, Brasil)
- Holding (Drama, 20 caps, Turquía)
- La realeza (Romance, 8 caps, India)
- Valentina, mi amor especial (Romance, 39 caps, México)
- Bahar (Drama, 109 caps, Turquía)


... y 24 más

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

```bash
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
```

## Uso del Panel de Administración

1. Acceder a la ruta `/admin`
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

```
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
```

## Configuración

Este backup incluye la configuración completa del sistema aplicada en el momento de la exportación. Los archivos `AdminContext.tsx` y `CartContext.tsx` contienen la configuración embebida.

## Contacto

WhatsApp: +5354690878
Email: contacto@tvalacarta.com

## Licencia

MIT License - Este proyecto es de código abierto

---

**Nota**: Este es un backup completo generado automáticamente el 2025-10-12.
Todos los archivos incluyen el código fuente real con la configuración aplicada.
