import { defineChain, getAddress, type Abi } from "viem";
import abiJson from "./multisig.json";
export const abi = abiJson as Abi;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value)
    throw new Error(`${name} is not set. Copy .env.example to .env.local and fill it in.`);
  return value;
}

export const chain = defineChain({
  id: 56357,
  name: "KCP Testnet",
  nativeCurrency: { name: "KRW", symbol: "KRW", decimals: 18 },
  rpcUrls: {
    default: { http: [requireEnv("NEXT_PUBLIC_RPC_URL")] },
  },
  blockExplorers: {
    default: {
      name: "KCP Explorer",
      url: "https://explorer-test.avax.network/monthlygol",
    },
  },
  testnet: true,
});
export const multisig = getAddress(
  requireEnv("NEXT_PUBLIC_MULTISIG_ADDRESS").toLowerCase(),
);
export const tokens = (
  JSON.parse(requireEnv("NEXT_PUBLIC_TOKENS")) as {
    symbol: string;
    address: string;
  }[]
).map((t) => ({ ...t, address: getAddress(t.address.toLowerCase()) }));
