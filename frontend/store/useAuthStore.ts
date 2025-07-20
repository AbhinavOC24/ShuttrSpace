import { create } from "zustand";
import axios from "axios";
import bs58 from "bs58";

type AuthState = {
  loading: boolean;
  authError: string | null;
  setAuthError: (msg: string | null) => void;
  setLoading: (val: boolean) => void;
  checkAuthAndFetchSlug: () => Promise<{
    authenticated: boolean;
    hasProfile: boolean;
    slug: string | null;
  }>;
  loginWithWallet: (
    publicKey: string,
    signMessage: (msg: Uint8Array) => Promise<Uint8Array>
  ) => Promise<{
    authenticated: boolean;
  } | null>;
};
export const useAuthStore = create<AuthState>((set) => ({
  loading: false,
  authError: null,

  setAuthError: (msg) => set({ authError: msg }),
  setLoading: (val) => set({ loading: val }),

  checkAuthAndFetchSlug: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/getSlug`,
        { withCredentials: true }
      );
      return {
        authenticated: true,
        hasProfile: res.data.hasProfile,
        slug: res.data.slug,
      };
    } catch (err) {
      console.log("Auth check failed from checkAuthAndFetchSlug", err);
      return { authenticated: false, hasProfile: false, slug: null };
    } finally {
      set({ loading: false });
    }
  },
  loginWithWallet: async (publicKey, signMessage) => {
    try {
      set({ loading: true, authError: null });

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/nonce`,
        { publicKey },
        { withCredentials: true }
      );

      const encoded = new TextEncoder().encode(data.nonce);
      const signed = await signMessage(encoded);
      const signature = bs58.encode(signed);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/verifySign`,
        { publicKey, signature },
        { withCredentials: true }
      );

      return {
        authenticated: res.data.authenticated,
      };
    } catch (err: any) {
      if (err.response?.data?.error)
        set({ authError: err.response.data.authE });
      else if (err.message) set({ authError: err.message });
      else set({ authError: "Unknown login error from loginWithWallet" });

      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
