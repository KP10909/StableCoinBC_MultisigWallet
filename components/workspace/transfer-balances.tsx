"use client";
import { Wallet, ShieldCheck } from "lucide-react";

import { useWorkspace } from "./workspace-provider";
import { AssetList } from "./asset-list";
export function TransferBalances({
  mode = "submit",
}: {
  mode?: "submit" | "deposit";
}) {
  const { account, assets, walletAssets, assetIndex, depositIndex } =
    useWorkspace();
  const selectedIndex = mode === "deposit" ? depositIndex : assetIndex;
  const isDeposit = mode === "deposit";
  return (
    <aside
      className="panel transfer-balances"
      aria-labelledby="transfer-balances-title"
    >
      <div className="section-title">
        <h2 id="transfer-balances-title">
          {isDeposit ? (
            <Wallet size={15} className="wallet-balances-icon" />
          ) : (
            <ShieldCheck size={15} className="wallet-balances-icon" />
          )}{" "}
          {isDeposit ? "내 지갑 잔고" : "멀티시그 보유 자산"}
        </h2>
        <span className="tiny-badge">KCP TESTNET</span>
      </div>
      <p className="balance-description">
        {isDeposit
          ? account
            ? "연결된 지갑의 현재 잔고"
            : "지갑을 연결하면 잔고가 표시됩니다."
          : "멀티시그 컨트랙트의 현재 잔고 · 제안 가능한 최대 수량입니다"}
      </p>
      <AssetList
        assets={isDeposit ? walletAssets : assets}
        selectedIndex={selectedIndex}
      />
      <p className="balance-caption">선택한 전송 자산을 강조해서 표시합니다.</p>
    </aside>
  );
}
