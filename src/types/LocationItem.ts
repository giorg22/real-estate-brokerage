export interface LocationItem {
  id: number;
  title: string;
  latitude: number | null;
  longitude: number | null;
  cities?: LocationItem[];
}

export interface LocationNode {
  id: number;
  title: string;
  type: number;
  cities?: LocationNode[]; 
}

export type LocationData = LocationNode[];
