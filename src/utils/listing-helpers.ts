import { Apartment } from "@/types/Apartment";

export const getApartmentTitle = (item: Apartment, locale: string): string => {
  const rooms = item.specifications.rooms || 0;
  const location = item.address.street || item.address.city;

  // 1. Define the Type Labels for each language
  const typeLabels: Record<string, Record<number, string>> = {
    en: {
      0: "Apartment",
      1: "House",
      2: "Summer Cottage",
      3: "Land",
      4: "Commercial Space",
      5: "Hotel",
    },
    ka: {
      0: "ბინა",
      1: "სახლი",
      2: "აგარაკი",
      3: "მიწის ნაკვეთი",
      4: "კომერციული ფართი",
      5: "სასტუმრო",
    },
    ru: {
      0: "Квартира",
      1: "Дом",
      2: "Дача",
      3: "Земельный участок",
      4: "Коммерческая недвижимость",
      5: "Отель",
    },
  };

  // 2. Get the label based on locale and type (fallback to English Apartment)
  const currentLabels = typeLabels[locale] || typeLabels.en;
  const typeName = currentLabels[item.type as number] || currentLabels[0];

  // 3. Construct the templates
  const templates: Record<string, string> = {
    ka: `${rooms}-ოთახიანი ${typeName}, ${location}`,
    ru: `${rooms}-комнатная ${typeName}, ${location}`,
    en: `${rooms} Room ${typeName} in ${location}`,
  };

  return templates[locale] || templates.en;
};