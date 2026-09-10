"use client";
import { ProposalCard } from "./proposal-card";
import { useWorkspace } from "./workspace-provider";

export function ExecutionList() {
  const { assets, required, proposals, loading, write, canWrite } =
    useWorkspace();
  const executable = proposals
    .filter(
      (p) =>
        !p.executed && required !== undefined && p.confirmations >= required,
    )
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return (
    <section className="panel proposals">
      <div className="section-title">
        <h2>실행 대기 중인 트랜잭션</h2>
      </div>
      {!executable.length && (
        <div className="empty">
          {loading
            ? "제안을 불러오는 중입니다…"
            : "실행 가능한 트랜잭션이 없습니다."}
        </div>
      )}
      {executable.map((p) => (
        <ProposalCard
          key={String(p.id)}
          proposal={p}
          assets={assets}
          required={required}
          actions={
            <button
              className="button dark"
              disabled={!canWrite}
              onClick={() =>
                void write("executeTransaction", [p.id], `제안 #${p.id} 실행`)
              }
            >
              실행
            </button>
          }
        />
      ))}
    </section>
  );
}
