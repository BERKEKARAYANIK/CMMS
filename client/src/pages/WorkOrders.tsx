import { useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  XCircle,
  FileCheck2,
  RotateCcw,
  Pencil,
  Trash2
} from 'lucide-react';
import { equipmentApi, shiftsApi, usersApi, workOrdersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Equipment, IsEmriDurum, Oncelik, Shift, User, WorkOrder } from '../types';
import { IsEmriDurumLabels, OncelikLabels } from '../types';
import { isBerkeUser } from '../utils/access';

const durumOptions: IsEmriDurum[] = ['BEKLEMEDE', 'ATANDI', 'DEVAM_EDIYOR', 'ONAY_BEKLIYOR', 'TAMAMLANDI', 'IPTAL'];
const oncelikOptions: Oncelik[] = ['ACIL', 'YUKSEK', 'NORMAL', 'DUSUK'];

const durumIcons: Record<IsEmriDurum, ElementType> = {
  BEKLEMEDE: Clock,
  ATANDI: AlertCircle,
  DEVAM_EDIYOR: PlayCircle,
  ONAY_BEKLIYOR: FileCheck2,
  TAMAMLANDI: CheckCircle,
  IPTAL: XCircle
};

const durumColors: Record<IsEmriDurum, string> = {
  BEKLEMEDE: 'bg-gray-100 text-gray-800',
  ATANDI: 'bg-blue-100 text-blue-800',
  DEVAM_EDIYOR: 'bg-yellow-100 text-yellow-800',
  ONAY_BEKLIYOR: 'bg-amber-100 text-amber-900',
  TAMAMLANDI: 'bg-green-100 text-green-800',
  IPTAL: 'bg-red-100 text-red-800'
};

const oncelikColors: Record<Oncelik, string> = {
  ACIL: 'bg-red-100 text-red-800 border-red-300',
  YUKSEK: 'bg-orange-100 text-orange-800 border-orange-300',
  NORMAL: 'bg-blue-100 text-blue-800 border-blue-300',
  DUSUK: 'bg-gray-100 text-gray-800 border-gray-300'
};

interface WorkOrderFormData {
  baslik: string;
  aciklama: string;
  equipmentId: string;
  oncelik: Oncelik;
  atananId: string;
  shiftId: string;
  tahminiSure: string;
}

type ExtendedReportFormData = {
  raporNo: string;
  raporTarihi: string;
  hazirlayan: string;
  onaylayan: string;
  arizaTipi: string;
  arizaTanimi: string;
  toplamDurusSaati: string;
  tepkiSuresiSaat: string;
  teshisSuresiSaat: string;
  yedekParcaBeklemeSaat: string;
  aktifTamirSuresiSaat: string;
  nedenAnalizi: string[];
  kokNedenKategorileri: {
    malzemeParcaKusuru: boolean;
    tasarimHatasi: boolean;
    montajKurulumHatasi: boolean;
    operasyonHatasi: boolean;
    bakimEksikligi: boolean;
    cevreKosullari: boolean;
    diger: boolean;
    digerAciklama: string;
  };
  kokNedenOzeti: string;
  maliyetYedekParca: string;
  maliyetIscilikIc: string;
  maliyetDisServis: string;
  maliyetUretimKaybi: string;
  maliyetToplam: string;
  kullanilanMalzemeler: Array<{
    malzemeAdi: string;
    parcaNo: string;
    miktar: string;
    birimFiyat: string;
  }>;
  onleyiciAksiyonlar: Array<{
    aksiyon: string;
    sorumlu: string;
    hedefTarih: string;
    durum: string;
  }>;
  fotografAciklamalari: string[];
  sonucDegerlendirme: string;
  onayHazirlayanAdSoyad: string;
  onayHazirlayanUnvan: string;
  onayHazirlayanTarih: string;
  onayKontrolEdenAdSoyad: string;
  onayKontrolEdenUnvan: string;
  onayKontrolEdenTarih: string;
  onayOnaylayanAdSoyad: string;
  onayOnaylayanUnvan: string;
  onayOnaylayanTarih: string;
};

const WHY_ROW_COUNT = 5;
const MATERIAL_ROW_COUNT = 5;
const ACTION_ROW_COUNT = 5;
const PHOTO_ROW_COUNT = 4;

function createMaterialRow() {
  return {
    malzemeAdi: '',
    parcaNo: '',
    miktar: '',
    birimFiyat: ''
  };
}

function createActionRow() {
  return {
    aksiyon: '',
    sorumlu: '',
    hedefTarih: '',
    durum: ''
  };
}

function createEmptyReportForm(): ExtendedReportFormData {
  return {
    raporNo: '',
    raporTarihi: '',
    hazirlayan: '',
    onaylayan: '',
    arizaTipi: '',
    arizaTanimi: '',
    toplamDurusSaati: '',
    tepkiSuresiSaat: '',
    teshisSuresiSaat: '',
    yedekParcaBeklemeSaat: '',
    aktifTamirSuresiSaat: '',
    nedenAnalizi: Array.from({ length: WHY_ROW_COUNT }, () => ''),
    kokNedenKategorileri: {
      malzemeParcaKusuru: false,
      tasarimHatasi: false,
      montajKurulumHatasi: false,
      operasyonHatasi: false,
      bakimEksikligi: false,
      cevreKosullari: false,
      diger: false,
      digerAciklama: ''
    },
    kokNedenOzeti: '',
    maliyetYedekParca: '',
    maliyetIscilikIc: '',
    maliyetDisServis: '',
    maliyetUretimKaybi: '',
    maliyetToplam: '',
    kullanilanMalzemeler: Array.from({ length: MATERIAL_ROW_COUNT }, createMaterialRow),
    onleyiciAksiyonlar: Array.from({ length: ACTION_ROW_COUNT }, createActionRow),
    fotografAciklamalari: Array.from({ length: PHOTO_ROW_COUNT }, () => ''),
    sonucDegerlendirme: '',
    onayHazirlayanAdSoyad: '',
    onayHazirlayanUnvan: '',
    onayHazirlayanTarih: '',
    onayKontrolEdenAdSoyad: '',
    onayKontrolEdenUnvan: '',
    onayKontrolEdenTarih: '',
    onayOnaylayanAdSoyad: '',
    onayOnaylayanUnvan: '',
    onayOnaylayanTarih: ''
  };
}

function isManagerRole(role?: string): boolean {
  return role === 'ADMIN' || role === 'BAKIM_MUDURU' || role === 'BAKIM_SEFI';
}

function normalizeForAuth(value: string | null | undefined): string {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

function canManageCompletedFlow(user: User | null): boolean {
  if (!user) return false;
  if (isManagerRole(user.role)) return true;

  const ad = normalizeForAuth(user.ad);
  const fullName = normalizeForAuth(`${user.ad} ${user.soyad}`);
  const email = normalizeForAuth(user.email);
  const sicilNo = normalizeForAuth(user.sicilNo);

  return (
    ad === 'berke'
    || fullName === 'berke karayanik'
    || email.includes('berke')
    || sicilNo === 'berke'
  );
}

function isExtendedDowntimeWorkOrder(workOrder: WorkOrder): boolean {
  return (workOrder.baslik || '').trim().toUpperCase().startsWith('[UDR]');
}

function serializeReport(data: ExtendedReportFormData): string {
  return `UDR_JSON:${JSON.stringify(data)}`;
}

function parseReport(content?: string): ExtendedReportFormData {
  if (!content || !content.startsWith('UDR_JSON:')) return createEmptyReportForm();
  try {
    const parsed = JSON.parse(content.slice('UDR_JSON:'.length)) as any;

    const normalizeStringArray = (value: unknown, length: number): string[] => {
      if (!Array.isArray(value)) return Array.from({ length }, () => '');
      return Array.from({ length }, (_, index) => (
        typeof value[index] === 'string' ? value[index] : ''
      ));
    };

    const normalizeMaterialRows = (value: unknown) => {
      if (!Array.isArray(value)) return Array.from({ length: MATERIAL_ROW_COUNT }, createMaterialRow);
      return Array.from({ length: MATERIAL_ROW_COUNT }, (_, index) => {
        const row = value[index] as any;
        return {
          malzemeAdi: typeof row?.malzemeAdi === 'string' ? row.malzemeAdi : '',
          parcaNo: typeof row?.parcaNo === 'string' ? row.parcaNo : '',
          miktar: typeof row?.miktar === 'string' ? row.miktar : '',
          birimFiyat: typeof row?.birimFiyat === 'string' ? row.birimFiyat : ''
        };
      });
    };

    const normalizeActionRows = (value: unknown) => {
      if (!Array.isArray(value)) return Array.from({ length: ACTION_ROW_COUNT }, createActionRow);
      return Array.from({ length: ACTION_ROW_COUNT }, (_, index) => {
        const row = value[index] as any;
        return {
          aksiyon: typeof row?.aksiyon === 'string' ? row.aksiyon : '',
          sorumlu: typeof row?.sorumlu === 'string' ? row.sorumlu : '',
          hedefTarih: typeof row?.hedefTarih === 'string' ? row.hedefTarih : '',
          durum: typeof row?.durum === 'string' ? row.durum : ''
        };
      });
    };

    const base = createEmptyReportForm();
    const normalizedActions = normalizeActionRows(parsed.onleyiciAksiyonlar);
    if (
      typeof parsed.onleyiciAksiyonlar === 'string'
      && parsed.onleyiciAksiyonlar.trim()
      && !normalizedActions.some((row) => row.aksiyon.trim())
    ) {
      normalizedActions[0].aksiyon = parsed.onleyiciAksiyonlar.trim();
    }

    const categories = parsed.kokNedenKategorileri || {};

    return {
      ...base,
      raporNo: typeof parsed.raporNo === 'string' ? parsed.raporNo : '',
      raporTarihi: typeof parsed.raporTarihi === 'string' ? parsed.raporTarihi : '',
      hazirlayan: typeof parsed.hazirlayan === 'string' ? parsed.hazirlayan : '',
      onaylayan: typeof parsed.onaylayan === 'string' ? parsed.onaylayan : '',
      arizaTipi: typeof parsed.arizaTipi === 'string' ? parsed.arizaTipi : '',
      arizaTanimi: typeof parsed.arizaTanimi === 'string' ? parsed.arizaTanimi : '',
      toplamDurusSaati: typeof parsed.toplamDurusSaati === 'string' ? parsed.toplamDurusSaati : '',
      tepkiSuresiSaat: typeof parsed.tepkiSuresiSaat === 'string' ? parsed.tepkiSuresiSaat : '',
      teshisSuresiSaat: typeof parsed.teshisSuresiSaat === 'string' ? parsed.teshisSuresiSaat : '',
      yedekParcaBeklemeSaat: typeof parsed.yedekParcaBeklemeSaat === 'string' ? parsed.yedekParcaBeklemeSaat : '',
      aktifTamirSuresiSaat: typeof parsed.aktifTamirSuresiSaat === 'string' ? parsed.aktifTamirSuresiSaat : '',
      nedenAnalizi: normalizeStringArray(parsed.nedenAnalizi, WHY_ROW_COUNT),
      kokNedenKategorileri: {
        malzemeParcaKusuru: Boolean(categories.malzemeParcaKusuru),
        tasarimHatasi: Boolean(categories.tasarimHatasi),
        montajKurulumHatasi: Boolean(categories.montajKurulumHatasi),
        operasyonHatasi: Boolean(categories.operasyonHatasi),
        bakimEksikligi: Boolean(categories.bakimEksikligi),
        cevreKosullari: Boolean(categories.cevreKosullari),
        diger: Boolean(categories.diger),
        digerAciklama: typeof categories.digerAciklama === 'string' ? categories.digerAciklama : ''
      },
      kokNedenOzeti: typeof parsed.kokNedenOzeti === 'string' ? parsed.kokNedenOzeti : '',
      maliyetYedekParca: typeof parsed.maliyetYedekParca === 'string' ? parsed.maliyetYedekParca : '',
      maliyetIscilikIc: typeof parsed.maliyetIscilikIc === 'string' ? parsed.maliyetIscilikIc : '',
      maliyetDisServis: typeof parsed.maliyetDisServis === 'string' ? parsed.maliyetDisServis : '',
      maliyetUretimKaybi: typeof parsed.maliyetUretimKaybi === 'string' ? parsed.maliyetUretimKaybi : '',
      maliyetToplam: typeof parsed.maliyetToplam === 'string' ? parsed.maliyetToplam : '',
      kullanilanMalzemeler: normalizeMaterialRows(parsed.kullanilanMalzemeler),
      onleyiciAksiyonlar: normalizedActions,
      fotografAciklamalari: normalizeStringArray(parsed.fotografAciklamalari, PHOTO_ROW_COUNT),
      sonucDegerlendirme: typeof parsed.sonucDegerlendirme === 'string' ? parsed.sonucDegerlendirme : '',
      onayHazirlayanAdSoyad: typeof parsed.onayHazirlayanAdSoyad === 'string' ? parsed.onayHazirlayanAdSoyad : '',
      onayHazirlayanUnvan: typeof parsed.onayHazirlayanUnvan === 'string' ? parsed.onayHazirlayanUnvan : '',
      onayHazirlayanTarih: typeof parsed.onayHazirlayanTarih === 'string' ? parsed.onayHazirlayanTarih : '',
      onayKontrolEdenAdSoyad: typeof parsed.onayKontrolEdenAdSoyad === 'string' ? parsed.onayKontrolEdenAdSoyad : '',
      onayKontrolEdenUnvan: typeof parsed.onayKontrolEdenUnvan === 'string' ? parsed.onayKontrolEdenUnvan : '',
      onayKontrolEdenTarih: typeof parsed.onayKontrolEdenTarih === 'string' ? parsed.onayKontrolEdenTarih : '',
      onayOnaylayanAdSoyad: typeof parsed.onayOnaylayanAdSoyad === 'string' ? parsed.onayOnaylayanAdSoyad : '',
      onayOnaylayanUnvan: typeof parsed.onayOnaylayanUnvan === 'string' ? parsed.onayOnaylayanUnvan : '',
      onayOnaylayanTarih: typeof parsed.onayOnaylayanTarih === 'string' ? parsed.onayOnaylayanTarih : ''
    };
  } catch {
    return createEmptyReportForm();
  }
}

function WorkOrderModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  equipment,
  users,
  shifts,
  canAssign
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkOrderFormData) => void;
  isLoading: boolean;
  equipment: Equipment[];
  users: User[];
  shifts: Shift[];
  canAssign: boolean;
}) {
  const [formData, setFormData] = useState<WorkOrderFormData>({
    baslik: '',
    aciklama: '',
    equipmentId: '',
    oncelik: 'NORMAL',
    atananId: '',
    shiftId: '',
    tahminiSure: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Is Girisi</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(formData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="label">Baslik</label>
              <input
                type="text"
                value={formData.baslik}
                onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Aciklama</label>
              <textarea
                value={formData.aciklama}
                onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                className="input"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Ekipman</label>
                <select
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                  className="input"
                >
                  <option value="">Seciniz</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.ekipmanKodu} - {eq.ekipmanAdi}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Oncelik</label>
                <select
                  value={formData.oncelik}
                  onChange={(e) => setFormData({ ...formData, oncelik: e.target.value as Oncelik })}
                  className="input"
                >
                  {oncelikOptions.map((o) => (
                    <option key={o} value={o}>{OncelikLabels[o]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {canAssign && (
                <div>
                  <label className="label">Atanan Personel</label>
                  <select
                    value={formData.atananId}
                    onChange={(e) => setFormData({ ...formData, atananId: e.target.value })}
                    className="input"
                  >
                    <option value="">Seciniz</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.ad} {user.soyad} ({user.sicilNo})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className={canAssign ? '' : 'col-span-2'}>
                <label className="label">Vardiya</label>
                <select
                  value={formData.shiftId}
                  onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                  className="input"
                >
                  <option value="">Seciniz</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>{shift.vardiyaAdi}</option>
                  ))}
                </select>
              </div>
            </div>
            {!canAssign && (
              <p className="text-xs text-gray-500">
                Atama islemi sadece Berke Karayanik tarafindan yapilabilir.
              </p>
            )}

            <div>
              <label className="label">Tahmini Sure (dk)</label>
              <input
                type="number"
                value={formData.tahminiSure}
                onChange={(e) => setFormData({ ...formData, tahminiSure: e.target.value })}
                className="input"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn btn-secondary">Iptal</button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Olusturuluyor...' : 'Olustur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ExtendedReportModal({
  isOpen,
  workOrder,
  readOnly,
  onClose,
  onSubmit,
  isLoading
}: {
  isOpen: boolean;
  workOrder: WorkOrder | null;
  readOnly: boolean;
  onClose: () => void;
  onSubmit: (data: ExtendedReportFormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<ExtendedReportFormData>(createEmptyReportForm());

  useEffect(() => {
    if (!workOrder) {
      setFormData(createEmptyReportForm());
      return;
    }
    setFormData(parseReport(workOrder.tamamlanmaNotlari));
  }, [workOrder]);

  const setNedenCevabi = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      nedenAnalizi: prev.nedenAnalizi.map((item, i) => (i === index ? value : item))
    }));
  };

  const setKullanilanMalzeme = (index: number, key: 'malzemeAdi' | 'parcaNo' | 'miktar' | 'birimFiyat', value: string) => {
    setFormData((prev) => ({
      ...prev,
      kullanilanMalzemeler: prev.kullanilanMalzemeler.map((row, i) => (
        i === index ? { ...row, [key]: value } : row
      ))
    }));
  };

  const setOnleyiciAksiyon = (index: number, key: 'aksiyon' | 'sorumlu' | 'hedefTarih' | 'durum', value: string) => {
    setFormData((prev) => ({
      ...prev,
      onleyiciAksiyonlar: prev.onleyiciAksiyonlar.map((row, i) => (
        i === index ? { ...row, [key]: value } : row
      ))
    }));
  };

  const setFotografAciklamasi = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      fotografAciklamalari: prev.fotografAciklamalari.map((item, i) => (i === index ? value : item))
    }));
  };

  const setKategori = (
    key: 'malzemeParcaKusuru' | 'tasarimHatasi' | 'montajKurulumHatasi' | 'operasyonHatasi' | 'bakimEksikligi' | 'cevreKosullari' | 'diger',
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      kokNedenKategorileri: {
        ...prev.kokNedenKategorileri,
        [key]: checked
      }
    }));
  };

  if (!isOpen || !workOrder) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Uzayan Durus Analiz Raporu</h2>
          <p className="text-sm text-gray-600 mb-1">{workOrder.isEmriNo} - {workOrder.baslik}</p>
          {readOnly && (
            <p className="text-xs text-emerald-700 mb-4">Bu rapor salt-okunur modda goruntuleniyor.</p>
          )}

          <div className="max-h-[72vh] overflow-y-auto pr-1 space-y-5">
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">Rapor Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="label">Rapor No</label>
                  <input
                    className="input"
                    value={formData.raporNo}
                    onChange={(e) => setFormData({ ...formData, raporNo: e.target.value })}
                    disabled={readOnly}
                    placeholder="UD-2026-XXX"
                  />
                </div>
                <div>
                  <label className="label">Rapor Tarihi</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.raporTarihi}
                    onChange={(e) => setFormData({ ...formData, raporTarihi: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Hazirlayan</label>
                  <input
                    className="input"
                    value={formData.hazirlayan}
                    onChange={(e) => setFormData({ ...formData, hazirlayan: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Onaylayan</label>
                  <input
                    className="input"
                    value={formData.onaylayan}
                    onChange={(e) => setFormData({ ...formData, onaylayan: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">1. Ariza Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Ariza Tipi</label>
                  <input
                    className="input"
                    value={formData.arizaTipi}
                    onChange={(e) => setFormData({ ...formData, arizaTipi: e.target.value })}
                    disabled={readOnly}
                    placeholder="Mekanik / Elektrik / Hidrolik / Pnomatik / Otomasyon"
                  />
                </div>
                <div>
                  <label className="label">Ariza Tanimi</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={formData.arizaTanimi}
                    onChange={(e) => setFormData({ ...formData, arizaTanimi: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">2. Zaman Cizelgesi (Saat)</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="label">Toplam Durus</label>
                  <input
                    className="input"
                    value={formData.toplamDurusSaati}
                    onChange={(e) => setFormData({ ...formData, toplamDurusSaati: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Tepki Suresi</label>
                  <input
                    className="input"
                    value={formData.tepkiSuresiSaat}
                    onChange={(e) => setFormData({ ...formData, tepkiSuresiSaat: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Teshis Suresi</label>
                  <input
                    className="input"
                    value={formData.teshisSuresiSaat}
                    onChange={(e) => setFormData({ ...formData, teshisSuresiSaat: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Yedek Parca Bekleme</label>
                  <input
                    className="input"
                    value={formData.yedekParcaBeklemeSaat}
                    onChange={(e) => setFormData({ ...formData, yedekParcaBeklemeSaat: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Aktif Tamir Suresi</label>
                  <input
                    className="input"
                    value={formData.aktifTamirSuresiSaat}
                    onChange={(e) => setFormData({ ...formData, aktifTamirSuresiSaat: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">3.1 5 Neden Analizi</h3>
              <div className="space-y-2">
                {formData.nedenAnalizi.map((value, index) => (
                  <div key={`neden-${index}`}>
                    <label className="label">{index + 1}. Neden</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={value}
                      onChange={(e) => setNedenCevabi(index, e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">3.2 Kok Neden Kategorisi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.kokNedenKategorileri.malzemeParcaKusuru}
                    onChange={(e) => setKategori('malzemeParcaKusuru', e.target.checked)}
                    disabled={readOnly}
                  />
                  Malzeme / Parca Kusuru
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.kokNedenKategorileri.tasarimHatasi}
                    onChange={(e) => setKategori('tasarimHatasi', e.target.checked)}
                    disabled={readOnly}
                  />
                  Tasarim Hatasi
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.kokNedenKategorileri.montajKurulumHatasi}
                    onChange={(e) => setKategori('montajKurulumHatasi', e.target.checked)}
                    disabled={readOnly}
                  />
                  Montaj / Kurulum Hatasi
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.kokNedenKategorileri.operasyonHatasi}
                    onChange={(e) => setKategori('operasyonHatasi', e.target.checked)}
                    disabled={readOnly}
                  />
                  Operasyon Hatasi
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.kokNedenKategorileri.bakimEksikligi}
                    onChange={(e) => setKategori('bakimEksikligi', e.target.checked)}
                    disabled={readOnly}
                  />
                  Bakim Eksikligi
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.kokNedenKategorileri.cevreKosullari}
                    onChange={(e) => setKategori('cevreKosullari', e.target.checked)}
                    disabled={readOnly}
                  />
                  Cevre Kosullari
                </label>
                <label className="inline-flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={formData.kokNedenKategorileri.diger}
                    onChange={(e) => setKategori('diger', e.target.checked)}
                    disabled={readOnly}
                  />
                  Diger (Belirtiniz)
                </label>
              </div>
              <input
                className="input"
                value={formData.kokNedenKategorileri.digerAciklama}
                onChange={(e) => setFormData({
                  ...formData,
                  kokNedenKategorileri: {
                    ...formData.kokNedenKategorileri,
                    digerAciklama: e.target.value
                  }
                })}
                disabled={readOnly}
                placeholder="Diger kategori aciklamasi"
              />
            </section>

            <section>
              <label className="label">3.3 Kok Neden Ozeti</label>
              <textarea
                className="input"
                rows={3}
                value={formData.kokNedenOzeti}
                onChange={(e) => setFormData({ ...formData, kokNedenOzeti: e.target.value })}
                disabled={readOnly}
              />
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">4. Maliyet Analizi (TL)</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="label">Yedek Parca</label>
                  <input
                    className="input"
                    value={formData.maliyetYedekParca}
                    onChange={(e) => setFormData({ ...formData, maliyetYedekParca: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Iscilik (Ic)</label>
                  <input
                    className="input"
                    value={formData.maliyetIscilikIc}
                    onChange={(e) => setFormData({ ...formData, maliyetIscilikIc: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Dis Servis</label>
                  <input
                    className="input"
                    value={formData.maliyetDisServis}
                    onChange={(e) => setFormData({ ...formData, maliyetDisServis: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Uretim Kaybi</label>
                  <input
                    className="input"
                    value={formData.maliyetUretimKaybi}
                    onChange={(e) => setFormData({ ...formData, maliyetUretimKaybi: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="label">Toplam</label>
                  <input
                    className="input"
                    value={formData.maliyetToplam}
                    onChange={(e) => setFormData({ ...formData, maliyetToplam: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">5. Kullanilan Malzemeler</h3>
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-2 text-left">No</th>
                      <th className="px-2 py-2 text-left">Malzeme Adi</th>
                      <th className="px-2 py-2 text-left">Parca No</th>
                      <th className="px-2 py-2 text-left">Miktar</th>
                      <th className="px-2 py-2 text-left">Birim Fiyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.kullanilanMalzemeler.map((row, index) => (
                      <tr key={`malzeme-${index}`} className="border-t">
                        <td className="px-2 py-1">{index + 1}</td>
                        <td className="px-2 py-1">
                          <input className="input" value={row.malzemeAdi} onChange={(e) => setKullanilanMalzeme(index, 'malzemeAdi', e.target.value)} disabled={readOnly} />
                        </td>
                        <td className="px-2 py-1">
                          <input className="input" value={row.parcaNo} onChange={(e) => setKullanilanMalzeme(index, 'parcaNo', e.target.value)} disabled={readOnly} />
                        </td>
                        <td className="px-2 py-1">
                          <input className="input" value={row.miktar} onChange={(e) => setKullanilanMalzeme(index, 'miktar', e.target.value)} disabled={readOnly} />
                        </td>
                        <td className="px-2 py-1">
                          <input className="input" value={row.birimFiyat} onChange={(e) => setKullanilanMalzeme(index, 'birimFiyat', e.target.value)} disabled={readOnly} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">6. Onleyici Aksiyonlar</h3>
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-2 text-left">No</th>
                      <th className="px-2 py-2 text-left">Aksiyon</th>
                      <th className="px-2 py-2 text-left">Sorumlu</th>
                      <th className="px-2 py-2 text-left">Hedef Tarih</th>
                      <th className="px-2 py-2 text-left">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.onleyiciAksiyonlar.map((row, index) => (
                      <tr key={`aksiyon-${index}`} className="border-t">
                        <td className="px-2 py-1">{index + 1}</td>
                        <td className="px-2 py-1">
                          <input className="input" value={row.aksiyon} onChange={(e) => setOnleyiciAksiyon(index, 'aksiyon', e.target.value)} disabled={readOnly} />
                        </td>
                        <td className="px-2 py-1">
                          <input className="input" value={row.sorumlu} onChange={(e) => setOnleyiciAksiyon(index, 'sorumlu', e.target.value)} disabled={readOnly} />
                        </td>
                        <td className="px-2 py-1">
                          <input className="input" type="date" value={row.hedefTarih} onChange={(e) => setOnleyiciAksiyon(index, 'hedefTarih', e.target.value)} disabled={readOnly} />
                        </td>
                        <td className="px-2 py-1">
                          <input className="input" value={row.durum} onChange={(e) => setOnleyiciAksiyon(index, 'durum', e.target.value)} disabled={readOnly} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">7. Fotograf Dokumantasyonu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.fotografAciklamalari.map((aciklama, index) => (
                  <div key={`foto-${index}`}>
                    <label className="label">Fotograf {index + 1} Aciklamasi</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={aciklama}
                      onChange={(e) => setFotografAciklamasi(index, e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <label className="label">8. Sonuc ve Degerlendirme</label>
              <textarea
                className="input"
                rows={3}
                value={formData.sonucDegerlendirme}
                onChange={(e) => setFormData({ ...formData, sonucDegerlendirme: e.target.value })}
                disabled={readOnly}
              />
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">9. Onaylar</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded border p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Hazirlayan</p>
                  <input className="input" placeholder="Ad Soyad" value={formData.onayHazirlayanAdSoyad} onChange={(e) => setFormData({ ...formData, onayHazirlayanAdSoyad: e.target.value })} disabled={readOnly} />
                  <input className="input" placeholder="Unvan" value={formData.onayHazirlayanUnvan} onChange={(e) => setFormData({ ...formData, onayHazirlayanUnvan: e.target.value })} disabled={readOnly} />
                  <input className="input" type="date" value={formData.onayHazirlayanTarih} onChange={(e) => setFormData({ ...formData, onayHazirlayanTarih: e.target.value })} disabled={readOnly} />
                </div>
                <div className="rounded border p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Kontrol Eden</p>
                  <input className="input" placeholder="Ad Soyad" value={formData.onayKontrolEdenAdSoyad} onChange={(e) => setFormData({ ...formData, onayKontrolEdenAdSoyad: e.target.value })} disabled={readOnly} />
                  <input className="input" placeholder="Unvan" value={formData.onayKontrolEdenUnvan} onChange={(e) => setFormData({ ...formData, onayKontrolEdenUnvan: e.target.value })} disabled={readOnly} />
                  <input className="input" type="date" value={formData.onayKontrolEdenTarih} onChange={(e) => setFormData({ ...formData, onayKontrolEdenTarih: e.target.value })} disabled={readOnly} />
                </div>
                <div className="rounded border p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Onaylayan</p>
                  <input className="input" placeholder="Ad Soyad" value={formData.onayOnaylayanAdSoyad} onChange={(e) => setFormData({ ...formData, onayOnaylayanAdSoyad: e.target.value })} disabled={readOnly} />
                  <input className="input" placeholder="Unvan" value={formData.onayOnaylayanUnvan} onChange={(e) => setFormData({ ...formData, onayOnaylayanUnvan: e.target.value })} disabled={readOnly} />
                  <input className="input" type="date" value={formData.onayOnaylayanTarih} onChange={(e) => setFormData({ ...formData, onayOnaylayanTarih: e.target.value })} disabled={readOnly} />
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-end space-x-3 pt-5">
            {readOnly ? (
              <button type="button" onClick={onClose} className="btn btn-secondary">Kapat</button>
            ) : (
              <>
                <button type="button" onClick={onClose} className="btn btn-secondary">Iptal</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isLoading}
                  onClick={() => onSubmit(formData)}
                >
                  {isLoading ? 'Gonderiliyor...' : 'Onaya Gonder'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkOrderCard({
  workOrder,
  currentUser,
  onStatusChange,
  onOpenReport,
  onViewReport,
  onApprove,
  onDeleteReport,
  onReopenFromCompleted,
  approvingId,
  reportPendingId,
  reportDeletingId,
  reopeningId
}: {
  workOrder: WorkOrder;
  currentUser: User | null;
  onStatusChange: (id: number, durum: IsEmriDurum) => void;
  onOpenReport: (workOrder: WorkOrder) => void;
  onViewReport: (workOrder: WorkOrder) => void;
  onApprove: (id: number) => void;
  onDeleteReport: (workOrder: WorkOrder) => void;
  onReopenFromCompleted: (workOrder: WorkOrder) => void;
  approvingId: number | null;
  reportPendingId: number | null;
  reportDeletingId: number | null;
  reopeningId: number | null;
}) {
  const Icon = durumIcons[workOrder.durum];
  const isExtended = isExtendedDowntimeWorkOrder(workOrder);
  const hasReportContent = Boolean(workOrder.tamamlanmaNotlari && workOrder.tamamlanmaNotlari.trim());
  const canFillReport = Boolean(currentUser && (workOrder.atananId === currentUser.id || isManagerRole(currentUser.role)));
  const canApprove = Boolean(currentUser && (workOrder.talepEdenId === currentUser.id || isManagerRole(currentUser.role)));
  const canManageCompleted = canManageCompletedFlow(currentUser);
  const canAssign = Boolean(currentUser && isBerkeUser(currentUser));
  const canWorkOnOrder = Boolean(currentUser && (workOrder.atananId === currentUser.id || isManagerRole(currentUser.role)));
  const hasAssignee = Boolean(workOrder.atananId);

  return (
    <div className={`card p-4 border-l-4 ${oncelikColors[workOrder.oncelik].replace('bg-', 'border-').replace('-100', '-500')}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-xs text-gray-500">{workOrder.isEmriNo}</p>
          <h3 className="font-semibold text-gray-900">{workOrder.baslik}</h3>
          {isExtended && <p className="text-xs text-amber-700 mt-1">Uzayan Durus Akisi Aktif</p>}
        </div>
        <span className={`badge ${durumColors[workOrder.durum]}`}>
          <Icon className="w-3 h-3 mr-1" />
          {IsEmriDurumLabels[workOrder.durum]}
        </span>
      </div>

      {workOrder.equipment && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Ekipman:</span> {workOrder.equipment.ekipmanAdi}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>{workOrder.atanan ? `${workOrder.atanan.ad} ${workOrder.atanan.soyad}` : 'Atanmadi'}</span>
        <span>{format(new Date(workOrder.createdAt), 'dd MMM HH:mm', { locale: tr })}</span>
      </div>

      <div className="flex items-center space-x-2">
        <span className={`badge ${oncelikColors[workOrder.oncelik]}`}>{OncelikLabels[workOrder.oncelik]}</span>
      </div>

      {workOrder.durum !== 'TAMAMLANDI' && workOrder.durum !== 'IPTAL' && (
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
          {workOrder.durum === 'BEKLEMEDE' && canAssign && (
            <button onClick={() => onStatusChange(workOrder.id, 'ATANDI')} className="btn btn-secondary text-xs">Ata</button>
          )}
          {hasAssignee && canWorkOnOrder && (workOrder.durum === 'ATANDI' || workOrder.durum === 'BEKLEMEDE') && (
            <button onClick={() => onStatusChange(workOrder.id, 'DEVAM_EDIYOR')} className="btn btn-primary text-xs">Basla</button>
          )}
          {!isExtended && canWorkOnOrder && workOrder.durum === 'DEVAM_EDIYOR' && (
            <button onClick={() => onStatusChange(workOrder.id, 'TAMAMLANDI')} className="btn btn-success text-xs">Tamamla</button>
          )}
          {isExtended && workOrder.durum === 'DEVAM_EDIYOR' && (
            <button
              onClick={() => onOpenReport(workOrder)}
              className="btn btn-primary text-xs"
              disabled={!canFillReport || reportPendingId === workOrder.id}
            >
              {reportPendingId === workOrder.id ? 'Gonderiliyor...' : 'Raporu Doldur / Onaya Gonder'}
            </button>
          )}
          {isExtended && workOrder.durum === 'ONAY_BEKLIYOR' && (
            <button
              onClick={() => onViewReport(workOrder)}
              className="btn btn-secondary text-xs"
              disabled={!hasReportContent}
            >
              Raporu Oku
            </button>
          )}
          {isExtended && workOrder.durum === 'ONAY_BEKLIYOR' && (
            <button
              onClick={() => onApprove(workOrder.id)}
              className="btn btn-success text-xs"
              disabled={!canApprove || approvingId === workOrder.id}
            >
              {approvingId === workOrder.id ? 'Onaylaniyor...' : 'Tamamlamayi Onayla'}
            </button>
          )}
        </div>
      )}

      {workOrder.durum === 'TAMAMLANDI' && (
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
          {isExtended && hasReportContent && (
            <button
              onClick={() => onViewReport(workOrder)}
              className="btn btn-secondary text-xs"
            >
              Raporu Oku
            </button>
          )}

          {isExtended && hasReportContent && canManageCompleted && (
            <button
              onClick={() => onOpenReport(workOrder)}
              className="inline-flex items-center rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-900 hover:bg-blue-100 disabled:opacity-60"
              disabled={reportPendingId === workOrder.id}
            >
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Raporu Duzenle
            </button>
          )}

          {canManageCompleted && (
            <button
              onClick={() => onReopenFromCompleted(workOrder)}
              className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
              disabled={reopeningId === workOrder.id}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              {reopeningId === workOrder.id ? 'Gonderiliyor...' : 'Geri Yolla'}
            </button>
          )}

        </div>
      )}

      {canAssign && (
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
          <button
            onClick={() => onDeleteReport(workOrder)}
            className="inline-flex items-center rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-900 hover:bg-red-100 disabled:opacity-60"
            disabled={reportDeletingId === workOrder.id}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {reportDeletingId === workOrder.id ? 'Siliniyor...' : 'Formu Sil'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function WorkOrders() {
  const [search, setSearch] = useState('');
  const [filterDurum, setFilterDurum] = useState('');
  const [filterOncelik, setFilterOncelik] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportWorkOrder, setReportWorkOrder] = useState<WorkOrder | null>(null);
  const [isReportReadOnly, setIsReportReadOnly] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const canAssignWorkOrders = Boolean(currentUser && isBerkeUser(currentUser));

  const { data: workOrders, isLoading } = useQuery({
    queryKey: ['work-orders', currentUser?.id ?? 'anon', search, filterDurum, filterOncelik],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterDurum) params.durum = filterDurum;
      if (filterOncelik) params.oncelik = filterOncelik;
      const response = await workOrdersApi.getAll(params);
      return response.data.data as WorkOrder[];
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true
  });

  const { data: equipment } = useQuery({
    queryKey: ['equipment-list'],
    queryFn: async () => {
      const response = await equipmentApi.getAll();
      return response.data.data as Equipment[];
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users-list', currentUser?.id ?? 'anon'],
    enabled: canAssignWorkOrders,
    queryFn: async () => {
      const response = await usersApi.getAll({ aktif: 'true' });
      return response.data.data as User[];
    }
  });

  const { data: shifts } = useQuery({
    queryKey: ['shifts-list'],
    queryFn: async () => {
      const response = await shiftsApi.getAll();
      return response.data.data as Shift[];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: WorkOrderFormData) => workOrdersApi.create({
      ...data,
      tahminiSure: data.tahminiSure ? Number.parseInt(data.tahminiSure, 10) : undefined
    }),
    onSuccess: () => {
      toast.success('Is emri olusturuldu');
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Hata olustu');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, durum }: { id: number; durum: IsEmriDurum }) => workOrdersApi.updateStatus(id, durum),
    onSuccess: () => {
      toast.success('Durum guncellendi');
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Durum guncellenemedi');
    }
  });

  const submitReportMutation = useMutation({
    mutationFn: ({ id, reportContent }: { id: number; reportContent: string }) =>
      workOrdersApi.submitForApproval(id, reportContent),
    onSuccess: () => {
      toast.success('Rapor onaya gonderildi');
      setReportWorkOrder(null);
      setIsReportReadOnly(false);
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Onaya gonderme basarisiz');
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => workOrdersApi.approveCompletion(id),
    onSuccess: () => {
      toast.success('Is tamamlanmasi onaylandi');
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Onay islemi basarisiz');
    }
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id: number) => workOrdersApi.clearReport(id),
    onSuccess: () => {
      toast.success('Rapor silindi');
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Rapor silinemedi');
    }
  });

  const reopenMutation = useMutation({
    mutationFn: (id: number) => workOrdersApi.updateStatus(
      id,
      'DEVAM_EDIYOR',
      'Tamamlanan is emri yonetici tarafindan duzeltme icin geri yollandi'
    ),
    onSuccess: () => {
      toast.success('Is emri geri yollandi');
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Is emri geri yollanamadi');
    }
  });

  const handleReopenFromCompleted = (workOrder: WorkOrder) => {
    if (!confirm(`${workOrder.isEmriNo} kaydi DEVAM_EDIYOR durumuna geri yollansin mi?`)) return;
    reopenMutation.mutate(workOrder.id);
  };

  const handleDeleteReport = (workOrder: WorkOrder) => {
    if (!confirm(`${workOrder.isEmriNo} formu silinsin mi?`)) return;
    deleteReportMutation.mutate(workOrder.id);
  };

  const kanbanColumns: { key: IsEmriDurum; label: string; color: string }[] = [
    { key: 'BEKLEMEDE', label: 'Beklemede', color: 'bg-gray-500' },
    { key: 'ATANDI', label: 'Atandi', color: 'bg-blue-500' },
    { key: 'DEVAM_EDIYOR', label: 'Devam Ediyor', color: 'bg-yellow-500' },
    { key: 'ONAY_BEKLIYOR', label: 'Onay Bekliyor', color: 'bg-amber-500' },
    { key: 'TAMAMLANDI', label: 'Tamamlandi', color: 'bg-green-500' }
  ];

  const groupedOrders = useMemo(() => kanbanColumns.reduce((acc, col) => {
    acc[col.key] = workOrders?.filter((wo) => wo.durum === col.key) || [];
    return acc;
  }, {} as Record<IsEmriDurum, WorkOrder[]>), [workOrders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Is Emirleri</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary inline-flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Is Girisi
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Is emri no veya baslik ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={filterDurum} onChange={(e) => setFilterDurum(e.target.value)} className="input w-full md:w-44">
            <option value="">Tum Durumlar</option>
            {durumOptions.map((d) => (
              <option key={d} value={d}>{IsEmriDurumLabels[d]}</option>
            ))}
          </select>
          <select value={filterOncelik} onChange={(e) => setFilterOncelik(e.target.value)} className="input w-full md:w-40">
            <option value="">Tum Oncelikler</option>
            {oncelikOptions.map((o) => (
              <option key={o} value={o}>{OncelikLabels[o]}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {kanbanColumns.map((column) => (
            <div key={column.key} className="bg-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${column.color} mr-2`} />
                  <h3 className="font-semibold text-gray-900">{column.label}</h3>
                </div>
                <span className="badge badge-gray">{groupedOrders[column.key].length}</span>
              </div>
              <div className="space-y-3">
                {groupedOrders[column.key].map((wo) => (
                  <WorkOrderCard
                    key={wo.id}
                    workOrder={wo}
                    currentUser={currentUser}
                    onStatusChange={(id, durum) => statusMutation.mutate({ id, durum })}
                    onOpenReport={(selectedWorkOrder) => {
                      setIsReportReadOnly(false);
                      setReportWorkOrder(selectedWorkOrder);
                    }}
                    onViewReport={(selectedWorkOrder) => {
                      setIsReportReadOnly(true);
                      setReportWorkOrder(selectedWorkOrder);
                    }}
                    onApprove={(id) => approveMutation.mutate(id)}
                    onDeleteReport={handleDeleteReport}
                    onReopenFromCompleted={handleReopenFromCompleted}
                    approvingId={approveMutation.isPending ? (approveMutation.variables ?? null) : null}
                    reportPendingId={submitReportMutation.isPending ? (submitReportMutation.variables?.id ?? null) : null}
                    reportDeletingId={deleteReportMutation.isPending ? (deleteReportMutation.variables ?? null) : null}
                    reopeningId={reopenMutation.isPending ? (reopenMutation.variables ?? null) : null}
                  />
                ))}
                {groupedOrders[column.key].length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Is emri yok</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <WorkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        equipment={equipment || []}
        users={users || []}
        shifts={shifts || []}
        canAssign={canAssignWorkOrders}
      />

      <ExtendedReportModal
        isOpen={Boolean(reportWorkOrder)}
        workOrder={reportWorkOrder}
        readOnly={isReportReadOnly}
        onClose={() => {
          setReportWorkOrder(null);
          setIsReportReadOnly(false);
        }}
        onSubmit={(data) => {
          if (!reportWorkOrder) return;
          submitReportMutation.mutate({
            id: reportWorkOrder.id,
            reportContent: serializeReport(data)
          });
        }}
        isLoading={submitReportMutation.isPending}
      />
    </div>
  );
}
