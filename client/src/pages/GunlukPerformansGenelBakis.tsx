import { useEffect, useMemo, useState } from 'react';
import type { IsEmri as LocalCompletedWork } from '../data/lists';

const STORAGE_KEY = 'cmms_tamamlanan_isler';

interface PersonOption {
  key: string;
  sicilNo: string;
  adSoyad: string;
}

interface PersonDayStat {
  sicilNo: string;
  adSoyad: string;
  completedWorkOrders: number;
  completedMinutes: number;
  availableMinutes: number;
  workRate: number;
}

interface DayOverview {
  date: string;
  personnelCount: number;
  completedWorkOrders: number;
  completedMinutes: number;
  availableMinutes: number;
  workRate: number;
  personnel: PersonDayStat[];
}

interface MonthData {
  monthDates: string[];
  dayMap: Map<string, DayOverview>;
  personOptions: PersonOption[];
  personDayMap: Map<string, Map<string, PersonDayStat>>;
  personTotals: Map<string, PersonDayStat>;
  overall: {
    uniquePersonnelCount: number;
    completedWorkOrders: number;
    completedMinutes: number;
    availableMinutes: number;
    workRate: number;
  };
}

const WEEKDAY_FULL = ['Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi', 'Pazar'];

function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function toMonthValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseMonthValue(value: string): { year: number; monthIndex: number } {
  const [yearText, monthText] = value.split('-');
  const year = Number.parseInt(yearText || '0', 10);
  const month = Number.parseInt(monthText || '1', 10);
  return {
    year,
    monthIndex: Math.max(0, Math.min(11, month - 1))
  };
}

function monthTitle(monthValue: string, uppercase = false): string {
  const { year, monthIndex } = parseMonthValue(monthValue);
  const date = new Date(year, monthIndex, 1);
  const label = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(date);
  return uppercase ? label.toLocaleUpperCase('tr-TR') : label;
}

function buildMonthDates(selectedMonth: string): string[] {
  const { year, monthIndex } = parseMonthValue(selectedMonth);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const dates: string[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayText = String(day).padStart(2, '0');
    const monthText = String(monthIndex + 1).padStart(2, '0');
    dates.push(`${year}-${monthText}-${dayText}`);
  }

  return dates;
}

function buildCalendarCells(selectedMonth: string, fixedSixWeeks = false): Array<string | null> {
  const monthDates = buildMonthDates(selectedMonth);
  const { year, monthIndex } = parseMonthValue(selectedMonth);
  const firstDate = new Date(year, monthIndex, 1);
  const firstWeekPadCount = (firstDate.getDay() + 6) % 7;

  const cells: Array<string | null> = [];
  for (let i = 0; i < firstWeekPadCount; i += 1) {
    cells.push(null);
  }

  monthDates.forEach((date) => cells.push(date));

  if (fixedSixWeeks) {
    while (cells.length < 42) {
      cells.push(null);
    }
    return cells;
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function chunkWeeks(cells: Array<string | null>): Array<Array<string | null>> {
  const weeks: Array<Array<string | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
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
  if (end > start) return end - start;
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

function getShiftKey(value: string): string {
  const code = extractShiftCode(value);
  const range = extractShiftTimeRange(value);

  if (code && range) return `code:${code}|${range.start}-${range.end}`;
  if (code) return `code:${code}`;
  if (range) return `time:${range.start}-${range.end}`;
  return `raw:${normalizeText(value)}`;
}

function getShiftDuration(value: string): number {
  const range = extractShiftTimeRange(value);
  if (!range) return 480;
  const duration = calculateDurationMinutes(range.start, range.end);
  return duration > 0 ? duration : 480;
}

function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 dk';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} dk`;
  if (minutes === 0) return `${hours} sa`;
  return `${hours} sa ${minutes} dk`;
}

function readCompletedWorks(): LocalCompletedWork[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as LocalCompletedWork[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createEmptyPersonDayStat(sicilNo = '-', adSoyad = '-'): PersonDayStat {
  return {
    sicilNo,
    adSoyad,
    completedWorkOrders: 0,
    completedMinutes: 0,
    availableMinutes: 0,
    workRate: 0
  };
}

function personMatchesFilter(
  person: { sicilNo: string; adSoyad: string },
  selectedPersonKey: string
): boolean {
  if (selectedPersonKey === 'ALL') return true;

  if (selectedPersonKey.startsWith('sicil:')) {
    return person.sicilNo === selectedPersonKey.slice('sicil:'.length);
  }

  if (selectedPersonKey.startsWith('name:')) {
    return `name:${normalizeText(person.adSoyad || '')}` === selectedPersonKey;
  }

  return false;
}

function mergePersonStat(
  current: PersonDayStat,
  deltaWorkOrders: number,
  deltaMinutes: number,
  deltaAvailable: number
): PersonDayStat {
  const completedWorkOrders = current.completedWorkOrders + deltaWorkOrders;
  const completedMinutes = current.completedMinutes + deltaMinutes;
  const availableMinutes = current.availableMinutes + deltaAvailable;

  return {
    ...current,
    completedWorkOrders,
    completedMinutes,
    availableMinutes,
    workRate: availableMinutes > 0 ? Math.round((completedMinutes / availableMinutes) * 100) : 0
  };
}

interface RawPersonDayAccumulator {
  sicilNo: string;
  adSoyad: string;
  completedWorkOrders: number;
  completedMinutes: number;
  shiftCapacityByKey: Map<string, number>;
}

function buildMonthData(selectedMonth: string): MonthData {
  const monthDates = buildMonthDates(selectedMonth);
  const works = readCompletedWorks().filter((work) => work.tarih.startsWith(`${selectedMonth}-`));

  const personInfoMap = new Map<string, PersonOption>();
  const dayPersonMap = new Map<string, Map<string, RawPersonDayAccumulator>>();

  works.forEach((work) => {
    const dayKey = work.tarih;
    const personMap = dayPersonMap.get(dayKey) || new Map<string, RawPersonDayAccumulator>();

    work.personeller.forEach((person) => {
      const personKey = person.sicilNo
        ? `sicil:${person.sicilNo}`
        : `name:${normalizeText(person.adSoyad || '')}`;

      if (!personInfoMap.has(personKey)) {
        personInfoMap.set(personKey, {
          key: personKey,
          sicilNo: person.sicilNo || '-',
          adSoyad: person.adSoyad || '-'
        });
      }

      const current = personMap.get(personKey) || {
        sicilNo: person.sicilNo || '-',
        adSoyad: person.adSoyad || '-',
        completedWorkOrders: 0,
        completedMinutes: 0,
        shiftCapacityByKey: new Map<string, number>()
      };

      const completedMinutes = Number(work.sureDakika) || 0;
      current.completedWorkOrders += 1;
      current.completedMinutes += completedMinutes;

      const shiftKey = getShiftKey(work.vardiya || '');
      if (!current.shiftCapacityByKey.has(shiftKey)) {
        current.shiftCapacityByKey.set(shiftKey, getShiftDuration(work.vardiya || ''));
      }

      personMap.set(personKey, current);
    });

    dayPersonMap.set(dayKey, personMap);
  });

  const dayMap = new Map<string, DayOverview>();
  const personDayMap = new Map<string, Map<string, PersonDayStat>>();
  const personTotals = new Map<string, PersonDayStat>();

  monthDates.forEach((date) => {
    const rawPersonMap = dayPersonMap.get(date) || new Map<string, RawPersonDayAccumulator>();
    const personnel: PersonDayStat[] = Array.from(rawPersonMap.entries())
      .map(([personKey, raw]) => {
        const availableMinutes = Array.from(raw.shiftCapacityByKey.values())
          .reduce((sum, minutes) => sum + minutes, 0);

        const stat: PersonDayStat = {
          sicilNo: raw.sicilNo,
          adSoyad: raw.adSoyad,
          completedWorkOrders: raw.completedWorkOrders,
          completedMinutes: raw.completedMinutes,
          availableMinutes,
          workRate: availableMinutes > 0
            ? Math.round((raw.completedMinutes / availableMinutes) * 100)
            : 0
        };

        const byDay = personDayMap.get(personKey) || new Map<string, PersonDayStat>();
        byDay.set(date, stat);
        personDayMap.set(personKey, byDay);

        const currentTotal = personTotals.get(personKey) || createEmptyPersonDayStat(raw.sicilNo, raw.adSoyad);
        personTotals.set(
          personKey,
          mergePersonStat(currentTotal, stat.completedWorkOrders, stat.completedMinutes, stat.availableMinutes)
        );

        return stat;
      })
      .sort((a, b) => b.workRate - a.workRate || b.completedMinutes - a.completedMinutes);

    const completedWorkOrders = personnel.reduce((sum, person) => sum + person.completedWorkOrders, 0);
    const completedMinutes = personnel.reduce((sum, person) => sum + person.completedMinutes, 0);
    const availableMinutes = personnel.reduce((sum, person) => sum + person.availableMinutes, 0);

    dayMap.set(date, {
      date,
      personnelCount: personnel.length,
      completedWorkOrders,
      completedMinutes,
      availableMinutes,
      workRate: availableMinutes > 0 ? Math.round((completedMinutes / availableMinutes) * 100) : 0,
      personnel
    });
  });

  const completedWorkOrders = Array.from(dayMap.values())
    .reduce((sum, day) => sum + day.completedWorkOrders, 0);
  const completedMinutes = Array.from(dayMap.values())
    .reduce((sum, day) => sum + day.completedMinutes, 0);
  const availableMinutes = Array.from(dayMap.values())
    .reduce((sum, day) => sum + day.availableMinutes, 0);

  return {
    monthDates,
    dayMap,
    personOptions: Array.from(personInfoMap.values())
      .sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, 'tr')),
    personDayMap,
    personTotals,
    overall: {
      uniquePersonnelCount: personInfoMap.size,
      completedWorkOrders,
      completedMinutes,
      availableMinutes,
      workRate: availableMinutes > 0 ? Math.round((completedMinutes / availableMinutes) * 100) : 0
    }
  };
}

function getRateColor(rate: number): string {
  if (rate > 70) return 'text-emerald-700';
  if (rate >= 40) return 'text-amber-700';
  return 'text-red-700';
}

function getCalendarCellTone(rate: number): string {
  if (rate > 70) return 'bg-emerald-50';
  if (rate >= 40) return 'bg-amber-50';
  return 'bg-red-50';
}

export default function GunlukPerformansGenelBakis() {
  const [selectedMonth, setSelectedMonth] = useState(toMonthValue(new Date()));
  const [selectedPersonKey, setSelectedPersonKey] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [isDayWorksModalOpen, setIsDayWorksModalOpen] = useState(false);
  const todayDateKey = toDateValue(new Date());

  const monthData = useMemo(() => buildMonthData(selectedMonth), [selectedMonth]);
  const monthWorks = useMemo(
    () => readCompletedWorks().filter((work) => work.tarih.startsWith(`${selectedMonth}-`)),
    [selectedMonth]
  );

  useEffect(() => {
    if (monthData.monthDates.length === 0) {
      setSelectedDate('');
      return;
    }

    if (selectedDate && monthData.monthDates.includes(selectedDate)) {
      return;
    }

    const todayText = toDateValue(new Date());
    const defaultDate = monthData.monthDates.includes(todayText)
      ? todayText
      : monthData.monthDates[0];

    setSelectedDate(defaultDate);
  }, [monthData.monthDates, selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      setIsDayWorksModalOpen(false);
    }
  }, [selectedDate]);

  const selectedPerson = selectedPersonKey === 'ALL'
    ? null
    : monthData.personOptions.find((person) => person.key === selectedPersonKey) || null;

  const scopeSummary = selectedPersonKey === 'ALL'
    ? {
      personnelCount: monthData.overall.uniquePersonnelCount,
      completedWorkOrders: monthData.overall.completedWorkOrders,
      completedMinutes: monthData.overall.completedMinutes,
      availableMinutes: monthData.overall.availableMinutes,
      workRate: monthData.overall.workRate
    }
    : (() => {
      const total = monthData.personTotals.get(selectedPersonKey) || createEmptyPersonDayStat(
        selectedPerson?.sicilNo || '-',
        selectedPerson?.adSoyad || '-'
      );
      return {
        personnelCount: total.completedWorkOrders > 0 ? 1 : 0,
        completedWorkOrders: total.completedWorkOrders,
        completedMinutes: total.completedMinutes,
        availableMinutes: total.availableMinutes,
        workRate: total.workRate
      };
    })();

  const selectedDay = selectedDate ? monthData.dayMap.get(selectedDate) || null : null;
  const selectedDayCompletedWorks = useMemo(() => {
    if (!selectedDate) return [];

    const dayWorks = monthWorks.filter((work) => work.tarih === selectedDate);
    if (selectedPersonKey === 'ALL') {
      return dayWorks;
    }

    return dayWorks.filter((work) =>
      work.personeller.some((person) => personMatchesFilter(person, selectedPersonKey))
    );
  }, [monthWorks, selectedDate, selectedPersonKey]);

  const selectedDayPersonDetail = selectedPersonKey === 'ALL'
    ? null
    : monthData.personDayMap.get(selectedPersonKey)?.get(selectedDate) || createEmptyPersonDayStat(
      selectedPerson?.sicilNo || '-',
      selectedPerson?.adSoyad || '-'
    );

  const handleCalendarDayClick = (date: string, isFutureDate: boolean) => {
    if (isFutureDate) return;
    setSelectedDate(date);
    setIsDayWorksModalOpen(true);
  };

  const monthHeaderTitle = useMemo(() => monthTitle(selectedMonth, true), [selectedMonth]);
  const calendarWeeks = useMemo(
    () => chunkWeeks(buildCalendarCells(selectedMonth, true)),
    [selectedMonth]
  );

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="label">Takvim Ayi</label>
            <input
              type="month"
              className="input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="lg:col-span-1">
            <label className="label">Kisi Filtresi</label>
            <select
              className="input"
              value={selectedPersonKey}
              onChange={(e) => setSelectedPersonKey(e.target.value)}
            >
              <option value="ALL">Tum Personeller</option>
              {monthData.personOptions.map((person) => (
                <option key={person.key} value={person.key}>
                  {person.adSoyad} ({person.sicilNo})
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 lg:col-span-1">
            <p className="text-xs text-gray-500">Toplam Dakika</p>
            <p className="text-xl font-bold text-gray-900">{formatMinutes(scopeSummary.completedMinutes)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 lg:col-span-1">
            <p className="text-xs text-gray-500">Genel Oran</p>
            <p className="text-xl font-bold text-gray-900">%{scopeSummary.workRate}</p>
            <p className="text-[11px] text-gray-500 mt-1">
              {selectedPersonKey === 'ALL' ? `${scopeSummary.personnelCount} kisi` : 'Secili kisi'}
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden border-gray-400 bg-[#f3f4f6]">
        <div className="p-4 md:p-6 space-y-5">
          <div className="flex items-center justify-center min-h-[110px]">
            <div className="text-center">
              <p className="text-xs tracking-[0.22em] text-gray-600 mb-2">GUNLUK PERFORMANS GENEL BAKIS</p>
              <h1 className="text-5xl md:text-7xl font-serif tracking-[0.12em] text-gray-900">
                {monthHeaderTitle}
              </h1>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full table-fixed border-collapse border border-gray-500 bg-white">
              <thead>
                <tr>
                  {WEEKDAY_FULL.map((dayName) => (
                    <th
                      key={dayName}
                      className="border border-gray-500 px-2 py-2 text-center text-xl font-medium text-gray-700"
                    >
                      {dayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calendarWeeks.map((week, weekIndex) => (
                  <tr key={`week-${weekIndex}`}>
                    {week.map((date, dayIndex) => {
                      if (!date) {
                        return <td key={`empty-${weekIndex}-${dayIndex}`} className="h-40 border border-gray-400 bg-[#f7f7f7]" />;
                      }

                      const dayData = monthData.dayMap.get(date) || {
                        date,
                        personnelCount: 0,
                        completedWorkOrders: 0,
                        completedMinutes: 0,
                        availableMinutes: 0,
                        workRate: 0,
                        personnel: []
                      };

                      const personDay = selectedPersonKey === 'ALL'
                        ? null
                        : monthData.personDayMap.get(selectedPersonKey)?.get(date) || null;

                      const displayRate = selectedPersonKey === 'ALL'
                        ? dayData.workRate
                        : (personDay?.workRate || 0);
                      const displayMinutes = selectedPersonKey === 'ALL'
                        ? dayData.completedMinutes
                        : (personDay?.completedMinutes || 0);
                      const displayCapacity = selectedPersonKey === 'ALL'
                        ? dayData.availableMinutes
                        : (personDay?.availableMinutes || 0);
                      const isFutureDate = date > todayDateKey;
                      const isSelected = !isFutureDate && selectedDate === date;
                      const cellToneClass = isFutureDate ? 'bg-gray-100' : getCalendarCellTone(displayRate);
                      const rateText = isFutureDate ? '--' : `%${displayRate}`;
                      const rateTextClass = isFutureDate ? 'text-gray-400' : getRateColor(displayRate);
                      const detailText = isFutureDate
                        ? 'Gelecek gun'
                        : `${formatMinutes(displayMinutes)} / ${formatMinutes(displayCapacity)}`;
                      const bottomCaption = isFutureDate
                        ? '-'
                        : (selectedPersonKey === 'ALL'
                          ? `${dayData.personnelCount} kisi`
                          : `${personDay?.completedWorkOrders || 0} is`);
                      return (
                        <td key={date} className={`h-40 border border-gray-400 p-0 align-top ${cellToneClass}`}>
                          <button
                            type="button"
                            onClick={() => handleCalendarDayClick(date, isFutureDate)}
                            disabled={isFutureDate}
                            className={`w-full h-full p-2 text-left ${isSelected ? 'ring-2 ring-inset ring-blue-400' : ''} ${isFutureDate ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-4xl leading-none text-gray-900">
                                {Number.parseInt(date.slice(-2), 10)}
                              </span>
                              <span className={`text-sm font-semibold ${rateTextClass}`}>{rateText}</span>
                            </div>
                            <div className="mt-8 text-xs text-gray-700 space-y-1">
                              <p>{detailText}</p>
                              <p className="text-gray-500">
                                {bottomCaption}
                              </p>
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isDayWorksModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsDayWorksModalOpen(false)} />
            <div className="relative w-full max-w-5xl rounded-xl bg-white shadow-xl border border-gray-200">
              <div className="flex items-start justify-between border-b px-5 py-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Tamamlanan Isler</h3>
                  <p className="text-sm text-gray-600">
                    {selectedDate} - {selectedPerson ? `${selectedPerson.adSoyad} (${selectedPerson.sicilNo})` : 'Tum Personeller'}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsDayWorksModalOpen(false)}
                >
                  Kapat
                </button>
              </div>

              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-600">ID</th>
                        <th className="px-3 py-2 text-left text-gray-600">Makina</th>
                        <th className="px-3 py-2 text-left text-gray-600">Mudahale</th>
                        <th className="px-3 py-2 text-left text-gray-600">Vardiya</th>
                        <th className="px-3 py-2 text-left text-gray-600">Saat</th>
                        <th className="px-3 py-2 text-left text-gray-600">Sure</th>
                        <th className="px-3 py-2 text-left text-gray-600">Personel</th>
                        <th className="px-3 py-2 text-left text-gray-600">Aciklama</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedDayCompletedWorks.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                            Bu gunde secili kisi icin tamamlanan is kaydi yok.
                          </td>
                        </tr>
                      ) : (
                        selectedDayCompletedWorks.map((work) => (
                          <tr key={work.id}>
                            <td className="px-3 py-2 font-mono text-xs text-gray-700">{work.id}</td>
                            <td className="px-3 py-2 text-gray-800">{work.makina}</td>
                            <td className="px-3 py-2 text-gray-700">{work.mudahaleTuru}</td>
                            <td className="px-3 py-2 text-gray-700">{work.vardiya}</td>
                            <td className="px-3 py-2 text-gray-700">{work.baslangicSaati} - {work.bitisSaati}</td>
                            <td className="px-3 py-2 text-gray-700">{work.sureDakika} dk</td>
                            <td className="px-3 py-2 text-gray-700">
                              {work.personeller
                                .filter((person) => selectedPersonKey === 'ALL' || personMatchesFilter(person, selectedPersonKey))
                                .map((person) => `${person.adSoyad} (${person.sicilNo})`)
                                .join(', ')}
                            </td>
                            <td className="px-3 py-2 text-gray-700 max-w-xs">
                              <p className="line-clamp-2">{work.aciklama || '-'}</p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">
            {selectedDate ? `${selectedDate} Gun Detayi` : 'Gun Detayi'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          {selectedPersonKey === 'ALL' ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">Sicil</th>
                  <th className="px-4 py-3 text-left text-gray-600">Ad Soyad</th>
                  <th className="px-4 py-3 text-left text-gray-600">Is Emri</th>
                  <th className="px-4 py-3 text-left text-gray-600">Tamamlanan</th>
                  <th className="px-4 py-3 text-left text-gray-600">Kapasite</th>
                  <th className="px-4 py-3 text-left text-gray-600">Oran</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {!selectedDay || selectedDay.personnel.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Secilen gunde kayit bulunamadi.
                    </td>
                  </tr>
                ) : (
                  selectedDay.personnel.map((person) => (
                    <tr key={`${selectedDay.date}-${person.sicilNo}-${person.adSoyad}`}>
                      <td className="px-4 py-3 text-gray-700">{person.sicilNo}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{person.adSoyad}</td>
                      <td className="px-4 py-3 text-gray-700">{person.completedWorkOrders}</td>
                      <td className="px-4 py-3 text-gray-700">{formatMinutes(person.completedMinutes)}</td>
                      <td className="px-4 py-3 text-gray-700">{formatMinutes(person.availableMinutes)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${getRateColor(person.workRate)}`}>%{person.workRate}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Is Emri</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedDayPersonDetail?.completedWorkOrders || 0}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Tamamlanan</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatMinutes(selectedDayPersonDetail?.completedMinutes || 0)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Kapasite</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatMinutes(selectedDayPersonDetail?.availableMinutes || 0)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Oran</p>
                  <p className="text-lg font-semibold text-gray-900">%{selectedDayPersonDetail?.workRate || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
