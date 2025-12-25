# Brand Intelligence Architecture

## Overview
DashLeads is een B2B SaaS platform voor FMCG merken om hun market presence te monitoren en sales opportunities te identificeren.

## Core Concepts

### 1. De Klant (Brand Owner)
- **Wie**: Heineken, Coca-Cola, San Miguel, etc.
- **Wat ze willen**: Marktinzicht en sales lead generation
- **Gebruikers**: Field sales teams per regio

### 2. Data Sources
- **Delivery Platforms**: Glovo, Uber Eats, Just Eat, Deliveroo
- **Review Sites**: TripAdvisor, Google Maps, Yelp
- **Social Media**: Instagram, Facebook (menu posts)
- **Restaurant Websites**: Direct menus

### 3. Value Propositions

#### A. Market Coverage Analysis
```
"Heineken is aanwezig in 450 van 1.200 horeca outlets in Barcelona (37.5%)"
```
- Penetratie per stad/wijk
- Trends over tijd
- Benchmarking tegen concurrenten

#### B. Sales Opportunity Identification
```
"230 high-end restaurants in Barcelona verkopen Estrella maar niet Heineken"
```
- Qualified leads voor verkopers
- Prioritering o.b.v. venue quality, foot traffic, etc.
- Competitor displacement opportunities

#### C. Competitor Intelligence
```
"In Madrid heeft Mahou 45% marktaandeel, Heineken 28%, Estrella 27%"
```
- Market share per stad/regio
- Waar wint de concurrent?
- Pricing intelligence

## Enhanced Data Model

### Brand (nieuwe tabel)
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,                    -- "Heineken"
  company TEXT NOT NULL,                 -- "Heineken España"
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Brand_Products (nieuwe tabel)
```sql
CREATE TABLE brand_products (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  product_name TEXT NOT NULL,            -- "Heineken Lager"
  category TEXT NOT NULL,                -- "Beer"
  keywords JSONB,                        -- ["heineken", "heineken beer"]
  sku TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Venue (hernoemen van Prospect)
```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  venue_type TEXT,                       -- "bar", "restaurant", "cafe"
  cuisine_type TEXT[],                   -- ["spanish", "tapas"]
  rating DECIMAL,
  price_level INTEGER,                   -- 1-4
  estimated_weekly_visitors INTEGER,
  platforms JSONB,                       -- {"glovo": true, "ubereats": false}
  last_scraped_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Product_Availability (nieuwe tabel)
```sql
CREATE TABLE product_availability (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES venues(id),
  brand_product_id UUID REFERENCES brand_products(id),
  is_available BOOLEAN,                  -- TRUE = aanwezig, FALSE = niet aanwezig
  detected_at TIMESTAMP,
  source TEXT,                           -- "glovo", "tripadvisor"
  confidence DECIMAL,                    -- 0.0-1.0
  price DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Competitor_Presence (nieuwe tabel)
```sql
CREATE TABLE competitor_presence (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES venues(id),
  brand_id UUID REFERENCES brands(id),
  competitor_products JSONB,             -- [{"name": "Estrella", "category": "Beer"}]
  detected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Sales_Territory (nieuwe tabel)
```sql
CREATE TABLE sales_territories (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  name TEXT NOT NULL,                    -- "Barcelona Centro"
  cities TEXT[],
  sales_person_name TEXT,
  sales_person_email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Dashboard Features

### 1. Coverage Dashboard
**Voor**: Brand Manager / Marketing
**Toont**:
- Total market presence (aantal venues met product)
- Penetration rate per stad
- Heatmap: waar is product aanwezig?
- Trend: groei/daling over tijd

### 2. Opportunity Dashboard  
**Voor**: Sales Director
**Toont**:
- High-value venues zonder product
- Competitor displacement opportunities
- New venue openings
- Prioritized lead list

### 3. Competitor Dashboard
**Voor**: Brand Manager / Strategy
**Toont**:
- Market share per stad/regio
- Share of voice analysis
- Competitive pricing
- Where competitors are winning

### 4. Sales Territory Dashboard
**Voor**: Field Sales Rep (Barcelona)
**Toont**:
- My territory coverage
- My leads (venues zonder product)
- Route planning
- Visit tracking & outcomes

## Smart Lead Scoring Algorithm

```javascript
Lead Score = (
  venue_rating * 20 +                    // 4.5 stars = 90 points
  price_level * 15 +                     // High-end = 60 points
  estimated_visitors / 100 +             // 1000 visitors = 10 points
  competitor_presence * 10 +             // Has Estrella = 10 points
  platform_presence * 5                  // On Glovo = 5 points
)

// Prioritize:
// 1. High score venues without brand
// 2. Have competitor products (displacement opportunity)
// 3. High foot traffic
```

## Scraping Strategy

### Phase 1: Basic Presence Detection
1. Scrape venue menus from delivery platforms
2. Use keyword matching for brand detection
3. Store: venue + products found

### Phase 2: Smart Detection
1. OCR on menu images
2. NLP for product mentions in reviews
3. Computer vision for brand logos in photos

### Phase 3: Competitor Intelligence
1. Detect ALL beer/beverage brands
2. Build competitor catalog
3. Track market share changes

## API Endpoints

### Brand Management
```
POST   /api/brands                     // Create brand account
GET    /api/brands/:id                 // Get brand details
PUT    /api/brands/:id/products        // Configure tracked products
```

### Coverage Analysis
```
GET    /api/coverage/overview          // Total presence
GET    /api/coverage/by-city/:city     // City penetration
GET    /api/coverage/heatmap           // Geographic data
GET    /api/coverage/trends            // Time series
```

### Opportunity Management
```
GET    /api/opportunities               // All leads
GET    /api/opportunities/:territory   // Territory-specific leads
POST   /api/opportunities/:id/assign   // Assign to sales rep
```

### Competitor Intelligence
```
GET    /api/competitors                // All competitors
GET    /api/competitors/market-share   // Share by region
GET    /api/competitors/presence/:id   // Where competitor is
```

## Implementation Phases

### Phase 1 (MVP) - Current
- [x] Basic venue scraping
- [x] Product detection (missing products)
- [x] Route planning
- [ ] Multi-brand support

### Phase 2 (Brand Intelligence)
- [ ] Brand/Product configuration
- [ ] Coverage dashboard
- [ ] Opportunity scoring
- [ ] Territory management

### Phase 3 (Competitor Intelligence)
- [ ] Competitor tracking
- [ ] Market share analysis
- [ ] Pricing intelligence
- [ ] Alerts & notifications

### Phase 4 (Advanced)
- [ ] Computer vision for logos
- [ ] NLP for sentiment analysis
- [ ] Predictive analytics
- [ ] Mobile app for field sales

## Pricing Model

### Tier 1: Coverage (€499/month)
- Market presence monitoring
- Basic coverage dashboard
- 1 brand, 10 products

### Tier 2: Sales Intelligence (€999/month)
- Everything in Coverage
- Opportunity identification
- Lead scoring
- 1 brand, 50 products
- 5 sales territories

### Tier 3: Enterprise (€2,499/month)
- Everything in Sales Intelligence
- Competitor intelligence
- Market share analysis
- Unlimited products
- Unlimited territories
- API access

## Key Differentiators vs Dashmote

1. **Spain-First**: Deep integration met Spaanse platforms
2. **Field Sales Focus**: Route planning + CRM features
3. **Real-time**: Fresh data, not monthly reports
4. **Actionable**: Direct lead generation, not just insights
5. **Affordable**: SME-friendly pricing

## Success Metrics

### For Brand
- Market penetration increase
- Sales conversion rate
- ROI on field sales
- Competitive win rate

### For Sales Rep
- Qualified leads per week
- Visit success rate
- Territory coverage
- Time saved on prospecting

## Next Steps

1. ✅ Update database schema
2. ✅ Create brand management UI
3. ✅ Build coverage dashboard
4. ✅ Implement opportunity scoring
5. ✅ Add competitor tracking
6. ✅ Create sales territory management


