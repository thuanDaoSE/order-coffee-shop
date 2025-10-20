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
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
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
    }
  }, [deliveryMethod]);

  useEffect(() => {
    onDeliveryMethodChange(deliveryMethod as 'pickup' | 'delivery');
  }, [deliveryMethod, onDeliveryMethodChange]);

  useEffect(() => {
    onAddressSelect(selectedAddressId || null);
  }, [selectedAddressId, onAddressSelect]);

  const handleAddressSubmit = async (address: Omit<Address, 'id'>) => {
    try {
      await addressService.createAddress(address);
      const updatedAddresses = await addressService.getUserAddresses();
      setAddresses(updatedAddresses);
      const newAddress = updatedAddresses[updatedAddresses.length - 1];
      setValue('addressId', String(newAddress.id));
      setShowNewAddressForm(false);
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Delivery Method
      </Typography>
      
      <RadioGroup
        {...register('deliveryMethod')}
        onChange={(e) => {
          setValue('deliveryMethod', e.target.value as 'pickup' | 'delivery');
          if (e.target.value === 'pickup') {
            setValue('addressId', null);
          }
        }}
      >
        <FormControlLabel 
          value="pickup" 
          control={<Radio />} 
          label="Pick up at store"
        />
        <FormControlLabel 
          value="delivery" 
          control={<Radio />} 
          label="Delivery to address"
        />
      </RadioGroup>

      {deliveryMethod === 'delivery' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select Delivery Address
          </Typography>
          
          {isLoading ? (
            <CircularProgress />
          ) : addresses.length > 0 && !showNewAddressForm ? (
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
                      <Box>
                        <Typography variant="subtitle2">{address.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.addressText}
                        </Typography>
                        {address.notes && (
                          <Typography variant="body2" color="text.secondary">
                            Note: {address.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowNewAddressForm(true)}
                sx={{ mt: 2 }}
              >
                Add New Address
              </Button>
            </Box>
          ) : (
            showNewAddressForm || addresses.length === 0 ? (
              <Box>
                <AddressForm
                  onSubmit={handleAddressSubmit}
                  onCancel={() => setShowNewAddressForm(false)}
                />
              </Box>
            ) : null
          )}
        </Box>
      )}
    </Box>
  );
};