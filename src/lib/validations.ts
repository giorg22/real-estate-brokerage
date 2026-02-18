import * as z from "zod";

export const apartmentSchema = z.object({
  listingType: z.coerce.number(),
  type: z.coerce.number(),
  price: z.coerce.number(),
  area: z.coerce.number(),
  yardArea: z.coerce.number().optional(),
  rooms: z.coerce.number(),
  bedrooms: z.coerce.number(),
  floor: z.coerce.number().optional(),
  totalFloors: z.coerce.number(),
  condition: z.coerce.number(),
  period: z.coerce.number().optional(),
  status: z.coerce.number(),
  project: z.coerce.number().optional(),
  leaseType: z.coerce.number().optional(),
  typeofCRE: z.coerce.number().optional(),

  bathrooms: z.coerce.number().optional(),
  balconyCount: z.coerce.number().optional(),
  balconyArea: z.coerce.number().optional(),
  verandaArea: z.coerce.number().optional(),
  loggiaArea: z.coerce.number().optional(),
  waitingArea: z.coerce.number().optional(),
  buildYear: z.coerce.number().optional(),
  ceilingHeight: z.coerce.number().optional(),
  livingRoomArea: z.coerce.number().optional(),
  storageArea: z.coerce.number().optional(),
  parking: z.coerce.number().optional(),
  heating: z.coerce.number().optional(),
  hotWater: z.coerce.number().optional(),
  buildingMaterial: z.coerce.number().optional(),
  doorWindow: z.coerce.number().optional(),
  propertyCharacteristics: z.coerce.number().optional(),
  furnitureAndAppliances: z.coerce.number().optional(),
  buldingParameters: z.coerce.number().optional(),
  badges: z.coerce.number().optional(),

  description: z.object({
    ka: z.string().optional().default(""),
    en: z.string().optional().default(""),
    ru: z.string().optional().default(""),
  }),

  address: z.object({
    locationId: z.number({ required_error: "Location required" }).nullable(),
    streetId: z.number().nullable(),
    coords: z.any().nullable()
  }),
  images: z.array(z.object({
    url: z.string(),
    publicId: z.string(),
  })).min(0, "You must upload at least one photo"),
});