"use client";

import { ShieldCheck, ArrowUpRight, Usb, ScanLine } from "lucide-react";

import { useWorkspace } from "./workspace-provider";

export function HardwareGuide() {
  const { setShowWallets } = useWorkspace();
  return (
    <section className="panel signing">
      <span className="subtle-icon">
        <ShieldCheck size={22} />
      </span>
      <span className="section-kicker">OFFLINE KEYS. ONLINE CONTROL.</span>
      <h2>
        키는 오프라인.
        <br />
        관리는 여기서.
      </h2>
      <p>
        브라우저 지갑에 하드웨어 계정을 연결한 후, 기기에서 직접 서명하세요.
      </p>
      <div className="device">
        <ScanLine size={21} />
        <div>
          <strong>Keystone 3 Pro</strong>
          <small>지갑의 QR 코드로 서명</small>
        </div>
        <span className="device-tag">QR</span>
      </div>
      <div className="device">
        <Usb size={21} />
        <div>
          <strong>Ledger Flex</strong>
          <small>MetaMask 연결 후 기기에서 승인</small>
        </div>
        <span className="device-tag">USB</span>
      </div>
      <button className="button full" onClick={() => setShowWallets(true)}>
        브라우저 지갑 연결 <ArrowUpRight size={16} />
      </button>
      <small className="footnote">
        QR 표시는 연결 지갑의 하드웨어 계정 지원에 따릅니다.
      </small>
    </section>
  );
}
