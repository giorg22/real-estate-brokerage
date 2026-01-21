"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import locationData from "@/data/locations.json";

// --- TYPES ---
interface Street {
  streetId: number;
  streetTitle: string;
}

interface SubDistrict {
  subDistrictId: number;
  subDistrictTitle: string;
  streets: Street[];
}

interface LocationItem {
  id: number;
  title: string;
  type: "city" | "municipality";
  group: string;
  isSuburb: boolean; // Added to track suburb status
  districts?: any[]; 
}

// --- CONFIG ---
const PINNED_CITY_IDs = [95, 96, 97, 2, 3, 100];

// --- 1. DATA PREP ---
const ALL_LOCATIONS: LocationItem[] = [
  ...locationData.locations.visibleCities.map((c: any) => ({
    id: c.cityId, title: c.cityTitle, type: "city" as const, group: "Main Cities", isSuburb: false, districts: c.districts,
  })),
  ...locationData.locations.suburb.flatMap((m: any) =>
    m.cities.map((c: any) => ({ 
        id: c.id, title: c.title, type: "municipality" as const, group: m.municipalityTitle, isSuburb: true 
    }))
  ),
  ...locationData.locations.municipality.flatMap((m: any) =>
    m.cities.map((c: any) => ({ 
        id: c.id, title: c.title, type: "municipality" as const, group: m.municipalityTitle, isSuburb: false 
    }))
  ),
];

export default function AddApartmentPage() {
  const [cityOpen, setCityOpen] = useState(false);
  const [streetOpen, setStreetOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [streetQuery, setStreetQuery] = useState("");

  const form = useForm({
    defaultValues: { 
      address: { 
        locationId: null as number | null, 
        locationType: "city", 
        streetId: null as number | null 
      } 
    },
  });

  const selectedLocId = form.watch("address.locationId");

  // --- 2. CITY LOGIC: Pinned -> Suburbs -> Rest ---
  const filteredCities = useMemo(() => {
    const q = cityQuery.toLowerCase().trim();
    let base = q ? ALL_LOCATIONS.filter(l => l.title.toLowerCase().includes(q)) : ALL_LOCATIONS;

    return [...base].sort((a, b) => {
      // 1. Check Pinned IDs
      const aPinned = PINNED_CITY_IDs.indexOf(a.id);
      const bPinned = PINNED_CITY_IDs.indexOf(b.id);
      if (aPinned !== -1 && bPinned !== -1) return aPinned - bPinned;
      if (aPinned !== -1) return -1;
      if (bPinned !== -1) return 1;

      // 2. Check Suburbs
      if (a.isSuburb && !b.isSuburb) return -1;
      if (!a.isSuburb && b.isSuburb) return 1;

      // 3. Original Order
      return 0;
    });
  }, [cityQuery]);

  // --- 3. STREET LOGIC ---
  const currentCity = useMemo(() => ALL_LOCATIONS.find((l) => l.id === selectedLocId), [selectedLocId]);

  const groupedStreets = useMemo(() => {
    if (!currentCity?.districts) return [];
    return currentCity.districts.flatMap((d: any) => d.subDistricts) as SubDistrict[];
  }, [currentCity]);

  const filteredGroups = useMemo(() => {
    const q = streetQuery.toLowerCase().trim();

    return groupedStreets
      .map(group => ({
        ...group,
        streets: group.streets.filter(s => !q || s.streetTitle.toLowerCase().includes(q))
      }))
      .filter(group => group.streets.length > 0)
      .slice(0, 30);
  }, [streetQuery, groupedStreets]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Form {...form}>
        <form className="space-y-6">
          <Card>
            <CardHeader><CardTitle><MapPin className="inline mr-2 h-5 w-5" /> Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              
              {/* CITY SELECTION */}
              <FormField name="address.locationId" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>City / Municipality</FormLabel>
                  <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full justify-between font-normal text-left">
                          {field.value ? ALL_LOCATIONS.find((l) => l.id === field.value)?.title : "Select City"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput placeholder="Search..." value={cityQuery} onValueChange={setCityQuery} />
                        <CommandList className="max-h-[300px]">
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {filteredCities.slice(0, 100).map((l) => (
                              <CommandItem key={`${l.id}-${l.type}`} onSelect={() => {
                                field.onChange(l.id);
                                form.setValue("address.locationType", l.type);
                                form.setValue("address.streetId", null);
                                setCityOpen(false);
                                setCityQuery("");
                              }}>
                                <Check className={cn("mr-2 h-4 w-4", field.value === l.id ? "opacity-100" : "opacity-0")} />
                                <div>
                                  <div className="font-medium text-sm">
                                    {l.title} {l.isSuburb && <span className="ml-2 text-[10px] bg-secondary px-1 rounded text-muted-foreground italic">Suburb</span>}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground uppercase">{l.group}</div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )} />

              {/* STREET SELECTION */}
              {groupedStreets.length > 0 && (
                <FormField name="address.streetId" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Street</FormLabel>
                    <Popover open={streetOpen} onOpenChange={setStreetOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full justify-between font-normal text-left">
                            {field.value 
                              ? groupedStreets.flatMap(g => g.streets).find(s => s.streetId === field.value)?.streetTitle 
                              : "Search Street..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command shouldFilter={false}>
                          <CommandInput placeholder="Search..." value={streetQuery} onValueChange={setStreetQuery} />
                          <CommandList className="max-h-[400px]">
                            <CommandEmpty>No street found.</CommandEmpty>
                            {filteredGroups.map((group) => (
                              <CommandGroup key={group.subDistrictId} heading={group.subDistrictTitle}>
                                {group.streets.slice(0, 40).map((s) => (
                                  <CommandItem key={s.streetId} onSelect={() => {
                                    field.onChange(s.streetId);
                                    setStreetOpen(false);
                                    setStreetQuery("");
                                  }}>
                                    <Check className={cn("mr-2 h-4 w-4", field.value === s.streetId ? "opacity-100" : "opacity-0")} />
                                    <span className="text-sm">{s.streetTitle}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )} />
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}