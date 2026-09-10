import { ContractForm } from "../../../components/workspace/contract-form";
import { ContractReview } from "../../../components/workspace/contract-review";
import { abi } from "../../../lib/config";
import { pretty } from "../../../lib/contract";
export default function ContractPage() {
  return (
    <section className="panel form-panel">
      <ContractForm />
      <ContractReview />
      <details>
        <summary>전체 ABI 보기</summary>
        <pre>{pretty(abi)}</pre>
      </details>
    </section>
  );
}
