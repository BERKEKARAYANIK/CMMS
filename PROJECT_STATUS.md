# PROJECT STATUS

Son guncelleme: 2026-02-21

## Amac
- ERW Bakim platformunu dusuk maliyetli, canli, guvenli ve surdurulebilir sekilde calistirmak.
- Hedef kullanim: yaklasik 200 erisim, anlik 30-50 aktif islem.

## Canli Ortam
- Domain: `erwbakimmerkezi.com`
- API saglik kontrolu: `https://erwbakimmerkezi.com/api/health`
- Sunucu: Hetzner VPS (Docker)
- Reverse proxy + TLS: Caddy
- Ana deploy dosyalari:
  - `deploy/docker-compose.prod.yml`
  - `deploy/Caddyfile`
  - `deploy/.env`

## Simdiki Durum
- Uygulama canlida ayakta ve HTTPS aktif.
- ISG modulu aktif:
  - Uygunsuzluklar, Capraz Denetim, Durum Kaynakli Kazalar, Ramak Kala, Ifade Gelmeyenler, Sari Kart Gelmeyenler
  - Bolum bazli oran tablolari ve siralama secenekleri aktif
  - Giderilmeyen listesi tarih + sira no (Excel sira no) ile sirali
  - Satir kopyalama aktif
- Dashboard ISG KPI panosu:
  - ISG Uygunsuzluk Yuzdesi -> ISG Uygunsuzluk bolum oranlarindan
  - ISG Capraz Denetim Yuzdesi -> ISG Capraz bolum oranlarindan
  - ISG Kaza Sayisi simdilik sabit (istenen sekilde dokunulmadi)
- Dashboard kartlarinda:
  - ISG sag ust skor etiketleri kaldirildi
  - Durus kartlarindaki sag ust dk/ay etiketi kaldirildi
- Ayarlar > Personel listesi:
  - Kaydetme aninda kullanici hesaplari otomatik senkronlanir (yeni personel hesabinin otomatik acilmasi, sifre atanmasi, aktiflestirme).

## Kritik Notlar
- PWA/cache nedeniyle mobilde eski gorunum kalabilir. Gerekirse uygulama kapat-ac veya cache temizle.
- Gizli bilgiler (sunucu sifreleri vb.) bu dosyalara yazilmamali.

## Kaldigimiz Yer
- Son odak: ISG ve Dashboard verilerinin ayni kaynaktan tutarli calismasi.
- Siradaki buyuk konu: is kazasi verisi geldikten sonra dashboard kaza kismi.

## Hizli Devam Checklist
- `cd "C:\Users\YAPAY_ZEKA\Desktop\CMMS FULL\cmms"`
- Son degisiklikleri kontrol et: `git status`
- Local calistirma:
  - Backend: `cd server && npm run dev`
  - Frontend: `cd client && npm run dev`
- Production deploy (gerektiginde):
  - `cd deploy`
  - `docker compose -f docker-compose.prod.yml --env-file .env up -d --build`
- Saglik kontrolu:
  - `https://erwbakimmerkezi.com/api/health`

## Dosya Haritasi
- Durum ozeti: `PROJECT_STATUS.md`
- Yapilan isler: `CHANGELOG.md`
- Siradaki isler: `NEXT_STEPS.md`
