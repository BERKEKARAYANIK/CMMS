import { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Trash2, Save, RefreshCw } from 'lucide-react';
import {
  vardiyalar as defaultVardiyalar,
  mudahaleTurleri as defaultMudahaleTurleri,
  makinaListesi as defaultMakinaListesi,
  type Personel,
  type Vardiya,
  type MudahaleTuru,
  type Makina } from
'../data/lists';
import { appStateApi, jobEntriesApi } from '../services/api';
import type { CompletedJob, PlannedJob } from '../types/jobEntries';
import { useAuthStore } from '../store/authStore';
import { isBerkeUser, isSystemAdminUser } from '../utils/access';
import {
  APP_STATE_KEYS,
  buildDefaultSettingsLists,
  normalizeSettingsLists } from
'../constants/appState';

const PLANLANAN_TO_IS_EMRI_KEY = 'cmms_planlanan_is_to_is_emri';
const ISG_TO_IS_EMRI_KEY = 'cmms_isg_to_is_emri_transfer';
const TIME_STEP_MINUTES = 1;
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTE_OPTIONS = Array.from(
  { length: 60 / TIME_STEP_MINUTES },
  (_, index) => String(index * TIME_STEP_MINUTES).padStart(2, '0')
);
const WHEEL_ROW_HEIGHT = 44;
const WHEEL_VISIBLE_ROWS = 5;
const WHEEL_SPACER_HEIGHT = Math.floor(WHEEL_VISIBLE_ROWS / 2) * WHEEL_ROW_HEIGHT;
const WHEEL_SNAP_DEBOUNCE_MS = 90;
const DEPARTMENT_ALIAS_MAP: Record<string, string> = {
  'ELEKTRIK': 'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM': 'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM ANA BINA': 'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM EK BINA': 'ELEKTRIK BAKIM EK BINA',
  'ELEKTRIK BAKIM YARDIMCI TESISLER': 'YARDIMCI TESISLER',
  'ELEKTRIK YARDIMCI TESISLER': 'YARDIMCI TESISLER',
  'MEKANIK': 'MEKANIK BAKIM',
  'MEKANIK BAKIM': 'MEKANIK BAKIM',
  'ISK ELEKTRIK BAKIM': 'ISK ELEKTRIK BAKIM',
  'ISK ELEKTRIK BAKIM YARDIMCI TESISLER': 'ISK YARDIMCI TESISLER',
  'ISK ELEKTRIK YARDIMCI TESISLER': 'ISK YARDIMCI TESISLER',
  'ISK MEKANIK BAKIM': 'ISK MEKANIK BAKIM',
  'ISK YARDIMCI TESISLER': 'ISK YARDIMCI TESISLER',
  'YARDIMCI ISLETMELER': 'YARDIMCI TESISLER',
  'YARDIMCI TESISLER': 'YARDIMCI TESISLER',
  'YONETIM': 'YONETIM'
};

type TimeInterval = {
  start: number;
  end: number;
};

type IsgToIsEmriTransferPayload = {
  source: 'isg-unresolved';
  closeItemId: string;
  aciklama: string;
  reportId: string;
  reportLabel: string;
  year: string;
};

type IsgClosedItemsState = {
  closedItemIds: string[];
};

type MudahaleSelectionResult = {
  list: MudahaleTuru[];
  selectedLabel: string;
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

function roundMinuteToStep(minute: number): string {
  const rounded = Math.floor(minute / TIME_STEP_MINUTES) * TIME_STEP_MINUTES;
  return String(rounded).padStart(2, '0');
}

function parseTimeForPicker(value: string): {hour: string;minute: string;} {
  const [hourRaw, minuteRaw] = value.split(':');
  const parsedHour = Number.parseInt(hourRaw || '', 10);
  const parsedMinute = Number.parseInt(minuteRaw || '', 10);

  if (!Number.isNaN(parsedHour) && parsedHour >= 0 && parsedHour < 24 &&
  !Number.isNaN(parsedMinute) && parsedMinute >= 0 && parsedMinute < 60) {
    return {
      hour: String(parsedHour).padStart(2, '0'),
      minute: roundMinuteToStep(parsedMinute)
    };
  }

  const now = new Date();
  return {
    hour: String(now.getHours()).padStart(2, '0'),
    minute: roundMinuteToStep(now.getMinutes())
  };
}

function clampIndex(index: number, max: number): number {
  if (index < 0) return 0;
  if (index > max) return max;
  return index;
}

function normalizeDepartment(value: unknown): string {
  const key = String(value || '').
  toLocaleUpperCase('tr-TR').
  normalize('NFKD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/[^A-Z0-9]+/g, ' ').
  replace(/\s+/g, ' ').
  trim();

  if (!key) return '';
  return DEPARTMENT_ALIAS_MAP[key] || key;
}

function normalizeCompareText(value: unknown): string {
  return String(value || '').
  toLocaleUpperCase('tr-TR').
  normalize('NFKD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/[^A-Z0-9]+/g, ' ').
  replace(/\s+/g, ' ').
  trim();
}

function findMudahaleByKeywords(
mudahaleList: MudahaleTuru[],
keywords: string[])
: MudahaleTuru | null {
  if (!Array.isArray(mudahaleList) || mudahaleList.length === 0) return null;
  const normalizedKeywords = keywords.map((keyword) => normalizeCompareText(keyword));
  return mudahaleList.find((item) => {
    const text = normalizeCompareText(item.ad);
    return normalizedKeywords.every((keyword) => text.includes(keyword));
  }) || null;
}

function ensureMudahaleType(
mudahaleList: MudahaleTuru[],
desiredLabel: string,
desiredKeywords: string[],
fallbackKeywords: string[])
: MudahaleSelectionResult {
  const desired = findMudahaleByKeywords(mudahaleList, desiredKeywords);
  if (desired) {
    return { list: mudahaleList, selectedLabel: desired.ad };
  }

  const fallback = findMudahaleByKeywords(mudahaleList, fallbackKeywords);
  if (fallback) {
    return { list: mudahaleList, selectedLabel: fallback.ad };
  }

  const normalizedDesired = normalizeCompareText(desiredLabel);
  const existing = mudahaleList.find((item) => normalizeCompareText(item.ad) === normalizedDesired);
  if (existing) {
    return { list: mudahaleList, selectedLabel: existing.ad };
  }

  const appended: MudahaleTuru = {
    id: `AUTO_${normalizedDesired.replace(/\s+/g, '_')}`,
    ad: desiredLabel
  };
  return { list: [...mudahaleList, appended], selectedLabel: appended.ad };
}

function selectIsgMudahaleType(
reportId: string,
mudahaleList: MudahaleTuru[])
: MudahaleSelectionResult | null {
  const normalizedReportId = String(reportId || '').trim();
  if (!normalizedReportId) return null;

  if (normalizedReportId === 'capraz-denetim') {
    return ensureMudahaleType(
      mudahaleList,
      'Çapraz Denetim Uygunsuzluk Giderme',
      ['CAPRAZ', 'DENETIM', 'UYGUNSUZLUK', 'GIDERME'],
      ['UYGUNSUZLUK', 'GIDERME']
    );
  }

  if (normalizedReportId === 'uygunsuzluk-yillik') {
    return ensureMudahaleType(
      mudahaleList,
      'Uygunsuzluk Giderme',
      ['UYGUNSUZLUK', 'GIDERME'],
      ['UYGUNSUZLUK']
    );
  }

  return null;
}

function resolveDefaultCurrentPersonelSicil(
personeller: Personel[],
currentUserSicilNo: string,
currentUserFullName: string)
: string {
  const normalizedSicil = String(currentUserSicilNo || '').trim();
  if (!Array.isArray(personeller) || personeller.length === 0) return '';

  if (normalizedSicil) {
    const bySicil = personeller.find((personel) => String(personel.sicilNo || '').trim() === normalizedSicil);
    if (bySicil) return bySicil.sicilNo;
  }

  const normalizedUserName = normalizeCompareText(currentUserFullName);
  if (normalizedUserName) {
    const byName = personeller.find((personel) =>
    normalizeCompareText(personel.adSoyad || `${personel.ad || ''} ${personel.soyad || ''}`) === normalizedUserName
    );
    if (byName) return byName.sicilNo;
  }

  return '';
}

function filterPersonnelByDepartment(
personeller: Personel[],
activeDepartment: string,
canSeeAllPersonnel: boolean)
: Personel[] {
  if (canSeeAllPersonnel) return personeller;
  if (!activeDepartment) return [];
  return personeller.filter((personel) => normalizeDepartment(personel.bolum) === activeDepartment);
}

function normalizeIsgClosedItemsState(value: unknown): IsgClosedItemsState {
  let rawIds: unknown[] = [];

  if (Array.isArray(value)) {
    rawIds = value;
  } else if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    if (Array.isArray(source.closedItemIds)) {
      rawIds = source.closedItemIds;
    }
  }

  const closedItemIds = Array.from(
    new Set(
      rawIds.
      map((item) => String(item || '').trim()).
      filter(Boolean)
    )
  );

  return { closedItemIds };
}

function TimeWheelPicker({
  value,
  onChange,
  placeholder
}: {value: string;onChange: (value: string) => void;placeholder: string;}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [isHourScrolling, setIsHourScrolling] = useState(false);
  const [isMinuteScrolling, setIsMinuteScrolling] = useState(false);
  const hourRef = useRef<HTMLDivElement | null>(null);
  const minuteRef = useRef<HTMLDivElement | null>(null);
  const hourScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minuteScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalizedValue = /^([01]\d|2[0-3]):([0-5]\d)$/.test(value) ? value : '';

  const clearScrollTimeouts = () => {
    if (hourScrollTimeoutRef.current) {
      clearTimeout(hourScrollTimeoutRef.current);
      hourScrollTimeoutRef.current = null;
    }
    if (minuteScrollTimeoutRef.current) {
      clearTimeout(minuteScrollTimeoutRef.current);
      minuteScrollTimeoutRef.current = null;
    }
  };

  const scrollToIndex = (
    ref: HTMLDivElement | null,
    index: number,
    behavior: ScrollBehavior = 'smooth'
  ) => {
    if (!ref) return;
    ref.scrollTo({
      top: index * WHEEL_ROW_HEIGHT,
      behavior
    });
  };

  const getIndexFromScroll = (
    scroller: HTMLDivElement | null,
    optionsLength: number,
    fallbackValue: string,
    options: string[]
  ) => {
    if (!scroller) {
      const stateIndex = options.indexOf(fallbackValue);
      return clampIndex(stateIndex < 0 ? 0 : stateIndex, optionsLength - 1);
    }
    return clampIndex(
      Math.round(scroller.scrollTop / WHEEL_ROW_HEIGHT),
      optionsLength - 1
    );
  };

  const finalizeHourSelection = (behavior: ScrollBehavior = 'smooth') => {
    const index = getIndexFromScroll(
      hourRef.current,
      HOUR_OPTIONS.length,
      hour,
      HOUR_OPTIONS
    );
    const next = HOUR_OPTIONS[index] || '00';
    if (next !== hour) setHour(next);
    scrollToIndex(hourRef.current, index, behavior);
    return index;
  };

  const finalizeMinuteSelection = (behavior: ScrollBehavior = 'smooth') => {
    const index = getIndexFromScroll(
      minuteRef.current,
      MINUTE_OPTIONS.length,
      minute,
      MINUTE_OPTIONS
    );
    const next = MINUTE_OPTIONS[index] || '00';
    if (next !== minute) setMinute(next);
    scrollToIndex(minuteRef.current, index, behavior);
    return index;
  };

  const flushHourSelection = (behavior: ScrollBehavior = 'smooth') => {
    if (hourScrollTimeoutRef.current) {
      clearTimeout(hourScrollTimeoutRef.current);
      hourScrollTimeoutRef.current = null;
    }
    setIsHourScrolling(false);
    return finalizeHourSelection(behavior);
  };

  const flushMinuteSelection = (behavior: ScrollBehavior = 'smooth') => {
    if (minuteScrollTimeoutRef.current) {
      clearTimeout(minuteScrollTimeoutRef.current);
      minuteScrollTimeoutRef.current = null;
    }
    setIsMinuteScrolling(false);
    return finalizeMinuteSelection(behavior);
  };

  const handleHourScroll = () => {
    setIsHourScrolling(true);
    if (hourScrollTimeoutRef.current) {
      clearTimeout(hourScrollTimeoutRef.current);
    }
    hourScrollTimeoutRef.current = setTimeout(() => {
      setIsHourScrolling(false);
      finalizeHourSelection('smooth');
      hourScrollTimeoutRef.current = null;
    }, WHEEL_SNAP_DEBOUNCE_MS);
  };

  const handleMinuteScroll = () => {
    setIsMinuteScrolling(true);
    if (minuteScrollTimeoutRef.current) {
      clearTimeout(minuteScrollTimeoutRef.current);
    }
    minuteScrollTimeoutRef.current = setTimeout(() => {
      setIsMinuteScrolling(false);
      finalizeMinuteSelection('smooth');
      minuteScrollTimeoutRef.current = null;
    }, WHEEL_SNAP_DEBOUNCE_MS);
  };

  const openPicker = () => {
    const parsed = parseTimeForPicker(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setIsOpen(true);
  };

  const closePicker = () => {
    clearScrollTimeouts();
    setIsOpen(false);
  };

  const applyPicker = () => {
    clearScrollTimeouts();
    const hourIndex = finalizeHourSelection('auto');
    const minuteIndex = finalizeMinuteSelection('auto');
    const finalHour = HOUR_OPTIONS[hourIndex] || '00';
    const finalMinute = MINUTE_OPTIONS[minuteIndex] || '00';
    setHour(finalHour);
    setMinute(finalMinute);
    onChange(`${finalHour}:${finalMinute}`);
    setIsOpen(false);
  };

  const selectHour = (next: string) => {
    const index = HOUR_OPTIONS.indexOf(next);
    const safeIndex = clampIndex(index < 0 ? 0 : index, HOUR_OPTIONS.length - 1);
    setHour(HOUR_OPTIONS[safeIndex] || '00');
    scrollToIndex(hourRef.current, safeIndex, 'smooth');
  };

  const selectMinute = (next: string) => {
    const index = MINUTE_OPTIONS.indexOf(next);
    const safeIndex = clampIndex(index < 0 ? 0 : index, MINUTE_OPTIONS.length - 1);
    setMinute(MINUTE_OPTIONS[safeIndex] || '00');
    scrollToIndex(minuteRef.current, safeIndex, 'smooth');
  };

  useEffect(() => {
    if (!isOpen || isHourScrolling) return;
    const hourIndex = HOUR_OPTIONS.indexOf(hour);
    if (hourIndex >= 0) {
      scrollToIndex(hourRef.current, hourIndex, 'smooth');
    }
  }, [hour, isHourScrolling, isOpen]);

  useEffect(() => {
    if (!isOpen || isMinuteScrolling) return;
    const minuteIndex = MINUTE_OPTIONS.indexOf(minute);
    if (minuteIndex >= 0) {
      scrollToIndex(minuteRef.current, minuteIndex, 'smooth');
    }
  }, [isMinuteScrolling, isOpen, minute]);

  useEffect(() => {
    if (!isOpen) return;
    const hourIndex = HOUR_OPTIONS.indexOf(hour);
    const minuteIndex = MINUTE_OPTIONS.indexOf(minute);
    const rafId = requestAnimationFrame(() => {
      scrollToIndex(hourRef.current, hourIndex < 0 ? 0 : hourIndex, 'auto');
      scrollToIndex(minuteRef.current, minuteIndex < 0 ? 0 : minuteIndex, 'auto');
    });
    return () => cancelAnimationFrame(rafId);
  }, [hour, isOpen, minute]);

  useEffect(() => {
    return () => clearScrollTimeouts();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="w-full h-10 px-3 text-left bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {normalizedValue || placeholder}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <button
            type="button"
            aria-label="Kapat"
            className="absolute inset-0 bg-black/40"
            onClick={closePicker}
          />

          <div className="relative w-full max-w-[360px] rounded-2xl bg-white p-3 shadow-xl sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                onClick={closePicker}
              >
                Vazgec
              </button>
              <p className="text-sm font-semibold text-gray-800">Saat Secimi</p>
              <button
                type="button"
                className="rounded-md px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                onClick={applyPicker}
              >
                Tamam
              </button>
            </div>

            <div className="relative grid grid-cols-2 gap-2">
              <div
                className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 -translate-y-1/2 rounded-md border border-blue-200 bg-blue-50/50"
                style={{ height: `${WHEEL_ROW_HEIGHT}px` }}
              />

              <div
                ref={hourRef}
                onScroll={handleHourScroll}
                onMouseUp={() => flushHourSelection('smooth')}
                onTouchEnd={() => flushHourSelection('smooth')}
                className="overflow-y-auto rounded-md bg-gray-50 scrollbar-thin"
                style={{
                  height: `${WHEEL_ROW_HEIGHT * WHEEL_VISIBLE_ROWS}px`,
                  scrollSnapType: 'y mandatory',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div style={{ height: `${WHEEL_SPACER_HEIGHT}px` }} />
                {HOUR_OPTIONS.map((valueHour) => (
                  <button
                    key={`hour-${valueHour}`}
                    type="button"
                    onClick={() => selectHour(valueHour)}
                    className={`w-full px-2 text-center text-lg transition-colors ${
                      valueHour === hour ? 'font-semibold text-blue-700' : 'text-gray-600'
                    }`}
                    style={{
                      height: `${WHEEL_ROW_HEIGHT}px`,
                      scrollSnapAlign: 'center'
                    }}
                  >
                    {valueHour}
                  </button>
                ))}
                <div style={{ height: `${WHEEL_SPACER_HEIGHT}px` }} />
              </div>

              <div
                ref={minuteRef}
                onScroll={handleMinuteScroll}
                onMouseUp={() => flushMinuteSelection('smooth')}
                onTouchEnd={() => flushMinuteSelection('smooth')}
                className="overflow-y-auto rounded-md bg-gray-50 scrollbar-thin"
                style={{
                  height: `${WHEEL_ROW_HEIGHT * WHEEL_VISIBLE_ROWS}px`,
                  scrollSnapType: 'y mandatory',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div style={{ height: `${WHEEL_SPACER_HEIGHT}px` }} />
                {MINUTE_OPTIONS.map((valueMinute) => (
                  <button
                    key={`minute-${valueMinute}`}
                    type="button"
                    onClick={() => selectMinute(valueMinute)}
                    className={`w-full px-2 text-center text-lg transition-colors ${
                      valueMinute === minute ? 'font-semibold text-blue-700' : 'text-gray-600'
                    }`}
                    style={{
                      height: `${WHEEL_ROW_HEIGHT}px`,
                      scrollSnapAlign: 'center'
                    }}
                  >
                    {valueMinute}
                  </button>
                ))}
                <div style={{ height: `${WHEEL_SPACER_HEIGHT}px` }} />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-3 top-[48px] h-10 bg-gradient-to-b from-white via-white/80 to-transparent" />
            <div className="pointer-events-none absolute inset-x-3 bottom-3 h-10 bg-gradient-to-t from-white via-white/80 to-transparent" />
          </div>
        </div>
      )}
    </>
  );
}

export default function IsEmriGirisi() {
  const currentUser = useAuthStore((state) => state.user);
  const [vardiyalar, setVardiyalar] = useState<Vardiya[]>(defaultVardiyalar);
  const [mudahaleTurleri, setMudahaleTurleri] = useState<MudahaleTuru[]>(defaultMudahaleTurleri);
  const [personelListesi, setPersonelListesi] = useState<Personel[]>([]);
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
  const [pendingIsgCloseItemId, setPendingIsgCloseItemId] = useState<string | null>(null);

  const [selectedPersonel, setSelectedPersonel] = useState('');
  const [eklenenPersoneller, setEklenenPersoneller] = useState<Personel[]>([]);
  const currentUserSicilNo = String(currentUser?.sicilNo || '').trim();
  const currentUserFullName = `${String(currentUser?.ad || '').trim()} ${String(currentUser?.soyad || '').trim()}`.trim();

  const canSeeAllPersonnel = Boolean(
    currentUser && (isSystemAdminUser(currentUser) || isBerkeUser(currentUser))
  );
  const activeDepartment = useMemo(
    () => normalizeDepartment(currentUser?.departman),
    [currentUser?.departman]
  );
  const visiblePersonelListesi = useMemo(
    () => filterPersonnelByDepartment(personelListesi, activeDepartment, canSeeAllPersonnel),
    [activeDepartment, canSeeAllPersonnel, personelListesi]
  );
  const defaultSelectedCurrentPersonelSicil = useMemo(
    () => resolveDefaultCurrentPersonelSicil(visiblePersonelListesi, currentUserSicilNo, currentUserFullName),
    [currentUserFullName, currentUserSicilNo, visiblePersonelListesi]
  );

  const applyPlanlananToForm = (
  planned: PlannedJob,
  personnelSource: Personel[] = personelListesi) =>
  {
    const normalizedPlannedId = String(planned.id || '').trim();
    setPlanlananId(normalizedPlannedId || null);
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
      const fallbackLists = buildDefaultSettingsLists();

      try {
        setIsBootstrapping(true);
        const [completedResult, listsResult] = await Promise.allSettled([
        jobEntriesApi.getCompleted(),
        appStateApi.get(APP_STATE_KEYS.settingsLists)]
        );

        if (completedResult.status === 'fulfilled') {
          const completed = completedResult.value.data?.data as CompletedJob[] | undefined;
          setMevcutIsler(Array.isArray(completed) ? completed : []);
        } else {
          setMevcutIsler([]);
        }

        const normalizedLists = listsResult.status === 'fulfilled' ?
        normalizeSettingsLists(listsResult.value.data?.data?.value) :
        {
          vardiyalar: fallbackLists.vardiyalar,
          mudahaleTurleri: fallbackLists.mudahaleTurleri,
          personelListesi: [],
          makinaListesi: fallbackLists.makinaListesi
        };
        const visiblePersonnelFromSettings = filterPersonnelByDepartment(
          normalizedLists.personelListesi,
          activeDepartment,
          canSeeAllPersonnel
        );

        setVardiyalar(normalizedLists.vardiyalar);
        setMudahaleTurleri(normalizedLists.mudahaleTurleri);
        setPersonelListesi(normalizedLists.personelListesi);
        setMakinaListesi(normalizedLists.makinaListesi);

        if (listsResult.status === 'rejected') {
          toast.error('Merkezi personel listesi alinamadi');
        }

        const isgTransferRaw = sessionStorage.getItem(ISG_TO_IS_EMRI_KEY);
        if (isgTransferRaw) {
          try {
            const selected = JSON.parse(isgTransferRaw) as IsgToIsEmriTransferPayload;
            const closeItemId = String(selected?.closeItemId || '').trim();
            const transferAciklama = String(selected?.aciklama || '').trim();
            if (!closeItemId || !transferAciklama) {
              throw new Error('Invalid ISG transfer payload');
            }
            const mudahaleSelection = selectIsgMudahaleType(
              String(selected?.reportId || ''),
              normalizedLists.mudahaleTurleri
            );
            if (mudahaleSelection) {
              setMudahaleTurleri(mudahaleSelection.list);
              setMudahaleTuru(mudahaleSelection.selectedLabel);
            }

            setAciklama(transferAciklama);
            setPendingIsgCloseItemId(closeItemId);
            setPlanlananId(null);
          } catch {
            // ignore invalid ISG transfer payload
          }
          sessionStorage.removeItem(ISG_TO_IS_EMRI_KEY);
          return;
        }

        const transferRaw = sessionStorage.getItem(PLANLANAN_TO_IS_EMRI_KEY);
        if (transferRaw) {
          try {
            const selected = JSON.parse(transferRaw) as PlannedJob;
            if (!String(selected?.id || '').trim()) {
              throw new Error('Invalid planned transfer payload');
            }
            setPendingIsgCloseItemId(null);
            applyPlanlananToForm(selected, visiblePersonnelFromSettings);
          } catch {



            // ignore invalid transfer payload
          } finally {
            sessionStorage.removeItem(PLANLANAN_TO_IS_EMRI_KEY);
          }
          return;
        }

        // Form sadece "Is Girisine Aktar" akisi ile doldurulmali.
      } catch {
        setPersonelListesi([]);
        toast.error("Başlangıç verileri yüklenemedi");
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [activeDepartment, canSeeAllPersonnel]);

  useEffect(() => {
    setSelectedPersonel((prev) =>
    visiblePersonelListesi.some((personel) => personel.sicilNo === prev) ? prev : defaultSelectedCurrentPersonelSicil
    );
    setEklenenPersoneller((prev) =>
    prev.filter((personel) =>
    canSeeAllPersonnel ||
    normalizeDepartment(personel.bolum) === activeDepartment
    )
    );
  }, [
    activeDepartment,
    canSeeAllPersonnel,
    defaultSelectedCurrentPersonelSicil,
    visiblePersonelListesi
  ]);

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
    if (!selectedPersonel) {
      toast.error("Lütfen personel seçiniz");
      return;
    }

    const personel = visiblePersonelListesi.find((p) => p.sicilNo === selectedPersonel);
    if (!personel) {
      toast.error("Sadece kendi bölümünüzdeki personeller seçilebilir");
      return;
    }

    if (eklenenPersoneller.some((p) => p.sicilNo === personel.sicilNo)) {
      toast.error('Bu personel zaten eklenmis');
      return;
    }

    setEklenenPersoneller((prev) => [...prev, personel]);
    setSelectedPersonel(defaultSelectedCurrentPersonelSicil || '');
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
    setPlanlananId(null);
    setPendingIsgCloseItemId(null);
    sessionStorage.removeItem(PLANLANAN_TO_IS_EMRI_KEY);
    sessionStorage.removeItem(ISG_TO_IS_EMRI_KEY);
    setSelectedPersonel('');
    setEklenenPersoneller([]);
    toast.success('Form temizlendi');
  };

  const handleKaydet = async () => {
    if (!makina) {
      toast.error("Makine / Hat seçiniz");
      return;
    }
    if (!vardiya) {
      toast.error("Vardiya seçiniz");
      return;
    }
    if (!mudahaleTuru) {
      toast.error("Müdahale türü seçiniz");
      return;
    }
    if (!tarih) {
      toast.error('Tarih giriniz');
      return;
    }
    if (!baslangicSaati) {
      toast.error("Başlangıç saati giriniz");
      return;
    }
    if (!bitisSaati) {
      toast.error("Bitiş saati giriniz");
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

    const yeniIsAraligi = buildTimeInterval(tarih, baslangicSaati, bitisSaati);
    if (!yeniIsAraligi) {
      toast.error("Saat aralığı gecersiz");
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
          `${personel.adSoyad} için ${cakisanIs.tarih} ${cakisanIs.baslangicSaati}-${cakisanIs.bitisSaati} aralığında başka iş var`
        );
        return;
      }
    }

    try {
      setIsSaving(true);
      let effectivePlanlananId = planlananId;
      if (!effectivePlanlananId) {
        const transferRaw = sessionStorage.getItem(PLANLANAN_TO_IS_EMRI_KEY);
        if (transferRaw) {
          try {
            const selected = JSON.parse(transferRaw) as PlannedJob;
            const fallbackId = String(selected?.id || '').trim();
            effectivePlanlananId = fallbackId || null;
          } catch {
            effectivePlanlananId = null;
          }
        }
      }
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
        planlananIsRecordId: effectivePlanlananId || undefined,
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

      if (pendingIsgCloseItemId) {
        try {
          const response = await appStateApi.get(APP_STATE_KEYS.settingsIsgClosedItems);
          const currentState = normalizeIsgClosedItemsState(response.data?.data?.value);
          if (!currentState.closedItemIds.includes(pendingIsgCloseItemId)) {
            const nextState: IsgClosedItemsState = {
              closedItemIds: [...currentState.closedItemIds, pendingIsgCloseItemId]
            };
            await appStateApi.set(APP_STATE_KEYS.settingsIsgClosedItems, nextState);
          }
          setPendingIsgCloseItemId(null);
        } catch {
          toast.error('ISG uygunsuzluk kaydi kapanis listesine eklenemedi');
        }
      }

      if (effectivePlanlananId) {
        sessionStorage.removeItem(PLANLANAN_TO_IS_EMRI_KEY);
        setPlanlananId(null);
      }
      toast.success("İş girişi kaydedildi");
      handleTemizle();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "İş girişi kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">İş Girişi</h1>
        <p className="text-red-500 text-sm mb-6">* Tüm alanlar zorunludur ve denetime tabidir.</p>

        {isBootstrapping &&
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            Veriler yükleniyor...
          </div>
        }

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Makine / Hat Seçimi
              </label>
              <select
                value={makina}
                onChange={(e) => setMakina(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                
                <option value="">Seçiniz...</option>
                {makinaListesi.map((m) =>
                <option key={m.id} value={m.ad}>{m.ad}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Müdahale Türü
              </label>
              <select
                value={mudahaleTuru}
                onChange={(e) => setMudahaleTuru(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                
                <option value="">Seçiniz...</option>
                {mudahaleTurleri.map((m) =>
                <option key={m.id} value={m.ad}>{m.ad}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Başlangıç Saati
              </label>
              <TimeWheelPicker
                value={baslangicSaati}
                onChange={setBaslangicSaati}
                placeholder="Saat seçiniz..." />
              
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Müdahale Süresi (dk)
              </label>
              <input
                type="number"
                value={sureDakika}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700" />
              
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Müdahale Açıklaması
              </label>
              <textarea
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Yapilan işlem detaylarini yaziniz..." />
              
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
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                
                <option value="">Seçiniz...</option>
                {vardiyalar.map((v) =>
                <option key={v.id} value={`${v.ad} (${v.saat})`}>
                    {v.ad} ({v.saat})
                  </option>
                )}
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
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Bitiş Saati
              </label>
              <TimeWheelPicker
                value={bitisSaati}
                onChange={setBitisSaati}
                placeholder="Saat seçiniz..." />
              
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Personel Seç
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <select
                  value={selectedPersonel}
                  onChange={(e) => setSelectedPersonel(e.target.value)}
                  className="min-w-0 flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  
                  <option value="">Seçiniz...</option>
                  {visiblePersonelListesi.map((p) =>
                  <option key={p.sicilNo} value={p.sicilNo}>
                      {p.adSoyad} ({p.sicilNo}) - {p.bolum}
                    </option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={handlePersonelEkle}
                  className="w-full sm:w-24 shrink-0 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition-colors">
                  
                  EKLE
                </button>
              </div>
              {!canSeeAllPersonnel && visiblePersonelListesi.length === 0 &&
              <p className="mt-1 text-xs text-amber-700">
                  Kendi bölümünüzde seçilebilir personel bulunamadı.
                </p>
              }
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                PERSONEL
              </label>
              <div className="bg-white border border-gray-300 rounded-md min-h-[180px] max-h-[180px] overflow-y-auto">
                {eklenenPersoneller.length === 0 ?
                <div className="flex items-center justify-center h-[180px] text-gray-400 text-sm">
                    Personel eklenmedi
                  </div> :

                <div className="divide-y divide-gray-200">
                    {eklenenPersoneller.map((p) =>
                  <div key={p.sicilNo} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                        <span className="text-sm">
                          {p.adSoyad} ({p.sicilNo})
                        </span>
                        <button
                      type="button"
                      onClick={() => handlePersonelSil(p.sicilNo)}
                      className="text-red-500 hover:text-red-700 p-1">
                      
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                  )}
                  </div>
                }
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
            placeholder="Kullanilan malzemeleri yaziniz..." />
          
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <button
            type="button"
            onClick={handleTemizle}
            className="flex items-center gap-2 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition-colors">
            
            <RefreshCw className="w-5 h-5" />
            TEMIZLE
          </button>
          <button
            type="button"
            onClick={() => void handleKaydet()}
            disabled={isSaving || isBootstrapping}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-md transition-colors">
            
            <Save className="w-5 h-5" />
            {isSaving ? 'KAYDEDILIYOR...' : 'KAYDET'}
          </button>
        </div>
      </div>
    </div>);

}


