import { test, expect } from "@playwright/test";

test("wallet changes, silent changes, and reconnect use the new account", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = {
      account: "0x0000000000000000000000000000000000000001",
      selected: "0x0000000000000000000000000000000000000001",
      requests: 0,
    };
    const listeners = new Map<string, Set<(value: unknown) => void>>();
    const provider = {
      async request({ method }: { method: string }) {
        if (method === "wallet_requestPermissions") {
          state.requests++;
          state.account = state.selected;
          return [];
        }
        if (method === "eth_accounts" || method === "eth_requestAccounts")
          return [state.account];
        if (method === "eth_chainId") return "0xdc25";
        throw { code: -32601 };
      },
      on(name: string, handler: (value: unknown) => void) {
        if (!listeners.has(name)) listeners.set(name, new Set());
        listeners.get(name)!.add(handler);
      },
      removeListener(name: string, handler: (value: unknown) => void) {
        listeners.get(name)?.delete(handler);
      },
    };
    Object.assign(window, {
      walletTest: {
        state,
        change(account: string, emit: boolean) {
          state.account = account;
          if (emit)
            listeners.get("accountsChanged")?.forEach((fn) => fn([account]));
        },
      },
    });
    window.addEventListener("eip6963:requestProvider", () =>
      window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
          detail: {
            info: { uuid: "test", name: "MetaMask", rdns: "io.metamask" },
            provider,
          },
        }),
      ),
    );
  });
  await page.goto("http://127.0.0.1:3000/");
  const header = page.locator("header button");
  await header.click();
  await page.getByRole("button", { name: "MetaMask", exact: true }).click();
  await expect(header).toContainText("000001");
  await page.evaluate(() =>
    (window as any).walletTest.change(
      "0x0000000000000000000000000000000000000002",
      true,
    ),
  );
  await expect(header).toContainText("000002");
  await page.evaluate(() =>
    (window as any).walletTest.change(
      "0x0000000000000000000000000000000000000003",
      false,
    ),
  );
  await expect(header).toContainText("000003", { timeout: 6000 });
  await header.click();
  await page
    .getByRole("button", { name: "페이지 연결 해제", exact: true })
    .click();
  await expect(header).toContainText("지갑 연결");
  await page.evaluate(() => {
    (window as any).walletTest.state.selected =
      "0x0000000000000000000000000000000000000004";
  });
  await header.click();
  await page.getByRole("button", { name: "MetaMask", exact: true }).click();
  await expect(header).toContainText("000004");
  expect(
    await page.evaluate(() => (window as any).walletTest.state.requests),
  ).toBe(2);
});
