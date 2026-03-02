// src/hooks/useSearchQuery.ts
import { useQuery } from "@tanstack/react-query";

export function useSearchQuery(params: any, isEnabled: boolean) {
  return useQuery({
    queryKey: ["search-results", params],
    queryFn: async () => {
      // 1. Create a clean object
      const cleanParams: any = {};

      // 2. Only add values that are NOT null, undefined, or 0 (if 0 means "Any")
      // and only join locations if there are any
      if (params.type && params.type !== 0) cleanParams.type = params.type;
      if (params.deal && params.deal !== 0) cleanParams.deal = params.deal;
      if (params.minPrice) cleanParams.minPrice = params.minPrice;
      if (params.maxPrice) cleanParams.maxPrice = params.maxPrice;
      if (params.minArea) cleanParams.minArea = params.minArea;
      if (params.maxArea) cleanParams.maxArea = params.maxArea;
      
      // Only add locations key if the array is not empty
      if (params.locations && params.locations.length > 0) {
        cleanParams.locations = params.locations.join(',');
      }

      const queryString = new URLSearchParams(cleanParams).toString();
      
      // The '?' is only added if queryString isn't empty
      const url = `https://localhost:7075/Apartment/SearchApartments${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
  });
}