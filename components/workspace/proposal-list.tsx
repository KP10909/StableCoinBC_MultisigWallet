"use client";
import { Check, Plus } from "lucide-react";

import { ProposalCard } from "./proposal-card";
import { useWorkspace } from "./workspace-provider";

export function ProposalList() {
  const { assets, setTab, required, proposals, count, loading } =
    useWorkspace();
  return (
    <section className="panel proposals">
      <div className="section-title">
        <h2>
          <span className="section-number">02 /</span> 최근 트랜잭션 제출
        </h2>
        <button className="text-button" onClick={() => setTab("submit")}>
          <Plus size={16} /> 새 제안
        </button>
      </div>
      {!proposals.length && (
        <div className="empty">
          {loading
            ? "제안을 불러오는 중입니다…"
            : count === 0n
              ? "아직 등록된 트랜잭션 제출이 없습니다."
              : "조회된 제안이 없습니다."}
        </div>
      )}
      {proposals.map((p) => (
        <ProposalCard
          key={String(p.id)}
          proposal={p}
          assets={assets}
          required={required}
          actions={
            p.executed ? (
              <span className="success">
                <Check size={14} /> 실행 완료
              </span>
            ) : required !== undefined && p.confirmations >= required ? (
              <span className="muted">실행 대기 (Execution 탭)</span>
            ) : (
              <span className="muted">승인 대기 (Confirm 탭)</span>
            )
          }
        />
      ))}
    </section>
  );
}
