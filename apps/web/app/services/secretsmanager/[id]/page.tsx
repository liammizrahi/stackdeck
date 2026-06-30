import SecretDetail from "./SecretDetail";
import { getSecret } from "@/lib/aws/secretsmanager";

export const dynamic = "force-dynamic";

export default async function SecretPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const secretId = decodeURIComponent(id);
  const { secret, error } = await getSecret(secretId);
  return <SecretDetail secret={secret ?? null} error={error ?? null} />;
}
