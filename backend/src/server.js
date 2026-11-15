'use strict';
const { createApp } = require('./app');
const PORT = process.env.PORT || 3001;
createApp().listen(PORT, () => console.log(`[vault] Escuchando en http://localhost:${PORT}`));
