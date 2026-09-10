import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Vault · Multisig Workspace",
  description: "콜드월렛으로 연결하는 멀티시그 컨트랙트 워크스페이스",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
