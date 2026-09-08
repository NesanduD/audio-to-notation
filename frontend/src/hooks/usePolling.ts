import { useState, useEffect } from 'react';
import { getTranscription } from '../services/api';

export function usePolling(id: number | null) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setError(null);
      return;
    }

    setData(null);
    setError(null);

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const result = await getTranscription(id);
        if (cancelled) return;
        setData(result);
        if (result.status !== 'done' && result.status !== 'failed') {
          timeout = setTimeout(poll, 2000);
        }
      } catch (pollError) {
        if (cancelled) return;
        setError(pollError instanceof Error ? pollError.message : 'Unable to check transcription status.');
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [id]);

  return { data, error };
}