import { useCallback, useState } from 'react';
import axios, { AxiosError } from 'axios';

interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  params?: Record<string, unknown>;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (config: RequestConfig) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios(config);
      return response.data;
    } catch (err) {
      const message = err instanceof AxiosError ? err.response?.data?.message || err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
}

export function useQuery<T>(
  url: string,
  _options?: { enabled?: boolean; refetchInterval?: number }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(url);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof AxiosError ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error, refetch: fetch };
}
