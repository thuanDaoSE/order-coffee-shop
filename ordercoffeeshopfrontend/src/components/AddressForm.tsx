import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Box, 
  Stack, 
  FormGroup, 
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress
} from '@mui/material';
import type { Address } from '../types/address';
import type { VietmapAddress } from '../types/vietmap';
import { addressService } from '../services/addressService';
import { locationService } from '../services/locationService';
import debounce from 'lodash/debounce';

interface AddressFormProps {
  address?: Address;
  onSubmit: (address: Address) => void;
  onCancel: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    addressText: address?.addressText || '',
    label: address?.label || '',
    latitude: address?.latitude || 0,
    longitude: address?.longitude || 0,
    isDefault: address?.isDefault || false,
    notes: address?.notes || ''
  });
  const [suggestions, setSuggestions] = useState<VietmapAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search function with 500ms delay
  const searchAddress = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Frontend - Sending autocomplete request with query:', query);
        const results = await locationService.autocomplete(query);
        console.log('Frontend - Received autocomplete response:', results);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500), // Changed from 300ms to 500ms
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      searchAddress.cancel();
    };
  }, [searchAddress]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      addressText: value,
      latitude: 0,
      longitude: 0
    }));
    
    if (value.length > 2) {
      searchAddress(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: VietmapAddress) => {
    setFormData(prev => ({
      ...prev,
      addressText: suggestion.display || suggestion.address || '',
      latitude: 0, // You might want to get these from the suggestion if available
      longitude: 0  // You might want to get these from the suggestion if available
    }));
    setShowSuggestions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = address?.id
        ? await addressService.updateAddress(address.id, formData)
        : await addressService.createAddress(formData);
      onSubmit(response);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 500 }}>
      <Stack spacing={3} ref={containerRef}>
        <Box position="relative">
          <TextField
            fullWidth
            label="Address"
            id="addressText"
            name="addressText"
            value={formData.addressText}
            onChange={handleAddressChange}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            required
            placeholder="Start typing your address..."
            variant="outlined"
            margin="normal"
            autoComplete="off"
            InputProps={{
              endAdornment: isLoading ? <CircularProgress size={20} /> : null,
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <Paper 
              elevation={3} 
              sx={{
                position: 'absolute',
                width: '100%',
                zIndex: 10,
                maxHeight: 250,
                overflow: 'auto',
                mt: 0.5
              }}
            >
              <List>
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <ListItem 
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText 
                        primary={suggestion.name || 'Unnamed Location'} 
                        secondary={suggestion.address}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText 
                      primary="Không tìm thấy địa chỉ phù hợp"
                      sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          )}
        </Box>

        <TextField
          fullWidth
          label="Label"
          id="label"
          name="label"
          value={formData.label}
          onChange={handleChange}
          required
          placeholder="Home, Office, etc."
          variant="outlined"
          margin="normal"
        />

        <TextField
          fullWidth
          label="Notes (Optional)"
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional instructions"
          variant="outlined"
          margin="normal"
          multiline
          rows={2}
        />

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
            }
            label="Set as default address"
          />
        </FormGroup>

        <Stack direction="row" spacing={2} marginTop={2}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            size="large"
          >
            {address ? 'Update' : 'Save'} Address
          </Button>
          <Button 
            type="button" 
            variant="outlined" 
            onClick={onCancel}
            size="large"
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};