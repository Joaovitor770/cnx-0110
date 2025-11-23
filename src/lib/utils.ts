import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function uploadImage(image: string): Promise<string> {
  if (!image || image.startsWith('http')) {
    return image;
  }

  try {
    // Check if it's a data URL
    if (!image.startsWith('data:image')) {
      return image; // Not a data URL, maybe a path or something else
    }

    const base64Data = image.split(',')[1];
    const fileExt = image.substring("data:image/".length, image.indexOf(";base64"));
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: `image/${fileExt}` });

    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, {
        contentType: `image/${fileExt}`,
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    return image; // Fallback
  }
}
