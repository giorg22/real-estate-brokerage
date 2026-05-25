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
        dealType: Number(values.dealType),
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
          // Basic Info
          area: Number(values.area) || 0,
          rooms: Number(values.rooms) || 0,
          bedrooms: Number(values.bedrooms) || 0,
          floor: Number(values.floor) || 0,
          totalFloors: Number(values.totalFloors) || 0,
          condition: Number(values.condition) || 0,
          status: Number(values.status) || 0,

          // Detailed Areas
          yardArea: Number(values.yardArea) || 0,
          kitchenArea: Number(values.kitchenArea) || 0,
          balconyArea: Number(values.balconyArea) || 0,
          verandaArea: Number(values.verandaArea) || 0,
          loggiaArea: Number(values.loggiaArea) || 0,
          waitingArea: Number(values.waitingArea) || 0,
          livingRoomArea: Number(values.livingRoomArea) || 0,
          storageArea: Number(values.storageArea) || 0,

          // Construction & Layout
          ceilingHeight: Number(values.ceilingHeight) || 0,
          bathrooms: Number(values.bathrooms) || 0,
          balconyCount: Number(values.balconyCount) || 0,
          buildYear: Number(values.buildYear) || 0,
          period: Number(values.period) || 0,
          project: Number(values.project) || 0,

          // Utility & Features
          leaseType: Number(values.leaseType) || 0,
          typeofCRE: Number(values.typeofCRE) || 0,
          parking: Number(values.parking) || 0,
          heating: Number(values.heating) || 0,
          hotWater: Number(values.hotWater) || 0,
          buildingMaterial: Number(values.buildingMaterial) || 0,
          doorWindow: Number(values.doorWindow) || 0,

          // Multi-Select / Flag Groups
          propertyCharacteristics: Number(values.propertyCharacteristics) || 0,
          furnitureAndAppliances: Number(values.furnitureAndAppliances) || 0,
          buldingParameters: Number(values.buldingParameters) || 0,
          badges: Number(values.badges) || 0,
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