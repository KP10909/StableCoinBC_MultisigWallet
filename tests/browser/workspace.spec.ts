import { test, expect } from "@playwright/test";

for (const host of ["127.0.0.1", "localhost"]) {
  test(`${host}: HMR connects and controls respond`, async ({ page }) => {
    const errors: string[] = [];
    const hmrMessages: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (event) => {
      if (event.type() === "error" && event.text().includes("WebSocket"))
        errors.push(event.text());
    });
    page.on("websocket", (socket) => {
      if (socket.url().includes("/_next/hmr")) {
        socket.on("framereceived", (frame) =>
          hmrMessages.push(String(frame.payload)),
        );
        socket.on("socketerror", (error) => errors.push(error));
      }
    });
    await page.goto(`http://${host}:3000/`);
    await expect.poll(() => hmrMessages.length).toBeGreaterThan(0);
    await page
      .locator("header")
      .getByRole("button", { name: "지갑 연결", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "닫기", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .locator("nav")
      .getByRole("button", { name: "전송 제안", exact: true })
      .click();
    await expect(page).toHaveURL(`http://${host}:3000/transfer`);
    await expect(
      page.getByRole("heading", { name: "전송 정보" }),
    ).toBeVisible();
    await expect(page.locator(".transfer-balances")).toBeVisible();
    await expect(page.locator(".vault-card")).toHaveCount(0);
    await page.getByPlaceholder("0.00").fill("1.25");
    await expect(page.getByPlaceholder("0.00")).toHaveValue("1.25");
    await page
      .locator("nav")
      .getByRole("button", { name: "컨트랙트", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "배포된 ABI 함수 호출" }),
    ).toBeVisible();
    await page.goBack();
    await expect(page.getByPlaceholder("0.00")).toHaveValue("1.25");
    expect(errors).toEqual([]);
  });
}
