'use strict';
const express = require('express');
const cors = require('cors');
const { anonymize, deanonymize, MemoryVault } = require('./anonymizer');

function createApp(vault = new MemoryVault()) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.post('/anonymize', (req, res) => {
    const { message } = req.body || {};
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'El campo "message" es obligatorio y debe ser texto.' });
    }
    res.json({ anonymizedMessage: anonymize(message, vault) });
  });

  app.post('/deanonymize', (req, res) => {
    const { anonymizedMessage } = req.body || {};
    if (typeof anonymizedMessage !== 'string' || !anonymizedMessage.trim()) {
      return res.status(400).json({ error: 'El campo "anonymizedMessage" es obligatorio y debe ser texto.' });
    }
    res.json({ message: deanonymize(anonymizedMessage, vault) });
  });

  return app;
}

module.exports = { createApp };
