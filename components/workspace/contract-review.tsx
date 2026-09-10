"use client";
import { multisig } from "../../lib/config";
import { argument, pretty } from "../../lib/contract";
import { message } from "../../lib/workspace";
import { useWorkspace } from "./workspace-provider";
export function ContractReview() {
  const { account, setError, contractReview, fn, inputs, write, canWrite } =
    useWorkspace();
  return (
    <>
      {" "}
      {contractReview && (
        <div className="review">
          <h3>{fn.name} 실행 확인</h3>
          <p>컨트랙트: {multisig}</p>
          <p>계정: {account} · KCP Testnet</p>
          <pre>{pretty(inputs)}</pre>
          {fn.name === "executeTransaction" && (
            <p>승인된 제안을 실행하면 멀티시그의 자산이 이동할 수 있습니다.</p>
          )}
          <button
            className="button dark"
            disabled={!canWrite}
            onClick={() => {
              try {
                void write(
                  fn.name,
                  fn.inputs.map((p, i) => argument(p, inputs[i] ?? "")),
                  fn.name,
                );
              } catch (e) {
                setError(message(e));
              }
            }}
          >
            지갑에서 서명 요청
          </button>
        </div>
      )}
    </>
  );
}
