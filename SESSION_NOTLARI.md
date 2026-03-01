# SESSION NOTLARI

Bu dosya, talep bazli kalici hafiza olarak kullanilir.
Her yeni islemde tarihli not dusulur ve canli durum kaydi tutulur.

## Not Yazim Kurali
- Format: `YYYY-MM-DD HH:mm | Konu | Durum | Etki`
- Kisa ve teknik yaz.
- Hangi sayfa/ozellik degistiyse belirt.
- Canliya aktarim yapildiysa `Canli: Evet/Hayir` olarak ekle.

## Son Durum Ozeti (2026-02-23)
- Durus analizi ve pareto akisinda ay bazli yukleme/gosterim iyilestirmeleri yapildi.
- Pareto tarafinda secili neden vurgusu ve altta kayit listesi davranisi eklendi.
- Durus dakikasi hesaplarinda ondalik kisim kesilerek dakika tam sayi kabul edildi.
- Tek kayit icin ust sinir 480 dakika kurali uygulandi.
- Dashboard KPI tarafinda durus verisi ile tutarlilik duzeltmeleri yapildi.
- Planli bakim/MTBF/MTTR formullerinde kullanilacak kaynaklar netlestirildi:
  - `MTBF = Toplam Calisma Suresi / Ariza Sayisi`
  - `MTTR = Toplam Ariza Onarim Suresi / Ariza Sayisi`
  - `PMP(%) = Planli Bakim Saatleri / (Planli + Plansiz Bakim Saatleri) * 100`
- Turkce karakter bozulmalarina karsi birden fazla duzeltme yapildi; yeni degisikliklerde kontrol edilmesi gerekiyor.

## Son Cozulen Sorunlar
- Durus analizi yukleme sirasinda `kaydedilemedi` hatasi:
  - Sunucu `express.json` ve `urlencoded` limitleri artirildi.
- Yuklenen Ocak verisinin sayfada gorunmemesi:
  - Ay secimi fallback ve veri eslestirme akisi duzeltildi.
- Is bitirme listesinde uzun metinlerin kirpilmasi:
  - Metin sarmalama ve kolon baslik duzeltmeleri uygulandi (`Mudahale Aciklamasi` alanlari).

## Acik Takip Basliklari
- PWA ana ekran davranisi ikon degisimi sonrasi tekrar kontrol edilmeli.
- Durus/Pareto ekranlarinda yeni Turkce metin eklenirse encoding kontrolu yapilmali.
- Ayarlar uzerinden eklenen gruplarin ilgili bolume ozel gorunurlugu her degisiklikte regression test edilmeli.

## Oturum Kayitlari
- 2026-02-23 05:20 | Kalici not talebi | Bu dosya olusturuldu ve takip kurali tanimlandi | Canli: Hayir
- 2026-03-01 22:07 | Deploy domain kaydi | `www.erwbakimmerkezi.com` deploy adresi README ve deploy dosyalarina eklendi, Caddy yonlendirmesi root -> www olacak sekilde guncellendi | Canli: Evet
