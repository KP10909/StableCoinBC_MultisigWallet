import { DepositForm } from "../../../components/workspace/deposit-form";
import { TransferBalances } from "../../../components/workspace/transfer-balances";
export default function DepositPage() {
  return (
    <div className="transfer-layout">
      <DepositForm />
      <TransferBalances mode="deposit" />
    </div>
  );
}
