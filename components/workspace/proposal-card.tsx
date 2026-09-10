"use client";
import type { ReactNode } from "react";
import { formatUnits } from "viem";

import { describeProposalCall } from "../../lib/contract";
import { short, explorer, type Asset, type Proposal } from "../../lib/workspace";

export function ProposalCard({
  proposal: p,
  assets,
  required,
  actions,
}: {
  proposal: Proposal;
  assets: Asset[];
  required?: bigint;
  actions?: ReactNode;
}) {
  const isNative = p.data === "0x";
  const call = isNative ? null : describeProposalCall(p.to, p.data, assets);
  const detailRows = isNative
    ? [{ label: "수량", value: `${formatUnits(p.value, 18)} KRW` }]
    : (call?.rows ?? []);
  return (
    <div className="proposal">
      <div>
        <strong>
          #{String(p.id)} · {isNative ? "코인 전송" : (call?.title ?? "컨트랙트 호출")}
        </strong>
        <div className="proposal-meta">
          <span className="proposal-meta-label">
            {isNative ? "받는 주소" : "호출 컨트랙트"}
          </span>
          <a
            href={`${explorer}/address/${p.to}`}
            target="_blank"
            rel="noreferrer"
          >
            {p.to}
          </a>
        </div>
        {p.submitTxHash && (
          <div className="proposal-meta">
            <span className="proposal-meta-label">제출 TX</span>
            <a
              href={`${explorer}/tx/${p.submitTxHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {p.submitTxHash}
            </a>
          </div>
        )}
        <details>
          <summary>자세히보기</summary>
          {detailRows.length > 0 && (
            <div className="proposal-detail">
              {detailRows.map((row) => (
                <div key={row.label}>
                  <b>{row.label}</b> {row.value}
                </div>
              ))}
            </div>
          )}
          {p.confirmTxs.length > 0 && (
            <div className="proposal-detail">
              <b>승인 내역</b>
              {p.confirmTxs.map((c) => (
                <div key={c.hash}>
                  {short(c.owner)} ·{" "}
                  <a
                    href={`${explorer}/tx/${c.hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {short(c.hash)}
                  </a>
                </div>
              ))}
            </div>
          )}
          <div className="proposal-detail">
            <b>Calldata</b>
            <code>{p.data}</code>
          </div>
        </details>
      </div>
      <div className="proposal-actions">
        {(isNative || call?.amount) && (
          <span className="proposal-value">
            {isNative ? `${formatUnits(p.value, 18)} KRW` : call?.amount}
          </span>
        )}
        <span className="proposal-confirms">
          승인 {String(p.confirmations)} / {String(required ?? "—")}
        </span>
        {actions}
      </div>
    </div>
  );
}
