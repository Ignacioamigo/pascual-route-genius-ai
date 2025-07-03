const express = require('express');
const { getClients, getClientById } = require('./lib/db');
const { askGemini } = require('./lib/gemini');

const app = express();
const PORT = 5050;

app.use(express.json());

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await getClients();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching clients' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, clientId } = req.body;
  let prompt = `Eres un asistente experto en optimización de rutas comerciales para Pascual. Usa solo los datos proporcionados para responder de forma clara y profesional.`;

  if (clientId) {
    console.log("Buscando cliente con ID:", clientId);
    const clientData = await getClientById(clientId);
    console.log("Resultado de la consulta:", clientData);
    if (!clientData) {
      return res.json({ answer: `No se encontró el cliente ${clientId}.` });
    }
    prompt += `\n\nDatos del cliente:`;
    for (const [key, value] of Object.entries(clientData)) {
      prompt += `\n- ${key}: ${value}`;
    }
    prompt += `\n\nPregunta del usuario:\n${message}\n\nResponde de forma clara y profesional.`;
  } else {
    prompt += `\n\nPregunta del usuario:\n${message}\n\nResponde de forma clara y profesional. Si la pregunta es sobre un cliente, pide el ID o nombre.`;
  }

  console.log("Prompt enviado a Gemini:\n", prompt);

  try {
    const answer = await askGemini(prompt);
    res.json({ answer });
  } catch (err) {
    console.error('Error al consultar Gemini:', err);
    res.status(500).json({ error: 'Error al consultar Gemini', details: err instanceof Error ? err.message : err });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 