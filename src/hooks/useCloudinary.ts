// src/hooks/useCloudinary.ts
import { useMutation } from "@tanstack/react-query";

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "testmest"); // Set this in Cloudinary

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dqh0ovdu4/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");
      return res.json(); // Returns { url, public_id, ... }
    },
  });
}