# DashLeads - Sales Intelligence Platform

Una plataforma de inteligencia de ventas para el mercado español que ayuda a equipos de ventas B2B a identificar oportunidades mediante el análisis de datos de restaurantes, bares y cafeterías.

## 🎯 Concepto

DashLeads scrapes datos de múltiples plataformas españolas para identificar qué productos NO venden los establecimientos, convirtiéndolos en leads calificados para vendedores de bebidas, alimentos y otros productos horeca.

### Características Principales

- **🔍 Scraping Inteligente**: Extrae datos de Google Places, TripAdvisor, Glovo y más
- **🎯 Gap Analysis**: Identifica productos faltantes (ej: no venden Heineken)
- **📊 Lead Scoring**: Calcula automáticamente la calidad de cada lead
- **🗺️ Planificación de Rutas**: Optimiza rutas de visitas para maximizar eficiencia
- **📱 Dashboard Completo**: Gestión de prospects, visitas y estadísticas
- **🇪🇸 Enfoque en España**: Adaptado para el mercado español

## 🏗️ Stack Tecnológico

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (Prisma ORM)
- **Scraping**: Cheerio, Axios, Puppeteer
- **Maps**: Leaflet, Google Maps API
- **UI**: Lucide Icons, Recharts

## 📚 Fuentes de Datos

### Activas
- ✅ **Google Places API**: Información básica, coordenadas, ratings
- ✅ **TripAdvisor**: Reviews, menciones de productos en comentarios

### En Desarrollo
- 🔨 **Glovo**: Menús y productos
- 🔨 **Just Eat Spain**: Menús de delivery
- 🔨 **El Tenedor**: Información de restaurantes

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd dashleads
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` y añade tus API keys:
```env
DATABASE_URL="file:./dev.db"
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Inicializar la base de datos**
```bash
npx prisma db push
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📖 Uso

### 1. Scraping de Datos

1. Ve a `/scrape`
2. Selecciona una ciudad española (Madrid, Barcelona, Valencia, etc.)
3. Opcionalmente especifica tipo de cocina
4. Haz clic en "Iniciar Scraping"
5. Espera a que complete (puede tardar varios minutos)

### 2. Gestión de Prospects

1. Ve a `/prospects`
2. Filtra por ciudad, estado, prioridad o lead score
3. Haz clic en un prospect para ver detalles completos
4. Ve oportunidades (productos que NO venden)
5. Actualiza estado, añade notas, programa follow-ups

### 3. Planificación de Rutas

1. Ve a `/routes/create`
2. Selecciona prospects para visitar
3. El sistema optimiza la ruta automáticamente
4. Guarda la ruta y asigna a un vendedor
5. Sigue el progreso de visitas

### 4. Dashboard y Estadísticas

1. Ve a `/dashboard`
2. Ve KPIs principales
3. Analiza conversión por ciudad
4. Revisa actividad reciente
5. Identifica top oportunidades

## 🗂️ Estructura del Proyecto

```
dashleads/
├── app/                      # Next.js App Router
│   ├── api/                 # API endpoints
│   │   ├── prospects/       # CRUD prospects
│   │   ├── routes/          # Gestión de rutas
│   │   ├── visits/          # Registro de visitas
│   │   ├── scrape/          # Jobs de scraping
│   │   └── stats/           # Estadísticas
│   ├── prospects/           # Páginas de prospects
│   ├── routes/              # Páginas de rutas
│   ├── scrape/              # Interface de scraping
│   └── page.tsx             # Homepage
├── lib/
│   ├── scrapers/            # Módulos de scraping
│   │   ├── google-places.ts
│   │   ├── tripadvisor-scraper.ts
│   │   ├── glovo-scraper.ts
│   │   ├── product-detector.ts
│   │   └── index.ts
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Utilidades
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

## 🎯 Productos Tracked

La plataforma detecta la presencia/ausencia de:

### Cervezas
- Heineken, Estrella Damm, Mahou, San Miguel, Cruzcampo, Amstel, Corona, Alhambra

### Refrescos
- Coca-Cola, Pepsi, Fanta, Aquarius, Nestea, Red Bull

### Vinos
- Rioja, Ribera del Duero, Albariño, Verdejo, Cava

### Licores
- Absolut, Jägermeister, Licor 43, Baileys

## 📊 Database Schema

### Prospect
- Información básica (nombre, dirección, coordenadas)
- Business info (tipo, cocina, precio, rating)
- Sales intelligence (productos faltantes, score)
- Lead tracking (estado, prioridad, notas)

### Visit
- Registro de visitas a prospects
- Outcome, duración, pedidos

### Route
- Rutas planificadas
- Optimización automática
- Tracking de progreso

### Activity
- Log de todas las interacciones
- Calls, emails, visits, notes

## 🔒 Consideraciones Legales

⚠️ **IMPORTANTE**: El web scraping debe realizarse de forma responsable:

1. Respeta los `robots.txt` de cada sitio
2. Implementa rate limiting adecuado
3. No sobrecargues los servidores
4. Considera usar APIs oficiales cuando estén disponibles
5. Para producción, usa servicios profesionales como ScrapingBee

## 🚀 Roadmap

### Fase 1 (Completada)
- ✅ Setup básico Next.js + Prisma
- ✅ Scrapers para Google Places y TripAdvisor
- ✅ Sistema de lead scoring
- ✅ Dashboard UI básico
- ✅ CRUD de prospects

### Fase 2 (En Progreso)
- 🔨 Integración completa de Glovo
- 🔨 Route planning con mapa interactivo
- 🔨 Mobile responsive
- 🔨 Exportar datos a CSV/Excel

### Fase 3 (Futuro)
- 📋 App móvil para vendedores
- 📋 Integración con CRM (Salesforce, HubSpot)
- 📋 Machine learning para mejor scoring
- 📋 Análisis de competencia
- 📋 Reportes automáticos

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una branch para tu feature
3. Commit tus cambios
4. Push a la branch
5. Abre un Pull Request

## 📝 Licencia

MIT License - siéntete libre de usar este proyecto para tus propios fines.

## 🙏 Agradecimientos

- Inspirado en [Dashmote](https://dashmote.com/)
- Built with Next.js, Prisma, y otras increíbles herramientas open source

## 📧 Contacto

¿Preguntas? ¿Sugerencias? Abre un issue en GitHub.

---

**Hecho con ❤️ para ayudar a los equipos de ventas españoles**


