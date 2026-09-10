"use client";
import { ArrowUpRight } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { AssetList } from "./asset-list";
export function AssetPanel() {
  const { assets, setTab } = useWorkspace();
  return (
    <section className="panel assets">
      <div className="section-title">
        <h2>
          <span className="section-number">01 /</span> 멀티시그 보유자산{" "}
        </h2>
        <button className="text-button" onClick={() => setTab("submit")}>
          트랜잭션 제출 <ArrowUpRight size={16} />
        </button>
      </div>
      <AssetList />
    </section>
  );
}
