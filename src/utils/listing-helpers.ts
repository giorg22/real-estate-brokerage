import { Apartment } from "@/types/Apartment";
import { Address } from "@/types/Address";
import { LocationData, LocationNode } from "@/types/LocationItem";
import { useLocale } from "next-intl";

// Import your JSON data
import locationEn from "@/data/location.en.json";
import locationKa from "@/data/location.ka.json";
import locationRu from "@/data/location.ru.json";

const locationMaps: Record<string, any> = { 
  en: locationEn, 
  ka: locationKa, 
  ru: locationRu 
};

const findLocationName = (data: LocationData, address: Address): string | null => {
  if (!data || !Array.isArray(data)) return null;

  const { address1, address2, address3, address4 } = address;

  // CASE 1: 4 Levels Deep (City -> District -> SubDistrict -> Street)
  // Logic: Return Level 3 (SubDistrict/Neighborhood) for a better UI title
  if (address1 && address2 && address3 && address4) {
    const city = data.find(x => x.i === address1);
    const district = city?.c?.find(x => x.i === address2);
    const subDistrict = district?.c?.find(x => x.i === address3);
    // We found level 4, but per your request, we return level 3 name
    return subDistrict ? subDistrict.t : null;
  }

  // CASE 2: 2 Levels Deep (Municipality -> Village/Suburb)
  // Logic: Return Level 2 (The lowest level)
  if (address1 && address4 && !address2 && !address3) {
    const municipality = data.find(x => x.v !== 0 && x.i === address1);
    const village = municipality?.c?.find(x => x.i === address4);
    return village ? village.t : null;
  }

  // CASE 3: Standard 2 Level (City -> District)
  if (address1 && address2 && !address3 && !address4) {
    const city = data.find(x => x.i === address1);
    const district = city?.c?.find(x => x.i === address2);
    return district ? district.t : null;
  }

  // FALLBACK: Recursive search for the most specific ID provided
  const targetId = address4 || address3 || address2 || address1;
  if (!targetId) return null;

  const recursiveSearch = (nodes: LocationNode[]): string | null => {
    for (const node of nodes) {
      if (node.i === targetId) return node.t;
      if (node.c) {
        const found = recursiveSearch(node.c);
        if (found) return found;
      }
    }
    return null;
  };

  return recursiveSearch(data);
};

/**
 * Hook-ready function to get localized title
 */
export const getApartmentTitle = (item: Apartment, locale: string): string => {
  const currentData = locationMaps[locale] || locationEn || [];
  const rooms = item.specifications.rooms || 0;
  const locationName = findLocationName(currentData, item.address);

  const typeLabels: Record<string, Record<number, string>> = {
    en: { 0: "Apartment", 1: "House", 2: "Summer Cottage", 3: "Land", 4: "Commercial Space", 5: "Hotel" },
    ka: { 0: "ბინა", 1: "სახლი", 2: "აგარაკი", 3: "მიწის ნაკვეთი", 4: "კომერციული ფართი", 5: "სასტუმრო" },
    ru: { 0: "Квартира", 1: "Дом", 2: "Дача", 3: "Земельный участок", 4: "Коммерческая недвижимость", 5: "Отель" },
  };

  const dealLabels: Record<string, Record<number, string>> = {
    en: { 0: "For Sale", 1: "For Rent", 2: "For Daily Rent", 3: "For Leasehold" },
    ka: { 0: "იყიდება", 1: "ქირავდება", 2: "ქირავდება დღიურად", 3: "გირავდება" },
    ru: { 0: "Продается", 1: "Сдается", 2: "Сдается посуточно", 3: "Сдается под залог" },
  };

  const currentLabels = typeLabels[locale] || typeLabels.en;
  const currentDealLabels = dealLabels[locale] || dealLabels.en;

  const typeName = currentLabels[item.type as number] || currentLabels[0];
  const dealName = currentDealLabels[item.dealType as number] || currentDealLabels[0];

  // Logic for Georgian "In" (Adessive/Inessive case)
  // Most Georgian locations end in 'ი'. To say 'in', remove 'ი' and add 'ში'.
  const formatKaLocation = (loc: string) => {
    if (!loc) return "";
    return loc.endsWith("ი") ? `${loc.slice(0, -1)}ში` : `${loc}ში`;
  };

  const templates: Record<string, string> = {
    // იყიდება 2-ოთახიანი ბინა წყნეთში
    ka: `${dealName} ${rooms}-ოთახიანი ${typeName}${locationName ? ` ${formatKaLocation(locationName)}` : ""}`,
    
    // Продается 2-комнатная квартира в Цхнети
    ru: `${dealName} ${rooms}-комнатная ${typeName}${locationName ? ` в ${locationName}` : ""}`,
    
    // 2-Room Apartment for Sale in Tskneti
    en: `${rooms}-Room ${typeName} ${dealName}${locationName ? ` in ${locationName}` : ""}`,
  };

  return templates[locale] || templates.en;
};