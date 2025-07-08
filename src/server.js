const express = require('express');
const { getClients, getClientById } = require('./lib/db');
const { getClientMetrics } = require('./services/metrics');
const { askPascualAssistant, getClusterStrategy } = require('./lib/gemini');

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
  
  try {
    let clientData = null;
    let metrics = null;
    let extractedClientId = clientId;

    // Buscar clientId explícito o extraerlo del mensaje con lógica mejorada
    if (clientId) {
      clientData = await getClientById(clientId);
    } else {
      // Múltiples patrones para detectar IDs de cliente
      const patterns = [
        /client(?:e)?[\s:]*([0-9]+)/i,           // "client 123" o "cliente 123"
        /(?:id|ID)[\s:]*([0-9]+)/,               // "ID 123" o "id: 123"
        /(?:número|numero|number)[\s:]*([0-9]+)/i, // "número 123"
        /(?:^|\s)([1-9][0-9]{5,8})(?:\s|$)/,     // Números de 6-9 dígitos (formato típico de ID)
        /(?:código|codigo|code)[\s:]*([0-9]+)/i,  // "código 123"
        /(?:análisis|analisis|analysis).*?([1-9][0-9]{5,8})/i // "análisis del 123456"
      ];

      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match) {
          extractedClientId = match[1];
          // Verificar que el ID existe antes de usar
          const testClientData = await getClientById(extractedClientId);
          if (testClientData) {
            clientData = testClientData;
            break;
          }
        }
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
    const context = {};
    
    if (clientData) {
      context.clientData = clientData;
      console.log('✅ Datos de cliente encontrados:', clientData.client_id);
      
      // Agregar estrategia del cluster basada en los datos del cliente
      const clusterName = clientData.cluster_name || clientData.class || null;
      const clusterStrategy = getClusterStrategy(clusterName);
      context.clusterStrategy = clusterStrategy;
      console.log('✅ Estrategia de cluster aplicada:', clusterStrategy.label);
    }
    
    if (metrics) {
      context.metrics = metrics;
      console.log('✅ Métricas incluidas en contexto');
    }

    // Usar el asistente híbrido
    const answer = await askPascualAssistant(message, context);
    
    res.json({ 
      answer,
      clientId: extractedClientId,
      hasClientData: !!clientData,
      hasMetrics: !!metrics,
      hasClusterStrategy: !!context.clusterStrategy,
      clusterLabel: context.clusterStrategy?.label
    });
    
  } catch (err) {
    console.error('🔴 Error en chat híbrido:', err);
    res.status(500).json({ 
      error: 'Error processing hybrid chat request', 
      details: err instanceof Error ? err.message : err 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 