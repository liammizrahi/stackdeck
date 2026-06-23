"use client";

import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import { usePathname, useRouter } from "next/navigation";

const serviceLabels: Record<string, string> = {
  s3: "S3",
  ec2: "EC2",
  lambda: "Lambda",
  ecs: "ECS",
  eks: "EKS",
  ecr: "ECR",
  batch: "Batch",
  lightsail: "Lightsail",
  apprunner: "App Runner",
  elasticbeanstalk: "Elastic Beanstalk",
  dynamodb: "DynamoDB",
  rds: "RDS",
  aurora: "Aurora",
  elasticache: "ElastiCache",
  redshift: "Redshift",
  documentdb: "DocumentDB",
  neptune: "Neptune",
  memorydb: "MemoryDB",
  timestream: "Timestream",
  sqs: "SQS",
  sns: "SNS",
  eventbridge: "EventBridge",
  stepfunctions: "Step Functions",
  apigateway: "API Gateway",
  appsync: "AppSync",
  mq: "Amazon MQ",
  kinesis: "Kinesis",
  iam: "IAM",
  cognito: "Cognito",
  secretsmanager: "Secrets Manager",
  kms: "KMS",
  acm: "Certificate Manager",
  guardduty: "GuardDuty",
  waf: "WAF",
  ssm: "Parameter Store",
  cloudwatch: "CloudWatch",
  cloudtrail: "CloudTrail",
  cloudformation: "CloudFormation",
  config: "Config",
  organizations: "Organizations",
  route53: "Route 53",
  cloudfront: "CloudFront",
  vpc: "VPC",
  elb: "Elastic Load Balancing",
  globalaccelerator: "Global Accelerator",
  efs: "EFS",
  fsx: "FSx",
  backup: "Backup",
  glue: "Glue",
  athena: "Athena",
  emr: "EMR",
  quicksight: "QuickSight",
  sagemaker: "SageMaker",
  bedrock: "Bedrock",
  ses: "SES",
  amplify: "Amplify",
  appconfig: "AppConfig",
  create: "Create",
};

function labelFor(segment: string, index: number): string {
  if (index === 0 && segment === "services") return "Services";
  return serviceLabels[segment] ?? decodeURIComponent(segment);
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);

  const items = [{ text: "StackDeck", href: "/" }];
  let href = "";
  segments.forEach((segment, index) => {
    href += `/${segment}`;
    if (index === 0 && segment === "services") return;
    items.push({ text: labelFor(segment, index), href });
  });

  return (
    <BreadcrumbGroup
      items={items}
      onFollow={(event) => {
        event.preventDefault();
        router.push(event.detail.href);
      }}
    />
  );
}
