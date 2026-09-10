import { TransferForm } from "../../../components/workspace/transfer-form";
import { TransferBalances } from "../../../components/workspace/transfer-balances";
export default function SubmitPage() {
  return (
    <div className="transfer-layout">
      <TransferForm />
      <TransferBalances />
    </div>
  );
}
