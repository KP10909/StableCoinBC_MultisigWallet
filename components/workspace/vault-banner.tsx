"use client";

import { ExternalLink, Copy } from "lucide-react";
import { multisig } from "../../lib/config";

import { explorer } from "../../lib/workspace";
import { useWorkspace } from "./workspace-provider";

export function VaultBanner() {
  const { owners, required, setError, setNotice } = useWorkspace();
  return (
    <section className="vault-card">
      <div className="vault-identity">
        <span className="pill">
          KCP TESTNET <span>· 56357</span>
        </span>
        <h2>
          Treasury<span className="hero-slash">/</span>
          <br />
          Multisig<span className="hero-period">.</span>
        </h2>
        <div className="address">
          <a
            href={`${explorer}/address/${multisig}`}
            target="_blank"
            rel="noreferrer"
          >
            {multisig}
          </a>
          <button
            aria-label="컨트랙트 주소 복사"
            onClick={() =>
              navigator.clipboard
                .writeText(multisig)
                .then(() => setNotice("주소를 복사했습니다."))
                .catch(() => setError("주소를 복사할 수 없습니다."))
            }
          >
            <Copy size={14} />
          </button>
          <ExternalLink size={14} />
        </div>
      </div>
      <div className="vault-policy">
        <span className="policy-label">SIGNATURE QUORUM</span>
        <div className="quorum-marks" aria-hidden="true">
          {Array.from({ length: owners.length || 3 }, (_, i) => (
            <i
              key={i}
              className={
                required !== undefined && BigInt(i) < required ? "filled" : ""
              }
            />
          ))}
        </div>
        <span>서명 정책</span>
        <strong>
          {required?.toString() ?? "—"} <em>/ {owners.length || "—"}</em>
        </strong>
        <small>승인 필요 / 전체 서명자</small>
      </div>
      <span className="vault-serial" aria-hidden="true">
        KCP—56357 / MULTISIG ACCOUNT
      </span>
    </section>
  );
}
