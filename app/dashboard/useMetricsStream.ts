// app/dashboard/useMetricsStream.ts
import { useState, useEffect, useRef } from 'react';

type MetricsData = {
  timestamp: string;
  cpuLoad: number;
  memory: {
    used: number;
    total: number;
    percent: number;
  };
  network: {
    rx: number;
    tx: number;
  };
  disk: {
    used: number;
    total: number;
  };
  error?: string;
};

export const useMetricsStream = () => {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics/stream');
        const result = await response.json();
        
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
          setError(null);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to fetch metrics data');
        setLoading(false);
      }
    };

    // Fetch metrics immediately
    fetchMetrics();

    // Set up interval to fetch metrics every 5 seconds
    intervalRef.current = setInterval(fetchMetrics, 5000);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { data, loading, error };
};