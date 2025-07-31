import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl } from "@project-serum/anchor";
import idl from "../../idl/portfolio_registry.json";
import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "B5FqrhXbhsZtcF3u39zvcUkgTV5NWBSy63xjuMNnDsxv"
);

export function usePortfolioProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  if (!wallet) return null;

  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });

  const program = new Program(idl as unknown as Idl, PROGRAM_ID, provider);

  return program;
}
