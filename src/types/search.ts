import * as Icons from "lucide-react";

export interface FilterOption {
  id: number;
  name?: string;
  label?: string;
  iconName?: keyof typeof Icons;
}

export interface SearchState {
  type: number | null;
  dealType: number | null;
  location: any[] | null;
  minArea: string;
  maxArea: string;
  minPrice: string;
  maxPrice: string;
}