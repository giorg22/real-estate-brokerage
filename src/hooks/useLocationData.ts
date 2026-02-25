import { useMemo } from "react";
import locationDataKa from "@/data/location.ka.json";
import locationDataEn from "@/data/location.en.json";
import locationDataRu from "@/data/location.ru.json";

// 1. Pre-flatten data at the module level (Runs once on app load)
const flattenData = (data: any[]) => {
  const list: any[] = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.v === 0) {
      list.push(item);
    } else if (item.c) {
      for (let j = 0; j < item.c.length; j++) {
        list.push({ ...item.c[j], v: item.v });
      }
    }
  }
  return list;
};

const FLAT_KA = flattenData(locationDataKa);
const FLAT_EN = flattenData(locationDataEn);
const FLAT_RU = flattenData(locationDataRu);

// 2. Create Lookup Maps for Instant O(1) finding
const createIndex = (list: any[]) => new Map(list.map(item => [item.i, item]));
const INDEX_KA = createIndex(FLAT_KA);
const INDEX_EN = createIndex(FLAT_EN);
const INDEX_RU = createIndex(FLAT_RU);

export function useLocationData(locale: string, selectedLocId: number | null, cityQuery: string) {
  const PINNED_CITY_IDs = [1, 1806, 2737, 2114, 5224, 6457, 101];

  const { all, index } = useMemo(() => {
    if (locale === "ka") return { all: FLAT_KA, index: INDEX_KA };
    if (locale === "ru") return { all: FLAT_RU, index: INDEX_RU };
    return { all: FLAT_EN, index: INDEX_EN };
  }, [locale]);

  // Instant finding via Map index
  const currentCity = useMemo(() => {
    return selectedLocId ? index.get(selectedLocId) || null : null;
  }, [selectedLocId, index]);

  const filteredCities = useMemo(() => {
    const q = cityQuery.toLowerCase().trim();
    if (!q) {
      return all.filter((l, idx) => PINNED_CITY_IDs.includes(l.i) || idx < 30).slice(0, 50);
    }
    
    // High-speed manual loop (faster than .filter)
    const results = [];
    for (let i = 0; i < all.length; i++) {
      if (all[i].t.toLowerCase().includes(q)) {
        results.push(all[i]);
      }
      if (results.length > 50) break; // Limit DOM nodes for speed
    }
    return results;
  }, [cityQuery, all]);

  return { ALL_LOCATIONS: all, filteredCities, currentCity };
}