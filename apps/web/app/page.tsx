import { cookies } from "next/headers";
import Dashboard from "@/components/Dashboard";
import { checkHealth } from "@/lib/aws/health";

export const dynamic = "force-dynamic";

export default async function Home() {
  const health = await checkHealth();
  const cookieStore = await cookies();
  const region = cookieStore.get("stackdeck_region")?.value ?? health.region;
  return <Dashboard health={{ ...health, region }} />;
}
