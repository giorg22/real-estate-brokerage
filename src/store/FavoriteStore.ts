import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteStore {
  favorites: Record<string, boolean>; // { "apt-guid": true }
  setFavorite: (id: string, isLiked: boolean) => void;
  toggleLocalFavorite: (id: string) => void;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set) => ({
      favorites: {},
      setFavorite: (id, isLiked) => 
        set((state) => ({ favorites: { ...state.favorites, [id]: isLiked } })),
      toggleLocalFavorite: (id) =>
        set((state) => ({ 
          favorites: { ...state.favorites, [id]: !state.favorites[id] } 
        })),
    }),
    { name: "favorite-storage" }
  )
);