// lib/hooks/useRealtimeKPI.ts
import { useEffect, useState, useCallback } from 'react';

interface RealtimeKPIData {
  timestamp: string;
  production: {
    bottlesProduced: number;
    actualRate: number;
    targetRate: number;
    isRunning: boolean;
    temperature?: number;
    pressure?: number;
  };
  kpi: {
    trs: number;
    availability: number;
    performance: number;
    quality: number;
  };
  alerts: {
    active: number;
    downtime: number;
  };
}

export function useRealtimeKPI() {
  const [data, setData] = useState<RealtimeKPIData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    try {
      const eventSource = new EventSource('/api/kpi/stream');

      eventSource.onopen = () => {
        console.log('✅ Connexion SSE établie');
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data);
          setData(newData);
        } catch (err) {
          console.error('Erreur parsing données SSE:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('❌ Erreur SSE:', err);
        setIsConnected(false);
        setError('Erreur de connexion au flux temps réel');
        eventSource.close();

        // Reconnexion automatique après 5 secondes
        setTimeout(() => {
          console.log('🔄 Tentative de reconnexion...');
          connect();
        }, 5000);
      };

      return eventSource;
    } catch (err) {
      console.error('Erreur création EventSource:', err);
      setError('Impossible de se connecter au flux temps réel');
      return null;
    }
  }, []);

  useEffect(() => {
    const eventSource = connect();

    return () => {
      if (eventSource) {
        eventSource.close();
        setIsConnected(false);
      }
    };
  }, [connect]);

  return { data, isConnected, error };
}
