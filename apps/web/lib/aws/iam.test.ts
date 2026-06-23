import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  IAMClient,
  ListUsersCommand,
  ListRolesCommand,
  ListPoliciesCommand,
  type User,
} from "@aws-sdk/client-iam";
import { listUsers, listRoles, listPolicies } from "@/lib/aws/iam";

const iam = mockClient(IAMClient);

afterEach(() => iam.reset());

describe("listUsers", () => {
  it("maps and sorts users alphabetically", async () => {
    iam.on(ListUsersCommand).resolves({
      Users: [
        {
          UserName: "zara",
          UserId: "AID2",
          Arn: "arn:aws:iam::123456789012:user/zara",
          CreateDate: new Date("2021-06-01"),
          Path: "/",
          PasswordLastUsed: undefined,
        },
        {
          UserName: "alice",
          UserId: "AID1",
          Arn: "arn:aws:iam::123456789012:user/alice",
          CreateDate: new Date("2020-01-15"),
          Path: "/",
          PasswordLastUsed: undefined,
        },
      ],
      IsTruncated: false,
    });
    const result = await listUsers();
    expect(result.map((u) => u.name)).toEqual(["alice", "zara"]);
    expect(result[0]?.id).toBe("AID1");
    expect(result[0]?.arn).toBe("arn:aws:iam::123456789012:user/alice");
    expect(result[0]?.created).toBe(new Date("2020-01-15").toISOString());
  });

  it("returns null created when CreateDate is missing", async () => {
    iam.on(ListUsersCommand).resolves({
      Users: [
        {
          UserName: "bob",
          UserId: "AID3",
          Arn: "arn:aws:iam::123456789012:user/bob",
          Path: "/",
        } as User,
      ],
      IsTruncated: false,
    });
    const result = await listUsers();
    expect(result[0]?.created).toBeNull();
  });
});

describe("listRoles", () => {
  it("maps and sorts roles alphabetically", async () => {
    iam.on(ListRolesCommand).resolves({
      Roles: [
        {
          RoleName: "MyRole",
          RoleId: "RID1",
          Arn: "arn:aws:iam::123456789012:role/MyRole",
          CreateDate: new Date("2022-03-10"),
          AssumeRolePolicyDocument: "",
          Path: "/",
          Description: "A test role",
        },
        {
          RoleName: "AnotherRole",
          RoleId: "RID2",
          Arn: "arn:aws:iam::123456789012:role/AnotherRole",
          CreateDate: new Date("2021-07-05"),
          AssumeRolePolicyDocument: "",
          Path: "/",
        },
      ],
      IsTruncated: false,
    });
    const result = await listRoles();
    expect(result.map((r) => r.name)).toEqual(["AnotherRole", "MyRole"]);
    expect(result[1]?.description).toBe("A test role");
    expect(result[0]?.description).toBe("");
  });
});

describe("listPolicies", () => {
  it("maps and sorts policies alphabetically with attachmentCount", async () => {
    iam.on(ListPoliciesCommand).resolves({
      Policies: [
        {
          PolicyName: "ZPolicy",
          PolicyId: "PID2",
          Arn: "arn:aws:iam::123456789012:policy/ZPolicy",
          AttachmentCount: 3,
          Path: "/",
          DefaultVersionId: "v1",
          IsAttachable: true,
        },
        {
          PolicyName: "APolicy",
          PolicyId: "PID1",
          Arn: "arn:aws:iam::123456789012:policy/APolicy",
          AttachmentCount: 0,
          Path: "/",
          DefaultVersionId: "v1",
          IsAttachable: true,
        },
      ],
      IsTruncated: false,
    });
    const result = await listPolicies();
    expect(result.map((p) => p.name)).toEqual(["APolicy", "ZPolicy"]);
    expect(result[1]?.attachmentCount).toBe(3);
  });
});
