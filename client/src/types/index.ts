export type Role = 'ADMIN' | 'BAKIM_MUDURU' | 'BAKIM_SEFI' | 'TEKNISYEN' | 'OPERATOR';
export type Departman =
  | 'MEKANIK'
  | 'ELEKTRIK'
  | 'YARDIMCI_ISLETMELER'
  | 'URETIM'
  | 'YONETIM'
  | 'ELEKTRIK BAKIM ANA BINA'
  | 'ELEKTRIK BAKIM EK BINA'
  | 'MEKANIK BAKIM'
  | 'ISK ELEKTRIK BAKIM'
  | 'ISK MEKANIK BAKIM'
  | 'ISK YARDIMCI TESISLER'
  | 'YARDIMCI TESISLER';
export type IsEmriDurum = 'BEKLEMEDE' | 'ATANDI' | 'DEVAM_EDIYOR' | 'ONAY_BEKLIYOR' | 'TAMAMLANDI' | 'IPTAL';
export type Oncelik = 'ACIL' | 'YUKSEK' | 'NORMAL' | 'DUSUK';
export type KritiklikSeviyesi = 'A' | 'B' | 'C';
export type PeriyotTipi = 'GUNLUK' | 'HAFTALIK' | 'AYLIK' | 'UC_AYLIK' | 'ALTI_AYLIK' | 'YILLIK';
export type VardiyaDurum = 'AKTIF' | 'IZINLI' | 'RAPORLU' | 'EGITIMDE';

export interface User {
  id: number;
  sicilNo: string;
  ad: string;
  soyad: string;
  email: string;
  telefon?: string;
  departman: Departman;
  unvan?: string;
  uzmanlikAlani?: string;
  role: Role;
  aktif: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Shift {
  id: number;
  vardiyaAdi: string;
  baslangicSaati: string;
  bitisSaati: string;
  renk: string;
  createdAt: string;
}

export interface ShiftSchedule {
  id: number;
  userId: number;
  shiftId: number;
  tarih: string;
  durum: VardiyaDurum;
  notlar?: string;
  user?: User;
  shift?: Shift;
}

export interface Equipment {
  id: number;
  ekipmanKodu: string;
  ekipmanAdi: string;
  kategori: string;
  altKategori?: string;
  marka?: string;
  model?: string;
  seriNo?: string;
  lokasyon: string;
  kritiklikSeviyesi: KritiklikSeviyesi;
  durum: string;
  kurulumTarihi?: string;
  garantiBitisTarihi?: string;
  teknikOzellikler?: Record<string, unknown>;
  notlar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: number;
  isEmriNo: string;
  baslik: string;
  aciklama?: string;
  equipmentId?: number;
  oncelik: Oncelik;
  durum: IsEmriDurum;
  talepEdenId: number;
  atananId?: number;
  shiftId?: number;
  planlananBaslangic?: string;
  planlananBitis?: string;
  gercekBaslangic?: string;
  gercekBitis?: string;
  tahminiSure?: number;
  gerceklesenSure?: number;
  maliyetIscilik?: number;
  maliyetMalzeme?: number;
  tamamlanmaNotlari?: string;
  onaylayanId?: number;
  onayTarihi?: string;
  preventiveMaintenanceId?: number;
  createdAt: string;
  updatedAt: string;
  equipment?: Equipment;
  talepEden?: User;
  atanan?: User;
  shift?: Shift;
}

export interface WorkOrderLog {
  id: number;
  workOrderId: number;
  userId: number;
  islem: string;
  eskiDurum?: string;
  yeniDurum?: string;
  aciklama?: string;
  createdAt: string;
  user?: User;
}

export interface PreventiveMaintenance {
  id: number;
  planAdi: string;
  equipmentId: number;
  periyotTipi: PeriyotTipi;
  periyotDegeri: number;
  sonYapilanTarih?: string;
  sonrakiTarih: string;
  kontrolListesi?: string;
  talimatlar?: string;
  tahminiSure?: number;
  sorumluDepartman?: Departman;
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
  equipment?: Equipment;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface DashboardSummary {
  equipment: {
    total: number;
    active: number;
  };
  personnel: {
    total: number;
  };
  workOrders: {
    today: {
      beklemede: number;
      atandi: number;
      devamEdiyor: number;
      tamamlandi: number;
      iptal: number;
      toplam: number;
    };
    monthly: {
      beklemede: number;
      atandi: number;
      devamEdiyor: number;
      tamamlandi: number;
      iptal: number;
      toplam: number;
    };
  };
  preventiveMaintenance: {
    upcoming: number;
    overdue: number;
  };
}

export interface ShiftCompletionStats {
  date: string;
  shifts: Array<{
    shift: Shift;
    personnel: number;
    workOrders: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
      completionRate: number;
      avgCompletionTime: number;
    };
  }>;
}

export interface PersonnelPerformanceSummary {
  completedWorkOrders: number;
  completedMinutes: number;
  availableMinutes: number;
  workRate: number;
  averageCompletionMinutes: number;
}

export interface PersonnelShiftPerformance extends PersonnelPerformanceSummary {
  shiftId: number;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  color: string;
  isScheduled: boolean;
}

export interface PersonnelPerformanceData {
  user: Pick<User, 'id' | 'sicilNo' | 'ad' | 'soyad' | 'departman'>;
  period: {
    date: string;
    month: string;
  };
  daily: PersonnelPerformanceSummary;
  monthly: PersonnelPerformanceSummary;
  shifts: PersonnelShiftPerformance[];
}

export const DepartmanLabels: Record<Departman, string> = {
  MEKANIK: 'Mekanik',
  ELEKTRIK: 'Elektrik',
  YARDIMCI_ISLETMELER: 'Yardimci Isletmeler',
  URETIM: 'Uretim',
  YONETIM: 'Yonetim',
  'ELEKTRIK BAKIM ANA BINA': 'Elektrik Bakim Ana Bina',
  'ELEKTRIK BAKIM EK BINA': 'Elektrik Bakim Ek Bina',
  'MEKANIK BAKIM': 'Mekanik Bakim',
  'ISK ELEKTRIK BAKIM': 'ISK Elektrik Bakim',
  'ISK MEKANIK BAKIM': 'ISK Mekanik Bakim',
  'ISK YARDIMCI TESISLER': 'ISK Yardimci Tesisler',
  'YARDIMCI TESISLER': 'Yardimci Tesisler'
};

export const RoleLabels: Record<Role, string> = {
  ADMIN: 'Sistem Yoneticisi',
  BAKIM_MUDURU: 'Bakim Muduru',
  BAKIM_SEFI: 'Bakim Sefi',
  TEKNISYEN: 'Teknisyen',
  OPERATOR: 'Operator'
};

export const OncelikLabels: Record<Oncelik, string> = {
  ACIL: 'Acil',
  YUKSEK: 'Yuksek',
  NORMAL: 'Normal',
  DUSUK: 'Dusuk'
};

export const IsEmriDurumLabels: Record<IsEmriDurum, string> = {
  BEKLEMEDE: 'Beklemede',
  ATANDI: 'Atandi',
  DEVAM_EDIYOR: 'Devam Ediyor',
  ONAY_BEKLIYOR: 'Onay Bekliyor',
  TAMAMLANDI: 'Tamamlandi',
  IPTAL: 'Iptal'
};

export const PeriyotTipiLabels: Record<PeriyotTipi, string> = {
  GUNLUK: 'Gunluk',
  HAFTALIK: 'Haftalik',
  AYLIK: 'Aylik',
  UC_AYLIK: '3 Aylik',
  ALTI_AYLIK: '6 Aylik',
  YILLIK: 'Yillik'
};

export const VardiyaDurumLabels: Record<VardiyaDurum, string> = {
  AKTIF: 'Aktif',
  IZINLI: 'Izinli',
  RAPORLU: 'Raporlu',
  EGITIMDE: 'Egitimde'
};
