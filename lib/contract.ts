import {
  type Abi,
  type AbiFunction,
  type AbiParameter,
  type Address,
  type Hex,
  parseAbi,
  decodeFunctionData,
  erc20Abi,
  formatUnits,
} from "viem";
import { abi as multisigAbi } from "./config.ts";
import type { Asset } from "./workspace";
export const exampleAbi = parseAbi([
  "function getOwners() view returns (address[])",
  "function required() view returns (uint256)",
  "function submitTransaction(address destination, uint256 value, bytes data) returns (uint256 transactionId)",
  "function confirmTransaction(uint256 transactionId)",
  "function executeTransaction(uint256 transactionId)",
]);
export function parseContractAbi(text: string): Abi {
  const value = JSON.parse(text);
  const abi = Array.isArray(value) ? value : value.abi;
  if (!Array.isArray(abi) || !abi.every((x) => x && typeof x.type === "string"))
    throw new Error("유효한 ABI 배열 또는 ABI가 포함된 JSON을 입력하세요.");
  return abi as Abi;
}
export function signature(fn: AbiFunction) {
  return `${fn.name}(${fn.inputs.map((x) => x.type).join(",")})`;
}
export function argument(param: AbiParameter, value: unknown): unknown {
  const array = param.type.match(/^(.*)\[(\d*)\]$/);
  if (array) {
    const items = typeof value === "string" ? JSON.parse(value) : value;
    if (
      !Array.isArray(items) ||
      (array[2] && items.length !== Number(array[2]))
    )
      throw new Error(`${param.name}: 배열 형식을 확인하세요.`);
    return items.map((x) =>
      argument({ ...param, type: array[1] } as AbiParameter, x),
    );
  }
  if (param.type === "tuple" && "components" in param) {
    const items = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(items) || items.length !== param.components.length)
      throw new Error("Tuple은 순서대로 JSON 배열을 입력하세요.");
    return param.components.map((p, i) => argument(p, items[i]));
  }
  if (/^u?int/.test(param.type)) {
    if (typeof value === "number" && !Number.isSafeInteger(value))
      throw new Error("큰 정수는 JSON 문자열로 입력하세요.");
    if (!/^-?\d+$/.test(String(value)))
      throw new Error("정수는 기본 단위로 입력하세요.");
    return BigInt(String(value));
  }
  if (param.type === "bool") {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    throw new Error("true 또는 false를 입력하세요.");
  }
  return value;
}
export type ProposalCallInfo = {
  title: string;
  amount?: string;
  rows: { label: string; value: string }[];
};
export function describeProposalCall(
  to: Address,
  data: Hex,
  assets: Asset[],
): ProposalCallInfo | null {
  if (data === "0x") return null;
  const asset = assets.find((a) => a.address?.toLowerCase() === to.toLowerCase());
  const decimals = asset?.decimals ?? 18;
  const symbol = asset?.symbol ?? "토큰";
  for (const candidate of [erc20Abi, multisigAbi] as const) {
    try {
      const decoded = decodeFunctionData({ abi: candidate, data });
      const args = (decoded.args ?? []) as readonly unknown[];
      if (decoded.functionName === "transfer" && args.length === 2) {
        const [recipient, value] = args as [Address, bigint];
        return {
          title: `${symbol} 전송`,
          amount: `${formatUnits(value, decimals)} ${symbol}`,
          rows: [
            { label: "받는 주소", value: recipient },
            { label: "수량", value: `${formatUnits(value, decimals)} ${symbol}` },
          ],
        };
      }
      if (decoded.functionName === "approve" && args.length === 2) {
        const [spender, value] = args as [Address, bigint];
        return {
          title: `${symbol} 사용 승인`,
          rows: [
            { label: "승인 대상", value: spender },
            {
              label: "승인 수량",
              value: `${formatUnits(value, decimals)} ${symbol}`,
            },
          ],
        };
      }
      return {
        title: `${decoded.functionName}() 호출`,
        rows: [{ label: "인자", value: pretty(args) }],
      };
    } catch {
      continue;
    }
  }
  return {
    title: "알 수 없는 호출",
    rows: [{ label: "selector", value: data.slice(0, 10) }],
  };
}
export function pretty(value: unknown) {
  return (
    JSON.stringify(
      value,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ) ?? "반환값 없음"
  );
}
