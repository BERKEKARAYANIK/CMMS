# CMMS Offline Paketleri

Bu klasor internet gerektirmeyen kurulum icin kullanilir.

## Gerekli dosyalar

- `node-runtime.zip`
- `server-node_modules.zip`
- `client-node_modules.zip`

## Bu dosyalari olusturma

Proje klasorunde:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\prepare-offline-bundle.ps1
```

## Yeni PC kurulumu

`CMMS_ILK_KURULUM_VE_BASLAT.bat` calistirildiginda script bu klasordeki zip dosyalarini otomatik kullanir.

Not:
- `runtime/nodejs/` klasoru ilk kurulumda otomatik cikarilir.
- Bu klasorde zip dosyalari yoksa ve sistemde Node.js yoksa kurulum durur.
