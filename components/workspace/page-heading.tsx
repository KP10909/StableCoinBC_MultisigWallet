"use client";

import { RefreshCw } from "lucide-react";

import { useWorkspace } from "./workspace-provider";

const HEADINGS: Record<string, string> = {
  overview: "Your treasury. Together.",
  deposit: "자산 입금",
  submit: "새로운 트랜잭션 제출",
  confirm: "트랜잭션 승인",
  execute: "트랜잭션 실행",
  contract: "컨트랙트 조회",
  settings: "네트워크 설정",
};

export function PageHeading() {
  const { tab, loading, busy, refresh } = useWorkspace();
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">COLLECTIVE CUSTODY / KCP</div>
        <h1>{HEADINGS[tab] ?? "Your treasury. Together."}</h1>
        <p>자산은 한 곳에. 권한은 함께.</p>
      </div>
      <button
        className="button"
        disabled={loading || busy}
        onClick={() => void refresh()}
      >
        <RefreshCw size={16} className={loading ? "spin" : ""} /> 새로고침
      </button>
    </div>
  );
}
