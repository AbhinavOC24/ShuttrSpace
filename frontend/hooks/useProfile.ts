import api from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { useAuthStore } from "@/store/useAuthStore";

export const useProfile = () => {
  const store = useProfileStore();
  const { checkAuth } = useAuthStore();
  const { slug } = useParams();

  useEffect(() => {
    if (!slug) return;

    const init = async () => {
      // Step 1: Always resolve auth first — get the current user's slug
      let resolvedUserSlug: string | null = null;
      try {
        const authRes = await api.get("/u/auth/getSlug");
        resolvedUserSlug = authRes.data.slug ?? null;
        // Sync the store so the rest of the app knows too
        useAuthStore.setState({
          isAuthenticated: true,
          hasProfile: authRes.data.hasProfile,
          userSlug: resolvedUserSlug,
        });
      } catch {
        // Not logged in — that's fine, just a visitor
        resolvedUserSlug = null;
      }

      // Step 2: Fetch the profile
      try {
        const res = await api.get(`/u/auth/getProfile/${slug}`);
        if (res.data.profile) {
          store.setUserProfile(res.data.profile);

          const isOwner = resolvedUserSlug === res.data.profile.slug;
          console.log(`Permission Check: resolvedUserSlug(${resolvedUserSlug}) vs profileSlug(${res.data.profile.slug}) -> ${isOwner}`);
          store.setCanEdit(isOwner);

          const photoRes = await api.get(`/u/photo/getPhotos/${slug}`);
          store.setGallery(photoRes.data.photos || []);
        }
      } catch (err: any) {
        console.error("Profile fetch failed!", err.message);
        store.setNotFound(true);
      }
    };

    init();
  }, [slug]);
};
