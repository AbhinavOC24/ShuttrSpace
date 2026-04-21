// App-wide upload constraints and configuration.

/** Maximum number of files allowed per upload session. */
export const MAX_UPLOAD_FILES = 10;

/** Accepted MIME types for image uploads. */
export const ACCEPTED_IMAGE_TYPES = "image/*";

/** Supported tag options shown in the upload modal. */
export const UPLOAD_TAGS = [
  "Abstract",
  "Street",
  "Portrait",
  "Landscape",
  "Night",
  "Architecture",
  "Wildlife",
  "Macro",
] as const;

export type UploadTag = typeof UPLOAD_TAGS[number];
