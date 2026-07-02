import DomainsTable from "./DomainsTable";
import { listDomains } from "@/lib/aws/opensearch";

export const dynamic = "force-dynamic";

export default async function OpenSearchPage() {
  const domains = await listDomains();
  return <DomainsTable domains={domains} />;
}
