
import { useState, useEffect } from 'react';
import axios from 'axios';
import { createApiUrl } from '@/lib/api';

export interface MetricsData {
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

interface UseMetricsResult {
  metrics: MetricsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMetrics = (clientId?: string): UseMetricsResult => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = clientId 
        ? `/api/metrics?clientId=${clientId}`
        : '/api/metrics';
      
      const url = createApiUrl(endpoint);
      const response = await axios.get(url);
      
      if (response.data.success) {
        setMetrics(response.data.data);
      } else {
        setError(response.data.error || 'Error fetching metrics');
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [clientId]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};
