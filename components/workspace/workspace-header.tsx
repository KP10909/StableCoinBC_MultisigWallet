"use client";

import { Wallet } from "lucide-react";

import { short } from "../../lib/workspace";
import { useWorkspace } from "./workspace-provider";

const BREADCRUMBS: Record<string, string> = {
  overview: "대시보드",
  deposit: "Transfer",
  submit: "Submit",
  confirm: "Confirm",
  execute: "Execution",
  contract: "조회",
  settings: "네트워크 설정",
};

export function WorkspaceHeader() {
  const { tab, account, setShowWallets } = useWorkspace();
  return (
    <header>
      <div className="breadcrumb">
        Workspace <span>/</span> <b>{BREADCRUMBS[tab] ?? "대시보드"}</b>
      </div>
      <div className="header-actions">
        <span className="network">
          <i /> KCP Testnet <span>⌄</span>
        </span>
        <button className="button dark" onClick={() => setShowWallets(true)}>
          <Wallet size={16} />
          {account ? short(account) : "지갑 연결"}
        </button>
      </div>
    </header>
  );
}
