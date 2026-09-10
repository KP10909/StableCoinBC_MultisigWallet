"use client";
import { formatUnits } from "viem";

import { short, explorer, type Asset } from "../../lib/workspace";
import { useWorkspace } from "./workspace-provider";

export function AssetList({
  assets: assetsProp,
  selectedIndex,
}: {
  assets?: Asset[];
  selectedIndex?: number;
}) {
  const { assets: contextAssets, loading } = useWorkspace();
  const assets = assetsProp ?? contextAssets;
  return (
    <>
      <div className="asset-head">
        <span>자산</span>
        <span>잔고</span>
      </div>
      {assets.map((a, i) => (
        <div
          className={`asset-row${selectedIndex === i ? " balance-selected" : ""}`}
          key={a.address ?? "native"}
        >
          <span className={`coin coin-${i}`}>{a.symbol.slice(0, 1)}</span>
          <div className="asset-name">
            <strong>{a.symbol}</strong>
            {a.address ? (
              <a
                href={`${explorer}/address/${a.address}`}
                target="_blank"
                rel="noreferrer"
              >
                {short(a.address)} ↗
              </a>
            ) : (
              <small>Native coin</small>
            )}
          </div>
          <div className="asset-balance">
            {a.balance !== undefined ? (
              formatUnits(a.balance, a.decimals!)
            ) : a.error ? (
              <span title={a.error}>조회 실패</span>
            ) : loading ? (
              "조회 중…"
            ) : (
              "—"
            )}
            <small>{a.symbol}</small>
          </div>
        </div>
      ))}
    </>
  );
}
