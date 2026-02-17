import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Trash2, Save, RefreshCw } from 'lucide-react';
import {
  vardiyalar as defaultVardiyalar,
  mudahaleTurleri as defaultMudahaleTurleri,
  personelListesi as defaultPersonelListesi,
  makinaListesi as defaultMakinaListesi,
  type Personel,
  type Vardiya,
  type MudahaleTuru,
  type Makina
} from '../data/lists';
import { appStateApi, jobEntriesApi } from '../services/api';
import type { CompletedJob, PlannedJob } from '../types/jobEntries';
import { APP_STATE_KEYS, normalizeSettingsLists } from '../constants/appState';
import { useAuthStore } from '../store/authStore';

const PLANLANAN_TO_IS_EMRI_KEY = 'cmms_planlanan_is_to_is_emri';

const DEPARTMENT_ALIAS_MAP: Record<string, string> = {
  'ELEKTRIK': 'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM': 'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM ANA BINA': 'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM EK BINA': 'ELEKTRIK BAKIM EK BINA',
  'MEKANIK': 'MEKANIK BAKIM',
  'MEKANIK BAKIM': 'MEKANIK BAKIM',
  'ISK ELEKTRIK BAKIM': 'ISK ELEKTRIK BAKIM',
  'ISK MEKANIK BAKIM': 'ISK MEKANIK BAKIM',
  'ISK YARDIMCI TESISLER': 'ISK YARDIMCI TESISLER',
  'YARDIMCI ISLETMELER': 'YARDIMCI TESISLER',
  'YARDIMCI TESISLER': 'YARDIMCI TESISLER',
  'YONETIM': 'YONETIM'
};

function normalizeDepartment(value: unknown): string {
  const key = String(value || '')
    .toLocaleUpperCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!key) return '';
  return DEPARTMENT_ALIAS_MAP[key] || key;
}

type TimeInterval = {
  start: number;
  end: number;
};

function buildTimeInterval(tarih: string, baslangic: string, bitis: string): TimeInterval | null {
  if (!tarih || !baslangic || !bitis) return null;

  const start = new Date(`${tarih}T${baslangic}:00`);
  const end = new Date(`${tarih}T${bitis}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const startMs = start.getTime();
  let endMs = end.getTime();

  if (endMs <= startMs) {
    endMs += 24 * 60 * 60 * 1000;
  }

  return { start: startMs, end: endMs };
}

function hasTimeOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return a.start < b.end && b.start < a.end;
}

export default function IsEmriGirisi() {
  const currentUser = useAuthStore((state) => state.user);
  const currentUserBolum = useMemo(
    () => normalizeDepartment(currentUser?.departman),
    [currentUser?.departman]
  );

  const [vardiyalar, setVardiyalar] = useState<Vardiya[]>(defaultVardiyalar);
  const [mudahaleTurleri, setMudahaleTurleri] = useState<MudahaleTuru[]>(defaultMudahaleTurleri);
  const [personelListesi, setPersonelListesi] = useState<Personel[]>(defaultPersonelListesi);
  const [makinaListesi, setMakinaListesi] = useState<Makina[]>(defaultMakinaListesi);

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mevcutIsler, setMevcutIsler] = useState<CompletedJob[]>([]);

  const [makina, setMakina] = useState('');
  const [vardiya, setVardiya] = useState('');
  const [mudahaleTuru, setMudahaleTuru] = useState('');
  const [tarih, setTarih] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [baslangicSaati, setBaslangicSaati] = useState('');
  const [bitisSaati, setBitisSaati] = useState('');
  const [sureDakika, setSureDakika] = useState<number>(0);
  const [aciklama, setAciklama] = useState('');
  const [malzeme, setMalzeme] = useState('');
  const [planlananId, setPlanlananId] = useState<string | null>(null);

  const [selectedPersonel, setSelectedPersonel] = useState('');
  const [eklenenPersoneller, setEklenenPersoneller] = useState<Personel[]>([]);

  const applyPlanlananToForm = (
    planned: PlannedJob,
    personnelSource: Personel[] = personelListesi
  ) => {
    setPlanlananId(planned.id);
    setMakina(planned.makina || '');
    setMudahaleTuru(planned.mudahaleTuru || '');
    setAciklama(planned.aciklama || '');
    setMalzeme(planned.malzeme || '');

    if (planned.atananSicilNo) {
      const atananPersonel = personnelSource.find((p) => p.sicilNo === planned.atananSicilNo);
      if (atananPersonel) {
        setEklenenPersoneller((prev) => {
          if (prev.some((p) => p.sicilNo === atananPersonel.sicilNo)) {
            return prev;
          }
          return [...prev, atananPersonel];
        });
      }
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsBootstrapping(true);
        const [completedResponse, plannedResponse, listsResponse] = await Promise.all([
          jobEntriesApi.getCompleted(),
          jobEntriesApi.getPlanned(),
          appStateApi.get(APP_STATE_KEYS.settingsLists)
        ]);

        const completed = completedResponse.data?.data as CompletedJob[] | undefined;
        setMevcutIsler(Array.isArray(completed) ? completed : []);

        const plannedJobs = plannedResponse.data?.data as PlannedJob[] | undefined;
        const plannedList = Array.isArray(plannedJobs) ? plannedJobs : [];
        const normalizedLists = normalizeSettingsLists(listsResponse.data?.data?.value);
        const scopedPersonelListesi = normalizedLists.personelListesi.filter(
          (personel) => normalizeDepartment(personel.bolum) === currentUserBolum
        );

        setVardiyalar(normalizedLists.vardiyalar);
        setMudahaleTurleri(normalizedLists.mudahaleTurleri);
        setPersonelListesi(scopedPersonelListesi);
        setMakinaListesi(normalizedLists.makinaListesi);

        const transferRaw = sessionStorage.getItem(PLANLANAN_TO_IS_EMRI_KEY);
        if (transferRaw) {
          try {
            const selected = JSON.parse(transferRaw) as PlannedJob;
            applyPlanlananToForm(selected, scopedPersonelListesi);
          } catch {
            // ignore invalid transfer payload
          } finally {
            sessionStorage.removeItem(PLANLANAN_TO_IS_EMRI_KEY);
          }
          return;
        }

        const firstPlanned = plannedList.find((item) => item.gorevTipi !== 'DURUS_RAPOR_ANALIZ');
        if (firstPlanned) {
          applyPlanlananToForm(firstPlanned, scopedPersonelListesi);
        }
      } catch {
        toast.error('Baslangic verileri yuklenemedi');
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [currentUserBolum]);

  useEffect(() => {
    if (baslangicSaati && bitisSaati) {
      const [basH, basM] = baslangicSaati.split(':').map(Number);
      const [bitH, bitM] = bitisSaati.split(':').map(Number);

      let basTotal = basH * 60 + basM;
      let bitTotal = bitH * 60 + bitM;

      if (bitTotal < basTotal) {
        bitTotal += 24 * 60;
      }

      const fark = bitTotal - basTotal;
      setSureDakika(fark > 0 ? fark : 0);
    }
  }, [baslangicSaati, bitisSaati]);

  const handlePersonelEkle = () => {
    if (!currentUserBolum) {
      toast.error('Kullanici bolumu tanimli degil');
      return;
    }

    if (!selectedPersonel) {
      toast.error('Lutfen personel seciniz');
      return;
    }

    const personel = personelListesi.find((p) => p.sicilNo === selectedPersonel);
    if (!personel) return;

    if (normalizeDepartment(personel.bolum) !== currentUserBolum) {
      toast.error('Sadece kendi bolumunuzden personel secilebilir');
      return;
    }

    if (eklenenPersoneller.some((p) => p.sicilNo === personel.sicilNo)) {
      toast.error('Bu personel zaten eklenmis');
      return;
    }

    setEklenenPersoneller((prev) => [...prev, personel]);
    setSelectedPersonel('');
    toast.success(`${personel.adSoyad} eklendi`);
  };

  const handlePersonelSil = (sicilNo: string) => {
    setEklenenPersoneller((prev) => prev.filter((p) => p.sicilNo !== sicilNo));
  };

  const handleTemizle = () => {
    setMakina('');
    setVardiya('');
    setMudahaleTuru('');
    setTarih(format(new Date(), 'yyyy-MM-dd'));
    setBaslangicSaati('');
    setBitisSaati('');
    setSureDakika(0);
    setAciklama('');
    setMalzeme('');
    setSelectedPersonel('');
    setEklenenPersoneller([]);
    toast.success('Form temizlendi');
  };

  const handleKaydet = async () => {
    if (!currentUserBolum) {
      toast.error('Kullanici bolumu tanimli degil');
      return;
    }

    if (!makina) {
      toast.error('Makine / Hat seciniz');
      return;
    }
    if (!vardiya) {
      toast.error('Vardiya seciniz');
      return;
    }
    if (!mudahaleTuru) {
      toast.error('Mudahale turu seciniz');
      return;
    }
    if (!tarih) {
      toast.error('Tarih giriniz');
      return;
    }
    if (!baslangicSaati) {
      toast.error('Baslangic saati giriniz');
      return;
    }
    if (!bitisSaati) {
      toast.error('Bitis saati giriniz');
      return;
    }
    if (eklenenPersoneller.length === 0) {
      toast.error('En az bir personel ekleyiniz');
      return;
    }

    const isBolumDisiPersonelVar = eklenenPersoneller.some(
      (personel) => normalizeDepartment(personel.bolum) !== currentUserBolum
    );
    if (isBolumDisiPersonelVar) {
      toast.error('Sadece kendi bolumunuzden personel ekleyebilirsiniz');
      return;
    }
    if (!aciklama.trim()) {
      toast.error('Mudahale aciklamasi giriniz');
      return;
    }

    const yeniIsAraligi = buildTimeInterval(tarih, baslangicSaati, bitisSaati);
    if (!yeniIsAraligi) {
      toast.error('Saat araligi gecersiz');
      return;
    }

    for (const personel of eklenenPersoneller) {
      const cakisanIs = mevcutIsler.find((isEmri) => {
        const personelBuIsteMi = isEmri.personeller?.some((p) => p.sicilNo === personel.sicilNo);
        if (!personelBuIsteMi) return false;

        const mevcutAralik = buildTimeInterval(
          isEmri.tarih,
          isEmri.baslangicSaati,
          isEmri.bitisSaati
        );
        if (!mevcutAralik) return false;

        return hasTimeOverlap(yeniIsAraligi, mevcutAralik);
      });

      if (cakisanIs) {
        toast.error(
          `${personel.adSoyad} icin ${cakisanIs.tarih} ${cakisanIs.baslangicSaati}-${cakisanIs.bitisSaati} araliginda baska is var`
        );
        return;
      }
    }

    try {
      setIsSaving(true);
      const response = await jobEntriesApi.createCompleted({
        tarih,
        vardiya,
        makina,
        mudahaleTuru,
        baslangicSaati,
        bitisSaati,
        sureDakika,
        aciklama: aciklama.trim(),
        malzeme: malzeme.trim(),
        personeller: eklenenPersoneller.map((p) => ({
          sicilNo: p.sicilNo,
          adSoyad: p.adSoyad,
          bolum: p.bolum
        }))
      });

      const created = response.data?.data as CompletedJob | undefined;
      if (!created) {
        throw new Error('Invalid response');
      }

      setMevcutIsler((prev) => [created, ...prev]);

      if (planlananId) {
        try {
          await jobEntriesApi.deletePlanned(planlananId);
        } catch {
          // planned item cleanup best effort
        }
        setPlanlananId(null);
      }

      toast.success('Is girisi kaydedildi');
      handleTemizle();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Is girisi kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Is Girisi</h1>
        <p className="text-red-500 text-sm mb-6">* Tum alanlar zorunludur ve denetime tabidir.</p>

        {isBootstrapping && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            Veriler yukleniyor...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Makine / Hat Secimi
              </label>
              <select
                value={makina}
                onChange={(e) => setMakina(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seciniz...</option>
                {makinaListesi.map((m) => (
                  <option key={m.id} value={m.ad}>{m.ad}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mudahale Turu
              </label>
              <select
                value={mudahaleTuru}
                onChange={(e) => setMudahaleTuru(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seciniz...</option>
                {mudahaleTurleri.map((m) => (
                  <option key={m.id} value={m.ad}>{m.ad}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Baslangic Saati
              </label>
              <input
                type="time"
                value={baslangicSaati}
                onChange={(e) => setBaslangicSaati(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mudahale Suresi (dk)
              </label>
              <input
                type="number"
                value={sureDakika}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mudahale Aciklamasi
              </label>
              <textarea
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Yapilan islem detaylarini yaziniz..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Vardiya
              </label>
              <select
                value={vardiya}
                onChange={(e) => setVardiya(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seciniz...</option>
                {vardiyalar.map((v) => (
                  <option key={v.id} value={`${v.ad} (${v.saat})`}>
                    {v.ad} ({v.saat})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tarih
              </label>
              <input
                type="date"
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Bitis Saati
              </label>
              <input
                type="time"
                value={bitisSaati}
                onChange={(e) => setBitisSaati(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Personel Sec
              </label>
              <p className="mb-2 text-xs text-gray-500">
                Aktif bolum: {currentUserBolum || 'Tanimsiz'}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <select
                  value={selectedPersonel}
                  onChange={(e) => setSelectedPersonel(e.target.value)}
                  className="min-w-0 flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seciniz...</option>
                  {personelListesi.map((p) => (
                    <option key={p.sicilNo} value={p.sicilNo}>
                      {p.adSoyad} ({p.sicilNo}) - {p.bolum}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handlePersonelEkle}
                  className="w-full sm:w-24 shrink-0 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition-colors"
                >
                  EKLE
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                PERSONEL
              </label>
              <div className="bg-white border border-gray-300 rounded-md min-h-[180px] max-h-[180px] overflow-y-auto">
                {eklenenPersoneller.length === 0 ? (
                  <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">
                    Personel eklenmedi
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {eklenenPersoneller.map((p) => (
                      <div key={p.sicilNo} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                        <span className="text-sm">
                          {p.adSoyad} ({p.sicilNo})
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePersonelSil(p.sicilNo)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Kullanilan Malzeme
          </label>
          <textarea
            value={malzeme}
            onChange={(e) => setMalzeme(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Kullanilan malzemeleri yaziniz..."
          />
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <button
            type="button"
            onClick={handleTemizle}
            className="flex items-center gap-2 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            TEMIZLE
          </button>
          <button
            type="button"
            onClick={() => void handleKaydet()}
            disabled={isSaving || isBootstrapping}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-md transition-colors"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'KAYDEDILIYOR...' : 'KAYDET'}
          </button>
        </div>
      </div>
    </div>
  );
}
