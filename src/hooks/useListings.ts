import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Filters } from "@/store/useListingStore";

export function useListings(filters: Filters) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: async () => {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/apartment/my`, {
        params: {
          search: filters.searchQuery || undefined,
          city: filters.city !== "all" ? filters.city : undefined,
          type: filters.type, // Sends as integer
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sort: filters.sortBy,
        }
      });
      return data;
    },
  });
}