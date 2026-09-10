import { VaultBanner } from "../../components/workspace/vault-banner";
import { TreasuryStats } from "../../components/workspace/treasury-stats";
import { AssetPanel } from "../../components/workspace/asset-panel";
import { HardwareGuide } from "../../components/workspace/hardware-guide";
import { SignerList } from "../../components/workspace/signer-list";
import { ProposalList } from "../../components/workspace/proposal-list";
export default function DashboardPage() {
  return (
    <>
      <VaultBanner />
      <TreasuryStats />
      <div className="columns">
        <AssetPanel />
        <div className="right-column">
          <HardwareGuide />
          <SignerList />
        </div>
      </div>
      <ProposalList />
    </>
  );
}
