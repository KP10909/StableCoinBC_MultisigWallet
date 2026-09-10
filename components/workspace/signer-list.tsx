"use client";

import { Check } from "lucide-react";

import { short, explorer } from "../../lib/workspace";
import { useWorkspace } from "./workspace-provider";

export function SignerList() {
  const { account, owners, owner } = useWorkspace();
  return (
    <section className="panel owners">
      <div className="section-title">
        <h2>서명자</h2>
        <span className="tiny-badge">{owners.length} OWNERS</span>
      </div>
      {owners.length ? (
        owners.map((o, i) => (
          <div
            className={`owner${o.toLowerCase() === account?.toLowerCase() ? " owner-self" : ""}`}
            key={o}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            <a
              href={`${explorer}/address/${o}`}
              target="_blank"
              rel="noreferrer"
            >
              {short(o)}
            </a>
            {o.toLowerCase() === account?.toLowerCase() && (
              <span className="self-badge">
                <Check size={11} strokeWidth={3} />내 지갑
              </span>
            )}
          </div>
        ))
      ) : (
        <p>네트워크 조회 후 표시됩니다.</p>
      )}
    </section>
  );
}
