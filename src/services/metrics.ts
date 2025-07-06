import { db } from '../lib/db';

// Constantes de costos (leer de .env si existen)
const VISIT_COST = parseFloat(process.env.VISIT_COST || '15'); // €/visita
const LOGISTICS_COST = parseFloat(process.env.LOGISTICS_COST || '10'); // €/pedido

export interface ClientMetrics {
  median_ticket: number;
  order_frequency: number;
  total_income: number;
  visit_cost: number;
  logistics_cost: number;
  profit: number;
  roi_percent: number;
  potential_savings: number;
  channel_share: Array<{ channel: string; percentage: number; }>;
  top_cities: Array<{ city: string; profit: number; }>;
  top_savings_cities: Array<{ city: string; savings: number; }>;
  top_income_cities: Array<{ city: string; income: number; }>;
}

export async function getClientMetrics(clientId: string): Promise<ClientMetrics> {
  try {
    // Obtener datos del cliente específico
    const clientQuery = `
      SELECT 
        *,
        (total_promotor_visits * $2) AS visit_cost_calculated,
        (total_orders * $3) AS logistics_cost_calculated,
        (total_income - (total_promotor_visits * $2) - (total_orders * $3)) AS profit_calculated,
        CASE 
          WHEN (total_promotor_visits * $2 + total_orders * $3) > 0 
          THEN ((total_income - (total_promotor_visits * $2) - (total_orders * $3)) / (total_promotor_visits * $2 + total_orders * $3)) * 100
          ELSE 0 
        END AS roi_calculated
      FROM client_summary 
      WHERE client_id = $1
    `;
    
    const clientResult = await db.query(clientQuery, [clientId, VISIT_COST, LOGISTICS_COST]);
    
    if (clientResult.rows.length === 0) {
      throw new Error(`Cliente ${clientId} no encontrado`);
    }
    
    const client = clientResult.rows[0];
    
    // Calcular order_frequency (client_frequency ya está en pedidos/semana)
    const orderFrequency = client.client_frequency ? parseFloat(client.client_frequency) : 0;
    
    // Para un cliente individual, channel_share solo mostrará su canal
    const channelShare = [{
      channel: client.channel || 'Unknown',
      percentage: 100
    }];
    
    // Para un cliente individual, top_cities solo mostrará su ciudad
    const topCities = [{
      city: client.city || 'Unknown',
      profit: client.profit_calculated || 0
    }];
    
    // Calcular potential savings para un cliente individual (anual)
    const potentialSavings = parseFloat(client.annual_estimated_savings || (client.estimated_savings || '0') * 12 || '0');
    
    // Para un cliente individual, top_savings_cities solo mostrará su ciudad
    const topSavingsCities = [{
      city: client.city || 'Unknown',
      savings: potentialSavings
    }];
    
    // Para un cliente individual, top_income_cities solo mostrará su ciudad
    const topIncomeCities = [{
      city: client.city || 'Unknown',
      income: parseFloat(client.total_income || '0')
    }];
    
    return {
      median_ticket: parseFloat(client.median_ticket_year || '0'),
      order_frequency: orderFrequency,
      total_income: parseFloat(client.total_income || '0'),
      visit_cost: parseFloat(client.visit_cost_calculated || '0'),
      logistics_cost: parseFloat(client.logistics_cost_calculated || '0'),
      profit: parseFloat(client.profit_calculated || '0'),
      roi_percent: parseFloat(client.roi_calculated || '0'),
      potential_savings: potentialSavings,
      channel_share: channelShare,
      top_cities: topCities,
      top_savings_cities: topSavingsCities,
      top_income_cities: topIncomeCities
    };
    
  } catch (error) {
    console.error('Error calculating client metrics:', error);
    throw error;
  }
}

export async function getGlobalMetrics(): Promise<ClientMetrics> {
  console.log('🚀 INICIO DE getGlobalMetrics()');
  try {
    // Obtener métricas globales
    const globalQuery = `
      SELECT 
        AVG(CAST(median_ticket_year AS NUMERIC)) as avg_median_ticket,
        SUM(CAST(client_frequency AS NUMERIC)) as total_order_frequency,
        SUM(CAST(total_income AS NUMERIC)) as total_income_sum,
        SUM(total_promotor_visits * $1) as total_visit_cost,
        SUM(total_orders * $2) as total_logistics_cost,
        SUM(CAST(total_income AS NUMERIC) - (total_promotor_visits * $1) - (total_orders * $2)) as total_profit,
        CASE 
          WHEN SUM(total_promotor_visits * $1 + total_orders * $2) > 0 
          THEN (SUM(CAST(total_income AS NUMERIC) - (total_promotor_visits * $1) - (total_orders * $2)) / SUM(total_promotor_visits * $1 + total_orders * $2)) * 100
          ELSE 0 
        END as roi_percent
      FROM client_summary
    `;
    
    const globalResult = await db.query(globalQuery, [VISIT_COST, LOGISTICS_COST]);
    const global = globalResult.rows[0];
    console.log('✅ Consulta global completada, primeros valores:', {
      total_income: global.total_income_sum,
      profit: global.total_profit
    });
    
    // Obtener distribución por canal
    const channelQuery = `
      SELECT 
        channel,
        COUNT(*) as client_count,
        SUM(CAST(total_income AS NUMERIC)) as channel_income
      FROM client_summary 
      WHERE channel IS NOT NULL
      GROUP BY channel
    `;
    
    const channelResult = await db.query(channelQuery);
    const totalIncome = channelResult.rows.reduce((sum, row) => sum + parseFloat(row.channel_income || '0'), 0);
    
    const channelShare = channelResult.rows.map(row => ({
      channel: row.channel,
      percentage: totalIncome > 0 ? (parseFloat(row.channel_income || '0') / totalIncome * 100) : 0
    }));
    
    // Obtener top 3 ciudades por beneficio
    const citiesQuery = `
      SELECT 
        city,
        SUM(CAST(total_income AS NUMERIC) - (total_promotor_visits * $1) - (total_orders * $2)) as city_profit
      FROM client_summary 
      WHERE city IS NOT NULL
      GROUP BY city
      ORDER BY city_profit DESC
      LIMIT 3
    `;
    
    const citiesResult = await db.query(citiesQuery, [VISIT_COST, LOGISTICS_COST]);
    const topCities = citiesResult.rows.map(row => ({
      city: row.city,
      profit: parseFloat(row.city_profit || '0')
    }));
    
    // Calcular potential savings globales (suma anual de estimated_savings*12 o annual_estimated_savings)
    const savingsQuery = `
      SELECT SUM(
        COALESCE(
          CAST(annual_estimated_savings AS NUMERIC),
          CAST(estimated_savings AS NUMERIC) * 12,
          0
        )
      ) as total_potential_savings
      FROM client_summary
      WHERE estimated_savings IS NOT NULL OR annual_estimated_savings IS NOT NULL
    `;
    
    const savingsResult = await db.query(savingsQuery);
    const totalPotentialSavings = parseFloat(savingsResult.rows[0]?.total_potential_savings || '0');
    
    // Obtener top 3 ciudades por potential savings (anual)
    const savingsCitiesQuery = `
      SELECT 
        city,
        SUM(
          COALESCE(
            CAST(annual_estimated_savings AS NUMERIC),
            CAST(estimated_savings AS NUMERIC) * 12,
            0
          )
        ) as city_savings
      FROM client_summary 
      WHERE city IS NOT NULL 
        AND (estimated_savings IS NOT NULL OR annual_estimated_savings IS NOT NULL)
      GROUP BY city
      ORDER BY city_savings DESC
      LIMIT 3
    `;
    
    const savingsCitiesResult = await db.query(savingsCitiesQuery);
    const topSavingsCities = savingsCitiesResult.rows.map(row => ({
      city: row.city,
      savings: parseFloat(row.city_savings || '0')
    }));
    
    // Obtener top 3 ciudades por ingresos totales
    const incomeCitiesQuery = `
      SELECT 
        city,
        SUM(CAST(total_income AS NUMERIC)) as city_income
      FROM client_summary 
      WHERE city IS NOT NULL
      GROUP BY city
      ORDER BY city_income DESC
      LIMIT 3
    `;
    
    const incomeCitiesResult = await db.query(incomeCitiesQuery);
    const topIncomeCities = incomeCitiesResult.rows.map(row => ({
      city: row.city,
      income: parseFloat(row.city_income || '0')
    }));
    
    return {
      median_ticket: parseFloat(global.avg_median_ticket || '0'),
      order_frequency: parseFloat(global.total_order_frequency || '0'),
      total_income: parseFloat(global.total_income_sum || '0'),
      visit_cost: parseFloat(global.total_visit_cost || '0'),
      logistics_cost: parseFloat(global.total_logistics_cost || '0'),
      profit: parseFloat(global.total_profit || '0'),
      roi_percent: parseFloat(global.roi_percent || '0'),
      potential_savings: totalPotentialSavings,
      channel_share: channelShare,
      top_cities: topCities,
      top_savings_cities: topSavingsCities,
      top_income_cities: topIncomeCities
    };
    
  } catch (error) {
    console.error('Error calculating global metrics:', error);
    throw error;
  }
} 