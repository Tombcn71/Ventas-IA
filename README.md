# VentasIA - AI Sales Copilot for Spain 🇪🇸

**VentasIA** es una plataforma de inteligencia de ventas que ayuda a equipos comerciales a encontrar clientes potenciales que **aún no venden su producto**. Usando IA y datos públicos de 30.000+ restaurantes y bares en España, convertimos información desordenada en rutas inteligentes y oportunidades de venta reales.

![VentasIA](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green)

## 🎯 ¿Qué Hace VentasIA?

### Para Equipos de Ventas (Heineken, Coca-Cola, etc.)

1. **📸 Recopilamos Datos Automáticamente**
   - Extraemos menús de fotos de Google Places usando OCR
   - Detectamos qué marcas están presentes en cada venue
   - Actualizamos datos mensualmente

2. **🤖 IA Encuentra Oportunidades**
   - Identifica venues sin tu marca pero con alto potencial
   - Calcula opportunity scores basados en rating, tráfico, competencia
   - Prioriza los mejores leads

3. **🗺️ IA Planifica Rutas Inteligentes**
   - Optimiza el orden de visitas
   - Genera briefings pre-visita con contexto del cliente
   - Ahorra tiempo y aumenta conversiones

## 🚀 Quick Start

### Barcelona MVP (50 venues, 15 minutos)

```bash
# 1. Clone repo
git clone https://github.com/Tombcn71/dashleads.git
cd dashleads

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Add your Google Maps API key and Cloud Vision credentials

# 4. Run database migration
npm run db:migrate:brand

# 5. Scrape Barcelona data (50 venues)
npm run seed:barcelona

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

**Detailed setup**: Ver [SETUP_BARCELONA.md](./SETUP_BARCELONA.md)

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 + TypeScript |
| **Database** | Neon (PostgreSQL) |
| **Styling** | Tailwind CSS |
| **Data Collection** | Google Places API + Cloud Vision OCR |
| **Maps** | Leaflet + React Leaflet |
| **Charts** | Recharts |
| **Deployment** | Vercel |

## 📊 Architecture

### Data Flow

```
Google Places API
    ↓
Venue Photos (menu images)
    ↓
Google Cloud Vision OCR
    ↓
Text Extraction
    ↓
Brand Detection (Heineken, Mahou, Coca-Cola, etc.)
    ↓
Database (venues + product_availability)
    ↓
Dashboard (Coverage + Opportunities)
```

### Database Schema

```sql
brands                  -- Heineken, Coca-Cola, etc.
  ↓
brand_products         -- Heineken Lager, Coca-Cola Zero, etc.
  ↓
venues                 -- Restaurants/bars
  ↓
product_availability   -- Which products are sold where
  ↓
competitor_presence    -- Competitor analysis
  ↓
sales_territories      -- Territory mapping
```

**Full schema**: Ver [docs/BRAND_INTELLIGENCE_ARCHITECTURE.md](./docs/BRAND_INTELLIGENCE_ARCHITECTURE.md)

## 📁 Project Structure

```
dashleads/
├── app/
│   ├── api/                      # API routes
│   │   ├── brands/              # Brand management
│   │   ├── coverage/            # Coverage analysis
│   │   ├── opportunities/       # Sales opportunities
│   │   ├── prospects/           # Prospect management
│   │   ├── routes/              # Route planning
│   │   └── stats/               # Dashboard stats
│   ├── dashboard/               # Dashboard UI
│   │   ├── components/          # Shared components
│   │   ├── coverage/            # Coverage view
│   │   ├── opportunities/       # Opportunities view
│   │   ├── prospects/           # Prospect management
│   │   ├── routes/              # Route planning
│   │   └── scrape/              # Admin: data collection
│   └── page.tsx                 # Homepage
├── lib/
│   ├── scrapers/
│   │   └── google-places-menus.ts  # Google Places + OCR scraper
│   ├── db.ts                    # Database connection
│   ├── migrate-brand-intelligence.ts  # Schema migrations
│   ├── seed-barcelona.ts        # Barcelona data seeding
│   └── seed-brand-intelligence.ts     # Demo data
├── docs/
│   ├── ARCHITECTURE.md          # System architecture
│   ├── BARCELONA_MVP.md         # Barcelona MVP guide
│   └── BRAND_INTELLIGENCE_ARCHITECTURE.md  # Data model
└── SETUP_BARCELONA.md           # Setup instructions
```

## 🎨 Features

### 1. Coverage Dashboard (`/dashboard/coverage`)

- **Penetración de Mercado**: % de venues con tu marca
- **Coverage por Ciudad**: Barcelona, Madrid, Valencia, etc.
- **Coverage por Tipo**: Restaurantes, bares, cafés
- **Product Performance**: Cuáles productos venden mejor
- **Recent Changes**: Nuevas adiciones/eliminaciones

### 2. Opportunities Dashboard (`/dashboard/opportunities`)

- **Sales Opportunities**: Venues sin tu marca
- **Opportunity Score**: Basado en rating, tráfico, competencia
- **Priority Levels**: High/Medium/Low
- **Competitor Analysis**: Qué marcas están presentes
- **Quick Actions**: Añadir a ruta, ver detalles

### 3. Route Planning (`/dashboard/routes`)

- **AI Route Optimization**: Orden óptimo de visitas
- **Map View**: Visualización de ruta en mapa
- **Pre-Visit Briefings**: Contexto del cliente antes de visita
- **Visit Tracking**: Log de visitas completadas

### 4. Data Collection (`/dashboard/scrape`)

- **Admin Interface**: Iniciar scraping jobs
- **Job Monitoring**: Track progreso de scraping
- **Data Sources**: Google Places, OCR, etc.
- **Refresh Cycle**: Actualización mensual

## 🔧 API Endpoints

### Brands
```
GET  /api/brands              # List all brands
```

### Coverage
```
GET  /api/coverage?brandId=X&city=Barcelona
# Returns: penetration rate, city breakdown, product performance
```

### Opportunities
```
GET  /api/opportunities?brandId=X&city=Barcelona&minScore=60
# Returns: venues without brand, opportunity scores, competitors
```

### Prospects (Venues)
```
GET    /api/prospects         # List venues
POST   /api/prospects         # Create venue
GET    /api/prospects/:id     # Get venue details
PATCH  /api/prospects/:id     # Update venue
DELETE /api/prospects/:id     # Delete venue
```

### Routes
```
GET  /api/routes              # List routes
POST /api/routes              # Create optimized route
```

### Stats
```
GET  /api/stats               # Dashboard statistics
```

## 💰 Costs

### Barcelona MVP (50 venues)
```
Google Places API:  50 × $0.017 = $0.85
Cloud Vision OCR:   100 images   = $0 (free tier)
Total:                            ~$1
```

### Production (10,000 venues)
```
Google Places:  10,000 × $0.017 = $170
Cloud Vision:   20,000 images   = $30
Total:                            ~$200/month
```

**Free tier**: Google Cloud Vision: 1,000 images/month gratis

## 🌍 Roadmap

### Phase 1: Barcelona MVP ✅
- [x] Google Places + OCR scraper
- [x] Brand detection (Heineken, Mahou, Coca-Cola, etc.)
- [x] Coverage dashboard
- [x] Opportunities dashboard
- [x] 50 venues scraped

### Phase 2: Scale Barcelona
- [ ] 200 venues
- [ ] Manual corrections by sales reps
- [ ] Competitor analysis
- [ ] Territory mapping

### Phase 3: Multi-City
- [ ] Madrid
- [ ] Valencia
- [ ] Sevilla
- [ ] Málaga

### Phase 4: Advanced Features
- [ ] AI route optimization
- [ ] Pre-visit briefings
- [ ] CRM integration
- [ ] WhatsApp bot
- [ ] Mobile app

## 🤝 Contributing

1. Fork el repositorio
2. Crea tu feature branch (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📚 Documentation

- [Setup Guide](./SETUP_BARCELONA.md) - Cómo empezar
- [Architecture](./docs/ARCHITECTURE.md) - System design
- [Brand Intelligence](./docs/BRAND_INTELLIGENCE_ARCHITECTURE.md) - Data model
- [Barcelona MVP](./docs/BARCELONA_MVP.md) - MVP details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Tombcn71/dashleads/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Tombcn71/dashleads/discussions)

## 📄 License

MIT License - ver [LICENSE](./LICENSE)

## 🙏 Acknowledgments

- Inspired by [Dashmote](https://dashmote.com/)
- Built with ❤️ for sales teams en España

---

**Made with 🍺 in Barcelona**
