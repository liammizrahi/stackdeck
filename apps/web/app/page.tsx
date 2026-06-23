import Dashboard from "@/components/Dashboard";
import { checkHealth } from "@/lib/aws/health";

export const dynamic = "force-dynamic";

export default async function Home() {
  const health = await checkHealth();
  return <Dashboard health={health} />;
}
