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

export function ListingDetailModal2({ listing, isOpen }: { listing: Apartment; isOpen: boolean }) {
  const locale = useLocale();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const router = useRouter();

  const displayTitle = getApartmentTitle(listing, locale);

  if (!listing) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => router.back()}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {displayTitle}
          </DialogTitle>
          {/* Added Description for accessibility warnings */}
          <DialogDescription>
            Detailed specifications for this property listing.
          </DialogDescription>
        </DialogHeader>

        {/* Image Gallery */}
        <div className="relative h-96 mb-6 overflow-hidden rounded-lg bg-muted">
          <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {/* 1. The Blurred Background Layer */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={listing.images[currentImageIndex]?.url || "/placeholder-property.jpg"}
                    alt="Background Blur"
                    fill
                    className="object-cover blur-[90px] opacity-50 scale-110" // scale prevents white edges during blur
                    priority
                  />
                </div>

                {/* 2. The Main Sharp Foreground Layer */}
                <div className="relative z-10 h-full w-full">
                  <Image
                    src={listing.images[currentImageIndex]?.url || "/placeholder-property.jpg"}
                    alt={`Property view ${currentImageIndex + 1}`}
                    fill
                    className="object-contain" // Shows the full image without cropping
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
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-primary">
                ${listing.price.toLocaleString()}
              </h2>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{listing.address.city}, {listing.address.street}</span>
              </div>
            </div>

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
          
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
               <h4 className="font-semibold mb-4">Interested in this property?</h4>
               <Button className="w-full mb-2">Request Details</Button>
               <Button variant="outline" className="w-full">Schedule a Tour</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}