import * as z from "zod";

export const apartmentSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  description: z.string().min(20, "Please provide a detailed description"),
  price: z.coerce.number().min(1),
  rooms: z.coerce.number().min(1),
  address: z.string().min(5, "Full address is required"),
  images: z.any().optional(), // We'll handle files manually
});