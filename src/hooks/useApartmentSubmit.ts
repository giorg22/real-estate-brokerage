import { useLocationStore } from "@/store/useLocationStore";
import { useCreateApartment } from "@/hooks/useCreateApartment";
import { toast } from "sonner";
import { useCurrentLocationStore } from "@/store/useCurrentLocationStore";

export const useApartmentSubmit = (previews: any[]) => {
  const createMutation = useCreateApartment();
  const resetLocationQueries = useLocationStore((state) => state.resetQueries);
  const { currentLocation, setCurrentLocation } = useCurrentLocationStore();

  const handleFormSubmit = async (values: any) => {
    try {
      if (previews.some(p => p.isUploading)) {
        toast.error("Please wait for images to finish uploading");
        return;
      }

      // 1. Coordinates Safety Check
      if (!values.address?.coords?.lat || !values.address?.coords?.lng) {
        toast.error("Please mark the location on the map");
        return;
      }
      console.log("currentLoc:", currentLocation);
      const isCity = currentLocation.v === 0;

      const payload = {
        title: values.title,
        price: Number(values.price),
        type: Number(values.type),
        status: Number(values.status),
        description: values.description,

        address: {
          address1: currentLocation.p1,
          address2: isCity ? (currentLocation.p2) : null,
          address3: isCity ? (currentLocation.p3) : null,
          address4: currentLocation.p4,

          latitude: values.address.coords.lat,
          longitude: values.address.coords.lng
        },

        specifications: {
          listingType: Number(values.listingType),
          type: Number(values.type),
          area: Number(values.area),
          rooms: Number(values.rooms),
          bedrooms: Number(values.bedrooms),
        },

        images: previews.map((p, i) => ({
          url: p.url || "",
          publicId: p.publicId || "",
          displayOrder: i,
          isPrimary: i === 0
        }))
      };

      await createMutation.mutateAsync(payload);
      toast.success("Listing Created Successfully!");
      
      setCurrentLocation([]); 
      resetLocationQueries();

    } catch (error) {
      toast.error("Submission Error");
      console.error("Submission Error:", error);
    }
  };

  return { handleFormSubmit, isSubmitting: createMutation.isPending };
};