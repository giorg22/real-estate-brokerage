"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl"; 
import { motion } from "framer-motion";
import { Heart, Share2, MapPin, Bed, Bath, Square, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/types/Apartment";
import { getApartmentTitle } from "@/utils/listing-helpers"; 
import { Link } from "@/i18n/routing";

interface ListingCardProps {
  listing: Apartment;
}

export function ListingCard2({ listing }: ListingCardProps) {
  const locale = useLocale();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // 1. Generate the dynamic title based on specifications and locale
  const displayTitle = getApartmentTitle(listing, locale);

  // 2. Fallback for images
  const images = listing.images || [];
  const currentImageUrl = images[currentImageIndex]?.url || "/placeholder-property.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group"
    >
      {/* Image Container wrapped in Link for UX */}
      <Link href={`/apartments/${listing.id}`} scroll={false} className="relative block h-64 overflow-hidden">
        <Image
          src={currentImageUrl}
          alt={displayTitle}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Navigation Dots - Still need stopPropagation to prevent Link click */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50 hover:bg-white/75"
                }`}
                onClick={(e) => {
                  e.preventDefault(); // Prevent navigating to the page
                  e.stopPropagation(); // Prevent Link click
                  setCurrentImageIndex(index);
                }}
              />
            ))}
          </div>
        )}

        {listing.isFeatured && (
          <div className="absolute top-4 left-4 bg-primary text-white px-2 py-1 text-sm font-medium rounded shadow-sm z-10">
            Featured
          </div>
        )}

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full bg-white/90 text-secondary hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{displayTitle}</h3>
          <p className="text-lg font-bold text-primary">
            ${listing.price.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs truncate">
            {listing.address.street}, {listing.address.city}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          <div className="flex flex-col items-center border-r border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
              <Bed className="w-4 h-4" />
              <span className="text-sm font-semibold">{listing.specifications.bedrooms || 0}</span>
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-medium">Beds</span>
          </div>
          
          <div className="flex flex-col items-center border-r border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
              <Bath className="w-4 h-4" />
              <span className="text-sm font-semibold">{listing.specifications.bathrooms || 0}</span>
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-medium">Baths</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
              <Square className="w-4 h-4" />
              <span className="text-sm font-semibold">{listing.specifications.area}</span>
            </div>
            <span className="text-[10px] text-gray-500 uppercase font-medium">m²</span>
          </div>
        </div>

        <Link href={`/apartments/${listing.id}`} scroll={false}>          
          <Button className="w-full flex items-center justify-center gap-2">
            View Details
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}