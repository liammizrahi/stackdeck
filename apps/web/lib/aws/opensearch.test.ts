import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeDomainCommand,
  ListDomainNamesCommand,
  OpenSearchClient,
} from "@aws-sdk/client-opensearch";
import { listDomains } from "@/lib/aws/opensearch";

const opensearch = mockClient(OpenSearchClient);

afterEach(() => opensearch.reset());

describe("listDomains", () => {
  it("maps engineVersion/instanceType and sorts by name", async () => {
    opensearch.on(ListDomainNamesCommand).resolves({
      DomainNames: [{ DomainName: "zeta" }, { DomainName: "alpha" }],
    });
    opensearch
      .on(DescribeDomainCommand, { DomainName: "zeta" })
      .resolves({
        DomainStatus: {
          DomainId: "123456789012/zeta",
          DomainName: "zeta",
          ARN: "arn:aws:es:us-east-1:123456789012:domain/zeta",
          EngineVersion: "OpenSearch_2.11",
          ClusterConfig: { InstanceType: "r6g.large.search", InstanceCount: 3 },
          Processing: true,
        },
      })
      .on(DescribeDomainCommand, { DomainName: "alpha" })
      .resolves({
        DomainStatus: {
          DomainId: "123456789012/alpha",
          DomainName: "alpha",
          ARN: "arn:aws:es:us-east-1:123456789012:domain/alpha",
          EngineVersion: "OpenSearch_1.3",
          ClusterConfig: { InstanceType: "t3.small.search", InstanceCount: 1 },
          Processing: false,
        },
      });

    const result = await listDomains();

    expect(result.map((d) => d.name)).toEqual(["alpha", "zeta"]);
    expect(result[0]?.engineVersion).toBe("OpenSearch_1.3");
    expect(result[0]?.instanceType).toBe("t3.small.search");
    expect(result[1]?.engineVersion).toBe("OpenSearch_2.11");
    expect(result[1]?.instanceType).toBe("r6g.large.search");
  });

  it("returns empty array when no domains exist", async () => {
    opensearch.on(ListDomainNamesCommand).resolves({ DomainNames: [] });
    const result = await listDomains();
    expect(result).toEqual([]);
  });
});
