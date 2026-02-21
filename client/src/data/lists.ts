// Listeler.jpg'den alÄ±nan veriler

export interface Vardiya {
  id: string;
  ad: string;
  saat: string;
}

export interface MudahaleTuru {
  id: string;
  ad: string;
}

export interface Personel {
  sicilNo: string;
  ad: string;
  soyad: string;
  bolum: string;
  adSoyad: string;
  rol?: string;
}

export interface Makina {
  id: string;
  ad: string;
}

// Vardiyalar
export const vardiyalar: Vardiya[] = [
  { id: 'VARDIYA_1', ad: 'VARDIYA 1', saat: '00:30-08:30' },
  { id: 'VARDIYA_2', ad: 'VARDIYA 2', saat: '08:30-16:30' },
  { id: 'VARDIYA_3', ad: 'VARDIYA 3', saat: '16:30-00:30' }
];

// MÃ¼dahale TÃ¼rleri
export const mudahaleTurleri: MudahaleTuru[] = [
  { id: 'BAKIM', ad: 'BakÄ±m' },
  { id: 'ARIZA', ad: 'ArÄ±za' },
  { id: 'ONLEYICI_BAKIM', ad: 'Ã–nleyici BakÄ±m' },
  { id: 'PLANLI_BAKIM', ad: 'PlanlÄ± BakÄ±m' },
  { id: 'UYGUNSUZLUK_GIDERME', ad: 'UYGUNSUZLUK GÄ°DERME' },
  { id: 'DIGER', ad: 'DiÄŸer' }
];

// BÃ¶lÃ¼mler
export const bolumler = [
  'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM EK BINA',
  'MEKANIK BAKIM',
  'ISK ELEKTRIK BAKIM',
  'ISK MEKANIK BAKIM',
  'ISK YARDIMCI TESISLER',
  'YARDIMCI TESISLER'
];

// Personel Listesi (listeler.jpg'den)
export const personelListesi: Personel[] = [];

// Makina Listesi (listeler.jpg'den)
export const makinaListesi: Makina[] = [
  { id: '1', ad: '1. BORU MAKÄ°NASI' },
  { id: '2', ad: '2. BORU MAKÄ°NASI' },
  { id: '3', ad: '3. BORU MAKÄ°NASI' },
  { id: '4', ad: '4. BORU MAKÄ°NASI' },
  { id: '5', ad: '5. BORU MAKÄ°NASI' },
  { id: '6', ad: '6. BORU MAKÄ°NASI' },
  { id: '7', ad: '7. BORU MAKÄ°NASI' },
  { id: '8', ad: '8. BORU MAKÄ°NASI' },
  { id: '9', ad: '9. BORU MAKÄ°NASI' },
  { id: '10', ad: '10. BORU MAKÄ°NASI' },
  { id: '11', ad: '11. BORU MAKÄ°NASI' },
  { id: '12', ad: '12. BORU MAKÄ°NASI' },
  { id: '13', ad: '13. BORU MAKÄ°NASI' },
  { id: '14', ad: '14. BORU MAKÄ°NASI' },
  { id: '15', ad: '15. BORU MAKÄ°NASI' },
  { id: '16', ad: '16. BORU MAKÄ°NASI' },
  { id: '17', ad: '17. BORU MAKÄ°NASI' },
  { id: '18', ad: '18. BORU MAKÄ°NASI' },
  { id: '19', ad: '19. BORU MAKÄ°NASI' },
  { id: '20', ad: '20. BORU MAKÄ°NASI' },
  { id: '21', ad: '21. BORU MAKÄ°NASI' },
  { id: '22', ad: '22. BORU MAKÄ°NASI' },
  { id: '23', ad: '23. BORU MAKÄ°NASI' },
  { id: '1_DILME', ad: '1. DÄ°LME MAKÄ°NASI' },
  { id: '2_DILME', ad: '2. DÄ°LME MAKÄ°NASI' },
  { id: '3_DILME', ad: '3. DÄ°LME MAKÄ°NASI' },
  { id: '4_DILME', ad: '4. DÄ°LME MAKÄ°NASI' },
  { id: '5_DILME', ad: '5. DÄ°LME MAKÄ°NASI' },
  { id: '6_DILME', ad: '6. DÄ°LME MAKÄ°NASI' },
  { id: '7_DILME', ad: '7. DÄ°LME MAKÄ°NASI' },
  { id: '8_DILME', ad: '8. DÄ°LME MAKÄ°NASI' },
  { id: '9_DILME', ad: '9. DÄ°LME MAKÄ°NASI' },
  { id: '10_DILME', ad: '10. DÄ°LME MAKÄ°NASI' },
  { id: '11_DILME', ad: '11. DÄ°LME MAKÄ°NASI' },
  { id: 'OFFLINE_4_BOYAMA', ad: 'OFFLINE 4 BOYAMA' }
];

// Ä°ÅŸ Emri tipi
export interface IsEmri {
  id: string;
  tarih: string;
  vardiya: string;
  makina: string;
  mudahaleTuru: string;
  baslangicSaati: string;
  bitisSaati: string;
  sureDakika: number;
  aciklama: string;
  malzeme: string;
  personeller: {
    sicilNo: string;
    adSoyad: string;
    bolum: string;
  }[];
  analizAtamasi?: {
    planlananIsId?: string;
    backendWorkOrderId?: number;
    backendWorkOrderNo?: string;
    atananSicilNo: string;
    atananAdSoyad: string;
    atananBolum: string;
    atamaTarihi: string;
  };
  createdAt: string;
}

// ID oluÅŸturma fonksiyonu (YYYYMMDD-XXXX formatÄ±nda)
export function generateIsEmriId(tarih: string): string {
  const dateStr = tarih.replace(/-/g, '').slice(0, 8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${dateStr}-${random}`;
}

