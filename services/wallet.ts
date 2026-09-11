import { getAddress } from "viem";
import type { Provider } from "../lib/workspace";

function unsupported(error: unknown) {
  const e = error as { code?: number; cause?: { code?: number } };
  const code = e.code ?? e.cause?.code;
  return code === 4200 || code === -32601;
}

export async function requestWalletAccount(
  provider: Provider,
  walletId?: string,
) {
  let permissionsReset = false;
  // OKX may keep the site's original account even after a new permission request.
  // Complete revocation before requesting access again, never in the background.
  if (walletId === "okx") {
    try {
      await provider.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
      permissionsReset = true;
    } catch (error) {
      if (!unsupported(error)) throw error;
    }
  }
  try {
    await provider.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
  } catch (error) {
    if (!unsupported(error)) throw error;
  }
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts[0]) throw new Error("지갑에서 연결할 계정을 선택하세요.");
  const chainId = await provider.request({ method: "eth_chainId" });
  return {
    account: getAddress(accounts[0]),
    chainId: Number(chainId),
    permissionsReset,
  };
}
