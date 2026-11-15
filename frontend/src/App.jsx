import { useState } from 'react';
import { anonymize, deanonymize } from './api.js';

const EJEMPLO =
  'Hola, soy Karen Vargas de la Universidad Javeriana. Somos 15 personas y queremos una experiencia gastronómica en el Eje Cafetero en marzo de 2027. Escríbanme a kvargas@mail.com o llamen al 315 231 9157.';

export default function App() {
  const [message, setMessage] = useState(EJEMPLO);
  const [anonymized, setAnonymized] = useState('');
  const [restored, setRestored] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function run(action) {
    setError('');
    setLoading(true);
    try {
      if (action === 'anonymize') {
        const { anonymizedMessage } = await anonymize(message);
        setAnonymized(anonymizedMessage);
        setRestored('');
      } else {
        const { message: original } = await deanonymize(anonymized);
        setRestored(original);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>OrigenTours · Privacy Vault</h1>
      <p className="sub">
        Paso previo al brief con GenAI (actividad N02A): el modelo solo verá el mensaje anonimizado.
      </p>

      <label htmlFor="msg">Mensaje del cliente (contiene datos personales)</label>
      <textarea id="msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
      <button disabled={loading || !message.trim()} onClick={() => run('anonymize')}>
        Anonimizar
      </button>

      {anonymized && (
        <section>
          <label htmlFor="anon">Mensaje anonimizado (lo que recibiría el LLM)</label>
          <textarea id="anon" rows={5} value={anonymized} readOnly />
          <button disabled={loading} onClick={() => run('deanonymize')}>
            Restituir datos originales
          </button>
        </section>
      )}

      {restored && (
        <section>
          <label htmlFor="rest">Mensaje restituido (para revisión de Atención al cliente)</label>
          <textarea id="rest" rows={5} value={restored} readOnly />
        </section>
      )}

      {error && <p className="error">{error}</p>}
    </main>
  );
}
