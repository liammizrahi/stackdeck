import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { ACMClient, ListCertificatesCommand } from "@aws-sdk/client-acm";
import { listCertificates } from "@/lib/aws/acm";

const acm = mockClient(ACMClient);

afterEach(() => acm.reset());

describe("listCertificates", () => {
  it("maps domainName/status and sorts by domainName", async () => {
    acm.on(ListCertificatesCommand).resolves({
      CertificateSummaryList: [
        {
          CertificateArn: "arn:aws:acm:us-east-1:123456789012:certificate/zeta",
          DomainName: "zeta.example.com",
          Status: "ISSUED",
        },
        {
          CertificateArn: "arn:aws:acm:us-east-1:123456789012:certificate/alpha",
          DomainName: "alpha.example.com",
          Status: "PENDING_VALIDATION",
        },
      ],
    });
    const result = await listCertificates();
    expect(result.map((c) => c.domainName)).toEqual([
      "alpha.example.com",
      "zeta.example.com",
    ]);
    expect(result[0]?.status).toBe("PENDING_VALIDATION");
    expect(result[1]?.status).toBe("ISSUED");
  });

  it("returns empty array when no certificates exist", async () => {
    acm.on(ListCertificatesCommand).resolves({ CertificateSummaryList: [] });
    const result = await listCertificates();
    expect(result).toEqual([]);
  });
});
