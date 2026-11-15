'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

async function withServer(fn) {
  const server = createApp().listen(0);
  const base = `http://localhost:${server.address().port}`;
  try { await fn(base); } finally { server.close(); }
}
const post = (base, path, body) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('POST /anonymize y /deanonymize (ida y vuelta por HTTP)', async () => {
  await withServer(async (base) => {
    const message = 'oferta de trabajo para Dago Borda con email dborda@gmail.com y teléfono 3152319157';
    const a = await (await post(base, '/anonymize', { message })).json();
    assert.ok(a.anonymizedMessage && !a.anonymizedMessage.includes('Dago'));
    const d = await (await post(base, '/deanonymize', { anonymizedMessage: a.anonymizedMessage })).json();
    assert.strictEqual(d.message, message);
  });
});

test('validación: 400 sin campo message', async () => {
  await withServer(async (base) => {
    const r = await post(base, '/anonymize', {});
    assert.strictEqual(r.status, 400);
  });
});
