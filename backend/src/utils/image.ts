import imagekit from "../lib/imagekit";
import pool from "../lib/db";




export const generateThumbnail = (originalUrl: string): string => {
  const thumbnailUrl = `${originalUrl}?tr=w-400,q-70,f-webp`;
  return thumbnailUrl;
};

type SavePhotoParams = {
  userId: number;
  photoId?: number; // Make it optional for backward compatibility
  imageUrl: string;
  thumbnailUrl: string;
  metadata: any;
};

export const savePhoto = async ({ userId, photoId, imageUrl, thumbnailUrl, metadata }: SavePhotoParams) => {
  if (photoId) {
    // NEW: Update existing pending record
    const result = await pool.query(
      `UPDATE photos SET 
        thumbnail_url = $1, 
        image_url = $2, 
        status = 'completed' 
       WHERE id = $3 AND user_id = $4 
       RETURNING id, title, status`,
      [thumbnailUrl, imageUrl, photoId, userId]
    );
    const photo = result.rows[0];
    console.log(`[DB] ✅ Photo ID ${photoId} marked as COMPLETED.`);
    return photo;
  }

  // Fallback for cases without pre-insertion
  const result = await pool.query(
    `INSERT INTO photos (title, tags, location, cameraname, iso, aperture, shutterspeed, lens, thumbnail_url, image_url, user_id, status) 
     VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'completed') 
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

export const failPhoto = async (photoId: number) => {
  await pool.query(
    "UPDATE photos SET status = 'failed' WHERE id = $1",
    [photoId]
  );
  console.log(`[DB] 💀 Photo ID ${photoId} marked as FAILED.`);
};