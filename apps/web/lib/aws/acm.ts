import {
  ACMClient,
  DescribeCertificateCommand,
  ListCertificatesCommand,
} from "@aws-sdk/client-acm";
import { clientConfig } from "@/lib/aws/config";

export interface Certificate {
  arn: string;
  domainName: string;
  status: string;
  type: string;
  notAfter: string | null;
}

export interface CertificateDetail extends Certificate {
  subjectAlternativeNames: string[];
  issuer: string;
  keyAlgorithm: string;
  notBefore: string | null;
  createdAt: string | null;
  renewalEligibility: string;
  inUseBy: string[];
}

function acmClient() {
  return new ACMClient(clientConfig());
}

function isoOrNull(date: Date | undefined): string | null {
  return date ? date.toISOString() : null;
}

export async function listCertificates(): Promise<Certificate[]> {
  const client = acmClient();
  const certificates: Certificate[] = [];
  let nextToken: string | undefined;

  do {
    const out = await client.send(
      new ListCertificatesCommand({ NextToken: nextToken }),
    );
    for (const c of out.CertificateSummaryList ?? []) {
      certificates.push({
        arn: c.CertificateArn ?? "",
        domainName: c.DomainName ?? "",
        status: c.Status ?? "",
        type: c.Type ?? "",
        notAfter: isoOrNull(c.NotAfter),
      });
    }
    nextToken = out.NextToken;
  } while (nextToken);

  return certificates.sort((a, b) => a.domainName.localeCompare(b.domainName));
}

export async function getCertificate(
  arn: string,
): Promise<{ certificate?: CertificateDetail; error?: string }> {
  try {
    const out = await acmClient().send(
      new DescribeCertificateCommand({ CertificateArn: arn }),
    );
    const c = out.Certificate;
    if (!c) return { error: "Certificate not found" };
    return {
      certificate: {
        arn: c.CertificateArn ?? arn,
        domainName: c.DomainName ?? "",
        status: c.Status ?? "",
        type: c.Type ?? "",
        subjectAlternativeNames: c.SubjectAlternativeNames ?? [],
        issuer: c.Issuer ?? "",
        keyAlgorithm: c.KeyAlgorithm ?? "",
        notBefore: isoOrNull(c.NotBefore),
        notAfter: isoOrNull(c.NotAfter),
        createdAt: isoOrNull(c.CreatedAt),
        renewalEligibility: c.RenewalEligibility ?? "",
        inUseBy: c.InUseBy ?? [],
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
