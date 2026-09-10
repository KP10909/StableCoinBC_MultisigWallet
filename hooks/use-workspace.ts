"use client";
import {
  createKcpClient,
  assertKcpChain,
  readTreasury,
  readBalances,
  readProposals,
  prepareContractWrite,
  prepareDeposit,
  waitForReceipt,
} from "../services/multisig";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createWalletClient,
  custom,
  getAddress,
  parseUnits,
  type Address,
  type Hex,
  type AbiFunction,
} from "viem";
import { abi, chain, multisig, tokens } from "../lib/config";

const WALLET_STORAGE_KEY = "kcp-wallet-id";
const savedWalletId = () => {
  try {
    return localStorage.getItem(WALLET_STORAGE_KEY);
  } catch {
    return null;
  }
};
const saveWalletId = (id: string) => {
  try {
    localStorage.setItem(WALLET_STORAGE_KEY, id);
  } catch {
    // storage unavailable (private mode, etc.); reconnect will just require a click
  }
};
const clearWalletId = () => {
  try {
    localStorage.removeItem(WALLET_STORAGE_KEY);
  } catch {
    // ignore
  }
};

import {
  type Provider,
  type WalletOption,
  type Asset,
  type Proposal,
  type Tx,
  message,
} from "../lib/workspace";
export function useWorkspaceController() {
  const pathname = usePathname();
  const router = useRouter();
  const tab = pathname.startsWith("/")
    ? (pathname.slice(1).split("/")[0] as string) || "overview"
    : "overview";
  const setTab = (next: string) =>
    router.push(next === "overview" ? "/" : `/${next}`);
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [wallet, setWallet] = useState<WalletOption>();
  const [account, setAccount] = useState<Address>();
  const [walletChain, setWalletChain] = useState<number>();
  const [showWallets, setShowWallets] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([{ symbol: "KRW" }, ...tokens]);
  const [walletAssets, setWalletAssets] = useState<Asset[]>([
    { symbol: "KRW" },
    ...tokens,
  ]);
  const [owners, setOwners] = useState<Address[]>([]);
  const [required, setRequired] = useState<bigint>();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [count, setCount] = useState<bigint>();
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!notice || busy) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice, busy]);
  useEffect(() => {
    if (!lock.current) setNotice("");
  }, [pathname]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [rpc, setRpc] = useState<string>(chain.rpcUrls.default.http[0]);
  const [rpcDraft, setRpcDraft] = useState(rpc);
  const [assetIndex, setAssetIndex] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [review, setReview] = useState(false);
  const [reviewArgs, setReviewArgs] = useState<readonly unknown[]>([]);
  const [depositIndex, setDepositIndex] = useState(0);
  const [depositAmount, setDepositAmount] = useState("");
  const functions = useMemo(
    () => abi.filter((x): x is AbiFunction => x.type === "function"),
    [],
  );
  const [functionIndex, setFunctionIndex] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [contractReview, setContractReview] = useState(false);
  const fn = functions[functionIndex];
  const client = useMemo(() => createKcpClient(rpc), [rpc]);
  const owner =
    !!account && owners.some((o) => o.toLowerCase() === account.toLowerCase());
  const generation = useRef(0);

  useEffect(() => {
    // Use one stable identity per wallet; prefer EIP-6963 over legacy injection.
    const announcedProviders = new Set<Provider>();
    let restored = false;
    const restore = async (item: WalletOption) => {
      if (restored || item.id !== savedWalletId()) return;
      restored = true;
      try {
        const accounts = (await item.provider.request({
          method: "eth_accounts",
        })) as string[];
        if (!accounts.length) return;
        const chainId = (await item.provider.request({
          method: "eth_chainId",
        })) as string;
        setWallet(item);
        setAccount(getAddress(accounts[0]));
        setWalletChain(Number(chainId));
      } catch {
        // silent restore is best-effort; user can still connect manually
      }
    };
    const add = (item: WalletOption, preferred = false) => {
      setWallets((previous) => {
        const existing = previous.find((w) => w.id === item.id);
        if (existing && !preferred) return previous;
        return [...previous.filter((w) => w.id !== item.id), item].sort(
          (a, b) => a.id.localeCompare(b.id),
        );
      });
      void restore(item);
    };
    const announced = (event: Event) => {
      const d = (event as CustomEvent).detail;
      if (!d?.provider || !d?.info) return;
      announcedProviders.add(d.provider);
      const rdns = String(d.info.rdns ?? "").toLowerCase();
      if (rdns === "io.metamask")
        add({ id: "metamask", name: "MetaMask", provider: d.provider }, true);
      else if (rdns === "com.okex.wallet" || rdns === "com.okx.wallet")
        add({ id: "okx", name: "OKX Wallet", provider: d.provider }, true);
    };
    window.addEventListener("eip6963:announceProvider", announced);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    const timer = setTimeout(() => {
      type Injected = Provider & {
        isMetaMask?: boolean;
        isOkxWallet?: boolean;
        isOKExWallet?: boolean;
        isRabby?: boolean;
        isBraveWallet?: boolean;
        isCoinbaseWallet?: boolean;
      };
      const w = window as unknown as {
        ethereum?: Injected & { providers?: Injected[] };
        okxwallet?: Provider;
      };
      if (w.okxwallet)
        add({ id: "okx", name: "OKX Wallet", provider: w.okxwallet });
      for (const p of w.ethereum?.providers ??
        (w.ethereum ? [w.ethereum] : [])) {
        if (announcedProviders.has(p)) continue;
        if (p === w.okxwallet || p.isOkxWallet || p.isOKExWallet)
          add({ id: "okx", name: "OKX Wallet", provider: p });
        else if (
          p.isMetaMask &&
          !p.isRabby &&
          !p.isBraveWallet &&
          !p.isCoinbaseWallet
        )
          add({ id: "metamask", name: "MetaMask", provider: p });
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("eip6963:announceProvider", announced);
    };
  }, []); // Providers announce themselves independently of React state.

  useEffect(() => {
    if (!wallet) return;
    const accountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] ? getAddress(accounts[0]) : undefined);
      setReview(false);
      setContractReview(false);
    };
    const chainChanged = (id: string) => {
      setWalletChain(Number(id));
      setReview(false);
      setContractReview(false);
    };
    const disconnected = () => {
      setAccount(undefined);
      setWalletChain(undefined);
      clearWalletId();
    };
    wallet.provider.on("accountsChanged", accountsChanged);
    wallet.provider.on("chainChanged", chainChanged);
    wallet.provider.on("disconnect", disconnected);
    return () => {
      wallet.provider.removeListener("accountsChanged", accountsChanged);
      wallet.provider.removeListener("chainChanged", chainChanged);
      wallet.provider.removeListener("disconnect", disconnected);
    };
  }, [wallet]);

  useEffect(() => {
    if (!wallet) return;
    // Some wallets (OKX included) don't reliably emit accountsChanged, so
    // re-check the active account whenever the tab regains focus.
    const syncAccount = async () => {
      try {
        const accounts = (await wallet.provider.request({
          method: "eth_accounts",
        })) as string[];
        const next = accounts[0] ? getAddress(accounts[0]) : undefined;
        setAccount((prev) =>
          prev && next && prev.toLowerCase() === next.toLowerCase()
            ? prev
            : next,
        );
      } catch {
        // ignore; next focus event will retry
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncAccount();
    };
    window.addEventListener("focus", syncAccount);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", syncAccount);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [wallet]);

  const toAssets = (results: PromiseSettledResult<Asset>[]) =>
    results.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : { ...[{ symbol: "KRW" }, ...tokens][i], error: message(r.reason) },
    );
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError("");
    setReview(false);
    setContractReview(false);
    setAssets([{ symbol: "KRW" }, ...tokens]);
    setOwners([]);
    setRequired(undefined);
    setProposals([]);
    setCount(undefined);
    try {
      await assertKcpChain(client);
      const [[assetResults, contractResults], walletResults] =
        await Promise.all([
          readTreasury(client),
          account ? readBalances(client, account) : Promise.resolve(null),
        ]);
      if (current !== generation.current) return;
      setAssets(toAssets(assetResults));
      setWalletAssets(
        walletResults ? toAssets(walletResults) : [{ symbol: "KRW" }, ...tokens],
      );
      const failed = contractResults.find((r) => r.status === "rejected");
      if (failed?.status === "rejected") throw failed.reason;
      const [o, r, c] = contractResults.map((r) =>
        r.status === "fulfilled" ? r.value : undefined,
      ) as [Address[], bigint, bigint];
      setOwners(o);
      setRequired(r);
      setCount(c);
      const rows = await readProposals(client, c, account);
      if (current === generation.current) setProposals(rows);
    } catch (e) {
      if (current === generation.current) setError(`조회 실패: ${message(e)}`);
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [client, account]);
  useEffect(() => {
    void refresh();
    return () => {
      generation.current++;
    };
  }, [refresh]);

  async function connect(option: WalletOption) {
    try {
      setError("");
      const wc = createWalletClient({ transport: custom(option.provider) });
      const [address] = await wc.requestAddresses();
      setWallet(option);
      setAccount(address);
      setWalletChain(await wc.getChainId());
      setShowWallets(false);
      saveWalletId(option.id);
    } catch (e) {
      setError(message(e));
    }
  }
  function disconnect() {
    setAccount(undefined);
    setWallet(undefined);
    setWalletChain(undefined);
    setShowWallets(false);
    clearWalletId();
  }
  async function switchNetwork() {
    if (!wallet) return;
    try {
      const wc = createWalletClient({ transport: custom(wallet.provider) });
      try {
        await wc.switchChain({ id: chain.id });
      } catch (e) {
        const code = e as { code?: number; cause?: { code?: number } };
        if (code.code !== 4902 && code.cause?.code !== 4902) throw e;
        await wc.addChain({
          chain: { ...chain, rpcUrls: { default: { http: [rpc] } } },
        });
        await wc.switchChain({ id: chain.id });
      }
      setWalletChain(await wc.getChainId());
    } catch (e) {
      setError(message(e));
    }
  }
  async function write(
    functionName: string,
    args: readonly unknown[],
    label: string,
  ) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("연결 상태와 컨트랙트 실행 가능 여부 확인 중…");
    let submitted: Hex | undefined;
    let cancelled = false;
    try {
      if (!wallet || !account)
        throw new Error("서명할 브라우저 지갑을 연결하세요.");
      const send = await prepareContractWrite(
        client,
        wallet.provider,
        account,
        functionName,
        args,
      );
      setNotice(
        "지갑에서 내용을 확인하고 하드웨어 기기로 서명하세요. Keystone은 지갑의 QR 화면을 사용합니다.",
      );
      const hash = await send();
      submitted = hash;
      setTransactions((prev) => [{ hash, label, status: "확인 중" }, ...prev]);
      setNotice("네트워크에 전송했습니다. 블록 확인을 기다리는 중…");
      setReview(false);
      setContractReview(false);
      const receipt = await waitForReceipt(client, {
        hash,
        timeout: 180000,
        onReplaced: ({ transaction, reason }) => {
          cancelled = reason === "cancelled";
          submitted = transaction.hash;
          setTransactions((prev) =>
            prev.map((t) =>
              t.hash === hash ? { ...t, hash: transaction.hash } : t,
            ),
          );
        },
      });
      setTransactions((prev) =>
        prev.map((t) =>
          t.hash === submitted
            ? {
                ...t,
                status: cancelled
                  ? "취소됨"
                  : receipt.status === "success"
                    ? "완료"
                    : "실행 실패",
              }
            : t,
        ),
      );
      setNotice(
        cancelled
          ? "지갑에서 트랜잭션을 취소했습니다."
          : receipt.status === "success"
            ? `${label} 완료. 제안·승인과 실제 자산 전송은 별도 트랜잭션입니다.`
            : "트랜잭션이 되돌려졌습니다. 탐색기에서 확인하세요.",
      );
      await refresh();
    } catch (e) {
      setError(message(e));
      setNotice(
        submitted
          ? "전송된 TX의 상태 확인을 완료하지 못했습니다. 탐색기에서 확인하세요."
          : "",
      );
      if (submitted)
        setTransactions((prev) =>
          prev.map((t) =>
            t.hash === submitted ? { ...t, status: "탐색기 확인 필요" } : t,
          ),
        );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function deposit(asset: Asset, rawAmount: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("지갑에서 입금 트랜잭션을 확인하세요…");
    let submitted: Hex | undefined;
    try {
      if (!wallet || !account)
        throw new Error("서명할 브라우저 지갑을 연결하세요.");
      if (asset.decimals === undefined)
        throw new Error("자산 정보를 먼저 조회하세요.");
      if (
        !/^\d+(\.\d+)?$/.test(rawAmount) ||
        (rawAmount.split(".")[1]?.length ?? 0) > asset.decimals
      )
        throw new Error("수량과 소수점 자릿수를 확인하세요.");
      const value = parseUnits(rawAmount, asset.decimals);
      if (value <= 0n) throw new Error("수량은 0보다 커야 합니다.");
      const send = await prepareDeposit(
        client,
        wallet.provider,
        account,
        multisig,
        value,
        asset.address,
      );
      const hash = await send();
      submitted = hash;
      setTransactions((prev) => [
        { hash, label: `${asset.symbol} 입금`, status: "확인 중" },
        ...prev,
      ]);
      setNotice("네트워크에 전송했습니다. 블록 확인을 기다리는 중…");
      const receipt = await waitForReceipt(client, { hash, timeout: 180000 });
      setTransactions((prev) =>
        prev.map((t) =>
          t.hash === hash
            ? { ...t, status: receipt.status === "success" ? "완료" : "실행 실패" }
            : t,
        ),
      );
      setNotice(
        receipt.status === "success"
          ? "입금이 완료되었습니다."
          : "트랜잭션이 되돌려졌습니다. 탐색기에서 확인하세요.",
      );
      await refresh();
    } catch (e) {
      setError(message(e));
      if (submitted)
        setTransactions((prev) =>
          prev.map((t) =>
            t.hash === submitted ? { ...t, status: "탐색기 확인 필요" } : t,
          ),
        );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const canWrite = owner && walletChain === chain.id && !busy && !loading;
  const canDeposit = !!account && walletChain === chain.id && !busy && !loading;

  return {
    tab,
    setTab,
    wallets,
    wallet,
    setWallet,
    account,
    setAccount,
    walletChain,
    setWalletChain,
    showWallets,
    setShowWallets,
    assets,
    walletAssets,
    owners,
    required,
    proposals,
    count,
    loading,
    busy,
    error,
    setError,
    notice,
    setNotice,
    transactions,
    rpcDraft,
    setRpcDraft,
    setRpc,
    assetIndex,
    setAssetIndex,
    recipient,
    setRecipient,
    amount,
    setAmount,
    review,
    setReview,
    reviewArgs,
    setReviewArgs,
    depositIndex,
    setDepositIndex,
    depositAmount,
    setDepositAmount,
    deposit,
    canDeposit,
    functions,
    functionIndex,
    setFunctionIndex,
    inputs,
    setInputs,
    result,
    setResult,
    contractReview,
    setContractReview,
    fn,
    owner,
    refresh,
    connect,
    disconnect,
    switchNetwork,
    write,
    client,
    canWrite,
  };
}
