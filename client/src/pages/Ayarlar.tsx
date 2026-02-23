import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, X, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { appStateApi, authApi, backupsApi, usersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';
import type {
  BackupSettings,
  BackupSettingsResponse,
  BackupStatus } from
'../types/backups';
import {
  type Vardiya,
  type MudahaleTuru,
  type Personel,
  type Makina } from
'../data/lists';
import {
  APP_STATE_KEYS,
  buildDefaultDashboardFiveSLevels,
  DASHBOARD_FIVE_S_DEPARTMENTS,
  FIVE_S_LEVEL_OPTIONS,
  buildDefaultSettingsLists,
  normalizeDashboardFiveSLevels,
  normalizeSettingsLists,
  sortPersonelListesiByName,
  sortMakinaListesiByName,
  type DashboardFiveSLevelsState,
  type SettingsListsState } from
'../constants/appState';
import {
  buildCompactLoginName,
  buildDefaultPasswordPreview,
  isSystemAdminUser } from
'../utils/access';
import {
  isPasswordPolicyCompliant,
  PASSWORD_POLICY_TEXT } from
'../utils/passwordPolicy';

const turkishCharMap: Record<string, string> = {
  ı: 'i',
  İ: 'i',
  ş: 's',
  Ş: 's',
  ğ: 'g',
  Ğ: 'g',
  ü: 'u',
  Ü: 'u',
  ö: 'o',
  Ö: 'o',
  ç: 'c',
  Ç: 'c'
};

function normalizeHeader(value: string): string {
  const mapped = value.
  trim().
  split('').
  map((char) => turkishCharMap[char] ?? char).
  join('');
  return mapped.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const PERSONNEL_BASE_DEPARTMENTS = [
'ELEKTRIK BAKIM',
'MEKANIK BAKIM',
'YARDIMCI TESISLER',
'YONETIM'] as
const;

const PERSONNEL_SUB_DEPARTMENTS = [
'',
'ANA BINA',
'EK BINA',
'YARDIMCI TESISLER',
'ISK'] as
const;

function normalizeDepartmentToken(value: string): string {
  return String(value || '').
  toLocaleUpperCase('tr-TR').
  normalize('NFKD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/[^A-Z0-9]+/g, ' ').
  replace(/\s+/g, ' ').
  trim();
}

function normalizePersonnelDepartment(bolumValue: string, bolum2Value: string): string {
  const bolum = normalizeDepartmentToken(bolumValue);
  const bolum2 = normalizeDepartmentToken(bolum2Value);
  const combined = `${bolum} ${bolum2}`.trim();

  if (!bolum && !bolum2) return '';

  const directValues = new Set([
  'ELEKTRIK BAKIM ANA BINA',
  'ELEKTRIK BAKIM EK BINA',
  'MEKANIK BAKIM',
  'ISK ELEKTRIK BAKIM',
  'ISK MEKANIK BAKIM',
  'ISK YARDIMCI TESISLER',
  'YARDIMCI TESISLER',
  'YONETIM']
  );
  if (directValues.has(bolum)) return bolum;
  if (directValues.has(bolum2)) return bolum2;
  if (directValues.has(combined)) return combined;

  const hasIsk = bolum.startsWith('ISK ') || bolum2 === 'ISK' || bolum2.startsWith('ISK ');
  const hasElectric = bolum.includes('ELEKTRIK') || bolum2.includes('ELEKTRIK');
  const hasMechanical = bolum.includes('MEKANIK') || bolum2.includes('MEKANIK');
  const hasAuxiliary = bolum.includes('YARDIMCI') || bolum2.includes('YARDIMCI');

  if (hasElectric) {
    if (hasAuxiliary) return hasIsk ? 'ISK YARDIMCI TESISLER' : 'YARDIMCI TESISLER';
    if (combined.includes('EK BINA')) return 'ELEKTRIK BAKIM EK BINA';
    if (hasIsk) return 'ISK ELEKTRIK BAKIM';
    return 'ELEKTRIK BAKIM ANA BINA';
  }

  if (hasMechanical) {
    return hasIsk ? 'ISK MEKANIK BAKIM' : 'MEKANIK BAKIM';
  }

  if (hasAuxiliary) {
    return hasIsk ? 'ISK YARDIMCI TESISLER' : 'YARDIMCI TESISLER';
  }

  if (bolum === 'YONETIM') return 'YONETIM';

  return bolum;
}

function splitPersonnelDepartment(fullDepartment: string): {bolum: string;bolum2: string;} {
  const normalized = normalizePersonnelDepartment(fullDepartment, '');
  switch (normalized) {
    case 'ELEKTRIK BAKIM ANA BINA':
      return { bolum: 'ELEKTRIK BAKIM', bolum2: 'ANA BINA' };
    case 'ELEKTRIK BAKIM EK BINA':
      return { bolum: 'ELEKTRIK BAKIM', bolum2: 'EK BINA' };
    case 'ISK ELEKTRIK BAKIM':
      return { bolum: 'ELEKTRIK BAKIM', bolum2: 'ISK' };
    case 'ISK MEKANIK BAKIM':
      return { bolum: 'MEKANIK BAKIM', bolum2: 'ISK' };
    case 'ISK YARDIMCI TESISLER':
      return { bolum: 'YARDIMCI TESISLER', bolum2: 'ISK' };
    case 'MEKANIK BAKIM':
      return { bolum: 'MEKANIK BAKIM', bolum2: '' };
    case 'YARDIMCI TESISLER':
      return { bolum: 'YARDIMCI TESISLER', bolum2: '' };
    case 'YONETIM':
      return { bolum: 'YONETIM', bolum2: '' };
    default:
      return { bolum: normalized || fullDepartment, bolum2: '' };
  }
}

const TEMPLATE_HEADERS = [
'VARDIYA',
'MUDAHALE TURU',
'PERSONEL NO',
'AD SOYAD',
'BOLUM',
'BOLUM 2',
'ROL',
'MAKINA ADI'];


type ParsedTemplate = {
  vardiyalar: Vardiya[];
  mudahaleTurleri: MudahaleTuru[];
  personelListesi: Personel[];
  makinaListesi: Makina[];
  skipped: number;
  missingHeaders: string[];
};

function buildTemplateRows(
vardiyalar: Vardiya[],
mudahaleTurleri: MudahaleTuru[],
personelListesi: Personel[],
makinaListesi: Makina[])
: string[][] {
  const maxLen = Math.max(
    vardiyalar.length,
    mudahaleTurleri.length,
    personelListesi.length,
    makinaListesi.length,
    1
  );

  const rows: string[][] = [TEMPLATE_HEADERS];

  for (let i = 0; i < maxLen; i += 1) {
    const row = new Array(TEMPLATE_HEADERS.length).fill('');
    const vardiya = vardiyalar[i];
    if (vardiya) {
      row[0] = vardiya.saat ? `${vardiya.ad} (${vardiya.saat})` : vardiya.ad;
    }
    const mudahale = mudahaleTurleri[i];
    if (mudahale) row[1] = mudahale.ad;

    const personel = personelListesi[i];
    if (personel) {
      const bolumParcalari = splitPersonnelDepartment(personel.bolum);
      row[2] = personel.sicilNo;
      row[3] = personel.adSoyad || `${personel.ad} ${personel.soyad}`.trim();
      row[4] = bolumParcalari.bolum;
      row[5] = bolumParcalari.bolum2;
      row[6] = personel.rol || '';
    }

    const makina = makinaListesi[i];
    if (makina) row[7] = makina.ad;

    rows.push(row);
  }

  return rows;
}

function parseTemplateRows(rows: string[][]): ParsedTemplate {
  const result: ParsedTemplate = {
    vardiyalar: [],
    mudahaleTurleri: [],
    personelListesi: [],
    makinaListesi: [],
    skipped: 0,
    missingHeaders: []
  };

  if (rows.length === 0) return result;

  const header = rows[0].map((cell) => normalizeHeader(String(cell || '')));
  const indexFor = (candidates: string[]) =>
  header.findIndex((value) => candidates.includes(value));

  const indexes = {
    vardiya: indexFor(['vardiya', 'vardiyaadi', 'vardiyaad']),
    mudahale: indexFor(['mudahaleturu', 'mudahaleturuadi', 'mudahale', 'tur', 'turadi']),
    sicilNo: indexFor(['personelno', 'sicilno', 'sicil', 'personel']),
    ad: indexFor(['ad', 'adi', 'isim']),
    soyad: indexFor(['soyad', 'soyadi']),
    bolum: indexFor(['bolum', 'departman']),
    bolum2: indexFor(['bolum2', 'ikincibolum', 'altbolum', 'subolum']),
    rol: indexFor(['rol', 'görev', 'unvan']),
    adSoyad: indexFor(['adsoyad', 'adsoyadbirlesik']),
    makina: indexFor(['makina', 'makinaadi', 'makinaadiliste'])
  };

  const missingHeaders: string[] = [];
  if (indexes.vardiya < 0) missingHeaders.push('VARDIYA');
  if (indexes.mudahale < 0) missingHeaders.push('MUDAHALE TURU');
  if (indexes.sicilNo < 0) missingHeaders.push('PERSONEL NO');
  if (indexes.adSoyad < 0 && (indexes.ad < 0 || indexes.soyad < 0)) missingHeaders.push('AD SOYAD');
  if (indexes.bolum < 0) missingHeaders.push('BOLUM');
  if (indexes.bolum2 < 0) missingHeaders.push('BOLUM 2');
  if (indexes.rol < 0) missingHeaders.push('ROL');
  if (indexes.makina < 0) missingHeaders.push('MAKINA ADI');
  result.missingHeaders = missingHeaders;

  if (missingHeaders.length > 0 || rows.length < 2) return result;

  const baseId = Date.now();
  let vardiyaSeq = 0;
  let mudahaleSeq = 0;
  let makinaSeq = 0;

  const getValue = (row: string[], index: number) => {
    if (index < 0) return '';
    const value = row[index];
    return value == null ? '' : String(value).trim();
  };

  rows.slice(1).forEach((row) => {
    const vardiyaValue = getValue(row, indexes.vardiya);
    if (vardiyaValue) {
      const match = vardiyaValue.match(/^(.*)\((.*)\)$/);
      const ad = match ? match[1].trim() : vardiyaValue.trim();
      const saat = match ? match[2].trim() : '';
      if (!ad || !saat) {
        result.skipped += 1;
      } else {
        result.vardiyalar.push({ id: `VARDIYA_${baseId}_${vardiyaSeq++}`, ad, saat });
      }
    }

    const mudahaleValue = getValue(row, indexes.mudahale);
    if (mudahaleValue) {
      result.mudahaleTurleri.push({ id: `MT_${baseId}_${mudahaleSeq++}`, ad: mudahaleValue });
    }

    const sicilNo = getValue(row, indexes.sicilNo);
    const bolumAna = getValue(row, indexes.bolum);
    const bolum2 = getValue(row, indexes.bolum2);
    let ad = getValue(row, indexes.ad);
    let soyad = getValue(row, indexes.soyad);
    const adSoyad = getValue(row, indexes.adSoyad);
    const rol = getValue(row, indexes.rol);

    if ((!ad || !soyad) && adSoyad) {
      const parts = adSoyad.split(/\s+/).filter(Boolean);
      if (!ad) ad = parts.shift() || '';
      if (!soyad) soyad = parts.join(' ');
    }

    const bolum = normalizePersonnelDepartment(bolumAna, bolum2);

    if (sicilNo || ad || soyad || bolumAna || bolum2 || adSoyad || rol) {
      if (!sicilNo || !ad || !soyad || !bolum) {
        result.skipped += 1;
      } else {
        result.personelListesi.push({
          sicilNo,
          ad,
          soyad,
          bolum,
          adSoyad: `${ad} ${soyad}`.trim(),
          rol: rol || undefined
        });
      }
    }

    const makinaValue = getValue(row, indexes.makina);
    if (makinaValue) {
      result.makinaListesi.push({ id: `MAK_${baseId}_${makinaSeq++}`, ad: makinaValue });
    }
  });

  return result;
}

type IsgTemplateKey =
'uygunsuzluk2026' |
'uygunsuzluk2025' |
'caprazDenetim' |
'durumKaynakliKazalar' |
'ramakKala' |
'ifadeGelmeyenler' |
'sariKartGelmeyenler';

type IsgTemplateDefinition = {
  key: IsgTemplateKey;
  title: string;
  description: string;
  templateFileName: string;
  headers: string[];
  sampleRow: string[];
};

type IsgImportDataset = {
  templateKey: IsgTemplateKey;
  title: string;
  headers: string[];
  sourceFileName: string;
  uploadedAt: string;
  rowCount: number;
  rows: Array<Record<string, string>>;
};

type IsgImportsState = Partial<Record<IsgTemplateKey, IsgImportDataset>>;

const ISG_UYGUNSUZLUK_HEADERS = [
'RISK DERECESI',
'SIRA',
'TARIH',
'BILDIRIMI YAPAN',
'BILDIRIMI YAPAN BOLUM/BIRIM',
'UYGUNSUZLUK TANIMI',
'TEHLIKELI DURUM',
'ILGILI BOLUM/BIRIM',
'AKSIYON DURUMU',
'TERMIN'];


const ISG_TEMPLATE_DEFINITIONS: IsgTemplateDefinition[] = [
{
  key: 'uygunsuzluk2026',
  title: 'Uygunsuzluklar (2026)',
  description: "2026 yılı uygunsuzluk kayıtlarını yüklemek için kullanılır.",
  templateFileName: 'isg_uygunsuzluk_2026_sablon.xlsx',
  headers: ISG_UYGUNSUZLUK_HEADERS,
  sampleRow: [
  'SARI',
  '1',
  '02.01.2026',
  'BERKAY ASLAN',
  'ISG',
  '10. BMK FLOOP SEPET MOTORU SALLANTILI CALISIYOR.',
  'HASARLI EKIPMAN',
  'M. BAKIM',
  'GIDERILDI',
  '']

},
{
  key: 'uygunsuzluk2025',
  title: 'Uygunsuzluklar (2025)',
  description: "2025 yılı uygunsuzluk kayıtlarını yüklemek için kullanılır.",
  templateFileName: 'isg_uygunsuzluk_2025_sablon.xlsx',
  headers: ISG_UYGUNSUZLUK_HEADERS,
  sampleRow: [
  'KIRMIZI',
  '3298',
  '24.10.2025',
  'OGUZ BEKTAS',
  'HAT BORULAR',
  '11 BMK DOGRULTMA GIRISI MOTOR MUHAFAZA KAPAKLARI YOK',
  'MUHAFAZA EKSIKLIGI',
  'E. BAKIM-1',
  'DEVAM EDIYOR',
  '']

},
{
  key: 'caprazDenetim',
  title: 'Çapraz Denetim Uygunsuzluklar',
  description: "Çapraz denetim uygunsuzluk kayıtları bu alandan yüklenir.",
  templateFileName: 'isg_capraz_denetim_sablon.xlsx',
  headers: ['SATIR ETIKETLERI', 'DEVAM EDIYOR', 'GIDERILDI', 'GENEL TOPLAM'],
  sampleRow: ['E. BAKIM', '178', '398', '576']
},
{
  key: 'durumKaynakliKazalar',
  title: "Durum Kaynaklı Kazalar",
  description: "Durum kaynaklı kaza kayıtları ve aksiyon durumları bu alandan yüklenir.",
  templateFileName: 'isg_durum_kaynakli_kazalar_sablon.xlsx',
  headers: [
  'KAZA IFADE',
  'DUR/DAV',
  'TARIH',
  'SAAT',
  'SICIL',
  'KAZAZEDE',
  'BOLUM',
  'KAZA TURU',
  'YARALANAN UZUV',
  'HASTANE',
  'IS KAZASI',
  'SGK BILDIRIM',
  'ISTIRAHAT',
  'DURUM KAYNAKLI AKSIYON',
  'DAVRANIS KAYNAKLI AKSIYON'],

  sampleRow: [
  'TUTANAK',
  'DUR.',
  '02/01/2024',
  '21:00',
  '117964',
  'ALI CEYLAN',
  'ISLEM HATLARI',
  'BURKULMA',
  'AYAK',
  'OSM. YENI HAYAT H.',
  'EVET',
  'EVET',
  '0',
  'GIDERILDI',
  'X']

},
{
  key: 'ramakKala',
  title: 'Ramak Kala',
  description: "Ramak kala kayıtları ve bekleyen kayıtlar bu alandan yüklenir.",
  templateFileName: 'isg_ramak_kala_sablon.xlsx',
  headers: [
  'NO',
  'TARIH',
  'BILDIRIMI YAPAN',
  'BILDIRIMI YAPAN BOLUM/BIRIM',
  'RAMAK KALAN OLAY',
  'ILGILI BOLUM/BIRIM',
  'AKSIYON DURUMU',
  'MADDI HASAR',
  'MADDI HASAR YAKLASIK BEDEL(TL)'],

  sampleRow: [
  '1',
  '1/2/24',
  'MUSTAFA BELEN',
  'ISLEM HATLARI',
  'TAVLAMA CIKISI PAKET KALDIRMA ESNASINDA SAPAN KOPMASI',
  'ISLEM HATLARI',
  'GIDERILDI',
  'EVET',
  '2000']

},
{
  key: 'ifadeGelmeyenler',
  title: 'Ifade Gelmeyenler',
  description: "Kaza ifade gelmeyen kayıtlar bu alandan yüklenir.",
  templateFileName: 'isg_ifade_gelmeyenler_sablon.xlsx',
  headers: [
  'KAZA IFADE',
  'DUR/DAV',
  'TARIH',
  'SAAT',
  'SICIL',
  'KAZAZEDE',
  'BOLUM',
  'KAZA TURU',
  'YARALANAN UZUV',
  'HASTANE',
  'IS KAZASI',
  'SGK BILDIRIM',
  'ISTIRAHAT',
  'DURUM KAYNAKLI AKSIYON',
  'DAVRANIS KAYNAKLI AKSIYON'],

  sampleRow: [
  'GELMEDI',
  'DUR.',
  '10/01/2025',
  '07:00',
  '113769',
  'ALI ULVI GUNSUR',
  'ISLEM HATLARI',
  'KAYIP DUSMEK',
  'GOVDE',
  'OSM. YENI HAYAT H.',
  'EVET',
  'EVET',
  '0',
  'GIDERILDI',
  'X']

},
{
  key: 'sariKartGelmeyenler',
  title: 'Sari Kart Gelmeyenler',
  description: "Sari kartta savunma gelmeyen kayıtlar bu alandan yüklenir.",
  templateFileName: 'isg_sari_kart_gelmeyenler_sablon.xlsx',
  headers: [
  'SIRA',
  'TARIH',
  'SICIL NO',
  'ADI SOYADI',
  'BIRIMI',
  'UYARI NEDENI',
  'UYARI TIPI',
  'KIM TARAFINDAN',
  'UYGULAYAN BIRIM',
  'SAVUNMASI'],

  sampleRow: [
  '1',
  '1/2/25',
  '114932',
  'SEDAT KARA',
  'HAT BORULAR',
  'MESAI SAATLERI ICERISINDE UYUMAK',
  'TALIMATA AYKIRI DAVRANMAK',
  'ALPARSLAN DURMUSCAN',
  'ISG',
  'GELDI']

}];


const ISG_TEMPLATE_BY_KEY = ISG_TEMPLATE_DEFINITIONS.reduce<Record<IsgTemplateKey, IsgTemplateDefinition>>(
  (acc, definition) => {
    acc[definition.key] = definition;
    return acc;
  },
  {} as Record<IsgTemplateKey, IsgTemplateDefinition>
);

type DurusTemplateKey =
'durusKayitlari' |
'durusOranlari';

type DurusTemplateDefinition = {
  key: DurusTemplateKey;
  title: string;
  description: string;
  templateFileName: string;
  headers: string[];
  sampleRow: string[];
  headerAliases?: Partial<Record<string, string[]>>;
};

type DurusImportDataset = {
  templateKey: DurusTemplateKey;
  title: string;
  headers: string[];
  sourceFileName: string;
  uploadedAt: string;
  rowCount: number;
  rows: Array<Record<string, string>>;
};

type DurusMonthImports = Partial<Record<DurusTemplateKey, DurusImportDataset>>;

type DurusImportsState = {
  activeMonth?: string;
  months?: Record<string, DurusMonthImports>;
} & Partial<Record<DurusTemplateKey, DurusImportDataset>>;

type CustomGroupDepartment = 'electrical' | 'mechanical' | 'helper';

type DurusCustomMachineGroup = {
  id: string;
  name: string;
  machines: string[];
};

type DurusCustomMachineGroupsState = Record<CustomGroupDepartment, DurusCustomMachineGroup[]>;

const DURUS_CUSTOM_GROUP_LIMIT = 5;

const DURUS_CUSTOM_GROUP_DEPARTMENTS: Array<{key: CustomGroupDepartment;label: string;}> = [
{ key: 'electrical', label: 'Elektrik Bakım' },
{ key: 'mechanical', label: 'Mekanik Bakım' },
{ key: 'helper', label: 'Yardımcı Tesisler' }];


function buildDefaultDurusCustomMachineGroupsState(): DurusCustomMachineGroupsState {
  return {
    electrical: [],
    mechanical: [],
    helper: []
  };
}

const DURUS_TEMPLATE_DEFINITIONS: DurusTemplateDefinition[] = [
{
  key: 'durusKayitlari',
  title: 'Duruş Analizi Kayıtları',
  description: "Duruş detay kayıtları (iş yeri, bölüm, duruş tanımı, süre, açıklama) bu dosya ile yüklenir.",
  templateFileName: 'durus_analizi_kayitlari_sablon.xlsx',
  headers: [
  'ISYERI',
  'BOLUM TANIMI',
  'DURUS TANIMI',
  'VARDIYA',
  'BASLANGIC TARIHI',
  'BASLANGIC SAATI',
  'BITIS SAATI',
  'TOPLAM DURUS (DAK)',
  'ACIKLAMA',
  'BITIS TARIHI',
  'BOLUM KODU'],

  sampleRow: [
  'O_BMK_01',
  'ELEKTRIK BAKIM',
  'ROLE YOLU',
  'VRD1',
  '2026-02-01 00:00:00',
  '01:00:00',
  '01:35:00',
  '35',
  'ROLA YOLU RAMPA ZINCIRININ CALISMAMASI',
  '2026-02-01 00:00:00',
  '030'],

  headerAliases: {
    'ISYERI': ['IS YERI', 'İŞYERİ', 'İŞ YERİ'],
    'BOLUM TANIMI': ['BÖLÜM TANIMI', 'BOLUM', 'BÖLÜM'],
    'DURUS TANIMI': ['DURUŞ TANIMI', 'DURUS'],
    'BASLANGIC TARIHI': ['BAŞLANGIÇ TARİHİ', 'BASLANGIC TARIH'],
    'BASLANGIC SAATI': ['BAŞLANGIÇ SAATİ', 'BASLANGIC SAAT'],
    'BITIS SAATI': ['BİTİŞ SAATİ', 'BITIS SAAT'],
    'TOPLAM DURUS (DAK)': ['TOPLAM DURUŞ (DAK)', 'TOPLAM DURUS DAK', 'TOPLAM DURUŞ DAK'],
    'ACIKLAMA': ['AÇIKLAMA'],
    'BITIS TARIHI': ['BİTİŞ TARİHİ', 'BITIS TARIH'],
    'BOLUM KODU': ['BÖLÜM KODU']
  }
},
{
  key: 'durusOranlari',
  title: "Duruş Analizi Oranları",
  description: "Makina bazlı duruş oranları ve verimlilik değerleri bu dosya ile yüklenir.",
  templateFileName: 'durus_analizi_oranlari_sablon.xlsx',
  headers: [
  'MAKINE',
  'URETIM(KG)',
  'MUMKUN CALISMA(DK)',
  'FIILI CALISMA(DK)',
  'TOPLAM DURUS',
  '% ZAMAN VERIMLILIGI',
  'YARDIMCI TESIS(DK)',
  'ISLETME(DK)',
  'MEKANIK(DK)',
  'ELEKTRIK(DK)',
  '% YARDIMCI TESIS',
  '% ISLETME',
  '% MEKANIK',
  '% ELEKTRIK'],

  sampleRow: [
  'O_BMK_01',
  '2556556',
  '27450',
  '20519',
  '6931',
  '74.75',
  '70',
  '1665',
  '409',
  '540',
  '0.26',
  '6.07',
  '1.49',
  '1.97']

}];


const DURUS_TEMPLATE_BY_KEY = DURUS_TEMPLATE_DEFINITIONS.reduce<Record<DurusTemplateKey, DurusTemplateDefinition>>(
  (acc, definition) => {
    acc[definition.key] = definition;
    return acc;
  },
  {} as Record<DurusTemplateKey, DurusTemplateDefinition>
);

type ParsedIsgDataset = {
  rows: Array<Record<string, string>>;
  missingHeaders: string[];
};

function parseIsgDatasetRows(
rows: string[][],
headers: string[],
headerAliases?: Partial<Record<string, string[]>>)
: ParsedIsgDataset {
  const result: ParsedIsgDataset = {
    rows: [],
    missingHeaders: []
  };

  if (!rows.length) return result;

  const maxHeaderScanRows = Math.min(rows.length, 10);
  let selectedHeaderIndexes: Array<{name: string;index: number;}> = [];
  let selectedMissingHeaders: string[] = headers;
  let selectedHeaderRowIndex = 0;
  let bestMatchedCount = -1;

  for (let rowIndex = 0; rowIndex < maxHeaderScanRows; rowIndex += 1) {
    const normalizedHeaderRow = rows[rowIndex].map((cell) => normalizeHeader(String(cell || '')));
    const headerIndexes = headers.map((header) => ({
      name: header,
      index: normalizedHeaderRow.findIndex((value) => {
        const expectedValues = [
        normalizeHeader(header),
        ...(headerAliases?.[header] || []).map((alias) => normalizeHeader(alias))];

        return expectedValues.includes(value);
      })
    }));

    const missingHeaders = headerIndexes.
    filter((item) => item.index < 0).
    map((item) => item.name);

    const matchedCount = headerIndexes.length - missingHeaders.length;
    if (matchedCount > bestMatchedCount) {
      bestMatchedCount = matchedCount;
      selectedHeaderIndexes = headerIndexes;
      selectedMissingHeaders = missingHeaders;
      selectedHeaderRowIndex = rowIndex;
    }

    if (missingHeaders.length === 0) break;
  }

  if (selectedMissingHeaders.length > 0) {
    result.missingHeaders = selectedMissingHeaders;
    return result;
  }

  result.rows = rows.slice(selectedHeaderRowIndex + 1).flatMap((row) => {
    const parsedRow: Record<string, string> = {};
    let hasAnyValue = false;

    selectedHeaderIndexes.forEach((header) => {
      const rawValue = header.index < 0 ? '' : row[header.index];
      const value = rawValue == null ? '' : String(rawValue).trim();
      parsedRow[header.name] = value;
      if (value) hasAnyValue = true;
    });

    return hasAnyValue ? [parsedRow] : [];
  });

  return result;
}

function normalizeIsgImportsState(value: unknown): IsgImportsState {
  if (!value || typeof value !== 'object') return {};

  const source = value as Record<string, unknown>;
  const normalized: IsgImportsState = {};

  ISG_TEMPLATE_DEFINITIONS.forEach((definition) => {
    const raw = source[definition.key];
    if (!raw || typeof raw !== 'object') return;

    const rawDataset = raw as Record<string, unknown>;
    const rawRows = Array.isArray(rawDataset.rows) ? rawDataset.rows : [];
    const rows = rawRows.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const rowData = item as Record<string, unknown>;
      const mapped: Record<string, string> = {};
      let hasAnyValue = false;

      definition.headers.forEach((header) => {
        const text = String(rowData[header] ?? '').trim();
        mapped[header] = text;
        if (text) hasAnyValue = true;
      });

      return hasAnyValue ? [mapped] : [];
    });

    const sourceFileName = String(rawDataset.sourceFileName || '').trim();
    const uploadedAtRaw = String(rawDataset.uploadedAt || '').trim();
    const uploadedAt = Number.isNaN(new Date(uploadedAtRaw).getTime()) ? '' : uploadedAtRaw;

    normalized[definition.key] = {
      templateKey: definition.key,
      title: definition.title,
      headers: [...definition.headers],
      sourceFileName,
      uploadedAt,
      rowCount: rows.length,
      rows
    };
  });

  return normalized;
}

function normalizeMonthKey(value: unknown): string {
  const text = String(value ?? '').trim();
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(text) ? text : '';
}

function buildCurrentMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

const DURUS_YEAR_OPTIONS = ['2025', '2026'] as const;
const DURUS_MONTH_PART_OPTIONS = [
{ value: '01', label: 'Ocak' },
{ value: '02', label: 'Şubat' },
{ value: '03', label: 'Mart' },
{ value: '04', label: 'Nisan' },
{ value: '05', label: 'Mayis' },
{ value: '06', label: 'Haziran' },
{ value: '07', label: 'Temmuz' },
{ value: '08', label: 'Ağustos' },
{ value: '09', label: 'Eylül' },
{ value: '10', label: 'Ekim' },
{ value: '11', label: 'Kasım' },
{ value: '12', label: 'Aralık' }] as
const;

function splitMonthKeyParts(monthKey: string): {year: string;month: string;} {
  const normalized = normalizeMonthKey(monthKey) || buildCurrentMonthKey();
  return {
    year: normalized.slice(0, 4),
    month: normalized.slice(5, 7)
  };
}

function buildMonthKeyFromParts(year: string, month: string): string {
  const normalizedYear = /^\d{4}$/.test(year) ? year : '';
  const normalizedMonth = /^(0[1-9]|1[0-2])$/.test(month) ? month : '';
  if (!normalizedYear || !normalizedMonth) return '';
  return `${normalizedYear}-${normalizedMonth}`;
}

function buildInitialDurusMonthKey(date: Date = new Date()): string {
  const currentMonthKey = buildCurrentMonthKey(date);
  const { year, month } = splitMonthKeyParts(currentMonthKey);
  const targetYear = DURUS_YEAR_OPTIONS.includes(year as typeof DURUS_YEAR_OPTIONS[number]) ?
  year :
  DURUS_YEAR_OPTIONS[DURUS_YEAR_OPTIONS.length - 1];
  return `${targetYear}-${month}`;
}

function sortMonthKeysDesc(monthKeys: string[]): string[] {
  return [...monthKeys].sort((a, b) => b.localeCompare(a, 'tr-TR'));
}

function formatMonthLabel(monthKey: string): string {
  const normalized = normalizeMonthKey(monthKey);
  if (!normalized) return '-';
  const parsed = new Date(`${normalized}-01T00:00:00`);
  return Number.isNaN(parsed.getTime()) ?
  normalized :
  parsed.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
}

function normalizeDurusImportDataset(
raw: unknown,
definition: DurusTemplateDefinition)
: DurusImportDataset | null {
  if (!raw || typeof raw !== 'object') return null;

  const rawDataset = raw as Record<string, unknown>;
  const rawRows = Array.isArray(rawDataset.rows) ? rawDataset.rows : [];
  const rows = rawRows.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const rowData = item as Record<string, unknown>;
    const mapped: Record<string, string> = {};
    let hasAnyValue = false;

    definition.headers.forEach((header) => {
      const text = String(rowData[header] ?? '').trim();
      mapped[header] = text;
      if (text) hasAnyValue = true;
    });

    return hasAnyValue ? [mapped] : [];
  });

  const sourceFileName = String(rawDataset.sourceFileName || '').trim();
  const uploadedAtRaw = String(rawDataset.uploadedAt || '').trim();
  const uploadedAt = Number.isNaN(new Date(uploadedAtRaw).getTime()) ? '' : uploadedAtRaw;

  return {
    templateKey: definition.key,
    title: definition.title,
    headers: [...definition.headers],
    sourceFileName,
    uploadedAt,
    rowCount: rows.length,
    rows
  };
}

function normalizeDurusImportsState(value: unknown): DurusImportsState {
  if (!value || typeof value !== 'object') return {};

  const source = value as Record<string, unknown>;
  const monthMap: Record<string, DurusMonthImports> = {};

  const upsertMonthDataset = (
  monthKey: string,
  templateKey: DurusTemplateKey,
  dataset: DurusImportDataset) =>
  {
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = {};
    }
    monthMap[monthKey][templateKey] = dataset;
  };

  const rawMonths = source.months;
  if (rawMonths && typeof rawMonths === 'object') {
    Object.entries(rawMonths as Record<string, unknown>).forEach(([rawMonthKey, rawMonthValue]) => {
      const monthKey = normalizeMonthKey(rawMonthKey);
      if (!monthKey || !rawMonthValue || typeof rawMonthValue !== 'object') return;

      const monthPayload = rawMonthValue as Record<string, unknown>;
      DURUS_TEMPLATE_DEFINITIONS.forEach((definition) => {
        const dataset = normalizeDurusImportDataset(monthPayload[definition.key], definition);
        if (!dataset) return;
        upsertMonthDataset(monthKey, definition.key, dataset);
      });
    });
  }

  DURUS_TEMPLATE_DEFINITIONS.forEach((definition) => {
    const legacyDataset = normalizeDurusImportDataset(source[definition.key], definition);
    if (!legacyDataset) return;

    const legacyMonth = normalizeMonthKey(String(legacyDataset.uploadedAt || '').slice(0, 7)) || buildCurrentMonthKey();
    upsertMonthDataset(legacyMonth, definition.key, legacyDataset);
  });

  const monthKeys = sortMonthKeysDesc(
    Object.keys(monthMap).filter((monthKey) => {
      const monthData = monthMap[monthKey];
      return Boolean(monthData.durusKayitlari || monthData.durusOranlari);
    })
  );

  if (monthKeys.length === 0) return {};

  const months = monthKeys.reduce<Record<string, DurusMonthImports>>((acc, monthKey) => {
    acc[monthKey] = monthMap[monthKey];
    return acc;
  }, {});

  const activeMonthCandidate = normalizeMonthKey(source.activeMonth);
  const activeMonth = activeMonthCandidate && monthKeys.includes(activeMonthCandidate) ?
  activeMonthCandidate :
  monthKeys[0];

  return {
    activeMonth,
    months
  };
}

function normalizeDurusCustomMachineGroupsState(value: unknown): DurusCustomMachineGroupsState {
  const defaults = buildDefaultDurusCustomMachineGroupsState();
  if (!value || typeof value !== 'object') return defaults;

  const source = value as Record<string, unknown>;
  const result = buildDefaultDurusCustomMachineGroupsState();

  DURUS_CUSTOM_GROUP_DEPARTMENTS.forEach((department) => {
    const rawGroups = source[department.key];
    if (!Array.isArray(rawGroups)) return;

    result[department.key] = rawGroups.flatMap((item, index) => {
      if (!item || typeof item !== 'object') return [];
      const row = item as Record<string, unknown>;
      const name = String(row.name || '').trim();
      if (!name) return [];

      const machineValues = Array.isArray(row.machines) ? row.machines : [];
      const machines = machineValues.
      map((machine) => String(machine || '').trim()).
      filter(Boolean);
      const uniqueMachines = Array.from(new Set(machines));
      if (uniqueMachines.length === 0) return [];

      return [{
        id: String(row.id || `${department.key}_${index + 1}`),
        name,
        machines: uniqueMachines
      }];
    }).slice(0, DURUS_CUSTOM_GROUP_LIMIT);
  });

  return result;
}

type TabType =
'vardiyalar' |
'mudahaleTurleri' |
'personel' |
'makinalar' |
'fiveS' |
'isg' |
'durusAnalizi';

const SETTINGS_TAB_VALUES: readonly TabType[] = [
'vardiyalar',
'mudahaleTurleri',
'personel',
'makinalar',
'fiveS',
'isg',
'durusAnalizi'];


function parseSettingsTab(value: string | null): TabType | null {
  if (!value) return null;
  return SETTINGS_TAB_VALUES.includes(value as TabType) ? value as TabType : null;
}

const MIN_BACKUP_INTERVAL_MINUTES = 5;
const MAX_BACKUP_INTERVAL_MINUTES = 24 * 60;

const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  enabled: true,
  intervalMinutes: 120,
  backupDir: '',
  includeDatabase: true,
  includeCompletedExcel: true
};

function formatStatusDate(value: string | null | undefined): string {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleString('tr-TR');
}

type AyarlarProps = {
  initialTab?: TabType;
  durusOnly?: boolean;
};

export default function Ayarlar({
  initialTab = 'vardiyalar',
  durusOnly = false
}: AyarlarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = parseSettingsTab(searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState<TabType>(() =>
  durusOnly ? 'durusAnalizi' : queryTab ?? initialTab
  );
  const currentUser = useAuthStore((state) => state.user);
  const canManagePasswords = isSystemAdminUser(currentUser);
  const queryClient = useQueryClient();

  const defaultLists = buildDefaultSettingsLists();

  // Data states
  const [vardiyalar, setVardiyalar] = useState<Vardiya[]>(defaultLists.vardiyalar);
  const [mudahaleTurleri, setMudahaleTurleri] = useState<MudahaleTuru[]>(defaultLists.mudahaleTurleri);
  const [personelListesi, setPersonelListesi] = useState<Personel[]>(defaultLists.personelListesi);
  const [makinaListesi, setMakinaListesi] = useState<Makina[]>(defaultLists.makinaListesi);
  const [isListsLoading, setIsListsLoading] = useState(true);
  const [isListsSaving, setIsListsSaving] = useState(false);
  const [templateBusy, setTemplateBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserPassword, setSelectedUserPassword] = useState('');
  const [backupSettings, setBackupSettings] = useState<BackupSettings>(DEFAULT_BACKUP_SETTINGS);
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [isBackupLoading, setIsBackupLoading] = useState(true);
  const [dashboardFiveSLevels, setDashboardFiveSLevels] = useState<DashboardFiveSLevelsState>(
    buildDefaultDashboardFiveSLevels()
  );
  const [isDashboardFiveSLoading, setIsDashboardFiveSLoading] = useState(true);
  const [isDashboardFiveSSaving, setIsDashboardFiveSSaving] = useState(false);
  const [isgImports, setIsgImports] = useState<IsgImportsState>({});
  const [isIsgImportsLoading, setIsIsgImportsLoading] = useState(true);
  const [isIsgImportsSaving, setIsIsgImportsSaving] = useState(false);
  const [isgUploadBusyKey, setIsgUploadBusyKey] = useState<IsgTemplateKey | null>(null);
  const [durusImports, setDurusImports] = useState<DurusImportsState>({});
  const [isDurusImportsLoading, setIsDurusImportsLoading] = useState(true);
  const [isDurusImportsSaving, setIsDurusImportsSaving] = useState(false);
  const [durusUploadBusyKey, setDurusUploadBusyKey] = useState<DurusTemplateKey | null>(null);
  const [selectedDurusMonth, setSelectedDurusMonth] = useState<string>(buildInitialDurusMonthKey());
  const [durusCustomGroups, setDurusCustomGroups] = useState<DurusCustomMachineGroupsState>(
    buildDefaultDurusCustomMachineGroupsState()
  );
  const [isDurusCustomGroupsLoading, setIsDurusCustomGroupsLoading] = useState(true);
  const [isDurusCustomGroupsSaving, setIsDurusCustomGroupsSaving] = useState(false);

  const durusMonthOptions = useMemo(() => {
    if (!durusImports.months || typeof durusImports.months !== 'object') return [];

    const monthKeys = Object.keys(durusImports.months).filter((monthKey) => {
      const normalizedMonth = normalizeMonthKey(monthKey);
      if (!normalizedMonth) return false;
      const monthData = durusImports.months?.[monthKey];
      return Boolean(monthData?.durusKayitlari || monthData?.durusOranlari);
    });

    return sortMonthKeysDesc(monthKeys);
  }, [durusImports]);

  const durusMachineOptions = useMemo(() => {
    const labelsByKey = new Map<string, string>();

    const pushRows = (rows: Array<Record<string, string>>, key: string) => {
      rows.forEach((row) => {
        const machine = String(row[key] || '').trim();
        const machineKey = machine.
        replace(/\s+/g, ' ').
        trim().
        toLocaleLowerCase('tr-TR');
        if (!machineKey) return;
        if (!labelsByKey.has(machineKey)) {
          labelsByKey.set(machineKey, machine);
        }
      });
    };

    if (durusImports.months && typeof durusImports.months === 'object') {
      Object.values(durusImports.months).forEach((monthData) => {
        pushRows(monthData?.durusOranlari?.rows || [], 'MAKINE');
      });
    } else {
      pushRows(durusImports.durusOranlari?.rows || [], 'MAKINE');
    }

    return [...labelsByKey.values()].sort((a, b) => a.localeCompare(b, 'tr-TR', { numeric: true, sensitivity: 'base' }));
  }, [durusImports]);

  const persistLists = async (nextLists: SettingsListsState) => {
    try {
      setIsListsSaving(true);
      await appStateApi.set(APP_STATE_KEYS.settingsLists, nextLists);
    } catch {
      toast.error('Liste değişiklikleri kaydedilemedi');
    } finally {
      setIsListsSaving(false);
    }
  };

  const persistDashboardFiveSLevels = async (nextLevels: DashboardFiveSLevelsState) => {
    if (!canManagePasswords) {
      toast.error('Bu alan için yetkiniz yok');
      return;
    }

    try {
      setIsDashboardFiveSSaving(true);
      await appStateApi.set(APP_STATE_KEYS.dashboardFiveSLevels, nextLevels);
      queryClient.invalidateQueries({ queryKey: ['dashboard-five-s-levels'] });
      toast.success('Dashboard 5S seviyeleri kaydedildi');
    } catch {
      toast.error('Dashboard 5S seviyeleri kaydedilemedi');
    } finally {
      setIsDashboardFiveSSaving(false);
    }
  };

  const persistIsgImports = async (nextState: IsgImportsState) => {
    if (!canManagePasswords) {
      toast.error('Bu alan için yetkiniz yok');
      return;
    }

    try {
      setIsIsgImportsSaving(true);
      await appStateApi.set(APP_STATE_KEYS.settingsIsgImports, nextState);
    } catch {
      toast.error('İSG veri yüklemeleri kaydedilemedi');
    } finally {
      setIsIsgImportsSaving(false);
    }
  };

  const persistDurusImports = async (nextState: DurusImportsState) => {
    if (!canManagePasswords) {
      toast.error('Bu alan için yetkiniz yok');
      return;
    }

    try {
      setIsDurusImportsSaving(true);
      await appStateApi.set(APP_STATE_KEYS.settingsDurusAnaliziImports, nextState);
    } catch {
      toast.error('Duruş analizi yüklemeleri kaydedilemedi');
    } finally {
      setIsDurusImportsSaving(false);
    }
  };

  const persistDurusCustomGroups = async (nextState: DurusCustomMachineGroupsState) => {
    if (!canManagePasswords) {
      toast.error('Bu alan için yetkiniz yok');
      return;
    }

    try {
      setIsDurusCustomGroupsSaving(true);
      await appStateApi.set(APP_STATE_KEYS.settingsDurusCustomMachineGroups, nextState);
    } catch {
      toast.error('Duruş özel makina grupları kaydedilemedi');
    } finally {
      setIsDurusCustomGroupsSaving(false);
    }
  };

  const { data: users } = useQuery({
    queryKey: ['settings-users'],
    queryFn: async () => {
      const response = await usersApi.getAll({ aktif: 'true' });
      return response.data.data as User[];
    },
    enabled: canManagePasswords
  });

  const selectedUser = users?.find((user) => user.id === Number.parseInt(selectedUserId, 10));
  const selectedUserLoginName = selectedUser ?
  buildCompactLoginName(selectedUser.ad, selectedUser.soyad) :
  '';
  const selectedUserDefaultPassword = selectedUser ?
  buildDefaultPasswordPreview(selectedUser.ad, selectedUser.soyad) :
  '';

  const applyBackupPayload = (payload: BackupSettingsResponse | undefined) => {
    if (!payload) return;
    setBackupSettings(payload.settings);
    setBackupStatus(payload.status);
  };

  const changeOwnPasswordMutation = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Şifre güncellendi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Şifre güncellenemedi');
    }
  });

  const setUserPasswordMutation = useMutation({
    mutationFn: () => authApi.setUserPassword(Number.parseInt(selectedUserId, 10), selectedUserPassword),
    onSuccess: () => {
      toast.success("Kullanıcı şifresi güncellendi");
      setSelectedUserPassword('');
      queryClient.invalidateQueries({ queryKey: ['settings-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Kullanıcı şifresi güncellenemedi");
    }
  });

  const resetAllPasswordsMutation = useMutation({
    mutationFn: () => authApi.resetAllUserPasswords(),
    onSuccess: (response: any) => {
      const count = response?.data?.data?.count;
      toast.success(typeof count === 'number' ? `${count} kullanıcının şifresi yenilendi` : "Tüm şifreler varsayılan formata çekildi");
      queryClient.invalidateQueries({ queryKey: ['settings-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Toplu şifre güncellenemedi");
    }
  });

  const saveBackupSettingsMutation = useMutation({
    mutationFn: () => backupsApi.updateSettings(backupSettings),
    onSuccess: (response: any) => {
      applyBackupPayload(response?.data?.data as BackupSettingsResponse | undefined);
      toast.success(response?.data?.message || "Yedekleme ayarları kaydedildi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Yedekleme ayarları kaydedilemedi");
    }
  });

  const runBackupNowMutation = useMutation({
    mutationFn: () => backupsApi.runNow(),
    onSuccess: (response: any) => {
      const payload = response?.data?.data as {status?: BackupStatus;} | undefined;
      if (payload?.status) {
        setBackupStatus(payload.status);
      }
      toast.success(response?.data?.message || "Yedekleme tamamlandı");
    },
    onError: (error: any) => {
      const payload = error?.response?.data?.data as {status?: BackupStatus;} | undefined;
      if (payload?.status) {
        setBackupStatus(payload.status);
      }
      toast.error(error?.response?.data?.message || "Yedekleme başlatılamadı");
    }
  });

  const handleDownloadTemplate = () => {
    try {
      const rows = buildTemplateRows(vardiyalar, mudahaleTurleri, personelListesi, makinaListesi);
      const sheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Listeler');
      XLSX.writeFile(workbook, 'cmms_listeler_sablon.xlsx');
    } catch (error) {
      toast.error("Şablon indirilemedi");
    }
  };

  const handleDownloadIsgTemplate = (templateKey: IsgTemplateKey) => {
    const definition = ISG_TEMPLATE_BY_KEY[templateKey];
    if (!definition) return;

    try {
      const sheet = XLSX.utils.aoa_to_sheet([definition.headers, definition.sampleRow]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'ISG');
      XLSX.writeFile(workbook, definition.templateFileName);
    } catch {
      toast.error(`${definition.title} şablonu indirilemedi`);
    }
  };

  const handleIsgTemplateUpload = async (
  templateKey: IsgTemplateKey,
  event: ChangeEvent<HTMLInputElement>) =>
  {
    const definition = ISG_TEMPLATE_BY_KEY[templateKey];
    const file = event.target.files?.[0];
    if (!definition || !file) return;

    setIsgUploadBusyKey(templateKey);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as Array<Array<unknown>>;
      const rows = rawRows.map((row) => row.map((cell) => cell == null ? '' : String(cell)));
      const parsed = parseIsgDatasetRows(rows, definition.headers);

      if (parsed.missingHeaders.length > 0) {
        toast.error(`${definition.title} yüklenemedi. Eksik sutunlar: ${parsed.missingHeaders.join(', ')}`);
        return;
      }

      if (parsed.rows.length === 0) {
        toast.error(`${definition.title} dosyasında aktarılacak satır bulunamadı`);
        return;
      }

      const nextDataset: IsgImportDataset = {
        templateKey,
        title: definition.title,
        headers: [...definition.headers],
        sourceFileName: file.name,
        uploadedAt: new Date().toISOString(),
        rowCount: parsed.rows.length,
        rows: parsed.rows
      };

      const nextState: IsgImportsState = {
        ...isgImports,
        [templateKey]: nextDataset
      };

      setIsgImports(nextState);
      await persistIsgImports(nextState);
      toast.success(`${definition.title} için ${parsed.rows.length} satır yüklendi`);
    } catch {
      toast.error(`${definition.title} dosyasi okunamadi`);
    } finally {
      setIsgUploadBusyKey(null);
      event.target.value = '';
    }
  };

  const handleDownloadDurusTemplate = (templateKey: DurusTemplateKey) => {
    const definition = DURUS_TEMPLATE_BY_KEY[templateKey];
    if (!definition) return;

    try {
      const sheet = XLSX.utils.aoa_to_sheet([definition.headers, definition.sampleRow]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'DuruşAnalizi');
      XLSX.writeFile(workbook, definition.templateFileName);
    } catch {
      toast.error(`${definition.title} şablonu indirilemedi`);
    }
  };

  const handleDownloadDurusUploadedFile = (templateKey: DurusTemplateKey, monthInput: string) => {
    const definition = DURUS_TEMPLATE_BY_KEY[templateKey];
    if (!definition) return;

    const monthKey = normalizeMonthKey(monthInput) || normalizeMonthKey(selectedDurusMonth);
    const dataset =
      (monthKey ? durusImports.months?.[monthKey]?.[templateKey] : null) ||
      durusImports[templateKey];

    if (!dataset || !Array.isArray(dataset.rows) || dataset.rows.length === 0) {
      toast.error(`${definition.title} için indirilecek kayıt bulunamadı`);
      return;
    }

    try {
      const headers =
        Array.isArray(dataset.headers) && dataset.headers.length > 0 ?
        dataset.headers :
        definition.headers;

      const bodyRows = dataset.rows.map((row) => headers.map((header) => String(row[header] ?? '')));
      const sheet = XLSX.utils.aoa_to_sheet([headers, ...bodyRows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'DuruşAnalizi');

      const fallbackName = `${definition.key}_${monthKey || 'veri'}.xlsx`;
      const originalName = String(dataset.sourceFileName || '').trim();
      const safeName = (originalName || fallbackName).replace(/[\\/:*?"<>|]+/g, '_');
      const fileName = /\.xlsx$/i.test(safeName) || /\.xls$/i.test(safeName) ? safeName : `${safeName}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch {
      toast.error(`${definition.title} yüklenen dosyası indirilemedi`);
    }
  };

  const handleDurusTemplateUpload = async (
  templateKey: DurusTemplateKey,
  event: ChangeEvent<HTMLInputElement>,
  monthInput: string) =>
  {
    const definition = DURUS_TEMPLATE_BY_KEY[templateKey];
    const file = event.target.files?.[0];
    if (!definition || !file) return;

    const monthKey = normalizeMonthKey(monthInput);
    if (!monthKey) {
      toast.error("Lütfen once gecerli bir ay seçin");
      event.target.value = '';
      return;
    }

    const monthYear = monthKey.slice(0, 4);
    if (!DURUS_YEAR_OPTIONS.includes(monthYear as typeof DURUS_YEAR_OPTIONS[number])) {
      toast.error("Duruş veri yüklemesi sadece 2025 ve 2026 yılları için yapılabilir");
      event.target.value = '';
      return;
    }

    setDurusUploadBusyKey(templateKey);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as Array<Array<unknown>>;
      const rows = rawRows.map((row) => row.map((cell) => cell == null ? '' : String(cell)));
      const parsed = parseIsgDatasetRows(rows, definition.headers, definition.headerAliases);

      if (parsed.missingHeaders.length > 0) {
        toast.error(`${definition.title} yüklenemedi. Eksik sutunlar: ${parsed.missingHeaders.join(', ')}`);
        return;
      }

      if (parsed.rows.length === 0) {
        toast.error(`${definition.title} dosyasında aktarılacak satır bulunamadı`);
        return;
      }

      const nextDataset: DurusImportDataset = {
        templateKey,
        title: definition.title,
        headers: [...definition.headers],
        sourceFileName: file.name,
        uploadedAt: new Date().toISOString(),
        rowCount: parsed.rows.length,
        rows: parsed.rows
      };

      const nextState: DurusImportsState = {
        ...durusImports,
        activeMonth: monthKey,
        months: {
          ...(durusImports.months || {}),
          [monthKey]: {
            ...(durusImports.months?.[monthKey] || {}),
            [templateKey]: nextDataset
          }
        }
      };

      setDurusImports(nextState);
      setSelectedDurusMonth(monthKey);
      await persistDurusImports(nextState);
      toast.success(`${definition.title} için ${formatMonthLabel(monthKey)} ayında ${parsed.rows.length} satır yüklendi`);
    } catch {
      toast.error(`${definition.title} dosyasi okunamadi`);
    } finally {
      setDurusUploadBusyKey(null);
      event.target.value = '';
    }
  };

  const handleAddDurusCustomGroup = async (
  department: CustomGroupDepartment,
  nameInput: string,
  machinesInput: string[])
  : Promise<boolean> => {
    if (!canManagePasswords) {
      toast.error('Bu alan için yetkiniz yok');
      return false;
    }

    const name = String(nameInput || '').trim();
    const machines = Array.from(new Set(machinesInput.map((machine) => String(machine || '').trim()).filter(Boolean)));

    if (!name) {
      toast.error('Grup adı zorunludur');
      return false;
    }

    if (machines.length === 0) {
      toast.error("En az bir makine seçmelisiniz");
      return false;
    }

    const currentGroups = durusCustomGroups[department];
    const lowerName = name.toLocaleLowerCase('tr-TR');

    if (durusMachineOptions.some((machine) => machine.toLocaleLowerCase('tr-TR') === lowerName)) {
      toast.error('Grup adı mevcut makina/grup adlarıyla çakışmamalıdır');
      return false;
    }

    if (currentGroups.length >= DURUS_CUSTOM_GROUP_LIMIT) {
      toast.error(`${DURUS_CUSTOM_GROUP_LIMIT} adetten fazla grup eklenemez`);
      return false;
    }

    if (currentGroups.some((item) => item.name.trim().toLocaleLowerCase('tr-TR') === lowerName)) {
      toast.error("Ayni bölümde bu isimde bir grup zaten var");
      return false;
    }

    const nextGroup: DurusCustomMachineGroup = {
      id: `grp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      machines
    };

    const nextState: DurusCustomMachineGroupsState = {
      ...durusCustomGroups,
      [department]: [...currentGroups, nextGroup]
    };

    setDurusCustomGroups(nextState);
    await persistDurusCustomGroups(nextState);
    toast.success(`${name} grubu eklendi`);
    return true;
  };

  const handleRemoveDurusCustomGroup = async (
  department: CustomGroupDepartment,
  groupId: string) =>
  {
    if (!canManagePasswords) {
      toast.error('Bu alan için yetkiniz yok');
      return;
    }

    const currentGroups = durusCustomGroups[department];
    const target = currentGroups.find((item) => item.id === groupId);
    if (!target) return;

    const nextState: DurusCustomMachineGroupsState = {
      ...durusCustomGroups,
      [department]: currentGroups.filter((item) => item.id !== groupId)
    };

    setDurusCustomGroups(nextState);
    await persistDurusCustomGroups(nextState);
    toast.success(`${target.name} grubu silindi`);
  };

  const handleTemplateUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setTemplateBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as Array<Array<unknown>>;
      const rows = rawRows.map((row) => row.map((cell) => cell == null ? '' : String(cell)));
      const parsed = parseTemplateRows(rows);

      if (parsed.missingHeaders.length > 0) {
        toast.error(`Şablon hatalı. Eksik sutunlar: ${parsed.missingHeaders.join(', ')}`);
        return;
      }

      const uniqueByKey = <T,>(items: T[], keyFn: (item: T) => string) => {
        const seen = new Set<string>();
        return items.filter((item) => {
          const key = keyFn(item).trim().toLocaleLowerCase('tr-TR');
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };

      const mergedVardiyalar = uniqueByKey(parsed.vardiyalar, (item) => item.ad);
      const mergedMudahaleTurleri = uniqueByKey(parsed.mudahaleTurleri, (item) => item.ad);
      const mergedPersonel = sortPersonelListesiByName(
        uniqueByKey(parsed.personelListesi, (item) => item.sicilNo)
      );
      const mergedMakina = sortMakinaListesiByName(
        uniqueByKey(parsed.makinaListesi, (item) => item.ad)
      );

      const appliedCount =
      mergedVardiyalar.length +
      mergedMudahaleTurleri.length +
      mergedPersonel.length +
      mergedMakina.length;

      setVardiyalar(mergedVardiyalar);
      setMudahaleTurleri(mergedMudahaleTurleri);
      setPersonelListesi(mergedPersonel);
      setMakinaListesi(mergedMakina);

      void persistLists({
        vardiyalar: mergedVardiyalar,
        mudahaleTurleri: mergedMudahaleTurleri,
        personelListesi: mergedPersonel,
        makinaListesi: mergedMakina
      });

      const skippedNote = parsed.skipped ? `, ${parsed.skipped} satır atlandı` : '';
      toast.success(`Eski listeler temizlendi, Excel'den ${appliedCount} kayıt yüklendi${skippedNote}`);
    } catch (error) {
      toast.error('Dosya okunamadi');
    } finally {
      setTemplateBusy(false);
      event.target.value = '';
    }
  };

  // Load shared lists from API
  useEffect(() => {
    const loadLists = async () => {
      try {
        setIsListsLoading(true);
        const response = await appStateApi.get(APP_STATE_KEYS.settingsLists);
        const payload = response.data?.data?.value;
        const normalized = normalizeSettingsLists(payload);
        setVardiyalar(normalized.vardiyalar);
        setMudahaleTurleri(normalized.mudahaleTurleri);
        setPersonelListesi(normalized.personelListesi);
        setMakinaListesi(normalized.makinaListesi);
      } catch {
        const fallback = buildDefaultSettingsLists();
        setVardiyalar(fallback.vardiyalar);
        setMudahaleTurleri(fallback.mudahaleTurleri);
        setPersonelListesi(fallback.personelListesi);
        setMakinaListesi(fallback.makinaListesi);
        toast.error("Merkezi listeler yüklenemedi, varsayılan liste kullanildi");
      } finally {
        setIsListsLoading(false);
      }
    };

    void loadLists();
  }, []);

  useEffect(() => {
    const loadBackupSettings = async () => {
      if (!canManagePasswords) {
        setIsBackupLoading(false);
        return;
      }

      try {
        setIsBackupLoading(true);
        const response = await backupsApi.getSettings();
        applyBackupPayload(response?.data?.data as BackupSettingsResponse | undefined);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Yedekleme ayarları yüklenemedi");
      } finally {
        setIsBackupLoading(false);
      }
    };

    void loadBackupSettings();
  }, [canManagePasswords]);

  useEffect(() => {
    const loadDashboardFiveSLevels = async () => {
      try {
        setIsDashboardFiveSLoading(true);
        const response = await appStateApi.get(APP_STATE_KEYS.dashboardFiveSLevels);
        const normalized = normalizeDashboardFiveSLevels(response.data?.data?.value);
        setDashboardFiveSLevels(normalized);
      } catch {
        setDashboardFiveSLevels(buildDefaultDashboardFiveSLevels());
        toast.error("Dashboard 5S seviyeleri yüklenemedi, varsayılan değerler kullanildi");
      } finally {
        setIsDashboardFiveSLoading(false);
      }
    };

    void loadDashboardFiveSLevels();
  }, []);

  useEffect(() => {
    const loadIsgImports = async () => {
      try {
        setIsIsgImportsLoading(true);
        const response = await appStateApi.get(APP_STATE_KEYS.settingsIsgImports);
        const normalized = normalizeIsgImportsState(response.data?.data?.value);
        setIsgImports(normalized);
      } catch {
        setIsgImports({});
        toast.error('İSG veri yüklemeleri yüklenemedi');
      } finally {
        setIsIsgImportsLoading(false);
      }
    };

    void loadIsgImports();
  }, []);

  useEffect(() => {
    const loadDurusImports = async () => {
      try {
        setIsDurusImportsLoading(true);
        const response = await appStateApi.get(APP_STATE_KEYS.settingsDurusAnaliziImports);
        const normalized = normalizeDurusImportsState(response.data?.data?.value);
        setDurusImports(normalized);
      } catch {
        setDurusImports({});
        toast.error('Duruş analizi yüklemeleri yüklenemedi');
      } finally {
        setIsDurusImportsLoading(false);
      }
    };

    void loadDurusImports();
  }, []);

  useEffect(() => {
    const loadDurusCustomGroups = async () => {
      try {
        setIsDurusCustomGroupsLoading(true);
        const response = await appStateApi.get(APP_STATE_KEYS.settingsDurusCustomMachineGroups);
        const normalized = normalizeDurusCustomMachineGroupsState(response.data?.data?.value);
        setDurusCustomGroups(normalized);
      } catch {
        setDurusCustomGroups(buildDefaultDurusCustomMachineGroupsState());
        toast.error("Duruş özel makina grupları yüklenemedi");
      } finally {
        setIsDurusCustomGroupsLoading(false);
      }
    };

    void loadDurusCustomGroups();
  }, []);

  useEffect(() => {
    const normalizedSelected = normalizeMonthKey(selectedDurusMonth);
    if (!normalizedSelected) {
      setSelectedDurusMonth(buildInitialDurusMonthKey());
      return;
    }

    const { year, month } = splitMonthKeyParts(normalizedSelected);
    if (!DURUS_YEAR_OPTIONS.includes(year as typeof DURUS_YEAR_OPTIONS[number])) {
      setSelectedDurusMonth(`${DURUS_YEAR_OPTIONS[DURUS_YEAR_OPTIONS.length - 1]}-${month}`);
    }
  }, [selectedDurusMonth]);

  useEffect(() => {
    if (durusOnly) return;
    if (!queryTab) return;
    if (queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [durusOnly, queryTab, activeTab]);

  const tabs = durusOnly ?
  [{ id: 'durusAnalizi' as TabType, label: 'Duruş Analizi' }] :
  [
  { id: 'fiveS' as TabType, label: '5S' },
  { id: 'isg' as TabType, label: "İSG Veri" },
  { id: 'durusAnalizi' as TabType, label: 'Duruş Analizi' },
  { id: 'vardiyalar' as TabType, label: 'Vardiyalar' },
  { id: 'mudahaleTurleri' as TabType, label: 'Müdahale Türleri' },
  { id: 'personel' as TabType, label: 'Personel' },
  { id: 'makinalar' as TabType, label: 'Makinalar' }];


  const handleOwnPasswordSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Tüm şifre alanlarini doldurun");
      return;
    }
    if (!isPasswordPolicyCompliant(newPassword)) {
      toast.error(PASSWORD_POLICY_TEXT);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }
    changeOwnPasswordMutation.mutate();
  };

  const handleSetUserPassword = () => {
    if (!selectedUserId) {
      toast.error("Lütfen bir kullanıcı seçin");
      return;
    }
    if (!selectedUserPassword || !isPasswordPolicyCompliant(selectedUserPassword.trim())) {
      toast.error(PASSWORD_POLICY_TEXT);
      return;
    }
    setUserPasswordMutation.mutate();
  };

  const handleResetAllPasswords = () => {
    if (!confirm("Tüm kullanıcıların şifresi varsayılan kurala göre güncellensin mi?")) return;
    resetAllPasswordsMutation.mutate();
  };

  const handleSaveBackupSettings = () => {
    if (!canManagePasswords) {
      toast.error('Bu alan için yetkiniz yok');
      return;
    }

    const intervalMinutes = Number.parseInt(String(backupSettings.intervalMinutes), 10);
    if (Number.isNaN(intervalMinutes)) {
      toast.error("Yedekleme aralığı gecersiz");
      return;
    }
    if (intervalMinutes < MIN_BACKUP_INTERVAL_MINUTES || intervalMinutes > MAX_BACKUP_INTERVAL_MINUTES) {
      toast.error(`Yedekleme aralığı ${MIN_BACKUP_INTERVAL_MINUTES}-${MAX_BACKUP_INTERVAL_MINUTES} dakika arasinda olmalidir`);
      return;
    }
    if (!backupSettings.backupDir.trim()) {
      toast.error("Yedek klasörü bos olamaz");
      return;
    }
    if (!backupSettings.includeDatabase && !backupSettings.includeCompletedExcel) {
      toast.error("En az bir yedekleme içeriği seçilmelidir");
      return;
    }

    saveBackupSettingsMutation.mutate();
  };

  const handleRunBackupNow = () => {
    if (!canManagePasswords) {
      toast.error('Bu alan için yetkiniz yok');
      return;
    }
    runBackupNowMutation.mutate();
  };

  const handleDashboardFiveSLevelChange = (departmentId: string, nextLevel: string) => {
    if (!(FIVE_S_LEVEL_OPTIONS as readonly string[]).includes(nextLevel)) return;
    setDashboardFiveSLevels((prev) => ({
      ...prev,
      [departmentId]: nextLevel as DashboardFiveSLevelsState[string]
    }));
  };

  const backupLastResultLabel = backupStatus?.lastResult === 'success' ?
  'Başarılı' :
  backupStatus?.lastResult === 'error' ?
  'Hatalı' :
  'Henüz çalışmadı';

  if (durusOnly) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Duruş Analizi</h1>
        <div className="card p-6">
          <DurusDataTab
            isLoading={isDurusImportsLoading}
            isSaving={isDurusImportsSaving}
            busyKey={durusUploadBusyKey}
            imports={durusImports}
            selectedMonth={selectedDurusMonth}
            monthOptions={durusMonthOptions}
            onMonthChange={setSelectedDurusMonth}
            customGroups={durusCustomGroups}
            customGroupsLoading={isDurusCustomGroupsLoading}
            customGroupsSaving={isDurusCustomGroupsSaving}
            machineOptions={durusMachineOptions}
            onAddCustomGroup={handleAddDurusCustomGroup}
            onRemoveCustomGroup={handleRemoveDurusCustomGroup}
            onDownloadTemplate={handleDownloadDurusTemplate}
            onDownloadUploadedFile={handleDownloadDurusUploadedFile}
            onUpload={handleDurusTemplateUpload} />
          
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ayarlar - Liste Yönetimi</h1>
      {(isListsLoading || isListsSaving) &&
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
          {isListsLoading ? "Merkezi listeler yükleniyor..." : 'Liste değişiklikleri kaydediliyor...'}
        </div>
      }

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Kendi Şifremi Değiştir</h2>
            <p className="text-xs text-gray-500">Bu alandan mevcut hesabınızın şifresini değiştirebilirsiniz.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Mevcut Şifre</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input" />
              
            </div>
            <div>
              <label className="label">Yeni Şifre</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input" />
              
            </div>
            <div>
              <label className="label">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input" />
              
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOwnPasswordSubmit}
              disabled={changeOwnPasswordMutation.isPending}>
              
              {changeOwnPasswordMutation.isPending ? 'Kaydediliyor...' : 'Şifremi Güncelle'}
            </button>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Kullanıcı Şifre Yönetimi</h2>
            <p className="text-xs text-gray-500">
              Berke Karayanik/sistem yöneticisi bu bölümden tüm kullanıcıların şifresini yönetebilir.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Kullanıcı Seç</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input"
                disabled={!canManagePasswords}>
                
                <option value="">Seçiniz</option>
                {(users || []).map((user) =>
                <option key={user.id} value={user.id}>
                    {user.ad} {user.soyad} ({user.sicilNo})
                  </option>
                )}
              </select>
            </div>

            {selectedUser &&
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
                <p><span className="font-semibold">Giriş Adi:</span> {selectedUserLoginName}</p>
                <p><span className="font-semibold">Varsayılan Şifre:</span> {selectedUserDefaultPassword}</p>
              </div>
            }

            <div>
              <label className="label">Yeni Şifre</label>
              <input
                type="text"
                value={selectedUserPassword}
                onChange={(e) => setSelectedUserPassword(e.target.value)}
                className="input"
                placeholder="Orn: Mk123456"
                disabled={!canManagePasswords} />
              
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetAllPasswords}
              disabled={!canManagePasswords || resetAllPasswordsMutation.isPending}>
              
              {resetAllPasswordsMutation.isPending ? 'Toplu isleniyor...' : "Tümunu Varsayılan Şifreye Çek"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSetUserPassword}
              disabled={!canManagePasswords || setUserPasswordMutation.isPending}>
              
              {setUserPasswordMutation.isPending ? 'Kaydediliyor...' : "Seçili Kullanıcı Şifresini Değiştir"}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Varsayılan giriş kurali: kullanıcı adi = adsoyad, şifre = ad/soyad bas harfleri (ilk harf buyuk) + 123456 (Orn: Mk123456)
          </p>
        </div>
      </div>

      {canManagePasswords &&
      <div className="card p-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Otomatik Yedekleme</h2>
              <p className="text-xs text-gray-500">
                Yedek hedef klasörü seçip otomatik yedekleme araligini buradan yönetin.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRunBackupNow}
              disabled={isBackupLoading || runBackupNowMutation.isPending || backupStatus?.isRunning}>
              
                {runBackupNowMutation.isPending || backupStatus?.isRunning ? 'Yedekleniyor...' : "Şimdi Yedek Al"}
              </button>
              <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveBackupSettings}
              disabled={isBackupLoading || saveBackupSettingsMutation.isPending}>
              
                {saveBackupSettingsMutation.isPending ? 'Kaydediliyor...' : 'Yedek Ayarlarını Kaydet'}
              </button>
            </div>
          </div>

          {isBackupLoading ?
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
              Yedekleme ayarları yükleniyor...
            </div> :

        <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <input
                type="checkbox"
                checked={backupSettings.enabled}
                onChange={(event) => setBackupSettings((prev) => ({
                  ...prev,
                  enabled: event.target.checked
                }))} />
              
                  Otomatik yedekleme aktif
                </label>

                <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <input
                type="checkbox"
                checked={backupSettings.includeDatabase}
                onChange={(event) => setBackupSettings((prev) => ({
                  ...prev,
                  includeDatabase: event.target.checked
                }))} />
              
                  Veritabani yedegi al
                </label>

                <div>
                  <label className="label">Yedek Klasörü</label>
                  <input
                type="text"
                value={backupSettings.backupDir}
                onChange={(event) => setBackupSettings((prev) => ({
                  ...prev,
                  backupDir: event.target.value
                }))}
                className="input"
                placeholder="Orn: D:\\CMMS_BACKUP" />
              
                </div>

                <div>
                  <label className="label">Yedekleme Aralığı (dk)</label>
                  <input
                type="number"
                min={MIN_BACKUP_INTERVAL_MINUTES}
                max={MAX_BACKUP_INTERVAL_MINUTES}
                value={backupSettings.intervalMinutes}
                onChange={(event) => setBackupSettings((prev) => {
                  const next = Number.parseInt(event.target.value, 10);
                  return {
                    ...prev,
                    intervalMinutes: Number.isNaN(next) ? prev.intervalMinutes : next
                  };
                })}
                className="input" />
              
                </div>
              </div>

              <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                <input
              type="checkbox"
              checked={backupSettings.includeCompletedExcel}
              onChange={(event) => setBackupSettings((prev) => ({
                ...prev,
                includeCompletedExcel: event.target.checked
              }))} />
            
                Tamamlanan isleri ayrı Excel dosyasi olarak yedekle
              </label>

              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-700 space-y-1">
                <p><span className="font-semibold">Son Durum:</span> {backupLastResultLabel}</p>
                <p><span className="font-semibold">Son Çalışma:</span> {formatStatusDate(backupStatus?.lastRunAt)}</p>
                <p><span className="font-semibold">Son Başarılı Çalışma:</span> {formatStatusDate(backupStatus?.lastSuccessAt)}</p>
                <p><span className="font-semibold">Son Tetikleme:</span> {backupStatus?.lastTrigger || '-'}</p>
                <p><span className="font-semibold">Sonraki Çalışma:</span> {formatStatusDate(backupStatus?.nextRunAt)}</p>
                <p><span className="font-semibold">Son Hedef Klasor:</span> {backupStatus?.lastOutputDir || '-'}</p>
                <p><span className="font-semibold">Son Hata:</span> {backupStatus?.lastError || '-'}</p>
                <p><span className="font-semibold">Son Uretilen Dosyalar:</span></p>
                {backupStatus?.lastFiles?.length ?
            <ul className="list-disc pl-4 space-y-1">
                    {backupStatus.lastFiles.map((filePath) =>
              <li key={filePath} className="break-all">{filePath}</li>
              )}
                  </ul> :

            <p>-</p>
            }
              </div>
            </>
        }
        </div>
      }

      <div className="card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">Excel şablonu</p>
            <p className="text-xs text-gray-500">
              Kolon sırası: VARDIYA, MUDAHALE TURU, PERSONEL NO, AD SOYAD, BOLUM, BOLUM 2, ROL, MAKINA ADI.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={templateBusy}
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
            
            <Download className="h-4 w-4" />
            Excel indir
          </button>
        </div>
        <label className="mt-4 inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:border-gray-400">
          <Upload className="h-4 w-4" />
          Excel Yükle
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleTemplateUpload}
            className="hidden"
            disabled={templateBusy} />
          
        </label>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              const nextParams = new URLSearchParams(searchParams);
              if (tab.id === 'vardiyalar') {
                nextParams.delete('tab');
              } else {
                nextParams.set('tab', tab.id);
              }
              setSearchParams(nextParams, { replace: true });
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === tab.id ?
            'border-blue-500 text-blue-600' :
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
            }>
            
              {tab.label}
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'fiveS' &&
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold text-lg">5S Ayarları</h3>
                <p className="text-xs text-gray-500">Seçilen değerler Dashboard'a ayni sekilde yansir.</p>
              </div>
              <button
              type="button"
              onClick={() => void persistDashboardFiveSLevels(dashboardFiveSLevels)}
              disabled={!canManagePasswords || isDashboardFiveSLoading || isDashboardFiveSSaving}
              className="btn btn-primary">
              
                {isDashboardFiveSSaving ? 'Kaydediliyor...' : '5S Seviyelerini Kaydet'}
              </button>
            </div>

            {!canManagePasswords &&
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                Bu alanı sadece sistem yöneticisi veya Berke Karayanik düzenleyebilir.
              </div>
          }

            {isDashboardFiveSLoading ?
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
                Dashboard 5S seviyeleri yükleniyor...
              </div> :

          <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Bölüm</th>
                      <th className="px-4 py-3 text-left md:w-64">Mevcut 5S Seviyesi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {DASHBOARD_FIVE_S_DEPARTMENTS.map((department) =>
                <tr key={department.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{department.name}</td>
                        <td className="px-4 py-3">
                          <select
                      value={dashboardFiveSLevels[department.id]}
                      onChange={(event) => handleDashboardFiveSLevelChange(department.id, event.target.value)}
                      className="input"
                      disabled={!canManagePasswords || isDashboardFiveSSaving}>
                      
                            {FIVE_S_LEVEL_OPTIONS.map((option) =>
                      <option key={option} value={option}>
                                {option}
                              </option>
                      )}
                          </select>
                        </td>
                      </tr>
                )}
                  </tbody>
                </table>
              </div>
          }
          </div>
        }
        {activeTab === 'isg' &&
        <IsgDataTab
          isLoading={isIsgImportsLoading}
          isSaving={isIsgImportsSaving}
          busyKey={isgUploadBusyKey}
          imports={isgImports}
          onDownloadTemplate={handleDownloadIsgTemplate}
          onUpload={handleIsgTemplateUpload} />

        }
        {activeTab === 'durusAnalizi' &&
        <DurusDataTab
          isLoading={isDurusImportsLoading}
          isSaving={isDurusImportsSaving}
          busyKey={durusUploadBusyKey}
          imports={durusImports}
          selectedMonth={selectedDurusMonth}
          monthOptions={durusMonthOptions}
          onMonthChange={setSelectedDurusMonth}
          customGroups={durusCustomGroups}
          customGroupsLoading={isDurusCustomGroupsLoading}
          customGroupsSaving={isDurusCustomGroupsSaving}
          machineOptions={durusMachineOptions}
          onAddCustomGroup={handleAddDurusCustomGroup}
          onRemoveCustomGroup={handleRemoveDurusCustomGroup}
          onDownloadTemplate={handleDownloadDurusTemplate}
          onDownloadUploadedFile={handleDownloadDurusUploadedFile}
          onUpload={handleDurusTemplateUpload} />

        }
        {activeTab === 'vardiyalar' &&
        <VardiyalarTab
          data={vardiyalar}
          setData={(data) => {
            setVardiyalar(data);
            void persistLists({
              vardiyalar: data,
              mudahaleTurleri,
              personelListesi,
              makinaListesi
            });
          }} />

        }
        {activeTab === 'mudahaleTurleri' &&
        <MudahaleTurleriTab
          data={mudahaleTurleri}
          setData={(data) => {
            setMudahaleTurleri(data);
            void persistLists({
              vardiyalar,
              mudahaleTurleri: data,
              personelListesi,
              makinaListesi
            });
          }} />

        }
        {activeTab === 'personel' &&
        <PersonelTab
          data={personelListesi}
          setData={(data) => {
            const sortedData = sortPersonelListesiByName(data);
            setPersonelListesi(sortedData);
            void persistLists({
              vardiyalar,
              mudahaleTurleri,
              personelListesi: sortedData,
              makinaListesi
            });
          }} />

        }
        {activeTab === 'makinalar' &&
        <MakinalarTab
          data={makinaListesi}
          setData={(data) => {
            setMakinaListesi(data);
            void persistLists({
              vardiyalar,
              mudahaleTurleri,
              personelListesi,
              makinaListesi: data
            });
          }} />

        }
      </div>
    </div>);

}

function IsgDataTab({
  isLoading,
  isSaving,
  busyKey,
  imports,
  onDownloadTemplate,
  onUpload







}: {isLoading: boolean;isSaving: boolean;busyKey: IsgTemplateKey | null;imports: IsgImportsState;onDownloadTemplate: (key: IsgTemplateKey) => void;onUpload: (key: IsgTemplateKey, event: ChangeEvent<HTMLInputElement>) => void;}) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
        İSG veri yüklemeleri okunuyor...
      </div>);

  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-800">
        Bu bölüm sadece İSG verileri içindir. Vardiya/müdahale/personel/makina Excel şablonundan tamamen ayrıdır.
      </div>

      {isSaving &&
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
          İSG veri yüklemeleri kaydediliyor...
        </div>
      }

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ISG_TEMPLATE_DEFINITIONS.map((definition) => {
          const dataset = imports[definition.key];
          const isBusy = busyKey === definition.key;
          const canDownload = !isBusy;
          const canUpload = !isBusy;

          return (
            <div key={definition.key} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{definition.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{definition.description}</p>
              </div>

              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                <p><span className="font-semibold">Şablon:</span> {definition.templateFileName}</p>
                <p><span className="font-semibold">Gerekli Sutunlar:</span> {definition.headers.join(', ')}</p>
                <p><span className="font-semibold">Son Dosya:</span> {dataset?.sourceFileName || '-'}</p>
                <p><span className="font-semibold">Son Yükleme:</span> {formatStatusDate(dataset?.uploadedAt)}</p>
                <p><span className="font-semibold">Kayıt Sayısı:</span> {dataset?.rowCount ?? 0}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onDownloadTemplate(definition.key)}
                  disabled={!canDownload}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
                  
                  <Download className="h-4 w-4" />
                  Şablon Indir
                </button>

                <label className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${canUpload ? 'border-gray-300 text-gray-700 hover:border-gray-400' : 'border-gray-200 text-gray-400'}`}>
                  <Upload className="h-4 w-4" />
                  {isBusy ? 'Yükleniyor...' : 'Excel Yükle'}
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(event) => onUpload(definition.key, event)}
                    className="hidden"
                    disabled={!canUpload} />
                  
                </label>
              </div>
            </div>);

        })}
      </div>
    </div>);

}

function DurusDataTab({
  isLoading,
  isSaving,
  busyKey,
  imports,
  selectedMonth,
  monthOptions,
  onMonthChange,
  customGroups,
  customGroupsLoading,
  customGroupsSaving,
  machineOptions,
  onAddCustomGroup,
  onRemoveCustomGroup,
  onDownloadTemplate,
  onDownloadUploadedFile,
  onUpload























}: {isLoading: boolean;isSaving: boolean;busyKey: DurusTemplateKey | null;imports: DurusImportsState;selectedMonth: string;monthOptions: string[];onMonthChange: (monthKey: string) => void;customGroups: DurusCustomMachineGroupsState;customGroupsLoading: boolean;customGroupsSaving: boolean;machineOptions: string[];onAddCustomGroup: (department: CustomGroupDepartment, name: string, machines: string[]) => Promise<boolean>;onRemoveCustomGroup: (department: CustomGroupDepartment, groupId: string) => Promise<void>;onDownloadTemplate: (key: DurusTemplateKey) => void;onDownloadUploadedFile: (key: DurusTemplateKey, monthKey: string) => void;onUpload: (key: DurusTemplateKey, event: ChangeEvent<HTMLInputElement>, monthKey: string) => void;}) {
  const [draftGroupNames, setDraftGroupNames] = useState<Record<CustomGroupDepartment, string>>({
    electrical: '',
    mechanical: '',
    helper: ''
  });
  const [draftGroupMachines, setDraftGroupMachines] = useState<Record<CustomGroupDepartment, string[]>>({
    electrical: [],
    mechanical: [],
    helper: []
  });

  if (isLoading) {
    return (
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
        Duruş analizi veri yüklemeleri okunuyor...
      </div>);

  }

  const normalizedSelectedMonth = normalizeMonthKey(selectedMonth) || buildInitialDurusMonthKey();
  const selectedMonthLabel = normalizedSelectedMonth ? formatMonthLabel(normalizedSelectedMonth) : '-';
  const { year: selectedYearPart, month: selectedMonthPart } = splitMonthKeyParts(normalizedSelectedMonth);
  const recordedMonthsOfSelectedYear = monthOptions.filter((monthKey) => monthKey.startsWith(`${selectedYearPart}-`));

  const monthlyUploadStatus = DURUS_MONTH_PART_OPTIONS.map((monthOption) => {
    const monthKey = `${selectedYearPart}-${monthOption.value}`;
    const monthData = imports.months?.[monthKey];
    return {
      monthKey,
      monthLabel: monthOption.label,
      hasKayit: Boolean(monthData?.durusKayitlari),
      hasOran: Boolean(monthData?.durusOranlari)
    };
  });

  const handleYearChange = (nextYear: string) => {
    const nextMonthKey = buildMonthKeyFromParts(nextYear, selectedMonthPart);
    if (!nextMonthKey) return;
    onMonthChange(nextMonthKey);
  };

  const handleMonthPartChange = (nextMonthPart: string) => {
    const nextMonthKey = buildMonthKeyFromParts(selectedYearPart, nextMonthPart);
    if (!nextMonthKey) return;
    onMonthChange(nextMonthKey);
  };

  const handleDraftMachineChange = (department: CustomGroupDepartment, values: string[]) => {
    setDraftGroupMachines((prev) => ({
      ...prev,
      [department]: values
    }));
  };

  const handleCustomGroupAddClick = async (department: CustomGroupDepartment) => {
    const name = draftGroupNames[department];
    const machines = draftGroupMachines[department];
    const added = await onAddCustomGroup(department, name, machines);
    if (!added) return;

    setDraftGroupNames((prev) => ({
      ...prev,
      [department]: ''
    }));
    setDraftGroupMachines((prev) => ({
      ...prev,
      [department]: []
    }));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-800">
        Bu bölüm sadece duruş analizi verileri içindir. İSG ve liste şablonlarından bağımsızdır.
      </div>

      <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="durus-year-select" className="mb-1 block text-xs font-semibold text-gray-600">Yükleme Yılı</label>
            <select
              id="durus-year-select"
              value={selectedYearPart}
              onChange={(event) => handleYearChange(event.target.value)}
              className="input text-sm">
              
              {DURUS_YEAR_OPTIONS.map((year) =>
              <option key={year} value={year}>{year}</option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="durus-month-part-select" className="mb-1 block text-xs font-semibold text-gray-600">Yükleme Ayi</label>
            <select
              id="durus-month-part-select"
              value={selectedMonthPart}
              onChange={(event) => {
                handleMonthPartChange(event.target.value);
              }}
              className="input text-sm">
              
              {DURUS_MONTH_PART_OPTIONS.map((monthOption) =>
              <option key={monthOption.value} value={monthOption.value}>{monthOption.label}</option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="durus-recorded-months-select" className="mb-1 block text-xs font-semibold text-gray-600">Kayıtli Aylar ({selectedYearPart})</label>
            <select
              id="durus-recorded-months-select"
              value={recordedMonthsOfSelectedYear.includes(normalizedSelectedMonth) ? normalizedSelectedMonth : ''}
              onChange={(event) => {
                if (!event.target.value) return;
                onMonthChange(event.target.value);
              }}
              className="input text-sm">
              
              <option value="">Kayıtli ay seç</option>
              {recordedMonthsOfSelectedYear.map((monthKey) =>
              <option key={monthKey} value={monthKey}>{formatMonthLabel(monthKey)}</option>
              )}
            </select>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-500">Seçili ay: {selectedMonthLabel}</p>

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          {monthlyUploadStatus.map((item) => {
            const isSelected = item.monthKey === normalizedSelectedMonth;
            return (
              <button
                key={item.monthKey}
                type="button"
                onClick={() => onMonthChange(item.monthKey)}
                className={`rounded-md border px-2 py-2 text-left text-xs ${
                isSelected ?
                'border-gray-900 bg-gray-900 text-white' :
                item.hasKayit && item.hasOran ?
                'border-emerald-300 bg-emerald-50 text-emerald-800' :
                item.hasKayit || item.hasOran ?
                'border-amber-300 bg-amber-50 text-amber-800' :
                'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`
                }
                title={item.monthKey}>
                
                <p className="font-semibold">{item.monthLabel}</p>
                <p className="mt-0.5 text-[11px]">{item.hasKayit ? 'Kayıt: Var' : 'Kayıt: Yok'}</p>
                <p className="text-[11px]">{item.hasOran ? 'Oran: Var' : 'Oran: Yok'}</p>
              </button>);

          })}
        </div>
      </div>

      {isSaving &&
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
          Duruş analizi veri yüklemeleri kaydediliyor...
        </div>
      }

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {DURUS_TEMPLATE_DEFINITIONS.map((definition) => {
          const dataset = imports.months?.[selectedMonth]?.[definition.key] || imports[definition.key];
          const isBusy = busyKey === definition.key;
          const canDownload = !isBusy;
          const canDownloadUploaded = !isBusy && Boolean(dataset?.rows?.length);
          const canUpload = !isBusy && Boolean(normalizedSelectedMonth);

          return (
            <div key={definition.key} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{definition.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{definition.description}</p>
              </div>

              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                <p><span className="font-semibold">Şablon:</span> {definition.templateFileName}</p>
                <p><span className="font-semibold">Gerekli Sutunlar:</span> {definition.headers.join(', ')}</p>
                <p><span className="font-semibold">Seçili Ay:</span> {selectedMonthLabel}</p>
                <p><span className="font-semibold">Son Dosya:</span> {dataset?.sourceFileName || '-'}</p>
                <p><span className="font-semibold">Son Yükleme:</span> {formatStatusDate(dataset?.uploadedAt)}</p>
                <p><span className="font-semibold">Kayıt Sayısı:</span> {dataset?.rowCount ?? 0}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onDownloadTemplate(definition.key)}
                  disabled={!canDownload}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
                  
                  <Download className="h-4 w-4" />
                  Şablon Indir
                </button>

                <button
                  type="button"
                  onClick={() => onDownloadUploadedFile(definition.key, normalizedSelectedMonth)}
                  disabled={!canDownloadUploaded}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-400 disabled:opacity-60">
                  
                  <Download className="h-4 w-4" />
                  Yüklenen Dosyayı İndir
                </button>

                <label className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${canUpload ? 'border-gray-300 text-gray-700 hover:border-gray-400' : 'border-gray-200 text-gray-400'}`}>
                  <Upload className="h-4 w-4" />
                  {isBusy ? 'Yükleniyor...' : 'Excel Yükle'}
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(event) => onUpload(definition.key, event, normalizedSelectedMonth)}
                    className="hidden"
                    disabled={!canUpload} />
                  
                </label>
              </div>
            </div>);

        })}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Özel Makina Grupları</h3>
          <p className="mt-1 text-xs text-gray-500">
            Elektrik/Mekanik/Yardımcı bölümleri için isim vererek makina grubu oluşturun. Her bölümde en fazla {DURUS_CUSTOM_GROUP_LIMIT} grup tanımlanabilir.
          </p>
        </div>

        {customGroupsSaving &&
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            Özel makina grupları kaydediliyor...
          </div>
        }

        {customGroupsLoading ?
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            Özel makina grupları yükleniyor...
          </div> :

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {DURUS_CUSTOM_GROUP_DEPARTMENTS.map((department) => {
            const groups = customGroups[department.key];
            const draftName = draftGroupNames[department.key];
            const draftMachines = draftGroupMachines[department.key];
            const canAdd = groups.length < DURUS_CUSTOM_GROUP_LIMIT;

            return (
              <div key={department.key} className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">{department.label}</p>
                    <span className="text-xs text-gray-500">{groups.length}/{DURUS_CUSTOM_GROUP_LIMIT}</span>
                  </div>

                  <div className="space-y-2">
                    {groups.length === 0 &&
                  <p className="text-xs text-gray-500">Henüz grup tanımlanmadı.</p>
                  }
                    {groups.map((group) =>
                  <div key={group.id} className="rounded-md border border-gray-200 bg-white px-2 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{group.name}</p>
                            <p className="text-xs text-gray-500">{group.machines.join(', ')}</p>
                          </div>
                          <button
                        type="button"
                        onClick={() => void onRemoveCustomGroup(department.key, group.id)}
                        className="inline-flex items-center rounded-md border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50"
                        title="Grubu Sil">
                        
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                  )}
                  </div>

                  <div className="space-y-2 border-t border-gray-200 pt-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">Grup Adi</label>
                      <input
                      type="text"
                      className="input text-sm"
                      placeholder="Orn: Konvansiyonel"
                      value={draftName}
                      onChange={(event) => setDraftGroupNames((prev) => ({
                        ...prev,
                        [department.key]: event.target.value
                      }))}
                      disabled={!canAdd} />
                    
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">Makinalar</label>
                      {machineOptions.length === 0 &&
                    <p className="mb-1 text-xs text-amber-700">
                          Önce Duruş Analizi Oranları dosyasını yükleyin. Grup makinaları bu veriden seçilir.
                        </p>
                    }
                      <select
                      multiple
                      className="input min-h-[120px] text-sm"
                      value={draftMachines}
                      onChange={(event) => {
                        const values = Array.from(event.target.selectedOptions).map((option) => option.value);
                        handleDraftMachineChange(department.key, values);
                      }}
                      disabled={!canAdd}>
                      
                        {machineOptions.map((machine) =>
                      <option key={machine} value={machine}>{machine}</option>
                      )}
                      </select>
                    </div>

                    <button
                    type="button"
                    onClick={() => void handleCustomGroupAddClick(department.key)}
                    disabled={!canAdd || machineOptions.length === 0}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
                    
                      <Plus className="h-4 w-4" />
                      Ozel Grup Ekle
                    </button>
                  </div>
                </div>);

          })}
          </div>
        }
      </div>
    </div>);

}

// Vardiyalar Tab
function VardiyalarTab({ data, setData }: {data: Vardiya[];setData: (data: Vardiya[]) => void;}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', ad: '', saat: '' });

  const handleAdd = () => {
    if (!form.ad || !form.saat) {
      toast.error('Tüm alanları doldurun');
      return;
    }
    const newId = 'VARDIYA_' + Date.now();
    setData([...data, { id: newId, ad: form.ad, saat: form.saat }]);
    setForm({ id: '', ad: '', saat: '' });
    toast.success('Vardiya eklendi');
  };

  const handleEdit = (item: Vardiya) => {
    setEditId(item.id);
    setForm({ id: item.id, ad: item.ad, saat: item.saat });
  };

  const handleSave = () => {
    setData(data.map((v) => v.id === editId ? { ...form } : v));
    setEditId(null);
    setForm({ id: '', ad: '', saat: '' });
    toast.success('Vardiya güncellendi');
  };

  const handleDelete = (id: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      setData(data.filter((v) => v.id !== id));
      toast.success('Vardiya silindi');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Vardiyalar</h3>

      {/* Add Form */}
      <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Vardiya Adı (örn: VARDIYA 1)"
          value={editId ? '' : form.ad}
          onChange={(e) => setForm({ ...form, ad: e.target.value })}
          className="flex-1 px-3 py-2 border rounded-md"
          disabled={!!editId} />
        
        <input
          type="text"
          placeholder="Saat (örn: 08:00-16:00)"
          value={editId ? '' : form.saat}
          onChange={(e) => setForm({ ...form, saat: e.target.value })}
          className="flex-1 px-3 py-2 border rounded-md"
          disabled={!!editId} />
        
        <button
          onClick={handleAdd}
          disabled={!!editId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Vardiya Adı</th>
              <th className="px-4 py-3 text-left">Saat</th>
              <th className="px-4 py-3 text-center w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((item) =>
            <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editId === item.id ?
                <input
                  type="text"
                  value={form.ad}
                  onChange={(e) => setForm({ ...form, ad: e.target.value })}
                  className="w-full px-2 py-1 border rounded" /> :

                item.ad}
                </td>
                <td className="px-4 py-3">
                  {editId === item.id ?
                <input
                  type="text"
                  value={form.saat}
                  onChange={(e) => setForm({ ...form, saat: e.target.value })}
                  className="w-full px-2 py-1 border rounded" /> :

                item.saat}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    {editId === item.id ?
                  <>
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => {setEditId(null);setForm({ id: '', ad: '', saat: '' });}} className="text-gray-600 hover:text-gray-800">
                          <X className="w-4 h-4" />
                        </button>
                      </> :

                  <>
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                  }
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}

// Müdahale Türleri Tab
function MudahaleTurleriTab({ data, setData }: {data: MudahaleTuru[];setData: (data: MudahaleTuru[]) => void;}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', ad: '' });

  const handleAdd = () => {
    if (!form.ad) {
      toast.error('Müdahale türü adı girin');
      return;
    }
    const newId = 'MT_' + Date.now();
    setData(sortMakinaListesiByName([...data, { id: newId, ad: form.ad }]));
    setForm({ id: '', ad: '' });
    toast.success('Müdahale türü eklendi');
  };

  const handleEdit = (item: MudahaleTuru) => {
    setEditId(item.id);
    setForm({ id: item.id, ad: item.ad });
  };

  const handleSave = () => {
    setData(sortMakinaListesiByName(data.map((m) => m.id === editId ? { ...form } : m)));
    setEditId(null);
    setForm({ id: '', ad: '' });
    toast.success('Müdahale türü güncellendi');
  };

  const handleDelete = (id: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      setData(data.filter((m) => m.id !== id));
      toast.success('Müdahale türü silindi');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Müdahale Türleri</h3>

      <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Müdahale Türü (örn: Bakım, Arıza)"
          value={editId ? '' : form.ad}
          onChange={(e) => setForm({ ...form, ad: e.target.value })}
          className="flex-1 px-3 py-2 border rounded-md"
          disabled={!!editId} />
        
        <button
          onClick={handleAdd}
          disabled={!!editId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Müdahale Türü</th>
              <th className="px-4 py-3 text-center w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((item) =>
            <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editId === item.id ?
                <input
                  type="text"
                  value={form.ad}
                  onChange={(e) => setForm({ ...form, ad: e.target.value })}
                  className="w-full px-2 py-1 border rounded" /> :

                item.ad}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    {editId === item.id ?
                  <>
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => {setEditId(null);setForm({ id: '', ad: '' });}} className="text-gray-600 hover:text-gray-800">
                          <X className="w-4 h-4" />
                        </button>
                      </> :

                  <>
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                  }
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}

// Personel Tab
function PersonelTab({ data, setData }: {data: Personel[];setData: (data: Personel[]) => void;}) {
  const [editSicil, setEditSicil] = useState<string | null>(null);
  const [form, setForm] = useState({
    sicilNo: '',
    ad: '',
    soyad: '',
    bolum: '',
    bolum2: '',
    adSoyad: '',
    rol: ''
  });
  const [search, setSearch] = useState('');

  const resetForm = () => {
    setForm({
      sicilNo: '',
      ad: '',
      soyad: '',
      bolum: '',
      bolum2: '',
      adSoyad: '',
      rol: ''
    });
  };

  const handleAdd = () => {
    const bolum = normalizePersonnelDepartment(form.bolum, form.bolum2);
    if (!form.sicilNo || !form.ad || !form.soyad || !bolum) {
      toast.error('Tüm alanlari doldurun');
      return;
    }
    if (data.some((p) => p.sicilNo === form.sicilNo)) {
      toast.error('Bu sicil numarasi zaten mevcut');
      return;
    }

    const newPersonel: Personel = {
      sicilNo: form.sicilNo,
      ad: form.ad,
      soyad: form.soyad,
      bolum,
      adSoyad: `${form.ad} ${form.soyad}`.trim(),
      rol: form.rol.trim() || undefined
    };

    setData([...data, newPersonel]);
    resetForm();
    toast.success('Personel eklendi');
  };

  const handleEdit = (item: Personel) => {
    const bolumParcalari = splitPersonnelDepartment(item.bolum);
    setEditSicil(item.sicilNo);
    setForm({
      sicilNo: item.sicilNo,
      ad: item.ad,
      soyad: item.soyad,
      bolum: bolumParcalari.bolum,
      bolum2: bolumParcalari.bolum2,
      adSoyad: item.adSoyad,
      rol: item.rol || ''
    });
  };

  const handleSave = () => {
    const bolum = normalizePersonnelDepartment(form.bolum, form.bolum2);
    if (!form.ad || !form.soyad || !bolum) {
      toast.error('Tüm alanlari doldurun');
      return;
    }

    setData(data.map((p) =>
    p.sicilNo === editSicil ?
    {
      ...p,
      sicilNo: form.sicilNo,
      ad: form.ad,
      soyad: form.soyad,
      bolum,
      adSoyad: `${form.ad} ${form.soyad}`.trim(),
      rol: form.rol.trim() || undefined
    } :
    p
    ));

    setEditSicil(null);
    resetForm();
    toast.success('Personel güncellendi');
  };

  const handleDelete = (sicilNo: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      setData(data.filter((p) => p.sicilNo !== sicilNo));
      toast.success('Personel silindi');
    }
  };

  const filteredData = data.filter((p) =>
  p.adSoyad.toLowerCase().includes(search.toLowerCase()) || p.sicilNo.includes(search)
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Personel Listesi ({data.length} kişi)</h3>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Sicil No"
          value={editSicil ? '' : form.sicilNo}
          onChange={(e) => setForm({ ...form, sicilNo: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil} />
        
        <input
          type="text"
          placeholder="Ad"
          value={editSicil ? '' : form.ad}
          onChange={(e) => setForm({ ...form, ad: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil} />
        
        <input
          type="text"
          placeholder="Soyad"
          value={editSicil ? '' : form.soyad}
          onChange={(e) => setForm({ ...form, soyad: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil} />
        
        <select
          value={editSicil ? '' : form.bolum}
          onChange={(e) => setForm({ ...form, bolum: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil}>
          
          <option value="">Bölüm Seç</option>
          {PERSONNEL_BASE_DEPARTMENTS.map((b) =>
          <option key={b} value={b}>{b}</option>
          )}
        </select>
        <select
          value={editSicil ? '' : form.bolum2}
          onChange={(e) => setForm({ ...form, bolum2: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil}>
          
          <option value="">Bölüm 2 (Opsiyonel)</option>
          {PERSONNEL_SUB_DEPARTMENTS.filter((b) => b !== '').map((b) =>
          <option key={b} value={b}>{b}</option>
          )}
        </select>
        <input
          type="text"
          placeholder="Rol (Opsiyonel)"
          value={editSicil ? '' : form.rol}
          onChange={(e) => setForm({ ...form, rol: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil} />
        
        <button
          onClick={handleAdd}
          disabled={!!editSicil}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          
          <Plus className="w-5 h-5 mx-auto" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Ara (ad, soyad veya sicil no)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-md" />
      

      <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">Sicil No</th>
              <th className="px-4 py-3 text-left">Ad</th>
              <th className="px-4 py-3 text-left">Soyad</th>
              <th className="px-4 py-3 text-left">Bölüm</th>
              <th className="px-4 py-3 text-left">Bölüm 2</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-center w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredData.map((item) => {
              const bolumParcalari = splitPersonnelDepartment(item.bolum);

              return (
                <tr key={item.sicilNo} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono">{item.sicilNo}</td>
                  <td className="px-4 py-2">
                    {editSicil === item.sicilNo ?
                    <input
                      type="text"
                      value={form.ad}
                      onChange={(e) => setForm({ ...form, ad: e.target.value })}
                      className="w-full px-2 py-1 border rounded" /> :

                    item.ad}
                  </td>
                  <td className="px-4 py-2">
                    {editSicil === item.sicilNo ?
                    <input
                      type="text"
                      value={form.soyad}
                      onChange={(e) => setForm({ ...form, soyad: e.target.value })}
                      className="w-full px-2 py-1 border rounded" /> :

                    item.soyad}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editSicil === item.sicilNo ?
                    <select
                      value={form.bolum}
                      onChange={(e) => setForm({ ...form, bolum: e.target.value })}
                      className="w-full px-2 py-1 border rounded">
                      
                        <option value="">Bölüm Seç</option>
                        {PERSONNEL_BASE_DEPARTMENTS.map((b) =>
                      <option key={b} value={b}>{b}</option>
                      )}
                      </select> :
                    bolumParcalari.bolum}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editSicil === item.sicilNo ?
                    <select
                      value={form.bolum2}
                      onChange={(e) => setForm({ ...form, bolum2: e.target.value })}
                      className="w-full px-2 py-1 border rounded">
                      
                        <option value="">-</option>
                        {PERSONNEL_SUB_DEPARTMENTS.filter((b) => b !== '').map((b) =>
                      <option key={b} value={b}>{b}</option>
                      )}
                      </select> :
                    bolumParcalari.bolum2 || '-'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editSicil === item.sicilNo ?
                    <input
                      type="text"
                      value={form.rol}
                      onChange={(e) => setForm({ ...form, rol: e.target.value })}
                      className="w-full px-2 py-1 border rounded" /> :

                    item.rol || '-'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      {editSicil === item.sicilNo ?
                      <>
                          <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                          onClick={() => {
                            setEditSicil(null);
                            resetForm();
                          }}
                          className="text-gray-600 hover:text-gray-800">
                          
                            <X className="w-4 h-4" />
                          </button>
                        </> :

                      <>
                          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.sicilNo)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      }
                    </div>
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>
    </div>);

}

// Makinalar Tab
function MakinalarTab({ data, setData }: {data: Makina[];setData: (data: Makina[]) => void;}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', ad: '' });
  const [search, setSearch] = useState('');

  const handleAdd = () => {
    if (!form.ad) {
      toast.error('Makina adı girin');
      return;
    }
    const newId = 'MAK_' + Date.now();
    setData([...data, { id: newId, ad: form.ad }]);
    setForm({ id: '', ad: '' });
    toast.success('Makina eklendi');
  };

  const handleEdit = (item: Makina) => {
    setEditId(item.id);
    setForm({ id: item.id, ad: item.ad });
  };

  const handleSave = () => {
    setData(data.map((m) => m.id === editId ? { ...form } : m));
    setEditId(null);
    setForm({ id: '', ad: '' });
    toast.success('Makina güncellendi');
  };

  const handleDelete = (id: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      setData(data.filter((m) => m.id !== id));
      toast.success('Makina silindi');
    }
  };

  const filteredData = data.filter((m) =>
  m.ad.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Makina Listesi ({data.length} makina)</h3>

      <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Makina Adı (örn: 1. BORU MAKİNASI)"
          value={editId ? '' : form.ad}
          onChange={(e) => setForm({ ...form, ad: e.target.value })}
          className="flex-1 px-3 py-2 border rounded-md"
          disabled={!!editId} />
        
        <button
          onClick={handleAdd}
          disabled={!!editId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-md" />
      

      <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">Makina Adı</th>
              <th className="px-4 py-3 text-center w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredData.map((item) =>
            <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editId === item.id ?
                <input
                  type="text"
                  value={form.ad}
                  onChange={(e) => setForm({ ...form, ad: e.target.value })}
                  className="w-full px-2 py-1 border rounded" /> :

                item.ad}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    {editId === item.id ?
                  <>
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => {setEditId(null);setForm({ id: '', ad: '' });}} className="text-gray-600 hover:text-gray-800">
                          <X className="w-4 h-4" />
                        </button>
                      </> :

                  <>
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                  }
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}
