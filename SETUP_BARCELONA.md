# 🚀 Barcelona MVP Setup Guide

## Overzicht

VentasIA's Barcelona MVP gebruikt **Google Places API** + **Google Cloud Vision OCR** om menudata uit restaurantfoto's te extraheren en merkpresentie te detecteren.

## 📋 Prerequisites

- Node.js 18+
- Neon/PostgreSQL database
- Google Cloud account

## 🔧 Setup Stappen

### 1. Database Migratie

Eerst de database schema updaten voor brand intelligence:

```bash
npm run db:migrate:brand
```

Dit creëert:
- `brands` - Merken (Heineken, Coca-Cola, etc.)
- `brand_products` - Producten per merk
- `venues` - Restaurants/bars (voorheen `prospects`)
- `product_availability` - Welke producten waar verkrijgbaar zijn
- `competitor_presence` - Concurrentie analyse
- `sales_territories` - Verkoop territoria

### 2. Google Cloud APIs Setup

#### Google Maps API

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project of selecteer bestaand project
3. Enable **Places API** (New)
4. Create API key
5. Kopieer key naar `.env`:

```bash
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

**Kosten**: ~$0.017 per venue details request

#### Google Cloud Vision API

1. In dezelfde Google Cloud Console
2. Enable **Cloud Vision API**
3. Create een **Service Account**:
   - IAM & Admin → Service Accounts → Create Service Account
   - Grant role: "Cloud Vision API User"
4. Create JSON key:
   - Click op service account → Keys → Add Key → Create new key → JSON
   - Download het JSON bestand
5. Sla het bestand op (bijvoorbeeld: `google-vision-credentials.json`)
6. Add path naar `.env`:

```bash
GOOGLE_CLOUD_VISION_KEY="/absolute/path/to/google-vision-credentials.json"
```

**Kosten**: 
- First 1,000 images/maand: **GRATIS**
- Daarna: $1.50 per 1,000 images

### 3. Dependencies Installeren

```bash
npm install
```

Dit installeert:
- `@google-cloud/vision` - Voor OCR
- `@neondatabase/serverless` - Database driver
- En alle andere dependencies

### 4. Barcelona Data Scrapen

**BELANGRIJK**: Zorg dat je `.env` correct is ingesteld!

```bash
npm run seed:barcelona
```

Dit script:
1. ✅ Zoekt 50 restaurants/bars in Barcelona via Google Places
2. ✅ Download menu foto's (max 3 per venue)
3. ✅ Voert OCR uit op de foto's
4. ✅ Detecteert merken (Heineken, Mahou, Estrella Damm, Coca-Cola, etc.)
5. ✅ Slaat alles op in de database

**Verwachte output**:
```
🌱 Starting Barcelona seeding with real data...

📦 Creating brands...
✅ Created 10 brands

🔍 Searching Barcelona venues via Google Places...
✅ Found 50 venues

🏪 Processing venues and detecting products...
  Processing: Restaurant El Xampanyet
    📸 Found 3 photos, running OCR...
    ✅ Detected: heineken, estrella, cocaCola
  Processing: Cerveceria Catalana
    📸 Found 2 photos, running OCR...
    ✅ Detected: mahou, sanMiguel

...

📊 Summary:
   Total venues: 50
   Successfully processed: 50
   With menu data: 38
   Coverage: 76%

✨ Barcelona seeding completed!
```

**Duur**: ~10-15 minuten voor 50 venues

### 5. Start de Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Dashboard Gebruik

### Homepage

- Ga naar `/` - Landing page met info over VentasIA
- Click "Prueba Gratis" om naar dashboard te gaan

### Dashboard

Navigate to `/dashboard`

**Acciones Rápidas** (Quick Actions):
- **Ver Cobertura** → Analyse merkpenetranatie
- **Buscar Oportunidades** → Vind venues zonder jouw merk
- **Gestionar Rutas** → Plan verkoop routes
- **Recopilar Datos** → Admin: scrape nieuwe data

### Coverage Dashboard

`/dashboard/coverage`

1. **Selecteer Merk**: Kies uit Heineken, Mahou, Coca-Cola, etc.
2. **Selecteer Ciudad**: Barcelona (later: Madrid, Valencia, Sevilla)
3. **View Stats**:
   - Penetratie rate (% venues met jouw merk)
   - Coverage per city
   - Coverage per venue type (restaurant, bar, cafe)
   - Product performance
   - Recent changes

### Opportunities Dashboard

`/dashboard/opportunities`

1. **Selecteer Merk & Ciudad**
2. **Filter by Score**: High (>100), Medium (>60), Low (>30)
3. **View Opportunities**:
   - Venues zonder jouw merk
   - Met competitor info
   - Opportunity score berekend op basis van:
     - Rating (Google)
     - Price level
     - Estimated visitors
     - Competitor presence
     - Platform availability
4. **Action**: "Añadir a Ruta" om venue toe te voegen aan sales route

## 📊 Expected Results (MVP)

```
Barcelona Data:
├── 50 venues total
├── 38 venues met menu data (76% coverage)
├── 6-10 brands detected per venue gemiddeld
└── Coverage:
    ├── Heineken: ~30-40% penetratie
    ├── Mahou: ~40-50% penetratie
    ├── Estrella Damm: ~50-60% penetratie (local favorite)
    ├── Coca-Cola: ~70-80% penetratie
    └── Pepsi: ~20-30% penetratie
```

## 🔍 Troubleshooting

### Error: "Google Maps API key not found"

Check `.env` file:
```bash
GOOGLE_MAPS_API_KEY="your-key-here"
```

Restart dev server after adding.

### Error: "Google Cloud Vision API not configured"

1. Check that JSON credentials file exists
2. Check path in `.env` is absolute (not relative)
3. Verify file permissions (readable)

### Error: "No venues found"

1. Check Google Maps API key is valid
2. Verify Places API is enabled in Google Cloud Console
3. Check API quota/billing

### OCR returns empty text

1. Check Cloud Vision API is enabled
2. Verify service account has correct permissions
3. Check API quota
4. Some photos may genuinely not contain text

### Low brand detection rate

1. Review OCR output in console logs
2. Add brand variations to `detectBrandsInText()` in `lib/scrapers/google-places-menus.ts`
3. Some menu photos may be low quality

### "Too many requests" error

You've hit API rate limits:
- Google Places: 100 requests per 100 seconds
- Cloud Vision: 1,800 requests per minute

**Solution**: Add delays in seeding script (already implemented: 200ms per photo)

## 💰 Cost Estimates

### MVP (50 venues):
```
Google Places: 50 × $0.017 = $0.85
Cloud Vision: 100 images = $0 (free tier)
Total: ~$1
```

### Production (200 venues):
```
Google Places: 200 × $0.017 = $3.40
Cloud Vision: 400 images = $0 (free tier)
Total: ~$3.40
```

### Scale (10,000 venues):
```
Google Places: 10,000 × $0.017 = $170
Cloud Vision: 20,000 images = $30
Total: ~$200/month
```

## 🚀 Next Steps

1. ✅ **Test the MVP**: Run with 50 venues
2. **Scale up**: Run with 200 venues
3. **Add cities**: Madrid, Valencia, Sevilla
4. **Add brands**: More beer brands, spirits, snacks
5. **Manual corrections**: Let sales reps update menu data
6. **Competitor analysis**: Track which brands are winning
7. **Territory mapping**: Assign territories to sales reps
8. **Route optimization**: AI-powered route planning
9. **Pre-visit briefings**: AI-generated sales briefings

## 📚 Resources

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [Cloud Vision OCR Docs](https://cloud.google.com/vision/docs/ocr)
- [Neon Database Docs](https://neon.tech/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)

## 🤔 FAQ

**Q: Waarom geen Glovo/Uber Eats scrapers?**  
A: Google Photos + OCR is:
- Legaler (publieke data)
- Hogere coverage (90% heeft foto's)
- Betrouwbaarder (geen bot detection)
- Goedkoper (free tier OCR)

**Q: Wat als een venue geen menu foto's heeft?**  
A: Fallback options:
1. Manual input door sales rep na bezoek
2. Structured APIs (Uber Eats, Just Eat) als backup
3. Crowdsourced data van andere sales reps

**Q: Hoe vaak moet ik data refreshen?**  
A: Aanbevolen: 1× per maand (zoals Dashmote's 5-day refresh cycle)

**Q: Kan ik multiple cities tegelijk scrapen?**  
A: Ja, update `seed-barcelona.ts` met meer areas array entries.

---

**¡Buena suerte! 🚀**


