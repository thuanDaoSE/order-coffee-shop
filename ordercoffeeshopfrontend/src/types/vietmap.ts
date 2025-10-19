export interface VietmapBoundary {
    type: number;
    id: number;
    name: string;
    prefix: string;
    full_name: string;
}

export interface VietmapAddress {
    ref_id: string;
    distance: number;
    address: string;
    name: string;
    display: string;
    boundaries: VietmapBoundary[];
    categories: any[];
    entry_points: any[];
}