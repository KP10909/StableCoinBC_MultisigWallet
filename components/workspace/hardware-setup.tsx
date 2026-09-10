export function HardwareSetup() {
  return (
    <div className="review">
      <h3>하드웨어 지갑 연결</h3>
      <p>
        Keystone 3 Pro: MetaMask에서 QR 기반 하드웨어 계정을 연결한 뒤 이
        페이지에서 해당 계정을 선택하세요.
      </p>
      <p>
        Ledger Flex: MetaMask에서 Ledger 하드웨어 계정을 연결하고 기기에서
        트랜잭션을 승인하세요. QR 서명 방식이 아닙니다.
      </p>
      <p>
        OKX도 브라우저 지갑 연결을 지원합니다. 하드웨어 모델별 지원 여부는
        설치한 OKX에서 확인하세요.
      </p>
    </div>
  );
}
