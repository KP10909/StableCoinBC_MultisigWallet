"use client";

import {
  ShieldCheck,
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  PlayCircle,
  Code2,
  Settings,
} from "lucide-react";

import { useWorkspace } from "./workspace-provider";

export function Sidebar() {
  const { tab, setTab, wallet } = useWorkspace();
  return (
    <aside className="sidebar">
      <a className="brand" href="/">
        <span className="brand-icon">
          <ShieldCheck size={24} />
        </span>
        vault<span className="brand-dot">.</span>
      </a>
      <div className="workspace">
        <span className="workspace-icon">K</span>
        <div>
          KCP Workspace<small>Multisig wallet</small>
        </div>
        <span className="chevron">⌄</span>
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav>
        {[
          ["overview", "대시보드", LayoutDashboard],
          ["deposit", "Transfer", ArrowDownToLine],
          ["submit", "Submit", ArrowUpRight],
          ["confirm", "Confirm", CheckCircle2],
          ["execute", "Execution", PlayCircle],
          ["contract", "조회", Code2],
          ["settings", "네트워크 설정", Settings],
        ].map(([id, label, Icon]) => (
          <button
            key={String(id)}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(String(id))}
          >
            {typeof Icon !== "string" && <Icon size={18} />}
            <span>{String(label)}</span>
            {tab === id && <i />}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <ShieldCheck size={20} />
        <strong>Your keys. Your control.</strong>
        <p>
          키는 콜드월렛에 보관하고,
          <br />
          서명은 안전하게 연결하세요.
        </p>
        <span className="testnet">● &nbsp; TESTNET ENVIRONMENT</span>
      </div>
    </aside>
  );
}
