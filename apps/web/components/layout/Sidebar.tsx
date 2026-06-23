"use client";

import SideNavigation, {
  type SideNavigationProps,
} from "@cloudscape-design/components/side-navigation";
import { usePathname, useRouter } from "next/navigation";

const items: SideNavigationProps.Item[] = [
  {
    type: "section",
    text: "Compute",
    items: [{ type: "link", text: "Lambda", href: "/services/lambda" }],
  },
  {
    type: "section",
    text: "Storage",
    items: [{ type: "link", text: "S3", href: "/services/s3" }],
  },
  {
    type: "section",
    text: "Database",
    items: [
      { type: "link", text: "DynamoDB", href: "/services/dynamodb" },
      { type: "link", text: "RDS", href: "/services/rds" },
    ],
  },
  {
    type: "section",
    text: "Application integration",
    items: [
      { type: "link", text: "SQS", href: "/services/sqs" },
      { type: "link", text: "SNS", href: "/services/sns" },
      { type: "link", text: "API Gateway", href: "/services/apigateway" },
    ],
  },
  {
    type: "section",
    text: "Security, Identity & Compliance",
    items: [
      { type: "link", text: "IAM", href: "/services/iam" },
      { type: "link", text: "Cognito", href: "/services/cognito" },
    ],
  },
  {
    type: "section",
    text: "Management & Governance",
    items: [
      { type: "link", text: "Parameter Store", href: "/services/ssm" },
      { type: "link", text: "CloudWatch", href: "/services/cloudwatch" },
    ],
  },
];

const links = items.flatMap((section) =>
  section.type === "section" ? section.items : [],
);

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeHref =
    links.find(
      (i): i is SideNavigationProps.Link =>
        i.type === "link" && pathname.startsWith(i.href),
    )?.href ?? "/";
  return (
    <SideNavigation
      activeHref={activeHref}
      items={items}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          router.push(event.detail.href);
        }
      }}
    />
  );
}
