import { test } from "node:test";
import assert from "node:assert/strict";
import { argument } from "../lib/contract.ts";
import { encodeFunctionData, decodeFunctionData } from "viem";
import fs from "node:fs";
const abi = JSON.parse(
  fs.readFileSync(new URL("../lib/multisig.json", import.meta.url)),
);
test("uint256 values retain exact precision", () => {
  assert.equal(
    argument({ type: "uint256" }, "1000000000000000001"),
    1000000000000000001n,
  );
  assert.throws(() => argument({ type: "uint256" }, 1e20));
  assert.throws(() => argument({ type: "uint256" }, "1.3"));
});
test("boolean false is not coerced to true", () => {
  assert.equal(argument({ type: "bool" }, "false"), false);
  assert.throws(() => argument({ type: "bool" }, "yes"));
});
test("nested tuple and fixed array conversion validates shape", () => {
  assert.deepEqual(
    argument(
      { type: "tuple", components: [{ type: "uint256[2]" }, { type: "bool" }] },
      '[["1","2"],false]',
    ),
    [[1n, 2n], false],
  );
  assert.throws(() => argument({ type: "uint256[2]" }, "[1]"));
});
test("provided multisig ABI encodes proposal and uint256 index", () => {
  const args = [
    "0x0000000000000000000000000000000000000001",
    1000000000000000001n,
    "0x",
  ];
  const data = encodeFunctionData({
    abi,
    functionName: "submitTransaction",
    args,
  });
  assert.deepEqual(decodeFunctionData({ abi, data }).args, args);
  const confirm = encodeFunctionData({
    abi,
    functionName: "confirmTransaction",
    args: [42n],
  });
  assert.deepEqual(decodeFunctionData({ abi, data: confirm }).args, [42n]);
});
