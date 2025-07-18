"use client";
import React, { useEffect, useState } from "react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletProviderWrapper from "../_provider/WalletWrapper";
import axios from "axios";
import bs58 from "bs58";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const { signMessage, publicKey, connected } = useWallet();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check session on mount
  useEffect(() => {
    setIsMounted(true);
    verifySession();
  }, []);

  const verifySession = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/verifyAuth`,
        { withCredentials: true }
      );
      if (res.data.authenticated) {
        router.push("/u/profilepage");
      }
    } catch (err) {
      console.log("Not authenticated");
    } finally {
      setLoading(false);
    }
  };

  const loginWithWallet = async () => {
    if (!signMessage || !publicKey) return;

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/nonce`,
        { publicKey: publicKey.toBase58() }
      );
      const encodedMessage = new TextEncoder().encode(data.nonce);
      const signedMessage = await signMessage(encodedMessage);
      const signature = bs58.encode(signedMessage);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/verifySign`,
        {
          publicKey: publicKey.toBase58(),
          signature,
        },
        { withCredentials: true }
      );

      if (res.data.authenticated) {
        router.push("/u/profilepage");
      } else {
        console.log("Signature verification failed");
      }
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return <div className="min-h-screen">Loading...</div>;

  return (
    <WalletProviderWrapper>
      <h1 className="text-2xl font-bold mb-4">Solana Wallet Login</h1>

      {!connected ? (
        <WalletMultiButton />
      ) : (
        <button
          onClick={loginWithWallet}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Logging in..." : "Login with Wallet"}
        </button>
      )}
    </WalletProviderWrapper>
  );
};

export default LoginPage;
