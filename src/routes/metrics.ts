import { Router } from 'express';
import { getClientMetrics, getGlobalMetrics } from '../services/metrics';

const router = Router();

// GET /metrics - Obtener métricas globales o por cliente
router.get('/', async (req, res) => {
  try {
    const { clientId } = req.query;
    
    let metrics;
    if (clientId && typeof clientId === 'string') {
      console.log(`Calculando métricas para cliente: ${clientId}`);
      metrics = await getClientMetrics(clientId);
    } else {
      console.log('Calculando métricas globales');
      metrics = await getGlobalMetrics();
    }
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en endpoint de métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Error calculating metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 