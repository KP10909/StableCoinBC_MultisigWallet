"use client";

import { X } from "lucide-react";
import { chain } from "../../lib/config";

import { useWorkspace } from "./workspace-provider";

export function WorkspaceAlerts() {
  const {
    account,
    walletChain,
    owners,
    loading,
    error,
    setError,
    notice,
    setNotice,
    owner,
    switchNetwork,
  } = useWorkspace();
  return (
    <>
      {" "}
      {error && (
        <div role="alert" className="alert error">
          {error}
          <button aria-label="오류 닫기" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {notice && (
        <div role="status" className="alert">
          {notice}
          <button aria-label="알림 닫기" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {account && walletChain !== chain.id && (
        <div className="alert">
          연결 지갑의 네트워크가 다릅니다.
          <button className="button" onClick={() => void switchNetwork()}>
            KCP Testnet 전환
          </button>
        </div>
      )}
      {account && !loading && owners.length > 0 && !owner && (
        <div className="alert">
          연결 계정은 이 멀티시그의 소유자가 아닙니다. 조회만 가능합니다.
        </div>
      )}
    </>
  );
}
