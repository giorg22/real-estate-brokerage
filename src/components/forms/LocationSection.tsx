import React, { useState, useMemo, useCallback, useDeferredValue } from "react";
import { useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { MapPicker } from "@/components/map/MapPicker";
import { useLocationData } from "@/hooks/useLocationData";
import { useCurrentLocationStore } from "@/store/useCurrentLocationStore";

// Atomic Row: No Radix/Command overhead
const LocationRow = React.memo(({ item, isSelected, onClick }: any) => {
  const hasParent = item.t.includes(" - ");
  const [metadata, child] = hasParent ? item.t.split(" - ") : [null, item.t];

  return (
    <div
      onClick={() => onClick(item)}
      className={cn(
        "flex items-center px-3 py-2 cursor-pointer transition-colors hover:bg-slate-100 active:bg-slate-200",
        isSelected && "bg-slate-50 border-l-2 border-primary"
      )}
    >
      <Check className={cn("mr-2 h-4 w-4 shrink-0 text-primary", isSelected ? "opacity-100" : "opacity-0")} />
      <div className="flex flex-col leading-tight overflow-hidden">
        <span className="text-sm truncate text-slate-900">{child}</span>
        {metadata && (
          <span className="text-[10px] text-muted-foreground uppercase truncate tracking-tight">
            {metadata}
          </span>
        )}
      </div>
    </div>
  );
});

export const LocationSection = React.memo(({ locale }: { locale: string }) => {
  const { control, watch, setValue } = useFormContext();
  const [cityOpen, setCityOpen] = useState(false);
  const [streetOpen, setStreetOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [streetQuery, setStreetQuery] = useState("");

  const setCurrentLocation = useCurrentLocationStore((state) => state.setCurrentLocation);
  const selectedLocId = watch("address.locationId");
  const selectedStrId = watch("address.streetId");

  const { filteredCities, currentCity } = useLocationData(locale, selectedLocId, cityQuery);
  
  // Defer heavy calculations to keep the UI snappy
  const deferredCity = useDeferredValue(currentCity);

  const onSelect = useCallback((item: any, type: 'city' | 'street') => {
    if (type === 'city') {
      setValue("address.locationId", item.i, { shouldValidate: false });
      setValue("address.streetId", null, { shouldValidate: false });
      setCityOpen(false);
      setCityQuery("");
    } else {
      setValue("address.streetId", item.i, { shouldValidate: false });
      setStreetOpen(false);
    }
    const { c, ...light } = item;
    setCurrentLocation(light);
  }, [setValue, setCurrentLocation]);

  // Transform streets for display with Subdistrict titles
  const filteredStreets = useMemo(() => {
    if (!deferredCity?.c) return [];
    const q = streetQuery.toLowerCase().trim();
    const res = [];
    
    const children = deferredCity.c;
    // Check if we are dealing with a nested city (like Tbilisi) or a flat list
    const hasDeepHierarchy = children.some((child: any) => child.c && child.c.length > 0);

    if (hasDeepHierarchy) {
      // 3-Level traversal: District -> Subdistrict -> Street
      for (const district of children) {
        if (!district.c) continue;
        for (const subdistrict of district.c) {
          if (!subdistrict.c) continue;
          for (const street of subdistrict.c) {
            // Combine parent info for the Row label: "District, Subdistrict - Street"
            const displayLabel = `${district.t}, ${subdistrict.t} - ${street.t}`;
            
            if (!q || displayLabel.toLowerCase().includes(q)) {
              res.push({ 
                ...street, 
                t: displayLabel // Row component will split this by " - "
              });
            }
            if (res.length > 40) break;
          }
          if (res.length > 40) break;
        }
        if (res.length > 40) break;
      }
    } else {
      // 2-Level traversal: City -> Street (Standard villages/small towns)
      for (const street of children) {
        if (!q || street.t.toLowerCase().includes(q)) res.push(street);
        if (res.length > 40) break;
      }
    }
    return res;
  }, [streetQuery, deferredCity]);

  // Simple lookup for the selected street button label
  const streetDisplayLabel = useMemo(() => {
    if (!selectedStrId) return "Select Street";
    const found = filteredStreets.find(s => s.i === selectedStrId);
    if (!found) return "Select Street";
    return found.t.includes(" - ") ? found.t.split(" - ")[1] : found.t;
  }, [selectedStrId, filteredStreets]);

  return (
    <div className="space-y-4">
      {/* 1st Dropdown: Location */}
      <FormField control={control} name="address.locationId" render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Location</FormLabel>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-normal h-11">
                <span className="truncate">{currentCity?.t || "Select City or Village"}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
              <div className="flex items-center border-b px-3 bg-white sticky top-0">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input 
                  className="h-11 w-full bg-transparent outline-none text-sm" 
                  placeholder="Search..." 
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto py-1 custom-scrollbar">
                {filteredCities.map(c => (
                  <LocationRow 
                    key={c.i} 
                    item={c} 
                    isSelected={field.value === c.i} 
                    onClick={(i: any) => onSelect(i, 'city')} 
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )} />

      {/* 2nd Dropdown: Street */}
      {currentCity?.c && currentCity.c.length > 0 && (
        <FormField control={control} name="address.streetId" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Street / Area</FormLabel>
            <Popover open={streetOpen} onOpenChange={setStreetOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal h-11">
                  <span className="truncate">{streetDisplayLabel}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                <div className="flex items-center border-b px-3 bg-white sticky top-0">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <input 
                    className="h-11 w-full bg-transparent outline-none text-sm" 
                    placeholder="Search street..." 
                    value={streetQuery}
                    onChange={(e) => setStreetQuery(e.target.value)}
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto py-1 custom-scrollbar">
                  {filteredStreets.map(s => (
                    <LocationRow 
                      key={s.i} 
                      item={s} 
                      isSelected={field.value === s.i} 
                      onClick={(i: any) => onSelect(i, 'street')} 
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />
      )}

      {/* Map Picker */}
      {(currentCity && (currentCity.v !== 0 || selectedStrId)) && (
        <FormField control={control} name="address.coords" render={({ field }) => (
          <FormItem className="pt-2">
            <FormLabel>Exact Location</FormLabel>
            <FormControl>
              <MapPicker value={field.value} onChange={(v) => setValue("address.coords", v)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      )}
    </div>
  );
});