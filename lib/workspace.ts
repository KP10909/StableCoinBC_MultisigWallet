import type { Address, Hex, EIP1193Provider } from "viem";
import { chain } from "./config";
export type Provider = EIP1193Provider;
export type WalletOption = { id: string; name: string; provider: Provider };
export type Asset = {
  symbol: string;
  address?: Address;
  decimals?: number;
  balance?: bigint;
  error?: string;
};
export type Proposal = {
  id: bigint;
  to: Address;
  value: bigint;
  data: Hex;
  executed: boolean;
  confirmations: bigint;
  confirmed: boolean;
  submitTxHash?: Hex;
  confirmTxs: { owner: Address; hash: Hex }[];
};
export type Tx = { hash: Hex; label: string; status: string };
export const short = (s: string) => `${s.slice(0, 8)}…${s.slice(-6)}`;
export const explorer = chain.blockExplorers.default.url;
export const message = (e: unknown) =>
  e instanceof Error
    ? "shortMessage" in e
      ? String(e.shortMessage)
      : e.message
    : String(e);
