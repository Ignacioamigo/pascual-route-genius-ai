import 'dotenv/config';
console.log('INICIO DEL SERVER.TS');
import express from 'express';
console.log('EXPRESS IMPORTADO');
import { db, getClients, getClientById } from './lib/db';
console.log('DB IMPORTADO');
import { askPascualAssistant, type PascualContext } from './lib/gemini';
console.log('GEMINI IMPORTADO');
import metricsRouter from './routes/metrics';
import { getClientMetrics } from './services/metrics';
console.log('METRICS ROUTER IMPORTADO');

const app = express();
const PORT = process.env.PORT || 5050;

// CORS configuration for Lovable and other domains
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Rutas
app.use('/api/metrics', metricsRouter);

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
  
  try {
    let clientData = null;
    let metrics = null;
    let extractedClientId = clientId;

    // Buscar clientId explícito o extraerlo del mensaje
    if (clientId) {
      clientData = await getClientById(clientId);
    } else {
      const match = message.match(/client(?:e)?[\s:]*([0-9]+)/i);
      if (match) {
        extractedClientId = match[1];
        clientData = await getClientById(extractedClientId);
      }
    }

    // Si encontramos un cliente, obtener también sus métricas
    if (clientData && extractedClientId) {
      try {
        metrics = await getClientMetrics(extractedClientId);
        console.log('📊 Métricas obtenidas para cliente:', extractedClientId);
      } catch (metricsError) {
        console.warn('⚠️ No se pudieron obtener métricas para el cliente:', extractedClientId);
        // Continuar sin métricas
      }
    }

    // Construir contexto para el asistente profesional
    const context: PascualContext = {};
    
    if (clientData) {
      context.clientData = clientData;
      console.log('✅ Datos de cliente encontrados:', clientData.client_id);
    }
    
    if (metrics) {
      context.metrics = metrics;
      console.log('✅ Métricas incluidas en contexto');
    }

    // Log del contexto
    console.dir({ 
      message, 
      clientId: extractedClientId, 
      hasClientData: !!clientData, 
      hasMetrics: !!metrics 
    }, { depth: null });

    // Usar el nuevo asistente profesional
    const answer = await askPascualAssistant(message, context);
    
    res.json({ 
      answer,
      clientId: extractedClientId,
      hasClientData: !!clientData,
      hasMetrics: !!metrics
    });
    
  } catch (err) {
    console.error('🔴 Error en chat profesional:', err);
    res.status(500).json({ 
      error: 'Error processing professional chat request', 
      details: err instanceof Error ? err.message : err 
    });
  }
});

app.get('/api/clients-test', async (req, res) => {
  console.log('Petición recibida en /api/clients-test');
  res.json({ test: true });
});

app.get('/api/health', async (req, res) => {
  try {
    await db.query('select 1');
    console.log('🟢 DB OK');
    res.json({ db: 'ok' });
  } catch (err) {
    console.error('🔴 DB ERROR:', err);
    res.status(500).json({ db: 'error', details: err instanceof Error ? err.message : err });
  }
});

app.listen(PORT, () => {
  console.log(`*** SERVIDOR INICIADO EN PUERTO ${PORT} ***`);
}); 