export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ACCEPTED_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

/** Matches MAX_IMAGE_BYTES in .env.example (5 MiB). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Matches MAX_IMAGES_PER_QUOTE in .env.example. */
export const MAX_IMAGES_PER_QUOTE = 3;

export function isAllowedImageFile(file: File): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type);
}
