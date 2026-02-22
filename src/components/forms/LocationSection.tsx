// components/forms/LocationSection.tsx
import React, { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { MapPicker } from "@/components/map/MapPicker";
import { useLocationData } from "@/hooks/useLocationData";

export const LocationSection = React.memo(({ locale }: { locale: string }) => {
  // 1. Hook into the main form
  const { control, watch, setValue } = useFormContext();
  
  // 2. Local UI state (stays here, doesn't lag the page)
  const [cityOpen, setCityOpen] = useState(false);
  const [streetOpen, setStreetOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [streetQuery, setStreetQuery] = useState("");

  // 3. Watch values needed for logic
  const selectedLocId = watch("address.locationId");
  const selectedStrId = watch("address.streetId");
  const coords = watch("address.coords");

  // 4. Your existing logic
  const { ALL_LOCATIONS, filteredCities, currentCity } = useLocationData(locale, selectedLocId, cityQuery);

  const groupedStreets = useMemo(() => 
    (currentCity?.cities?.flatMap((d: any) => d.cities) || []) as any[], 
    [currentCity]
  );

  const filteredGroups = useMemo(() => {
    const q = streetQuery.toLowerCase().trim();
    return groupedStreets.map(g => ({
      ...g, 
      cities: g.cities.filter((s: any) => !q || s.title.toLowerCase().includes(q))
    })).filter(g => g.cities.length > 0).slice(0, 30);
  }, [streetQuery, groupedStreets]);

  return (
    <div className="space-y-4">
      {/* CITY FIELD */}
      <FormField control={control} name="address.locationId" render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>City / Municipality</FormLabel>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between w-full font-normal">
                {field.value ? ALL_LOCATIONS.find(l => l.id === field.value)?.title : "Select City"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search cities..." value={cityQuery} onValueChange={setCityQuery} />
                <CommandList>
                  {filteredCities.slice(0, 29).map(l => (
                    <CommandItem key={l.id} onSelect={() => {
                      field.onChange(l.id);
                      setValue("address.streetId", null); // Reset street
                      setCityOpen(false);
                    }}>
                      <Check className={cn("mr-2 h-4 w-4", field.value === l.id ? "opacity-100" : "opacity-0")} /> {l.title}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )} />

      {/* STREET FIELD */}
      {currentCity?.type === 0 && (
        <FormField control={control} name="address.streetId" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Street / Area</FormLabel>
            <Popover open={streetOpen} onOpenChange={setStreetOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between w-full font-normal">
                  {groupedStreets.flatMap(g => g.cities).find(s => s.id === field.value)?.title || "Select Street"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search streets..." value={streetQuery} onValueChange={setStreetQuery} />
                  <CommandList>
                    {filteredGroups.map((g: any) => (
                      <CommandGroup key={g.id} heading={g.title}>
                        {g.cities.map((s: any) => (
                          <CommandItem key={s.id} onSelect={() => { 
                            field.onChange(s.id); 
                            setStreetOpen(false); 
                          }}>
                            {s.title}
                          </CommandItem>
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

      {/* MAP FIELD */}
      {(currentCity && (currentCity.type !== 0 || selectedStrId)) && (
        <FormField control={control} name="address.coords" render={({ field }) => (
          <FormItem className="pt-2">
            <FormLabel>Building Location</FormLabel>
            <FormControl>
              <MapPicker value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      )}
    </div>
  );
});