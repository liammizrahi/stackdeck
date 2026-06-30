import KeyDetail from "./KeyDetail";
import { getKey } from "@/lib/aws/kms";

export const dynamic = "force-dynamic";

export default async function KeyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const keyId = decodeURIComponent(id);
  const { key, error } = await getKey(keyId);
  return <KeyDetail keyData={key ?? null} error={error ?? null} />;
}
