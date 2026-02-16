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
  'ELEKTRİK BAKIM',
  'MEKANİK BAKIM',
  'YARDIMCI TESİSLER'
];

// Personel Listesi (listeler.jpg'den)
export const personelListesi: Personel[] = [
  { sicilNo: '181', ad: 'MEHMET', soyad: 'KOROĞLU', bolum: 'MEKANİK BAKIM', adSoyad: 'MEHMET KOROĞLU' },
  { sicilNo: '426', ad: 'AHMET', soyad: 'DEMİROĞLU', bolum: 'ELEKTRİK BAKIM', adSoyad: 'AHMET DEMİROĞLU' },
  { sicilNo: '505', ad: 'MUSTAFA', soyad: 'KURTULAN', bolum: 'MEKANİK BAKIM', adSoyad: 'MUSTAFA KURTULAN' },
  { sicilNo: '557', ad: 'RAMAZAN', soyad: 'GÜNDOĞAN', bolum: 'ELEKTRİK BAKIM', adSoyad: 'RAMAZAN GÜNDOĞAN' },
  { sicilNo: '2466', ad: 'MUSTAFA', soyad: 'OKSUZ', bolum: 'MEKANİK BAKIM', adSoyad: 'MUSTAFA OKSUZ' },
  { sicilNo: '2467', ad: 'ALİ', soyad: 'KARA', bolum: 'ELEKTRİK BAKIM', adSoyad: 'ALİ KARA' },
  { sicilNo: '2546', ad: 'MEHMET EMİN', soyad: 'AYDIN', bolum: 'ELEKTRİK BAKIM', adSoyad: 'MEHMET EMİN AYDIN' },
  { sicilNo: '2577', ad: 'BURAK', soyad: 'DURMUŞ', bolum: 'ELEKTRİK BAKIM', adSoyad: 'BURAK DURMUŞ' },
  { sicilNo: '2695', ad: 'LUTFULLAH', soyad: 'ÖZDEMİR', bolum: 'YARDIMCI TESİSLER', adSoyad: 'LUTFULLAH ÖZDEMİR' },
  { sicilNo: '2712', ad: 'UĞUR', soyad: 'BATAR', bolum: 'ELEKTRİK BAKIM', adSoyad: 'UĞUR BATAR' },
  { sicilNo: '2949', ad: 'AHMET', soyad: 'TUROĞLU', bolum: 'MEKANİK BAKIM', adSoyad: 'AHMET TUROĞLU' },
  { sicilNo: '3105', ad: 'HASAN', soyad: 'ÖZTÜRK', bolum: 'MEKANİK BAKIM', adSoyad: 'HASAN ÖZTÜRK' },
  { sicilNo: '8473', ad: 'TURGAY', soyad: 'GÜLEŞÇİ', bolum: 'YARDIMCI TESİSLER', adSoyad: 'TURGAY GÜLEŞÇİ' },
  { sicilNo: '8530', ad: 'TUĞRUL', soyad: 'DAVARCIOĞLU', bolum: 'ELEKTRİK BAKIM', adSoyad: 'TUĞRUL DAVARCIOĞLU' },
  { sicilNo: '100052', ad: 'YASİN', soyad: 'ÇEŞMEBAŞI', bolum: 'MEKANİK BAKIM', adSoyad: 'YASİN ÇEŞMEBAŞI' },
  { sicilNo: '100054', ad: 'OĞUZHAN', soyad: 'URUL', bolum: 'ELEKTRİK BAKIM', adSoyad: 'OĞUZHAN URUL' },
  { sicilNo: '100055', ad: 'HALİL', soyad: 'SARIKÖSE', bolum: 'ELEKTRİK BAKIM', adSoyad: 'HALİL SARIKÖSE' },
  { sicilNo: '100113', ad: 'İSMET', soyad: 'ORSDEMİR', bolum: 'ELEKTRİK BAKIM', adSoyad: 'İSMET ORSDEMİR' },
  { sicilNo: '100213', ad: 'OKAN KURŞAD', soyad: 'SARPKAYA', bolum: 'MEKANİK BAKIM', adSoyad: 'OKAN KURŞAD SARPKAYA' },
  { sicilNo: '100217', ad: 'MELİH', soyad: 'GÖRMEZ', bolum: 'MEKANİK BAKIM', adSoyad: 'MELİH GÖRMEZ' },
  { sicilNo: '100226', ad: 'HALİL İBRAHİM', soyad: 'KAYA', bolum: 'MEKANİK BAKIM', adSoyad: 'HALİL İBRAHİM KAYA' },
  { sicilNo: '100267', ad: 'ÖMER CAN', soyad: 'ÇALKAN', bolum: 'ELEKTRİK BAKIM', adSoyad: 'ÖMER CAN ÇALKAN' },
  { sicilNo: '100276', ad: 'BURAK GÖKDENİZ', soyad: 'ZEYTUN', bolum: 'MEKANİK BAKIM', adSoyad: 'BURAK GÖKDENİZ ZEYTUN' },
  { sicilNo: '100299', ad: 'YASİN', soyad: 'SAMAGAN', bolum: 'MEKANİK BAKIM', adSoyad: 'YASİN SAMAGAN' },
  { sicilNo: '100383', ad: 'MEHMET TANJİU', soyad: 'DUZCU', bolum: 'ELEKTRİK BAKIM', adSoyad: 'MEHMET TANJİU DUZCU' },
  { sicilNo: '100408', ad: 'EMİRCAN', soyad: 'YILDIZ', bolum: 'ELEKTRİK BAKIM', adSoyad: 'EMİRCAN YILDIZ' },
  { sicilNo: '100437', ad: 'SERKAN', soyad: 'UYGUNER', bolum: 'ELEKTRİK BAKIM', adSoyad: 'SERKAN UYGUNER' },
  { sicilNo: '100490', ad: 'OĞUZHAN', soyad: 'CİHANGİR', bolum: 'MEKANİK BAKIM', adSoyad: 'OĞUZHAN CİHANGİR' },
  { sicilNo: '100496', ad: 'GÖKHAN', soyad: 'KÜÇÜK', bolum: 'MEKANİK BAKIM', adSoyad: 'GÖKHAN KÜÇÜK' },
  { sicilNo: '100507', ad: 'MUZEHİR', soyad: 'TİLKİ', bolum: 'ELEKTRİK BAKIM', adSoyad: 'MUZEHİR TİLKİ' },
  { sicilNo: '110736', ad: 'YUSUF', soyad: 'ŞEN', bolum: 'ELEKTRİK BAKIM', adSoyad: 'YUSUF ŞEN' },
  { sicilNo: '111541', ad: 'HACI MUSTAFA', soyad: 'TEHÇİ', bolum: 'MEKANİK BAKIM', adSoyad: 'HACI MUSTAFA TEHÇİ' },
  { sicilNo: '111604', ad: 'YİĞİTHAN', soyad: 'KILIÇ', bolum: 'ELEKTRİK BAKIM', adSoyad: 'YİĞİTHAN KILIÇ' },
  { sicilNo: '111607', ad: 'ÖMER', soyad: 'YAZAR', bolum: 'YARDIMCI TESİSLER', adSoyad: 'ÖMER YAZAR' },
  { sicilNo: '111612', ad: 'NİZAM', soyad: 'BAYAZIT', bolum: 'MEKANİK BAKIM', adSoyad: 'NİZAM BAYAZIT' },
  { sicilNo: '111683', ad: 'FATİH', soyad: 'BORAN', bolum: 'ELEKTRİK BAKIM', adSoyad: 'FATİH BORAN' },
  { sicilNo: '111687', ad: 'MESUT', soyad: 'ÇOLAK', bolum: 'ELEKTRİK BAKIM', adSoyad: 'MESUT ÇOLAK' },
  { sicilNo: '111741', ad: 'MESUT', soyad: 'ŞEKEROĞLU', bolum: 'YARDIMCI TESİSLER', adSoyad: 'MESUT ŞEKEROĞLU' },
  { sicilNo: '111744', ad: 'GÜRKAN', soyad: 'ÇETİN', bolum: 'YARDIMCI TESİSLER', adSoyad: 'GÜRKAN ÇETİN' },
  { sicilNo: '111745', ad: 'ÖKKEŞ', soyad: 'YÜCEL', bolum: 'MEKANİK BAKIM', adSoyad: 'ÖKKEŞ YÜCEL' },
  { sicilNo: '111836', ad: 'İBRAHİM ÇARE', soyad: 'GENÇ', bolum: 'YARDIMCI TESİSLER', adSoyad: 'İBRAHİM ÇARE GENÇ' },
  { sicilNo: '112035', ad: 'MUSTAFA', soyad: 'ÇELİK', bolum: 'MEKANİK BAKIM', adSoyad: 'MUSTAFA ÇELİK' },
  { sicilNo: '112047', ad: 'NUMAN', soyad: 'DEMİRCİ', bolum: 'MEKANİK BAKIM', adSoyad: 'NUMAN DEMİRCİ' },
  { sicilNo: '112409', ad: 'İDRİS', soyad: 'TORUN', bolum: 'ELEKTRİK BAKIM', adSoyad: 'İDRİS TORUN' },
  { sicilNo: '112438', ad: 'SERVET', soyad: 'KARAYİĞİT', bolum: 'YARDIMCI TESİSLER', adSoyad: 'SERVET KARAYİĞİT' },
  { sicilNo: '112487', ad: 'FATİH', soyad: 'LAVKAR', bolum: 'MEKANİK BAKIM', adSoyad: 'FATİH LAVKAR' },
  { sicilNo: '112888', ad: 'AHMET UĞUR', soyad: 'CAN', bolum: 'YARDIMCI TESİSLER', adSoyad: 'AHMET UĞUR CAN' },
  { sicilNo: '112912', ad: 'ORHAN', soyad: 'TAŞ', bolum: 'MEKANİK BAKIM', adSoyad: 'ORHAN TAŞ' },
  { sicilNo: '112953', ad: 'OĞUZ', soyad: 'KUNT', bolum: 'ELEKTRİK BAKIM', adSoyad: 'OĞUZ KUNT' },
  { sicilNo: '113014', ad: 'ALİ', soyad: 'ERBAKICI', bolum: 'YARDIMCI TESİSLER', adSoyad: 'ALİ ERBAKICI' },
  { sicilNo: '113154', ad: 'CUMA', soyad: 'GÜRÇINAR', bolum: 'ELEKTRİK BAKIM', adSoyad: 'CUMA GÜRÇINAR' },
  { sicilNo: '113264', ad: 'MEHMET ALİ', soyad: 'ÜNLÜTÜRK', bolum: 'MEKANİK BAKIM', adSoyad: 'MEHMET ALİ ÜNLÜTÜRK' },
  { sicilNo: '113268', ad: 'SELİM', soyad: 'TOPRAK', bolum: 'MEKANİK BAKIM', adSoyad: 'SELİM TOPRAK' },
  { sicilNo: '113516', ad: 'FURKAN', soyad: 'SARIASLAN', bolum: 'MEKANİK BAKIM', adSoyad: 'FURKAN SARIASLAN' },
  { sicilNo: '113720', ad: 'İSA', soyad: 'GÖK', bolum: 'ELEKTRİK BAKIM', adSoyad: 'İSA GÖK' },
  { sicilNo: '113722', ad: 'DOĞAN', soyad: 'CERAN', bolum: 'MEKANİK BAKIM', adSoyad: 'DOĞAN CERAN' },
  { sicilNo: '113723', ad: 'MUSA', soyad: 'TULU', bolum: 'ELEKTRİK BAKIM', adSoyad: 'MUSA TULU' },
  { sicilNo: '113796', ad: 'ALİ', soyad: 'GÖKTAŞ', bolum: 'ELEKTRİK BAKIM', adSoyad: 'ALİ GÖKTAŞ' },
  { sicilNo: '113880', ad: 'ALKAN', soyad: 'SARIKAYA', bolum: 'MEKANİK BAKIM', adSoyad: 'ALKAN SARIKAYA' },
  { sicilNo: '113884', ad: 'ERGÜN', soyad: 'ŞİMŞEK', bolum: 'ELEKTRİK BAKIM', adSoyad: 'ERGÜN ŞİMŞEK' },
  { sicilNo: '114249', ad: 'HAKAN', soyad: 'BAYIR', bolum: 'MEKANİK BAKIM', adSoyad: 'HAKAN BAYIR' },
  { sicilNo: '114269', ad: 'ÖCAL', soyad: 'CEYLAN', bolum: 'MEKANİK BAKIM', adSoyad: 'ÖCAL CEYLAN' },
  { sicilNo: '118470', ad: 'FATİH', soyad: 'KÖRKOCA', bolum: 'MEKANİK BAKIM', adSoyad: 'FATİH KÖRKOCA' },
  { sicilNo: '118658', ad: 'MURAT', soyad: 'KARTAL', bolum: 'YARDIMCI TESİSLER', adSoyad: 'MURAT KARTAL' },
  { sicilNo: '117298', ad: 'ŞÜKRÜ', soyad: 'BAŞ', bolum: 'MEKANİK BAKIM', adSoyad: 'ŞÜKRÜ BAŞ' },
  { sicilNo: '118471', ad: 'MEHMET ALİ', soyad: 'ÖZDEMİR', bolum: 'YARDIMCI TESİSLER', adSoyad: 'MEHMET ALİ ÖZDEMİR' },
  { sicilNo: '118562', ad: 'YASİN', soyad: 'AS', bolum: 'MEKANİK BAKIM', adSoyad: 'YASİN AS' }
];

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
