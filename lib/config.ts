import { defineChain, getAddress, type Abi } from "viem";
import abiJson from "./multisig.json" with { type: "json" };
export const abi = abiJson as Abi;

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
if (!rpcUrl)
  throw new Error(
    "NEXT_PUBLIC_RPC_URL is not set. Copy .env.example to .env.local and fill it in.",
  );
const multisigAddress = process.env.NEXT_PUBLIC_MULTISIG_ADDRESS;
if (!multisigAddress)
  throw new Error(
    "NEXT_PUBLIC_MULTISIG_ADDRESS is not set. Copy .env.example to .env.local and fill it in.",
  );
const tokensJson = process.env.NEXT_PUBLIC_TOKENS;
if (!tokensJson)
  throw new Error(
    "NEXT_PUBLIC_TOKENS is not set. Copy .env.example to .env.local and fill it in.",
  );

export const chain = defineChain({
  id: 56357,
  name: "KCP Testnet",
  nativeCurrency: { name: "KRW", symbol: "KRW", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "KCP Explorer",
      url: "https://explorer-test.avax.network/monthlygol",
    },
  },
  testnet: true,
});
export const multisig = getAddress(multisigAddress.toLowerCase());
export const tokens = (
  JSON.parse(tokensJson) as { symbol: string; address: string }[]
).map((t) => ({ ...t, address: getAddress(t.address.toLowerCase()) }));
