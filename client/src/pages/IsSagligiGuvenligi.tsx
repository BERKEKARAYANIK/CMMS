import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CircleDashed,
  ClipboardCheck,
  Flame,
  ShieldAlert,
  Target
} from 'lucide-react';
import {
  ISG_TOPICS,
  ISG_YEARLY_TOPIC_DETAILS,
  ISG_YEARLY_DEPARTMENT_RATES,
  ISG_YEARLY_SUMMARIES,
  ISG_YEAR_OPTIONS,
  type IsgTopicDefinition,
  type IsgTopicMetricTone,
  type IsgYearKey
} from '../data/isg';
import {
  ISG_TOPIC_MISSING_BREAKDOWN_BY_YEAR,
  type IsgMissingTopicId
} from '../data/isgMissing';

const toneClassMap: Record<IsgTopicMetricTone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  positive: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700'
};

const topicIconMap: Record<IsgTopicDefinition['iconKey'], React.ElementType> = {
  uygunsuzluk: ShieldAlert,
  capraz: ClipboardCheck,
  kaza: Flame,
  ramak: AlertTriangle,
  ifade: CircleDashed,
  'sari-kart': Target
};

const toPercentLabel = (value: number): string => `%${value.toFixed(2).replace('.', ',')}`;

type ClosureColor = {
  badgeClass: string;
  barClass: string;
};

const getClosureColor = (rate: number): ClosureColor => {
  if (rate < 45) {
    return { badgeClass: 'bg-red-100 text-red-700', barClass: 'bg-red-500' };
  }

  if (rate < 75) {
    return { badgeClass: 'bg-orange-100 text-orange-700', barClass: 'bg-orange-500' };
  }

  if (rate < 85) {
    return { badgeClass: 'bg-lime-100 text-lime-700', barClass: 'bg-lime-500' };
  }

  return { badgeClass: 'bg-emerald-100 text-emerald-700', barClass: 'bg-emerald-500' };
};

function isPriorityMaintenanceDepartment(department: string): boolean {
  const normalized = String(department || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('tr-TR');
  return (
    normalized.includes('E.BAKIM')
    || normalized.includes('E. BAKIM')
    || normalized.includes('E BAKIM')
    || normalized.includes('ELEKTRIK BAKIM')
    || normalized.includes('M. BAKIM')
    || normalized.includes('MEKANIK BAKIM')
    || normalized.includes('Y. TESISLER')
    || normalized.includes('YARDIMCI TESISLER')
  );
}

type ReportOption = { id: string; label: string };
type DepartmentSortMode = 'name_asc' | 'name_desc' | 'rate_desc' | 'rate_asc';

const REPORT_OPTIONS: ReportOption[] = [
  { id: 'uygunsuzluk-yillik', label: 'Uygunsuzluklar' },
  { id: 'capraz-denetim', label: 'Capraz Denetim Uygunsuzluklar' },
  { id: 'durum-kaynakli-kazalar', label: 'Durum Kaynakli Kazalar' },
  { id: 'ramak-kala', label: 'Ramak Kala' },
  { id: 'ifade-gelmeyen', label: 'Ifade Gelmeyenler' },
  { id: 'sari-kart-gelmeyen', label: 'Sari Kart Gelmeyenler' }
];

export default function IsSagligiGuvenligi() {
  const [selectedYear, setSelectedYear] = useState<IsgYearKey>('2026');
  const [selectedReportId, setSelectedReportId] = useState<string>('uygunsuzluk-yillik');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('ALL');
  const [departmentSortMode, setDepartmentSortMode] = useState<DepartmentSortMode>('rate_desc');
  const [copiedRowKey, setCopiedRowKey] = useState<string | null>(null);

  const isUygunsuzlukReport = selectedReportId === 'uygunsuzluk-yillik';
  const effectiveYear: IsgYearKey = isUygunsuzlukReport ? selectedYear : '2026';

  const activeSummary = ISG_YEARLY_SUMMARIES[effectiveYear];
  const activeDepartmentRates = ISG_YEARLY_DEPARTMENT_RATES[effectiveYear];
  const activeTopicDetails = ISG_YEARLY_TOPIC_DETAILS[effectiveYear];
  const activeMissingByTopic = ISG_TOPIC_MISSING_BREAKDOWN_BY_YEAR[effectiveYear];

  const missingTopicCards: Array<{ id: IsgMissingTopicId; title: string; missingLabel: string }> = [
    { id: 'uygunsuzluk-yillik', title: 'Uygunsuzluk Giderilmeyen', missingLabel: 'Giderilmeyen' },
    { id: 'capraz-denetim', title: 'Capraz Denetim Giderilmeyen', missingLabel: 'Giderilmeyen' },
    { id: 'durum-kaynakli-kazalar', title: 'Durum Kaynakli Kaza', missingLabel: 'Aksiyon Eksik' },
    { id: 'ramak-kala', title: 'Bekleyen Ramak Kala', missingLabel: 'Bekleyen' },
    { id: 'ifade-gelmeyen', title: 'Kaza Ifade Gelmeyen', missingLabel: 'Ifade Gelmeyen' },
    { id: 'sari-kart-gelmeyen', title: 'Sari Kart Gelmeyen', missingLabel: 'Savunma Gelmeyen' }
  ];

  const missingCardsWithRows = missingTopicCards.map((card) => {
    const breakdown = activeMissingByTopic[card.id];
    return {
      ...card,
      breakdown,
      rows: breakdown.departments
    };
  });

  const activeTopics = ISG_TOPICS.map((topic) => {
    const detail = activeTopicDetails[topic.id];
    if (!detail) {
      return topic;
    }

    return {
      ...topic,
      title: topic.id === 'uygunsuzluk-yillik' ? `${effectiveYear} Uygunsuzluklar` : topic.title,
      dataSource: detail.dataSource,
      metrics: detail.metrics
    };
  });

  const selectedReport = REPORT_OPTIONS.find((option) => option.id === selectedReportId) || REPORT_OPTIONS[0];
  const selectedTopic = activeTopics.find((topic) => topic.id === selectedReport.id) || activeTopics[0];
  const selectedMissingCard = missingCardsWithRows.find((card) => card.id === selectedReport.id);
  const showDepartmentRates = Boolean(selectedMissingCard);
  const SelectedTopicIcon = topicIconMap[selectedTopic.iconKey];
  const selectedUnresolvedItems = selectedMissingCard
    ? selectedMissingCard.rows
        .flatMap((row) =>
          row.items.map((item) => ({
            department: row.department,
            date: item.date,
            person: item.person || '-',
            missingField: item.missingField || '-',
            detail: item.detail || '-',
            sourceRowNo: typeof item.sourceRowNo === 'number' ? item.sourceRowNo : undefined
          }))
        )
        .sort((a, b) => {
          const byDate = a.date.localeCompare(b.date);
          if (byDate !== 0) return byDate;

          const aRowNo = a.sourceRowNo ?? Number.MAX_SAFE_INTEGER;
          const bRowNo = b.sourceRowNo ?? Number.MAX_SAFE_INTEGER;
          if (aRowNo !== bRowNo) return aRowNo - bRowNo;

          return a.department.localeCompare(b.department, 'tr-TR', { sensitivity: 'base' });
        })
    : [];
  const departmentFilterOptions = Array.from(
    new Set(selectedUnresolvedItems.map((item) => item.department))
  ).sort((a, b) => a.localeCompare(b, 'tr-TR', { sensitivity: 'base' }));
  const activeDepartmentFilter = departmentFilterOptions.includes(selectedDepartmentFilter)
    ? selectedDepartmentFilter
    : 'ALL';
  const filteredUnresolvedItems = activeDepartmentFilter === 'ALL'
    ? selectedUnresolvedItems
    : selectedUnresolvedItems.filter((item) => item.department === activeDepartmentFilter);
  const reportDepartmentRates = useMemo(() => {
    if (selectedReport.id === 'uygunsuzluk-yillik') {
      return activeDepartmentRates;
    }

    if (selectedMissingCard) {
      return selectedMissingCard.rows.map((row) => {
        const total = row.total;
        const ongoing = row.missing;
        const resolved = Math.max(total - ongoing, 0);
        const closureRate = total > 0 ? Number(((resolved / total) * 100).toFixed(2)) : 0;
        const openRate = total > 0 ? Number(((ongoing / total) * 100).toFixed(2)) : 0;

        return {
          department: row.department,
          total,
          resolved,
          ongoing,
          other: 0,
          closureRate,
          openRate
        };
      });
    }

    return [];
  }, [activeDepartmentRates, selectedMissingCard, selectedReport.id]);
  const sortedDepartmentRates = useMemo(() => {
    const rows = [...reportDepartmentRates];
    rows.sort((a, b) => {
      if (departmentSortMode === 'name_asc') {
        return a.department.localeCompare(b.department, 'tr-TR', { sensitivity: 'base' });
      }
      if (departmentSortMode === 'name_desc') {
        return b.department.localeCompare(a.department, 'tr-TR', { sensitivity: 'base' });
      }
      if (departmentSortMode === 'rate_asc') {
        return a.closureRate - b.closureRate
          || a.department.localeCompare(b.department, 'tr-TR', { sensitivity: 'base' });
      }
      return b.closureRate - a.closureRate
        || a.department.localeCompare(b.department, 'tr-TR', { sensitivity: 'base' });
    });
    return rows;
  }, [departmentSortMode, reportDepartmentRates]);
  const departmentCount = sortedDepartmentRates.length;

  useEffect(() => {
    setSelectedDepartmentFilter('ALL');
  }, [selectedYear, selectedReportId]);

  const copyRowText = async (
    rowKey: string,
    rowNo: number,
    item: { date: string; department: string; person: string; missingField: string; detail: string }
  ) => {
    const text = [
      `${selectedReport.label}`,
      `Sira No: ${rowNo}`,
      `Tarih: ${item.date}`,
      `Bolum: ${item.department}`,
      `Personel: ${item.person}`,
      `Kayit: ${item.missingField}`,
      `Detay: ${item.detail}`
    ].join('\n');

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedRowKey(rowKey);
      window.setTimeout(() => setCopiedRowKey((current) => (current === rowKey ? null : current)), 1200);
    } catch (error) {
      console.error('Satir kopyalama basarisiz:', error);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 py-7 text-white">
          <div className="flex flex-col gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">ISG ANALITIK PANELI</p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl">Is Sagligi ve Guvenligi</h1>
              <p className="mt-2 text-sm text-slate-200">
                Secili rapora gore KPI, bolum oranlari ve eksik kayit dagilimi asagida gosterilir.
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">Rapor Secimi</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {REPORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedReportId(option.id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                      selectedReport.id === option.id
                        ? 'bg-white text-slate-900'
                        : 'bg-slate-900/40 text-slate-200 hover:bg-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {selectedReport.id === 'uygunsuzluk-yillik' && (
                <>
                  <p className="mt-3 text-xs uppercase tracking-wide text-slate-300">Yil Secimi</p>
                  <div className="mt-2 inline-flex rounded-lg bg-slate-900/50 p-1">
                    {ISG_YEAR_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setSelectedYear(option.key)}
                        className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                          selectedYear === option.key
                            ? 'bg-white text-slate-900'
                            : 'text-slate-200 hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <p className="mt-3 text-xs text-slate-300">Rapor Tarihi: {activeSummary.reportDate}</p>
              <p className="text-xs text-slate-300">Veri Kaynagi: {selectedTopic.dataSource}</p>
            </div>
          </div>
        </div>
      </section>

      {showDepartmentRates && (
      <section className="card p-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedReport.id === 'uygunsuzluk-yillik'
                ? 'Uygunsuzluklarda Bolum Bazli Oranlar'
                : `${selectedReport.label} - Bolum Bazli Oranlar`}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Her bolum icin giderilme ve acik kalan oranlari ayri ayri gosterilir.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 text-xs md:w-auto md:flex-row md:items-end">
            <div className="w-full md:w-64">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Siralama
              </label>
              <select
                value={departmentSortMode}
                onChange={(event) => setDepartmentSortMode(event.target.value as DepartmentSortMode)}
                className="input"
              >
                <option value="rate_desc">Giderilme Orani (Yuksekten Dusege)</option>
                <option value="rate_asc">Giderilme Orani (Dusukten Yuksege)</option>
                <option value="name_asc">Isme Gore (A-Z)</option>
                <option value="name_desc">Isme Gore (Z-A)</option>
              </select>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Bolum: {departmentCount}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Bolum</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Toplam</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Giderildi</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Devam</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-600">Giderilme %</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Oran Cizgisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedDepartmentRates.map((item) => {
                const color = getClosureColor(item.closureRate);
                const isPriorityDepartment = isPriorityMaintenanceDepartment(item.department);

                return (
                  <tr key={item.department} className={isPriorityDepartment ? 'bg-amber-300/70' : undefined}>
                    <td className="px-3 py-2 font-medium text-gray-800">{item.department}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{item.total}</td>
                    <td className="px-3 py-2 text-right text-emerald-700">{item.resolved}</td>
                    <td className="px-3 py-2 text-right text-red-700">{item.ongoing + item.other}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color.badgeClass}`}>
                        {toPercentLabel(item.closureRate)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="h-2.5 w-40 overflow-hidden rounded-full bg-gray-200">
                        <div className={`h-full ${color.barClass}`} style={{ width: `${item.closureRate}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      )}

      <section className="card p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{selectedReport.label} - Giderilmeyenler</h2>
            <p className="mt-1 text-sm text-gray-600">
              Secilen rapordaki giderilmeyen kayitlar tarih ve sira no sirasina gore listelenir.
            </p>
          </div>
          <div className="w-full md:w-72">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
              Bolum Filtresi
            </label>
            <select
              value={activeDepartmentFilter}
              onChange={(event) => setSelectedDepartmentFilter(event.target.value)}
              className="input"
              disabled={!selectedMissingCard || departmentFilterOptions.length === 0}
            >
              <option value="ALL">Tum Bolumler</option>
              {departmentFilterOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedMissingCard ? (
          <div className="overflow-x-auto">
            {filteredUnresolvedItems.length === 0 ? (
              <p className="text-sm text-gray-500">Giderilmeyen kayit bulunmuyor.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Sira No</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Tarih</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Bolum</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Personel</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Giderilmeyen</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Detay</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Kopyala</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUnresolvedItems.map((item, index) => {
                    const rowKey = `${item.date}-${item.department}-${item.person}-${index}`;
                    const displayRowNo = item.sourceRowNo ?? index + 1;

                    return (
                    <tr key={rowKey}>
                      <td className="px-3 py-2 font-semibold text-gray-800">{displayRowNo}</td>
                      <td className="px-3 py-2 text-gray-700">{item.date}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{item.department}</td>
                      <td className="px-3 py-2 text-gray-700">{item.person}</td>
                      <td className="px-3 py-2 text-red-700">{item.missingField}</td>
                      <td className="px-3 py-2 text-gray-600">{item.detail}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => copyRowText(rowKey, displayRowNo, item)}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          {copiedRowKey === rowKey
                            ? 'Kopyalandi'
                            : 'Satiri Kopyala'}
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Bu rapor icin eksik kayit dagilimi bulunmuyor.
          </div>
        )}
      </section>

      <section className="card p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${selectedTopic.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
              <SelectedTopicIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{selectedTopic.title}</h2>
              <p className="text-xs text-gray-500">{selectedTopic.ownerUnit}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              selectedTopic.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {selectedTopic.status === 'active' ? 'Aktif KPI' : 'Pipeline'}
          </span>
        </div>
        <p className="text-sm text-gray-600">{selectedTopic.description}</p>
        <p className="mt-3 text-xs text-gray-500">Veri Kaynagi: {selectedTopic.dataSource}</p>

        {selectedTopic.metrics && selectedTopic.metrics.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {selectedTopic.metrics.map((metric) => (
              <div key={metric.label} className={`rounded-lg px-3 py-2 ${toneClassMap[metric.tone]}`}>
                <p className="text-[11px] font-medium uppercase tracking-wide">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Bu rapor icin KPI sutunlari hazir. Veri eklendiginde otomatik gosterilecek.
          </div>
        )}
      </section>

    </div>
  );
}
