// Listeler.jpg'den alınan veriler

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

// Müdahale Türleri
export const mudahaleTurleri: MudahaleTuru[] = [
  { id: 'BAKIM', ad: 'Bakım' },
  { id: 'ARIZA', ad: 'Arıza' },
  { id: 'ONLEYICI_BAKIM', ad: 'Önleyici Bakım' },
  { id: 'PLANLI_BAKIM', ad: 'Planlı Bakım' },
  { id: 'UYGUNSUZLUK_GIDERME', ad: 'UYGUNSUZLUK GİDERME' },
  { id: 'DIGER', ad: 'Diğer' }
];

// Bölümler
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
  { id: '1', ad: '1. BORU MAKİNASI' },
  { id: '2', ad: '2. BORU MAKİNASI' },
  { id: '3', ad: '3. BORU MAKİNASI' },
  { id: '4', ad: '4. BORU MAKİNASI' },
  { id: '5', ad: '5. BORU MAKİNASI' },
  { id: '6', ad: '6. BORU MAKİNASI' },
  { id: '7', ad: '7. BORU MAKİNASI' },
  { id: '8', ad: '8. BORU MAKİNASI' },
  { id: '9', ad: '9. BORU MAKİNASI' },
  { id: '10', ad: '10. BORU MAKİNASI' },
  { id: '11', ad: '11. BORU MAKİNASI' },
  { id: '12', ad: '12. BORU MAKİNASI' },
  { id: '13', ad: '13. BORU MAKİNASI' },
  { id: '14', ad: '14. BORU MAKİNASI' },
  { id: '15', ad: '15. BORU MAKİNASI' },
  { id: '16', ad: '16. BORU MAKİNASI' },
  { id: '17', ad: '17. BORU MAKİNASI' },
  { id: '18', ad: '18. BORU MAKİNASI' },
  { id: '19', ad: '19. BORU MAKİNASI' },
  { id: '20', ad: '20. BORU MAKİNASI' },
  { id: '21', ad: '21. BORU MAKİNASI' },
  { id: '22', ad: '22. BORU MAKİNASI' },
  { id: '23', ad: '23. BORU MAKİNASI' },
  { id: '1_DILME', ad: '1. DİLME MAKİNASI' },
  { id: '2_DILME', ad: '2. DİLME MAKİNASI' },
  { id: '3_DILME', ad: '3. DİLME MAKİNASI' },
  { id: '4_DILME', ad: '4. DİLME MAKİNASI' },
  { id: '5_DILME', ad: '5. DİLME MAKİNASI' },
  { id: '6_DILME', ad: '6. DİLME MAKİNASI' },
  { id: '7_DILME', ad: '7. DİLME MAKİNASI' },
  { id: '8_DILME', ad: '8. DİLME MAKİNASI' },
  { id: '9_DILME', ad: '9. DİLME MAKİNASI' },
  { id: '10_DILME', ad: '10. DİLME MAKİNASI' },
  { id: '11_DILME', ad: '11. DİLME MAKİNASI' },
  { id: 'OFFLINE_4_BOYAMA', ad: 'OFFLINE 4 BOYAMA' }
];

// İş Emri tipi
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

// ID oluşturma fonksiyonu (YYYYMMDD-XXXX formatında)
export function generateIsEmriId(tarih: string): string {
  const dateStr = tarih.replace(/-/g, '').slice(0, 8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${dateStr}-${random}`;
}

