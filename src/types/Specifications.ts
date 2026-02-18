export interface Specifications {
  listingType: number;
  type: number;
  area: number;
  rooms?: number;
  bedrooms?: number;
  floor?: number;
  totalFloors?: number;
  condition?: number;
  status: number;
  // Optional Areas
  yardArea?: number;
  kitchenArea?: number;
  balconyArea?: number;
  verandaArea?: number;
  loggiaArea?: number;
  waitingArea?: number;
  livingRoomArea?: number;
  storageArea?: number;
  ceilingHeight?: number;
  // Optional Counts/Years
  bathrooms?: number;
  balconyCount?: number;
  buildYear?: number;
  // Selects / Enums
  period?: number;
  project?: number;
  leaseType?: number;
  typeofCRE?: number;
  parking?: number;
  heating?: number;
  hotWater?: number;
  buildingMaterial?: number;
  doorWindow?: number;
  // Bitwise Sums
  propertyCharacteristics?: number;
  furnitureAndAppliances?: number;
  buldingParameters?: number;
  badges?: number;
}