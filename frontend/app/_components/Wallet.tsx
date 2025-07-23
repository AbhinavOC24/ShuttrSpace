"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
const Wallets = () => {
  const { select, wallets, publicKey, disconnect } = useWallet();
  console.log(wallets);
  return !publicKey ? (
    <div>
      {wallets.filter((wallet) => wallet.readyState === "Installed").length >
      0 ? (
        wallets
          .filter((wallet) => wallet.readyState === "Installed")
          .map((wallet) => (
            <button
              key={wallet.adapter.name}
              onClick={() => select(wallet.adapter.name)}
              className="w-64 "
            >
              <Image
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
                height={64}
                width={64}
              />

              {wallet.adapter.name}
            </button>
          ))
      ) : (
        <div>No wallet found. Please download a supported Solana wallet</div>
      )}
    </div>
  ) : (
    <div>
      <div>{publicKey.toBase58()}</div>
      <button onClick={disconnect}>disconnect wallet</button>
    </div>
  );
};

export default Wallets;
