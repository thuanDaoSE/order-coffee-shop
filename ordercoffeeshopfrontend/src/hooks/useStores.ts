import { useState, useEffect } from 'react';
import { getAllStores } from '../services/storeService';
import type { Store } from '../types/store';

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await getAllStores();
        setStores(data);
      } catch (err) {
        setError('Failed to fetch stores');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, isLoading, error };
};
