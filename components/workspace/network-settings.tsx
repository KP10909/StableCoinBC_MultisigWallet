"use client";

import { multisig } from "../../lib/config";

import { explorer, message } from "../../lib/workspace";
import { useWorkspace } from "./workspace-provider";

export function NetworkSettings() {
  const { busy, setError, setNotice, rpcDraft, setRpcDraft, setRpc } =
    useWorkspace();
  return (
    <>
      <h2>KCP Testnet</h2>
      <p>체인 ID 56357 · 네이티브 코인 KRW (18 decimals)</p>
      <label>
        RPC URL
        <input
          value={rpcDraft}
          onChange={(e) => setRpcDraft(e.target.value)}
          disabled={busy}
        />
      </label>
      <button
        className="button dark"
        disabled={busy}
        onClick={() => {
          try {
            const u = new URL(rpcDraft);
            if (!["http:", "https:"].includes(u.protocol))
              throw new Error("HTTP(S) RPC URL을 입력하세요.");
            setRpc(rpcDraft);
            setNotice(
              "RPC를 적용했습니다. 이 탭을 닫으면 기본 설정으로 돌아갑니다.",
            );
          } catch (e) {
            setError(message(e));
          }
        }}
      >
        RPC 적용
      </button>
      <p>
        인증키가 포함된 URL은 현재 탭의 메모리에만 유지됩니다. 브라우저에서 접근
        가능한 RPC가 필요합니다.
      </p>
      <label>
        멀티시그 주소
        <input readOnly value={multisig} />
      </label>
      <a href={explorer} target="_blank" rel="noreferrer">
        블록 탐색기 열기 ↗
      </a>
    </>
  );
}
