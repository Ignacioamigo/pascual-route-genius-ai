import 'dotenv/config';
console.log('INICIO DEL SERVER.TS');
import express from 'express';
console.log('EXPRESS IMPORTADO');
import { db, getClients, getClientById } from './lib/db';
console.log('DB IMPORTADO');
import { askPascualAssistant, type PascualContext } from './lib/gemini';
import { getClusterStrategy } from './lib/cluster-strategies';
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
    const context: PascualContext = {};
    
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

    // Agregar contexto adicional sobre la intención del usuario
    const userIntent = analyzeUserIntent(message);
    if (userIntent) {
      context.additionalData = userIntent;
    }

    // Log del contexto
    console.dir({ 
      message, 
      clientId: extractedClientId, 
      hasClientData: !!clientData, 
      hasMetrics: !!metrics,
      hasClusterStrategy: !!context.clusterStrategy,
      clusterName: clientData?.cluster_name || clientData?.class,
      userIntent
    }, { depth: null });

    // Usar el nuevo asistente profesional
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
    console.error('🔴 Error en chat profesional:', err);
    res.status(500).json({ 
      error: 'Error processing professional chat request', 
      details: err instanceof Error ? err.message : err 
    });
  }
});

// Función auxiliar para analizar la intención del usuario
function analyzeUserIntent(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Intenciones relacionadas con clientes y métricas
  const clientIntents = [
    'análisis', 'analysis', 'analizar', 'analyze',
    'rendimiento', 'performance', 'desempeño',
    'eficiencia', 'efficiency', 'rentabilidad', 'profitability',
    'ingresos', 'income', 'revenue', 'ventas', 'sales',
    'frecuencia', 'frequency', 'pedidos', 'orders',
    'optimización', 'optimization', 'optimización de rutas',
    'roi', 'retorno', 'return', 'beneficio', 'profit',
    'costos', 'costs', 'gastos', 'expenses',
    'visitas', 'visits', 'llamadas', 'calls',
    'cliente', 'customer', 'clientes', 'customers',
    'métrica', 'metric', 'métricas', 'metrics',
    'kpi', 'indicador', 'indicator'
  ];

  const hasClientIntent = clientIntents.some(intent => lowerMessage.includes(intent));
  
  if (hasClientIntent) {
    return 'User is asking about client metrics, performance, or business analysis';
  }

  // Detectar preguntas sobre el sistema en general
  const systemIntents = [
    'qué puedes hacer', 'what can you do', 'ayuda', 'help',
    'funciones', 'functions', 'capacidades', 'capabilities',
    'cómo funciona', 'how does it work', 'explicar', 'explain'
  ];

  const hasSystemIntent = systemIntents.some(intent => lowerMessage.includes(intent));
  
  if (hasSystemIntent) {
    return 'User is asking about system capabilities or help';
  }

  return null;
}

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