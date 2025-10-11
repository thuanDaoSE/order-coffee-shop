import { useState, useEffect, useCallback } from 'react';

interface UseImageUrlOptions {
  defaultUrl?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export function useImageUrl(key: string | null, options: UseImageUrlOptions = {}) {
  const [url, setUrl] = useState<string>(options.defaultUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryAttempts = options.retryAttempts || 3;
  const retryDelay = options.retryDelay || 1000;

  const fetchSignedUrl = useCallback(async (attempt: number = 0) => {
    if (!key) {
      setUrl(options.defaultUrl || '');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/r2/signed-url?key=${encodeURIComponent(key)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch signed URL');
      }

      const data = await response.json();
      setUrl(data.url);
    } catch (err) {
      console.error('Error fetching signed URL:', err);
      
      if (attempt < retryAttempts) {
        setTimeout(() => fetchSignedUrl(attempt + 1), retryDelay);
      } else {
        setError(err as Error);
        setUrl(options.defaultUrl || '');
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, options.defaultUrl, retryAttempts, retryDelay]);

  useEffect(() => {
    fetchSignedUrl();
  }, [fetchSignedUrl]);

  const refresh = useCallback(() => {
    fetchSignedUrl();
  }, [fetchSignedUrl]);

  return {
    url,
    isLoading,
    error,
    refresh
  };
}