import { useMemo } from "react";
import locationDataKa from "@/data/location.ka.json";
import locationDataEn from "@/data/location.en.json";

export function useLocationData(locale: string, selectedLocId: number | null, cityQuery: string) {
  const PINNED_CITY_IDs = [1, 1806, 2737, 2114, 5224, 6457, 101];

  const rawData = useMemo(() => 
    (locale === "ka" ? locationDataKa : locationDataEn), 
  [locale]);

  const ALL_LOCATIONS = useMemo(() => [
    ...rawData.filter(x => x.type === 0).map((c: any) => ({ 
      id: c.id, title: c.title, type: c.type, cities: c.cities 
    })),
    ...rawData.filter(x => x.type !== 0).flatMap((m: any) => 
      m.cities.map((c: any) => ({ id: c.id, title: c.title, type: m.type }))
    )
  ], [rawData]);

  const filteredCities = useMemo(() => {
    const q = cityQuery.toLowerCase().trim();
    const base = q ? ALL_LOCATIONS.filter(l => l.title.toLowerCase().includes(q)) : ALL_LOCATIONS;
    
    return [...base].sort((a, b) => {
      const aP = PINNED_CITY_IDs.indexOf(a.id);
      const bP = PINNED_CITY_IDs.indexOf(b.id);
      if (aP !== -1 || bP !== -1) return (aP === -1 ? 9999 : aP) - (bP === -1 ? 9999 : bP);
      return a.type === 1 ? -1 : 1;
    });
  }, [cityQuery, ALL_LOCATIONS]);

  const currentCity = useMemo(() => 
    ALL_LOCATIONS.find((l) => l.id === selectedLocId), 
  [selectedLocId, ALL_LOCATIONS]);

  return { 
    ALL_LOCATIONS, 
    filteredCities, 
    currentCity 
  };
}