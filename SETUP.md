# DashLeads - Setup Gids

## 🚀 Quick Start (5 minuten)

### 1. Dependencies installeren

```bash
npm install
```

### 2. Database opzetten

```bash
# Initialize Prisma database
npx prisma db push

# (Optioneel) Open Prisma Studio om de database te bekijken
npx prisma studio
```

### 3. Environment variables

Kopieer het voorbeeld bestand:
```bash
cp .env.local.example .env.local
```

**Minimale configuratie (werkt zonder API keys):**
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Volledige configuratie (aanbevolen):**
```env
DATABASE_URL="file:./dev.db"
GOOGLE_MAPS_API_KEY=jouw_api_key_hier
NEXT_PUBLIC_APP_URL=http://localhost:3000
SCRAPING_DELAY_MS=2000
```

### 4. Start de app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📝 Google Maps API Setup (Optioneel maar aanbevolen)

Google Maps API is nodig voor:
- Geocoding (adressen naar coördinaten)
- Google Places scraping
- Betere locatie data

### Stappen:

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project aan
3. Activeer deze APIs:
   - Places API
   - Geocoding API
   - Maps JavaScript API
4. Maak een API key aan
5. (Optioneel) Stel billing in voor hogere limits
6. Voeg de key toe aan `.env.local`:
   ```
   GOOGLE_MAPS_API_KEY=jouw_api_key_hier
   ```

**Gratis tier limits:**
- $200 gratis credits per maand
- ~40.000 Places API calls gratis per maand

## 🧪 Test de App

### 1. Test zonder scraping (mock data)

Je kunt de app testen door handmatig test data toe te voegen via Prisma Studio:

```bash
npx prisma studio
```

Of via de API:

```bash
curl -X POST http://localhost:3000/api/prospects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bar Ejemplo",
    "address": "Calle Mayor 1",
    "city": "Madrid",
    "latitude": 40.4168,
    "longitude": -3.7038,
    "businessType": "bar",
    "rating": 4.5,
    "reviewCount": 150,
    "priceRange": "€€",
    "currentProducts": ["Coca-Cola", "Mahou"],
    "missingProducts": [
      {"brand": "Heineken", "category": "beer"}
    ],
    "source": "manual",
    "sourceUrl": ""
  }'
```

### 2. Test met echte scraping

1. Zorg dat je een Google Maps API key hebt
2. Ga naar `/scrape`
3. Selecteer een stad (bijv. Madrid)
4. Start scraping (kan 2-5 minuten duren)
5. Bekijk resultaten in `/prospects`

## 🗂️ Database Beheer

### Reset database

```bash
rm prisma/dev.db
npx prisma db push
```

### Bekijk database

```bash
npx prisma studio
```

### Export data

```bash
sqlite3 prisma/dev.db .dump > backup.sql
```

## 🔧 Development Tips

### Hot reload werkt niet?

```bash
# Stop de dev server (Ctrl+C)
rm -rf .next
npm run dev
```

### TypeScript errors?

```bash
npm run build
```

### Database schema gewijzigd?

```bash
npx prisma db push
npx prisma generate
```

## 📦 Production Deployment

### Vercel (Aanbevolen)

1. Push code naar GitHub
2. Import in Vercel
3. Configureer environment variables
4. Vercel detecteert Next.js automatisch
5. Deploy! ✨

**Let op:** Voor production gebruik je waarschijnlijk een echte database (PostgreSQL) i.p.v. SQLite.

Update dan `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

En je `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Docker (Optioneel)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t dashleads .
docker run -p 3000:3000 dashleads
```

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Scraping werkt niet

1. **Google Places**: Controleer API key en limits
2. **TripAdvisor**: Mogelijk geblokkeerd door anti-bot, gebruik rate limiting
3. **Glovo**: Vereist Puppeteer setup (nog niet volledig geïmplementeerd)

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Database locked

```bash
# Stop alle processen die de database gebruiken
pkill -f "prisma studio"
rm prisma/dev.db-journal
```

## 📚 Meer Info

- [Next.js Documentatie](https://nextjs.org/docs)
- [Prisma Documentatie](https://www.prisma.io/docs)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service)

## 🆘 Hulp Nodig?

- Check de [README.md](./README.md) voor algemene info
- Open een issue op GitHub
- Voor scraping problemen: check de rate limits en anti-bot protectie

---

**Happy selling! 🚀**


