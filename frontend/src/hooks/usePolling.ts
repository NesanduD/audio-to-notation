import { useState, useEffect } from 'react';
import { getTranscription } from '../services/api';

export function usePolling(id: number | null) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      const result = await getTranscription(id);
      setData(result);
      if (result.status === 'done' || result.status === 'failed') {
        clearInterval(interval);
      }
    }, 2000);   // poll every 2 seconds
    return () => clearInterval(interval);
  }, [id]);

  return data;
}