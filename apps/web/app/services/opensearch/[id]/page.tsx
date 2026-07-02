import DomainDetail from "./DomainDetail";
import { getDomain } from "@/lib/aws/opensearch";

export const dynamic = "force-dynamic";

export default async function OpenSearchDomainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const domainName = decodeURIComponent(id);
  const { domain, error } = await getDomain(domainName);
  return <DomainDetail domain={domain ?? null} error={error ?? null} />;
}
