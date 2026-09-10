# KCP Multisig Workspace

Next.js App Router / React / TypeScript / viem 기반 KCP 테스트넷 멀티시그 관리 화면입니다.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 열 수 있습니다. 입력 변환 및 ABI 테스트는 `npm test` (Node.js 22.18 이상), 프로덕션 검증은 `npm run typecheck && npm run build`, 실행은 `npm start`입니다.

## 기본 배포 설정

- 체인: KCP Testnet / 56357 / KRW (18 decimals 가정)
- RPC: https://subnets.avax.network/monthlygol/testnet/rpc
- 멀티시그: `0x798Fd853bdfaFB64b4F560d59CE42fA037A53D5c`
- 탐색기: https://explorer-test.avax.network/monthlygol
- 설정과 토큰 주소: `lib/config.ts`
- 사용자 제공 ABI: `lib/multisig.json`

ERC-20 잔고, 심볼, decimals를 온체인 조회합니다. 심볼 조회 실패 시 설정된 온체인 확인 심볼을 표시합니다. 금액은 bigint로 처리합니다. RPC는 브라우저 CORS를 허용해야 합니다. 설정 화면의 RPC 변경은 현재 탭 메모리에만 유지됩니다.

## 사용 순서

1. MetaMask 또는 OKX에 **하드웨어 계정**을 연결하고 이 페이지에서 지갑 연결합니다. EIP-6963 탐색 및 legacy injected provider를 지원합니다.
2. 지갑을 KCP Testnet으로 전환합니다. 미등록 체인은 추가할 수 있습니다.
3. 전송 제안에서 코인/토큰, 받는 주소, 수량을 입력하고 검토 후 서명합니다. 토큰 전송은 ERC-20 transfer calldata를 생성하여 submitTransaction에 전달합니다.
4. 소유자가 제안을 승인합니다. 필요한 승인 수를 충족하면 실행합니다. 등록, 승인, 실제 실행은 각각 별도의 온체인 TX입니다. submitTransaction이 자동 승인하는지는 배포된 구현에 따르며 화면은 온체인 결과를 사용합니다.
5. 전송 직후 TX 해시 및 탐색기 링크가 나타나며 receipt 결과로 상태가 갱신됩니다. 해시 이력은 현재 페이지 세션에만 보관됩니다.

최근 20개 제안이 표시됩니다. 이전 제안은 컨트랙트 탭에서 getTransaction / isConfirmed 조회 및 confirmTransaction / executeTransaction 호출로 관리할 수 있습니다. 모든 쓰기는 실행 시뮬레이션을 통과한 후 연결 지갑에 요청합니다.

## 하드웨어 서명

- **Keystone 3 Pro**: MetaMask의 QR 기반 하드웨어 계정 연결을 사용합니다. 트랜잭션 요청 시 QR은 브라우저 지갑에서 표시하고, Keystone으로 스캔·서명한 결과를 지갑에서 읽습니다. 페이지 자체에서 UR QR을 생성하거나 스캔하지 않습니다.
- **Ledger Flex**: MetaMask의 Ledger 하드웨어 계정으로 연결하고 장치에서 확인합니다. 데스크톱에서는 지원되는 USB 연결을 사용하며 QR 서명 방식이 아닙니다.
- **OKX**: injected provider 연결을 지원합니다. Keystone/Ledger 및 연결 방식 지원은 설치된 지갑 버전에서 확인해야 합니다.

앱은 EIP-1193 계정이 하드웨어 계정인지 판별할 수 없습니다. 하드웨어 연결은 지갑에서 설정해야 하며 시드/개인키는 앱에서 취급하지 않습니다. 가스비는 연결 서명자 계정의 KRW로 지불합니다. 실제 자산 이동은 executeTransaction에서 발생합니다.

참고: [MetaMask 하드웨어 지갑](https://support.metamask.io/more-web3/wallets/hardware-wallet-hub/), [Keystone 연결](https://support.keyst.one/3rd-party-wallets/eth-and-web3-wallets-keystone/bind-metamask-with-keystone), [viem writeContract](https://viem.sh/docs/contract/writeContract).

## 코드 구조

- `app/(workspace)/`: URL별 페이지와 공유 레이아웃. 페이지에서 여러 UI 컴포넌트를 직접 조합합니다. 대시보드는 배너·통계·자산·기기 안내·서명자·제안 목록, 전송 페이지는 폼·잔고 패널, 컨트랙트 페이지는 입력 폼·실행 검토·조회 결과·ABI로 구성됩니다.
- `components/workspace/`: Sidebar, VaultBanner, AssetList, SignerList, TransferForm, ContractPanel, WalletDialog 등 화면 단위 컴포넌트.
- `components/workspace/workspace-provider.tsx`: 페이지 이동에도 지갑 연결·RPC·입력값·TX 이력을 유지하는 공유 상태 Provider.
- `hooks/use-workspace.ts`: 지갑 탐색·연결, 공유 UI 상태와 서비스 호출 결과·진행 알림 관리. 컨트랙트 RPC 구현은 포함하지 않습니다.
- `lib/workspace.ts`: 공통 타입과 표시용 유틸리티. 체인 설정·ABI·인자 변환은 기존 lib 파일에서 관리합니다.
- `styles/`: 공통 토큰과 기본 요소(base), 레이아웃(shell), 자산(assets), 서명자(signers), 전송(transfer), 폼(forms), 지갑 창(wallet-dialog) 등 영역별 CSS. 반응형 규칙은 responsive.css에 있습니다.
- `app/globals.css`: 스타일 파일을 순서대로 불러오는 진입점. 반응형 규칙을 마지막에 적용합니다.

`npm run format`으로 코드와 CSS를 정리하고 `npm run format:check`로 형식을 확인합니다.

### 컨트랙트 호출 계층

- `services/multisig.ts`: React에 의존하지 않는 컨트랙트 서비스. 클라이언트 생성, 잔고·소유자·승인 수·제안 조회, ABI 조회 호출, 계정·체인 검증, 쓰기 시뮬레이션·서명 요청, receipt 대기를 담당합니다.
- `lib/transfer.ts`: 전송 수량 검증과 코인/ERC-20 제안 인자 생성.
- `ContractForm`은 `readInterface`를 직접 가져와 조회합니다. 여러 화면에서 사용하는 쓰기 진행 상태·TX 이력은 공유 hook에서 서비스 호출과 연결합니다.
- 페이지 파일에는 RPC 호출과 상태 관리 없이 컴포넌트 조합만 둡니다.

### 개발 서버와 브라우저 검사

개발 중에는 `npm run dev`를 사용합니다. `next.config.ts`의 `allowedDevOrigins`는 `localhost`와 `127.0.0.1`의 개발 리소스·HMR 접근을 허용합니다. 두 주소로 접근할 때 WebSocket이 차단되는 것을 방지합니다.

개발 서버를 3000 포트에서 실행한 상태에서 `npm run test:browser`를 실행하면 두 주소의 HMR 연결, 지갑 모달, 페이지 이동, 입력 상태 유지를 Chromium으로 검사합니다. 최초 실행 시 `npx playwright install chromium`이 필요합니다.
