export type ServiceCategory =
  | "Compute"
  | "Storage"
  | "Database"
  | "Networking & Content Delivery"
  | "Analytics"
  | "Application Integration"
  | "Security, Identity & Compliance"
  | "Management & Governance";

export interface Service {
  slug: string;
  name: string;
  abbr: string;
  icon: string;
  category: ServiceCategory;
  summary: string;
  features: string[];
  awsDocsUrl: string;
}

export const services: Service[] = [
  {
    slug: "ec2",
    name: "Amazon EC2",
    abbr: "EC2",
    icon: "ec2",
    category: "Compute",
    summary: "Browse the virtual machines running in your local cloud.",
    features: [
      "List instances with state, type, Availability Zone, and IP addresses.",
      "Open an instance to inspect its networking, security groups, and tags.",
      "Filter and search across your fleet from a Cloudscape table.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/ec2/",
  },
  {
    slug: "lambda",
    name: "AWS Lambda",
    abbr: "Lambda",
    icon: "lambda",
    category: "Compute",
    summary: "Inspect the functions deployed to your emulator.",
    features: [
      "List functions with runtime, handler, and last-modified details.",
      "Open a function to review its configuration and environment variables.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/lambda/",
  },
  {
    slug: "s3",
    name: "Amazon S3",
    abbr: "S3",
    icon: "s3",
    category: "Storage",
    summary: "A familiar object browser for your local buckets.",
    features: [
      "Navigate buckets and prefixes like folders.",
      "Preview object contents and metadata.",
      "Copy bucket and object ARNs in a click.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/s3/",
  },
  {
    slug: "dynamodb",
    name: "Amazon DynamoDB",
    abbr: "DynamoDB",
    icon: "dynamodb",
    category: "Database",
    summary: "Explore tables, keys, and items.",
    features: [
      "List tables with their key schema and indexes.",
      "Open a table to inspect attributes and browse items.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/dynamodb/",
  },
  {
    slug: "rds",
    name: "Amazon RDS",
    abbr: "RDS",
    icon: "rds",
    category: "Database",
    summary: "A full database explorer, not just a resource list.",
    features: [
      "Browse DB instances with engine, status, and endpoint details.",
      "Run ad-hoc SQL in a syntax-highlighted editor.",
      "Add, edit, and delete rows directly from the UI.",
      "Create new instances through a multi-step wizard.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/rds/",
  },
  {
    slug: "elasticache",
    name: "Amazon ElastiCache",
    abbr: "ElastiCache",
    icon: "elasticache",
    category: "Database",
    summary: "Inspect your in-memory cache clusters.",
    features: [
      "List clusters with engine and status.",
      "Open a cluster to review its configuration and nodes.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/elasticache/",
  },
  {
    slug: "cloudfront",
    name: "Amazon CloudFront",
    abbr: "CloudFront",
    icon: "cloudfront",
    category: "Networking & Content Delivery",
    summary: "Review the content distributions in your stack.",
    features: [
      "List distributions with their status and domain names.",
      "Inspect distribution configuration.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/cloudfront/",
  },
  {
    slug: "athena",
    name: "Amazon Athena",
    abbr: "Athena",
    icon: "athena",
    category: "Analytics",
    summary: "Query your local data lake.",
    features: [
      "Explore the Athena query environment wired to your emulator.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/athena/",
  },
  {
    slug: "sqs",
    name: "Amazon SQS",
    abbr: "SQS",
    icon: "sqs",
    category: "Application Integration",
    summary: "Manage queues and messages.",
    features: [
      "List queues with their attributes.",
      "Send messages and inspect what is in the queue.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/sqs/",
  },
  {
    slug: "sns",
    name: "Amazon SNS",
    abbr: "SNS",
    icon: "sns",
    category: "Application Integration",
    summary: "Inspect topics and publish messages.",
    features: [
      "List topics and their subscriptions.",
      "Publish a message to a topic from the UI.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/sns/",
  },
  {
    slug: "apigateway",
    name: "Amazon API Gateway",
    abbr: "API Gateway",
    icon: "apigateway",
    category: "Application Integration",
    summary: "Browse the APIs exposed by your stack.",
    features: [
      "List HTTP and REST APIs.",
      "Open an API to inspect its routes and stages.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/apigateway/",
  },
  {
    slug: "eventbridge",
    name: "Amazon EventBridge",
    abbr: "EventBridge",
    icon: "eventbridge",
    category: "Application Integration",
    summary: "Inspect event buses and rules.",
    features: [
      "Browse event buses.",
      "Review the rules that route your events.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/eventbridge/",
  },
  {
    slug: "iam",
    name: "AWS IAM",
    abbr: "IAM",
    icon: "iam",
    category: "Security, Identity & Compliance",
    summary: "Review identities and permissions.",
    features: [
      "Browse users, roles, and policies.",
      "Inspect the permissions attached to each identity.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/iam/",
  },
  {
    slug: "cognito",
    name: "Amazon Cognito",
    abbr: "Cognito",
    icon: "cognito",
    category: "Security, Identity & Compliance",
    summary: "Manage user pools and their users.",
    features: [
      "List user pools and inspect their configuration.",
      "Browse the users inside a pool.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/cognito/",
  },
  {
    slug: "ssm",
    name: "AWS Parameter Store",
    abbr: "Parameter Store",
    icon: "ssm",
    category: "Management & Governance",
    summary: "Browse Systems Manager parameters.",
    features: [
      "List parameters with their type and last-modified details.",
      "Inspect parameter values.",
    ],
    awsDocsUrl:
      "https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html",
  },
  {
    slug: "appconfig",
    name: "AWS AppConfig",
    abbr: "AppConfig",
    icon: "appconfig",
    category: "Management & Governance",
    summary: "Explore applications and configuration profiles.",
    features: [
      "Browse applications and environments.",
      "Inspect configuration profiles.",
    ],
    awsDocsUrl:
      "https://docs.aws.amazon.com/appconfig/latest/userguide/what-is-appconfig.html",
  },
  {
    slug: "cloudwatch",
    name: "Amazon CloudWatch",
    abbr: "CloudWatch",
    icon: "cloudwatch",
    category: "Management & Governance",
    summary: "A full-featured logs explorer.",
    features: [
      "Browse log groups and streams.",
      "Tail a stream live as new events arrive.",
      "Filter by time range and search across groups.",
      "Expand and read structured JSON log events.",
    ],
    awsDocsUrl: "https://docs.aws.amazon.com/cloudwatch/",
  },
];

export const categoryOrder: ServiceCategory[] = [
  "Compute",
  "Storage",
  "Database",
  "Networking & Content Delivery",
  "Analytics",
  "Application Integration",
  "Security, Identity & Compliance",
  "Management & Governance",
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function servicesByCategory(): { category: ServiceCategory; items: Service[] }[] {
  return categoryOrder
    .map((category) => ({
      category,
      items: services.filter((service) => service.category === category),
    }))
    .filter((group) => group.items.length > 0);
}
