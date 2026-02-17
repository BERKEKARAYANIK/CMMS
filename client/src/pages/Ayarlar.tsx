import { useState, useEffect, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Save, X, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { appStateApi, authApi, backupsApi, usersApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';
import type {
  BackupSettings,
  BackupSettingsResponse,
  BackupStatus
} from '../types/backups';
import {
  type Vardiya,
  type MudahaleTuru,
  type Personel,
  type Makina
} from '../data/lists';
import {
  APP_STATE_KEYS,
  buildDefaultSettingsLists,
  normalizeSettingsLists,
  type SettingsListsState
} from '../constants/appState';
import {
  buildCompactLoginName,
  buildDefaultPasswordPreview,
  isSystemAdminUser
} from '../utils/access';

type BulkParseResult<T> = { items: T[]; skipped: number };

const turkishCharMap: Record<string, string> = {
  \u0131: 'i',
  \u0130: 'i',
  \u015f: 's',
  \u015e: 's',
  \u011f: 'g',
  \u011e: 'g',
  \u00fc: 'u',
  \u00dc: 'u',
  \u00f6: 'o',
  \u00d6: 'o',
  \u00e7: 'c',
  \u00c7: 'c'
};

function normalizeHeader(value: string): string {
  const mapped = value
    .trim()
    .split('')
    .map((char) => turkishCharMap[char] ?? char)
    .join('');
  return mapped.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const PERSONNEL_BASE_DEPARTMENTS = [
  'ELEKTRIK BAKIM',
  'MEKANIK BAKIM',
  'YARDIMCI TESISLER',
  'YONETIM'
] as const;

const PERSONNEL_SUB_DEPARTMENTS = [
  '',
  'ANA BINA',
  'EK BINA',
  'ISK'
] as const;

function normalizeDepartmentToken(value: string): string {
  return String(value || '')
    .toLocaleUpperCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePersonnelDepartment(bolumValue: string, bolum2Value: string): string {
  const bolum = normalizeDepartmentToken(bolumValue);
  const bolum2 = normalizeDepartmentToken(bolum2Value);

  if (!bolum && !bolum2) return '';

  const directValues = new Set([
    'ELEKTRIK BAKIM ANA BINA',
    'ELEKTRIK BAKIM EK BINA',
    'MEKANIK BAKIM',
    'ISK ELEKTRIK BAKIM',
    'ISK MEKANIK BAKIM',
    'ISK YARDIMCI TESISLER',
    'YARDIMCI TESISLER',
    'YONETIM'
  ]);
  if (directValues.has(bolum)) return bolum;

  const hasIsk = bolum.startsWith('ISK ') || bolum2 === 'ISK';

  if (bolum.includes('ELEKTRIK')) {
    if (hasIsk) return 'ISK ELEKTRIK BAKIM';
    if (bolum.includes('EK BINA') || bolum2 === 'EK BINA') return 'ELEKTRIK BAKIM EK BINA';
    return 'ELEKTRIK BAKIM ANA BINA';
  }

  if (bolum.includes('MEKANIK')) {
    return hasIsk ? 'ISK MEKANIK BAKIM' : 'MEKANIK BAKIM';
  }

  if (bolum.includes('YARDIMCI')) {
    return hasIsk ? 'ISK YARDIMCI TESISLER' : 'YARDIMCI TESISLER';
  }

  if (bolum === 'YONETIM') return 'YONETIM';

  return bolum;
}

function splitPersonnelDepartment(fullDepartment: string): { bolum: string; bolum2: string } {
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

function parseDelimitedText(text: string): string[][] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const delimiter = lines.some((line) => line.includes('\t'))
    ? '\t'
    : lines.some((line) => line.includes(';'))
      ? ';'
      : ',';

  return lines.map((line) => line.split(delimiter).map((cell) => cell.trim()));
}

function rowsToObjects(
  rows: string[][],
  headerMap: Record<string, string>,
  positional: string[]
): Array<Record<string, string>> {
  if (rows.length === 0) return [];

  const header = rows[0].map((cell) => normalizeHeader(cell));
  const hasHeader = header.some((cell) => headerMap[cell]);

  const keys = hasHeader ? header.map((cell) => headerMap[cell] || '') : positional;
  const startIndex = hasHeader ? 1 : 0;

  return rows.slice(startIndex).reduce<Array<Record<string, string>>>((acc, row) => {
    const values = row.map((cell) => cell.trim());
    if (values.every((cell) => !cell)) return acc;

    const obj: Record<string, string> = {};
    keys.forEach((key, index) => {
      if (key && values[index]) {
        obj[key] = values[index];
      }
    });

    if (Object.keys(obj).length > 0) acc.push(obj);
    return acc;
  }, []);
}

const TEMPLATE_HEADERS = [
  'Vardiya',
  'Mudahale Turu',
  'Personel No',
  'Ad',
  'Soyad',
  'Bolum',
  'Bolum 2',
  'Rol',
  'Ad Soyad (Birlesik)',
  'Makina Adi (Liste)'
];

type ParsedTemplate = {
  vardiyalar: Vardiya[];
  mudahaleTurleri: MudahaleTuru[];
  personelListesi: Personel[];
  makinaListesi: Makina[];
  skipped: number;
};

function buildTemplateRows(
  vardiyalar: Vardiya[],
  mudahaleTurleri: MudahaleTuru[],
  personelListesi: Personel[],
  makinaListesi: Makina[]
): string[][] {
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
      row[3] = personel.ad;
      row[4] = personel.soyad;
      row[5] = bolumParcalari.bolum;
      row[6] = bolumParcalari.bolum2;
      row[8] = personel.adSoyad || `${personel.ad} ${personel.soyad}`.trim();
    }

    const makina = makinaListesi[i];
    if (makina) row[9] = makina.ad;

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
    skipped: 0
  };

  if (rows.length < 2) return result;

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
    rol: indexFor(['rol', 'gorev', 'unvan']),
    adSoyad: indexFor(['adsoyad', 'adsoyadbirlesik']),
    makina: indexFor(['makina', 'makinaadi', 'makinaadiliste'])
  };

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

    if ((!ad || !soyad) && adSoyad) {
      const parts = adSoyad.split(/\s+/).filter(Boolean);
      if (!ad) ad = parts.shift() || '';
      if (!soyad) soyad = parts.join(' ');
    }

    const bolum = normalizePersonnelDepartment(bolumAna, bolum2);

    if (sicilNo || ad || soyad || bolumAna || bolum2 || adSoyad || getValue(row, indexes.rol)) {
      if (!sicilNo || !ad || !soyad || !bolum) {
        result.skipped += 1;
      } else {
        result.personelListesi.push({
          sicilNo,
          ad,
          soyad,
          bolum,
          adSoyad: `${ad} ${soyad}`.trim()
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

type BulkImportProps<T> = {
  title: string;
  columnsHint: string;
  parseRows: (rows: string[][]) => BulkParseResult<T>;
  onAdd: (items: T[], skipped: number) => void;
};

function BulkImport<T>({ title, columnsHint, parseRows, onAdd }: BulkImportProps<T>) {
  const [pasteText, setPasteText] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const handlePasteAdd = () => {
    if (!pasteText.trim()) {
      toast.error('Yapıştırılacak veri bulunamadı');
      return;
    }

    const rows = parseDelimitedText(pasteText);
    const { items, skipped } = parseRows(rows);
    onAdd(items, skipped);
    setPasteText('');
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsBusy(true);
    try {
      let rows: string[][] = [];
      if (/\.(csv|tsv|txt)$/i.test(file.name)) {
        const text = await file.text();
        rows = parseDelimitedText(text);
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as Array<Array<unknown>>;
        rows = rawRows.map((row) => row.map((cell) => (cell == null ? '' : String(cell))));
      }

      const { items, skipped } = parseRows(rows);
      onAdd(items, skipped);
      event.target.value = '';
    } catch (error) {
      toast.error('Dosya okunamadı');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-gray-300 bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className="text-xs text-gray-500">
          Kolonlar: {columnsHint} (tab, virgül veya ; ile ayrılabilir)
        </p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:border-gray-400">
          <Upload className="h-4 w-4" />
          Excel/CSV seç
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.tsv,.txt"
            onChange={handleFileChange}
            className="hidden"
            disabled={isBusy}
          />
        </label>
        <textarea
          value={pasteText}
          onChange={(event) => setPasteText(event.target.value)}
          rows={4}
          placeholder="Veriyi buraya yapıştırın..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={handlePasteAdd}
        disabled={isBusy}
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        Toplu ekle
      </button>
    </div>
  );
}

type TabType = 'vardiyalar' | 'mudahaleTurleri' | 'personel' | 'makinalar';

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

export default function Ayarlar() {
  const [activeTab, setActiveTab] = useState<TabType>('vardiyalar');
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

  const persistLists = async (nextLists: SettingsListsState) => {
    try {
      setIsListsSaving(true);
      await appStateApi.set(APP_STATE_KEYS.settingsLists, nextLists);
    } catch {
      toast.error('Liste degisiklikleri kaydedilemedi');
    } finally {
      setIsListsSaving(false);
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
  const selectedUserLoginName = selectedUser
    ? buildCompactLoginName(selectedUser.ad, selectedUser.soyad)
    : '';
  const selectedUserDefaultPassword = selectedUser
    ? buildDefaultPasswordPreview(selectedUser.ad, selectedUser.soyad)
    : '';

  const applyBackupPayload = (payload: BackupSettingsResponse | undefined) => {
    if (!payload) return;
    setBackupSettings(payload.settings);
    setBackupStatus(payload.status);
  };

  const changeOwnPasswordMutation = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Sifre guncellendi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Sifre guncellenemedi');
    }
  });

  const setUserPasswordMutation = useMutation({
    mutationFn: () => authApi.setUserPassword(Number.parseInt(selectedUserId, 10), selectedUserPassword),
    onSuccess: () => {
      toast.success('Kullanici sifresi guncellendi');
      setSelectedUserPassword('');
      queryClient.invalidateQueries({ queryKey: ['settings-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Kullanici sifresi guncellenemedi');
    }
  });

  const resetAllPasswordsMutation = useMutation({
    mutationFn: () => authApi.resetAllUserPasswords(),
    onSuccess: (response: any) => {
      const count = response?.data?.data?.count;
      toast.success(typeof count === 'number' ? `${count} kullanicinin sifresi yenilendi` : 'Tum sifreler varsayilan formata cekildi');
      queryClient.invalidateQueries({ queryKey: ['settings-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Toplu sifre guncellenemedi');
    }
  });

  const saveBackupSettingsMutation = useMutation({
    mutationFn: () => backupsApi.updateSettings(backupSettings),
    onSuccess: (response: any) => {
      applyBackupPayload(response?.data?.data as BackupSettingsResponse | undefined);
      toast.success(response?.data?.message || 'Yedekleme ayarlari kaydedildi');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Yedekleme ayarlari kaydedilemedi');
    }
  });

  const runBackupNowMutation = useMutation({
    mutationFn: () => backupsApi.runNow(),
    onSuccess: (response: any) => {
      const payload = response?.data?.data as { status?: BackupStatus } | undefined;
      if (payload?.status) {
        setBackupStatus(payload.status);
      }
      toast.success(response?.data?.message || 'Yedekleme tamamlandi');
    },
    onError: (error: any) => {
      const payload = error?.response?.data?.data as { status?: BackupStatus } | undefined;
      if (payload?.status) {
        setBackupStatus(payload.status);
      }
      toast.error(error?.response?.data?.message || 'Yedekleme baslatilamadi');
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
      toast.error('Sablon indirilemedi');
    }
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
      const rows = rawRows.map((row) => row.map((cell) => (cell == null ? '' : String(cell))));
      const parsed = parseTemplateRows(rows);

      const mergeByKey = <T,>(current: T[], incoming: T[], keyFn: (item: T) => string) => {
        const existing = new Set(current.map((item) => keyFn(item).toLowerCase()));
        const unique = incoming.filter((item) => {
          const key = keyFn(item).toLowerCase();
          if (!key || existing.has(key)) return false;
          existing.add(key);
          return true;
        });
        return [...current, ...unique];
      };

      const mergedVardiyalar = mergeByKey(vardiyalar, parsed.vardiyalar, (item) => item.ad);
      const mergedMudahaleTurleri = mergeByKey(mudahaleTurleri, parsed.mudahaleTurleri, (item) => item.ad);
      const mergedPersonel = mergeByKey(personelListesi, parsed.personelListesi, (item) => item.sicilNo);
      const mergedMakina = mergeByKey(makinaListesi, parsed.makinaListesi, (item) => item.ad);

      const addedCount =
        (mergedVardiyalar.length - vardiyalar.length)
        + (mergedMudahaleTurleri.length - mudahaleTurleri.length)
        + (mergedPersonel.length - personelListesi.length)
        + (mergedMakina.length - makinaListesi.length);

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

      if (addedCount === 0 && parsed.skipped === 0) {
        toast.error('Yeni kayit bulunamadi');
      } else {
        const skippedNote = parsed.skipped ? `, ${parsed.skipped} satır atland?` : '';
        toast.success(`${addedCount} kayit eklendi${skippedNote}`);
      }
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
        toast.error('Merkezi listeler yuklenemedi, varsayilan liste kullanildi');
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
        toast.error(error?.response?.data?.message || 'Yedekleme ayarlari yuklenemedi');
      } finally {
        setIsBackupLoading(false);
      }
    };

    void loadBackupSettings();
  }, [canManagePasswords]);

  const tabs = [
    { id: 'vardiyalar' as TabType, label: 'Vardiyalar' },
    { id: 'mudahaleTurleri' as TabType, label: 'Mudahale Turleri' },
    { id: 'personel' as TabType, label: 'Personel' },
    { id: 'makinalar' as TabType, label: 'Makinalar' }
  ];

  const handleOwnPasswordSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Tum sifre alanlarini doldurun');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Yeni sifre en az 6 karakter olmali');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Yeni sifreler eslesmiyor');
      return;
    }
    changeOwnPasswordMutation.mutate();
  };

  const handleSetUserPassword = () => {
    if (!selectedUserId) {
      toast.error('Lutfen bir kullanici secin');
      return;
    }
    if (!selectedUserPassword || selectedUserPassword.trim().length < 6) {
      toast.error('Yeni sifre en az 6 karakter olmali');
      return;
    }
    setUserPasswordMutation.mutate();
  };

  const handleResetAllPasswords = () => {
    if (!confirm('Tum kullanicilarin sifresi varsayilan kurala gore guncellensin mi?')) return;
    resetAllPasswordsMutation.mutate();
  };

  const handleSaveBackupSettings = () => {
    if (!canManagePasswords) {
      toast.error('Bu alan icin yetkiniz yok');
      return;
    }

    const intervalMinutes = Number.parseInt(String(backupSettings.intervalMinutes), 10);
    if (Number.isNaN(intervalMinutes)) {
      toast.error('Yedekleme araligi gecersiz');
      return;
    }
    if (intervalMinutes < MIN_BACKUP_INTERVAL_MINUTES || intervalMinutes > MAX_BACKUP_INTERVAL_MINUTES) {
      toast.error(`Yedekleme araligi ${MIN_BACKUP_INTERVAL_MINUTES}-${MAX_BACKUP_INTERVAL_MINUTES} dakika arasinda olmalidir`);
      return;
    }
    if (!backupSettings.backupDir.trim()) {
      toast.error('Yedek klasoru bos olamaz');
      return;
    }
    if (!backupSettings.includeDatabase && !backupSettings.includeCompletedExcel) {
      toast.error('En az bir yedekleme icerigi secilmelidir');
      return;
    }

    saveBackupSettingsMutation.mutate();
  };

  const handleRunBackupNow = () => {
    if (!canManagePasswords) {
      toast.error('Bu alan icin yetkiniz yok');
      return;
    }
    runBackupNowMutation.mutate();
  };

  const backupLastResultLabel = backupStatus?.lastResult === 'success'
    ? 'Basarili'
    : backupStatus?.lastResult === 'error'
      ? 'Hatali'
      : 'Henuz calismadi';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ayarlar - Liste Yonetimi</h1>
      {(isListsLoading || isListsSaving) && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
          {isListsLoading ? 'Merkezi listeler yukleniyor...' : 'Liste degisiklikleri kaydediliyor...'}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Kendi Sifremi Degistir</h2>
            <p className="text-xs text-gray-500">Bu alandan mevcut hesabinizin sifresini degistirebilirsiniz.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Mevcut Sifre</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Yeni Sifre</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Yeni Sifre (Tekrar)</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOwnPasswordSubmit}
              disabled={changeOwnPasswordMutation.isPending}
            >
              {changeOwnPasswordMutation.isPending ? 'Kaydediliyor...' : 'Sifremi Guncelle'}
            </button>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Kullanici Sifre Yonetimi</h2>
            <p className="text-xs text-gray-500">
              Berke Karayanik/sistem yoneticisi bu bolumden tum kullanicilarin sifresini yonetebilir.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Kullanici Sec</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input"
                disabled={!canManagePasswords}
              >
                <option value="">Seciniz</option>
                {(users || []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.ad} {user.soyad} ({user.sicilNo})
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
                <p><span className="font-semibold">Giris Adi:</span> {selectedUserLoginName}</p>
                <p><span className="font-semibold">Varsayilan Sifre:</span> {selectedUserDefaultPassword}</p>
              </div>
            )}

            <div>
              <label className="label">Yeni Sifre</label>
              <input
                type="text"
                value={selectedUserPassword}
                onChange={(e) => setSelectedUserPassword(e.target.value)}
                className="input"
                placeholder="Orn: mk123456"
                disabled={!canManagePasswords}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetAllPasswords}
              disabled={!canManagePasswords || resetAllPasswordsMutation.isPending}
            >
              {resetAllPasswordsMutation.isPending ? 'Toplu isleniyor...' : 'Tumunu Varsayilan Sifreye Cek'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSetUserPassword}
              disabled={!canManagePasswords || setUserPasswordMutation.isPending}
            >
              {setUserPasswordMutation.isPending ? 'Kaydediliyor...' : 'Secili Kullanici Sifresini Degistir'}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Varsayilan giris kurali: kullanici adi = adsoyad, sifre = ad/soyad bas harfleri + 123456
          </p>
        </div>
      </div>

      {canManagePasswords && (
        <div className="card p-6 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Otomatik Yedekleme</h2>
              <p className="text-xs text-gray-500">
                Yedek hedef klasoru secip otomatik yedekleme araligini buradan yonetin.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRunBackupNow}
                disabled={isBackupLoading || runBackupNowMutation.isPending || backupStatus?.isRunning}
              >
                {runBackupNowMutation.isPending || backupStatus?.isRunning ? 'Yedekleniyor...' : 'Simdi Yedek Al'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveBackupSettings}
                disabled={isBackupLoading || saveBackupSettingsMutation.isPending}
              >
                {saveBackupSettingsMutation.isPending ? 'Kaydediliyor...' : 'Yedek Ayarlarini Kaydet'}
              </button>
            </div>
          </div>

          {isBackupLoading ? (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
              Yedekleme ayarlari yukleniyor...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={backupSettings.enabled}
                    onChange={(event) => setBackupSettings((prev) => ({
                      ...prev,
                      enabled: event.target.checked
                    }))}
                  />
                  Otomatik yedekleme aktif
                </label>

                <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={backupSettings.includeDatabase}
                    onChange={(event) => setBackupSettings((prev) => ({
                      ...prev,
                      includeDatabase: event.target.checked
                    }))}
                  />
                  Veritabani yedegi al
                </label>

                <div>
                  <label className="label">Yedek Klasoru</label>
                  <input
                    type="text"
                    value={backupSettings.backupDir}
                    onChange={(event) => setBackupSettings((prev) => ({
                      ...prev,
                      backupDir: event.target.value
                    }))}
                    className="input"
                    placeholder="Orn: D:\\CMMS_BACKUP"
                  />
                </div>

                <div>
                  <label className="label">Yedekleme Araligi (dk)</label>
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
                    className="input"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={backupSettings.includeCompletedExcel}
                  onChange={(event) => setBackupSettings((prev) => ({
                    ...prev,
                    includeCompletedExcel: event.target.checked
                  }))}
                />
                Tamamlanan isleri ayri Excel dosyasi olarak yedekle
              </label>

              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-700 space-y-1">
                <p><span className="font-semibold">Son Durum:</span> {backupLastResultLabel}</p>
                <p><span className="font-semibold">Son Calisma:</span> {formatStatusDate(backupStatus?.lastRunAt)}</p>
                <p><span className="font-semibold">Son Basarili Calisma:</span> {formatStatusDate(backupStatus?.lastSuccessAt)}</p>
                <p><span className="font-semibold">Son Tetikleme:</span> {backupStatus?.lastTrigger || '-'}</p>
                <p><span className="font-semibold">Sonraki Calisma:</span> {formatStatusDate(backupStatus?.nextRunAt)}</p>
                <p><span className="font-semibold">Son Hedef Klasor:</span> {backupStatus?.lastOutputDir || '-'}</p>
                <p><span className="font-semibold">Son Hata:</span> {backupStatus?.lastError || '-'}</p>
                <p><span className="font-semibold">Son Uretilen Dosyalar:</span></p>
                {backupStatus?.lastFiles?.length ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {backupStatus.lastFiles.map((filePath) => (
                      <li key={filePath} className="break-all">{filePath}</li>
                    ))}
                  </ul>
                ) : (
                  <p>-</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">Excel sablonu</p>
            <p className="text-xs text-gray-500">
              Vardiya, mudahale turu, personel ve makina listelerini tek dosyada yonetin.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={templateBusy}
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            Excel indir
          </button>
        </div>
        <label className="mt-4 inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:border-gray-400">
          <Upload className="h-4 w-4" />
          Excel yukle
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleTemplateUpload}
            className="hidden"
            disabled={templateBusy}
          />
        </label>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'vardiyalar' && (
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
            }}
          />
        )}
        {activeTab === 'mudahaleTurleri' && (
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
            }}
          />
        )}
        {activeTab === 'personel' && (
          <PersonelTab
            data={personelListesi}
            setData={(data) => {
              setPersonelListesi(data);
              void persistLists({
                vardiyalar,
                mudahaleTurleri,
                personelListesi: data,
                makinaListesi
              });
            }}
          />
        )}
        {activeTab === 'makinalar' && (
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
            }}
          />
        )}
      </div>
    </div>
  );
}

// Vardiyalar Tab
function VardiyalarTab({ data, setData }: { data: Vardiya[]; setData: (data: Vardiya[]) => void }) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', ad: '', saat: '' });

  const parseBulkRows = (rows: string[][]): BulkParseResult<Vardiya> => {
    const headerMap = {
      vardiya: 'ad',
      vardiyaadi: 'ad',
      ad: 'ad',
      name: 'ad',
      saat: 'saat',
      saataraligi: 'saat',
      time: 'saat'
    };
    const objects = rowsToObjects(rows, headerMap, ['ad', 'saat']);
    let skipped = 0;
    const baseId = Date.now();
    let seq = 0;

    const items = objects.flatMap((row) => {
      const ad = row.ad?.trim();
      const saat = row.saat?.trim();
      if (!ad || !saat) {
        skipped += 1;
        return [];
      }
      return [{ id: `VARDIYA_${baseId}_${seq++}`, ad, saat }];
    });

    return { items, skipped };
  };

  const handleBulkAdd = (items: Vardiya[], skipped: number) => {
    const existing = new Set(data.map((item) => item.ad.toLowerCase()));
    const unique = items.filter((item) => !existing.has(item.ad.toLowerCase()));
    const duplicates = items.length - unique.length;

    if (unique.length === 0) {
      toast.error('Yeni kayıt bulunamadı');
      return;
    }

    setData([...data, ...unique]);
    const skippedTotal = skipped + duplicates;
    toast.success(`${unique.length} kayıt eklendi${skippedTotal ? `, ${skippedTotal} satır atland?` : ''}`);
  };

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
    setData(data.map(v => v.id === editId ? { ...form } : v));
    setEditId(null);
    setForm({ id: '', ad: '', saat: '' });
    toast.success('Vardiya güncellendi');
  };

  const handleDelete = (id: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      setData(data.filter(v => v.id !== id));
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
          disabled={!!editId}
        />
        <input
          type="text"
          placeholder="Saat (örn: 08:00-16:00)"
          value={editId ? '' : form.saat}
          onChange={(e) => setForm({ ...form, saat: e.target.value })}
          className="flex-1 px-3 py-2 border rounded-md"
          disabled={!!editId}
        />
        <button
          onClick={handleAdd}
          disabled={!!editId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <BulkImport
        title="Toplu Vardiya Ekle"
        columnsHint="Vardiya Adı, Saat"
        parseRows={parseBulkRows}
        onAdd={handleBulkAdd}
      />

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
            {data.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editId === item.id ? (
                    <input
                      type="text"
                      value={form.ad}
                      onChange={(e) => setForm({ ...form, ad: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : item.ad}
                </td>
                <td className="px-4 py-3">
                  {editId === item.id ? (
                    <input
                      type="text"
                      value={form.saat}
                      onChange={(e) => setForm({ ...form, saat: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : item.saat}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    {editId === item.id ? (
                      <>
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditId(null); setForm({ id: '', ad: '', saat: '' }); }} className="text-gray-600 hover:text-gray-800">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Müdahale Türleri Tab
function MudahaleTurleriTab({ data, setData }: { data: MudahaleTuru[]; setData: (data: MudahaleTuru[]) => void }) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', ad: '' });

  const parseBulkRows = (rows: string[][]): BulkParseResult<MudahaleTuru> => {
    const headerMap = {
      mudahaleturu: 'ad',
      mudahaleturuadi: 'ad',
      tur: 'ad',
      turadi: 'ad',
      ad: 'ad',
      name: 'ad'
    };
    const objects = rowsToObjects(rows, headerMap, ['ad']);
    let skipped = 0;
    const baseId = Date.now();
    let seq = 0;

    const items = objects.flatMap((row) => {
      const ad = row.ad?.trim();
      if (!ad) {
        skipped += 1;
        return [];
      }
      return [{ id: `MT_${baseId}_${seq++}`, ad }];
    });

    return { items, skipped };
  };

  const handleBulkAdd = (items: MudahaleTuru[], skipped: number) => {
    const existing = new Set(data.map((item) => item.ad.toLowerCase()));
    const unique = items.filter((item) => !existing.has(item.ad.toLowerCase()));
    const duplicates = items.length - unique.length;

    if (unique.length === 0) {
      toast.error('Yeni kayıt bulunamadı');
      return;
    }

    setData([...data, ...unique]);
    const skippedTotal = skipped + duplicates;
    toast.success(`${unique.length} kayıt eklendi${skippedTotal ? `, ${skippedTotal} satır atland?` : ''}`);
  };

  const handleAdd = () => {
    if (!form.ad) {
      toast.error('Müdahale türü adı girin');
      return;
    }
    const newId = 'MT_' + Date.now();
    setData([...data, { id: newId, ad: form.ad }]);
    setForm({ id: '', ad: '' });
    toast.success('Müdahale türü eklendi');
  };

  const handleEdit = (item: MudahaleTuru) => {
    setEditId(item.id);
    setForm({ id: item.id, ad: item.ad });
  };

  const handleSave = () => {
    setData(data.map(m => m.id === editId ? { ...form } : m));
    setEditId(null);
    setForm({ id: '', ad: '' });
    toast.success('Müdahale türü güncellendi');
  };

  const handleDelete = (id: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      setData(data.filter(m => m.id !== id));
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
          disabled={!!editId}
        />
        <button
          onClick={handleAdd}
          disabled={!!editId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <BulkImport
        title="Toplu Müdahale Türü Ekle"
        columnsHint="Müdahale Türü"
        parseRows={parseBulkRows}
        onAdd={handleBulkAdd}
      />

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Müdahale Türü</th>
              <th className="px-4 py-3 text-center w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editId === item.id ? (
                    <input
                      type="text"
                      value={form.ad}
                      onChange={(e) => setForm({ ...form, ad: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : item.ad}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    {editId === item.id ? (
                      <>
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditId(null); setForm({ id: '', ad: '' }); }} className="text-gray-600 hover:text-gray-800">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Personel Tab
function PersonelTab({ data, setData }: { data: Personel[]; setData: (data: Personel[]) => void }) {
  const [editSicil, setEditSicil] = useState<string | null>(null);
  const [form, setForm] = useState({
    sicilNo: '',
    ad: '',
    soyad: '',
    bolum: '',
    bolum2: '',
    adSoyad: ''
  });
  const [search, setSearch] = useState('');

  const resetForm = () => {
    setForm({
      sicilNo: '',
      ad: '',
      soyad: '',
      bolum: '',
      bolum2: '',
      adSoyad: ''
    });
  };

  const parseBulkRows = (rows: string[][]): BulkParseResult<Personel> => {
    const headerMap = {
      sicilno: 'sicilNo',
      sicil: 'sicilNo',
      personelno: 'sicilNo',
      ad: 'ad',
      isim: 'ad',
      adi: 'ad',
      soyad: 'soyad',
      soyadi: 'soyad',
      adsoyad: 'adSoyad',
      bolum: 'bolum',
      departman: 'bolum',
      bolum2: 'bolum2',
      altbolum: 'bolum2',
      subolum: 'bolum2',
      rol: 'rol'
    };

    const objects = rowsToObjects(rows, headerMap, ['sicilNo', 'adSoyad', 'bolum', 'bolum2', 'rol']);
    let skipped = 0;

    const items = objects.flatMap((row) => {
      let ad = row.ad?.trim() || '';
      let soyad = row.soyad?.trim() || '';
      if ((!ad || !soyad) && row.adSoyad) {
        const parts = row.adSoyad.trim().split(/\s+/);
        ad = parts.shift() || '';
        soyad = parts.join(' ');
      }

      const sicilNo = row.sicilNo?.trim();
      const bolum = normalizePersonnelDepartment(
        row.bolum?.trim() || '',
        row.bolum2?.trim() || ''
      );

      if (!sicilNo || !ad || !soyad || !bolum) {
        skipped += 1;
        return [];
      }

      return [{
        sicilNo,
        ad,
        soyad,
        bolum,
        adSoyad: `${ad} ${soyad}`.trim()
      }];
    });

    return { items, skipped };
  };

  const handleBulkAdd = (items: Personel[], skipped: number) => {
    const existing = new Set(data.map((item) => item.sicilNo));
    const unique = items.filter((item) => !existing.has(item.sicilNo));
    const duplicates = items.length - unique.length;

    if (unique.length === 0) {
      toast.error('Yeni kayit bulunamadi');
      return;
    }

    setData([...data, ...unique]);
    const skippedTotal = skipped + duplicates;
    toast.success(`${unique.length} kayit eklendi${skippedTotal ? `, ${skippedTotal} satir atlandi` : ''}`);
  };

  const handleAdd = () => {
    const bolum = normalizePersonnelDepartment(form.bolum, form.bolum2);
    if (!form.sicilNo || !form.ad || !form.soyad || !bolum) {
      toast.error('Tum alanlari doldurun');
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
      adSoyad: `${form.ad} ${form.soyad}`.trim()
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
      adSoyad: item.adSoyad
    });
  };

  const handleSave = () => {
    const bolum = normalizePersonnelDepartment(form.bolum, form.bolum2);
    if (!form.ad || !form.soyad || !bolum) {
      toast.error('Tum alanlari doldurun');
      return;
    }

    setData(data.map((p) => (
      p.sicilNo === editSicil
        ? {
            sicilNo: form.sicilNo,
            ad: form.ad,
            soyad: form.soyad,
            bolum,
            adSoyad: `${form.ad} ${form.soyad}`.trim()
          }
        : p
    )));

    setEditSicil(null);
    resetForm();
    toast.success('Personel guncellendi');
  };

  const handleDelete = (sicilNo: string) => {
    if (confirm('Silmek istediginize emin misiniz?')) {
      setData(data.filter((p) => p.sicilNo !== sicilNo));
      toast.success('Personel silindi');
    }
  };

  const filteredData = data.filter((p) =>
    p.adSoyad.toLowerCase().includes(search.toLowerCase()) || p.sicilNo.includes(search)
  );

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Personel Listesi ({data.length} kisi)</h3>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Sicil No"
          value={editSicil ? '' : form.sicilNo}
          onChange={(e) => setForm({ ...form, sicilNo: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil}
        />
        <input
          type="text"
          placeholder="Ad"
          value={editSicil ? '' : form.ad}
          onChange={(e) => setForm({ ...form, ad: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil}
        />
        <input
          type="text"
          placeholder="Soyad"
          value={editSicil ? '' : form.soyad}
          onChange={(e) => setForm({ ...form, soyad: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil}
        />
        <select
          value={editSicil ? '' : form.bolum}
          onChange={(e) => setForm({ ...form, bolum: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil}
        >
          <option value="">Bolum Sec</option>
          {PERSONNEL_BASE_DEPARTMENTS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          value={editSicil ? '' : form.bolum2}
          onChange={(e) => setForm({ ...form, bolum2: e.target.value })}
          className="px-3 py-2 border rounded-md"
          disabled={!!editSicil}
        >
          <option value="">Bolum 2 (Opsiyonel)</option>
          {PERSONNEL_SUB_DEPARTMENTS.filter((b) => b !== '').map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!!editSicil}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-5 h-5 mx-auto" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Ara (ad, soyad veya sicil no)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      />

      <BulkImport
        title="Toplu Personel Ekle"
        columnsHint="Sicil No, Ad Soyad, Bolum, Bolum 2, Rol"
        parseRows={parseBulkRows}
        onAdd={handleBulkAdd}
      />

      <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">Sicil No</th>
              <th className="px-4 py-3 text-left">Ad</th>
              <th className="px-4 py-3 text-left">Soyad</th>
              <th className="px-4 py-3 text-left">Bolum</th>
              <th className="px-4 py-3 text-left">Bolum 2</th>
              <th className="px-4 py-3 text-center w-24">Islem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredData.map((item) => {
              const bolumParcalari = splitPersonnelDepartment(item.bolum);

              return (
                <tr key={item.sicilNo} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono">{item.sicilNo}</td>
                  <td className="px-4 py-2">
                    {editSicil === item.sicilNo ? (
                      <input
                        type="text"
                        value={form.ad}
                        onChange={(e) => setForm({ ...form, ad: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    ) : item.ad}
                  </td>
                  <td className="px-4 py-2">
                    {editSicil === item.sicilNo ? (
                      <input
                        type="text"
                        value={form.soyad}
                        onChange={(e) => setForm({ ...form, soyad: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    ) : item.soyad}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editSicil === item.sicilNo ? (
                      <select
                        value={form.bolum}
                        onChange={(e) => setForm({ ...form, bolum: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">Bolum Sec</option>
                        {PERSONNEL_BASE_DEPARTMENTS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    ) : bolumParcalari.bolum}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editSicil === item.sicilNo ? (
                      <select
                        value={form.bolum2}
                        onChange={(e) => setForm({ ...form, bolum2: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">-</option>
                        {PERSONNEL_SUB_DEPARTMENTS.filter((b) => b !== '').map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    ) : bolumParcalari.bolum2 || '-'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      {editSicil === item.sicilNo ? (
                        <>
                          <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditSicil(null);
                              resetForm();
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.sicilNo)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Makinalar Tab
function MakinalarTab({ data, setData }: { data: Makina[]; setData: (data: Makina[]) => void }) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', ad: '' });
  const [search, setSearch] = useState('');

  const parseBulkRows = (rows: string[][]): BulkParseResult<Makina> => {
    const headerMap = {
      makina: 'ad',
      makinaadi: 'ad',
      ad: 'ad',
      name: 'ad'
    };
    const objects = rowsToObjects(rows, headerMap, ['ad']);
    let skipped = 0;
    const baseId = Date.now();
    let seq = 0;

    const items = objects.flatMap((row) => {
      const ad = row.ad?.trim();
      if (!ad) {
        skipped += 1;
        return [];
      }
      return [{ id: `MAK_${baseId}_${seq++}`, ad }];
    });

    return { items, skipped };
  };

  const handleBulkAdd = (items: Makina[], skipped: number) => {
    const existing = new Set(data.map((item) => item.ad.toLowerCase()));
    const unique = items.filter((item) => !existing.has(item.ad.toLowerCase()));
    const duplicates = items.length - unique.length;

    if (unique.length === 0) {
      toast.error('Yeni kayıt bulunamadı');
      return;
    }

    setData([...data, ...unique]);
    const skippedTotal = skipped + duplicates;
    toast.success(`${unique.length} kayıt eklendi${skippedTotal ? `, ${skippedTotal} satır atland?` : ''}`);
  };

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
    setData(data.map(m => m.id === editId ? { ...form } : m));
    setEditId(null);
    setForm({ id: '', ad: '' });
    toast.success('Makina güncellendi');
  };

  const handleDelete = (id: string) => {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      setData(data.filter(m => m.id !== id));
      toast.success('Makina silindi');
    }
  };

  const filteredData = data.filter(m =>
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
          disabled={!!editId}
        />
        <button
          onClick={handleAdd}
          disabled={!!editId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      />

      <BulkImport
        title="Toplu Makina Ekle"
        columnsHint="Makina Adı"
        parseRows={parseBulkRows}
        onAdd={handleBulkAdd}
      />

      <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">Makina Adı</th>
              <th className="px-4 py-3 text-center w-24">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {editId === item.id ? (
                    <input
                      type="text"
                      value={form.ad}
                      onChange={(e) => setForm({ ...form, ad: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : item.ad}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    {editId === item.id ? (
                      <>
                        <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditId(null); setForm({ id: '', ad: '' }); }} className="text-gray-600 hover:text-gray-800">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

