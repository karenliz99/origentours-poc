'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { anonymize, deanonymize, MemoryVault } = require('../src/anonymizer');

const ejemplo = 'oferta de trabajo para Dago Borda con email dborda@gmail.com y teléfono 3152319157';

test('anonimiza nombre, correo y teléfono', () => {
  const out = anonymize(ejemplo, new MemoryVault());
  assert.match(out, /NAME_[0-9a-f]{12}/);
  assert.match(out, /EMAIL_[0-9a-f]{12}/);
  assert.match(out, /PHONE_[0-9a-f]{12}/);
  assert.ok(!out.includes('Dago') && !out.includes('dborda') && !out.includes('3152319157'));
});

test('ida y vuelta recupera el mensaje original', () => {
  const v = new MemoryVault();
  assert.strictEqual(deanonymize(anonymize(ejemplo, v), v), ejemplo);
});

test('mismo dato produce el mismo token', () => {
  const v = new MemoryVault();
  assert.strictEqual(anonymize(ejemplo, v), anonymize(ejemplo, v));
});

test('caso OrigenTours: no toca lugares, organizaciones ni presupuestos', () => {
  const v = new MemoryVault();
  const msg = 'Hola, soy Karen Vargas de la Universidad Javeriana. Somos 15 personas, Eje Cafetero, marzo de 2027, presupuesto 1.500.000. Escríbanme a kvargas@mail.com o al +57 315 231 9157.';
  const out = anonymize(msg, v);
  assert.ok(out.includes('Universidad Javeriana') && out.includes('Eje Cafetero') && out.includes('1.500.000'));
  assert.ok(!out.includes('Karen Vargas') && !out.includes('kvargas@mail.com') && !out.includes('315 231 9157'));
  assert.strictEqual(deanonymize(out, v), msg);
});

test('tokens desconocidos se dejan intactos', () => {
  assert.strictEqual(deanonymize('hola NAME_000000000000', new MemoryVault()), 'hola NAME_000000000000');
});

test('mensaje sin PII no cambia', () => {
  const m = 'queremos una experiencia gastronómica para 10 personas';
  assert.strictEqual(anonymize(m, new MemoryVault()), m);
});
