"use client";
import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import dynamic from "next/dynamic";

const Wallets = dynamic(() => import("../_components/Wallet"), { ssr: false });

function checkWallet() {
  return (
    <div>
      <WalletMultiButton />
      <Wallets />
    </div>
  );
}

export default checkWallet;
