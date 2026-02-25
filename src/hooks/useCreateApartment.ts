import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";

export function useCreateApartment() {
  const token = useAuthStore((state) => state.user?.token);

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("https://localhost:7075/apartment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to list apartment");
      return res.json();
    },
  });
}