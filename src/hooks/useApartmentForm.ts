import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apartmentSchema } from "@/lib/validations";
import * as z from "zod";

export function useApartmentForm() {
  return useForm<z.infer<typeof apartmentSchema>>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      title: "",
      description: "",
      address: { coords: null }
    }
  });
}
