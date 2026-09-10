import { NetworkSettings } from "../../../components/workspace/network-settings";
import { HardwareSetup } from "../../../components/workspace/hardware-setup";
export default function SettingsPage() {
  return (
    <section className="panel form-panel">
      <NetworkSettings />
      <HardwareSetup />
    </section>
  );
}
