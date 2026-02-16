import crypto from 'crypto';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function resolveJwtSecret() {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured) {
    return configured;
  }

  // Fallback is random per process to avoid a predictable default secret.
  const generated = crypto.randomBytes(32).toString('hex');
  console.warn('JWT_SECRET not set; using an ephemeral in-memory secret.');
  return generated;
}

export const JWT_SECRET = resolveJwtSecret();
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5174';
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'cmms_auth';
export const AUTH_COOKIE_MAX_AGE_MS = ONE_DAY_MS;
