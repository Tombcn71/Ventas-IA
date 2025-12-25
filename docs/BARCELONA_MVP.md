# 🚀 Barcelona MVP - Menu OCR Implementation

## 📖 Overview

VentasIA's Barcelona MVP leverages **Google Places API** + **Google Cloud Vision OCR** to extract menu data from restaurant photos and detect brand presence.

### Why Photo OCR?

- **90% Coverage**: Most restaurants upload menu photos to Google
- **Cost Effective**: Google Cloud Vision free tier covers 1000 images/month
- **Real Data**: Actual menus as they appear in venues
- **Legal**: Public data, no scraping required

## 🛠️ Tech Stack

### 1. Google Places API
- **Purpose**: Find restaurants/bars in Barcelona
- **Data**: Name, address, location, photos, rating
- **Cost**: $0.017 per Place Details request

### 2. Google Cloud Vision API
- **Purpose**: Extract text from menu photos (OCR)
- **Cost**: 
  - First 1,000 images/month: **FREE**
  - After: $1.50 per 1,000 images
- **Accuracy**: 90-95% for Spanish text

### 3. Product Detection
- **Purpose**: Parse OCR text for brand keywords
- **Brands**: Heineken, Mahou, Estrella Damm, Coca-Cola, Pepsi, etc.

## 📊 MVP Costs

### Barcelona (200 venues)
```
Google Places Details: 200 × $0.017 = $3.40
Cloud Vision OCR: 400 images = $0 (free tier)
Total: ~$3.40
```

### Scale (10,000 venues)
```
Google Places: 10,000 × $0.017 = $170
Cloud Vision: 20,000 images = $30
Total: ~$200/month
```

## 🔧 Setup Instructions

### 1. Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Places API**
4. Create API key
5. Add to `.env`:
   ```
   GOOGLE_MAPS_API_KEY="your-key-here"
   ```

### 2. Google Cloud Vision

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Cloud Vision API**
3. Create a Service Account
4. Download JSON credentials
5. Add to `.env`:
   ```
   GOOGLE_CLOUD_VISION_KEY="/path/to/credentials.json"
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Barcelona Seeding

```bash
npm run seed:barcelona
```

This will:
- ✅ Search 50 restaurants/bars in Barcelona
- ✅ Download menu photos
- ✅ Run OCR on photos
- ✅ Detect brands (Heineken, Mahou, etc.)
- ✅ Save to database

## 📁 File Structure

```
lib/
├── scrapers/
│   └── google-places-menus.ts  # Places API + OCR logic
└── seed-barcelona.ts            # Barcelona seeding script

API Flow:
1. searchVenuesBarcelona()       → Find venues via Places API
2. getPlaceDetails()             → Get photos + details
3. extractMenuText()             → OCR on photos
4. detectBrandsInText()          → Parse brands from text
5. Save to database              → venues + product_availability
```

## 🎯 Expected Results

```
✅ 50 venues scraped
✅ ~40 venues with menu photos (80%)
✅ ~35 venues with detected brands (70%)
✅ Brands: Heineken, Mahou, Estrella Damm, Coca-Cola, etc.
```

## 🔄 Workflow

### Phase 1: Initial Scraping
```bash
npm run seed:barcelona
```

### Phase 2: Dashboard Usage

1. **Sales Rep logs in**
2. **Selects brand**: "Heineken"
3. **Views Coverage**: 
   - 35 venues have Heineken ✅
   - 15 venues don't have Heineken ⚠️
4. **Views Opportunities**:
   - Top 10 venues without Heineken
   - Sorted by rating/foot traffic
5. **Plans Route**:
   - AI optimizes visit order
   - Pre-visit briefing generated

### Phase 3: Monthly Refresh

```bash
# Run monthly to refresh data
npm run seed:barcelona
```

## 🚧 Limitations

### Current
- **Barcelona only**: Need to expand to other cities
- **50 venues**: MVP scope, can scale to 10,000+
- **OCR accuracy**: 90-95%, some brands may be missed
- **Photo quality**: Varies by venue

### Solutions
1. **Multi-city**: Add Madrid, Valencia, Seville
2. **Scale**: Batch process thousands of venues
3. **Accuracy**: Manual corrections by sales reps
4. **Coverage**: Fallback to structured APIs (Uber Eats, Just Eat)

## 🔮 Next Steps

1. ✅ Build Barcelona MVP (50 venues)
2. 🔄 Test with real Heineken sales data
3. 📈 Scale to 200 venues
4. 🌍 Add Madrid, Valencia
5. 🤖 Add sales rep manual corrections
6. 📊 Add competitor analysis
7. 🎯 Add territory mapping

## 📈 Success Metrics

- **Coverage**: % of venues with menu data
- **Accuracy**: % of correctly detected brands
- **ROI**: Sales increase per visit
- **Efficiency**: Time saved on prospecting

## 💡 Pro Tips

1. **Rate Limiting**: Add delays between API calls
2. **Caching**: Store photos locally to reduce API costs
3. **Batch Processing**: Process multiple venues in parallel
4. **Error Handling**: Log failed OCR attempts for manual review
5. **Quality Filter**: Only process high-quality menu photos

## 🆘 Troubleshooting

### "OCR returns empty text"
- Check photo quality
- Verify Cloud Vision API is enabled
- Check credentials path

### "No venues found"
- Verify Google Maps API key
- Check Barcelona coordinates
- Ensure Places API is enabled

### "Brand not detected"
- Check keyword list in `detectBrandsInText()`
- Add brand variations (e.g., "Mahou 5 Estrellas")
- Review OCR output for typos

## 📚 Resources

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [Cloud Vision API Docs](https://cloud.google.com/vision/docs)
- [Places API Pricing](https://developers.google.com/maps/billing-and-pricing/pricing#places-details)
- [Vision API Pricing](https://cloud.google.com/vision/pricing)


