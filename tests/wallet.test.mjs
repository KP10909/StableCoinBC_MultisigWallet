import { test } from "node:test";
import assert from "node:assert/strict";
import { requestWalletAccount } from "../services/wallet.ts";
const first = "0x0000000000000000000000000000000000000001";
const second = "0x0000000000000000000000000000000000000002";
test("OKX waits for permission revocation before reconnecting a pinned account", async () => {
  let authorized = first;
  let reset = false;
  const calls = [];
  const provider = {
    async request({ method }) {
      calls.push(method);
      if (method === "wallet_revokePermissions") {
        await new Promise((r) => setTimeout(r, 20));
        reset = true;
        authorized = undefined;
        return null;
      }
      if (method === "wallet_requestPermissions") {
        if (reset) authorized = second;
        return [];
      }
      if (method === "eth_requestAccounts") return [authorized];
      if (method === "eth_chainId") return "0xdc25";
    },
  };
  const result = await requestWalletAccount(provider, "okx");
  assert.equal(result.account, second);
  assert.equal(result.permissionsReset, true);
  assert.deepEqual(calls, [
    "wallet_revokePermissions",
    "wallet_requestPermissions",
    "eth_requestAccounts",
    "eth_chainId",
  ]);
});
test("unsupported revocation is reported instead of claiming reset succeeded", async () => {
  const provider = {
    async request({ method }) {
      if (method === "wallet_revokePermissions") throw { code: 4200 };
      if (method === "wallet_requestPermissions") return [];
      if (method === "eth_requestAccounts") return [first];
      if (method === "eth_chainId") return "0xdc25";
    },
  };
  const result = await requestWalletAccount(provider, "okx");
  assert.equal(result.permissionsReset, false);
  assert.equal(result.account, first);
});
test("user rejection stops reconnect and is not silently bypassed", async () => {
  const calls = [];
  const provider = {
    async request({ method }) {
      calls.push(method);
      throw { code: 4001 };
    },
  };
  await assert.rejects(
    requestWalletAccount(provider, "okx"),
    (e) => e.code === 4001,
  );
  assert.deepEqual(calls, ["wallet_revokePermissions"]);
});
