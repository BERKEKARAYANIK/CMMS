import { useEffect, useMemo, useState } from 'react';
import type { IsEmri } from '../data/lists';

const STORAGE_KEY = 'cmms_tamamlanan_isler';
const DAY_MS = 24 * 60 * 60 * 1000;

interface FaultRecord {
  id: string;
  makina: string;
  makinaKey: string;
  faultKey: string;
  faultLabel: string;
  tarih: string;
  timestamp: number;
  sureDakika: number;
}

interface FaultGroup {
  faultKey: string;
  faultLabel: string;
  count: number;
  lastDate: string;
  lastTimestamp: number;
  totalMinutes: number;
}

interface MachineStats {
  makina: string;
  makinaKey: string;
  totalAriza: number;
  recurringAriza: number;
  repeatRate: number;
  totalMinutes: number;
  groups: FaultGroup[];
}

interface WindowResult {
  days: number;
  startDate: string;
  endDate: string;
  totalAriza: number;
  recurringAriza: number;
  repeatRate: number;
  uniqueMachines: number;
  machineStats: MachineStats[];
}

interface MachineRow {
  makina: string;
  makinaKey: string;
  stats30: MachineStats;
  stats90: MachineStats;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä±/g, 'i')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const monthIndex = Number.parseInt(match[2], 10) - 1;
  const day = Number.parseInt(match[3], 10);
  const parsed = new Date(year, monthIndex, day);

  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function readCompletedWorks(): IsEmri[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as IsEmri[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isArizaWork(work: IsEmri): boolean {
  const normalized = normalizeText(work.mudahaleTuru || '');
  return normalized.includes('ariza');
}

function getFaultLabel(work: IsEmri): string {
  const aciklama = (work.aciklama || '').trim();
  if (aciklama) return aciklama;
  const mudahale = (work.mudahaleTuru || '').trim();
  return mudahale || 'Belirsiz Ariza';
}

function toFaultRecords(works: IsEmri[]): FaultRecord[] {
  const records: FaultRecord[] = [];

  works.forEach((work) => {
    if (!isArizaWork(work)) return;

    const date = parseDateValue(work.tarih);
    if (!date) return;

    const makina = (work.makina || '').trim() || 'Belirsiz Makina';
    const makinaKey = normalizeText(makina) || 'belirsiz-makina';
    const faultLabel = getFaultLabel(work);
    const faultKey = normalizeText(faultLabel) || 'belirsiz-ariza';

    records.push({
      id: work.id,
      makina,
      makinaKey,
      faultKey,
      faultLabel,
      tarih: work.tarih,
      timestamp: date.getTime(),
      sureDakika: Number(work.sureDakika) || 0
    });
  });

  return records;
}

function emptyMachineStats(makina: string, makinaKey: string): MachineStats {
  return {
    makina,
    makinaKey,
    totalAriza: 0,
    recurringAriza: 0,
    repeatRate: 0,
    totalMinutes: 0,
    groups: []
  };
}

function analyzeWindow(records: FaultRecord[], endDateValue: string, days: number): WindowResult {
  const endDate = parseDateValue(endDateValue) || new Date();
  const endTimestamp = endDate.getTime();
  const startTimestamp = endTimestamp - ((days - 1) * DAY_MS);
  const startDateValue = toDateValue(new Date(startTimestamp));

  const windowRecords = records.filter((record) =>
    record.timestamp >= startTimestamp && record.timestamp <= endTimestamp
  );

  const machineMap = new Map<string, {
    makina: string;
    makinaKey: string;
    totalAriza: number;
    totalMinutes: number;
    groupMap: Map<string, FaultGroup>;
  }>();

  windowRecords.forEach((record) => {
    const machine = machineMap.get(record.makinaKey) || {
      makina: record.makina,
      makinaKey: record.makinaKey,
      totalAriza: 0,
      totalMinutes: 0,
      groupMap: new Map<string, FaultGroup>()
    };

    machine.totalAriza += 1;
    machine.totalMinutes += record.sureDakika;

    const currentGroup = machine.groupMap.get(record.faultKey) || {
      faultKey: record.faultKey,
      faultLabel: record.faultLabel,
      count: 0,
      lastDate: record.tarih,
      lastTimestamp: record.timestamp,
      totalMinutes: 0
    };

    currentGroup.count += 1;
    currentGroup.totalMinutes += record.sureDakika;
    if (record.timestamp >= currentGroup.lastTimestamp) {
      currentGroup.lastTimestamp = record.timestamp;
      currentGroup.lastDate = record.tarih;
      currentGroup.faultLabel = record.faultLabel;
    }

    machine.groupMap.set(record.faultKey, currentGroup);
    machineMap.set(record.makinaKey, machine);
  });

  const machineStats: MachineStats[] = Array.from(machineMap.values())
    .map((machine) => {
      const groups = Array.from(machine.groupMap.values())
        .sort((a, b) => b.count - a.count || b.lastTimestamp - a.lastTimestamp);
      const recurringAriza = groups
        .filter((group) => group.count >= 2)
        .reduce((sum, group) => sum + group.count, 0);

      return {
        makina: machine.makina,
        makinaKey: machine.makinaKey,
        totalAriza: machine.totalAriza,
        recurringAriza,
        repeatRate: machine.totalAriza > 0
          ? Math.round((recurringAriza / machine.totalAriza) * 100)
          : 0,
        totalMinutes: machine.totalMinutes,
        groups
      };
    })
    .sort((a, b) => b.repeatRate - a.repeatRate || b.recurringAriza - a.recurringAriza || b.totalAriza - a.totalAriza);

  const totalAriza = machineStats.reduce((sum, item) => sum + item.totalAriza, 0);
  const recurringAriza = machineStats.reduce((sum, item) => sum + item.recurringAriza, 0);

  return {
    days,
    startDate: startDateValue,
    endDate: endDateValue,
    totalAriza,
    recurringAriza,
    repeatRate: totalAriza > 0 ? Math.round((recurringAriza / totalAriza) * 100) : 0,
    uniqueMachines: machineStats.length,
    machineStats
  };
}

function mergeMachineRows(window30: WindowResult, window90: WindowResult): MachineRow[] {
  const map = new Map<string, MachineRow>();

  window30.machineStats.forEach((stats) => {
    map.set(stats.makinaKey, {
      makina: stats.makina,
      makinaKey: stats.makinaKey,
      stats30: stats,
      stats90: emptyMachineStats(stats.makina, stats.makinaKey)
    });
  });

  window90.machineStats.forEach((stats) => {
    const current = map.get(stats.makinaKey);
    if (current) {
      current.stats90 = stats;
      return;
    }

    map.set(stats.makinaKey, {
      makina: stats.makina,
      makinaKey: stats.makinaKey,
      stats30: emptyMachineStats(stats.makina, stats.makinaKey),
      stats90: stats
    });
  });

  return Array.from(map.values())
    .sort((a, b) =>
      b.stats30.repeatRate - a.stats30.repeatRate
      || b.stats90.repeatRate - a.stats90.repeatRate
      || b.stats90.totalAriza - a.stats90.totalAriza
    );
}

function rateBadgeClass(rate: number): string {
  if (rate >= 40) return 'bg-red-100 text-red-700';
  if (rate >= 20) return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

export default function TekrarlayanArizaAnalizi() {
  const [refDate, setRefDate] = useState(toDateValue(new Date()));
  const [selectedMachineKey, setSelectedMachineKey] = useState('');

  const analysis = useMemo(() => {
    const records = toFaultRecords(readCompletedWorks());
    const window30 = analyzeWindow(records, refDate, 30);
    const window90 = analyzeWindow(records, refDate, 90);
    const rows = mergeMachineRows(window30, window90);

    return {
      totalArizaKaydi: records.length,
      window30,
      window90,
      rows
    };
  }, [refDate]);

  useEffect(() => {
    if (analysis.rows.length === 0) {
      setSelectedMachineKey('');
      return;
    }

    if (!selectedMachineKey || !analysis.rows.some((row) => row.makinaKey === selectedMachineKey)) {
      setSelectedMachineKey(analysis.rows[0].makinaKey);
    }
  }, [analysis.rows, selectedMachineKey]);

  const selectedRow = analysis.rows.find((row) => row.makinaKey === selectedMachineKey) || null;
  const repeatedFaults30 = selectedRow
    ? selectedRow.stats30.groups.filter((group) => group.count >= 2)
    : [];
  const repeatedFaults90 = selectedRow
    ? selectedRow.stats90.groups.filter((group) => group.count >= 2)
    : [];

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tekrarlayan Ariza Analizi</h1>
            <p className="text-sm text-gray-600 mt-1">
              Son 30 ve 90 gunde makina bazli tekrarlayan ariza yogunlugunu gosterir.
            </p>
          </div>
          <div className="w-full lg:w-64">
            <label className="label">Referans Tarih</label>
            <input
              type="date"
              className="input"
              value={refDate}
              onChange={(e) => setRefDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">30 Gun Tekrar Orani</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">%{analysis.window30.repeatRate}</p>
          <p className="text-xs text-gray-500 mt-2">
            {analysis.window30.recurringAriza} / {analysis.window30.totalAriza} ariza kaydi
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">90 Gun Tekrar Orani</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">%{analysis.window90.repeatRate}</p>
          <p className="text-xs text-gray-500 mt-2">
            {analysis.window90.recurringAriza} / {analysis.window90.totalAriza} ariza kaydi
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Analiz Edilen Makina</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analysis.window90.uniqueMachines}</p>
          <p className="text-xs text-gray-500 mt-2">
            90 gun penceresi
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Toplam Ariza Kaydi</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analysis.totalArizaKaydi}</p>
          <p className="text-xs text-gray-500 mt-2">
            Sadece "Ariza" tipindeki is emirleri
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">
            Makina Bazli Tekrar Orani (30/90 Gun)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            30 gun: {analysis.window30.startDate} - {analysis.window30.endDate} | 90 gun: {analysis.window90.startDate} - {analysis.window90.endDate}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">Makina</th>
                <th className="px-4 py-3 text-left text-gray-600">30g Toplam</th>
                <th className="px-4 py-3 text-left text-gray-600">30g Tekrar</th>
                <th className="px-4 py-3 text-left text-gray-600">30g Oran</th>
                <th className="px-4 py-3 text-left text-gray-600">90g Toplam</th>
                <th className="px-4 py-3 text-left text-gray-600">90g Tekrar</th>
                <th className="px-4 py-3 text-left text-gray-600">90g Oran</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analysis.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Secilen tarihe gore ariza verisi bulunamadi.
                  </td>
                </tr>
              ) : (
                analysis.rows.map((row) => {
                  const isSelected = row.makinaKey === selectedMachineKey;
                  return (
                    <tr
                      key={row.makinaKey}
                      className={`cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedMachineKey(row.makinaKey)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{row.makina}</td>
                      <td className="px-4 py-3 text-gray-700">{row.stats30.totalAriza}</td>
                      <td className="px-4 py-3 text-gray-700">{row.stats30.recurringAriza}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${rateBadgeClass(row.stats30.repeatRate)}`}>
                          %{row.stats30.repeatRate}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{row.stats90.totalAriza}</td>
                      <td className="px-4 py-3 text-gray-700">{row.stats90.recurringAriza}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${rateBadgeClass(row.stats90.repeatRate)}`}>
                          %{row.stats90.repeatRate}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              30 Gun Tekrarlayan Arizalar {selectedRow ? `- ${selectedRow.makina}` : ''}
            </h3>
          </div>
          <div className="p-4">
            {selectedRow == null ? (
              <p className="text-sm text-gray-500">Detay icin bir makina seciniz.</p>
            ) : repeatedFaults30.length === 0 ? (
              <p className="text-sm text-gray-500">Bu makina icin 30 gunde tekrarlayan ariza yok.</p>
            ) : (
              <div className="space-y-2">
                {repeatedFaults30.map((group) => (
                  <div key={`30-${group.faultKey}`} className="rounded-lg border border-gray-200 p-3">
                    <p className="text-sm font-medium text-gray-900">{group.faultLabel}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                      <span>{group.count} tekrar</span>
                      <span>{group.totalMinutes} dk</span>
                      <span>Son: {group.lastDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              90 Gun Tekrarlayan Arizalar {selectedRow ? `- ${selectedRow.makina}` : ''}
            </h3>
          </div>
          <div className="p-4">
            {selectedRow == null ? (
              <p className="text-sm text-gray-500">Detay icin bir makina seciniz.</p>
            ) : repeatedFaults90.length === 0 ? (
              <p className="text-sm text-gray-500">Bu makina icin 90 gunde tekrarlayan ariza yok.</p>
            ) : (
              <div className="space-y-2">
                {repeatedFaults90.map((group) => (
                  <div key={`90-${group.faultKey}`} className="rounded-lg border border-gray-200 p-3">
                    <p className="text-sm font-medium text-gray-900">{group.faultLabel}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                      <span>{group.count} tekrar</span>
                      <span>{group.totalMinutes} dk</span>
                      <span>Son: {group.lastDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
