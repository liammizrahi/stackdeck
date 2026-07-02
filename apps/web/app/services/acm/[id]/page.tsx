import CertificateDetail from "./CertificateDetail";
import { getCertificate } from "@/lib/aws/acm";

export const dynamic = "force-dynamic";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const arn = decodeURIComponent(id);
  const { certificate, error } = await getCertificate(arn);
  return (
    <CertificateDetail
      certificate={certificate ?? null}
      error={error ?? null}
    />
  );
}
