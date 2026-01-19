"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ReactGoogleAutocomplete from "react-google-autocomplete";

// Hooks & Store
import { useUploadImage } from "@/hooks/useCloudinary";
import { useCreateApartment } from "@/hooks/useApartments";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, ImagePlus, MapPin, DollarSign, Home } from "lucide-react";
import { toast } from "sonner";

// Zod Schema matching your C# CreateApartmentDto
const apartmentSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(1).max(4000).optional(),
  price: z.coerce.number().min(1).optional(),
  type: z.number().int().min(0).max(7), // Maps to your ApartmentType Enum
  address: z.object({
    street: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  specifications: z.object({
    area: z.coerce.number(),
    bedrooms: z.coerce.number(),
    bathrooms: z.coerce.number(),
    floor: z.coerce.number().optional(),
    furnished: z.boolean().default(false).optional(),
  }),
  images: z.array(z.object({
    url: z.string().optional(),
    public_id: z.string().optional()
  })).min(0, "Please upload at least one image"),
});

export default function AddApartmentPage() {
  const { mutateAsync: uploadToCloudinary, isPending: isUploading } = useUploadImage();
  const { mutate: createApartment, isPending: isSaving } = useCreateApartment();

  const form = useForm<z.infer<typeof apartmentSchema>>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      type: 0,
      images: [],
      specifications: { bedrooms: 1, bathrooms: 1, area: 0, furnished: false }
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const res = await uploadToCloudinary(file);
      const currentImages = form.getValues("images");
      form.setValue("images", [...currentImages, { url: res.secure_url, public_id: res.public_id }]);
    }
  };

  const onSubmit = (data: z.infer<typeof apartmentSchema>) => {
    console.log("Form Errors:", form.formState.errors);
    createApartment(data, {
      onSuccess: () => toast.success("Apartment listed!"),
      onError: () => toast.error("Something went wrong")
    });
  };
  console.log("Form Errors:", form.formState.errors);
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select 
                        onValueChange={(val) => field.onChange(parseInt(val))} // Convert "0" to 0
                        defaultValue={field.value.toString()}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="0">Apartment</SelectItem>
                        <SelectItem value="1">Condo</SelectItem>
                        <SelectItem value="2">Townhouse</SelectItem>
                        <SelectItem value="3">Villa</SelectItem>
                        <SelectItem value="4">Studio</SelectItem>
                        <SelectItem value="5">Loft</SelectItem>
                        <SelectItem value="6">Penthouse</SelectItem>
                        <SelectItem value="7">Duplex</SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ADDRESS SECTION (Google Autocomplete) */}
          <Card>
            <CardHeader><CardTitle>Location</CardTitle></CardHeader>
            <CardContent>
              <FormItem>
                <FormLabel>Search Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <ReactGoogleAutocomplete
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onPlaceSelected={(place) => {
                        const components = place.address_components;
                        const getComp = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name || "";
                        
                        form.setValue("address", {
                          street: `${getComp("street_number")} ${getComp("route")}`,
                          city: getComp("locality"),
                          state: getComp("administrative_area_level_1"),
                          country: getComp("country"),
                          zipCode: getComp("postal_code"),
                          latitude: place.geometry.location.lat(),
                          longitude: place.geometry.location.lng()
                        });
                      }}
                      options={{ types: ["address"] }}
                    />
                  </div>
                </FormControl>
                {/* Show the confirmed address to the user */}
                <p className="text-xs text-muted-foreground mt-2">
                  Confirmed: {form.watch("address.street")}, {form.watch("address.city")}
                </p>
              </FormItem>
            </CardContent>
          </Card>

          {/* SPECS SECTION */}
          <Card>
            <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <FormField name="specifications.area" render={({ field }) => (
                <FormItem><FormLabel>Area (m²)</FormLabel><Input type="number" {...field} /></FormItem>
              )} />
              <FormField name="specifications.bedrooms" render={({ field }) => (
                <FormItem><FormLabel>Bedrooms</FormLabel><Input type="number" {...field} /></FormItem>
              )} />
              <FormField name="specifications.bathrooms" render={({ field }) => (
                <FormItem><FormLabel>Bathrooms</FormLabel><Input type="number" {...field} /></FormItem>
              )} />
            </CardContent>
          </Card>

          {/* IMAGES SECTION */}
          <Card>
            <CardHeader><CardTitle>Images</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {form.watch("images").map((img, i) => (
                  <div key={i} className="relative aspect-square border rounded-md overflow-hidden">
                    <img src={img.url} className="object-cover w-full h-full" />
                    <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => {
                      const imgs = form.getValues("images");
                      form.setValue("images", imgs.filter((_, idx) => idx !== i));
                    }}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                <label className="border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 aspect-square">
                  {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus className="text-muted-foreground" />}
                  <input type="file" hidden multiple onChange={handleFileChange} />
                </label>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12" disabled={isSaving || isUploading}>
            {isSaving ? "Publishing..." : "Post Apartment"}
          </Button>
        </form>
      </Form>
    </div>
  );
}