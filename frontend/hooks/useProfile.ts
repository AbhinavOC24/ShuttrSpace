import api from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { useAuthStore } from "@/store/useAuthStore";

export const useProfile = () => {
  const store = useProfileStore();
  const { isAuthenticated, userSlug } = useAuthStore();
  const { slug } = useParams();

  useEffect(() => {
    if (!slug) return;

    const init = async () => {
      // Step 1: Use auth state from store
      const resolvedUserSlug = isAuthenticated ? userSlug : null;

      // Step 2: Fetch the profile
      try {
        const res = await api.get(`/api/getProfile/${slug}`);
        if (res.data.profile) {
          store.setUserProfile(res.data.profile);

          const isOwner = resolvedUserSlug === res.data.profile.slug;
          console.log(`Permission Check: resolvedUserSlug(${resolvedUserSlug}) vs profileSlug(${res.data.profile.slug}) -> ${isOwner}`);
          store.setCanEdit(isOwner);

          const photoRes = await api.get(`/api/photo/getPhotos/${slug}`);
          store.setGallery(photoRes.data.photos || []);
        }
      } catch (err: any) {
        console.error("Profile fetch failed!", err.message);
        store.setNotFound(true);
      }
    };

    init();
  }, [slug, isAuthenticated, userSlug]);
};
