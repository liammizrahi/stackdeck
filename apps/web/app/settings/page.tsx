import SettingsForm from "./SettingsForm";
import { getAwsSettings } from "@/lib/aws/config";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const settings = getAwsSettings();
  return <SettingsForm settings={settings} />;
}
