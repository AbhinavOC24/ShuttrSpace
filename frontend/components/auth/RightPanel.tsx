"use client";

import ConnectWalletButton from "./RightPanelComponents/ConnectWalletButton";
import CreatorFeatures from "./RightPanelComponents/CreatorFeatures";
import HeroSection from "./RightPanelComponents/HeroSection";
import SolanaCredits from "./RightPanelComponents/SolanaCredits";

const RightPanel = ({
  onConnectWallet,
  connected,
  loading,
  signMessage,
  publicKey,
}: {
  onConnectWallet: () => void;
  connected: boolean;
  loading: boolean;
  signMessage?: (msg: Uint8Array) => Promise<Uint8Array>;
  publicKey: string | null;
}) => (
  <div className="w-[490px] relative rounded-5xl">
    <div className="relative flex flex-col gap-6 w-[389px] h-[393px] top-[60px] left-[50px]">
      <HeroSection />
      <CreatorFeatures />
    </div>

    <div className="w-full absolute rounded-5xl h-[50px] bottom-0">
      <SolanaCredits />
      <ConnectWalletButton
        onClick={onConnectWallet}
        signMessage={signMessage}
        connected={connected}
        loading={loading}
        publicKey={publicKey}
      />
    </div>
  </div>
);

export default RightPanel;
