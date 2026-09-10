"use client";
import { formatUnits } from "viem";
import { useWorkspace } from "./workspace-provider";
export function TreasuryStats() {
  const { assets, count } = useWorkspace();
  return (
    <div className="stats">
      <div>
        <span>
          네이티브 코인 잔고 <span className="tiny-badge">KRW</span>
        </span>
        <strong>
          {assets[0].balance !== undefined
            ? formatUnits(assets[0].balance, 18)
            : "—"}{" "}
          <small>KRW</small>
        </strong>
        <p>멀티시그 컨트랙트 보유량</p>
      </div>
      <div>
        <span>조회 대상 토큰</span>
        <strong>
          6 <small>Tokens</small>
        </strong>
        <p>
          {assets.slice(1).filter((a) => a.balance !== undefined).length}개 조회
          완료 · ERC-20
        </p>
      </div>
      <div>
        <span>전체 트랜잭션 제출</span>
        <strong>
          {count?.toString() ?? "—"} <small>Transactions</small>
        </strong>
        <p>최근 20개 제안의 승인 상태 확인</p>
      </div>
    </div>
  );
}
