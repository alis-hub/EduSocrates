import * as crypto from 'crypto';

/** No 0/O/1/I/L: codes get read aloud and typed from a whiteboard. 31^8 ≈ 8.5e11 possibilities. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Cryptographically random class code, formatted XXXX-XXXX. */
export function generateJoinCode(): string {
  let raw = '';
  for (let i = 0; i < 8; i++) raw += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

/** What the database compares: upper-case, no spaces, no dashes. */
export function normalizeJoinCode(input: unknown): string {
  return String(input ?? '').toUpperCase().replace(/[\s-]+/g, '');
}
