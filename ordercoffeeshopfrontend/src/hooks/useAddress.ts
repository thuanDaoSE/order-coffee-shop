import { useState, useEffect } from 'react';
import { addressService } from '../services/addressService';
import type { Address } from '../types/address';

export const useAddress = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getUserAddresses();
      setAddresses(data);
      
      // If there's a default address, select it
      const defaultAddress = data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (data.length > 0) {
        // If no default address but addresses exist, select the first one
        setSelectedAddress(data[0]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load addresses');
      console.error('Error loading addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    try {
      setLoading(true);
      const newAddress = await addressService.createAddress(address);
      await loadAddresses();
      return newAddress;
    } catch (err) {
      setError('Failed to add address');
      console.error('Error adding address:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: number, address: Partial<Address>) => {
    try {
      setLoading(true);
      const updatedAddress = await addressService.updateAddress(id, address);
      await loadAddresses();
      return updatedAddress;
    } catch (err) {
      setError('Failed to update address');
      console.error('Error updating address:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: number) => {
    try {
      setLoading(true);
      await addressService.deleteAddress(id);
      await loadAddresses();
    } catch (err) {
      setError('Failed to delete address');
      console.error('Error deleting address:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      setLoading(true);
      const defaultAddress = await addressService.setDefaultAddress(id);
      await loadAddresses();
      return defaultAddress;
    } catch (err) {
      setError('Failed to set default address');
      console.error('Error setting default address:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addresses,
    selectedAddress,
    setSelectedAddress,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshAddresses: loadAddresses
  };
};