"use client";
import { formatUnits } from "viem";
import { ArrowDownToLine } from "lucide-react";

import { message } from "../../lib/workspace";
import { useWorkspace } from "./workspace-provider";

export function DepositForm() {
  const {
    account,
    setShowWallets,
    assets,
    walletAssets,
    busy,
    setError,
    depositIndex,
    setDepositIndex,
    depositAmount,
    setDepositAmount,
    deposit,
    canDeposit,
  } = useWorkspace();
  return (
    <section className="panel form-panel">
      <div className="section-title">
        <h2>입금 정보</h2>
      </div>
      <p>
        연결된 지갑에서 멀티시그 컨트랙트 주소로 자산을 직접 전송합니다.
        서명자가 아니어도 누구나 입금할 수 있습니다.
      </p>
      <label>
        입금 자산
        <select
          value={depositIndex}
          disabled={busy}
          onChange={(e) => setDepositIndex(Number(e.target.value))}
        >
          {assets.map((a, i) => (
            <option key={i} value={i}>
              {a.symbol}
              {a.address ? ` · ${a.address.slice(0, 8)}…` : " · Native"}
            </option>
          ))}
        </select>
      </label>
      <label>
        수량
        <input
          placeholder="0.00"
          inputMode="decimal"
          value={depositAmount}
          disabled={busy}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
      </label>
      <p>
        사용 가능:{" "}
        {walletAssets[depositIndex].balance !== undefined
          ? formatUnits(
              walletAssets[depositIndex].balance!,
              walletAssets[depositIndex].decimals!,
            )
          : "조회 필요"}{" "}
        {walletAssets[depositIndex].symbol}
      </p>
      <button
        className="button dark"
        disabled={!canDeposit}
        onClick={() => {
          try {
            void deposit(assets[depositIndex], depositAmount).then((ok) => {
              if (ok) setDepositAmount("");
            });
          } catch (e) {
            setError(message(e));
          }
        }}
      >
        입금하기 <ArrowDownToLine size={16} />
      </button>
      {!account && (
        <button className="button" onClick={() => setShowWallets(true)}>
          지갑 연결
        </button>
      )}
    </section>
  );
}
