"use client";
import { useEffect, useMemo, useState } from "react";
import { createKcpClient, readBalances } from "../services/multisig";
import { chain, coldWallets, hotWallet, tokens } from "../lib/config";
import { type Asset, message } from "../lib/workspace";

const POLL_INTERVAL_MS = 90_000;
const template = () => [{ symbol: "KRW" }, ...tokens];

function toAssets(results: PromiseSettledResult<Asset>[]) {
  const base = template();
  return results.map((r, i) =>
    r.status === "fulfilled" ? r.value : { ...base[i], error: message(r.reason) },
  );
}

function sumAssets(lists: Asset[][]) {
  return template().map((base, i) => {
    let total: bigint | undefined;
    let decimals: number | undefined;
    for (const list of lists) {
      const a = list[i];
      if (a?.balance === undefined) continue;
      total = (total ?? 0n) + a.balance;
      decimals = a.decimals;
    }
    return { ...base, balance: total, decimals: decimals ?? (i === 0 ? 18 : undefined) };
  });
}

export function useCustodyRatio() {
  const client = useMemo(() => createKcpClient(chain.rpcUrls.default.http[0]), []);
  const [hot, setHot] = useState<Asset[]>(template());
  const [cold, setCold] = useState<Asset[]>(template());
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date>();

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      setLoading(true);
      try {
        const [hotResults, ...coldResultsList] = await Promise.all([
          readBalances(client, hotWallet),
          ...coldWallets.map((addr) => readBalances(client, addr)),
        ]);
        if (cancelled) return;
        setHot(toAssets(hotResults));
        setCold(sumAssets(coldResultsList.map(toAssets)));
        setUpdatedAt(new Date());
      } catch {
        // best-effort; keep showing the last good snapshot
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void poll();
    const timer = setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [client]);

  return { hot, cold, loading, updatedAt };
}
