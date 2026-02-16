# CMMS

## Gelistirme Ortami

1. `server` klasorunde:
   - `.env` olustur (`DATABASE_URL`, `JWT_SECRET`, `PORT`)
   - `npm install`
   - `npm run db:push`
   - `npm run dev`
2. `client` klasorunde:
   - `npm install`
   - `npm run dev`
3. Uygulama:
   - Frontend: `http://localhost:5174`
   - Backend: `http://localhost:4001`

## Merkezi Veri Durumu

Asagidaki moduller artik localStorage yerine merkezi API/DB uzerinden calisir:

- Is Girisi
- Planlanan Isler
- Tamamlanan Isler
- Tekrarlayan Ariza Analizi
- Gunluk Performans Genel Bakis
- Personel performans birlestirmesi
- Ayarlar (vardiya/mudahale/personel/makina listeleri)
- Bakim Takip Merkezi
- Dc Motor Bakim Is Girisi

## Production HTTPS (Web + Mobil PWA)

Bu repo icinde Caddy tabanli HTTPS deployment dosyalari vardir:

- `deploy/docker-compose.prod.yml`
- `deploy/Caddyfile`
- `deploy/.env.example`
- `client/Dockerfile`
- `server/Dockerfile`

### Kurulum

1. Sunucuda DNS kaydini ayarla:
   - `CMMS_DOMAIN` -> sunucu public IP
2. `deploy/.env.example` dosyasini `.env` olarak kopyala ve doldur:
   - `CMMS_DOMAIN`
   - `JWT_SECRET`
3. Deployment:
   - `cd deploy`
   - `docker compose -f docker-compose.prod.yml --env-file .env up -d --build`
4. Caddy otomatik TLS alir, uygulama HTTPS uzerinden acilir.

### Not

PWA kurulumundan sonra mobil cihazda tarayici menusu ile `Ana ekrana ekle` kullanilabilir.

## Windows Kalici Servis (LAN icin)

Elle acilan `npm run dev` surecleri kapanmasin diye gorev tabanli servis scriptleri eklendi.

- Yeni PC tek tik kurulum ve baslatma:
  - `CMMS_ILK_KURULUM_VE_BASLAT.bat` dosyasini yonetici olarak calistir
  - Script otomatik olarak:
    - IP adresini tespit eder
    - `server/.env` dosyasini gunceller (`CLIENT_ORIGIN` dahil)
    - NPM paketlerini kurar
    - Prisma `db push` calistirir
    - Windows firewall kurallarini ekler (admin ise)
    - Servis gorevlerini kurar/baslatir
    - Erişim URL'lerini ekrana yazar

- Kurulum:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-services.ps1`
- Kaldirma:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\uninstall-services.ps1`
- Loglar:
  - `service-logs/server-service.log`
  - `service-logs/client-service.log`
