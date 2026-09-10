import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeFunctionData, erc20Abi } from "viem";
import { buildTransferArgs } from "../lib/transfer.ts";
const recipient = "0x0000000000000000000000000000000000000001";
const token = "0x0000000000000000000000000000000000000002";
test("native transfer uses exact base units and empty calldata", () => {
  assert.deepEqual(
    buildTransferArgs(
      { symbol: "KRW", decimals: 18, balance: 2n * 10n ** 18n },
      recipient,
      "1.000000000000000001",
    ),
    [recipient, 1000000000000000001n, "0x"],
  );
});
test("ERC20 proposal targets token with zero native value", () => {
  const [to, value, data] = buildTransferArgs(
    { symbol: "USDC", address: token, decimals: 6, balance: 2000000n },
    recipient,
    "1.25",
  );
  assert.equal(to, token);
  assert.equal(value, 0n);
  assert.deepEqual(decodeFunctionData({ abi: erc20Abi, data }), {
    functionName: "transfer",
    args: [recipient, 1250000n],
  });
});
test("transfer rejects missing balance, excessive precision, and insufficient funds", () => {
  assert.throws(() => buildTransferArgs({ symbol: "USDC" }, recipient, "1"));
  const asset = { symbol: "USDC", decimals: 6, balance: 1000000n };
  for (const amount of ["0", "-1", "2", "0.0000001"])
    assert.throws(() => buildTransferArgs(asset, recipient, amount));
});
