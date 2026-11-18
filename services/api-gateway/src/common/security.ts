import { ConfigService } from '@nestjs/config';

/** Secrets that must never be used outside local development. */
const KNOWN_INSECURE_SECRETS = new Set([
  'default-secret',
  'dev-secret',
  'super-secret-edusocrates-jwt-key-change-in-prod',
  'edusocrates-aes256-secret-key-32b',
  'change-me',
  'changeme',
]);

export function isProduction(config?: ConfigService): boolean {
  const env = config?.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
  return env === 'production';
}

/** bcrypt hash of the password published in database/seed.sql ("Password123!"). */
export const KNOWN_SEED_PASSWORD_HASH = '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a';

/** In production, accounts still carrying the published seed password can never sign in. */
export function isLockedSeedAccount(passwordHash: string, config?: ConfigService): boolean {
  return isProduction(config) && passwordHash === KNOWN_SEED_PASSWORD_HASH;
}

/** Demo accounts, demo tokens and one-click demo logins only work when explicitly enabled, and never in production. */
export function isDemoMode(config?: ConfigService): boolean {
  const flag = config?.get<string>('ENABLE_DEMO_MODE') ?? process.env.ENABLE_DEMO_MODE;
  return flag === 'true' && !isProduction(config);
}

/**
 * JWT secret. Fails fast at startup: there is deliberately NO fallback value,
 * so a missing/weak secret can never silently turn into a forgeable token.
 */
export function getJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET is missing or shorter than 32 characters. Set a random value, e.g. `openssl rand -hex 48`.',
    );
  }
  if (KNOWN_INSECURE_SECRETS.has(secret)) {
    if (isProduction(config)) {
      throw new Error('JWT_SECRET is a known default value. Refusing to start in production.');
    }
    console.warn('[security] JWT_SECRET is a known default. Fine for local dev only — never deploy it.');
  }
  return secret;
}

/** Headers every server-to-server call to the AI gateway must carry. */
export function aiGatewayHeaders(config: ConfigService, extra: Record<string, string> = {}) {
  const key = config.get<string>('AI_GATEWAY_API_KEY') ?? '';
  if (!key && isProduction(config)) {
    throw new Error('AI_GATEWAY_API_KEY must be set in production.');
  }
  return { 'X-Internal-Key': key, ...extra };
}

export function normalizeEmail(email: string): string {
  return String(email ?? '').trim().toLowerCase();
}

/** Allowed browser origins (comma separated). */
export function getCorsOrigins(config: ConfigService): string[] {
  return (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:3001,http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── Browser sessions: HttpOnly cookie ──────────────────────────────────────

/** Name of the HttpOnly cookie that carries the access token for browsers. */
export const SESSION_COOKIE = 'gm_session';

export function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) {
      try { return decodeURIComponent(part.slice(i + 1).trim()); } catch { return null; }
    }
  }
  return null;
}

/**
 * Cookie settings. In production the web app and API live on sibling subdomains
 * (gurumera.com and api.gurumera.com), so set COOKIE_DOMAIN=.gurumera.com: the cookie is then
 * sent to both, is "same-site" (SameSite=Lax works), and is never readable by page scripts.
 */
export function sessionCookieOptions(config: ConfigService, maxAgeMs: number) {
  const domain = config.get<string>('COOKIE_DOMAIN') || undefined;
  return {
    httpOnly: true,
    secure: isProduction(config),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeMs,
    ...(domain ? { domain } : {}),
  };
}

export function isAllowedOrigin(config: ConfigService, origin: string | undefined): boolean {
  return !!origin && getCorsOrigins(config).includes(origin);
}
