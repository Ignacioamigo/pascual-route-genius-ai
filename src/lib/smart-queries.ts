import { db } from './db';

// Types for query results
export interface SmartQueryResult {
  type: string;
  data: any[];
  summary: string;
  sql_executed?: string;
}

// Query patterns and their corresponding SQL
export const QUERY_PATTERNS = {
  // IMPORTANT: Specific patterns (with params) MUST come BEFORE general patterns
  
  // Efficiency queries BY CITY (SPECIFIC - FIRST)
  MOST_EFFICIENT_BY_CITY: {
    patterns: [
      /cliente más eficiente en ([a-záéíóúüñ\w]+)/i,
      /most efficient client in ([a-záéíóúüñ\w]+)/i,
      /best efficiency in ([a-záéíóúüñ\w]+)/i,
      /mejor cliente en ([a-záéíóúüñ\w]+)/i
    ],
    sql: `
      SELECT 
        client_id, 
        city, 
        channel,
        CAST(efficiency AS NUMERIC) as efficiency_score,
        median_ticket_year,
        total_income,
        cluster_name
      FROM client_summary 
      WHERE city ILIKE $1
        AND efficiency IS NOT NULL 
        AND CAST(efficiency AS NUMERIC) > 0
      ORDER BY CAST(efficiency AS NUMERIC) DESC 
      LIMIT 5
    `,
    description: "Most efficient clients in specific city",
    hasParams: true
  },

  // Efficiency queries GLOBAL (GENERAL - AFTER)
  MOST_EFFICIENT_GLOBAL: {
    patterns: [
      /cliente más eficiente/i,
      /most efficient client/i,
      /best efficiency/i,
      /cliente con mejor eficiencia/i
    ],
    sql: `
      SELECT 
        client_id, 
        city, 
        channel,
        CAST(efficiency AS NUMERIC) as efficiency_score,
        median_ticket_year,
        total_income,
        cluster_name
      FROM client_summary 
      WHERE efficiency IS NOT NULL 
        AND CAST(efficiency AS NUMERIC) > 0
      ORDER BY CAST(efficiency AS NUMERIC) DESC 
      LIMIT 5
    `,
    description: "Most efficient clients globally"
  },



  // Median ticket queries BY CITY (SPECIFIC - FIRST)
  HIGHEST_MEDIAN_TICKET_BY_CITY: {
    patterns: [
      /clients with (?:the )?(?:better|best|highest) median ticket in ([a-záéíóúüñ\w]+)/i,
      /mejor (?:ticket medio|median ticket) en ([a-záéíóúüñ\w]+)/i,
      /highest ticket in ([a-záéíóúüñ\w]+)/i,
      /clientes con mejor ticket en ([a-záéíóúüñ\w]+)/i
    ],
    sql: `
      SELECT 
        client_id, 
        city, 
        channel,
        CAST(median_ticket_year AS NUMERIC) as median_ticket,
        CAST(total_income AS NUMERIC) as revenue,
        total_orders,
        cluster_name
      FROM client_summary 
      WHERE city ILIKE $1
        AND median_ticket_year IS NOT NULL 
        AND CAST(median_ticket_year AS NUMERIC) > 0
      ORDER BY CAST(median_ticket_year AS NUMERIC) DESC 
      LIMIT 5
    `,
    description: "Clients with highest median ticket in specific city",
    hasParams: true
  },

  // Median ticket queries GLOBAL (GENERAL - AFTER)
  HIGHEST_MEDIAN_TICKET_GLOBAL: {
    patterns: [
      /clients with (?:the )?(?:better|best|highest) median ticket/i,
      /mejor (?:ticket medio|median ticket)/i,
      /highest ticket/i,
      /clientes con mejor ticket/i,
      /best median ticket/i
    ],
    sql: `
      SELECT 
        client_id, 
        city, 
        channel,
        CAST(median_ticket_year AS NUMERIC) as median_ticket,
        CAST(total_income AS NUMERIC) as revenue,
        total_orders,
        cluster_name
      FROM client_summary 
      WHERE median_ticket_year IS NOT NULL 
        AND CAST(median_ticket_year AS NUMERIC) > 0
      ORDER BY CAST(median_ticket_year AS NUMERIC) DESC 
      LIMIT 5
    `,
    description: "Clients with highest median ticket globally"
  },

  // Revenue/Income queries BY CITY (SPECIFIC - FIRST)
  HIGHEST_REVENUE_BY_CITY: {
    patterns: [
      /cliente con más ingresos en ([a-záéíóúüñ\w]+)/i,
      /highest revenue client in ([a-záéíóúüñ\w]+)/i,
      /mejor cliente por ingresos en ([a-záéíóúüñ\w]+)/i,
      /most profitable client in ([a-záéíóúüñ\w]+)/i
    ],
    sql: `
      SELECT 
        client_id, 
        city, 
        channel,
        CAST(total_income AS NUMERIC) as revenue,
        median_ticket_year,
        total_orders,
        cluster_name
      FROM client_summary 
      WHERE city ILIKE $1
        AND total_income IS NOT NULL 
      ORDER BY CAST(total_income AS NUMERIC) DESC 
      LIMIT 5
    `,
    description: "Highest revenue clients in specific city",
    hasParams: true
  },

  // Revenue/Income queries GLOBAL (GENERAL - AFTER)
  HIGHEST_REVENUE_GLOBAL: {
    patterns: [
      /cliente con más ingresos/i,
      /highest revenue client/i,
      /mejor cliente por ingresos/i,
      /most profitable client/i
    ],
    sql: `
      SELECT 
        client_id, 
        city, 
        channel,
        CAST(total_income AS NUMERIC) as revenue,
        median_ticket_year,
        total_orders,
        cluster_name
      FROM client_summary 
      WHERE total_income IS NOT NULL 
      ORDER BY CAST(total_income AS NUMERIC) DESC 
      LIMIT 5
    `,
    description: "Highest revenue clients globally"
  },



  // Savings potential queries
  HIGHEST_SAVINGS_POTENTIAL: {
    patterns: [
      /cliente con mayor potencial de ahorro/i,
      /highest savings potential/i,
      /mayor oportunidad de optimización/i,
      /best optimization opportunity/i
    ],
    sql: `
      SELECT 
        client_id, 
        city, 
        channel,
        CAST(annual_estimated_savings AS NUMERIC) as potential_savings,
        CAST(estimated_savings AS NUMERIC) as monthly_savings,
        visits_removed,
        cluster_name,
        median_ticket_year
      FROM client_summary 
      WHERE annual_estimated_savings IS NOT NULL 
        AND CAST(annual_estimated_savings AS NUMERIC) > 0
      ORDER BY CAST(annual_estimated_savings AS NUMERIC) DESC 
      LIMIT 5
    `,
    description: "Clients with highest savings potential"
  },

  // Cluster analysis
  CLIENTS_BY_CLUSTER: {
    patterns: [
      /clientes del cluster ([a-záéíóúüñ\w\s]+)/i,
      /clients in cluster ([a-záéíóúüñ\w\s]+)/i,
      /([a-záéíóúüñ\w\s]+) cluster clients/i,
      /clientes ([a-záéíóúüñ\w\s]+)/i
    ],
    sql: `
      SELECT 
        client_id, 
        city, 
        channel,
        CAST(total_income AS NUMERIC) as revenue,
        CAST(efficiency AS NUMERIC) as efficiency_score,
        median_ticket_year,
        cluster_name,
        class
      FROM client_summary 
      WHERE cluster_name ILIKE $1 OR class ILIKE $1
      ORDER BY CAST(total_income AS NUMERIC) DESC 
      LIMIT 10
    `,
    description: "Clients in specific cluster",
    hasParams: true
  },

  // Top cities by median ticket (SPECIFIC - FIRST)
  TOP_CITIES_MEDIAN_TICKET: {
    patterns: [
      /top (\d+) cities with (?:the )?(?:better|best|highest) median ticket/i,
      /(\d+) mejores ciudades por ticket medio/i,
      /top (\d+) ciudades con mejor ticket/i,
      /best (\d+) cities by median ticket/i
    ],
    sql: `
      SELECT 
        city,
        COUNT(*) as total_clients,
        AVG(CAST(median_ticket_year AS NUMERIC)) as avg_median_ticket,
        SUM(CAST(total_income AS NUMERIC)) as total_revenue
      FROM client_summary 
      WHERE median_ticket_year IS NOT NULL 
        AND CAST(median_ticket_year AS NUMERIC) > 0
        AND city IS NOT NULL
      GROUP BY city
      ORDER BY AVG(CAST(median_ticket_year AS NUMERIC)) DESC 
      LIMIT $1
    `,
    description: "Top cities by median ticket",
    hasParams: true
  },

  // City statistics
  CITY_STATISTICS: {
    patterns: [
      /stats of ([a-záéíóúüñ\w]+)/i,
      /estadísticas de ([a-záéíóúüñ\w]+)/i,
      /statistics for ([a-záéíóúüñ\w]+)/i,
      /datos de ([a-záéíóúüñ\w]+)/i,
      /([a-záéíóúüñ\w]+) city stats/i,
      /resumen de ([a-záéíóúüñ\w]+)/i
    ],
    sql: `
      SELECT 
        COUNT(*) as total_clients,
        SUM(CAST(total_income AS NUMERIC)) as total_revenue,
        AVG(CAST(median_ticket_year AS NUMERIC)) as avg_ticket,
        SUM(CAST(annual_estimated_savings AS NUMERIC)) as total_savings_potential,
        COUNT(DISTINCT cluster_name) as different_clusters
      FROM client_summary 
      WHERE city ILIKE $1
    `,
    description: "City statistics summary",
    hasParams: true
  }
};

// Function to detect query type and extract parameters
export function detectQueryPattern(message: string): { pattern: any; params: string[] } | null {
  for (const [key, queryDef] of Object.entries(QUERY_PATTERNS)) {
    for (const pattern of queryDef.patterns) {
      const match = message.match(pattern);
      if (match) {
        const params = match.slice(1); // Extract captured groups
        return { pattern: queryDef, params };
      }
    }
  }
  return null;
}

// Execute smart query
export async function executeSmartQuery(message: string): Promise<SmartQueryResult | null> {
  const detection = detectQueryPattern(message);
  
  if (!detection) {
    return null;
  }

  const { pattern, params } = detection;
  
  try {
    let result;
    
    if (pattern.hasParams && params.length > 0) {
      // Query with parameters - distinguish between numeric and text params
      const queryParams = params.map((p, index) => {
        // Check if this is a numeric parameter (for LIMIT, etc.)
        if (/^\d+$/.test(p)) {
          return parseInt(p); // Keep as number for LIMIT
        } else {
          return `%${p}%`; // Add wildcards for ILIKE text searches
        }
      });
      result = await db.query(pattern.sql, queryParams);
    } else {
      // Query without parameters
      result = await db.query(pattern.sql);
    }

    return {
      type: pattern.description,
      data: result.rows,
      summary: `Found ${result.rows.length} results for: ${pattern.description}`,
      sql_executed: pattern.sql
    };

  } catch (error) {
    console.error('Error executing smart query:', error);
    return {
      type: 'error',
      data: [],
      summary: `Error executing query: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Format results for LLM consumption
export function formatQueryResults(result: SmartQueryResult): string {
  if (result.type === 'error') {
    return result.summary;
  }

  if (result.data.length === 0) {
    return `No results found for: ${result.type}`;
  }

  // Format based on query type
  let formatted = `📊 ${result.type.toUpperCase()}\n\n`;
  
  result.data.forEach((row, index) => {
    // Handle different result types
    if (row.client_id) {
      // Client-based results
      formatted += `${index + 1}. Client ${row.client_id}\n`;
      if (row.city) formatted += `   📍 Location: ${row.city} (${row.channel})\n`;
      if (row.revenue) formatted += `   💰 Revenue: €${Number(row.revenue).toLocaleString()}\n`;
      if (row.efficiency_score) formatted += `   ⚡ Efficiency: ${Number(row.efficiency_score).toFixed(2)}\n`;
      if (row.potential_savings) formatted += `   💸 Savings Potential: €${Number(row.potential_savings).toLocaleString()}/year\n`;
      if (row.median_ticket) formatted += `   🎫 Median Ticket: €${Number(row.median_ticket).toFixed(2)}\n`;
      if (row.median_ticket_year) formatted += `   🎫 Median Ticket: €${Number(row.median_ticket_year).toFixed(2)}\n`;
      if (row.cluster_name) formatted += `   🏷️ Cluster: ${row.cluster_name}\n`;
    } else if (row.total_clients !== undefined || row.city) {
      // City-based results (statistics or top cities)
      const cityName = row.city || `Entry ${index + 1}`;
      formatted += `${index + 1}. ${cityName}\n`;
      if (row.total_clients) formatted += `   👥 Total Clients: ${Number(row.total_clients).toLocaleString()}\n`;
      if (row.total_revenue) formatted += `   💰 Total Revenue: €${Number(row.total_revenue).toLocaleString()}\n`;
      if (row.avg_ticket) formatted += `   🎫 Avg Median Ticket: €${Number(row.avg_ticket).toFixed(2)}\n`;
      if (row.avg_median_ticket) formatted += `   🎫 Avg Median Ticket: €${Number(row.avg_median_ticket).toFixed(2)}\n`;
      if (row.total_savings_potential) formatted += `   💸 Total Savings Potential: €${Number(row.total_savings_potential).toLocaleString()}/year\n`;
      if (row.different_clusters) formatted += `   🏷️ Different Clusters: ${row.different_clusters}\n`;
    } else {
      // Fallback for other types
      formatted += `${index + 1}. ${JSON.stringify(row)}\n`;
    }
    formatted += '\n';
  });

  return formatted;
} 