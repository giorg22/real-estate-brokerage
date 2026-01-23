"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  Check, ChevronsUpDown, MapPin, FileText, 
  Camera, Loader2, X, Home, GripVertical 
} from "lucide-react";
import { cn } from "@/lib/utils";

// DnD Kit
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  TouchSensor, useSensor, useSensors, DragEndEvent 
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Hooks & UI
import { useUploadImage } from "@/hooks/useCloudinary";
import { useCreateApartment } from "@/hooks/useApartments";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

import locationData from "@/data/locations.json";

// --- TYPES ---
interface LocationItem { id: number; title: string; type: "city" | "municipality"; group: string; isSuburb: boolean; districts?: any[]; }
interface ImageItem { id: string; file: File; url?: string; publicId?: string; isUploading: boolean; }

// --- MAP COMPONENT ---
function MapPicker({ 
  value, 
  onChange, 
  flyToCoords 
}: { 
  value: { lat: number; lng: number } | null | undefined; 
  onChange: (coords: { lat: number; lng: number }) => void;
  flyToCoords?: { lat: number; lng: number } 
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);

  const DEFAULT_VIEW = { lat: 41.7151, lng: 44.8271 };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty', 
      center: [value?.lng || DEFAULT_VIEW.lng, value?.lat || DEFAULT_VIEW.lat],
      zoom: value ? 14 : 11,
      trackResize: true
    });

    map.current.on('load', () => {
      map.current?.resize();
    });

    // Initialize Marker
    marker.current = new maplibregl.Marker({ draggable: true });
    
    // If we have an initial value, add it to the map immediately
    if (value && map.current) {
      marker.current.setLngLat([value.lng, value.lat]).addTo(map.current);
    }

    marker.current.on('dragend', () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        onChange({ lat: lngLat.lat, lng: lngLat.lng });
      }
    });

    map.current.on('click', (e) => {
      if (!map.current || !marker.current) return;

        marker.current.setLngLat(e.lngLat);
        marker.current.addTo(map.current);
      
      onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (map.current && marker.current && flyToCoords) {
      map.current.flyTo({
        center: [flyToCoords.lng, flyToCoords.lat],
        zoom: 15,
        essential: true
      });

      // Visual update only
      if (!marker.current.getElement().parentNode) {
        marker.current.addTo(map.current);
      }
      marker.current.setLngLat([flyToCoords.lng, flyToCoords.lat]);
    }
  }, [flyToCoords]);

  return (
    <div className="space-y-2">
      <div 
        ref={mapContainer} 
        className="h-[350px] w-full rounded-xl border shadow-inner bg-slate-100 overflow-hidden" 
      />
      <div className="flex justify-between items-center px-1">
        <p className="text-[11px] text-muted-foreground italic flex gap-1 items-center">
          <MapPin className="h-3 w-3" /> 
          {value ? "Location set! Drag pin to refine." : "Click map to set exact location"}
        </p>
        {value && (
          <p className="text-[10px] font-mono text-muted-foreground">
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </p>
        )}
      </div>
    </div>
  );
}

// --- SORTABLE IMAGE COMPONENT ---
function SortablePhoto({ item, index, onRemove }: { item: ImageItem, index: number, onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    zIndex: isDragging ? 50 : 0,
    touchAction: "none" 
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative group border rounded-xl p-2 bg-card shadow-sm", isDragging && "ring-2 ring-primary opacity-50")}>
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <img src={item.url || (item.file ? URL.createObjectURL(item.file) : "")} className={cn("object-cover w-full h-full", item.isUploading && "opacity-30")} alt="preview" />
        <div {...attributes} {...listeners} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab bg-black/20 transition-opacity">
          <GripVertical className="text-white h-8 w-8" />
        </div>
        {!item.isUploading && (
          <button type="button" onClick={() => onRemove(item.id)} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 z-10"><X className="h-3 w-3" /></button>
        )}
        {item.isUploading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-primary h-6 w-6" /></div>}
      </div>
      <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-wider">
        <span className={cn("px-2 py-0.5 rounded-full", index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
          {index === 0 ? "Cover" : `Photo ${index + 1}`}
        </span>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---
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

  const form = useForm({
    defaultValues: {
      title: "", description: "", price: "", area: "", bedrooms: "", bathrooms: "1", 
      floor: "", totalFloors: "", furnished: "true", type: "0",
      address: { 
        locationId: null as number | null, 
        streetId: null as number | null,
        coords: null
      }
    },
  });

  const selectedLocId = form.watch("address.locationId");
  const selectedStrId = form.watch("address.streetId");

  useEffect(() => {
    form.setValue("address.streetId", null);
    
    setMapFlyCoords(undefined);
  }, [selectedLocId, form]);

  const ALL_LOCATIONS: LocationItem[] = useMemo(() => [
    ...locationData.locations.visibleCities.map((c: any) => ({ id: c.cityId, title: c.cityTitle, type: "city" as const, group: "Main Cities", isSuburb: false, districts: c.districts })),
    ...locationData.locations.suburb.flatMap((m: any) => m.cities.map((c: any) => ({ id: c.id, title: c.title, type: "municipality" as const, group: m.municipalityTitle, isSuburb: true }))),
    ...locationData.locations.municipality.flatMap((m: any) => m.cities.map((c: any) => ({ id: c.id, title: c.title, type: "municipality" as const, group: m.municipalityTitle, isSuburb: false })))
  ], []);

  const currentCity = useMemo(() => ALL_LOCATIONS.find((l) => l.id === selectedLocId), [selectedLocId, ALL_LOCATIONS]);
  const PINNED_CITY_IDs = [95, 96, 97, 98, 100, 99, 7];

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

  const onSubmit = async (values: any) => {
    try {
      if (previews.some(p => p.isUploading)) return;
      const streetTitle = groupedStreets.flatMap(g => g.streets).find(s => s.streetId === values.address.streetId)?.streetTitle || "";
      
      const payload = {
        title: values.title,
        description: values.description,
        price: Number(values.price),
        address: { 
          street: streetTitle, city: currentCity?.title || "", 
          state: currentCity?.group || "", country: "Georgia", 
          zipCode: "", latitude: values.address.coords.lat, longitude: values.address.coords.lng 
        },
        specifications: { 
          area: Number(values.area), bedrooms: Number(values.bedrooms), 
          bathrooms: Number(values.bathrooms), floor: Number(values.floor), 
          totalFloors: Number(values.totalFloors), yearBuilt: 2026, 
          furnished: values.furnished === "true" 
        },
        type: Number(values.type),
        images: previews.map((p, i) => ({ 
          url: p.url || "", publicId: p.publicId || "", 
          displayOrder: i, isPrimary: i === 0 
        }))
      };
      
      await createMutation.mutateAsync(payload);
      toast({ title: "Listing Created Successfully!" });
      form.reset();
      setPreviews([]);
    } catch (error) {
      toast({ title: "Submission Error", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-foreground/90 tracking-tight">Add New Listing</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader><CardTitle className="flex gap-2 text-lg items-center"><FileText className="h-5 w-5 text-primary"/> Listing Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g. Modern Apartment in Vera" {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Price (₾)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="0">Apartment</SelectItem><SelectItem value="1">House</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={4} placeholder="Tell us about the property..." {...field} /></FormControl></FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex gap-2 text-lg items-center"><MapPin className="h-5 w-5 text-primary"/> Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField name="address.locationId" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>City / Municipality</FormLabel>
                  <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger asChild><Button variant="outline" className="justify-between w-full font-normal">{field.value ? ALL_LOCATIONS.find(l => l.id === field.value)?.title : "Select City"}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50"/></Button></PopoverTrigger>
                    <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput placeholder="Search cities..." value={cityQuery} onValueChange={setCityQuery}/><CommandList><CommandEmpty>No results found.</CommandEmpty>
                          {filteredCities.slice(0, 50).map(l => (
                            <CommandItem key={l.id} onSelect={() => { 
                              field.onChange(l.id); 
                              setCityOpen(false);
                              if (l.title === "Tbilisi") setMapFlyCoords({ lat: 41.7151, lng: 44.8271 });
                              if (l.title === "Batumi") setMapFlyCoords({ lat: 41.6168, lng: 41.6367 });
                              if (l.title === "Kutaisi") setMapFlyCoords({ lat: 42.2662, lng: 42.7180 });
                            }}>
                              <Check className={cn("mr-2 h-4 w-4", field.value === l.id ? "opacity-100" : "opacity-0")}/> {l.title}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )} />

              
                <>
                {currentCity?.type == "city" && (
                  <FormField name="address.streetId" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Street / Area</FormLabel>
                      <Popover open={streetOpen} onOpenChange={setStreetOpen}>
                        <PopoverTrigger asChild><Button variant="outline" className="justify-between w-full font-normal">{groupedStreets.flatMap(g => g.streets).find(s => s.streetId === field.value)?.streetTitle || "Select Street"}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50"/></Button></PopoverTrigger>
                        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput placeholder="Search streets..." value={streetQuery} onValueChange={setStreetQuery}/><CommandList>
                              {filteredGroups.map((g: any) => (<CommandGroup key={g.subDistrictId} heading={g.subDistrictTitle}>{g.streets.map((s: any) => (<CommandItem key={s.streetId} onSelect={() => { field.onChange(s.streetId); setStreetOpen(false); }}>{s.streetTitle}</CommandItem>))}</CommandGroup>))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )} />
                )}
                {((currentCity?.type !== "city") || (currentCity.type === "city" && selectedStrId)) && (
                  <FormField name="address.coords" render={({ field }) => (
                    <FormItem className="pt-2">
                      <FormLabel>Building Location</FormLabel>
                      <FormControl><MapPicker value={field.value} onChange={field.onChange} flyToCoords={mapFlyCoords} /></FormControl>
                    </FormItem>
                  )} />
                )}
                </>
              
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex gap-2 text-lg items-center"><Home className="h-5 w-5 text-primary"/> Specifications</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem><FormLabel>Area (m²)</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="bedrooms" render={({ field }) => (
                <FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="floor" render={({ field }) => (
                <FormItem><FormLabel>Floor</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="furnished" render={({ field }) => (
                <FormItem><FormLabel>Furnished</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent>
                  </Select>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex gap-2 text-lg items-center"><Camera className="h-5 w-5 text-primary"/> Media</CardTitle></CardHeader>
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
                </SortableContext>
              </DndContext>
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