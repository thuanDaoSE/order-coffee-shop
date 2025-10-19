export interface Address {
  id: number;
  addressText: string;
  label: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  notes?: string;
}