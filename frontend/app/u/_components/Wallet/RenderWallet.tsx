"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";

const RenderWallets = () => {
  const { select, wallets, connected, disconnect, wallet } = useWallet();

  const buttonClass =
    "h-[50px] cursor-pointer w-[324px] flex items-center gap-2 pl-[18px] rounded-[20px] " +
    "font-family-neue font-medium text-sm bg-black border border-[#4d4d4d] " +
    "shadow-[inset_4px_6px_4px_2px_rgba(255,255,255,0.1)] overflow-hidden " +
    "hover:bg-white hover:text-black hover:border-white " +
    "hover:shadow-[inset_2px_2px_4.3px_2px_rgba(0,0,0,0.5)] transition ease-in-out";

  return (
    <div className="flex flex-col gap-2.5">
      {connected && wallet ? (
        <button onClick={disconnect} className={buttonClass}>
          <Image
            src={wallet.adapter.icon}
            alt={wallet.adapter.name}
            height={25}
            width={25}
          />
          Disconnect {wallet.adapter.name}
        </button>
      ) : wallets.filter((wallet) => wallet.readyState === "Installed").length >
        0 ? (
        wallets
          .filter((wallet) => wallet.readyState === "Installed")
          .map((wallet) => (
            <button
              key={wallet.adapter.name}
              onClick={() => select(wallet.adapter.name)}
              className={buttonClass}
            >
              <Image
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
                height={25}
                width={25}
              />
              {wallet.adapter.name}
            </button>
          ))
      ) : (
        <div>No wallet found. Please download a supported Solana wallet</div>
      )}
    </div>
  );
};

export default RenderWallets;
