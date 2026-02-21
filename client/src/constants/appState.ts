import {
  vardiyalar as defaultVardiyalar,
  mudahaleTurleri as defaultMudahaleTurleri,
  personelListesi as defaultPersonelListesi,
  makinaListesi as defaultMakinaListesi,
  type Vardiya,
  type MudahaleTuru,
  type Personel,
  type Makina
} from '../data/lists';

export const APP_STATE_KEYS = {
  settingsLists: 'settings:lists',
  dashboardFiveSLevels: 'dashboard:five_s_levels',
  bakimTakipData: 'bakim_takip:data',
  bakimTakipConfigs: 'bakim_takip:configs',
  bakimTakipHiddenMachines: 'bakim_takip:hidden_machines',
  dcMotorReports: 'dc_motor:reports',
  dcMotorInventory: 'dc_motor:inventory'
} as const;

export const DASHBOARD_FIVE_S_DEPARTMENTS = [
  { id: 'elektrik-ana-bina', name: 'Elektrik Bakim Ana Bina' },
  { id: 'elektrik-ek-bina', name: 'Elektrik Bakim Ek Bina' },
  { id: 'mekanik', name: 'Mekanik' },
  { id: 'yardimci-tesisler', name: 'Yardimci Tesisler' }
] as const;

export const FIVE_S_LEVEL_OPTIONS = ['0S', '1S', '2S', '3S', '4S', '5S'] as const;

export type FiveSLevel = typeof FIVE_S_LEVEL_OPTIONS[number];
export type DashboardFiveSLevelsState = Record<string, FiveSLevel>;

function isFiveSLevel(value: string): value is FiveSLevel {
  return (FIVE_S_LEVEL_OPTIONS as readonly string[]).includes(value);
}

export function buildDefaultDashboardFiveSLevels(): DashboardFiveSLevelsState {
  return DASHBOARD_FIVE_S_DEPARTMENTS.reduce<DashboardFiveSLevelsState>((acc, item) => {
    acc[item.id] = '3S';
    return acc;
  }, {});
}

export function normalizeDashboardFiveSLevels(value: unknown): DashboardFiveSLevelsState {
  const defaults = buildDefaultDashboardFiveSLevels();
  if (!value || typeof value !== 'object') return defaults;

  const source = value as Record<string, unknown>;
  const result: DashboardFiveSLevelsState = { ...defaults };

  DASHBOARD_FIVE_S_DEPARTMENTS.forEach((item) => {
    const level = String(source[item.id] || '').trim().toUpperCase();
    if (isFiveSLevel(level)) {
      result[item.id] = level;
    }
  });

  return result;
}

export type SettingsListsState = {
  vardiyalar: Vardiya[];
  mudahaleTurleri: MudahaleTuru[];
  personelListesi: Personel[];
  makinaListesi: Makina[];
};

export function buildDefaultSettingsLists(): SettingsListsState {
  return {
    vardiyalar: [...defaultVardiyalar],
    mudahaleTurleri: [...defaultMudahaleTurleri],
    personelListesi: [...defaultPersonelListesi],
    makinaListesi: [...defaultMakinaListesi]
  };
}

function buildPersonelDisplayName(personel: Personel): string {
  return String(
    personel.adSoyad
    || `${personel.ad || ''} ${personel.soyad || ''}`
  )
    .replace(/\s+/g, ' ')
    .trim();
}

export function sortPersonelListesiByName(personeller: Personel[]): Personel[] {
  return [...personeller].sort((a, b) => {
    const adSoyadKarsilastirma = buildPersonelDisplayName(a).localeCompare(
      buildPersonelDisplayName(b),
      'tr-TR',
      { sensitivity: 'base' }
    );
    if (adSoyadKarsilastirma !== 0) {
      return adSoyadKarsilastirma;
    }

    return String(a.sicilNo || '').localeCompare(
      String(b.sicilNo || ''),
      'tr-TR',
      { numeric: true, sensitivity: 'base' }
    );
  });
}

function normalizeVardiyalar(value: unknown): Vardiya[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Partial<Vardiya>;
    const ad = String(row.ad || '').trim();
    const saat = String(row.saat || '').trim();
    if (!ad || !saat) return [];
    const id = String(row.id || `VARDIYA_${index + 1}`);
    return [{ id, ad, saat }];
  });
}

function normalizeMudahaleTurleri(value: unknown): MudahaleTuru[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Partial<MudahaleTuru>;
    const ad = String(row.ad || '').trim();
    if (!ad) return [];
    const id = String(row.id || `MT_${index + 1}`);
    return [{ id, ad }];
  });
}

function pickFirstText(
  row: Record<string, unknown>,
  keys: string[]
): string {
  for (const key of keys) {
    const value = row[key];
    const text = String(value ?? '').trim();
    if (text) return text;
  }
  return '';
}

function splitFullName(fullName: string): { ad: string; soyad: string } {
  const parts = fullName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { ad: '', soyad: '' };
  }

  if (parts.length === 1) {
    return { ad: parts[0], soyad: '-' };
  }

  return {
    ad: parts[0],
    soyad: parts.slice(1).join(' ')
  };
}

function normalizePersonelListesi(value: unknown): Personel[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;

    const sicilNo = pickFirstText(row, [
      'sicilNo',
      'sicil_no',
      'sicil',
      'personelNo',
      'personel_no',
      'personel'
    ]);
    if (!sicilNo || seen.has(sicilNo)) return [];

    let ad = pickFirstText(row, ['ad', 'isim', 'firstName', 'first_name']);
    let soyad = pickFirstText(row, ['soyad', 'lastName', 'last_name']);
    const fullName =
      pickFirstText(row, ['adSoyad', 'ad_soyad', 'adsoyad', 'fullName', 'full_name'])
      || `${ad} ${soyad}`.trim();

    if ((!ad || !soyad) && fullName) {
      const split = splitFullName(fullName);
      if (!ad) ad = split.ad;
      if (!soyad) soyad = split.soyad;
    }

    const bolum =
      pickFirstText(row, ['bolum', 'departman', 'department', 'departmentName'])
      || 'BELIRSIZ';
    const adSoyad = (fullName || `${ad} ${soyad}`.trim()).trim();
    const rol = pickFirstText(row, ['rol', 'role', 'unvan', 'title']);
    if (!adSoyad || !ad || !soyad) return [];

    seen.add(sicilNo);
    return [{
      sicilNo,
      ad,
      soyad,
      bolum,
      adSoyad,
      rol: rol || undefined
    }];
  });
}

function normalizeMakinaListesi(value: unknown): Makina[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Partial<Makina>;
    const ad = String(row.ad || '').trim();
    if (!ad) return [];
    const id = String(row.id || `MAK_${index + 1}`);
    return [{ id, ad }];
  });
}

export function normalizeSettingsLists(value: unknown): SettingsListsState {
  const defaults = buildDefaultSettingsLists();
  if (!value || typeof value !== 'object') {
    return {
      vardiyalar: defaults.vardiyalar,
      mudahaleTurleri: defaults.mudahaleTurleri,
      personelListesi: [],
      makinaListesi: defaults.makinaListesi
    };
  }

  const source = value as Partial<SettingsListsState>;
  const vardiyalar = normalizeVardiyalar(source.vardiyalar);
  const mudahaleTurleri = normalizeMudahaleTurleri(source.mudahaleTurleri);
  const personelListesi = sortPersonelListesiByName(
    normalizePersonelListesi(source.personelListesi)
  );
  const makinaListesi = normalizeMakinaListesi(source.makinaListesi);

  return {
    vardiyalar: vardiyalar.length > 0 ? vardiyalar : defaults.vardiyalar,
    mudahaleTurleri: mudahaleTurleri.length > 0 ? mudahaleTurleri : defaults.mudahaleTurleri,
    personelListesi,
    makinaListesi: makinaListesi.length > 0 ? makinaListesi : defaults.makinaListesi
  };
}
