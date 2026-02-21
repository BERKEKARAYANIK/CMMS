# CHANGELOG

Bu dosya canli sistemde yapilan degisikliklerin kisa kaydidir.

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
