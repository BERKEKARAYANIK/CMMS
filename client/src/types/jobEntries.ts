export type PlannedTaskType = 'PLANLI_BAKIM' | 'DURUS_RAPOR_ANALIZ';

export interface PlannedJob {
  id: string;
  makina: string;
  mudahaleTuru: string;
  aciklama: string;
  malzeme: string;
  gorevTipi: PlannedTaskType;
  atananSicilNo?: string;
  atananAdSoyad?: string;
  atananBolum?: string;
  backendWorkOrderId?: number;
  backendWorkOrderNo?: string;
  backendGonderimTarihi?: string;
  kaynakIsEmriId?: string;
  kaynakDurusDakika?: number;
  createdAt: string;
}

export interface CompletedJobPersonnel {
  sicilNo: string;
  adSoyad: string;
  bolum: string;
}

export interface CompletedJobAnalysisAssignment {
  planlananIsId?: string;
  backendWorkOrderId?: number;
  backendWorkOrderNo?: string;
  atananSicilNo: string;
  atananAdSoyad: string;
  atananBolum: string;
  atamaTarihi: string;
}

export interface CompletedJob {
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
  personeller: CompletedJobPersonnel[];
  analizAtamasi?: CompletedJobAnalysisAssignment;
  createdAt: string;
}
