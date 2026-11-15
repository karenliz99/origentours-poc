// Cliente del backend. La URL se puede cambiar con VITE_API_URL.
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en el servicio');
  return data;
}

export const anonymize = (message) => post('/anonymize', { message });
export const deanonymize = (anonymizedMessage) => post('/deanonymize', { anonymizedMessage });
