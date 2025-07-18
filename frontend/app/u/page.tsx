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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    verifySession();
  }, []);

  useEffect(() => {
    console.log("Wallet connection state changed:", {
      connected,
      publicKey: publicKey?.toBase58(),
    });
  }, [connected, publicKey]);

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
    if (!signMessage || !publicKey) {
      setError("Wallet not connected properly");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        "Step 1: Requesting nonce for public key:",
        publicKey.toBase58()
      );

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/nonce`,
        { publicKey: publicKey.toBase58() },
        { withCredentials: true }
      );

      console.log("Step 2: Received nonce:", data.nonce);
      const nonce = data.nonce;

      console.log("Step 3: Signing message...");
      const encodedMessage = new TextEncoder().encode(nonce);
      const signedMessage = await signMessage(encodedMessage);

      if (!signedMessage) throw new Error("Signature failed");

      const signature = bs58.encode(signedMessage);
      console.log("Step 4: Generated signature:", signature);

      console.log("Step 5: Verifying signature...");

      console.log(`${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/verifySign`);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/verifySign`,
        {
          publicKey: publicKey.toBase58(),
          signature,
        },
        { withCredentials: true }
      );

      console.log("Step 6: Verification response:", res.data);

      if (res.data.authenticated) {
        router.push("/u/profilepage");
      } else {
        setError("Signature verification failed");
      }
    } catch (err: any) {
      console.error("Login failed:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted)
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
            onClick={loginWithWallet}
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
