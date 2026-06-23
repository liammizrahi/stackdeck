import { cookies } from "next/headers";
import Dashboard from "@/components/Dashboard";
import { checkHealth } from "@/lib/aws/health";
import { getResourceOverview } from "@/lib/aws/overview";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [health, overview] = await Promise.all([
    checkHealth(),
    getResourceOverview(),
  ]);
  const cookieStore = await cookies();
  const region = cookieStore.get("stackdeck_region")?.value ?? health.region;
  return <Dashboard health={{ ...health, region }} overview={overview} />;
}
