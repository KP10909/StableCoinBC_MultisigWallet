"use client";
import { formatUnits } from "viem";

import { useCustodyRatio } from "../../hooks/use-custody-ratio";
import { coldWallets, hotWallet } from "../../lib/config";
import { explorer } from "../../lib/workspace";

const TARGET_HOT_PCT = 20; // policy target: Hot 20% / Cold 80%
const REBALANCE_THRESHOLD = 10; // percentage points off target

export function CustodyRatio() {
  const { hot, cold, loading, updatedAt } = useCustodyRatio();
  const rows = hot
    .map((hotAsset, i) => {
      const coldAsset = cold[i];
      const decimals = hotAsset.decimals ?? coldAsset?.decimals;
      const hotNum =
        hotAsset.balance !== undefined && decimals !== undefined
          ? Number(formatUnits(hotAsset.balance, decimals))
          : 0;
      const coldNum =
        coldAsset?.balance !== undefined && decimals !== undefined
          ? Number(formatUnits(coldAsset.balance, decimals))
          : 0;
      const total = hotNum + coldNum;
      const hotPct = total > 0 ? (hotNum / total) * 100 : 0;
      const needsRebalance = Math.abs(hotPct - TARGET_HOT_PCT) > REBALANCE_THRESHOLD;
      return {
        symbol: hotAsset.symbol,
        decimals,
        hotNum,
        coldNum,
        total,
        hotPct,
        needsRebalance,
      };
    })
    .filter((row) => row.total > 0);
  return (
    <section className="panel custody-ratio">
      <div className="section-title">
        <h2>
          <span className="section-number">00 /</span> Hot / Cold 자산 비율
        </h2>
        <span className="tiny-badge custody-updated">
          {loading
            ? "갱신 중…"
            : updatedAt
              ? `${updatedAt.toLocaleTimeString("ko-KR")} 기준 · 90초마다 갱신`
              : "대기 중"}
        </span>
      </div>
      <p className="custody-target-note">
        목표 비율 Hot {TARGET_HOT_PCT}% · Cold {100 - TARGET_HOT_PCT}%
      </p>
      <div className="custody-rows">
        {!rows.length && <div className="empty">잔고가 있는 자산이 없습니다.</div>}
        {rows.map((row) => (
          <div className="custody-row" key={row.symbol}>
            <div className="custody-symbol">
              {row.symbol}
              {row.needsRebalance && (
                <span className="custody-rebalance-badge">리밸런싱 필요</span>
              )}
            </div>
            <div className="custody-body">
              <div className="custody-pct-big">
                <span className="custody-pct-value custody-pct-hot">
                  <span className="custody-pct-label">Hot</span>{" "}
                  {row.hotPct.toFixed(1)}%
                </span>
                <span className="custody-pct-value custody-pct-cold">
                  <span className="custody-pct-label">Cold</span>{" "}
                  {(100 - row.hotPct).toFixed(1)}%
                </span>
              </div>
              <div className="custody-bar">
                <div className="custody-bar-fill">
                  <div
                    className="custody-bar-hot"
                    style={{ width: `${row.hotPct}%` }}
                  />
                  <div
                    className="custody-bar-cold"
                    style={{ width: `${100 - row.hotPct}%` }}
                  />
                </div>
                <div
                  className="custody-bar-target"
                  style={{ left: `${TARGET_HOT_PCT}%` }}
                />
              </div>
              <div className="custody-amounts">
                <span>
                  Hot{" "}
                  {row.hotNum.toLocaleString("ko-KR", {
                    maximumFractionDigits: 4,
                  })}{" "}
                  {row.symbol}
                </span>
                <span>
                  Cold{" "}
                  {row.coldNum.toLocaleString("ko-KR", {
                    maximumFractionDigits: 4,
                  })}{" "}
                  {row.symbol}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="custody-sources">
        <div>
          <span className="custody-meta-label">Hot 지갑</span>
          <a href={`${explorer}/address/${hotWallet}`} target="_blank" rel="noreferrer">
            {hotWallet}
          </a>
        </div>
        <div>
          <span className="custody-meta-label">
            Cold 지갑 (합산 {coldWallets.length}개)
          </span>
          {coldWallets.map((addr) => (
            <a
              key={addr}
              href={`${explorer}/address/${addr}`}
              target="_blank"
              rel="noreferrer"
            >
              {addr}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
