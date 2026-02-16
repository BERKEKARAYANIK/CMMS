# CMMS - Hizli Baslangic ve Devam Notlari

Olusturma tarihi: 16.02.2026
Son guncelleme commit'i: `42955c0`
Repo: `https://github.com/BERKEKARAYANIK/CMMS`
Ana klasor: `C:\Users\YAPAY_ZEKA\Desktop\CMMS FULL\cmms`

## 0) Son Guncelleme Ozeti (Yeni PC Otomasyonu)

Bu guncellemede tek tik kurulum yapisi eklendi.

Yeni dosyalar:
- `CMMS_ILK_KURULUM_VE_BASLAT.bat`
- `scripts/bootstrap-new-pc.ps1`
- `scripts/install-services.ps1`
- `scripts/uninstall-services.ps1`
- `scripts/start-server-service.ps1`
- `scripts/start-client-service.ps1`

Ne cozuldu:
- Yeni PC'ye proje kopyalandiginda manuel kurulum ihtiyaci ciddi oranda azaltildi.
- IP tespiti ve `CLIENT_ORIGIN` otomatik yaziliyor.
- Servisler otomatik kurulup calistiriliyor (`CMMS-Server`, `CMMS-Client`).
- Admin yetkisi varsa firewall/acik port ayarlari otomatik yapiliyor.
- Kurulum sonunda kullanilacak URL'ler ekrana otomatik yaziliyor.

Bu dosyanin amaci:
- Projenin mevcut durumunu tek yerde toplamak
- Bilgisayar kapatildiktan sonra hizli sekilde kaldigin yerden devam etmek
- Yeni acilan bir Codex oturumunda dogrudan bu dosya okunarak ilerlemek

## 1) Mevcut Mimari ve Genel Durum

Sistem 2 parca:
- `client` (React + Vite + PWA)
- `server` (Node + Express + Prisma + SQLite)

Veritabani:
- Prisma SQLite kullaniliyor
- Aktif DB yolu `.env` ile:
  - `DATABASE_URL="file:./cmms_local.db"`
- Fiziksel dosya:
  - `server/prisma/cmms_local.db`

## 2) Son Donemde Yapilan Kritik Isler

### 2.1 Merkezi veri yapisi
Eskiden localStorage ile tutulan bircok modulu merkezi API/DB yapisina tasidik.
Bu sayede:
- Ayni veriyi farkli cihazlar gorur
- Yerel tarayiciya bagimli kalinmaz
- Mobil + web birlikte daha saglikli calisir

### 2.2 Is Girisi / Planlanan / Tamamlanan akisi
Uygulanan is kurallari:
- Is girisinde ayni is ayni ID mantigi korunur
- Personel bazli satirlar ayri gorunur (arama/personel takibi icin)
- Planlanan isler, Is Girisi akisina yonlenir
- Tamamlanan isler Is Emri Takibi'ne geri atilmaz (devre disi)

### 2.3 Yetki kurallari (Berke)
Berke kullanicisi icin ozel yetki setleri eklendi:
- Silme ve edit belirli ekranlarda sadece Berke icin aktif
- Bu islem ikonlari yetkisi olmayan kullanicida gorunmez

Temel kontrol dosyalari:
- `server/src/middleware/auth.ts`
- `server/src/routes/jobEntries.ts`
- `server/src/routes/workOrders.ts`

### 2.4 Isimlendirme ve menu duzenleri
Uygulanan ad degisiklikleri:
- "Yeni Is Emri" -> "Is Girisi"
- "Dc Motor Bakim Modulu" -> "Dc Motor Bakim Is Girisi"
- Dc Motor Bakim Is Girisi, Is Girisi altina menu sirasi olarak alindi

### 2.5 Gorsel sadeleştirme
Form ekranlarinda istenen alanlar beyaz zemine cekildi
(sari arka planlar temizlendi).

### 2.6 PWA + mobil erisim
PWA aktif:
- Mobil cihazda "Ana ekrana ekle" ile app benzeri kullanim
- Web + mobil birlikte hedeflendi

### 2.7 HTTPS deployment altyapisi
Eklendi:
- `deploy/docker-compose.prod.yml`
- `deploy/Caddyfile`
- `deploy/.env.example`
- `client/Dockerfile`
- `server/Dockerfile`

## 3) Yeni Eklenen Otomatik Yedekleme Sistemi

Bu ozellik commit: `569047b`

### 3.1 Istek ve cozum
Istek:
- Yedek otomatik olsun
- Tamamlanan isler ayrica Excel olsun
- Ayarlardan yedek hedef klasoru secilebilsin

Uygulanan cozum:
- Server tarafinda scheduler + manuel tetikleme
- DB snapshot + `tamamlanan_isler_*.xlsx` dosyasi
- Ayarlar ekraninda yedek paneli

### 3.2 Teknik dosyalar
Backend:
- `server/src/services/backupService.ts`
- `server/src/routes/backups.ts`
- `server/src/index.ts` (route + scheduler init)
- `server/package.json` (`xlsx` bagimliligi)

Frontend:
- `client/src/types/backups.ts`
- `client/src/services/api.ts` (`backupsApi`)
- `client/src/pages/Ayarlar.tsx` (Otomatik Yedekleme karti)

### 3.3 API endpointleri
- `GET /api/backups/settings`
  - Ayarlar + son durum bilgisi
- `PUT /api/backups/settings`
  - Yedekleme ayarlarini kaydeder
- `POST /api/backups/run`
  - Manuel yedek baslatir

Not:
- Bu endpointler sistem yoneticisi/Berke yetkisi ister

### 3.4 Ayarlar ekrani (kullanici tarafi)
`Ayarlar` sayfasina eklendi:
- Otomatik yedek ac/kapat
- Yedek klasoru (`backupDir`)
- Periyot (dakika)
- Icerik secenekleri:
  - Veritabani yedegi
  - Tamamlanan isleri ayri Excel yedekle
- "Simdi Yedek Al" butonu
- Son durum paneli:
  - Son calisma
  - Son basarili calisma
  - Sonraki calisma
  - Son hata
  - Son uretilen dosyalar

### 3.5 Varsayilanlar
Backup varsayilanlari (server tarafi):
- `enabled: true`
- `intervalMinutes: 120`
- `backupDir: server/backups`
- `includeDatabase: true`
- `includeCompletedExcel: true`

Not:
- Aralik alt/ust siniri var: `5` - `1440` dakika
- `server/backups/` git'e girmemesi icin `.gitignore` eklendi

### 3.6 Uretilen dosyalar
Yedekleme calistiginda olusan dosya adlari:
- `cmms_database_YYYYMMDD_HHMMSS.db`
- `tamamlanan_isler_YYYYMMDD_HHMMSS.xlsx`

## 4) Lokal Calistirma (Gelistirme)

### 4.1 Server
Klasor:
- `C:\Users\YAPAY_ZEKA\Desktop\CMMS FULL\cmms\server`

Komutlar:
- `npm install`
- `npm run db:push`
- `npm run dev`

### 4.2 Client
Klasor:
- `C:\Users\YAPAY_ZEKA\Desktop\CMMS FULL\cmms\client`

Komutlar:
- `npm install`
- `npm run dev -- --host 0.0.0.0 --port 5174`

Server zaten `0.0.0.0` bind ediyor:
- `server/src/index.ts`

### 4.3 Erisim
Yerel:
- Frontend: `http://localhost:5174`
- Backend health: `http://localhost:4001/api/health`

LAN:
- Frontend: `http://<PC_IP>:5174`
- Backend health: `http://<PC_IP>:4001/api/health`

`<PC_IP>` bulmak icin:
- `ipconfig`

## 5) CORS ve .env Notlari

Aktif `server/.env` ornegi:
- `CLIENT_ORIGIN="http://192.168.1.109:5174"`

Eger IP degisirse:
1. `CLIENT_ORIGIN` degeri yeni IP ile guncellenmeli
2. Server yeniden baslatilmali

## 6) Yedek Geri Yukleme (Restore) Proseduru

Onemli: Restore oncesi server kapat.

Adimlar:
1. Son yedek dosyasini sec:
   - `cmms_database_*.db`
2. `server/prisma/cmms_local.db` dosyasinin yedegini ayri yere al
3. Yedek DB dosyasini `cmms_local.db` adiyla yerine kopyala
4. Eger `-wal` ve `-shm` dosyalari varsa birlikte geri yukle
5. Server'i tekrar baslat
6. `http://localhost:4001/api/health` kontrol et

Excel yedek dosyasi (`tamamlanan_isler_*.xlsx`) rapor/arsiv amaclidir;
veritabani geri yukleme adimina direkt yerine gecmez.

## 7) Git ve Surum Durumu

Remote:
- `origin -> https://github.com/BERKEKARAYANIK/CMMS.git`

Son commitler:
- `42955c0 feat: add one-click new PC bootstrap and service automation`
- `569047b feat: add automated backups with completed jobs excel export`
- `b6650a2 feat: centralize remaining module state and add https deploy stack`
- `1ae6f2e feat: move job entry flow to API and enable PWA`

## 8) Yeni Oturumda Hemen Baslamak Icin Kontrol Listesi

Her yeni gun/oturum:
1. Proje klasorune gir:
   - `C:\Users\YAPAY_ZEKA\Desktop\CMMS FULL\cmms`
2. Bu dosyayi oku:
   - `HIZLI_BASLANGIC_CMMS.md`
3. Git durumunu kontrol et:
   - `git status`
4. Son kodu al:
   - `git pull origin main`
5. Server ve client baslat
6. Health check:
   - `/api/health`
7. Ayarlar > Otomatik Yedekleme panelini kontrol et

## 9) Codex Icin Kisa Operasyon Notu

Yeni bir Codex oturumunda ilk mesaj olarak su komut verilebilir:

`Lutfen once HIZLI_BASLANGIC_CMMS.md dosyasini oku, mevcut durumu ozetle ve kaldigimiz yerden devam etmek icin sonraki 3 teknik adimi oner.`

Bu sayede once baglam alinip sonra aksiyon plani cikartilir.

## 10) Bilinen Notlar / Teknik Borc

- Client build sirasinda buyuk bundle uyarisi var (calismaya engel degil)
- `JWT_SECRET` production ortaminda guclu bir degerle degistirilmeli
- Yedek klasoru yolunun yazma izni olan bir dizin olmasi gerekir

## 11) Kalici Servis Kurulumu (Windows Task Scheduler)

Neden:
- `npm run dev` elle acildiginda terminal kapaninca servis de kapanir.
- Bu nedenle kalici calisma icin Windows Gorev Zamanlayici kuruldu.

Olusturulan scriptler:
- `scripts/start-server-service.ps1`
- `scripts/start-client-service.ps1`
- `scripts/install-services.ps1`
- `scripts/uninstall-services.ps1`

Kurulum komutu:
- `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-services.ps1`

Olusan gorev adlari:
- `CMMS-Server`
- `CMMS-Client`

Davranis:
- Kullanici oturumu acildiginda otomatik baslar
- Surec duserse task ayarlari ile yeniden deneme yapar
- Scriptler icinde sonsuz dongu ile process yeniden acilir

Durum kontrol:
- `Get-ScheduledTask -TaskName CMMS-* | Select-Object TaskName,State`
- Port kontrol:
  - `netstat -ano | findstr :4001`
  - `netstat -ano | findstr :5174`

Elle baslat:
- `Start-ScheduledTask -TaskName CMMS-Server`
- `Start-ScheduledTask -TaskName CMMS-Client`

Elle durdur:
- `Stop-ScheduledTask -TaskName CMMS-Server`
- `Stop-ScheduledTask -TaskName CMMS-Client`

Tam kaldir:
- `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\uninstall-services.ps1`

Log dosyalari:
- `service-logs/server-service.log`
- `service-logs/client-service.log`

## 12) Baska PC'de Tek Tik Kurulum

Dosya:
- `CMMS_ILK_KURULUM_VE_BASLAT.bat`

Kullanim:
1. Proje klasorunu yeni PC'ye kopyala
2. `CMMS_ILK_KURULUM_VE_BASLAT.bat` dosyasina sag tik -> `Yonetici olarak calistir`
3. Script bitince ekranda URL'ler otomatik yazar

Scriptin otomatik yaptiklari:
- Yerel IP tespiti
- `server/.env` olusturma/guncelleme
  - `DATABASE_URL`
  - `JWT_SECRET` (yoksa random uretilir)
  - `PORT`
  - `NODE_ENV`
  - `CLIENT_ORIGIN` (`http://<IP>:5174`)
- `npm install` (server + client)
- `prisma db push --skip-generate`
- Firewall kurallari (`4001`, `5174`) - admin yetkisi varsa
- Ag profili Public ise Private'a cekme - admin yetkisi varsa
- Task Scheduler servis kurulum/baslatma
  - `CMMS-Server`
  - `CMMS-Client`

Ilgili script:
- `scripts/bootstrap-new-pc.ps1`

---
Bu dosya bilerek ayrintili tutuldu. Hedef, proje gecmisini tek dosyada toplamak ve devam hizini arttirmaktir.
