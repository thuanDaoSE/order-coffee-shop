import api from './api';
import type { VietmapAddress } from '../types/vietmap';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Convert Vietnamese diacritics to non-diacritic text
const removeDiacritics = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithDelay = async <T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retryWithDelay(fn, retries - 1, delay);
  }
};

export const locationService = {
  searchAddress: async (query: string, lat?: number, lng?: number): Promise<VietmapAddress[]> => {
    // Convert Vietnamese diacritics to non-diacritic
    const normalizedQuery = removeDiacritics(query);
    const params = new URLSearchParams({
      query: normalizedQuery,
      ...(lat && lng ? { lat: lat.toString(), lng: lng.toString() } : {})
    });
    
    return retryWithDelay(async () => {
      try {
        const response = await api.get(`/location/search?${params}`);
        return response.data;
      } catch (error: unknown) {
        console.error('Error searching address:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response: { data: unknown } };
          console.error('API Error Response:', apiError.response.data);
        }
        // Return empty array instead of throwing to prevent UI errors
        return [];
      }
    });
  },

  autocomplete: async (query: string, lat?: number, lng?: number): Promise<VietmapAddress[]> => {
    // Convert Vietnamese diacritics to non-diacritic
    const normalizedQuery = removeDiacritics(query);
    const params = new URLSearchParams({
      text: normalizedQuery,
      ...(lat && lng ? { focus: `${lat},${lng}` } : {})
    });
    
    return retryWithDelay(async () => {
      try {
        const response = await api.get(`/location/autocomplete?${params}`);
        
        if (!Array.isArray(response.data)) {
          console.warn('Unexpected API response format:', response.data);
          return [];
        }
        
        return response.data;
      } catch (error: unknown) {
        console.error('Error autocompleting address:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response: { data: unknown } };
          console.error('API Error Response:', apiError.response.data);
        }
        return [];
      }
    });
  },

  // Get current location using browser's geolocation API
  getCurrentLocation: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  }
};