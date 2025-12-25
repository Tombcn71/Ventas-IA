# DashLeads Brand Intelligence Guide

## 🎯 Wat is het?

DashLeads is een **B2B Brand Intelligence Platform** voor FMCG bedrijven (dranken, voedsel, etc.) om hun marktpresence te monitoren en sales opportunities te identificeren in de Spaanse horeca.

### Voor wie?
- **Merken**: Heineken, Coca-Cola, San Miguel, etc.
- **Gebruikers**: Brand managers, sales directors, field sales reps

### Wat levert het op?
1. **Market Coverage**: Waar wordt jouw merk verkocht?
2. **Sales Opportunities**: Waar wordt jouw merk NIET verkocht maar wel concurrenten?
3. **Competitor Intelligence**: Wat is het marktaandeel per gebied?
4. **Field Sales Enablement**: Verkopers krijgen geprioriteerde leads

## 🏗️ Nieuwe Architectuur

### Database Schema

#### 1. Brands
```sql
CREATE TABLE brands (
  id TEXT PRIMARY KEY,
  name TEXT,              -- "Heineken"
  company TEXT,           -- "Heineken España"
  logo_url TEXT,
  industry TEXT           -- "beverages"
)
```

#### 2. Brand Products
```sql
CREATE TABLE brand_products (
  id TEXT PRIMARY KEY,
  brand_id TEXT,
  product_name TEXT,      -- "Heineken Lager"
  category TEXT,          -- "Beer"
  keywords JSONB          -- ["heineken", "heineken beer"]
)
```

#### 3. Venues (was: Prospects)
```sql
CREATE TABLE venues (
  id TEXT PRIMARY KEY,
  name TEXT,
  venue_type TEXT,        -- "bar", "restaurant", "cafe"
  rating DECIMAL,
  price_level INTEGER,    -- 1-4
  estimated_weekly_visitors INTEGER,
  platforms JSONB         -- {"glovo": true, "ubereats": false}
)
```

#### 4. Product Availability
```sql
CREATE TABLE product_availability (
  venue_id TEXT,
  brand_product_id TEXT,
  is_available BOOLEAN,   -- TRUE = aanwezig, FALSE = niet aanwezig
  source TEXT,            -- "glovo", "tripadvisor"
  confidence DECIMAL,
  price DECIMAL
)
```

#### 5. Competitor Presence
```sql
CREATE TABLE competitor_presence (
  venue_id TEXT,
  brand_id TEXT,
  competitor_products JSONB  -- [{"name": "Estrella", "price": 2.5}]
)
```

#### 6. Sales Territories
```sql
CREATE TABLE sales_territories (
  id TEXT PRIMARY KEY,
  brand_id TEXT,
  name TEXT,              -- "Barcelona Centro"
  cities JSONB,           -- ["Barcelona"]
  sales_person_name TEXT
)
```

## 📊 Nieuwe Features

### 1. Coverage Dashboard (`/dashboard/coverage`)
**Wat het toont:**
- Market penetration percentage
- Coverage per stad
- Coverage per venue type
- Product performance
- Recent changes (gains/losses)

**Voorbeeld:**
```
Heineken is aanwezig in 450 van 1.200 venues in Barcelona (37.5%)
```

### 2. Opportunities Dashboard (`/dashboard/opportunities`)
**Wat het toont:**
- High-value venues zonder jouw merk
- Prioritized opportunity scoring
- Competitor presence info
- Estimated revenue potential

**Voorbeeld:**
```
230 restaurants in Barcelona hebben Estrella maar niet Heineken
Geschatte waarde: €11.500/maand
```

### 3. Smart Opportunity Scoring
```javascript
Score = (
  rating * 20 +                    // 4.5 stars = 90 points
  price_level * 15 +               // High-end = 60 points
  weekly_visitors / 100 +          // 1000 visitors = 10 points
  has_competitors * 10 +           // Has Estrella = 10 points
  on_platforms * 5                 // On Glovo = 5 points
)

Prioritization:
- Score > 100: HIGH priority
- Score 60-100: MEDIUM priority
- Score < 60: LOW priority
```

## 🚀 Setup

### 1. Database Migration
```bash
# Run brand intelligence migration
npm run db:migrate:brand
```

Dit creëert de nieuwe tabellen:
- `brands`
- `brand_products`
- `product_availability`
- `competitor_presence`
- `sales_territories`

En update bestaande tabellen:
- Hernoemt `prospects` → `venues`
- Voegt nieuwe kolommen toe

### 2. Seed Demo Data
```bash
# Seed met Heineken & Coca-Cola demo data
npm run db:seed:brand
```

Dit creëert:
- 2 demo brands (Heineken, Coca-Cola)
- 4 products
- 2 sales territories
- Product availability data
- Competitor presence data

### 3. Start Dev Server
```bash
npm run dev
```

Navigeer naar:
- **Coverage**: `http://localhost:3000/dashboard/coverage`
- **Opportunities**: `http://localhost:3000/dashboard/opportunities`

## 🎨 UI Updates

### Sidebar Navigation
```
Dashboard
├── Dashboard (overview)
├── 📊 Cobertura (market coverage)
├── 🎯 Oportunidades (sales opportunities)
├── 🏪 Venues (all venues)
├── 🗺️ Rutas (route planning)
└── 🔍 Scraping (data acquisition)
```

## 🔌 API Endpoints

### Coverage API
```
GET /api/coverage?brandId={id}&city={city}

Response:
{
  overview: {
    totalVenues: 1200,
    coveredVenues: 450,
    penetrationRate: 37.5,
    uncoveredVenues: 750
  },
  cityBreakdown: [...],
  typeBreakdown: [...],
  productPerformance: [...],
  recentChanges: [...]
}
```

### Opportunities API
```
GET /api/opportunities?brandId={id}&city={city}&minScore={score}

Response:
{
  opportunities: [
    {
      id: "...",
      name: "Bar Modernista",
      opportunityScore: 120,
      priority: "high",
      competitorProducts: ["Estrella", "Mahou"],
      estimatedWeeklyVisitors: 1500
    }
  ],
  summary: {
    totalOpportunities: 230,
    highValueOpportunities: 87,
    withCompetitors: 210,
    estimatedMonthlyRevenue: 11500
  }
}
```

## 💡 Use Cases

### Use Case 1: Brand Manager
**Vraag**: "Wat is onze market penetration in Barcelona?"

**Antwoord via Coverage Dashboard**:
- Heineken: 37.5% (450 van 1.200 venues)
- Top in: High-end restaurants (65%)
- Zwak in: Cafés (22%)
- Trend: +2.3% deze maand

### Use Case 2: Sales Director
**Vraag**: "Waar moeten onze verkopers naartoe?"

**Antwoord via Opportunities Dashboard**:
- 87 high-priority venues zonder Heineken
- €11.500 potentiele monthly revenue
- Top opportunity: "Bar Modernista" (score: 120)
  - 4.8 stars, 1500 visitors/week
  - Heeft Estrella en Mahou
  - Op Glovo en Uber Eats

### Use Case 3: Field Sales Rep (Barcelona)
**Vraag**: "Wat is mijn target list voor deze week?"

**Antwoord via Territory + Route Planning**:
1. Filtered opportunities in Barcelona Centro
2. Sorted by opportunity score
3. Create optimized route
4. Track visits and outcomes

### Use Case 4: Competitor Analysis
**Vraag**: "Waar wint Estrella van ons?"

**Antwoord via Coverage + Competitor Data**:
- Estrella: 52% penetration in Barcelona
- Heineken: 37.5%
- Estrel la dominant in: Tapas bars (68% vs 31%)
- Opportunity: Displace Estrella in 156 venues

## 📈 Metrics That Matter

### For Brand
- Market penetration %
- Growth rate
- Competitive win rate
- ROI on field sales

### For Sales Rep
- Qualified leads per week
- Visit-to-conversion rate
- Territory coverage %
- Revenue generated

## 🎯 Next Steps

### Phase 1: ✅ Foundation (Complete)
- [x] Database schema
- [x] Coverage API
- [x] Opportunities API
- [x] Coverage Dashboard
- [x] Opportunities Dashboard

### Phase 2: 🚧 Enhancement
- [ ] Brand/Product configuration UI
- [ ] Territory management UI
- [ ] Visit outcome tracking
- [ ] Competitor intelligence dashboard

### Phase 3: 🔮 Advanced
- [ ] Computer vision for logo detection
- [ ] NLP for menu analysis
- [ ] Predictive analytics
- [ ] Mobile app for field sales
- [ ] Real-time alerts
- [ ] Integration with CRM systems

## 💰 Pricing Strategy

### Tier 1: Coverage (€499/month)
- Market presence monitoring
- Basic coverage dashboard
- 1 brand, 10 products
- Monthly data refresh

### Tier 2: Sales Intelligence (€999/month)
- Everything in Coverage
- Opportunity identification
- Lead scoring
- Territory management
- 1 brand, 50 products
- Weekly data refresh

### Tier 3: Enterprise (€2,499/month)
- Everything in Sales Intelligence
- Competitor intelligence
- Market share analysis
- Unlimited products & territories
- Daily data refresh
- API access
- Priority support

## 🔑 Key Differentiators

1. **Spain-First**: Deep integration met Spaanse platforms (Glovo, Just Eat)
2. **Actionable**: Direct lead generation, niet alleen insights
3. **Field Sales Focus**: Route planning + visit tracking
4. **Real-time**: Fresh data, geen maandelijkse reports
5. **Affordable**: SME-friendly pricing
6. **Easy**: No data science team needed

## 📞 Support

Voor vragen of support:
- Email: support@dashleads.com
- Docs: https://docs.dashleads.com
- GitHub: https://github.com/Tombcn71/dashleads

---

**Built with ❤️ for the Spanish FMCG market**

