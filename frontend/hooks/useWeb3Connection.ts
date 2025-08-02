import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { useMemo } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
// Note: PublicKey here is the CLASS constructor from @solana/web3.js
// Used to create PublicKey instances from strings/buffers
import idl from "../idl/portfolio_registry.json";
import type { Idl } from "@coral-xyz/anchor";
export const useWeb3Connection = () => {
  // Wallet connection hooks - both publicKey values below are THE SAME user wallet address
  const { publicKey, signMessage, sendTransaction } = useWallet(); // publicKey: user's wallet address
  const anchorWallet = useAnchorWallet(); // anchorWallet.publicKey: same user wallet address (legacy Anchor format)

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
