"use client";

import SideNavigation, {
  type SideNavigationProps,
} from "@cloudscape-design/components/side-navigation";
import { usePathname, useRouter } from "next/navigation";

const items: SideNavigationProps.Item[] = [
  {
    type: "section",
    text: "Compute",
    items: [
      { type: "link", text: "EC2", href: "/services/ec2" },
      { type: "link", text: "Lambda", href: "/services/lambda" },
    ],
  },
  {
    type: "section",
    text: "Containers",
    items: [
      { type: "link", text: "ECS", href: "/services/ecs" },
      { type: "link", text: "ECR", href: "/services/ecr" },
    ],
  },
  {
    type: "section",
    text: "Storage",
    items: [
      { type: "link", text: "S3", href: "/services/s3" },
      { type: "link", text: "EFS", href: "/services/efs" },
    ],
  },
  {
    type: "section",
    text: "Database",
    items: [
      { type: "link", text: "DynamoDB", href: "/services/dynamodb" },
      { type: "link", text: "RDS", href: "/services/rds" },
      { type: "link", text: "ElastiCache", href: "/services/elasticache" },
    ],
  },
  {
    type: "section",
    text: "Networking & Content Delivery",
    items: [
      { type: "link", text: "VPC", href: "/services/vpc" },
      { type: "link", text: "Load Balancers", href: "/services/elbv2" },
      { type: "link", text: "CloudFront", href: "/services/cloudfront" },
      { type: "link", text: "Route 53", href: "/services/route53" },
    ],
  },
  {
    type: "section",
    text: "Analytics",
    items: [
      { type: "link", text: "Athena", href: "/services/athena" },
      { type: "link", text: "Kinesis", href: "/services/kinesis" },
      { type: "link", text: "Data Firehose", href: "/services/firehose" },
      { type: "link", text: "Glue", href: "/services/glue" },
      { type: "link", text: "OpenSearch", href: "/services/opensearch" },
    ],
  },
  {
    type: "section",
    text: "Application integration",
    items: [
      { type: "link", text: "SQS", href: "/services/sqs" },
      { type: "link", text: "SNS", href: "/services/sns" },
      { type: "link", text: "API Gateway", href: "/services/apigateway" },
      { type: "link", text: "EventBridge", href: "/services/eventbridge" },
      { type: "link", text: "EventBridge Scheduler", href: "/services/scheduler" },
      { type: "link", text: "Step Functions", href: "/services/stepfunctions" },
      { type: "link", text: "AppSync", href: "/services/appsync" },
      { type: "link", text: "SES", href: "/services/ses" },
    ],
  },
  {
    type: "section",
    text: "Security, Identity & Compliance",
    items: [
      { type: "link", text: "IAM", href: "/services/iam" },
      { type: "link", text: "Cognito", href: "/services/cognito" },
      { type: "link", text: "Secrets Manager", href: "/services/secretsmanager" },
      { type: "link", text: "KMS", href: "/services/kms" },
      { type: "link", text: "Certificate Manager", href: "/services/acm" },
    ],
  },
  {
    type: "section",
    text: "Management & Governance",
    items: [
      { type: "link", text: "CloudFormation", href: "/services/cloudformation" },
      { type: "link", text: "CloudTrail", href: "/services/cloudtrail" },
      { type: "link", text: "CloudWatch", href: "/services/cloudwatch" },
      { type: "link", text: "Parameter Store", href: "/services/ssm" },
      { type: "link", text: "AppConfig", href: "/services/appconfig" },
      { type: "link", text: "Backup", href: "/services/backup" },
      { type: "link", text: "Organizations", href: "/services/organizations" },
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
