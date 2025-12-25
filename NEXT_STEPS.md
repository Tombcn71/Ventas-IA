# 🚀 VentasIA - Next Steps

## ✅ Completed

- [x] Google Places + OCR scraper implementation
- [x] Barcelona seeding script
- [x] Brand selector component
- [x] Coverage dashboard with brand filtering
- [x] Opportunities dashboard with brand filtering
- [x] Brands API endpoint
- [x] Documentation (README, SETUP, IMPLEMENTATION_SUMMARY)
- [x] Build passes successfully
- [x] Dependencies installed (@google-cloud/vision)

## 🎯 Immediate Next Steps (To Start Using)

### 1. Setup Google Cloud APIs (15 min)

**Google Maps API**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Enable "Places API (New)"
4. Create API key
5. Add to `.env`:
   ```
   GOOGLE_MAPS_API_KEY="your-key-here"
   ```

**Google Cloud Vision API**:
1. In same project, enable "Cloud Vision API"
2. Create Service Account:
   - IAM & Admin → Service Accounts → Create
   - Role: "Cloud Vision API User"
3. Create JSON key:
   - Click service account → Keys → Add Key → JSON
4. Download JSON file
5. Add path to `.env`:
   ```
   GOOGLE_CLOUD_VISION_KEY="/absolute/path/to/credentials.json"
   ```

**Cost**: ~$1 for 50 venues (MVP)

### 2. Setup Database (5 min)

If not already done:

```bash
# Run brand intelligence migration
npm run db:migrate:brand
```

This creates:
- `brands` table
- `brand_products` table
- `venues` table (renamed from prospects)
- `product_availability` table
- `competitor_presence` table
- `sales_territories` table

### 3. Scrape Barcelona Data (15 min)

```bash
npm run seed:barcelona
```

This will:
- Search 50 venues in Barcelona
- Download menu photos
- Run OCR
- Detect brands (Heineken, Mahou, Estrella Damm, etc.)
- Save to database

**Expected Output**:
```
✅ Created 10 brands
✅ Found 50 venues
✅ With menu data: ~38 venues (76%)
```

### 4. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Test the Dashboard

1. **Homepage**: `/`
   - Click "Prueba Gratis"

2. **Coverage Dashboard**: `/dashboard/coverage`
   - Select brand: "Heineken"
   - Select city: "Barcelona"
   - View penetration rate, city breakdown, etc.

3. **Opportunities Dashboard**: `/dashboard/opportunities`
   - Select brand: "Heineken"
   - Select city: "Barcelona"
   - View venues WITHOUT Heineken
   - See opportunity scores

4. **Prospects**: `/dashboard/prospects`
   - View all venues
   - Filter by city, rating, etc.

5. **Routes**: `/dashboard/routes`
   - Create optimized sales routes

## 📈 Phase 2: Scale Barcelona (1-2 days)

### Increase Coverage

- [ ] Update `seed-barcelona.ts` to scrape 200 venues
- [ ] Add more Barcelona areas (Eixample, Gràcia, Sarrià, etc.)
- [ ] Run: `npm run seed:barcelona`

### Improve Brand Detection

- [ ] Add more brand keywords in `google-places-menus.ts`
- [ ] Test with real menu photos
- [ ] Adjust regex patterns for Spanish variations

### Manual Corrections UI

- [ ] Add "Edit Menu" button in venue details
- [ ] Form to add/remove products manually
- [ ] Update `product_availability` table
- [ ] Track source: "manual" vs "ocr"

### Competitor Analysis

- [ ] Calculate market share per brand
- [ ] Show competitor presence in opportunities
- [ ] Add "Competitor Insights" dashboard section

## 🌍 Phase 3: Multi-City (1 week)

### Add Madrid

```typescript
// In seed-barcelona.ts, add Madrid areas
const areas = [
  { lat: 40.4168, lng: -3.7038, name: 'Madrid Centro' },
  { lat: 40.4378, lng: -3.6795, name: 'Chamartín' },
  // ... more areas
]
```

### Add Valencia, Sevilla, Málaga

- [ ] Create `seed-madrid.ts`, `seed-valencia.ts`, etc.
- [ ] Or make generic `seed-city.ts` with city parameter
- [ ] Update city selector in dashboard

### Territory Management

- [ ] Create territories (e.g., "Barcelona Norte", "Madrid Sur")
- [ ] Assign sales reps to territories
- [ ] Filter opportunities by territory

## 🤖 Phase 4: AI Features (2-3 weeks)

### AI Route Optimization

**Goal**: Given N opportunities, find optimal visit order

**Approach**:
1. Use Google Directions API for travel time
2. Implement Traveling Salesman Problem (TSP) solver
3. Consider:
   - Distance
   - Traffic
   - Opportunity score
   - Time windows

**Files to create**:
- `lib/ai/route-optimizer.ts`
- `app/api/routes/optimize/route.ts`

### Pre-Visit Briefings

**Goal**: Generate AI briefing before sales visit

**Approach**:
1. Gather venue data (rating, reviews, competitors)
2. Use OpenAI API to generate briefing
3. Include:
   - Venue overview
   - Competitor presence
   - Suggested talking points
   - Recent changes

**Files to create**:
- `lib/ai/briefing-generator.ts`
- `app/api/briefings/route.ts`
- `app/dashboard/briefings/[venueId]/page.tsx`

**Example Briefing**:
```
📍 Cervecería Catalana
⭐ 4.5/5 (1,234 reviews)
🍺 Competitors: Mahou, Estrella Damm
💡 Opportunity: High foot traffic, no Heineken

Talking Points:
- Popular tapas bar in Eixample
- High-end clientele (€€€)
- Currently serving Mahou (€2.80) and Estrella (€2.60)
- Heineken could position as premium option at €3.00

Recent Activity:
- Added 3 new menu items last month
- Rating increased from 4.3 to 4.5
```

### AI Lead Scoring

**Goal**: Better opportunity scores using ML

**Approach**:
1. Collect historical conversion data
2. Train model on features:
   - Rating
   - Price level
   - Foot traffic
   - Competitor presence
   - Venue type
   - Location
3. Predict conversion probability

**Files to create**:
- `lib/ai/lead-scorer.ts`
- Training data collection

## 📱 Phase 5: Mobile & Integrations (1 month)

### Mobile App

**Tech Stack**: React Native + Expo

**Features**:
- [ ] Login/auth
- [ ] Today's route
- [ ] Venue details
- [ ] Check-in at venue
- [ ] Post-visit notes
- [ ] Offline mode
- [ ] GPS tracking

### CRM Integration

**Salesforce**:
- [ ] OAuth setup
- [ ] Sync opportunities to Salesforce leads
- [ ] Update visit status
- [ ] Track conversions

**HubSpot**:
- [ ] API integration
- [ ] Contact sync
- [ ] Deal tracking

### WhatsApp Bot

**Features**:
- [ ] Daily route briefing
- [ ] Venue notifications
- [ ] Quick updates ("Closed deal at Venue X")
- [ ] Team chat

**Tech**: Twilio WhatsApp API or WhatsApp Business API

## 🔒 Phase 6: Production Ready (1-2 weeks)

### Authentication

- [ ] NextAuth.js setup
- [ ] Email/password login
- [ ] Google OAuth
- [ ] Role-based access (admin, sales rep, manager)

### Multi-Tenancy

- [ ] Organizations table
- [ ] User → Organization mapping
- [ ] Data isolation per organization
- [ ] Billing per organization

### Billing

- [ ] Stripe integration
- [ ] Subscription plans:
  - Starter: €49/month (1 city, 1 brand)
  - Pro: €199/month (5 cities, unlimited brands)
  - Enterprise: Custom pricing
- [ ] Usage tracking (API calls, venues, etc.)

### Monitoring

- [ ] Sentry for error tracking
- [ ] Vercel Analytics
- [ ] Custom dashboard for:
  - API usage
  - Scraping job status
  - User activity
  - System health

### Performance

- [ ] Database indexes
- [ ] API response caching (Redis)
- [ ] Image optimization
- [ ] CDN for static assets

### Security

- [ ] Rate limiting
- [ ] API key rotation
- [ ] GDPR compliance
- [ ] Data encryption at rest

## 📊 Success Metrics to Track

### Data Quality
- [ ] % venues with menu data
- [ ] OCR accuracy rate
- [ ] Brand detection accuracy
- [ ] Data freshness (last updated)

### User Engagement
- [ ] Daily active users
- [ ] Routes created per week
- [ ] Opportunities viewed
- [ ] Conversion rate (opportunities → visits → sales)

### Business Metrics
- [ ] MRR (Monthly Recurring Revenue)
- [ ] Customer acquisition cost
- [ ] Churn rate
- [ ] NPS (Net Promoter Score)

### Platform Performance
- [ ] API response time (p50, p95, p99)
- [ ] Uptime (target: 99.9%)
- [ ] Error rate (target: <0.1%)
- [ ] Scraping job success rate

## 🎯 Prioritization

### Must Have (MVP)
1. ✅ Google Places + OCR scraper
2. ✅ Barcelona data (50 venues)
3. ✅ Coverage dashboard
4. ✅ Opportunities dashboard
5. [ ] Manual corrections UI
6. [ ] Scale to 200 venues

### Should Have (v1.0)
1. [ ] Multi-city (Madrid, Valencia)
2. [ ] AI route optimization
3. [ ] Pre-visit briefings
4. [ ] Authentication
5. [ ] Mobile app (basic)

### Nice to Have (v2.0)
1. [ ] CRM integrations
2. [ ] WhatsApp bot
3. [ ] Advanced analytics
4. [ ] Multi-tenancy
5. [ ] Billing

## 🚀 Launch Checklist

### Before Launch
- [ ] Test with real sales team (beta users)
- [ ] Collect feedback
- [ ] Fix critical bugs
- [ ] Performance optimization
- [ ] Security audit
- [ ] Legal review (GDPR, terms, privacy)

### Launch Day
- [ ] Deploy to production
- [ ] Monitor errors (Sentry)
- [ ] Monitor performance (Vercel)
- [ ] Customer support ready
- [ ] Marketing materials ready

### Post-Launch
- [ ] Collect user feedback
- [ ] Iterate based on feedback
- [ ] Weekly releases
- [ ] Monthly feature updates

## 📞 Support

Need help? Check:
- [SETUP_BARCELONA.md](./SETUP_BARCELONA.md) - Setup guide
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What was built
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design
- [GitHub Issues](https://github.com/Tombcn71/dashleads/issues) - Report bugs

---

**Ready to start?** Run `npm run seed:barcelona` and let's go! 🚀

