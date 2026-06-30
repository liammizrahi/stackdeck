import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DescribeRepositoriesCommand,
  ECRClient,
} from "@aws-sdk/client-ecr";
import { listRepositories } from "@/lib/aws/ecr";

const ecr = mockClient(ECRClient);

afterEach(() => ecr.reset());

describe("listRepositories", () => {
  it("maps name and uri, and sorts by name", async () => {
    ecr.on(DescribeRepositoriesCommand).resolves({
      repositories: [
        {
          repositoryName: "zeta-repo",
          repositoryUri: "123.dkr.ecr.us-east-1.amazonaws.com/zeta-repo",
          repositoryArn: "arn:aws:ecr:us-east-1:123:repository/zeta-repo",
        },
        {
          repositoryName: "alpha-repo",
          repositoryUri: "123.dkr.ecr.us-east-1.amazonaws.com/alpha-repo",
          repositoryArn: "arn:aws:ecr:us-east-1:123:repository/alpha-repo",
        },
      ],
    });
    const result = await listRepositories();
    expect(result.map((r) => r.name)).toEqual(["alpha-repo", "zeta-repo"]);
    expect(result[0]?.name).toBe("alpha-repo");
    expect(result[0]?.uri).toBe(
      "123.dkr.ecr.us-east-1.amazonaws.com/alpha-repo",
    );
  });

  it("returns empty array when no repositories exist", async () => {
    ecr.on(DescribeRepositoriesCommand).resolves({ repositories: [] });
    const result = await listRepositories();
    expect(result).toEqual([]);
  });

  it("paginates through multiple pages", async () => {
    ecr
      .on(DescribeRepositoriesCommand, { nextToken: undefined })
      .resolves({
        repositories: [{ repositoryName: "beta-repo" }],
        nextToken: "page2token",
      })
      .on(DescribeRepositoriesCommand, { nextToken: "page2token" })
      .resolves({
        repositories: [{ repositoryName: "alpha-repo" }],
      });
    const result = await listRepositories();
    expect(result.map((r) => r.name)).toEqual(["alpha-repo", "beta-repo"]);
  });
});
