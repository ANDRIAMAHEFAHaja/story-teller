/**
 * Node < 19 : `globalThis.crypto` (Web Crypto) n’existe pas par défaut.
 * @nestjs/typeorm appelle `crypto.randomUUID()` au chargement.
 */
import { webcrypto } from 'node:crypto';

const g = globalThis as typeof globalThis & { crypto?: Crypto };

if (!g.crypto) {
  Object.defineProperty(g, 'crypto', {
    configurable: true,
    enumerable: true,
    value: webcrypto,
  });
}
