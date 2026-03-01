import type { User } from '../types';
export { buildDefaultPasswordPreview } from './passwordPolicy';

function normalizeAuthText(value: string | null | undefined): string {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/\u0131/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const BERKE_ADMIN_SICIL_NOS = new Set(
  String('BERKE')
    .split(',')
    .map((value) => normalizeAuthText(value))
    .filter(Boolean)
);
const READ_ONLY_INSPECTOR_SICIL_NO = 'izleyici';
const READ_ONLY_INSPECTOR_EMAIL = 'izleyici@cmms.local';

export function isBerkeUser(user: User | null | undefined): boolean {
  if (!user) return false;

  const sicilNo = normalizeAuthText(user.sicilNo);
  return Boolean(sicilNo && BERKE_ADMIN_SICIL_NOS.has(sicilNo));
}

export function isReadOnlyInspectorUser(user: User | null | undefined): boolean {
  if (!user) return false;

  const sicilNo = normalizeAuthText(user.sicilNo);
  const email = normalizeAuthText(user.email);
  return sicilNo === READ_ONLY_INSPECTOR_SICIL_NO || email === READ_ONLY_INSPECTOR_EMAIL;
}

export function isSystemAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (isReadOnlyInspectorUser(user)) return false;
  return user.role === 'ADMIN' || isBerkeUser(user);
}

export function buildCompactLoginName(ad: string, soyad: string): string {
  return normalizeAuthText(`${ad} ${soyad}`).replace(/\s+/g, '');
}

