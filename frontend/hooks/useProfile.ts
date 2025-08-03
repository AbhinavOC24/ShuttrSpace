import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { useRouter } from "next/navigation";
import { useErrorStore } from "@/store/useErrorStore";
export const useProfile = () => {
  const store = useProfileStore();
  const { setGlobalError } = useErrorStore();
  const { slug } = useParams();
  const router = useRouter();
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
          store.setCanEdit(true);
        }
        if (res.data.profile) {
          console.log(res.data.profile);
          store.setUserProfile(res.data.profile);
          const photoRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/photo/getPhotos/${slug}`
          );

          store.setGallery(photoRes.data.photos);
        }
      } catch (err: any) {
        setGlobalError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to fetch profile"
        );
        store.setNotFound(true);
      }
    };
    getProfile();
  }, [slug, setGlobalError]);
};
