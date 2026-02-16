import type { User } from '../types';

function normalizeAuthText(value: string | null | undefined): string {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
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

export function buildDefaultPasswordPreview(ad: string, soyad: string): string {
  const parts = normalizeAuthText(`${ad} ${soyad}`)
    .split(' ')
    .map((part) => part.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
  const initials = parts.map((part) => part.charAt(0).toLowerCase()).join('');
  return `${initials || 'user'}123456`;
}
