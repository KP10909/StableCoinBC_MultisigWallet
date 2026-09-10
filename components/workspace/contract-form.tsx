"use client";
import { encodeFunctionData } from "viem";
import { argument, pretty, signature } from "../../lib/contract";
import { message } from "../../lib/workspace";
import { readInterface } from "../../services/multisig";
import { useWorkspace } from "./workspace-provider";
export function ContractForm() {
  const {
    client,
    busy,
    setError,
    functions,
    functionIndex,
    setFunctionIndex,
    inputs,
    setInputs,
    setResult,
    result,
    setContractReview,
    fn,
    canWrite,
  } = useWorkspace();
  async function callContract() {
    try {
      setError("");
      const args = fn.inputs.map((p, i) => argument(p, inputs[i] ?? ""));
      if (fn.stateMutability === "view" || fn.stateMutability === "pure") {
        setResult(pretty(await readInterface(client, fn, args)));
      } else {
        encodeFunctionData({ abi: [fn], functionName: fn.name, args });
        setContractReview(true);
      }
    } catch (e) {
      setError(message(e));
    }
  }
  return (
    <>
      {" "}
      <h2>배포된 ABI 함수 호출</h2>
      <p>
        정수는 기본 단위(wei)로, 배열·tuple은 JSON 배열로 입력하세요. 큰 정수는
        JSON 안에서 문자열로 입력하세요.
      </p>
      <label>
        함수
        <select
          value={functionIndex}
          disabled={busy}
          onChange={(e) => {
            setFunctionIndex(Number(e.target.value));
            setInputs([]);
            setResult("");
            setContractReview(false);
          }}
        >
          {functions.map((f, i) => (
            <option key={i} value={i}>
              {signature(f)} · {f.stateMutability}
            </option>
          ))}
        </select>
      </label>
      {fn.inputs.map((p, i) => (
        <label key={`${functionIndex}-${i}`}>
          {p.name || `인자 ${i + 1}`} <span className="muted">{p.type}</span>
          <input
            value={inputs[i] ?? ""}
            disabled={busy}
            placeholder={p.type === "bytes" ? "0x" : p.type}
            onChange={(e) => {
              setInputs((prev) => {
                const n = [...prev];
                n[i] = e.target.value;
                return n;
              });
              setContractReview(false);
            }}
          />
        </label>
      ))}
      <button
        className="button dark"
        disabled={
          busy ||
          (!(fn.stateMutability === "view" || fn.stateMutability === "pure") &&
            !canWrite)
        }
        onClick={() => void callContract()}
      >
        {fn.stateMutability === "view" || fn.stateMutability === "pure"
          ? "조회 호출"
          : "실행 내용 검토"}
      </button>
      {result ? <pre className="result">{result}</pre> : null}
    </>
  );
}
