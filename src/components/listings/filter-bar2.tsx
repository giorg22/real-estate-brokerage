"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, Home, DollarSign, Calendar } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filters } from "@/store/useListingStore";

const cities = ["Downtown", "Midtown", "Uptown", "West End"];

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
}

export function FilterBar2({ filters, onFiltersChange }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-md border-b">
      <div className="container mx-auto px-4 py-4">
        {/* Top Search Row */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search listings..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"} 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
        </div>

        {/* Expandable Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6 mt-4 border-t">
                {/* City Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> City</label>
                  <Select value={filters.city} onValueChange={(val) => onFiltersChange({ city: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type (Enum mapping) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Home className="w-4 h-4"/> Type</label>
                  <Select 
                    value={filters.type?.toString() || "all"} 
                    onValueChange={(val) => onFiltersChange({ type: val === "all" ? undefined : parseInt(val) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="0">Apartment</SelectItem>
                      <SelectItem value="1">Condo</SelectItem>
                      <SelectItem value="2">Townhouse</SelectItem>
                      <SelectItem value="3">Villa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><DollarSign className="w-4 h-4"/> Price Range</label>
                  <div className="pt-2 px-2">
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-5"
                      value={[filters.minPrice, filters.maxPrice]}
                      max={2000000}
                      step={10000}
                      onValueChange={(vals) => onFiltersChange({ minPrice: vals[0], maxPrice: vals[1] })}
                    >
                      <Slider.Track className="bg-secondary relative grow rounded-full h-1">
                        <Slider.Range className="absolute bg-primary rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-4 h-4 bg-white border border-primary shadow rounded-full focus:outline-none" />
                      <Slider.Thumb className="block w-4 h-4 bg-white border border-primary shadow rounded-full focus:outline-none" />
                    </Slider.Root>
                    <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                      <span>${filters.minPrice.toLocaleString()}</span>
                      <span>${filters.maxPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Sorting */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4"/> Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(val) => onFiltersChange({ sortBy: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}