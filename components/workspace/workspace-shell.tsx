import { Sidebar } from "./sidebar";
import { WorkspaceHeader } from "./workspace-header";
import { PageHeading } from "./page-heading";
import { WorkspaceAlerts } from "./workspace-alerts";
import { TransactionHistory } from "./transaction-history";
import { WorkspaceFooter } from "./workspace-footer";
import { WalletDialog } from "./wallet-dialog";
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Sidebar />
      <main>
        <WorkspaceHeader />
        <div className="content">
          <PageHeading />
          <WorkspaceAlerts />
          {children}
          <TransactionHistory />
          <WorkspaceFooter />
        </div>
      </main>
      <WalletDialog />
    </div>
  );
}
