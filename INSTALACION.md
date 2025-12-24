# 🚀 Instalación Rápida - DashLeads

## Instalación en 3 Pasos

### 1️⃣ Instalar Dependencias

```bash
npm install
```

### 2️⃣ Configurar Base de Datos

```bash
# Crear la base de datos
npx prisma db push

# (Opcional) Agregar datos de ejemplo
npm run db:seed
```

### 3️⃣ Iniciar la Aplicación

```bash
npm run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## ✅ ¡Ya está! Tu plataforma está lista

## 🔑 Configuración Opcional (Recomendada)

### Google Maps API (Para scraping completo)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Activa estas APIs:
   - **Places API**
   - **Geocoding API**
   - **Maps JavaScript API**
4. Crea una API Key
5. Crea un archivo `.env.local`:

```bash
DATABASE_URL="file:./dev.db"
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nota:** Google ofrece $200 de créditos gratis al mes (~40,000 llamadas a Places API)

## 📱 Primeros Pasos

### Opción 1: Usar Datos de Ejemplo

Si ejecutaste `npm run db:seed`, ya tienes 3 prospects de ejemplo en Madrid:
- Bar Central (Lead Score: 85)
- Restaurante El Prado (Lead Score: 92)
- Cafetería La Esquina (Lead Score: 65)

👉 Ve a [http://localhost:3000/prospects](http://localhost:3000/prospects)

### Opción 2: Scraping Real

1. Ve a [http://localhost:3000/scrape](http://localhost:3000/scrape)
2. Selecciona una ciudad (Madrid, Barcelona, Valencia...)
3. Haz clic en "Iniciar Scraping"
4. Espera 2-5 minutos
5. ¡Explora tus nuevos leads!

## 🎯 Flujo de Trabajo Típico

1. **Scraping** → Busca restaurantes/bares en tu ciudad
2. **Prospects** → Revisa leads y oportunidades detectadas
3. **Planificar Ruta** → Crea una ruta optimizada de visitas
4. **Seguimiento** → Marca visitas completadas y registra resultados
5. **Dashboard** → Analiza tus estadísticas y conversión

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build           # Compilar para producción
npm run start           # Iniciar producción

# Base de Datos
npm run db:push         # Actualizar schema
npm run db:studio       # Abrir Prisma Studio (GUI)
npm run db:seed         # Agregar datos de ejemplo

# Otras
npm run lint            # Verificar código
```

## 🗂️ Estructura de Carpetas

```
dashleads/
├── app/                 # Páginas Next.js
│   ├── api/            # Endpoints API
│   ├── prospects/      # Gestión de prospects
│   ├── routes/         # Planificación de rutas
│   ├── scrape/         # Interface de scraping
│   └── dashboard/      # Dashboard principal
├── lib/
│   ├── scrapers/       # Módulos de web scraping
│   ├── prisma.ts       # Cliente de base de datos
│   └── utils.ts        # Funciones útiles
├── prisma/
│   └── schema.prisma   # Schema de base de datos
└── README.md           # Documentación completa
```

## 🌐 Fuentes de Datos Soportadas

- ✅ **Google Places** - Info básica, ubicaciones, ratings
- ✅ **TripAdvisor** - Reviews, menciones de productos
- 🔨 **Glovo** - Menús (en desarrollo)
- 🔨 **Just Eat** - Delivery menus (en desarrollo)
- 🔨 **El Tenedor** - Reservas y info (en desarrollo)

## 💡 Productos Detectados

La plataforma identifica automáticamente si los locales tienen/no tienen:

**Cervezas:** Heineken, Estrella Damm, Mahou, San Miguel, Cruzcampo, etc.
**Refrescos:** Coca-Cola, Pepsi, Fanta, Red Bull, etc.
**Vinos:** Rioja, Ribera del Duero, Albariño, etc.
**Licores:** Absolut, Jägermeister, Licor 43, etc.

## 🔒 Importante sobre Web Scraping

⚠️ **Uso Responsable:**
- El scraping incluye delays para no sobrecargar servidores
- Respeta los términos de servicio de cada plataforma
- Para uso comercial intensivo, considera APIs oficiales
- Algunos sitios tienen protección anti-bot (normal)

## 🆘 Problemas Comunes

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### La base de datos está bloqueada
```bash
pkill -f "prisma studio"
rm prisma/dev.db-journal
```

### El scraping no funciona
- Verifica que tengas tu Google Maps API key configurada
- Algunos sitios pueden bloquearte temporalmente (normal con scraping)
- Aumenta el delay en `.env.local`: `SCRAPING_DELAY_MS=3000`

### Errores de TypeScript
```bash
rm -rf .next
npm run dev
```

## 📚 Más Información

- [README.md](./README.md) - Documentación completa
- [SETUP.md](./SETUP.md) - Guía detallada de setup
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

## 🎉 ¡Listo para Vender!

Tu plataforma de inteligencia de ventas está configurada. Comienza a:
- Identificar oportunidades de venta
- Planificar rutas eficientes
- Convertir más prospects en clientes

**¿Preguntas?** Revisa el README.md o abre un issue en GitHub.

---

**Hecho con ❤️ para equipos de ventas en España** 🇪🇸


