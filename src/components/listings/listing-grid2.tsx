"use client";

import { Apartment } from "@/types/Apartment";
import { ListingCard2 } from "./listing-card2";

// 1. Update the interface to include onCardClick
interface ListingGridProps {
  listings: Apartment[];
  onCardClick?: (apartment: Apartment) => void; // Add this line
}

// 2. Destructure onCardClick from props
export function ListingGrid2({ listings, onCardClick }: ListingGridProps) {
  if (!listings || listings.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg w-full">
        <p className="text-muted-foreground">No properties found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard2
          key={listing.id}
          listing={listing}
          // 3. Ensure ListingCard2 is also ready to receive an onClick
          onClick={() => onCardClick?.(listing)} 
        />
      ))}
    </div>
  );
}