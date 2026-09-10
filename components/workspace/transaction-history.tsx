"use client";

import { ExternalLink } from "lucide-react";

import { explorer } from "../../lib/workspace";
import { useWorkspace } from "./workspace-provider";

export function TransactionHistory() {
  const { transactions } = useWorkspace();
  return (
    <>
      {" "}
      {transactions.length > 0 && (
        <section className="panel tx-history">
          <h2>이번 세션의 트랜잭션</h2>
          {transactions.map((t) => (
            <div key={t.hash}>
              <strong>{t.label}</strong>
              <span>{t.status}</span>
              <a
                href={`${explorer}/tx/${t.hash}`}
                target="_blank"
                rel="noreferrer"
              >
                {t.hash} <ExternalLink size={13} />
              </a>
            </div>
          ))}
          <p>TX 해시는 broadcast 직후 표시됩니다. 새로고침 전 해시를 저장하세요.</p>
        </section>
      )}
    </>
  );
}
