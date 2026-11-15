# OrigenTours · PoC Privacy Vault (Hito 1)

Prueba de concepto de la actividad **N02A** (brief estructurado con GenAI) del caso OrigenTours.
Esta primera entrega implementa el paso previo: un **Privacy Vault** que anonimiza datos personales
(nombres, correos, teléfonos) antes de enviar el mensaje del cliente a un LLM, y los restituye después.

## Estructura
- `backend/`  Node.js + Express. Endpoints `POST /anonymize`, `POST /deanonymize`, `GET /health`. Pruebas con `node:test`.
- `frontend/` React + Vite. Pantalla para pegar un mensaje, anonimizarlo y restituirlo.
- `docs/diagrams/` Diagramas (PlantUML, Mermaid, Python Diagrams) y diagrama del proceso del Taller 1.
- `PROMPTS.md` Prompts usados.

## Instalación
```bash
# Backend (puerto 3001)
cd backend && npm install && npm test && npm start

# Frontend (puerto 5173), en otra terminal
cd frontend && npm install && npm run dev
```
Variables opcionales del backend: `PORT`, `VAULT_SECRET` (secreto para generar los tokens).

## Prueba rápida
```bash
curl -X POST http://localhost:3001/anonymize -H "Content-Type: application/json" \
  -d '{"message":"oferta de trabajo para Dago Borda con email dborda@gmail.com y teléfono 3152319157"}'
```

## Estado
Implementado: anonimización/restitución en memoria. Pendiente: persistencia (MongoDB), llamada al LLM y generación del brief JSON.
Limitación conocida: la detección de nombres por regex es heurística y puede fallar con nombres de una sola palabra.
