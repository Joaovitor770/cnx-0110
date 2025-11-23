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
    // Regex to extract mime type and base64 data
    const match = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);

    if (!match) {
      console.warn('Invalid image format or not a base64 string');
      return image; // Return original if not matching expected format
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const fileExt = mimeType.split('/')[1]; // e.g. "jpeg", "png", "svg+xml"

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, {
        contentType: mimeType,
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
    return image; // Fallback to base64 if upload fails
  }
}
