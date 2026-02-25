// Offline image upload queue — stores compressed base64 image data in localStorage
// so uploads can be retried automatically once the device comes back online.

import type { GalleryCategory, PlotImage } from '../types';

const IMAGE_QUEUE_KEY = 'maechaem_offline_image_queue';

export interface PendingImageUpload {
  id: string;
  timestamp: number;
  plotCode: string;
  type: PlotImage['type'];
  galleryCategory?: GalleryCategory;
  base64Data: string; // compressed base64 data URL (data:image/jpeg;base64,...)
  description?: string;
  uploader?: string;
  date?: string;
}

/** Return all queued image uploads (oldest first). */
export function getPendingImageUploads(): PendingImageUpload[] {
  try {
    return JSON.parse(localStorage.getItem(IMAGE_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Add a new image upload to the queue and return its id. */
export function addPendingImageUpload(
  data: Omit<PendingImageUpload, 'id' | 'timestamp'>
): string {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const uploads = getPendingImageUploads();
  uploads.push({ id, timestamp: Date.now(), ...data });
  localStorage.setItem(IMAGE_QUEUE_KEY, JSON.stringify(uploads));
  return id;
}

/** Remove a single image upload from the queue (e.g. after a successful sync). */
export function removePendingImageUpload(id: string): void {
  const uploads = getPendingImageUploads().filter((u) => u.id !== id);
  localStorage.setItem(IMAGE_QUEUE_KEY, JSON.stringify(uploads));
}

/** Number of image uploads currently waiting to be synced. */
export function getPendingImageCount(): number {
  return getPendingImageUploads().length;
}
