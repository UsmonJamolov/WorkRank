# WorkRank — Mobil Ilova

Xodimlar davomati, sifat nazorati va motivatsiya platformasi.

## Loyiha tuzilmasi

```
WorkRank/
├── mobile/          # React Native (Expo) mobil ilova
├── backend/         # Node.js Express API
└── *.txt            # Loyiha hujjatlari
```

## Mobil ilova ekranlari

| Ekran | Tavsif |
|-------|--------|
| Splash | WORKRANK logo + "Work. Share. Improve." |
| Login | Telefon + parol |
| Home | Instagram feed + Story bar + Like/Dislike |
| Story | 24 soatlik storylar |
| Upload | Rasm yuklash (kamera/galereya) |
| Rating | Top 10 (kunlik/haftalik/oylik) |
| Profile | Davomat, statistika, QR skaner |
| Notifications | Bildirishnomalar |

## Ishga tushirish

### Brauzerda ko'rish (TEZ USUL)

```bash
cd c:\Users\HP\Desktop\WorkRank\web
node server.js
```

Keyin brauzerda oching: **http://localhost:5500**

Yoki `start.bat` faylini ikki marta bosing.

**Demo login:** telefon `998901234567`, parol `123456` → **Kirish**

---

### Mobil ilova (Expo)

```bash
cd mobile
npm install
npx expo start
```

Telefoningizda **Expo Go** ilovasini o'rnating va QR kodni skanerlang.

**Demo login:**
- Telefon: `998901234567`
- Parol: `123456` (har qanday parol ishlaydi)

### 2. Backend API

```bash
cd backend
npm install
npm start
```

API: `http://localhost:3000/api/health`

## Dizayn

- Primary: `#2563EB`
- Success: `#22C55E`
- Danger: `#EF4444`
- Background: `#F8FAFC`
- Bottom Navigation: Home | Story | Upload | Rating | Profile

## MVP funksiyalar

- [x] Login
- [x] QR Davomat skaneri
- [x] Feed (Instagram uslubi)
- [x] Post yuklash
- [x] Like / Dislike + izoh
- [x] Reyting (Top 10)
- [x] Profil + statistika
- [x] Story (24 soat)
- [x] Bildirishnomalar

## Texnologiyalar

**Mobile:** React Native, Expo, TypeScript, React Navigation  
**Backend:** Node.js, Express, JWT
# WorkRank
