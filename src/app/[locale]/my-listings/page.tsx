"use client";

import { useState } from "react";
import { FilterBar2 } from "@/components/listings/filter-bar2";
import { ListingGrid2 } from "@/components/listings/listing-grid2";
import { ListingDetailModal2 } from "@/components/listings/listing-detail-modal2";
import { useListingStore } from "@/store/useListingStore";
import { useListings } from "@/hooks/useListings";
import { Loader2 } from "lucide-react";

export default function ListingsPage() {
  const { filters, setFilters } = useListingStore();
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // TanStack Query handles fetching, caching, and loading states
  const { data: listings, isLoading, isError } = useListings(filters);

  const handleCloseModal = () => setSelectedListingId(null);

  // Find the selected listing from the fetched data
  const selectedListingData = listings?.find(
    (l: any) => l.id === selectedListingId
  ) ?? null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FilterBar2 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-20">
              Failed to load listings. Please try again later.
            </div>
          ) : (
            <ListingGrid2
              listings={listings || []}
              onViewDetails={setSelectedListingId}
            />
          )}
        </div>
      </div>

      <ListingDetailModal2
        listing={selectedListingData}
        isOpen={!!selectedListingId}
        onClose={handleCloseModal}
        // Similar listings can also be fetched via a separate hook if needed
        similarListings={[]} 
      />
    </main>
  );
}