import { create } from "zustand";
import api, { setAuthHeader } from "@/lib/api";

type FormDataType = {
  name: string;
  email: string;
  bio: string;
  profilePic: string;
  tags: string[];
  birthDate: string;
  location: string;
  twitter: string;
  instagram: string;
  linkedin: string;
};

type AuthState = {
  formData: FormDataType;
  token: string | null;
  setFormData: (data: Partial<FormDataType>) => void;
  profileFile: File | null;
  toggleTag: (tag: string) => void;
  resetFormData: () => void;
  loading: boolean;
  authError: string | null;
  setAuthError: (msg: string | null) => void;
  setLoading: (val: boolean) => void;
  setProfileFile: (input: File | null) => void;
  isAuthenticated: boolean;
  hasProfile: boolean;
  userSlug: string | null;
  checkAuth: () => Promise<boolean>;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  signup: (credentials: { email: string; password: string; name: string }) => Promise<boolean>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  setProfileFile: (input) => set({ profileFile: input }),
  profileFile: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  formData: {
    name: "",
    email: "",
    bio: "",
    profilePic: "",
    tags: [] as string[],
    birthDate: "",
    location: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  toggleTag: (tag: string) =>
    set((state) => ({
      formData: {
        ...state.formData,
        tags: state.formData.tags.includes(tag)
          ? state.formData.tags.filter((t) => t !== tag)
          : [...state.formData.tags, tag],
      },
    })),
  resetFormData: () =>
    set({
      formData: {
        name: "",
        email: "",
        bio: "",
        profilePic: "",
        birthDate: "",
        tags: [] as string[],
        location: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
    }),
  loading: false,
  authError: null,
  isAuthenticated: false,
  hasProfile: false,
  userSlug: null,

  setAuthError: (msg) => set({ authError: msg }),
  setLoading: (val) => set({ loading: val }),

  checkAuth: () => {
    console.log("DEBUG: Starting checkAuth...");
    return api.get(`/u/getSlug`)
      .then(res => {
         console.log("DEBUG: checkAuth success!", res.data);
         set({ isAuthenticated: true, hasProfile: res.data.hasProfile, userSlug: res.data.slug });
         return true;
      })
      .catch((err) => {
         console.error("DEBUG: checkAuth failed!", err.message);
         set({ isAuthenticated: false, hasProfile: false, userSlug: null });
         return false;
      });
  },

  login: (credentials) => {
    set({ loading: true, authError: null });
    return api.post(`/u/auth/login`, credentials)
      .then(({ data }) => {
        localStorage.setItem("token", data.token);
        setAuthHeader(data.token);
        set((state) => ({ 
          token: data.token, 
          formData: { ...state.formData, email: credentials.email }, 
          loading: false,
          isAuthenticated: true,
          hasProfile: data.hasProfile,
          userSlug: data.slug
        }));
        return true;
      })
      .catch((err) => {
        set({ authError: err.response?.data?.error || "Login failed", loading: false });
        return false;
      });
  },

  signup: (credentials) => {
    set({ loading: true, authError: null });
    return api.post(`/u/auth/signup`, credentials)
      .then(({ data }) => {
        localStorage.setItem("token", data.token);
        setAuthHeader(data.token);
        set((state) => ({ 
          token: data.token, 
          formData: { ...state.formData, email: credentials.email, name: credentials.name }, 
          loading: false,
          isAuthenticated: true,
          hasProfile: data.hasProfile,
          userSlug: data.slug
        }));
        return true;
      })
      .catch((err) => {
        set({ authError: err.response?.data?.error || "Signup failed", loading: false });
        return false;
      });
  },
  logout: async () => {
    try {
      await api.post("/u/auth/logout");
    } catch (e) {
      console.error("Logout failed on backend", e);
    }
    localStorage.removeItem("token");
    setAuthHeader(null);
    set({
      token: null,
      isAuthenticated: false,
      hasProfile: false,
      userSlug: null,
      formData: {
        name: "",
        email: "",
        bio: "",
        profilePic: "",
        tags: [] as string[],
        birthDate: "",
        location: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      }
    });
  }
}));
