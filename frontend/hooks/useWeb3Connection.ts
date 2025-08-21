import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { useMemo } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

import idl from "../idl/portfolio_registry.json";
import type { Idl } from "@coral-xyz/anchor";
export const useWeb3Connection = () => {
  const { publicKey, signMessage, sendTransaction } = useWallet();
  const anchorWallet = useAnchorWallet();

  const connection = useMemo(
    () => new Connection("https://api.devnet.solana.com"),
    []
  );
  const program = useMemo(() => {
    if (!anchorWallet) return null;

    try {
      const provider = new anchor.AnchorProvider(connection, anchorWallet, {
        preflightCommitment: "processed",
      });
      anchor.setProvider(provider);

      return new anchor.Program(idl as Idl, provider);
    } catch (error) {
      console.error("Failed to initialize Anchor program:", error);
      return null;
    }
  }, [connection, anchorWallet]);

  return {
    connection,
    program,
    anchorWallet,
    sendTransaction,
    signMessage,
    publicKey,
    PublicKey,
    Transaction,
  };
};
