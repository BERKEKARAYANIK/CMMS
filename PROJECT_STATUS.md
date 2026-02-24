# PROJECT STATUS

Son guncelleme: 2026-02-24

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
- Planlanan Isler akisinda guncellemeler canlida:
  - Liste kolonlari `Mudahale Aciklamasi` ve `Planlayan` ile netlestirildi.
  - Uzun aciklama metinleri kirpilmadan alt satira sarilir hale getirildi.
  - Yeni plan kaydinda planlayan (ad-soyad + sicil) giris yapan kullanicidan otomatik yazilir.
- Is Girisi akisinda guncelleme:
  - Planli isler otomatik on-yukleme davranisi kaldirildi.
  - Form sadece `Is Girisine Aktar` akisi ile planli kayittan doldurulur.
- Canli deploy durumu:
  - 2026-02-23 tarihinde Hetzner ortaminda server+client rebuild tamamlandi.
  - Ayni gun aktarim davranisi hotfix'i icin client container tek basina rebuild edildi.
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
- 2026-02-24 ISG ve Is Girisi entegrasyonu canlida:
  - Ayarlar > ISG Veri yuklemelerinde `uygunsuzluk2025`, `uygunsuzluk2026` ve `caprazDenetim` dosyalari panel hesaplarina baglandi.
  - ISG ekraninda `Satiri Kopyala` yanina `Uygunsuzluk Kapat` eklendi (uygunsuzluk + capraz denetim).
  - Uygunsuzluk Kapat ile Is Girisi ekranina aktarimda:
    - Mudahale aciklamasi satir icerigiyle otomatik dolar.
    - Mudahale turu rapora gore otomatik secilir.
    - Personel sec alaninda giris yapan kullanici otomatik secili gelir.
  - Is Girisi kaydindan sonra secilen uygunsuzluk/giderilmeyen kayit listeden otomatik duser.
  - ISG liste ve grafikler yuklenen dosyadan hesaplanir ve kapanan kayitlar hesaplara dahil edilerek anlik guncellenir.
  - Kapanis eslesmesi sertlestirildi (V2 id + legacy uyumu) ve bolumler arasi yanlis dusum riski giderildi.
  - Talep uzerine tabloya eklenen `Is Girisi Kapanan` kolonu geri kaldirildi (yalnizca hesaplar guncel tutuluyor).

## Kritik Notlar
- PWA/cache nedeniyle mobilde eski gorunum kalabilir. Gerekirse uygulama kapat-ac veya cache temizle.
- Gizli bilgiler (sunucu sifreleri vb.) bu dosyalara yazilmamali.

## Kaldigimiz Yer
- Son odak: ISG yukleme verilerinin canli panel hesaplari ve Is Girisi kapanis akisiyla birebir tutarli calismasi.
- Siradaki buyuk konu: is kazasi verisi geldikten sonra dashboard kaza kisminin dinamik veriyle tamamlanmasi.

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
- Kalici oturum notlari: `SESSION_NOTLARI.md`
