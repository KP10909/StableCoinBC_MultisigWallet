"use client";
import { formatUnits } from "viem";
import { ArrowUpRight } from "lucide-react";

import { pretty } from "../../lib/contract";
import { short, message } from "../../lib/workspace";
import { buildTransferArgs } from "../../lib/transfer";
import { useWorkspace } from "./workspace-provider";

export function TransferForm() {
  const {
    account,
    setShowWallets,
    assets,
    busy,
    setError,
    assetIndex,
    setAssetIndex,
    recipient,
    setRecipient,
    amount,
    setAmount,
    review,
    setReview,
    reviewArgs,
    setReviewArgs,
    write,
    canWrite,
  } = useWorkspace();
  const transferArgs = () =>
    buildTransferArgs(assets[assetIndex], recipient, amount);
  return (
    <section className="panel form-panel">
      <div className="section-title">
        <h2>전송 정보</h2>
        <span className="tiny-badge">01 → 02 → 03</span>
      </div>
      <p>
        제안 등록 → 소유자 승인 → 실행 순서로 진행됩니다. 등록만으로 자산이
        전송되지 않습니다.
      </p>
      <label>
        전송 자산
        <select
          value={assetIndex}
          disabled={busy}
          onChange={(e) => {
            setAssetIndex(Number(e.target.value));
            setReview(false);
          }}
        >
          {assets.map((a, i) => (
            <option key={i} value={i}>
              {a.symbol}
              {a.address ? ` · ${short(a.address)}` : " · Native"}
            </option>
          ))}
        </select>
      </label>
      <label>
        받는 주소
        <input
          placeholder="0x…"
          value={recipient}
          disabled={busy}
          onChange={(e) => {
            setRecipient(e.target.value);
            setReview(false);
          }}
        />
      </label>
      <label>
        수량
        <input
          placeholder="0.00"
          inputMode="decimal"
          value={amount}
          disabled={busy}
          onChange={(e) => {
            setAmount(e.target.value);
            setReview(false);
          }}
        />
      </label>
      <p>
        사용 가능:{" "}
        {assets[assetIndex].balance !== undefined
          ? formatUnits(
              assets[assetIndex].balance!,
              assets[assetIndex].decimals!,
            )
          : "조회 필요"}{" "}
        {assets[assetIndex].symbol}
      </p>
      {review ? (
        <div className="review">
          <h3>제안 내용을 확인하세요</h3>
          <p>
            {amount} {assets[assetIndex].symbol} → {recipient}
          </p>
          <p>호출: submitTransaction · 네트워크: KCP Testnet (56357)</p>
          <code>{pretty(reviewArgs)}</code>
          <button
            className="button dark"
            disabled={!canWrite}
            onClick={() => {
              try {
                void write(
                  "submitTransaction",
                  transferArgs(),
                  "트랜잭션 제출 등록",
                );
              } catch (e) {
                setError(message(e));
              }
            }}
          >
            지갑에서 서명 요청
          </button>
        </div>
      ) : (
        <button
          className="button dark"
          disabled={!canWrite}
          onClick={() => {
            try {
              setReviewArgs(transferArgs());
              setReview(true);
              setError("");
            } catch (e) {
              setError(message(e));
            }
          }}
        >
          트랜잭션 제출 검토 <ArrowUpRight size={16} />
        </button>
      )}
      {!account && (
        <button className="button" onClick={() => setShowWallets(true)}>
          지갑 연결
        </button>
      )}
    </section>
  );
}
