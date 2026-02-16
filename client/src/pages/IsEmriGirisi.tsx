import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Trash2, Save, RefreshCw } from 'lucide-react';
import {
  vardiyalar as defaultVardiyalar,
  mudahaleTurleri as defaultMudahaleTurleri,
  personelListesi as defaultPersonelListesi,
  makinaListesi as defaultMakinaListesi,
  type IsEmri,
  type Personel,
  type Vardiya,
  type MudahaleTuru,
  type Makina
} from '../data/lists';

// LocalStorage keys
const STORAGE_KEY = 'cmms_tamamlanan_isler';
const PLANLANAN_STORAGE_KEY = 'cmms_planlanan_isler';
const KEYS = {
  vardiyalar: 'cmms_vardiyalar',
  mudahaleTurleri: 'cmms_mudahale_turleri',
  personelListesi: 'cmms_personel_listesi',
  makinaListesi: 'cmms_makina_listesi'
};

// LocalStorage helper
function getFromStorage<T>(key: string, defaultValue: T[]): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// Tamamlanan işleri localStorage'dan al
function getTamamlananIsler(): IsEmri[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Tamamlanan işleri localStorage'a kaydet
function saveTamamlananIsler(isler: IsEmri[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(isler));
}

function getNextIsEmriId(tarih: string, isler: IsEmri[]): string {
  const dateStr = tarih.replace(/-/g, '').slice(0, 8);
  const prefix = `${dateStr}-`;
  let maxSeq = 0;

  isler.forEach((isEmri) => {
    if (!isEmri.id.startsWith(prefix)) return;
    const suffix = isEmri.id.slice(prefix.length);
    const seq = parseInt(suffix, 10);
    if (!Number.isNaN(seq)) {
      maxSeq = Math.max(maxSeq, seq);
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `${dateStr}-${nextSeq}`;
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
  const [vardiyalar] = useState<Vardiya[]>(() =>
    getFromStorage(KEYS.vardiyalar, defaultVardiyalar)
  );
  const [mudahaleTurleri] = useState<MudahaleTuru[]>(() =>
    getFromStorage(KEYS.mudahaleTurleri, defaultMudahaleTurleri)
  );
  const [personelListesi] = useState<Personel[]>(() =>
    getFromStorage(KEYS.personelListesi, defaultPersonelListesi)
  );
  const [makinaListesi] = useState<Makina[]>(() =>
    getFromStorage(KEYS.makinaListesi, defaultMakinaListesi)
  );

  // Form state
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

  useEffect(() => {
    const data = localStorage.getItem('cmms_planlanan_is_to_is_emri');
    if (!data) return;

    try {
      const parsed = JSON.parse(data) as {
        id?: string;
        makina?: string;
        mudahaleTuru?: string;
        aciklama?: string;
        malzeme?: string;
        atananSicilNo?: string;
      };

      if (parsed.id) setPlanlananId(parsed.id);
      if (parsed.makina) setMakina(parsed.makina);
      if (parsed.mudahaleTuru) setMudahaleTuru(parsed.mudahaleTuru);
      if (parsed.aciklama) setAciklama(parsed.aciklama);
      if (parsed.malzeme) setMalzeme(parsed.malzeme);
      if (parsed.atananSicilNo) {
        const atananPersonel = personelListesi.find((p) => p.sicilNo === parsed.atananSicilNo);
        if (atananPersonel) {
          setEklenenPersoneller((prev) => {
            if (prev.some((p) => p.sicilNo === atananPersonel.sicilNo)) {
              return prev;
            }
            return [...prev, atananPersonel];
          });
        }
      }
    } catch {
      // ignore parse errors
    } finally {
      localStorage.removeItem('cmms_planlanan_is_to_is_emri');
    }
  }, []);

  // Personel state
  const [selectedPersonel, setSelectedPersonel] = useState('');
  const [eklenenPersoneller, setEklenenPersoneller] = useState<Personel[]>([]);

  // Süre otomatik hesaplama
  useEffect(() => {
    if (baslangicSaati && bitisSaati) {
      const [basH, basM] = baslangicSaati.split(':').map(Number);
      const [bitH, bitM] = bitisSaati.split(':').map(Number);

      let basTotal = basH * 60 + basM;
      let bitTotal = bitH * 60 + bitM;

      // Gece vardiyası için (bitiş < başlangıç ise bir sonraki güne geçmiş)
      if (bitTotal < basTotal) {
        bitTotal += 24 * 60;
      }

      const fark = bitTotal - basTotal;
      setSureDakika(fark > 0 ? fark : 0);
    }
  }, [baslangicSaati, bitisSaati]);

  // Personel ekle
  const handlePersonelEkle = () => {
    if (!selectedPersonel) {
      toast.error('Lütfen personel seçiniz');
      return;
    }

    const personel = personelListesi.find(p => p.sicilNo === selectedPersonel);
    if (!personel) return;

    // Zaten eklenmişse uyar
    if (eklenenPersoneller.some(p => p.sicilNo === personel.sicilNo)) {
      toast.error('Bu personel zaten eklenmiş');
      return;
    }

    setEklenenPersoneller([...eklenenPersoneller, personel]);
    setSelectedPersonel('');
    toast.success(`${personel.adSoyad} eklendi`);
  };

  // Personel sil
  const handlePersonelSil = (sicilNo: string) => {
    setEklenenPersoneller(eklenenPersoneller.filter(p => p.sicilNo !== sicilNo));
  };

  // Formu temizle
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

  // Kaydet
  const handleKaydet = () => {
    // Validasyon
    if (!makina) {
      toast.error('Makine / Hat seçiniz');
      return;
    }
    if (!vardiya) {
      toast.error('Vardiya seçiniz');
      return;
    }
    if (!mudahaleTuru) {
      toast.error('Müdahale türü seçiniz');
      return;
    }
    if (!tarih) {
      toast.error('Tarih giriniz');
      return;
    }
    if (!baslangicSaati) {
      toast.error('Başlangıç saati giriniz');
      return;
    }
    if (!bitisSaati) {
      toast.error('Bitiş saati giriniz');
      return;
    }
    if (eklenenPersoneller.length === 0) {
      toast.error('En az bir personel ekleyiniz');
      return;
    }
    if (!aciklama.trim()) {
      toast.error('Müdahale açıklaması giriniz');
      return;
    }

    // Yeni iş emri oluştur
    const mevcutIsler = getTamamlananIsler();
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

    const yeniIsEmri: IsEmri = {
      id: getNextIsEmriId(tarih, mevcutIsler),
      tarih,
      vardiya,
      makina,
      mudahaleTuru,
      baslangicSaati,
      bitisSaati,
      sureDakika,
      aciklama,
      malzeme,
      personeller: eklenenPersoneller.map(p => ({
        sicilNo: p.sicilNo,
        adSoyad: p.adSoyad,
        bolum: p.bolum
      })),
      createdAt: new Date().toISOString()
    };

    // LocalStorage'a kaydet
    saveTamamlananIsler([yeniIsEmri, ...mevcutIsler]);
    if (planlananId) {
      const planlananRaw = localStorage.getItem(PLANLANAN_STORAGE_KEY);
      const planlananList = planlananRaw ? JSON.parse(planlananRaw) : [];
      const yeniPlanlanan = planlananList.filter((is: { id: string }) => is.id !== planlananId);
      localStorage.setItem(PLANLANAN_STORAGE_KEY, JSON.stringify(yeniPlanlanan));
      setPlanlananId(null);
    }

    toast.success('İş emri kaydedildi!');
    handleTemizle();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yeni İş Emri Girişi</h1>
        <p className="text-red-500 text-sm mb-6">* Tüm alanlar zorunludur ve denetime tabidir.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sol Kolon */}
          <div className="space-y-4">
            {/* Makine / Hat Seçimi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Makine / Hat Seçimi
              </label>
              <select
                value={makina}
                onChange={(e) => setMakina(e.target.value)}
                className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seçiniz...</option>
                {makinaListesi.map((m) => (
                  <option key={m.id} value={m.ad}>{m.ad}</option>
                ))}
              </select>
            </div>

            {/* Müdahale Türü */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Müdahale Türü
              </label>
              <select
                value={mudahaleTuru}
                onChange={(e) => setMudahaleTuru(e.target.value)}
                className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seçiniz...</option>
                {mudahaleTurleri.map((m) => (
                  <option key={m.id} value={m.ad}>{m.ad}</option>
                ))}
              </select>
            </div>

            {/* Başlangıç Saati */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Başlangıç Saati
              </label>
              <input
                type="time"
                value={baslangicSaati}
                onChange={(e) => setBaslangicSaati(e.target.value)}
                className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Müdahale Süresi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Müdahale Süresi (dk)
              </label>
              <input
                type="number"
                value={sureDakika}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700"
              />
            </div>

            {/* Müdahale Açıklaması */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Müdahale Açıklaması
              </label>
              <textarea
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Yapılan işlem detaylarını yazınız..."
              />
            </div>
          </div>

          {/* Sağ Kolon */}
          <div className="space-y-4">
            {/* Vardiya */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Vardiya
              </label>
              <select
                value={vardiya}
                onChange={(e) => setVardiya(e.target.value)}
                className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seçiniz...</option>
                {vardiyalar.map((v) => (
                  <option key={v.id} value={`${v.ad} (${v.saat})`}>
                    {v.ad} ({v.saat})
                  </option>
                ))}
              </select>
            </div>

            {/* Tarih */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tarih
              </label>
              <input
                type="date"
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
                className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Bitiş Saati */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Bitiş Saati
              </label>
              <input
                type="time"
                value={bitisSaati}
                onChange={(e) => setBitisSaati(e.target.value)}
                className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Personel Seç */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Personel Seç
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedPersonel}
                  onChange={(e) => setSelectedPersonel(e.target.value)}
                  className="flex-1 px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seçiniz...</option>
                  {personelListesi.map((p) => (
                    <option key={p.sicilNo} value={p.sicilNo}>
                      {p.adSoyad} ({p.sicilNo}) - {p.bolum}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handlePersonelEkle}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition-colors"
                >
                  EKLE
                </button>
              </div>
            </div>

            {/* Personel Listesi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                PERSONEL
              </label>
              <div className="bg-yellow-50 border border-gray-300 rounded-md min-h-[180px] max-h-[180px] overflow-y-auto">
                {eklenenPersoneller.length === 0 ? (
                  <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">
                    Personel eklenmedi
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {eklenenPersoneller.map((p) => (
                      <div key={p.sicilNo} className="flex items-center justify-between px-3 py-2 hover:bg-yellow-100">
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

        {/* Kullanılan Malzeme - Tam Genişlik */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Kullanılan Malzeme
          </label>
          <textarea
            value={malzeme}
            onChange={(e) => setMalzeme(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-yellow-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Kullanılan malzemeleri yazınız..."
          />
        </div>

        {/* Butonlar */}
        <div className="flex justify-center gap-6 mt-8">
          <button
            type="button"
            onClick={handleTemizle}
            className="flex items-center gap-2 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            TEMİZLE
          </button>
          <button
            type="button"
            onClick={handleKaydet}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
          >
            <Save className="w-5 h-5" />
            KAYDET
          </button>
        </div>
      </div>
    </div>
  );
}
