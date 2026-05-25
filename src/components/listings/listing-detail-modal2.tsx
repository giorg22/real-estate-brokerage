"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Square,
  Share2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Apartment } from "@/types/Apartment";
import { useRouter } from "next/navigation";
import { getApartmentTitle } from "@/utils/listing-helpers";
import { useLocale } from "next-intl"; 
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useFavoriteStore } from "@/store/FavoriteStore"; // Ensure this path is correct
import { useAuthStore } from "@/store/useAuthStore";

export function ListingDetailModal2({ listing, isOpen }: { listing: Apartment; isOpen: boolean }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = useLocale();

  // 1. Get Auth Token
  const token = useAuthStore((state) => state.user?.token);

  // 2. Connect to Zustand Favorites Store
  const { favorites, toggleLocalFavorite } = useFavoriteStore();
  
  // 3. THIS IS THE KEY FIX: Derive isLiked directly from the store
  const isLiked = !!favorites[listing?.id];

  const displayTitle = getApartmentTitle(listing, locale);

  // 4. Mutation with Auth Headers
  const { mutate: toggleFavorite } = useMutation({
    mutationFn: async (id: string) => {
      return axios.post(
        `https://localhost:7075/Apartment/toggle-favorite/${id}`,
        {}, 
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
    },
    onMutate: () => {
      // Optimistic Update: Change UI immediately in the store
      toggleLocalFavorite(listing.id);
    },
    onError: (err) => {
      // Revert store state if server fails
      toggleLocalFavorite(listing.id);
      console.error("Failed to save favorite:", err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    }
  });

  if (!listing) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Safety check: Don't allow guest users to trigger mutation
    if (!token) {
        alert("Please log in to save favorites");
        return;
    }

    toggleFavorite(listing.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => router.back()}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {displayTitle}
          </DialogTitle>
          <DialogDescription>
            Detailed specifications for this property listing.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-96 mb-6 overflow-hidden rounded-lg bg-muted">
          <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={listing.images[currentImageIndex]?.url || "/placeholder-property.jpg"}
                    alt="Background Blur"
                    fill
                    className="object-cover blur-[90px] opacity-50 scale-110"
                    priority
                  />
                </div>

                <div className="relative z-10 h-full w-full">
                  <Image
                    src={listing.images[currentImageIndex]?.url || "/placeholder-property.jpg"}
                    alt={`Property view ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 800px"
                    priority
                  />
                </div>
              </motion.div>
            </AnimatePresence>

          {listing.images.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
              onClick={handleFavoriteClick}
            >
              {/* Icon color now changes based on the derived isLiked value */}
              <Heart className={`h-5 w-5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* ... Rest of your component (Price, Specs, Description) ... */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-primary">
                ${listing.price.toLocaleString()}
              </h2>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{displayTitle}</span>
              </div>
            </div>
            {/* ... specifications grid ... */}
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
              <div className="text-center">
                <Bed className="mx-auto mb-2 h-6 w-6 text-primary" />
                <div className="text-sm font-medium">{listing.specifications.bedrooms} Beds</div>
              </div>
              <div className="text-center">
                <Bath className="mx-auto mb-2 h-6 w-6 text-primary" />
                <div className="text-sm font-medium">{listing.specifications.bathrooms} Baths</div>
              </div>
              <div className="text-center">
                <Square className="mx-auto mb-2 h-6 w-6 text-primary" />
                <div className="text-sm font-medium">{listing.specifications.area} m²</div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {listing.description.en || listing.description.ka}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}