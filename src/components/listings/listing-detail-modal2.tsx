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
  Calendar,
  Share2,
  Heart,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ListingDetailModalProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    priceFormatted: string; // From your JSON
    type: string;
    address: { // Nested object from your JSON
      city: string;
      state: string;
      fullAddress: string;
    };
    images: Array<{ // Array of objects, not strings
      url: string;
      isPrimary: boolean;
    }>;
    // Note: Adjusting these to optional as they were null in your JSON
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    yearBuilt?: number;
    amenities: string[];
    broker?: {
      name: string;
      image: string;
      phone: string;
      email: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  similarListings: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
  }>;
}

export function ListingDetailModal2({
  listing,
  isOpen,
  onClose,
  similarListings,
}: ListingDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  if (!listing) return null;

  // Accessing the URL property from your image objects
  const images = listing.images || [];
  const currentImage = images[currentImageIndex]?.url;
  console.log("Current Image URL:", images);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{listing.title}</DialogTitle>
        </DialogHeader>

        {/* Image Gallery */}
        <div className="relative h-96 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {currentImage && (
                <Image
                  src={currentImage}
                  alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows - Only show if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          Thumbnail Dots
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              {/* Using formatted price from your backend */}
              <h2 className="text-3xl font-bold mb-2">{listing.priceFormatted}</h2>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {/* Accessing nested address object */}
                <span>{listing.address.fullAddress}</span>
              </div>
            </div>

            {/* Property Details - Added null checks (??) */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <DetailItem icon={<Bed />} text={`${listing.bedrooms ?? 0} Beds`} />
              <DetailItem icon={<Bath />} text={`${listing.bathrooms ?? 0} Baths`} />
              <DetailItem icon={<Square />} text={`${listing.squareFeet ?? 0} sq ft`} />
              <DetailItem icon={<Calendar />} text={`Built ${listing.yearBuilt ?? "N/A"}`} />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Using amenities from your JSON */}
            {listing.amenities?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {listing.amenities.map((item, index) => (
                    <li key={index} className="flex items-center text-gray-600 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-semibold mb-4">Contact Agent</h4>
              {listing.broker ? (
                 <div className="flex items-center gap-4 mb-4">
                    <Image src={listing.broker.image} alt="Agent" width={48} height={48} className="rounded-full" />
                    <p className="font-medium">{listing.broker.name}</p>
                 </div>
              ) : <p className="text-sm text-muted-foreground mb-4">Listing Managed by Owner</p>}
              
              <div className="space-y-2">
                <Button className="w-full"><Phone className="w-4 h-4 mr-2" /> Call</Button>
                <Button variant="outline" className="w-full"><Mail className="w-4 h-4 mr-2" /> Message</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center">
      <div className="w-6 h-6 mx-auto mb-2 text-primary">{icon}</div>
      <div className="text-xs font-medium">{text}</div>
    </div>
  );
}