"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log("DEBUG: AuthProvider Rendering");
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    console.log("DEBUG: AuthProvider mounting, calling checkAuth...");
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
