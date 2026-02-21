import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BarChart3, Edit2, Plus, Search, UserCheck, UserX } from 'lucide-react';
import { appStateApi, jobEntriesApi, usersApi } from '../services/api';
import type {
  Departman,
  PersonnelPerformanceData,
  PersonnelPerformanceSummary,
  Role,
  User
} from '../types';
import { DepartmanLabels, RoleLabels } from '../types';
import { type Personel } from '../data/lists';
import type { CompletedJob } from '../types/jobEntries';
import { APP_STATE_KEYS, normalizeSettingsLists } from '../constants/appState';

const departmanOptions: Departman[] = [
  'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM EK BINA',
  'MEKANIK BAKIM',
  'ISK ELEKTRIK BAKIM',
  'ISK MEKANIK BAKIM',
  'ISK YARDIMCI TESISLER',
  'YARDIMCI TESISLER',
  'YONETIM'
];
const roleOptions: Role[] = ['ADMIN', 'BAKIM_MUDURU', 'BAKIM_SEFI', 'TEKNISYEN', 'OPERATOR'];

function mapBolumToDepartman(bolum: string): Departman {
  const normalized = bolum
    .toLocaleUpperCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const hasIsk = normalized.startsWith('ISK ');
  if (normalized.includes('YARDIMCI')) {
    return hasIsk ? 'ISK YARDIMCI TESISLER' : 'YARDIMCI TESISLER';
  }

  if (normalized.includes('ELEKTRIK')) {
    if (hasIsk) return 'ISK ELEKTRIK BAKIM';
    if (normalized.includes('EK BINA')) return 'ELEKTRIK BAKIM EK BINA';
    if (normalized.includes('ANA BINA')) return 'ELEKTRIK BAKIM ANA BINA';
    return 'ELEKTRIK BAKIM ANA BINA';
  }

  if (normalized.includes('MEKANIK')) {
    return hasIsk ? 'ISK MEKANIK BAKIM' : 'MEKANIK BAKIM';
  }

  if (normalized.includes('YON')) return 'YONETIM';

  return 'MEKANIK BAKIM';
}

function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toMonthValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '-';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} dk`;
  if (minutes === 0) return `${hours} sa`;
  return `${hours} sa ${minutes} dk`;
}

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{2})[:.](\d{2})$/.exec(value);
  if (!match) return null;

  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return (hour * 60) + minute;
}

function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  if (start === null || end === null) return 0;

  if (end > start) {
    return end - start;
  }

  return (24 * 60 - start) + end;
}

function extractShiftCode(value: string): string | null {
  const normalized = normalizeText(value);
  const patterns = [/vardiya\s*([0-9]+)/i, /([0-9]+)\s*vardiya/i];

  for (const pattern of patterns) {
    const match = pattern.exec(normalized);
    if (match) return match[1];
  }

  const fallback = /\b([1-9])\b/.exec(normalized);
  return fallback ? fallback[1] : null;
}

function extractShiftTimeRange(value: string): { start: string; end: string } | null {
  const match = /(\d{2}[:.]\d{2})\s*-\s*(\d{2}[:.]\d{2})/.exec(value);
  if (!match) return null;

  return {
    start: match[1].replace('.', ':'),
    end: match[2].replace('.', ':')
  };
}

function getShiftMatchKeys(value: string): string[] {
  const keys: string[] = [];
  const code = extractShiftCode(value);
  if (code) {
    keys.push(`code:${code}`);
  }

  const range = extractShiftTimeRange(value);
  if (range) {
    keys.push(`time:${range.start}-${range.end}`);
  }

  return keys;
}

function extractShiftDuration(value: string): number {
  const range = extractShiftTimeRange(value);
  if (!range) return 0;
  return calculateDurationMinutes(range.start, range.end);
}

function createEmptySummary(): PersonnelPerformanceSummary {
  return {
    completedWorkOrders: 0,
    completedMinutes: 0,
    availableMinutes: 0,
    workRate: 0,
    averageCompletionMinutes: 0
  };
}

function summarizeFromLocalWorks(
  works: CompletedJob[],
  includeDateInCapacityKey: boolean
): PersonnelPerformanceSummary {
  if (works.length === 0) return createEmptySummary();

  const completedWorkOrders = works.length;
  const completedMinutes = works.reduce((sum, work) => sum + (Number(work.sureDakika) || 0), 0);

  const capacityByKey = new Map<string, number>();
  works.forEach((work) => {
    const shiftKey = getShiftMatchKeys(work.vardiya)[0] || normalizeText(work.vardiya);
    const capacityKey = includeDateInCapacityKey ? `${work.tarih}-${shiftKey}` : shiftKey;

    if (!capacityByKey.has(capacityKey)) {
      capacityByKey.set(capacityKey, extractShiftDuration(work.vardiya));
    }
  });

  const availableMinutes = Array.from(capacityByKey.values())
    .reduce((sum, duration) => sum + duration, 0);

  return {
    completedWorkOrders,
    completedMinutes,
    availableMinutes,
    workRate: availableMinutes > 0 ? Math.round((completedMinutes / availableMinutes) * 100) : 0,
    averageCompletionMinutes: completedWorkOrders > 0 ? Math.round(completedMinutes / completedWorkOrders) : 0
  };
}

interface LocalPerformanceAggregate {
  daily: PersonnelPerformanceSummary;
  monthly: PersonnelPerformanceSummary;
  shifts: Map<string, PersonnelPerformanceSummary>;
}

function buildLocalPerformance(
  user: User,
  selectedDate: string,
  selectedMonth: string,
  completedWorks: CompletedJob[]
): LocalPerformanceAggregate {
  const targetName = normalizeText(`${user.ad} ${user.soyad}`);
  const targetSicilNo = user.sicilNo.trim();

  const personnelWorks = completedWorks.filter((work) =>
    work.personeller.some((person) => {
      const sicilMatch = person.sicilNo?.trim() === targetSicilNo;
      const nameMatch = normalizeText(person.adSoyad || '') === targetName;
      return sicilMatch || nameMatch;
    })
  );

  const dailyWorks = personnelWorks.filter((work) => work.tarih === selectedDate);
  const monthlyWorks = personnelWorks.filter((work) => work.tarih.startsWith(`${selectedMonth}-`));

  const shifts = new Map<string, PersonnelPerformanceSummary>();
  const groupedByShift = new Map<string, CompletedJob[]>();

  dailyWorks.forEach((work) => {
    const keys = getShiftMatchKeys(work.vardiya);
    const primaryKey = keys[0] || `raw:${normalizeText(work.vardiya)}`;

    const list = groupedByShift.get(primaryKey) || [];
    list.push(work);
    groupedByShift.set(primaryKey, list);
  });

  groupedByShift.forEach((shiftWorks, primaryKey) => {
    const summary = summarizeFromLocalWorks(shiftWorks, false);
    shifts.set(primaryKey, summary);

    const firstWork = shiftWorks[0];
    if (!firstWork) return;

    const aliases = getShiftMatchKeys(firstWork.vardiya);
    aliases.forEach((aliasKey) => {
      shifts.set(aliasKey, summary);
    });
  });

  return {
    daily: summarizeFromLocalWorks(dailyWorks, false),
    monthly: summarizeFromLocalWorks(monthlyWorks, true),
    shifts
  };
}

function mergeSummary(
  apiSummary: PersonnelPerformanceSummary,
  localSummary: PersonnelPerformanceSummary
): PersonnelPerformanceSummary {
  const completedWorkOrders = apiSummary.completedWorkOrders + localSummary.completedWorkOrders;
  const completedMinutes = apiSummary.completedMinutes + localSummary.completedMinutes;
  const availableMinutes = Math.max(apiSummary.availableMinutes, localSummary.availableMinutes);
  const weightedAvgTotal =
    (apiSummary.averageCompletionMinutes * apiSummary.completedWorkOrders) +
    (localSummary.averageCompletionMinutes * localSummary.completedWorkOrders);

  return {
    completedWorkOrders,
    completedMinutes,
    availableMinutes,
    workRate: availableMinutes > 0 ? Math.round((completedMinutes / availableMinutes) * 100) : 0,
    averageCompletionMinutes: completedWorkOrders > 0 ? Math.round(weightedAvgTotal / completedWorkOrders) : 0
  };
}

function mergePerformanceWithLocal(
  apiData: PersonnelPerformanceData,
  user: User,
  selectedDate: string,
  selectedMonth: string,
  completedWorks: CompletedJob[]
): PersonnelPerformanceData {
  const local = buildLocalPerformance(user, selectedDate, selectedMonth, completedWorks);

  return {
    ...apiData,
    daily: mergeSummary(apiData.daily, local.daily),
    monthly: mergeSummary(apiData.monthly, local.monthly),
    shifts: apiData.shifts.map((shift) => {
      const codeKey = extractShiftCode(shift.shiftName);
      const timeKey = `time:${shift.shiftStart}-${shift.shiftEnd}`;
      const localShift =
        (codeKey ? local.shifts.get(`code:${codeKey}`) : undefined) ||
        local.shifts.get(timeKey);

      if (!localShift) {
        return shift;
      }

      const merged = mergeSummary(shift, localShift);
      return {
        ...shift,
        ...merged,
        isScheduled: shift.isScheduled || localShift.availableMinutes > 0
      };
    })
  };
}

interface PersonnelFormData {
  sicilNo: string;
  ad: string;
  soyad: string;
  email: string;
  password?: string;
  telefon: string;
  departman: Departman;
  unvan: string;
  uzmanlikAlani: string;
  role: Role;
}

function PersonnelModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (data: PersonnelFormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<PersonnelFormData>({
    sicilNo: '',
    ad: '',
    soyad: '',
    email: '',
    password: '',
    telefon: '',
    departman: 'MEKANIK BAKIM',
    unvan: '',
    uzmanlikAlani: '',
    role: 'TEKNISYEN'
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      sicilNo: user?.sicilNo || '',
      ad: user?.ad || '',
      soyad: user?.soyad || '',
      email: user?.email || '',
      password: '',
      telefon: user?.telefon || '',
      departman: user?.departman || 'MEKANIK BAKIM',
      unvan: user?.unvan || '',
      uzmanlikAlani: user?.uzmanlikAlani || '',
      role: user?.role || 'TEKNISYEN'
    });
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {user ? 'Personel Duzenle' : 'Yeni Personel Ekle'}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(formData);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Sicil No</label>
                <input
                  type="text"
                  value={formData.sicilNo}
                  onChange={(e) => setFormData({ ...formData, sicilNo: e.target.value })}
                  className="input"
                  required
                  disabled={!!user}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Ad</label>
                <input
                  type="text"
                  value={formData.ad}
                  onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Soyad</label>
                <input
                  type="text"
                  value={formData.soyad}
                  onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>

            {!user && (
              <div>
                <label className="label">Sifre</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                  required={!user}
                  minLength={6}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Telefon</label>
                <input
                  type="text"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Unvan</label>
                <input
                  type="text"
                  value={formData.unvan}
                  onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Departman</label>
                <select
                  value={formData.departman}
                  onChange={(e) => setFormData({ ...formData, departman: e.target.value as Departman })}
                  className="input"
                >
                  {departmanOptions.map((d) => (
                    <option key={d} value={d}>{DepartmanLabels[d]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="input"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{RoleLabels[r]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Uzmanlik Alani</label>
              <input
                type="text"
                value={formData.uzmanlikAlani}
                onChange={(e) => setFormData({ ...formData, uzmanlikAlani: e.target.value })}
                className="input"
                placeholder="Orn: Hidrolik, PLC, Kaynak"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Iptal
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  summary,
  progressColor
}: {
  title: string;
  summary: PersonnelPerformanceSummary;
  progressColor: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xl font-bold text-gray-900">{summary.workRate}%</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full ${progressColor}`}
          style={{ width: `${clampPercent(summary.workRate)}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-gray-500">Tamamlanan is emri</p>
          <p className="text-lg font-semibold text-gray-900">{summary.completedWorkOrders}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-gray-500">Tamamlanan dakika</p>
          <p className="text-lg font-semibold text-gray-900">{formatMinutes(summary.completedMinutes)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-gray-500">Vardiya dakikasi</p>
          <p className="text-lg font-semibold text-gray-900">{formatMinutes(summary.availableMinutes)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-gray-500">Ort. is suresi</p>
          <p className="text-lg font-semibold text-gray-900">{formatMinutes(summary.averageCompletionMinutes)}</p>
        </div>
      </div>
    </div>
  );
}

function PersonnelPerformanceModal({
  isOpen,
  onClose,
  user,
  completedWorks
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  completedWorks: CompletedJob[];
}) {
  const [selectedDate, setSelectedDate] = useState(toDateValue(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(toMonthValue(new Date()));

  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    setSelectedDate(toDateValue(now));
    setSelectedMonth(toMonthValue(now));
  }, [isOpen, user?.id]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['personnel-performance', user?.id, selectedDate, selectedMonth],
    queryFn: async () => {
      if (!user) throw new Error('User is required');
      const response = await usersApi.getPerformance(user.id, {
        date: selectedDate,
        month: selectedMonth
      });
      return response.data.data as PersonnelPerformanceData;
    },
    enabled: isOpen && !!user && user.id > 0
  });

  const performanceData = useMemo(() => {
    if (!data || !user) return data;
    return mergePerformanceWithLocal(data, user, selectedDate, selectedMonth, completedWorks);
  }, [completedWorks, data, user, selectedDate, selectedMonth]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Personel Performansi</h2>
              <p className="text-sm text-gray-600">
                {user.ad} {user.soyad} ({user.sicilNo})
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary-700 bg-primary-50 px-3 py-2 rounded-lg">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Oran = tamamlanan is dakikasi / vardiya dakikasi</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Gun</label>
              <input
                type="date"
                className="input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Ay</label>
              <input
                type="month"
                className="input"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Performans yukleniyor...</div>
          ) : isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Performans verisi alinamadi.
            </div>
          ) : performanceData ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SummaryCard
                  title={`Gunluk (${performanceData.period.date})`}
                  summary={performanceData.daily}
                  progressColor="bg-green-500"
                />
                <SummaryCard
                  title={`Aylik (${performanceData.period.month})`}
                  summary={performanceData.monthly}
                  progressColor="bg-blue-500"
                />
              </div>

              <div className="card p-4">
                <h3 className="text-base font-semibold text-gray-900">Vardiya Bazli Gunluk Dakika Orani</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {performanceData.shifts.map((shift) => (
                    <div key={shift.shiftId} className="rounded-xl border border-gray-200 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: shift.color }}
                          />
                          <p className="font-medium text-gray-900">{shift.shiftName}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {shift.shiftStart} - {shift.shiftEnd}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600">Dakika orani</span>
                        <span className="text-sm font-semibold text-gray-900">{shift.workRate}%</span>
                      </div>

                      <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${clampPercent(shift.workRate)}%` }}
                        />
                      </div>

                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <p>{shift.completedWorkOrders} tamamlanan is emri</p>
                        <p>{formatMinutes(shift.completedMinutes)} / {formatMinutes(shift.availableMinutes)}</p>
                        {!shift.isScheduled && (
                          <p className="text-amber-600">Bu gunde vardiya atamasi yok</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="flex justify-end pt-2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Personnel() {
  const [search, setSearch] = useState('');
  const [filterDepartman, setFilterDepartman] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [localPersonelListesi, setLocalPersonelListesi] = useState<Personel[]>([]);
  const [completedWorks, setCompletedWorks] = useState<CompletedJob[]>([]);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [selectedPerformanceUser, setSelectedPerformanceUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadSharedPersonnel = async () => {
      try {
        const response = await appStateApi.get(APP_STATE_KEYS.settingsLists);
        const lists = normalizeSettingsLists(response.data?.data?.value);
        setLocalPersonelListesi(lists.personelListesi);
      } catch {
        setLocalPersonelListesi([]);
      }
    };

    void loadSharedPersonnel();
  }, []);

  useEffect(() => {
    const loadCompletedWorks = async () => {
      try {
        const response = await jobEntriesApi.getCompleted();
        const data = response.data?.data as CompletedJob[] | undefined;
        setCompletedWorks(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Tamamlanan is verileri yuklenemedi');
      }
    };

    void loadCompletedWorks();
  }, []);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.getAll();
      return response.data.data as User[];
    }
  });

  const displayUsers = (() => {
    const apiUsersBySicil = new Map((users || []).map((user) => [user.sicilNo, user]));

    return localPersonelListesi.map((personel, index) => {
      const matchedUser = apiUsersBySicil.get(personel.sicilNo);

      if (!matchedUser) {
        return {
          id: -(index + 1),
          sicilNo: personel.sicilNo,
          ad: personel.ad,
          soyad: personel.soyad,
          email: '',
          telefon: '',
          departman: mapBolumToDepartman(personel.bolum),
          unvan: '',
          uzmanlikAlani: '',
          role: 'TEKNISYEN',
          aktif: true,
          createdAt: new Date(0).toISOString()
        } as User;
      }

      return {
        ...matchedUser,
        sicilNo: personel.sicilNo,
        ad: personel.ad || matchedUser.ad,
        soyad: personel.soyad || matchedUser.soyad,
        departman: mapBolumToDepartman(personel.bolum)
      };
    });
  })();

  const filteredUsers = displayUsers.filter((user) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search ||
      user.ad.toLowerCase().includes(searchLower) ||
      user.soyad.toLowerCase().includes(searchLower) ||
      user.sicilNo.toLowerCase().includes(searchLower);

    const matchesDepartman = !filterDepartman || user.departman === filterDepartman;

    return matchesSearch && matchesDepartman;
  });

  const createMutation = useMutation({
    mutationFn: (data: PersonnelFormData) => usersApi.create(data),
    onSuccess: () => {
      toast.success('Personel olusturuldu');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Hata olustu');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PersonnelFormData> }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      toast.success('Personel guncellendi');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Hata olustu');
    }
  });

  const handleSubmit = (data: PersonnelFormData) => {
    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleOpenPerformance = (user: User) => {
    if (user.id <= 0) return;
    setSelectedPerformanceUser(user);
    setIsPerformanceModalOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersApi.update(user.id, { aktif: !user.aktif });
      toast.success(user.aktif ? 'Personel pasif yapildi' : 'Personel aktif yapildi');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      toast.error('Islem basarisiz');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personel Yonetimi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Satira tiklayarak personelin gunluk, aylik ve vardiya bazli calisma oranini goruntuleyin.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Personel
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ad, soyad veya sicil no ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterDepartman}
            onChange={(e) => setFilterDepartman(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="">Tum Departmanlar</option>
            {departmanOptions.map((d) => (
              <option key={d} value={d}>{DepartmanLabels[d]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sicil No</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ad Soyad</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Departman</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Unvan</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rol</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Durum</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Islemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Yukleniyor...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Personel bulunamadi
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`${user.id > 0 ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                    onClick={() => handleOpenPerformance(user)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {user.sicilNo}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.ad} {user.soyad}
                        </p>
                        <p className="text-xs text-gray-500">{user.email || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {DepartmanLabels[user.departman]}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.unvan || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-info">{RoleLabels[user.role]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.aktif ? 'badge-success' : 'badge-gray'}`}>
                        {user.aktif ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (user.id > 0) handleEdit(user);
                          }}
                          className={`p-2 text-gray-600 rounded-lg ${user.id > 0 ? 'hover:text-primary-600 hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                          title="Duzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (user.id > 0) handleToggleActive(user);
                          }}
                          className={`p-2 rounded-lg ${user.id > 0 ? (user.aktif ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50') : 'text-gray-400 cursor-not-allowed'}`}
                          title={user.aktif ? 'Pasif Yap' : 'Aktif Yap'}
                        >
                          {user.aktif ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PersonnelModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <PersonnelPerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => {
          setIsPerformanceModalOpen(false);
          setSelectedPerformanceUser(null);
        }}
        user={selectedPerformanceUser}
        completedWorks={completedWorks}
      />
    </div>
  );
}
