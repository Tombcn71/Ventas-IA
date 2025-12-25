# DashLeads - Arquitectura Técnica

## 🏗️ Visión General

DashLeads es una plataforma de Sales Intelligence construida con Next.js 14 (App Router), TypeScript y Prisma, enfocada en el mercado B2B español del sector Horeca.

## 📊 Stack Tecnológico

### Frontend
- **Next.js 14** (App Router) - Framework React con SSR/SSG
- **React 18** - UI Library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **React Leaflet** - Maps (para rutas)

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **SQLite** - Development database (fácil migrar a PostgreSQL)

### Scraping
- **Axios** - HTTP client
- **Cheerio** - HTML parsing (jQuery-like)
- **Puppeteer** - Headless browser (para sitios con JS)

## 🗄️ Database Schema

```prisma
┌─────────────┐
│  Prospect   │ ◄──┐
├─────────────┤    │
│ id          │    │
│ name        │    │
│ address     │    │
│ coordinates │    │
│ rating      │    │
│ leadScore   │    │
│ missing[...]│    │
│ current[...]│    │
└─────────────┘    │
       │           │
       │ 1:N       │ M:N
       ▼           │
┌─────────────┐    │
│   Visit     │    │
├─────────────┤    │
│ id          │    │
│ visitDate   │    │
│ outcome     │    │
│ orderValue  │    │
└─────────────┘    │
                   │
┌─────────────┐    │
│   Route     │ ───┘
├─────────────┤
│ id          │
│ name        │
│ plannedDate │
│ optimized   │
└─────────────┘
       │ 1:N
       ▼
┌──────────────┐
│RouteProspect │
├──────────────┤
│ routeId      │
│ prospectId   │
│ orderIndex   │
│ visited      │
└──────────────┘
```

## 🔄 Flujo de Datos

### 1. Scraping Flow

```
Usuario → Scrape Page → API /scrape
                           │
                           ├─> Create Scraping Job
                           │
                           ├─> Google Places Scraper
                           │   └─> Extract: name, address, coords, rating
                           │
                           ├─> TripAdvisor Scraper
                           │   └─> Extract: reviews, product mentions
                           │
                           ├─> Product Detector
                           │   └─> Analyze: found products, missing products
                           │
                           ├─> Lead Scorer
                           │   └─> Calculate: lead score (0-100)
                           │
                           └─> Save Prospects to DB
```

### 2. Lead Scoring Algorithm

```typescript
Lead Score = 
  Rating Score (0-30)       // Based on business rating
  + Review Score (0-20)     // Based on number of reviews
  + Gap Score (0-30)        // Number of missing products
  + Recency Score (0-20)    // Time since last contact

Max: 100 points
```

**Scoring Breakdown:**
- **Rating**: `rating * 6` (max 30)
- **Reviews**: `min(reviewCount / 10, 20)` (max 20)
- **Missing Products**: `min(count * 10, 30)` (max 30)
- **Recency**: 
  - Never contacted: 20 points
  - 90+ days: 20 points
  - 30-90 days: 10 points
  - < 30 days: 0 points

### 3. Route Optimization

```
Selected Prospects → Optimize Algorithm → Ordered Route
                           │
                           ├─> Nearest Neighbor Algorithm
                           │   1. Start from user location
                           │   2. Find nearest prospect
                           │   3. Move to nearest, repeat
                           │
                           ├─> Calculate Total Distance
                           │   └─> Haversine formula
                           │
                           └─> Estimate Duration
                               └─> 10 min/visit + 3 min/km
```

**Nearest Neighbor Algorithm:**
```typescript
function optimizeRoute(prospects, startLat, startLng) {
  const remaining = [...prospects]
  const ordered = []
  let current = { lat: startLat, lng: startLng }
  
  while (remaining.length > 0) {
    // Find nearest
    const nearest = findNearest(current, remaining)
    ordered.push(nearest)
    remaining.remove(nearest)
    current = nearest.location
  }
  
  return ordered
}
```

### 4. Product Detection

```
Menu Items → Product Detector → Found & Missing
                  │
                  ├─> Normalize text (lowercase, remove accents)
                  │
                  ├─> Check keywords for each product
                  │   Example: ["heineken"] → found in menu?
                  │
                  ├─> Calculate confidence (0-100)
                  │   Based on keyword matches
                  │
                  └─> Prioritize opportunities
                      - Business type matching
                      - Price range matching
                      - Category importance
```

## 🎯 API Endpoints

### Prospects
```
GET    /api/prospects          # List all (with filters)
POST   /api/prospects          # Create new
GET    /api/prospects/[id]     # Get one
PATCH  /api/prospects/[id]     # Update
DELETE /api/prospects/[id]     # Delete
```

### Routes
```
GET    /api/routes             # List all routes
POST   /api/routes             # Create optimized route
GET    /api/routes/[id]        # Get route details
PATCH  /api/routes/[id]        # Update route
```

### Scraping
```
POST   /api/scrape             # Start scraping job
GET    /api/scrape?jobId=X     # Get job status
```

### Statistics
```
GET    /api/stats              # Dashboard statistics
GET    /api/stats?salesPerson=X # Per salesperson
```

### Visits
```
GET    /api/visits             # List visits
POST   /api/visits             # Log new visit
GET    /api/visits?prospectId=X # By prospect
```

## 🔍 Scrapers Architecture

### Base Scraper Interface
```typescript
interface Scraper {
  scrapeRestaurants(config: ScraperConfig): Promise<RestaurantData[]>
}

interface ScraperConfig {
  city: string
  cuisine?: string
  limit?: number
  delayMs?: number
}
```

### Implemented Scrapers

**1. Google Places Scraper**
- Uses: Google Places API
- Returns: Basic info, coordinates, ratings
- Rate limit: 1 request/second
- Reliability: ★★★★★

**2. TripAdvisor Scraper**
- Uses: HTTP + Cheerio (HTML parsing)
- Returns: Reviews, ratings, product mentions
- Rate limit: 1 request/2 seconds
- Reliability: ★★★★☆ (anti-bot puede bloquear)

**3. Glovo Scraper** (En desarrollo)
- Needs: Puppeteer (JavaScript rendering)
- Returns: Full menus, prices
- Challenges: Heavy anti-bot protection
- Reliability: ★★☆☆☆

### Scraping Best Practices

1. **Rate Limiting**: Siempre usar delays entre requests
2. **User Agent**: Rotar user agents para evitar detección
3. **Error Handling**: Graceful degradation si un scraper falla
4. **Caching**: No scraper el mismo prospect dentro de 24h
5. **Respect robots.txt**: Aunque no sea legalmente requerido

## 🔐 Security Considerations

### Data Privacy
- No almacenamos información sensible de usuarios finales
- Datos públicos (restaurantes) son scraped responsablemente
- API keys en `.env.local`, nunca en el código

### API Security
- Rate limiting en API endpoints (TODO)
- Input validation con Zod (TODO)
- CORS configurado apropiadamente (TODO)

### Scraping Ethics
- Delays entre requests
- Respect para términos de servicio
- No sobrecargar servidores
- Usar APIs oficiales cuando disponibles

## 📈 Escalabilidad

### Current Setup (MVP)
- SQLite database
- Serverless API routes
- Client-side rendering (CSR)
- **Límites**: ~1000 prospects, single user

### Scale to 10K Prospects
- Migrar a PostgreSQL
- Add database indexing
- Server-side rendering (SSR)
- Redis caching
- Background jobs (BullMQ)

### Scale to 100K+ Prospects
- PostgreSQL con replicación
- Microservices architecture
- Queue system para scraping
- CDN para assets estáticos
- Multi-tenant architecture
- Analytics pipeline (ClickHouse)

## 🚀 Performance Optimizations

### Current
- ✅ Next.js automatic code splitting
- ✅ Image optimization (Next/Image)
- ✅ Static generation donde posible
- ✅ API route caching (stale-while-revalidate)

### TODO
- ⏳ Database query optimization (indexes)
- ⏳ Virtual scrolling para listas largas
- ⏳ Service worker para offline support
- ⏳ Bundle size optimization
- ⏳ Lazy loading de componentes pesados

## 🧪 Testing Strategy (Recomendado)

```
Unit Tests
├─ lib/utils.ts (calculateDistance, leadScore)
├─ lib/scrapers/product-detector.ts
└─ lib/scrapers/google-places.ts

Integration Tests
├─ API routes (/api/prospects, /api/routes)
└─ Scraping orchestrator

E2E Tests (Playwright)
├─ User flow: scrape → prospects → route
└─ Dashboard statistics
```

## 📦 Deployment Options

### Vercel (Recomendado)
- ✅ Zero config para Next.js
- ✅ Edge functions
- ✅ Auto scaling
- ⚠️ Serverless limits (10s timeout)

### Docker
```dockerfile
FROM node:18-alpine
# ... build steps
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional VPS
- Nginx reverse proxy
- PM2 process manager
- PostgreSQL database
- Redis cache

## 🔄 Future Enhancements

### Fase 2
- [ ] Mobile app (React Native)
- [ ] Real-time updates (WebSockets)
- [ ] Email notifications
- [ ] PDF reports generation
- [ ] CSV/Excel export

### Fase 3
- [ ] Machine learning lead scoring
- [ ] Competitor analysis
- [ ] Predictive analytics
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] WhatsApp integration para follow-ups

## 📚 Referencias

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Web Scraping Best Practices](https://www.scraperapi.com/blog/web-scraping-best-practices/)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

---

**Última actualización:** Diciembre 2025



