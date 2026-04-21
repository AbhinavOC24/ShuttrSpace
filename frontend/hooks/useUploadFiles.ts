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

    // ── INSTANT UI FEEDBACK ──
    // Close modal and reset its state immediately so the user can continue browsing
    store.setuploadImageModalStatus(false);
    store.setUploadQueue([]);
    store.setCurrentIndex(0);

    try {
      const uploadedResults = await Promise.all(
        queueToUpload.map(async (photo) => {
          // Get a fresh signature for each file
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

          if (!ikRes.ok) {
            const errorData = await ikRes.json();
            console.error("ImageKit Error:", errorData);
            throw new Error(`ImageKit upload failed: ${errorData.message}`);
          }
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

      const jobIds = queueToUpload.map(() => crypto.randomUUID());

      const response = await api.post(`/u/photo/uploadPhotos`, {
        metadata,
        jobIds,
        slug,
      });

      // ── OPTIMISTIC UI UPDATE ──
      // Show images in gallery immediately using local previews while worker processes
      const optimisticPhotos = queueToUpload.map((photo, index) => ({
        id: Math.random(), // Temp ID
        title: photo.title || "Untitled",
        tags: photo.tags,
        thumbnailUrl: URL.createObjectURL(photo.file),
        imageUrl: uploadedResults[index].url,
        createdAt: new Date().toISOString(),
        isProcessing: true,
      }));

      store.setGallery([...optimisticPhotos, ...store.gallery]);

      if (response.data.jobIds) {
        const pollJobStatus = async () => {
          const interval = setInterval(async () => {
            try {
              const statusRes = await api.get(`/u/photo/status?jobIds=${response.data.jobIds.join(",")}`);
              if (statusRes.data.allCompleted) {
                clearInterval(interval);
                const photoRes = await api.get(`/u/photo/getPhotos/${slug}`);
                store.setGallery(photoRes.data.photos || []);
                toast.success("All images uploaded and processed!", { id: uploadToast });
              } else if (statusRes.data.anyFailed) {
                clearInterval(interval);
                toast.error("Some images failed to process.", { id: uploadToast });
              }
            } catch (error) {
              clearInterval(interval);
              console.error("Status polling failed", error);
            }
          }, 2000);
        };
        pollJobStatus();
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.error || "Failed to upload photos";
      toast.error(errMsg, { id: uploadToast });
    } finally {
      store.setUploading(false);
    }
  };

  return { uploadFiles };
};
