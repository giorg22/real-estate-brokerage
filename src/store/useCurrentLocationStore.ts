import { LocationNode } from "@/types/LocationItem";
import { create } from "zustand";

interface CurrentLocationStore {
  currentLocation: any | null;
  setCurrentLocation: (location: any | null) => void;
  resetLocation: () => void;
}

export const useCurrentLocationStore = create<CurrentLocationStore>((set) => ({
  currentLocation: null,

  setCurrentLocation: (location) =>
    set({ currentLocation: location }),

  resetLocation: () =>
    set({ currentLocation: null }),
}));