import React, { useState, useMemo, useCallback, useDeferredValue, useTransition } from "react";
import { useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { MapPicker } from "@/components/map/MapPicker";
import { useLocationData } from "@/hooks/useLocationData";
import { useCurrentLocationStore } from "@/store/useCurrentLocationStore";

// Static sub-component to prevent rendering lag
const LocationItem = React.memo(({ item, isSelected, onSelect }: any) => (
  <CommandItem onSelect={() => onSelect(item)} value={item.t} className="cursor-pointer">
    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
    {item.t}
  </CommandItem>
));

export const LocationSection = React.memo(({ locale }: { locale: string }) => {
  const { control, watch, setValue } = useFormContext();
  const [cityOpen, setCityOpen] = useState(false);
  const [streetOpen, setStreetOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [streetQuery, setStreetQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const setCurrentLocation = useCurrentLocationStore((state) => state.setCurrentLocation);
  const selectedLocId = watch("address.locationId");
  const selectedStrId = watch("address.streetId");

  const { ALL_LOCATIONS, filteredCities, currentCity } = useLocationData(locale, selectedLocId, cityQuery);
  const deferredCity = useDeferredValue(currentCity);

  const handleCitySelect = useCallback((city: any) => {
    setCityOpen(false); // Immediate UI response
    setCityQuery("");
    startTransition(() => {
      setValue("address.locationId", city.i);
      setValue("address.streetId", null);
      const { c, ...light } = city;
      setCurrentLocation(light);
    });
  }, [setValue, setCurrentLocation]);

  const handleStreetSelect = useCallback((item: any) => {
    setStreetOpen(false);
    setValue("address.streetId", item.i);
    const { c, ...light } = item;
    setCurrentLocation(light);
  }, [setValue, setCurrentLocation]);

  const secondLevelData = useMemo(() => {
    if (!deferredCity?.c) return [];
    // Fast transformation
    const hasDeep = deferredCity.c.some((child: any) => child.c);
    if (hasDeep) {
      const flat: any[] = [];
      for (const d of deferredCity.c) {
        if (d.c) for (const s of d.c) flat.push({ i: s.i, t: `${d.t} - ${s.t}`, streets: s.c || [] });
      }
      return flat;
    }
    return [{ i: deferredCity.i, t: deferredCity.t, streets: deferredCity.c }];
  }, [deferredCity]);

  const filteredGroups = useMemo(() => {
    const q = streetQuery.toLowerCase().trim();
    const results = [];
    for (const g of secondLevelData) {
      const match = q ? g.streets.filter((s: any) => s.t.toLowerCase().includes(q)) : g.streets;
      if (match.length > 0) results.push({ ...g, streets: match });
      if (results.length > 15) break; 
    }
    return results;
  }, [streetQuery, secondLevelData]);

  return (
    <div className={cn("space-y-4 transition-opacity", isPending && "opacity-50 pointer-events-none")}>
      <FormField control={control} name="address.locationId" render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Location</FormLabel>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-normal">
                {currentCity?.t || "Select Location"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search..." value={cityQuery} onValueChange={setCityQuery} />
                <CommandList>
                  {filteredCities.map(city => (
                    <LocationItem 
                      key={city.i} 
                      item={city} 
                      isSelected={field.value === city.i} 
                      onSelect={handleCitySelect} 
                    />
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )} />

      {currentCity?.c && currentCity.c.length > 0 && (
        <FormField control={control} name="address.streetId" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Street / Area</FormLabel>
            <Popover open={streetOpen} onOpenChange={setStreetOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  <span className="truncate">
                    {secondLevelData.flatMap(g => g.streets).find(s => s.i === field.value)?.t || "Select Street"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search..." value={streetQuery} onValueChange={setStreetQuery} />
                  <CommandList>
                    {filteredGroups.map(g => (
                      <CommandGroup key={g.i} heading={g.t}>
                        {g.streets.map((s: any) => (
                          <LocationItem 
                            key={s.i} 
                            item={s} 
                            isSelected={field.value === s.i} 
                            onSelect={handleStreetSelect} 
                          />
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />
      )}
      
      {/* Map display logic remains same as previous */}
    </div>
  );
});