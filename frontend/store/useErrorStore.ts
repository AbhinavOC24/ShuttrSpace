import { create } from "zustand";

type ErrorStore = {
  globalError: string | null;
  setGlobalError: (message: string) => void;
  clearGlobalError: () => void;
};

export const useErrorStore = create<ErrorStore>((set) => ({
  globalError: null,
  setGlobalError: (message) => set({ globalError: message }),
  clearGlobalError: () => set({ globalError: null }),
}));
