# NEXT STEPS

Bu dosya bir sonraki calisma oturumunda hizli devam icin oncelik listesidir.

## P1 - Islevsel
- [ ] ISG > Is Kazasi verisi geldikten sonra dashboard kaza KPI baglantisini tamamla.
- [ ] Uygunsuzluklar ve capraz denetim icin filtre/siralama kombinasyonlarini tekrar test et.
- [ ] Personel kaynak esitlemesinde tum modulleri bir kez daha kontrol et (is girisi, uzayan durus, gorevlendirme alanlari).

## P2 - Guvenlik ve Sureklilik
- [ ] SSL sertifika yenileme durumunu dogrula (Caddy log kontrolu).
- [ ] `deploy/.env` yedek ve gizli bilgi yonetimini netlestir.
- [ ] Veritabani yedekleme periyodu belirle (gunluk/haftalik) ve geri donus testi yap.

## P3 - Operasyon
- [ ] Mobilde PWA cache nedeniyle gorunen eski ekranlar icin kisa kullanici rehberi hazirla.
- [ ] Sik kullanilan ayarlar ve ISG rapor akislarina 1 sayfalik operator kilavuzu ekle.
- [ ] Performans olcumu: 30-50 anlik aktif kullanici icin basit yuk testi senaryosu calistir.

## Oturum Acilis Rutini
1. `PROJECT_STATUS.md` oku.
2. `NEXT_STEPS.md` icinden bir P1 maddesini sec.
3. Degisiklikten sonra `CHANGELOG.md` ve `PROJECT_STATUS.md` guncelle.
