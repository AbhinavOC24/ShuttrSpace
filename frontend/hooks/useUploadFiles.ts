import { useProfileStore } from "@/store/useProfileStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

export const useUploadFiles = () => {
  const store = useProfileStore();

  const uploadFiles = async (slug: string) => {
    if (store.uploading) return;
    store.setUploading(true);

    const uploadToast = toast.loading(`Uploading ${store.uploadQueue.length} photo${store.uploadQueue.length > 1 ? "s" : ""}…`);

    try {
      const formData = new FormData();
      store.uploadQueue.forEach((photo) => {
        formData.append("photos", photo.file);
      });

      const metadata = store.uploadQueue.map((photo) => ({
        title: photo.title,
        tags: photo.tags,
        location: photo.location,
        cameraDetails: photo.cameraDetails,
      }));
      formData.append("metadata", JSON.stringify(metadata));
      formData.append("slug", slug);

      const response = await api.post(`/u/photo/uploadPhotos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.photos) {
        store.addToGallery(response.data.photos);
        toast.success(
          `${response.data.photos.length} photo${response.data.photos.length > 1 ? "s" : ""} uploaded!`,
          { id: uploadToast }
        );
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.error || "Failed to upload photos";
      toast.error(errMsg, { id: uploadToast });
    } finally {
      store.setuploadImageModalStatus(false);
      store.setUploading(false);
      store.setUploadQueue([]);
      store.setCurrentIndex(0);
    }
  };

  return { uploadFiles };
};
