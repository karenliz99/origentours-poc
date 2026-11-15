'use strict';
/**
 * Privacy Vault: detecta PII (correos, teléfonos, nombres) con expresiones
 * regulares y la reemplaza por tokens TIPO_xxxxxxxxxxxx reversibles.
 */
const crypto = require('crypto');

const SECRET = process.env.VAULT_SECRET || 'dev-secret-cambiar';

// Palabras que indican organización o lugar: cortan un nombre propio.
const STOP_WORDS = new Set([
  'universidad', 'colegio', 'hotel', 'finca', 'eje', 'cafetero', 'colombia', 'bogota', 'bogotá',
  'medellin', 'medellín', 'cartagena', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre', 'hola', 'buenos',
  'buenas', 'somos', 'queremos', 'escribanme', 'escríbanme', 'origentours'
]);

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_RE = /(?:\+\d{1,3}[\s-]?)?(?:3\d{2}[\s-]?\d{3}[\s-]?\d{4}|60\d[\s-]?\d{3}[\s-]?\d{4})(?!\d)/g;
// Nombres tras una frase ancla ("me llamo", "soy", "Sr.") o secuencias de 2-4 palabras capitalizadas.
const NAME_WORD = "[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+";
const NAME_RE = new RegExp(`\\b${NAME_WORD}(?: (?:de la|del|de|y) ${NAME_WORD}| ${NAME_WORD}){1,3}`, 'g');

/** Token determinista: mismo dato -> mismo token, imposible de deducir sin el secreto. */
function makeToken(type, value, vault) {
  let n = 0;
  for (;;) {
    const h = crypto.createHmac('sha256', SECRET).update(`${type}:${value}:${n}`).digest('hex').slice(0, 12);
    const token = `${type}_${h}`;
    const existing = vault.get(token);
    if (existing === undefined || existing === value) return token;
    n += 1; // colisión: se recalcula
  }
}

/** Recorta un candidato a nombre hasta antes de la primera palabra de lugar/organización. */
function trimName(candidate) {
  const words = candidate.split(' ');
  const kept = [];
  for (const w of words) {
    if (STOP_WORDS.has(w.toLowerCase())) break;
    kept.push(w);
  }
  while (kept.length && ['de', 'la', 'del', 'y'].includes(kept[kept.length - 1])) kept.pop();
  return kept.length >= 2 ? kept.join(' ') : null;
}

/** Vault en memoria: token -> valor original. */
class MemoryVault {
  constructor() { this.map = new Map(); }
  get(token) { return this.map.get(token); }
  set(token, value) { this.map.set(token, value); }
}

function replaceAll(text, regex, type, vault, mapper) {
  return text.replace(regex, (match) => {
    const value = mapper ? mapper(match) : match;
    if (!value) return match;
    const token = makeToken(type, value, vault);
    vault.set(token, value);
    return match.replace(value, token);
  });
}

/** Anonimiza un mensaje. Orden: correo, teléfono, nombre. */
function anonymize(message, vault) {
  let out = replaceAll(message, EMAIL_RE, 'EMAIL', vault);
  out = replaceAll(out, PHONE_RE, 'PHONE', vault);
  out = replaceAll(out, NAME_RE, 'NAME', vault, trimName);
  return out;
}

/** Restituye los datos originales; los tokens desconocidos se dejan intactos. */
function deanonymize(message, vault) {
  return message.replace(/(NAME|EMAIL|PHONE)_[0-9a-f]{12}/g, (t) => {
    const v = vault.get(t);
    return v === undefined ? t : v;
  });
}

module.exports = { anonymize, deanonymize, MemoryVault };
