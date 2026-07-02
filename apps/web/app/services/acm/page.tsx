import CertificatesTable from "./CertificatesTable";
import { listCertificates } from "@/lib/aws/acm";

export const dynamic = "force-dynamic";

export default async function AcmPage() {
  const certificates = await listCertificates();
  return <CertificatesTable certificates={certificates} />;
}
