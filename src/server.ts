import 'dotenv/config';
console.log('INICIO DEL SERVER.TS');
import express from 'express';
console.log('EXPRESS IMPORTADO');
import { getClients, getClientById } from './lib/db';
console.log('DB IMPORTADO');
import { askGemini } from './lib/gemini';
console.log('GEMINI IMPORTADO');

const app = express();
const PORT = 5050;

app.use(express.json());

app.get('/api/clients', async (req, res) => {
  console.log('Petición recibida en /api/clients');
  try {
    const clients = await getClients();
    res.json(clients);
  } catch (err) {
    console.error('Error real en /api/clients:', err);
    res.status(500).json({ error: 'Error fetching clients', details: err instanceof Error ? err.message : err });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, clientId } = req.body;
  let prompt = message;
  let clientData = null;

  // Buscar clientId explícito o extraerlo del mensaje
  if (clientId) {
    clientData = await getClientById(clientId);
  } else {
    const match = message.match(/client(?:e)?[\s:]*([0-9]+)/i);
    if (match) {
      clientData = await getClientById(match[1]);
    }
  }

  console.log('Resultado de getClientById:', clientData);

  if (clientData) {
    // Convertir los datos a texto narrativo
    const narrative = `El cliente ${clientData.client_id} es de ${clientData.city}, pertenece al canal ${clientData.channel}, su promotor es ${clientData.promotor_id}. Ha realizado ${clientData.total_orders} pedidos, con un volumen total de ${clientData.total_volume} y un ingreso total de ${clientData.total_income}. El ticket medio anual es de ${clientData.median_ticket_year}. Ha recibido ${clientData.total_promotor_visits} visitas y ${clientData.total_promotor_calls} llamadas del promotor. Su frecuencia de compra es ${clientData.client_frequency}.`;
    prompt = `${narrative}\n\nPregunta del usuario: ${message}`;
  } else {
    prompt = `No se encontraron datos específicos de cliente. Pregunta del usuario: ${message}`;
  }

  console.log('Prompt enviado a Gemini:\n', prompt);

  try {
    const answer = await askGemini(prompt);
    res.json({ answer });
  } catch (err) {
    console.error('Error al consultar Gemini:', err);
    res.status(500).json({ error: 'Error al consultar Gemini', details: err instanceof Error ? err.message : err });
  }
});

app.get('/api/clients-test', async (req, res) => {
  console.log('Petición recibida en /api/clients-test');
  res.json({ test: true });
});

app.listen(PORT, () => {
  console.log(`*** SERVIDOR INICIADO EN PUERTO ${PORT} ***`);
}); 