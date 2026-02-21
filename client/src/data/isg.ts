export type IsgYearKey = '2026' | '2025';

export type IsgTopicStatus = 'active' | 'pipeline';

export type IsgTopicMetricTone = 'neutral' | 'positive' | 'warning' | 'danger';

export type IsgTopicMetric = {
  label: string;
  value: string;
  tone: IsgTopicMetricTone;
};

export type IsgTopicIconKey =
  | 'uygunsuzluk'
  | 'capraz'
  | 'kaza'
  | 'ramak'
  | 'ifade'
  | 'sari-kart';

export type IsgTopicDefinition = {
  id: string;
  title: string;
  description: string;
  status: IsgTopicStatus;
  ownerUnit: string;
  dataSource: string;
  iconKey: IsgTopicIconKey;
  metrics?: IsgTopicMetric[];
};

export type IsgSourceReport = {
  order: number;
  reportName: string;
  fileName: string;
  status: 'ready' | 'planned';
  note: string;
};

export type IsgSummary = {
  sourceFile: string;
  reportDate: string;
  countingMethod: string;
  total: number;
  resolved: number;
  ongoing: number;
  other: number;
};

export type IsgRates = {
  closureRate: number;
  openRate: number;
};

export type IsgDepartmentRate = {
  department: string;
  total: number;
  resolved: number;
  ongoing: number;
  other: number;
  closureRate: number;
  openRate: number;
};

const toRate = (part: number, total: number): number => Number(((part / total) * 100).toFixed(2));
const toPercentText = (part: number, total: number): string => `%${toRate(part, total).toFixed(2).replace('.', ',')}`;

const ISG_SUMMARY_2026: IsgSummary = {
  sourceFile: '20.02.2026 Uygunsuzluk Takip.xlsx',
  reportDate: '2026-02-20',
  countingMethod: 'Tarih/Uygunsuzluk/Aksiyon dolu satir',
  total: 793,
  resolved: 387,
  ongoing: 406,
  other: 0
};

const ISG_SUMMARY_2025: IsgSummary = {
  sourceFile: '2025 Uygunsuzluk Takip.xlsx',
  reportDate: '2026-02-20',
  countingMethod: 'Tarih/Uygunsuzluk/Aksiyon dolu satir',
  total: 4091,
  resolved: 3738,
  ongoing: 353,
  other: 0
};

export const ISG_YEAR_OPTIONS: Array<{ key: IsgYearKey; label: string }> = [
  { key: '2026', label: '2026' },
  { key: '2025', label: '2025' }
];

export const ISG_YEARLY_SUMMARIES: Record<IsgYearKey, IsgSummary> = {
  '2026': ISG_SUMMARY_2026,
  '2025': ISG_SUMMARY_2025
};

export const ISG_YEARLY_RATES: Record<IsgYearKey, IsgRates> = {
  '2026': {
    closureRate: toRate(ISG_SUMMARY_2026.resolved, ISG_SUMMARY_2026.total),
    openRate: toRate(ISG_SUMMARY_2026.ongoing + ISG_SUMMARY_2026.other, ISG_SUMMARY_2026.total)
  },
  '2025': {
    closureRate: toRate(ISG_SUMMARY_2025.resolved, ISG_SUMMARY_2025.total),
    openRate: toRate(ISG_SUMMARY_2025.ongoing + ISG_SUMMARY_2025.other, ISG_SUMMARY_2025.total)
  }
};

const ISG_DEPARTMENT_RATES_2026: IsgDepartmentRate[] = [
  { department: 'E.BAKIM-1', total: 107, resolved: 73, ongoing: 34, other: 0, closureRate: 68.22, openRate: 31.78 },
  { department: 'M. BAKIM', total: 88, resolved: 56, ongoing: 32, other: 0, closureRate: 63.64, openRate: 36.36 },
  { department: 'Y. TESISLER', total: 85, resolved: 42, ongoing: 43, other: 0, closureRate: 49.41, openRate: 50.59 },
  { department: 'KONVANSIYONEL', total: 83, resolved: 21, ongoing: 62, other: 0, closureRate: 25.3, openRate: 74.7 },
  { department: 'SEVKIYAT', total: 81, resolved: 36, ongoing: 45, other: 0, closureRate: 44.44, openRate: 55.56 },
  { department: 'HAT BORULAR', total: 74, resolved: 12, ongoing: 62, other: 0, closureRate: 16.22, openRate: 83.78 },
  { department: 'DILME', total: 62, resolved: 41, ongoing: 21, other: 0, closureRate: 66.13, openRate: 33.87 },
  { department: 'GES', total: 53, resolved: 22, ongoing: 31, other: 0, closureRate: 41.51, openRate: 58.49 },
  { department: 'KONSTRUKSIYON', total: 47, resolved: 21, ongoing: 26, other: 0, closureRate: 44.68, openRate: 55.32 },
  { department: 'UNIVERSAL', total: 36, resolved: 18, ongoing: 18, other: 0, closureRate: 50.0, openRate: 50.0 },
  { department: 'E.BAKIM-2', total: 35, resolved: 31, ongoing: 4, other: 0, closureRate: 88.57, openRate: 11.43 },
  { department: 'GALVANIZ', total: 20, resolved: 6, ongoing: 14, other: 0, closureRate: 30.0, openRate: 70.0 },
  { department: 'ISLEM HATLARI', total: 12, resolved: 3, ongoing: 9, other: 0, closureRate: 25.0, openRate: 75.0 },
  { department: 'KAPLAMA', total: 6, resolved: 4, ongoing: 2, other: 0, closureRate: 66.67, openRate: 33.33 },
  { department: 'ERW IDARI ISLER', total: 3, resolved: 0, ongoing: 3, other: 0, closureRate: 0.0, openRate: 100.0 },
  { department: 'KALITE KONTROL', total: 1, resolved: 1, ongoing: 0, other: 0, closureRate: 100.0, openRate: 0.0 }
];

const ISG_DEPARTMENT_RATES_2025: IsgDepartmentRate[] = [
  { department: 'SEVKIYAT', total: 808, resolved: 772, ongoing: 36, other: 0, closureRate: 95.54, openRate: 4.46 },
  { department: 'E.BAKIM-1', total: 591, resolved: 554, ongoing: 37, other: 0, closureRate: 93.74, openRate: 6.26 },
  { department: 'HAT BORULAR', total: 466, resolved: 326, ongoing: 140, other: 0, closureRate: 69.96, openRate: 30.04 },
  { department: 'Y. TESISLER', total: 328, resolved: 314, ongoing: 14, other: 0, closureRate: 95.73, openRate: 4.27 },
  { department: 'M. BAKIM', total: 317, resolved: 282, ongoing: 35, other: 0, closureRate: 88.96, openRate: 11.04 },
  { department: 'KONVANSIYONEL', total: 310, resolved: 282, ongoing: 28, other: 0, closureRate: 90.97, openRate: 9.03 },
  { department: 'KONSTRUKSIYON', total: 290, resolved: 280, ongoing: 10, other: 0, closureRate: 96.55, openRate: 3.45 },
  { department: 'DILME', total: 275, resolved: 275, ongoing: 0, other: 0, closureRate: 100.0, openRate: 0.0 },
  { department: 'E.BAKIM-2', total: 215, resolved: 208, ongoing: 7, other: 0, closureRate: 96.74, openRate: 3.26 },
  { department: 'UNIVERSAL', total: 197, resolved: 192, ongoing: 5, other: 0, closureRate: 97.46, openRate: 2.54 },
  { department: 'ISLEM HATLARI', total: 111, resolved: 81, ongoing: 30, other: 0, closureRate: 72.97, openRate: 27.03 },
  { department: 'GALVANIZ', total: 80, resolved: 76, ongoing: 4, other: 0, closureRate: 95.0, openRate: 5.0 },
  { department: 'KAPLAMA', total: 42, resolved: 41, ongoing: 1, other: 0, closureRate: 97.62, openRate: 2.38 },
  { department: 'GES', total: 26, resolved: 23, ongoing: 3, other: 0, closureRate: 88.46, openRate: 11.54 },
  { department: 'ERW IDARI ISLER', total: 21, resolved: 21, ongoing: 0, other: 0, closureRate: 100.0, openRate: 0.0 },
  { department: 'KALITE KONTROL', total: 10, resolved: 10, ongoing: 0, other: 0, closureRate: 100.0, openRate: 0.0 },
  { department: 'MALZEME YONETIM BIRIMI', total: 3, resolved: 0, ongoing: 3, other: 0, closureRate: 0.0, openRate: 100.0 },
  { department: 'SARISEKI Y.YAPISAL', total: 1, resolved: 1, ongoing: 0, other: 0, closureRate: 100.0, openRate: 0.0 }
];

export const ISG_YEARLY_DEPARTMENT_RATES: Record<IsgYearKey, IsgDepartmentRate[]> = {
  '2026': ISG_DEPARTMENT_RATES_2026,
  '2025': ISG_DEPARTMENT_RATES_2025
};

export type IsgTopicYearDetail = {
  dataSource: string;
  metrics: IsgTopicMetric[];
};

export const ISG_YEARLY_TOPIC_DETAILS: Record<IsgYearKey, Record<string, IsgTopicYearDetail>> = {
  '2026': {
    'uygunsuzluk-yillik': {
      dataSource: ISG_SUMMARY_2026.sourceFile,
      metrics: [
        { label: 'Giderilme Orani', value: toPercentText(ISG_SUMMARY_2026.resolved, ISG_SUMMARY_2026.total), tone: 'warning' },
        { label: 'Toplam Kayit', value: `${ISG_SUMMARY_2026.total}`, tone: 'neutral' },
        { label: 'Giderildi', value: `${ISG_SUMMARY_2026.resolved}`, tone: 'positive' },
        { label: 'Devam Ediyor', value: `${ISG_SUMMARY_2026.ongoing}`, tone: 'danger' }
      ]
    },
    'capraz-denetim': {
      dataSource: '20.02.2026 Capraz Denetim Uygunsuzluk Takip.xlsx',
      metrics: [
        { label: 'Giderilme Orani', value: '%73,28', tone: 'warning' },
        { label: 'Toplam Kayit', value: '1924', tone: 'neutral' },
        { label: 'Giderildi', value: '1410', tone: 'positive' },
        { label: 'Devam Ediyor', value: '514', tone: 'danger' }
      ]
    },
    'durum-kaynakli-kazalar': {
      dataSource: 'AKSIYON BEKLEYEN DURUM KAYNAKLI KAZALAR.xlsx',
      metrics: [
        { label: 'Toplam Kaza Kaydi', value: '31', tone: 'neutral' },
        { label: 'Durum Aksiyon Bekleyen', value: '28', tone: 'danger' },
        { label: 'Davranis Aksiyon Bekleyen', value: '14', tone: 'warning' },
        { label: 'Durum Bekleme Orani', value: '%90,32', tone: 'danger' }
      ]
    },
    'ramak-kala': {
      dataSource: 'BEKLEYEN RAMAK KALA.xlsx',
      metrics: [
        { label: 'Toplam Ramak Kala', value: '45', tone: 'neutral' },
        { label: 'Giderildi', value: '20', tone: 'positive' },
        { label: 'Devam Ediyor', value: '25', tone: 'danger' },
        { label: 'Giderilme Orani', value: '%44,44', tone: 'warning' }
      ]
    },
    'ifade-gelmeyen': {
      dataSource: 'KAZA IFADE GELMEYENLER.xlsx',
      metrics: [
        { label: 'Toplam Kaza Kaydi', value: '31', tone: 'neutral' },
        { label: 'Ifade Gelmeyen', value: '17', tone: 'danger' },
        { label: 'Ifade Eksik Orani', value: '%54,84', tone: 'danger' },
        { label: 'Durum Aksiyon Bekleyen', value: '28', tone: 'warning' }
      ]
    },
    'sari-kart-gelmeyen': {
      dataSource: 'SARI KART GELMEYENLER.xlsx',
      metrics: [
        { label: 'Toplam Sari Kart', value: '29', tone: 'neutral' },
        { label: 'Savunma Gelmeyen', value: '20', tone: 'danger' },
        { label: 'Savunma Gelen', value: '9', tone: 'positive' },
        { label: 'Gelmeme Orani', value: '%68,97', tone: 'danger' }
      ]
    }
  },
  '2025': {
    'uygunsuzluk-yillik': {
      dataSource: ISG_SUMMARY_2025.sourceFile,
      metrics: [
        { label: 'Giderilme Orani', value: toPercentText(ISG_SUMMARY_2025.resolved, ISG_SUMMARY_2025.total), tone: 'warning' },
        { label: 'Toplam Kayit', value: `${ISG_SUMMARY_2025.total}`, tone: 'neutral' },
        { label: 'Giderildi', value: `${ISG_SUMMARY_2025.resolved}`, tone: 'positive' },
        { label: 'Devam Ediyor', value: `${ISG_SUMMARY_2025.ongoing}`, tone: 'danger' }
      ]
    },
    'durum-kaynakli-kazalar': {
      dataSource: 'AKSIYON BEKLEYEN DURUM KAYNAKLI KAZALAR.xlsx',
      metrics: [
        { label: 'Toplam Kaza Kaydi', value: '233', tone: 'neutral' },
        { label: 'Durum Aksiyon Bekleyen', value: '155', tone: 'danger' },
        { label: 'Davranis Aksiyon Bekleyen', value: '134', tone: 'warning' },
        { label: 'Durum Bekleme Orani', value: '%66,52', tone: 'warning' }
      ]
    },
    'ramak-kala': {
      dataSource: 'BEKLEYEN RAMAK KALA.xlsx',
      metrics: [
        { label: 'Toplam Ramak Kala', value: '408', tone: 'neutral' },
        { label: 'Giderildi', value: '393', tone: 'positive' },
        { label: 'Devam Ediyor', value: '15', tone: 'danger' },
        { label: 'Giderilme Orani', value: '%96,32', tone: 'positive' }
      ]
    },
    'ifade-gelmeyen': {
      dataSource: 'KAZA IFADE GELMEYENLER.xlsx',
      metrics: [
        { label: 'Toplam Kaza Kaydi', value: '233', tone: 'neutral' },
        { label: 'Ifade Gelmeyen', value: '25', tone: 'danger' },
        { label: 'Ifade Eksik Orani', value: '%10,73', tone: 'warning' },
        { label: 'Durum Aksiyon Bekleyen', value: '155', tone: 'warning' }
      ]
    },
    'sari-kart-gelmeyen': {
      dataSource: 'SARI KART GELMEYENLER.xlsx',
      metrics: [
        { label: 'Toplam Sari Kart', value: '535', tone: 'neutral' },
        { label: 'Savunma Gelmeyen', value: '50', tone: 'danger' },
        { label: 'Savunma Gelen', value: '456', tone: 'positive' },
        { label: 'Gelmeme Orani', value: '%9,35', tone: 'warning' }
      ]
    }
  }
};

export const ISG_SOURCE_REPORTS: IsgSourceReport[] = [
  {
    order: 1,
    reportName: 'Capraz Denetim Uygunsuzluk Takip',
    fileName: '20.02.2026 Capraz Denetim Uygunsuzluk Takip.xlsx',
    status: 'ready',
    note: 'Kaynak rapor listesine eklendi.'
  },
  {
    order: 2,
    reportName: 'Uygunsuzluk Takip',
    fileName: '20.02.2026 Uygunsuzluk Takip.xlsx',
    status: 'ready',
    note: '2026 giderilme orani hesaplandi.'
  },
  {
    order: 3,
    reportName: '2025 Uygunsuzluk Takip',
    fileName: '2025 Uygunsuzluk Takip.xlsx',
    status: 'ready',
    note: '2025 giderilme orani eklendi.'
  },
  {
    order: 4,
    reportName: 'Aksiyon Bekleyen Durum Kaynakli Kazalar',
    fileName: 'AKSIYON BEKLEYEN DURUM KAYNAKLI KAZALAR.xlsx',
    status: 'ready',
    note: 'Kaza KPI paneline alinacak.'
  },
  {
    order: 5,
    reportName: 'Bekleyen Ramak Kala',
    fileName: 'BEKLEYEN RAMAK KALA.xlsx',
    status: 'ready',
    note: 'Ramak kala gostergeleri icin hazir.'
  },
  {
    order: 6,
    reportName: 'Kaza Ifade Gelmeyenler',
    fileName: 'KAZA IFADE GELMEYENLER.xlsx',
    status: 'ready',
    note: 'Dogrulama sureci bekliyor.'
  },
  {
    order: 7,
    reportName: 'Sari Kart Gelmeyenler',
    fileName: 'SARI KART GELMEYENLER.xlsx',
    status: 'ready',
    note: 'Disiplin KPI paneli icin hazir.'
  }
];

export const ISG_TOPICS: IsgTopicDefinition[] = [
  {
    id: 'uygunsuzluk-yillik',
    title: 'Yillik Uygunsuzluk Takip',
    description: 'Secilen yilin aksiyon durumu verileri ile giderilme performansi olculur.',
    status: 'active',
    ownerUnit: 'ISG',
    dataSource: 'Uygunsuzluk Takip.xlsx',
    iconKey: 'uygunsuzluk'
  },
  {
    id: 'capraz-denetim',
    title: 'Capraz Denetim Uygunsuzluk',
    description: 'Bolumler arasi denetim bulgulari icin oran bazli izleme paneli.',
    status: 'active',
    ownerUnit: 'ISG + Bakim',
    dataSource: '20.02.2026 Capraz Denetim Uygunsuzluk Takip.xlsx',
    iconKey: 'capraz'
  },
  {
    id: 'durum-kaynakli-kazalar',
    title: 'Aksiyon Bekleyen Durum Kaynakli Kazalar',
    description: 'Aksiyon gecikmesi kaynakli kaza kayitlarinin izlenmesi.',
    status: 'pipeline',
    ownerUnit: 'ISG',
    dataSource: 'AKSIYON BEKLEYEN DURUM KAYNAKLI KAZALAR.xlsx',
    iconKey: 'kaza'
  },
  {
    id: 'ramak-kala',
    title: 'Bekleyen Ramak Kala',
    description: 'Ramak kala kayitlarinin kapanma hizi ve risk dagilimi.',
    status: 'pipeline',
    ownerUnit: 'ISG',
    dataSource: 'BEKLEYEN RAMAK KALA.xlsx',
    iconKey: 'ramak'
  },
  {
    id: 'ifade-gelmeyen',
    title: 'Kaza Ifade Gelmeyenler',
    description: 'Olay ifadesi eksik kayitlarin sure bazli takip paneli.',
    status: 'pipeline',
    ownerUnit: 'ISG + IK',
    dataSource: 'KAZA IFADE GELMEYENLER.xlsx',
    iconKey: 'ifade'
  },
  {
    id: 'sari-kart-gelmeyen',
    title: 'Sari Kart Gelmeyenler',
    description: 'Davranis guvenligi sistemi ile iliskili sari kart tamamlama takibi.',
    status: 'pipeline',
    ownerUnit: 'ISG + Hat Sorumlulari',
    dataSource: 'SARI KART GELMEYENLER.xlsx',
    iconKey: 'sari-kart'
  }
];
