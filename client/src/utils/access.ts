import type { User } from '../types';
export { buildDefaultPasswordPreview } from './passwordPolicy';

function normalizeAuthText(value: string | null | undefined): string {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isBerkeUser(user: User | null | undefined): boolean {
  if (!user) return false;

  const ad = normalizeAuthText(user.ad);
  const soyad = normalizeAuthText(user.soyad);
  const fullName = normalizeAuthText(`${user.ad} ${user.soyad}`);
  const email = normalizeAuthText(user.email);
  const sicilNo = normalizeAuthText(user.sicilNo);

  return (
    (fullName.includes('berke') && fullName.includes('karayan'))
    || (ad === 'berke' && soyad.includes('karayan'))
    || email.includes('berke')
    || sicilNo === 'berke'
  );
}

export function isSystemAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || isBerkeUser(user);
}

export function buildCompactLoginName(ad: string, soyad: string): string {
  return normalizeAuthText(`${ad} ${soyad}`).replace(/\s+/g, '');
}