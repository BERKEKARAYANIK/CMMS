# CHANGELOG

Bu dosya canli sistemde yapilan degisikliklerin kisa kaydidir.

## 2026-02-24
- ISG veri yukleme ve panel hesaplama akisi guncellendi:
  - `Ayarlar > ISG Veri` altindaki `uygunsuzluk2025`, `uygunsuzluk2026`, `caprazDenetim` yuklemeleri ISG panelinde dogrudan hesaplamaya baglandi.
  - Uygunsuzluk/capraz denetim giderilmeyen listeleri, bolum oranlari ve KPI kartlari yuklenen dosya + kapanan kayitlar ile birlikte yeniden hesaplanir hale getirildi.
- ISG -> Is Girisi kapatma akisi eklendi:
  - `Satiri Kopyala` yanina `Uygunsuzluk Kapat` butonu eklendi (uygunsuzluk + capraz denetim).
  - Buton ile Is Girisi ekranina aktarimda mudahale aciklamasi otomatik doldurulur.
  - Mudahale turu otomatik secim:
    - Capraz denetim icin `Capraz Denetim Uygunsuzluk Giderme`
    - Uygunsuzluk icin `Uygunsuzluk Giderme`
  - Personel sec alaninda giris yapan kullanici varsayilan secili gelir.
  - Is Girisi kaydinda secilen kayit otomatik kapanir ve listeden duser.
- Kapanis eslesmesi guvenligi artirildi:
  - Kapanan satir id olusumu V2 formata tasindi.
  - Legacy id uyumu korunarak eski kapanan kayitlarin da dogru sayilmasi saglandi.
  - Bolumler arasi yanlis kayit dusumu (or. E.BAKIM-2 kapatip Kalite Kontrol dusmesi) engellendi.
- UI duzeltmesi:
  - Talep uzerine `Is Girisi Kapanan` kolonu/rozeti kaldirildi; sadece hesaplar guncel tutuldu.
- Canli deploy:
  - Client birden fazla hotfix rebuild ile yeniden yayinlandi.
  - Saglik kontrolu: `https://erwbakimmerkezi.com/api/health` -> `OK`.

## 2026-02-23
- Planlanan Isler listesi guncellendi:
  - `Mudahale Aciklamasi` alani kirpilmadan alt satira sarilir hale getirildi.
  - `Planlayan` kolonu eklendi.
- Planlanan is kaydinda `planlayan` bilgisi (ad-soyad + sicil) giris yapan kullanicidan otomatik yazilir hale getirildi.
- Is Girisi ekraninda planli is otomatik on-doldurma kaldirildi:
  - Form yalnizca `Is Girisine Aktar` akisi ile planli kayittan doldurulur.
- Canli deploy Hetzner uzerinde tamamlandi:
  - Server + client rebuild alindi.
  - Aktarim davranisi hotfix'i sonrasinda client container yeniden build edildi.
  - Saglik kontrolu: `https://erwbakimmerkezi.com/api/health` -> `OK`.

## 2026-02-21
- Production yayin ortami Hetzner + Docker + Caddy uzerinde dogrulandi.
- Domain ve HTTPS akisinda gerekli duzeltmeler yapildi.
- Personel listeleri tek kaynak olarak Ayarlar > Personel listesine baglandi.
- Is girisi ve uzayan durus is emri acma ekranlarinda personel secimleri kaynak listeye esitlendi.
- Listeleme/siralama duzenleri isim bazli ve tutarli hale getirildi.
- Rol/izin duzeni guncellendi: sistem yoneticisi ve Berke Karayanik herkese is emri acabilir.
- Uygulama adi "ERW Bakim Kontrol Merkezi" olarak guncellendi.
- Dashboard icin 0S-5S seviye renk kurallari uygulandi.
- ISG ekraninda gereksiz satir/kutu alanlari temizlendi, secimli rapor yapisi korundu.
- Uygunsuzluklar:
  - Excel Sira No kullanimi netlestirildi.
  - Giderilmeyen kayitlar tarih + sira no ile siralanir hale getirildi.
  - Satir kopyalama (paylasim kolayligi) akisi duzeltildi.
- Capraz denetim tarafina uygunsuzluk kurallari/formati esitlendi.
- Dashboard ISG KPI panosu verileri ilgili ISG bolumlerinden referans alacak sekilde esitlendi.
- Dashboard sag ust skor etiketleri ve durus kartlarindaki sag ust dk/ay etiketi kaldirildi.
- Ayarlar > Personel listesi kaydinda otomatik kullanici senkronu eklendi:
  - Yeni personel eklenince hesap otomatik olusur.
  - Hesabi olup sifresi bos olanlarda varsayilan sifre otomatik atanir.
  - Kullanici aktif degilse aktiflenir.
- Giris adi normalizasyonu duzeltildi:
  - Turkce karakterli ad/soyad icin birlesik ve ASCII giris desteklenir (ornek: `VEDAT BICEN` -> `vedatbicen`).

## Not
- Ayrintili teknik degisiklik icin `git log --oneline` ve ilgili commit difflerine bak.
