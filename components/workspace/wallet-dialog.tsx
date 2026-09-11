"use client";

import { ArrowUpRight, Wallet, X } from "lucide-react";

import { useWorkspace } from "./workspace-provider";

export function WalletDialog() {
  const {
    connecting,
    busy,
    wallets,
    error,
    account,
    showWallets,
    setShowWallets,
    connect,
    disconnect,
  } = useWorkspace();
  return (
    <>
      {" "}
      {showWallets && (
        <div className="modal-backdrop" onClick={() => setShowWallets(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-title"
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="닫기"
              onClick={() => setShowWallets(false)}
            >
              <X size={20} />
            </button>
            <span className="subtle-icon">
              <Wallet size={24} />
            </span>
            <h2 id="wallet-title">서명 지갑 연결</h2>
            <p>
              Keystone 또는 Ledger의 하드웨어 계정을 브라우저 지갑에서 먼저
              선택하세요.
            </p>
            {error && <p role="alert">{error}</p>}
            {account && (
              <p>
                현재 사이트에 허용된 계정
                <br />
                <code style={{ overflowWrap: "anywhere" }}>{account}</code>
              </p>
            )}
            {wallets.map((w, i) => (
              <button
                className="wallet-option"
                disabled={connecting || busy}
                key={`${w.id}-${i}`}
                onClick={() => void connect(w)}
              >
                <Wallet size={20} />
                {w.name}
                <ArrowUpRight size={18} />
              </button>
            ))}
            {!wallets.length && (
              <div className="alert">
                브라우저 지갑을 찾지 못했습니다. MetaMask 또는 OKX 확장
                프로그램을 설치하고 페이지를 새로고침하세요.
              </div>
            )}
            {account && (
              <button className="button full" onClick={disconnect}>
                페이지 연결 해제
              </button>
            )}
            <small>
              앱은 연결 계정이 하드웨어 계정인지 자동으로 판별할 수 없습니다.
            </small>
          </section>
        </div>
      )}
    </>
  );
}
