import { useQuery } from "@tanstack/react-query";

export function useLocations(locale: string) {
  return useQuery({
    queryKey: ["locations", locale],
    queryFn: async () => {
      // Assuming your JSON files are in the public folder or fetched via API
      const res = await fetch(`/api/locations?lang=${locale}`);
      return res.json();
    },
    staleTime: Infinity, // The location list rarely changes
  });
}