import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { AddressForm } from './AddressForm';
import { addressService } from '../services/addressService';
import type { Address } from '../types/address';

export const AddressManager: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleAddressSubmit = async (address: Address) => {
    await loadAddresses();
    setIsFormVisible(false);
    setSelectedAddress(null);
  };

  const handleAddressDelete = async (id: number) => {
    try {
      await addressService.deleteAddress(id);
      await loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      await loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Addresses</h2>
        <Button onClick={() => setIsFormVisible(true)}>
          Add New Address
        </Button>
      </div>

      {isFormVisible && (
        <div className="bg-white p-4 rounded-lg shadow">
          <AddressForm
            address={selectedAddress || undefined}
            onSubmit={handleAddressSubmit}
            onCancel={() => {
              setIsFormVisible(false);
              setSelectedAddress(null);
            }}
          />
        </div>
      )}

      <div className="space-y-4">
        {addresses.map(address => (
          <div
            key={address.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-start"
          >
            <div>
              <div className="font-semibold">{address.label}</div>
              <div>{address.addressText}</div>
              {address.notes && (
                <div className="text-gray-600 text-sm">{address.notes}</div>
              )}
              {address.isDefault && (
                <span className="text-green-600 text-sm">Default Address</span>
              )}
            </div>
            <div className="space-x-2">
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setSelectedAddress(address);
                  setIsFormVisible(true);
                }}
              >
                Edit
              </Button>
              {!address.isDefault && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleSetDefault(address.id)}
                  sx={{ ml: 1 }}
                >
                  Set as Default
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleAddressDelete(address.id)}
                sx={{ ml: 1 }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};