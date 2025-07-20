"use client";
import React, { useEffect, useState } from "react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
const LoginPage = () => {
  const router = useRouter();
  const { signMessage, publicKey, connected } = useWallet();
  const [isMounted, setIsMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const {
    loginWithWallet,
    checkAuthAndFetchSlug,
    loading,
    error,
    setLoading,
    setError,
  } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);

    handleAuthCheck();
  }, []);

  useEffect(() => {
    console.log("Wallet connection state changed:", {
      connected,
      publicKey: publicKey?.toBase58(),
    });
  }, [connected, publicKey]);

  const handleAuthCheck = async () => {
    setCheckingAuth(true);
    try {
      const { authenticated, hasProfile, slug } = await checkAuthAndFetchSlug();

      if (!authenticated) return;
      router.push(hasProfile ? `/u/${slug}` : "/u/createprofile");
    } catch (error) {
      console.log(error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    if (!signMessage || !publicKey) {
      setError("Wallet not connected properly");
      return;
    }
    const result = await loginWithWallet(publicKey.toBase58(), signMessage);
    if (result?.authenticated) {
      await handleAuthCheck();
    }
  };

  if (!isMounted || checkingAuth)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Solana Wallet Login</h1>

      <div className="mb-4 p-2  rounded text-sm">
        <p>
          Public Key:{" "}
          {publicKey ? publicKey.toBase58().slice(0, 8) + "..." : "None"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!connected || !publicKey ? (
        <div className="text-center">
          <p className="mb-4">Connect your Solana wallet to continue</p>
          <WalletMultiButton />
        </div>
      ) : (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-green-600">Wallet connected!</p>
          <p className="text-sm text-gray-600">
            Public Key: {publicKey.toBase58().slice(0, 8)}...
          </p>

          <button
            onClick={handleLogin}
            disabled={loading || !signMessage}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login with Wallet"}
          </button>

          <WalletDisconnectButton />
        </div>
      )}
    </div>
  );
};

export default LoginPage;
