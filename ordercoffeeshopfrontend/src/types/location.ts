export interface VietMapBoundary {
  type: number;
  id: number;
  name: string;
  prefix: string;
  full_name: string;
}

export interface VietMapEntryPoint {
  ref_id: string;
  name: string;
}

export interface VietMapLocation {
  ref_id: string;
  distance: number;
  address: string;
  name: string;
  display: string;
  boundaries: VietMapBoundary[];
  categories: string[];
  entry_points: VietMapEntryPoint[];
  lat?: number;
  lng?: number;
}

export interface VietMapSuggestion {
  text: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
  displayName: string;
}