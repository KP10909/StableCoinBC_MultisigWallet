"use client";
import { ProposalCard } from "./proposal-card";
import { useWorkspace } from "./workspace-provider";

export function ConfirmList() {
  const { assets, required, proposals, loading, write, canWrite } =
    useWorkspace();
  const pending = proposals
    .filter((p) => !p.executed)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return (
    <section className="panel proposals">
      <div className="section-title">
        <h2>승인 대기 중인 트랜잭션</h2>
      </div>
      {!pending.length && (
        <div className="empty">
          {loading ? "제안을 불러오는 중입니다…" : "승인할 트랜잭션이 없습니다."}
        </div>
      )}
      {pending.map((p) => (
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
                void write(
                  p.confirmed ? "revokeConfirmation" : "confirmTransaction",
                  [p.id],
                  `제안 #${p.id} ${p.confirmed ? "승인 취소" : "승인"}`,
                )
              }
            >
              {p.confirmed ? "승인 취소" : "승인"}
            </button>
          }
        />
      ))}
    </section>
  );
}
