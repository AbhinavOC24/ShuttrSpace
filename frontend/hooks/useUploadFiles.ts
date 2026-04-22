import { useProfileStore } from "@/store/useProfileStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

export const useUploadFiles = () => {
  const store = useProfileStore();

  const uploadFiles = async (slug: string) => {
    if (store.uploading) return;
    store.setUploading(true);

    const uploadToast = toast.loading(`Uploading ${store.uploadQueue.length} photo${store.uploadQueue.length > 1 ? "s" : ""}…`);

    // Capture a local copy of the queue so we can clear the store immediately
    const queueToUpload = [...store.uploadQueue];
    const batchId = crypto.randomUUID();

    // ── 0ms OPTIMISTIC UI FEEDBACK ──
    const optimisticPreviews = queueToUpload.map((photo) => ({
      id: Math.random(),
      title: photo.title || "Untitled",
      tags: photo.tags,
      location: photo.location,
      thumbnailUrl: URL.createObjectURL(photo.file),
      imageUrl: "",
      status: 'preparing' as const,
      isOptimistic: true,
      createdAt: new Date().toISOString(),
    }));

    // Instantly update the gallery in the UI (Reversed to match created_at DESC)
    store.setGallery([...optimisticPreviews.reverse(), ...store.gallery]);

    // Reset modal state immediately
    store.setuploadImageModalStatus(false);
    store.setUploadQueue([]);
    store.setCurrentIndex(0);

    try {
      const uploadedResults = await Promise.all(
        queueToUpload.map(async (photo) => {
          const authRes = await api.get("/u/photo/uploadAuth");
          const { signature, token, expire, publicKey } = authRes.data;

          const ikFormData = new FormData();
          ikFormData.append("file", photo.file);
          ikFormData.append("fileName", photo.file.name);
          ikFormData.append("publicKey", publicKey);
          ikFormData.append("signature", signature);
          ikFormData.append("expire", expire);
          ikFormData.append("token", token);
          ikFormData.append("folder", "/photos");

          const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
            method: "POST",
            body: ikFormData,
          });

          if (!ikRes.ok) throw new Error("ImageKit upload failed");
          return await ikRes.json();
        })
      );

      const metadata = queueToUpload.map((photo, index) => ({
        title: photo.title,
        tags: photo.tags,
        location: photo.location,
        cameraDetails: photo.cameraDetails,
        imageUrl: uploadedResults[index].url,
      }));

      // Send to backend — this swaps our local "Optimistic" rows for "DB Pending" rows
      await api.post(`/u/photo/uploadPhotos`, {
        metadata,
        batchId,
        slug,
      });

      // Refresh the gallery from the DB (the 'pending' rows now replace the local blobs)
      const initialFetch = await api.get(`/u/photo/getPhotos/${slug}`);
      store.setGallery(initialFetch.data.photos || []);

      const pollJobStatus = async () => {
        const interval = setInterval(async () => {
          try {
            const statusRes = await api.get(`/u/photo/status/${batchId}`);
            const { allSettled, allCompleted, anyFailed } = statusRes.data;

            if (allSettled) {
              clearInterval(interval);
              const photoRes = await api.get(`/u/photo/getPhotos/${slug}`);
              store.setGallery(photoRes.data.photos || []);

              if (allCompleted) {
                toast.success("All images uploaded and processed!", { id: uploadToast });
              } else if (anyFailed) {
                toast.error("Some images failed to process.", { id: uploadToast });
              }
            }
          } catch (error) {
            clearInterval(interval);
          }
        }, 2000);
      };
      pollJobStatus();

    } catch (error: any) {
      toast.error("Failed to upload photos", { id: uploadToast });
    } finally {
      store.setUploading(false);
    }
  };

  return { uploadFiles };
};
