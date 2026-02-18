"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Check, ChevronsUpDown, MapPin, FileText,
  Camera, Loader2, X, Home, GripVertical,
  Building2, Warehouse, Leaf, Store, BedSingle,
  Tag, Calendar, CalendarClock, FileBadge, FileKey2, PlusSquare, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { apartmentSchema } from "@/lib/validations";
import { MapPicker } from "@/components/map/MapPicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// DnD Kit
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  TouchSensor, useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortablePhoto, ImageItem } from "@/components/forms/ImageUploader";

// Hooks & UI
import { useUploadImage } from "@/hooks/useCloudinary";
import { useCreateApartment } from "@/hooks/useApartments";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useApartmentForm } from "@/hooks/useApartmentForm";

import locationDataKa from "@/data/location.ka.json";
import locationDataEn from "@/data/location.en.json";
import statusData from "@/data/status.json";

import { zodResolver } from "@hookform/resolvers/zod";
import { propertyTypes, dealTypes } from "@/lib/property-config";
import { LocationItem } from "@/types/LocationItem";

import PricingCard from "@/components/forms/PricingCard";
import { useLocale } from "next-intl";




export default function AddApartmentPage() {
  const [previews, setPreviews] = useState<ImageItem[]>([]);
  const [cityOpen, setCityOpen] = useState(false);
  const [streetOpen, setStreetOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [streetQuery, setStreetQuery] = useState("");
  const [mapFlyCoords, setMapFlyCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

  const uploadMutation = useUploadImage();
  const createMutation = useCreateApartment();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const form = useApartmentForm();

  const selectedLocId = form.watch("address.locationId");
  const selectedStrId = form.watch("address.streetId");
  const type = form.watch("type");
  const listingType = form.watch("listingType");
  const rooms = form.watch("rooms");

  const locale = useLocale();

  const generateDynamicTitle = (values: any) => {
    const { rooms, type, listingType, address } = values;

    // 1. Logic for "Studio" vs "X Room"
    const roomCount = Number(rooms);
    const roomText = roomCount === 0 ? "Studio" : `${roomCount} room`;

    // 2. Get Label from your propertyTypes JSON
    const typeLabel = propertyTypes.find(p => p.id === Number(type))?.label || "";

    // 3. Get Deal Name (For sale / For rent) from your dealTypes JSON
    const dealLabel = dealTypes.find(d => d.id === Number(listingType))?.name.toLowerCase() || "";

    // 4. Get Location Name (from your street search logic)
    const streetName = groupedStreets
      .flatMap(g => g.streets)
      .find(s => s.streetId === address?.streetId)?.streetTitle || "";

    // Construct the result
    return `${roomText} ${typeLabel} ${dealLabel} in ${streetName}`.trim();
  };

  useEffect(() => {
    const uploadedImages = previews
      .filter((p) => !p.isUploading && p.url)
      .map((p) => ({
        url: p.url!,
        publicId: p.publicId!,
      }
      ));

    // Update the hidden form field
    form.setValue("images", uploadedImages, {
      shouldValidate: form.formState.isSubmitted // Only show red error if they already tried to submit
    });
  }, [previews, form]);

  useEffect(() => {
    form.setValue("address.streetId", null);

    setMapFlyCoords(undefined);
  }, [selectedLocId, form]);


  
  const locationData = useMemo(
  () => (locale === "ka" ? locationDataKa : locationDataEn),
  [locale]
  );

  const ALL_LOCATIONS: LocationItem[] = useMemo(() => [
    ...locationData.locations.visibleCities.map((c: any) => ({ id: c.cityId, title: c.cityTitle, type: "city" as const, group: "Main Cities", isSuburb: false, districts: c.districts  })),
    ...locationData.locations.suburb.flatMap((m: any) => m.cities.map((c: any) => ({ id: c.id, title: c.title, type: "municipality" as const, group: m.municipalityTitle, isSuburb: true }))),
    ...locationData.locations.municipality.flatMap((m: any) => m.cities.map((c: any) => ({ id: c.id, title: c.title, type: "municipality" as const, group: m.municipalityTitle, municipalityId: m.municipalityId, isSuburb: false })))
  ], []);

  const currentCity = useMemo(() => ALL_LOCATIONS.find((l) => l.id === selectedLocId), [selectedLocId, ALL_LOCATIONS]);
  const PINNED_CITY_IDs = [95, 96, 97, 98, 100, 99, 101];

  const filteredCities = useMemo(() => {
    const q = cityQuery.toLowerCase().trim();
    const base = q ? ALL_LOCATIONS.filter(l => l.title.toLowerCase().includes(q)) : ALL_LOCATIONS;
    return [...base].sort((a, b) => {
      const aP = PINNED_CITY_IDs.indexOf(a.id), bP = PINNED_CITY_IDs.indexOf(b.id);
      if (aP !== -1 || bP !== -1) return (aP === -1 ? 9999 : aP) - (bP === -1 ? 9999 : bP);
      return a.isSuburb ? -1 : 1;
    });
  }, [cityQuery, ALL_LOCATIONS]);

  const groupedStreets = useMemo(() => (currentCity?.districts?.flatMap((d: any) => d.subDistricts) || []) as any[], [currentCity]);

  const filteredGroups = useMemo(() => {
    const q = streetQuery.toLowerCase().trim();
    return groupedStreets.map(g => ({
      ...g,
      streets: g.streets.filter((s: any) => !q || s.streetTitle.toLowerCase().includes(q))
    })).filter(g => g.streets.length > 0).slice(0, 30);
  }, [streetQuery, groupedStreets]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      const localId = Math.random().toString(36).substring(7);
      setPreviews(prev => [...prev, { id: localId, file, isUploading: true }]);
      try {
        const result = await uploadMutation.mutateAsync(file);
        setPreviews(prev => prev.map(p => p.id === localId ? { ...p, isUploading: false, url: result.secure_url, publicId: result.public_id } : p));
      } catch (err) {
        setPreviews(prev => prev.filter(p => p.id !== localId));
        toast({ title: "Upload failed", variant: "destructive" });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPreviews((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };


  console.log(form.formState.errors);

  const onSubmit = async (values: any) => {
    try {
      if (previews.some(p => p.isUploading)) return;

      const streetTitle = groupedStreets
        .flatMap(g => g.streets)
        .find(s => s.streetId === values.address.streetId)?.streetTitle || "";

      var mainId = currentCity?.type == "city" ? values.address.streetId : values.address.locationId;
      let districtId: number | null = null;
      let subDistrictId: number | null = null;

      if (currentCity?.type === "city") {
        const district = currentCity.districts?.find((d: any) =>
          d.subDistricts.some((sd: any) =>
            sd.streets.some((st: any) => st.streetId === values.address.streetId)
          )
        );

        if (district) {
          districtId = district.districtId;

          const subDistrict = district.subDistricts.find((sd: any) =>
            sd.streets.some((st: any) => st.streetId === values.address.streetId)
          );

          if (subDistrict) {
            subDistrictId = subDistrict.subDistrictId;
          }
        }
      }


      const payload = {
        title: values.title,
        price: Number(values.price),
        type: Number(values.type),
        status: Number(values.status), // Listing Status (Draft/Published)

        address: {
          address1: ALL_LOCATIONS.find((l) => l.id === values.address.locationId)?.id,
          address2: districtId,
          address3: subDistrictId,
          address4:  mainId,
          city: currentCity?.id || "",
          state: currentCity?.group || "",
          country: "Georgia",
          zipCode: "",
          latitude: values.address.coords.lat,
          longitude: values.address.coords.lng
        },

        description: {
          en: values.description.en || "",
          ka: values.description.ka || "",
          ru: values.description.ru || ""
        },

        specifications: {
          // --- Core Numeric Fields ---
          listingType: Number(values.listingType),
          type: Number(values.type),
          area: Number(values.area),
          rooms: Number(values.rooms),
          bedrooms: Number(values.bedrooms),
          floor: Number(values.floor),
          totalFloors: Number(values.totalFloors),
          condition: Number(values.condition),
          status: Number(values.status), // Property Status (Renovated/Black Frame etc)

          // --- Optional Numeric/Area Fields ---
          yardArea: values.yardArea ? Number(values.yardArea) : null,
          kitchenArea: values.kitchenArea ? Number(values.kitchenArea) : null,
          bathrooms: values.bathrooms ? Number(values.bathrooms) : null,
          balconyCount: values.balconyCount ? Number(values.balconyCount) : null,
          balconyArea: values.balconyArea ? Number(values.balconyArea) : null,
          verandaArea: values.verandaArea ? Number(values.verandaArea) : null,
          loggiaArea: values.loggiaArea ? Number(values.loggiaArea) : null,
          waitingArea: values.waitingArea ? Number(values.waitingArea) : null,
          buildYear: values.buildYear ? Number(values.buildYear) : null,
          ceilingHeight: values.ceilingHeight ? Number(values.ceilingHeight) : null,
          livingRoomArea: values.livingRoomArea ? Number(values.livingRoomArea) : null,
          storageArea: values.storageArea ? Number(values.storageArea) : null,

          // --- Single Select / Toggle Integers ---
          period: values.period ? Number(values.period) : null,
          project: values.project ? Number(values.project) : null,
          leaseType: values.leaseType ? Number(values.leaseType) : null,
          typeofCRE: values.typeofCRE ? Number(values.typeofCRE) : null,
          parking: values.parking ? Number(values.parking) : null,
          heating: values.heating ? Number(values.heating) : null,
          hotWater: values.hotWater ? Number(values.hotWater) : null,
          buildingMaterial: values.buildingMaterial ? Number(values.buildingMaterial) : null,
          doorWindow: values.doorWindow ? Number(values.doorWindow) : null,

          // --- Bitwise Sums (Already numbers from our ToggleGroup logic) ---
          propertyCharacteristics: values.propertyCharacteristics || 0,
          furnitureAndAppliances: values.furnitureAndAppliances || 0,
          buldingParameters: values.buldingParameters || 0,
          badges: values.badges || 0,
        },

        images: previews.map((p, i) => ({
          url: p.url || "",
          publicId: p.publicId || "",
          displayOrder: i,
          isPrimary: i === 0
        }))
      };

      await createMutation.mutateAsync(payload);
      toast({ title: "Listing Created Successfully!" });

      // Optional: form.reset(); setPreviews([]);
    } catch (error) {
      console.error("Submission Error:", error);
      toast({ title: "Submission Error", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-foreground/90 tracking-tight">Add New Listing</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-primary/20 shadow-md">
            <CardContent className="space-y-10 pt-6">
              {/* SECTION 1: PROPERTY TYPE */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold tracking-tight">Select a property type</h3>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          /* Grid-cols-3 ensures all 6 items take up two even rows */
                          className="grid grid-cols-2 md:grid-cols-6 gap-4"
                          value={field.value?.toString()}
                          onValueChange={(val) => { if (val) field.onChange(parseInt(val)); }}
                        >
                          {propertyTypes.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className={cn(
                                "group flex flex-col items-start justify-between p-3 h-28 w-full border-2 rounded-xl transition-all text-left bg-slate-50/50",
                                "hover:bg-slate-100 border-transparent",
                                "data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50 data-[state=on]:text-slate-900"
                              )}
                            >
                              <item.icon className={cn("h-6 w-6 transition-colors", field.value === item.id ? "text-blue-600" : "text-slate-500")} />
                              <div className="flex-1 flex items-center w-full">
                                <span className="text-sm group-data-[state=on]:text-blue-600">{item.label}</span>
                              </div>
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SECTION 2: DEAL TYPE */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold tracking-tight">Select deal type</h3>
                <FormField
                  control={form.control}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          /* Grid-cols-4 ensures all 4 items take up one clean row on desktop */
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                          value={field.value?.toString()}
                          onValueChange={(val) => { if (val) field.onChange(parseInt(val)); }}
                        >
                          {dealTypes.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              /* Exact same h-32 and styling as above for perfect consistency */
                              className={cn(
                                "group flex flex-col items-start justify-between p-3 h-28 w-full border-2 rounded-xl transition-all text-left bg-slate-50/50",
                                "hover:bg-slate-100 border-transparent",
                                "data-[state=on]:border-blue-600 data-[state=on]:bg-white data-[state=on]:shadow-md"
                              )}
                            >
                              <item.icon className={cn("h-6 w-6 transition-colors", field.value === item.id ? "text-blue-600" : "text-slate-500")} />
                              <div className="flex-1 flex items-center w-full">
                                <span className="text-sm group-data-[state=on]:text-blue-600">{item.name}</span>
                              </div>
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            {[1].includes(listingType) && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Rent Period *</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="flex flex-wrap justify-start gap-2"
                          value={field.value?.toString()}
                          onValueChange={(val) => val && field.onChange(parseInt(val))}
                        >
                          {[1, 2, 3, 4, 5, 6, 9, 12, 15, 18].map((num) => (
                            <ToggleGroupItem
                              key={num}
                              value={num.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {num} months
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>)}
            {[2].includes(listingType) && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">How many people is it intended for?</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="flex flex-wrap justify-start gap-2"
                          value={field.value?.toString()}
                          onValueChange={(val) => val && field.onChange(parseInt(val))}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <ToggleGroupItem
                              key={num}
                              value={num.toString()}
                              className={cn(
                                "w-12 h-12 flex items-center justify-center border rounded-md transition-all text-sm font-medium",
                                "data-[state=on]:border-blue-900 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-900"
                              )}
                            >
                              {num === 10 ? "10+" : num}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>)}
            {[3].includes(listingType) && (
              <>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold">Lease Period</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            variant="outline"
                            className="flex flex-wrap justify-start gap-2"
                            value={field.value?.toString()}
                            onValueChange={(val) => val && field.onChange(parseInt(val))}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <ToggleGroupItem
                                key={num}
                                value={num.toString()}
                                className="data-[state=on]:border-blue-900 flex gap-2"
                              >
                                {num} Years
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="leaseType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold">Lease Type</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            variant="outline"
                            className="flex flex-wrap justify-start gap-2"
                            value={field.value?.toString()}
                            onValueChange={(val) => val && field.onChange(parseInt(val))}
                          >
                            <ToggleGroupItem
                              key={0}
                              value={"0"}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              Mortgagor's right of living
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              key={1}
                              value={"1"}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              Owner's right of living
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </>)}
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex gap-2 text-lg items-center"><Home className="h-5 w-5 text-primary" /> Specifications</CardTitle></CardHeader>
            {[4].includes(type) && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="typeofCRE"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Type of commercial real estate *</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={field.value?.toString()}
                          onValueChange={(val) => val && field.onChange(parseInt(val))}
                        >
                          {statusData.typeOfCRE.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>)}
            {![3].includes(type) && (
              <>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="rooms"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold">Total Rooms *</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            variant="outline"
                            className="flex flex-wrap justify-start gap-2"
                            value={field.value?.toString()}
                            onValueChange={(val) => val && field.onChange(parseInt(val))}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <ToggleGroupItem
                                key={num}
                                value={num.toString()}
                                className={cn(
                                  "w-12 h-12 flex items-center justify-center border rounded-md transition-all text-sm font-medium",
                                  "data-[state=on]:border-blue-900 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-900"
                                )}
                              >
                                {num === 10 ? "10+" : num}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                {rooms && (
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-semibold">Bedrooms *</FormLabel>
                          <FormControl>
                            <ToggleGroup
                              type="single"
                              variant="outline"
                              className="flex flex-wrap justify-start gap-2"
                              value={field.value?.toString()}
                              onValueChange={(val) => val && field.onChange(parseInt(val))}
                            >
                              {Array.from({ length: rooms }, (_, i) => i + 1).map((num) => (
                                <ToggleGroupItem
                                  key={num}
                                  value={num.toString()}
                                  className={cn(
                                    "w-12 h-12 flex items-center justify-center border rounded-md transition-all text-sm font-medium",
                                    "data-[state=on]:border-blue-900 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-900"
                                  )}
                                >
                                  {num === 10 ? "10+" : num}
                                </ToggleGroupItem>
                              ))}
                            </ToggleGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                )}
              </>
            )}
            {![3].includes(type) && (<>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="area" render={({ field }) => (
                  <FormItem><FormLabel>Area (m²) *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                {[1, 2].includes(type) && (
                  <FormField control={form.control} name="yardArea" render={({ field }) => (
                    <FormItem><FormLabel>Yard Area (m²)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />)}
              </CardContent>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[0, 4, 5].includes(type) && (
                  <FormField control={form.control} name="floor" render={({ field }) => (
                    <FormItem><FormLabel>Floor *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />)}
                <FormField control={form.control} name="totalFloors" render={({ field }) => (
                  <FormItem><FormLabel>Total floors *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent></>)}
            <CardContent>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold">Status *</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        className="flex flex-wrap justify-start items-start gap-2"
                        value={field.value?.toString()}
                        onValueChange={(val) => val && field.onChange(parseInt(val))}
                      >
                        {(type !== 3 ? statusData.status.slice(0, 3) : statusData.status.slice(3)).map((item) => (
                          <ToggleGroupItem
                            key={item.id}
                            value={item.id.toString()}
                            className="data-[state=on]:border-blue-900 flex gap-2"
                          >
                            {item.name}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            {![3].includes(type) && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Condition *</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={field.value?.toString()}
                          onValueChange={(val) => val && field.onChange(parseInt(val))}
                        >
                          {statusData.condition.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>)}
            {[0, 5].includes(type) && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Project</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={field.value?.toString()}
                          onValueChange={(val) => val && field.onChange(parseInt(val))}
                        >
                          {statusData.project.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>)}
          </Card>



          <Card className="relative overflow-hidden transition-all duration-100">
            <CardHeader>
              <CardTitle className="flex gap-2 text-lg items-center">
                <PlusSquare className="h-5 w-5 text-primary" />
                Additional Features
              </CardTitle>
            </CardHeader>

            {/* 1. THE HIDDEN CONTROLLER */}
            <input type="checkbox" id="reveal-toggle" className="peer hidden" />

            {/* 2. THE CONTENT AREA */}
            <div className="
    relative transition-all duration-700 ease-in-out
    max-h-[350px] peer-checked:max-h-[2000px] 
    overflow-hidden
    [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]
    peer-checked:[mask-image:none]
  ">
              <CardContent className="space-y-6">
                {/* Bathroom Group (Visible in "Half" mode) */}
                <FormField control={form.control} name="bathrooms" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Bathroom</FormLabel>
                    <ToggleGroup type="single" variant="outline" className="flex justify-start gap-2" value={field.value?.toString()} onValueChange={(val) => val && field.onChange(parseInt(val))}>
                      {["1", "2", "3+", "General"].map((opt) => (
                        <ToggleGroupItem key={opt} value={opt} className="px-4 py-2 border rounded-md data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50 data-[state=on]:text-slate-900">
                          {opt}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormItem>
                )} />

                {/* Grid of inputs (Visible in "Half" mode) */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="balconyCount" render={({ field }) => (
                    <FormItem><FormLabel>Balcony</FormLabel><Input placeholder="Total balconies" {...field} /></FormItem>
                  )} />
                  <FormField control={form.control} name="balconyArea" render={({ field }) => (
                    <FormItem><FormLabel>&nbsp;</FormLabel><div className="relative"><Input placeholder="Area" {...field} /><span className="absolute right-3 top-2 text-sm text-muted-foreground">m2</span></div></FormItem>
                  )} />
                </div>
                {/* --- CONTENT BELOW THIS LINE WILL BE FADED OUT INITIALLY --- */}

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="verandaArea" render={({ field }) => (
                    <FormItem><FormLabel>Veranda</FormLabel><div className="relative"><Input placeholder="Area" {...field} /><span className="absolute right-3 top-2 text-sm text-muted-foreground">m2</span></div></FormItem>
                  )} />
                  <FormField name="loggiaArea" render={({ field }) => (
                    <FormItem><FormLabel>Loggia</FormLabel><div className="relative"><Input placeholder="Area" {...field} /><span className="absolute right-3 top-2 text-sm text-muted-foreground">m2</span></div></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField name="livingRoomArea" render={({ field }) => (
                    <FormItem><FormLabel>Living Room</FormLabel><div className="relative"><Input placeholder="Area" {...field} /><span className="absolute right-3 top-2 text-sm text-muted-foreground">m2</span></div></FormItem>
                  )} />
                  <FormField name="storage" render={({ field }) => (
                    <FormItem><FormLabel>Storage</FormLabel><div className="relative"><Input placeholder="Area" {...field} /><span className="absolute right-3 top-2 text-sm text-muted-foreground">m2</span></div></FormItem>
                  )} />
                </div>

              </CardContent>
              <CardContent>
                <FormField
                  control={form.control}
                  name="parking"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Parking</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={field.value?.toString()}
                          onValueChange={(val) => val && field.onChange(parseInt(val))}
                        >
                          {statusData.parking.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardContent>
                <FormField
                  control={form.control}
                  name="heating"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Heating</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={field.value?.toString()}
                          onValueChange={(val) => val && field.onChange(parseInt(val))}
                        >
                          {statusData.heating.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardContent>
                <FormField
                  control={form.control}
                  name="hotWater"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Hot water</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={field.value?.toString()}
                          onValueChange={(val) => val && field.onChange(parseInt(val))}
                        >
                          {statusData.hotWater.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardContent>
                <FormField
                  control={form.control}
                  name="buildingMaterial"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Building material</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={field.value?.toString()}
                          onValueChange={(val) => val && field.onChange(parseInt(val))}
                        >
                          {statusData.buildingMaterial.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardContent>
                <FormField
                  control={form.control}
                  name="doorWindow"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Door Window</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={field.value?.toString()}
                          onValueChange={(val) => val && field.onChange(parseInt(val))}
                        >
                          {statusData.doorWindowMaterial.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardContent>
                <FormField
                  control={form.control}
                  name="propertyCharacteristics"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Property Characteristics</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={statusData.propertyCharacteristics
                            .filter(item => (Number(field.value) & item.id) !== 0)
                            .map(item => item.id.toString())}
                          onValueChange={(vals) => {
                            const sum = vals.reduce((acc, val) => acc + parseInt(val), 0);
                            field.onChange(sum);
                          }}
                        >
                          {statusData.propertyCharacteristics.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardContent>
                <FormField
                  control={form.control}
                  name="furnitureAndAppliances"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Furniture and appliances</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={statusData.furnitureAndAppliances
                            .filter(item => (Number(field.value) & item.id) !== 0)
                            .map(item => item.id.toString())}
                          onValueChange={(vals) => {
                            const sum = vals.reduce((acc, val) => acc + parseInt(val), 0);
                            field.onChange(sum);
                          }}
                        >
                          {statusData.furnitureAndAppliances.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardContent>
                <FormField
                  control={form.control}
                  name="buldingParameters"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Building parameters</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={statusData.buldingParameters
                            .filter(item => (Number(field.value) & item.id) !== 0)
                            .map(item => item.id.toString())}
                          onValueChange={(vals) => {
                            const sum = vals.reduce((acc, val) => acc + parseInt(val), 0);
                            field.onChange(sum);
                          }}
                        >
                          {statusData.buldingParameters.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardContent>
                <FormField
                  control={form.control}
                  name="badges"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Badges</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          variant="outline"
                          className="flex flex-wrap justify-start items-start gap-2"
                          value={statusData.badges
                            .filter(item => (Number(field.value) & item.id) !== 0)
                            .map(item => item.id.toString())}
                          onValueChange={(vals) => {
                            const sum = vals.reduce((acc, val) => acc + parseInt(val), 0);
                            field.onChange(sum);
                          }}
                        >
                          {statusData.badges.map((item) => (
                            <ToggleGroupItem
                              key={item.id}
                              value={item.id.toString()}
                              className="data-[state=on]:border-blue-900 flex gap-2"
                            >
                              {item.name}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </div>

            {/* 3. THE TOGGLE BUTTON (Floating at the bottom) */}
            <div className="flex justify-center pb-6 pt-2 bg-white relative z-10">
              <label
                htmlFor="reveal-toggle"
                className="cursor-pointer bg-[#2D3139] text-white px-8 py-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-900 transition-all select-none shadow-lg"
              >
                <Plus className="h-4 w-4 transition-transform duration-100 peer-checked:rotate-45" />
                <span className="peer-checked:hidden">Every parameter</span>
                <span className="hidden peer-checked:inline">Show less</span>
              </label>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 text-lg items-center">
                <FileText className="h-5 w-5 text-primary" /> Property Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ka" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="ka">Georgian (KA)</TabsTrigger>
                  <TabsTrigger value="en">English (EN)</TabsTrigger>
                  <TabsTrigger value="ru">Russian (RU)</TabsTrigger>
                </TabsList>

                {/* Georgian Input */}
                <TabsContent value="ka">
                  <FormField
                    control={form.control}
                    name="description.ka"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>აღწერა</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="აღწერეთ ქონება დეტალურად..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* English Input */}
                <TabsContent value="en">
                  <FormField
                    control={form.control}
                    name="description.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="Describe the property in English..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Russian Input */}
                <TabsContent value="ru">
                  <FormField
                    control={form.control}
                    name="description.ru"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание (Russian)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="Опишите недвижимость на русском..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex gap-2 text-lg items-center"><Camera className="h-5 w-5 text-primary" /> Media</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div
                className="group border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer hover:bg-muted/50 transition-all border-muted-foreground/20"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <input type="file" id="fileInput" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-primary/10 p-3 rounded-full group-hover:scale-110 transition-transform"><Camera className="h-6 w-6 text-primary" /></div>
                  <p className="text-sm font-semibold mt-1">Upload Property Images</p>
                  <p className="text-xs text-muted-foreground">Drag to reorder. First image is the cover.</p>
                </div>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={previews} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previews.map((item, index) => (
                      <SortablePhoto key={item.id} item={item} index={index} onRemove={(id) => setPreviews(p => p.filter(x => x.id !== id))} />
                    ))}
                  </div>
                  <FormField control={form.control} name="images" render={() => (
                    <FormItem>
                      <FormMessage className="text-center font-bold mt-4" />
                    </FormItem>
                  )} />
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
          <PricingCard form={form} />
          <Card>
            <CardHeader><CardTitle className="flex gap-2 text-lg items-center"><MapPin className="h-5 w-5 text-primary" /> Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField name="address.locationId" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>City / Municipality</FormLabel>
                  <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger asChild><Button variant="outline" className="justify-between w-full font-normal">{field.value ? ALL_LOCATIONS.find(l => l.id === field.value)?.title : "Select City"}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /></Button></PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput placeholder="Search cities..." value={cityQuery} onValueChange={setCityQuery} /><CommandList><CommandEmpty>No results found.</CommandEmpty>
                          {filteredCities.slice(0, 29).map(l => (
                            <CommandItem key={l.id} onSelect={() => {
                              field.onChange(l.id);
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
              <>
                {currentCity?.type == "city" && (
                  <FormField name="address.streetId" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Street / Area</FormLabel>
                      <Popover open={streetOpen} onOpenChange={setStreetOpen}>
                        <PopoverTrigger asChild><Button variant="outline" className="justify-between w-full font-normal">{groupedStreets.flatMap(g => g.streets).find(s => s.streetId === field.value)?.streetTitle || "Select Street"}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /></Button></PopoverTrigger>
                        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput placeholder="Search streets..." value={streetQuery} onValueChange={setStreetQuery} /><CommandList>
                              {filteredGroups.map((g: any) => (<CommandGroup key={g.subDistrictId} heading={g.subDistrictTitle}>{g.streets.map((s: any) => (<CommandItem key={s.streetId} onSelect={() => { field.onChange(s.streetId); setStreetOpen(false); }}>{s.streetTitle}</CommandItem>))}</CommandGroup>))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />
                )}
                {(currentCity && ((currentCity?.type !== "city") || (currentCity.type === "city" && selectedStrId))) && (
                  <FormField name="address.coords" render={({ field }) => (
                    <FormItem className="pt-2">
                      <FormLabel>Building Location</FormLabel>
                      <FormControl><MapPicker value={field.value} onChange={field.onChange} flyToCoords={mapFlyCoords} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </>

            </CardContent>
          </Card>
          <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold" disabled={createMutation.isPending || previews.some(p => p.isUploading)}>
            {createMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...</> : "Publish Property"}
          </Button>
        </form>
      </Form>
    </div>
  );
}