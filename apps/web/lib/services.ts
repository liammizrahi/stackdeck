export interface ServiceInfo {
  key: string;
  name: string;
  description: string;
  href: string;
  aliases: string[];
}

export const services: ServiceInfo[] = [
  {
    key: "s3",
    name: "S3",
    description: "Scalable object storage",
    href: "/services/s3",
    aliases: ["object storage", "bucket", "blob", "static hosting", "simple storage service"],
  },
  {
    key: "lambda",
    name: "Lambda",
    description: "Run code without servers",
    href: "/services/lambda",
    aliases: ["serverless", "function", "faas", "run code"],
  },
  {
    key: "ec2",
    name: "EC2",
    description: "Virtual servers in the cloud",
    href: "/services/ec2",
    aliases: ["compute", "instance", "vm", "virtual machine", "server", "elastic compute cloud"],
  },
  {
    key: "dynamodb",
    name: "DynamoDB",
    description: "Managed NoSQL database",
    href: "/services/dynamodb",
    aliases: ["nosql", "table", "key value", "document db"],
  },
  {
    key: "rds",
    name: "RDS",
    description: "Managed relational databases",
    href: "/services/rds",
    aliases: ["sql", "relational", "postgres", "mysql", "database", "relational database service"],
  },
  {
    key: "elasticache",
    name: "ElastiCache",
    description: "In-memory caching",
    href: "/services/elasticache",
    aliases: ["cache", "redis", "memcached", "in-memory", "valkey"],
  },
  {
    key: "sqs",
    name: "SQS",
    description: "Managed message queues",
    href: "/services/sqs",
    aliases: ["queue", "message", "fifo", "simple queue service"],
  },
  {
    key: "sns",
    name: "SNS",
    description: "Pub/sub messaging",
    href: "/services/sns",
    aliases: ["pubsub", "topic", "notification", "push", "simple notification service"],
  },
  {
    key: "apigateway",
    name: "API Gateway",
    description: "HTTP and REST APIs",
    href: "/services/apigateway",
    aliases: ["api", "rest", "http", "endpoint"],
  },
  {
    key: "eventbridge",
    name: "EventBridge",
    description: "Event buses and rules",
    href: "/services/eventbridge",
    aliases: ["events", "event bus", "rules", "cron", "schedule", "cloudwatch events"],
  },
  {
    key: "iam",
    name: "IAM",
    description: "Identity and access management",
    href: "/services/iam",
    aliases: ["identity", "permissions", "roles", "users", "policy"],
  },
  {
    key: "cognito",
    name: "Cognito",
    description: "User authentication and identity",
    href: "/services/cognito",
    aliases: ["auth", "authentication", "user pool", "login", "identity", "sign in"],
  },
  {
    key: "ssm",
    name: "Parameter Store",
    description: "Configuration and secrets",
    href: "/services/ssm",
    aliases: ["parameter store", "secrets", "config", "ssm", "systems manager"],
  },
  {
    key: "cloudwatch",
    name: "CloudWatch",
    description: "Logs and metrics",
    href: "/services/cloudwatch",
    aliases: ["logs", "metrics", "monitoring", "alarms"],
  },
  {
    key: "appconfig",
    name: "AppConfig",
    description: "Feature flags and configuration",
    href: "/services/appconfig",
    aliases: ["config", "feature flags", "application configuration", "deployment"],
  },
  {
    key: "cloudfront",
    name: "CloudFront",
    description: "Content delivery network",
    href: "/services/cloudfront",
    aliases: ["cdn", "distribution", "edge", "content delivery"],
  },
  {
    key: "athena",
    name: "Athena",
    description: "Query data with SQL",
    href: "/services/athena",
    aliases: ["query", "sql", "analytics", "presto", "data lake"],
  },
];
