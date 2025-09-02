"use client";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { useAuthStore } from "@/store/useAuthStore";
import { useErrorStore } from "@/store/useErrorStore";

import LeftPanel from "./_components/LoginPage/LeftPanel";
import ConnectWalletModal from "./_components/Wallet/ConnectWalletModal";
import RightPanel from "./_components/LoginPage/RightPanel";

const RenderWallets = dynamic(
  () => import("./_components/Wallet/RenderWallet"),
  { ssr: false }
);

const LoginPage = () => {
  const router = useRouter();
  const { publicKey, connected, signMessage } = useWallet();

  const { loginWithWallet, checkAuthAndFetchSlug, loading, setLoading } =
    useAuthStore();
  const { globalError, setGlobalError, clearGlobalError } = useErrorStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [attemptedLogin, setAttemptedLogin] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    clearGlobalError();
  }, [clearGlobalError]);
  useEffect(() => {
    console.log("Wallet state:", {
      connected,
      publicKey: publicKey?.toBase58(),
      signMessage: !!signMessage,
    });
  }, [connected, publicKey, signMessage]);
  useEffect(() => {
    const runAuthFlow = async () => {
      if (
        !connected ||
        !publicKey ||
        loading ||
        attemptedLogin ||
        !signMessage
      ) {
        return;
      }

      setAttemptedLogin(true);
      setLoading(true);

      try {
        const { authenticated, hasProfile, slug } =
          await checkAuthAndFetchSlug();

        if (authenticated) {
          router.push(hasProfile ? `/u/${slug}` : "/u/createprofile");
          return;
        }
      } catch (err: any) {
        console.error("Auth error:", err);
        setGlobalError(
          err?.response?.data?.error || "Something went wrong during login."
        );
      } finally {
        setLoading(false);
        setAttemptedLogin(false);
      }
    };

    runAuthFlow();
  }, [connected, publicKey]);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="overflow-hidden flex items-center justify-center h-screen">
      {/* Global Error Display */}
      {globalError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {globalError}
        </div>
      )}

      <div className="w-[974px] h-[610px] overflow-hidden flex bg-[#151515] rounded-5xl">
        <LeftPanel />
        <RightPanel
          onConnectWallet={() => setIsOpen(true)}
          connected={connected}
          loading={loading}
          signMessage={signMessage}
          publicKey={publicKey?.toBase58() || ""}
        />

        <ConnectWalletModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="font-family-neue text-[32px] text-center mt-[40px] p-0 mx-[28px]">
            Select your Wallet <br />
            On Solana
          </div>
          <div className="flex flex-col items-center mt-[30px] mb-[40px]">
            <RenderWallets />
          </div>
        </ConnectWalletModal>
      </div>
    </div>
  );
};

export default LoginPage;
