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
    key: "iam",
    name: "IAM",
    description: "Identity and access management",
    href: "/services/iam",
    aliases: ["identity", "permissions", "roles", "users", "policy"],
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
];
