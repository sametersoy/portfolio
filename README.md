# sametersoy.com

İnteraktif 3D veri merkezi portföyü — **Samet Ersoy · IT Manager**.
Tüm site, tıklanabilir gerçekçi tek bir **rack cabinet** etrafında kurgulanmıştır.

## Teknolojiler
- **React + Vite** (tek sayfa)
- **Three.js** · `@react-three/fiber` · `@react-three/drei` · `@react-three/postprocessing`
- **i18next** — tarayıcı diline göre otomatik **TR / EN** (URL'de `?lang=tr` / `?lang=en` ile zorlanabilir)
- Saat her zaman **İstanbul (UTC+3)** gösterir
- SEO: meta/OG/Twitter etiketleri, JSON-LD (Person/ProfilePage), `sitemap.xml`, `robots.txt`, hreflang

## Komutlar (yarn)
```bash
yarn install     # bağımlılıklar
yarn dev         # geliştirme sunucusu (http://localhost:5173)
yarn build       # üretim derlemesi -> dist/
yarn preview     # derlemeyi yerelde önizle
```
> Not: 5173 portu doluysa Vite otomatik olarak bir sonraki boş portu seçer.

## Mimari
| Yol | İşlev |
|-----|-------|
| `src/three/Scene.jsx` | Canvas, ışıklandırma, environment, kamera rig, bloom postprocessing |
| `src/three/RackCabinet.jsx` | Kabin iskeleti + cihaz/panel yerleşimi |
| `src/three/RackUnit.jsx` | Tıklanabilir/hover olabilen rack cihazı |
| `src/three/faces.jsx` | Gerçekçi ön panel detayları (sunucu, switch, blade, storage, firewall, PDU/PSU…) |
| `src/three/rackLayout.js` | U bazlı dikey yerleşim hesabı |
| `src/data/rack.js` | Yetenek kategorileri (kabindeki cihazlar) |
| `src/data/timeline.js` | Kariyer zaman çizelgesi |
| `src/locales/{tr,en}.json` | Çeviriler |

## Düzenleme ipuçları
- **Yetenek eklemek:** `src/data/rack.js` içindeki ilgili `items` dizisine ekle; metinler `src/locales/*.json` → `units.<id>`.
- **Zaman çizelgesi:** `src/data/timeline.js` + `locales/*.json` → `timeline.<id>`.
- **E-posta:** `src/components/ContactModal.jsx` (`sametersoy@yandex.com`).

## Dağıtım
`yarn build` ile üretilen `dist/` klasörü statik olarak herhangi bir host'a (Vercel, Netlify, Nginx, GitHub Pages) yüklenebilir.
