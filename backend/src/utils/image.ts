import imagekit from "../lib/imagekit";
import pool from "../lib/db";


type SavePhotoParams = {
  userId: number;
  imageUrl: string;
  thumbnailUrl: string;
  metadata: {
    title?: string;
    tags?: string[];
    location?: string;
    cameraDetails?: {
      cameraname?: string;
      lens?: string;
      aperture?: string;
      iso?: string;
      shutterspeed?: string;
    };
  };
};

export const generateThumbnail = (originalUrl: string): string => {
  const thumbnailUrl = `${originalUrl}?tr=w-400,q-70,f-webp`;
  return thumbnailUrl;
};

export const uploadToImagekit = async (file: string, fileName: string): Promise<string> => {
  const buffer = Buffer.from(file, "base64");

  const image = await imagekit.upload({
    file: buffer,
    fileName: fileName,
    folder: "/photos",
  });
  return image.url;
};

export const savePhoto = async ({ userId, imageUrl, thumbnailUrl, metadata }: SavePhotoParams) => {
  const result = await pool.query(
    `INSERT INTO photos (title, tags, location, cameraname, iso, aperture, shutterspeed, lens, thumbnail_url, image_url, user_id) 
     VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
     RETURNING id, title, tags, thumbnail_url as "thumbnailUrl", image_url as "imageUrl", created_at as "createdAt"`,
    [
      metadata.title || "Untitled",
      JSON.stringify(metadata.tags || []),
      metadata.location || "",
      metadata.cameraDetails?.cameraname || "",
      metadata.cameraDetails?.iso || "",
      metadata.cameraDetails?.aperture || "",
      metadata.cameraDetails?.shutterspeed || "",
      metadata.cameraDetails?.lens || "",
      thumbnailUrl,
      imageUrl,
      userId,
    ]
  );

  const photo = result.rows[0];
  console.log(`[DB] 💾 Photo '${photo.title}' saved to database for userId: ${userId} (ID: ${photo.id})`);
  return photo;
};