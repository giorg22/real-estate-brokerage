import { Address } from "./Address";
import { Specifications } from "./Specifications";

export interface Apartment {
  id: string; // Guid
  price: number;
  monthlyFee?: number;
  status: number; // Enum: Draft, etc.
  type: number;   // Enum: Apartment, etc.
  ownerId: string;
  address: Address;
  specifications: Specifications;
  description: Description;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string; // ISO Date string
  updatedAt: string;
  publishedAt?: string;
  soldAt?: string;
  // Added for UI support
  images: { url: string; isPrimary: boolean }[];
}

export interface Description {
  en?: string;
  ka?: string;
  ru?: string;
}