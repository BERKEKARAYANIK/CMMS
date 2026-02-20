# CMMS - Hizli Baslangic ve Kaldigin Yerden Devam Notu

Olusturma tarihi: 16.02.2026
Son guncelleme tarihi: 19.02.2026
Son referans commit (origin/main): `e9e770a`
Repo: `https://github.com/BERKEKARAYANIK/CMMS`
Ana klasor: `C:\Users\YAPAY_ZEKA\Desktop\CMMS FULL\cmms`

## 0) Bu Turda Yapilanlar (Ozet)

Bu not dosyasi, sonraki oturumda nerede kalindigini aninda anlamak icin guncellendi.

Son surecte tamamlanan ana degisiklikler:
- Dashboard KPI alani yeniden duzenlendi.
- Elektrik ikiye ayrildi:
  - `Elektrik Bakim Ana Bina`
  - `Elektrik Bakim Ek Bina`
- `Durus KPI Pano` ay bazli secilebilir hale getirildi.
  - `type="month"` secici eklendi
  - varsayilan deger PC'nin mevcut ayi
- Duruş KPI oran adlari guncellendi:
  - `Plansiz Bakim Orani`
  - `Planli Bakim Orani`
- Oran gosterimleri:
  - plansiz ve planli degerler virgulden sonra 2 hane
  - plansiz bar olcegi 10 tabanli
  - planli bar olcegi 100 tabanli
- Dashboard ustteki eski kartlar (`Toplam Ekipman`, `Personel`, `Bugunku Is Emirleri`, `Periyodik Bakim`) kaldirildi ve 5S paneli on plana alindi.
- ISG paneli geri alindi ve 5S paneli ile birlikte korundu.

Kurulum/otomasyon tarafi:
- Internetsiz kurulum akisi eklendi.
- Yeni script eklendi:
  - `scripts/prepare-offline-bundle.ps1`
- `bootstrap-new-pc.ps1` offline runtime ve offline package kurulumu destekleyecek sekilde yenilendi.
- Servis kurulum mantigi PC acilisina cekildi:
  - Task Scheduler trigger: `AtStartup`
  - principal: `SYSTEM`
- Server/client servis scriptleri lokal runtime (`runtime/nodejs`) ile `npm` cozecek sekilde guncellendi.

Git tarafi:
- Commit author/committer kimligi `BERKEKARAYANIK` olarak duzeltildi.
- Gecmis rewrite edildi ve push `--force-with-lease` ile gonderildi.
- Eski Turkce commit mesajlari gerekli noktalarda Ingilizceye cevrildi.

## 1) Su Anki Yerel Durum (Onemli)

Bu dosya guncellenirken repoda commitlenmemis degisiklikler vardir.
Bu normaldir; bunlar offline kurulum calismalaridir.

Mevcut calisma dosyalari:
- `.gitignore`
- `README.md`
- `scripts/bootstrap-new-pc.ps1`
- `scripts/install-services.ps1`
- `scripts/start-client-service.ps1`
- `scripts/start-server-service.ps1`
- `scripts/prepare-offline-bundle.ps1` (yeni)
- `offline/` (yeni)
- `runtime/` (yeni)

Not:
- `offline/*.zip` ve `runtime/nodejs/` `.gitignore` icinde.
- Offline zip dosyalari repoya gitmez; yeni PC'ye klasorla birlikte fiziksel kopyalanmali.

## 2) Dashboard Durumu (Mevcut Beklenen Davranis)

Dashboard bolumleri:
- `5S Calismasi` paneli
- `ISG KPI Pano` paneli
- `Durus KPI Pano` paneli

Departmanlar:
- Elektrik Bakim Ana Bina
- Elektrik Bakim Ek Bina
- Mekanik
- Yardimci Tesisler

Durus KPI detaylari:
- Ay secimi var (`type="month"`)
- Varsayilan ay: cihazin o anki ayi
- Plansiz bar: 10 tabanli olcek
- Planli bar: 100 tabanli olcek
- Yuzde degerler: 2 ondalik

## 3) Internetsiz Ilk Kurulum (Yeni PC)

### 3.1 Offline paket hazirlama (gelistirme PC)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\prepare-offline-bundle.ps1
```

Uretilen dosyalar:
- `offline/node-runtime.zip`
- `offline/server-node_modules.zip`
- `offline/client-node_modules.zip`

### 3.2 Yeni PC tek tik kurulum

1. Proje klasorunu yeni PC'ye kopyala.
2. `offline/` altindaki zip dosyalarinin geldigini kontrol et.
3. `CMMS_ILK_KURULUM_VE_BASLAT.bat` dosyasini yonetici olarak calistir.

Scriptin yaptiklari:
- Node runtime'i offline zipten acma
- server/client node_modules offline zipten acma
- `server/.env` ayarlama
- `prisma db push --skip-generate`
- firewall + network profile adimlari (admin ise)
- servis kurulum/baslatma

## 4) Kalici Servisler (Windows)

Gorev adlari:
- `CMMS-Server`
- `CMMS-Client`

Tetikleyici:
- `AtStartup` (PC acilisinda otomatik)

Principal:
- `SYSTEM` (yuksek yetki)

Log dosyalari:
- `service-logs/server-service.log`
- `service-logs/client-service.log`

Kontrol komutlari:
```powershell
Get-ScheduledTask -TaskName CMMS-* | Select-Object TaskName,State,LastRunTime
netstat -ano | findstr :4001
netstat -ano | findstr :5174
```

## 5) Git Kimligi ve Geçmis Rewrite Notu

Aktif git kimligi:
- `user.name = BERKEKARAYANIK`
- `user.email = 132139456+BERKEKARAYANIK@users.noreply.github.com`

Onemli:
- Gecmis rewrite yapildigi icin diger bilgisayarlarda eski branch'i direkt pull etmek yerine yeniden hizalama gerekir:
  - `git fetch origin`
  - `git reset --hard origin/main`
  - veya temiz re-clone

Guvenlik yedek branchleri:
- `backup/pre-author-rewrite-20260219`
- `backup/pre-message-rewrite-20260219`

## 6) Sonraki Oturumda Hemen Devam

1. Bu dosyayi oku: `HIZLI_BASLANGIC_CMMS.md`
2. Durumu kontrol et:
   - `git status`
   - `git log --oneline -n 10`
3. Offline paketlerin varligini kontrol et:
   - `offline/node-runtime.zip`
   - `offline/server-node_modules.zip`
   - `offline/client-node_modules.zip`
4. Gerekirse kurulum testi:
   - `CMMS_ILK_KURULUM_VE_BASLAT.bat`
5. Dashboard davranisini kontrol et:
   - ay secici default mevcut ay mi
   - plansiz/planli oran formatlari dogru mu

---
Bu dosyanin amaci: sonraki oturumda 2-3 dakika icinde baglam kazanip dogru yerden devam etmek.
