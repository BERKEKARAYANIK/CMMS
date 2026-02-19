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
  bakimTakipData: 'bakim_takip:data',
  bakimTakipConfigs: 'bakim_takip:configs',
  bakimTakipHiddenMachines: 'bakim_takip:hidden_machines',
  dcMotorReports: 'dc_motor:reports',
  dcMotorInventory: 'dc_motor:inventory'
} as const;

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

function normalizePersonelListesi(value: unknown): Personel[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Partial<Personel>;
    const sicilNo = String(row.sicilNo || '').trim();
    const ad = String(row.ad || '').trim();
    const soyad = String(row.soyad || '').trim();
    const bolum = String(row.bolum || '').trim();
    const adSoyad = String(row.adSoyad || `${ad} ${soyad}`).trim();
    const rol = String(row.rol || '').trim();
    if (!sicilNo || !ad || !soyad || !bolum) return [];
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
  if (!value || typeof value !== 'object') return defaults;

  const source = value as Partial<SettingsListsState>;
  const vardiyalar = normalizeVardiyalar(source.vardiyalar);
  const mudahaleTurleri = normalizeMudahaleTurleri(source.mudahaleTurleri);
  const personelListesi = normalizePersonelListesi(source.personelListesi);
  const makinaListesi = normalizeMakinaListesi(source.makinaListesi);

  return {
    vardiyalar: vardiyalar.length > 0 ? vardiyalar : defaults.vardiyalar,
    mudahaleTurleri: mudahaleTurleri.length > 0 ? mudahaleTurleri : defaults.mudahaleTurleri,
    personelListesi: personelListesi.length > 0 ? personelListesi : defaults.personelListesi,
    makinaListesi: makinaListesi.length > 0 ? makinaListesi : defaults.makinaListesi
  };
}
