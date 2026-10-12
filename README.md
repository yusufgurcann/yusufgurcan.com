# Yusuf Gürcan — Portfolyo

Astro + TypeScript ile yazılmış, Türkçe/İngilizce, statik kişisel portfolyo sitesi.
> `dist/` klasörü `npm run build` ile **otomatik üretilen** yayın çıktısıdır; okunmak ya da elle düzenlenmek için değildir.
> Düzenleme her zaman `src/` altında yapılır.

Sitede sunucu, veritabanı ya da framework çalışma zamanı yok. Çıktı saf HTML ve CSS; JavaScript yalnızca küçük iyileştirmeler için kullanılıyor.

**Çalıştırmak için:** VS Code'da bu klasörü aç → soldaki "Run and Debug" (▷) → **Siteyi çalıştır** (ya da F5).
Tarayıcı kendiliğinden `http://localhost:4321` adresini açar. Terminalden:

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # tip kontrolü (astro check) + dist/ çıktısı
npm run preview   # build çıktısını yerelde açar
npm run cv        # CV PDF'lerini (TR + EN) sitenin içeriğinden yeniden üretir
```

### CV

CV elle tutulmaz; sitenin içerik dosyalarından üretilir (`src/views/CvPage.astro`, `/cv/` ve `/en/cv/` sayfaları).
İçerikte bir şey değiştirdiğinde `npm run cv` çalıştır; `public/cv/` altındaki iki PDF güncellenir ve
site üzerindeki "CV'yi indir" bağlantıları bunları verir. Düzen ATS (aday takip sistemi) dostudur:
tek sütun, standart başlıklar, gerçek metin, deneyimler yeniden eskiye. PDF'i Chrome üretir
(başka bir Chromium tarayıcı için `CHROME_PATH` ortam değişkenini ayarla).

## İçeriği düzenlemek

Metinlerin hiçbiri bileşenlerin içinde değil. Neyi nereden değiştireceğin:

| Ne | Dosya |
| --- | --- |
| E-posta, GitHub, LinkedIn, CV, "fırsatlara açığım" | `src/config/site.ts` |
| Giriş ve Hakkımda metinleri | `src/content/profile.yaml` |
| Deneyim zaman çizelgesi (ve giriş bölümündeki bloklar) | `src/content/journey.yaml` |
| Projeler | `src/content/projects.yaml` |
| Beceriler | `src/content/skills.yaml` |
| Eğitim | `src/content/education.yaml` |
| "Tanışalım" sohbeti | `src/content/conversation.yaml` |
| Menü, başlıklar, buton yazıları | `src/i18n/ui.ts` |

- Çevrilebilir her metin `{ tr: "...", en: "..." }` şeklinde yazılıyor.
- YAML dosyaları build sırasında `src/content.config.ts` içindeki şemalarla doğrulanıyor. Eksik bir çeviri ya da yanlış yazılmış bir alan adı build'i durdurur, yani bozuk sayfa yayına çıkmaz.
- `null` bırakılan bilgiler (iletişim kanalları, proje durumu, tarih) **geliştirme ortamında** kesikli çizgili bir "eklenecek" etiketiyle görünür, **yayında** ise gizlenir.
- CV için PDF'i `public/cv/` altına koy ve `site.ts` içindeki `cv` alanına yolunu yaz (örn. `/cv/yusuf-gurcan-cv.pdf`).
- Domain belli olunca `.env.example` dosyasını `.env` olarak kopyala ve `PUBLIC_SITE_URL` alanını doldur. Canonical, hreflang ve Open Graph adresleri bu değerden üretilir.

## Mimari

```
src/
├─ content/            İçerik (YAML) — tek doğruluk kaynağı
├─ content.config.ts   İçerik şemaları (zod) — build-time doğrulama
├─ config/             Site ayarları, bölüm id'leri ve menü
├─ i18n/               Diller, arayüz sözlüğü, çevirmen fonksiyonu
├─ lib/                Saf TypeScript: içerik repository'si, tarih etiketleri, tahta geometrisi
├─ components/
│  ├─ layout/          Header, Footer, dil ve tema düğmeleri
│  ├─ sections/        Sayfanın bölümleri (her biri tek iş yapar)
│  ├─ hero/            Yolculuk tahtası
│  ├─ projects/        Proje kartı
│  ├─ seo/             Head meta + JSON-LD
│  └─ ui/              Section, Tag, LinkButton, Pending, BlockGlyph
├─ layouts/            HTML iskeleti, fontlar, tema başlatma
├─ views/              Dilden bağımsız sayfa kompozisyonu (HomePage)
├─ pages/              Rotalar: yalnızca hangi dilin render edileceğine karar verir
├─ scripts/            Progressive enhancement (menü, scroll-spy, tema, sohbet, tahta)
└─ styles/             Tasarım token'ları + reset/temel stiller
```

Katmanlar arasındaki kurallar:

- **Veri tek yönde akar:** `content/*.yaml` → `lib/content.ts` (dil çözümlemesi ve sıralama) → `views/HomePage.astro` → bölümler. Bileşenler `astro:content` API'sini ya da `{ tr, en }` nesnelerini hiç görmez; hazır, tipli view model'ler alır.
- **Tek kaynak:** Bölüm id'leri `config/navigation.ts` içinde tanımlı. Menü linkleri ve bölümler aynı sabiti kullandığı için birbirinden kopamaz.
- **Görsel kararlar token'larda:** Renk, boşluk ve tipografi `styles/tokens.css` içinde. Koyu tema yalnızca token'ları yeniden tanımlıyor.
- **JavaScript olmadan da çalışır:** Tüm içerik sunucuda render ediliyor. Script'ler menü, tema, sohbet animasyonu ve vurgu gibi davranışları sonradan ekliyor. `prefers-reduced-motion` açıksa animasyonlar kapanıyor.

## Yeni bir proje eklemek

`src/content/projects.yaml` dosyasına aynı yapıda yeni bir öğe ekle. `display` alanı nasıl görüneceğini belirler:
`featured` (en üstte büyük vitrin), `card` (normal kart) ya da `mention` ("Ayrıca" satırında sadece adı).

Blokla'nın ekran görüntüleri hazır olunca `public/projects/blokla/` altına koyup `projects.yaml` içindeki
`screenshots` listesine ekle; vitrindeki çizim yerine otomatik olarak onlar gösterilir.

## Giriş bölümündeki tahta

Tahtanın yerleşimi `src/lib/board.ts` içinde ASCII olarak çizili. `a` harfi `journey.yaml` içindeki ilk durağa, `b` ikinciye karşılık geliyor; `*` "sıradaki parça". Yeni bir durak eklersen tahtaya da bir harf ekle.
