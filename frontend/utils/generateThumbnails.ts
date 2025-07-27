import pica from "pica";

/**
 * Generates a thumbnail from an image File
 * @param file The original image file
 * @param maxWidth Maximum thumbnail width (default 800px)
 * @returns A new File (JPEG thumbnail)
 */
export async function generateThumbnail(file: File, maxWidth = 800) {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);

  // Wait for image to load
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement("canvas");
  const aspectRatio = img.width / img.height;
  canvas.width = maxWidth;
  canvas.height = maxWidth / aspectRatio;

  const picaInstance = pica();
  await picaInstance.resize(img, canvas);

  // Convert canvas to Blob → File
  const blob = await picaInstance.toBlob(canvas, "image/jpeg", 0.8);
  return new File([blob], `thumb_${file.name}`, { type: "image/jpeg" });
}
