import { getAddress, parseUnits, encodeFunctionData, erc20Abi } from "viem";
import type { Asset } from "./workspace";
export function buildTransferArgs(
  asset: Asset,
  recipient: string,
  amount: string,
) {
  const to = getAddress(recipient);
  if (asset.decimals === undefined || asset.balance === undefined)
    throw new Error("자산 잔고 조회를 먼저 완료하세요.");
  if (
    !/^\d+(\.\d+)?$/.test(amount) ||
    (amount.split(".")[1]?.length ?? 0) > asset.decimals
  )
    throw new Error("수량과 소수점 자릿수를 확인하세요.");
  const value = parseUnits(amount, asset.decimals);
  if (value <= 0n || value > asset.balance)
    throw new Error("수량은 0보다 크고 잔고 이하여야 합니다.");
  return asset.address
    ? [
        asset.address,
        0n,
        encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [to, value],
        }),
      ]
    : [to, value, "0x"];
}
