import { normalizeAuthText } from '../middleware/auth.js';

export const PASSWORD_POLICY_MESSAGE = 'Sifre en az 8 karakter olmali ve en az 1 buyuk harf, 1 kucuk harf ve 1 rakam icermeli';

export function isPasswordPolicyCompliant(password: string): boolean {
  const value = String(password || '');
  if (value.length < 8) return false;
  if (!/\p{Lu}/u.test(value)) return false;
  if (!/\p{Ll}/u.test(value)) return false;
  if (!/\d/.test(value)) return false;
  return true;
}

export function buildDefaultUserPassword(ad: string, soyad: string): string {
  const parts = normalizeAuthText(`${ad} ${soyad}`)
    .split(' ')
    .map((part) => part.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);

  const initials = parts.map((part) => part.charAt(0)).join('');
  const alphaInitials = initials.replace(/[^a-z]/g, '');

  const firstLetter = alphaInitials.charAt(0) || 'u';
  const secondLetter = alphaInitials.charAt(1) || firstLetter || 's';

  return `${firstLetter.toUpperCase()}${secondLetter.toLowerCase()}123456`;
}
