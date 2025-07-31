import axios from "axios";
import { useEffect, useState } from "react";
import { PhotoFromDB, UserProfile } from "../_components/types/profile";
import { useErrorStore } from "@/store/useErrorStore";

export const useProfile = (slug: string) => {
  const [canEdit, setCanEdit] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const setGlobalError = useErrorStore((state) => state.setGlobalError);
  const [gallery, setGallery] = useState<PhotoFromDB[]>([]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/getProfile`,
          { slug },
          { withCredentials: true }
        );
        if (
          res.data.authenticated &&
          res.data.sessionSlug === res.data.profile.slug
        ) {
          setCanEdit(true);
        }
        if (res.data.profile) {
          setUserProfile(res.data.profile);
          const photoRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/photo/getPhotos/${slug}`
          );

          setGallery(photoRes.data.photos);
        }
      } catch (err: any) {
        setGlobalError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to fetch profile"
        );
      }
    };
    getProfile();
  }, [slug, setGlobalError]);
};
