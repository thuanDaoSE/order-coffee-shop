import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, RadioGroup, Radio, FormControlLabel, Button, CircularProgress } from '@mui/material';
import { z } from 'zod';
import { AddressForm } from './AddressForm';
import { AddressManager } from './AddressManager';
import  {type Address}  from '../types/address';
import { addressService } from '../services/addressService';

const checkoutAddressSchema = z.object({
  deliveryMethod: z.enum(['pickup', 'delivery']),
  addressId: z.union([z.string(), z.number()]).optional().nullable(),
  newAddress: z.boolean().optional()
});

type CheckoutAddressFormData = z.infer<typeof checkoutAddressSchema>;

interface CheckoutAddressFormProps {
  onAddressSelect: (addressId: string | number | null) => void;
  onDeliveryMethodChange: (method: 'pickup' | 'delivery') => void;
}

export const CheckoutAddressForm: React.FC<CheckoutAddressFormProps> = ({
  onAddressSelect,
  onDeliveryMethodChange
}) => {
  const [formMode, setFormMode] = useState<'list' | 'edit' | 'new'>('list');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const { register, watch, setValue } = useForm<CheckoutAddressFormData>({
    resolver: zodResolver(checkoutAddressSchema),
    defaultValues: {
      deliveryMethod: 'pickup',
      addressId: null,
      newAddress: false
    }
  });

  const deliveryMethod = watch('deliveryMethod');
  const selectedAddressId = watch('addressId');

  useEffect(() => {
    const loadAddresses = async () => {
      setIsLoading(true);
      try {
        const data = await addressService.getUserAddresses();
        setAddresses(data);
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (deliveryMethod === 'delivery') {
      loadAddresses();
    } else {
      // Clear address selection when switching to pickup
      setValue('addressId', null);
      setSelectedAddress(null);
    }
  }, [deliveryMethod, setValue]);

  useEffect(() => {
    onDeliveryMethodChange(deliveryMethod as 'pickup' | 'delivery');
  }, [deliveryMethod, onDeliveryMethodChange]);

  useEffect(() => {
    onAddressSelect(selectedAddressId || null);
    if (selectedAddressId) {
      const address = addresses.find(a => String(a.id) === String(selectedAddressId));
      setSelectedAddress(address || null);
    } else {
      setSelectedAddress(null);
    }
  }, [selectedAddressId, onAddressSelect, addresses]);

  const handleAddressSubmit = async (addressData: Omit<Address, 'id'>) => {
    setIsLoading(true);
    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, addressData);
      } else {
        await addressService.createAddress(addressData);
      }
      setFormMode('list');
      const updatedAddresses = await addressService.getUserAddresses();
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Failed to save address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string | number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setIsLoading(true);
      try {
        await addressService.deleteAddress(addressId);
        const updatedAddresses = await addressService.getUserAddresses();
        setAddresses(updatedAddresses);
      } catch (error) {
        console.error('Failed to delete address:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          type="button"
          onClick={() => {
            setValue('deliveryMethod', 'pickup');
          }}
          className={`p-4 border-2 rounded-lg transition text-center ${
            deliveryMethod === 'pickup'
              ? 'border-amber-600 bg-amber-50'
              : 'border-gray-300 hover:border-amber-400'
          }`}
        >
          <div className="text-2xl mb-2">🏪</div>
          <p className="font-semibold">Tại quán</p>
        </button>
        <button
          type="button"
          onClick={() => setValue('deliveryMethod', 'delivery')}
          className={`p-4 border-2 rounded-lg transition text-center ${
            deliveryMethod === 'delivery'
              ? 'border-amber-600 bg-amber-50'
              : 'border-gray-300 hover:border-amber-400'
          }`}
        >
          <div className="text-2xl mb-2">🚚</div>
          <p className="font-semibold">Mang đi</p>
        </button>
      </div>

      {deliveryMethod === 'delivery' && (
        <Box sx={{ mt: 2 }}>
          {selectedAddress ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Giao đến:
              </Typography>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" fontWeight="bold">{selectedAddress.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAddress.addressText}
                </Typography>
                {selectedAddress.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Ghi chú: {selectedAddress.notes}
                  </Typography>
                )}
              </Box>
              <Button
                variant="text"
                onClick={() => setValue('addressId', null)}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                Chọn địa chỉ khác
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Chọn địa chỉ giao hàng
              </Typography>
              
              {isLoading ? (
                <CircularProgress />
              ) : formMode === 'list' ? (
                <Box>
                  <RadioGroup
                    {...register('addressId')}
                    onChange={(e) => setValue('addressId', e.target.value)}
                  >
                    {addresses.map((address) => (
                      <FormControlLabel
                        key={address.id}
                        value={address.id}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle2">{address.label}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {address.addressText}
                              </Typography>
                            </Box>
                            <Button size="small" onClick={() => { setEditingAddress(address); setFormMode('edit'); }}>Edit</Button>
                            <Button size="small" color="error" onClick={() => handleDeleteAddress(address.id)}>Delete</Button>
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setFormMode('new')}
                    sx={{ mt: 2, textTransform: 'none' }}
                  >
                    Thêm địa chỉ mới
                  </Button>
                </Box>
              ) : (
                <AddressForm
                  onSubmit={handleAddressSubmit}
                  onCancel={() => setFormMode('list')}
                  initialData={formMode === 'edit' ? editingAddress : undefined}
                />
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};