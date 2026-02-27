import { useMemo } from "react";
import locationDataKa from "@/data/location.ka.json";
import locationDataEn from "@/data/location.en.json";
import locationDataRu from "@/data/location.ru.json";

const createFastStore = (data: any[]) => {
  const flat: any[] = [];
  const index = new Map();

  for (const item of data) {
    if (item.v === 0) {
      // Cities (Tbilisi, etc.)
      flat.push(item);
      index.set(item.i, item);
    } else if (item.c) {
      // Suburbs and Municipalities
      for (const child of item.c) {
        const enhanced = { ...child, v: item.v, t: `${item.t} - ${child.t}` };
        flat.push(enhanced);
        index.set(child.i, enhanced);
      }
    }
  }
  return { flat, index };
};

const DATA = {
  ka: createFastStore(locationDataKa),
  en: createFastStore(locationDataEn),
  ru: createFastStore(locationDataRu),
};

export function useLocationData(locale: string, selectedLocId: number | null, cityQuery: string) {
  const { flat, index } = DATA[locale as keyof typeof DATA] || DATA.en;

  const currentCity = useMemo(() => index.get(selectedLocId) || null, [selectedLocId, index]);

  const filteredCities = useMemo(() => {
    const q = cityQuery.toLowerCase().trim();
    if (!q) return flat.slice(0, 40);

    const res = [];
    for (let i = 0; i < flat.length; i++) {
      if (flat[i].t.toLowerCase().includes(q)) res.push(flat[i]);
      if (res.length > 40) break;
    }
    return res;
  }, [cityQuery, flat]);

  return { ALL_LOCATIONS: flat, filteredCities, currentCity };
}