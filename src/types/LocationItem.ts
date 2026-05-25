export interface LocationItem {
  id: number;
  title: string;
  latitude: number | null;
  longitude: number | null;
  cities?: LocationItem[];
}

export interface LocationNode {
  i: number;
  t: string;
  v: number;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  latitude: number | null;
  longitude: number | null;
  c?: LocationNode[]; 
}

export type LocationData = LocationNode[];
