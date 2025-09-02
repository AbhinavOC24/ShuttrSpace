"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/navigation";

const ConnectWalletButton = ({
  onClick,
  connected,
  loading,
  signMessage,
  publicKey,
}: {
  onClick: () => void;
  connected: boolean;
  loading: boolean;
  signMessage?: (msg: Uint8Array) => Promise<Uint8Array>;
  publicKey: string | null;
}) => {
  const router = useRouter();
  const { loginWithWallet, checkAuthAndFetchSlug } = useAuthStore();

  const getButtonText = () => {
    if (loading) return "Signing...";
    if (connected) return "Sign the message";
    return "Connect Wallet";
  };

  const login = async () => {
    const result = await loginWithWallet(publicKey as string, signMessage!);
    if (result?.authenticated) {
      const { hasProfile, slug } = await checkAuthAndFetchSlug();
      router.push(hasProfile ? `/u/${slug}` : "/u/createprofile");
    }
  };

  const isDisabled = connected && loading;
  const triggerFunction = connected ? login : onClick;
  return (
    <button
      onClick={triggerFunction}
      disabled={isDisabled}
      className={`h-[50px] absolute w-[208px] flex items-center justify-center bottom-0 right-0 rounded-br-[40px] rounded-tl-[10px]
          font-family-neue font-medium text-sm border border-[#4d4d4d] shadow-[inset_4px_6px_4px_2px_rgba(255,255,255,0.1)] overflow-hidden
          transition ease-in-out ${
            isDisabled
              ? "bg-gray text-gray-400 cursor-not-allowed"
              : "bg-black cursor-pointer hover:bg-white hover:text-black hover:border-white hover:shadow-[inset_2px_2px_4.3px_2px_rgba(0,0,0,0.5)]"
          }`}
    >
      {getButtonText()}
    </button>
  );
};
export default ConnectWalletButton;
