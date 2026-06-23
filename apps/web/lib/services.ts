export interface ServiceInfo {
  key: string;
  name: string;
  description: string;
  href: string;
}

export const services: ServiceInfo[] = [
  { key: "s3", name: "S3", description: "Scalable object storage", href: "/services/s3" },
  { key: "lambda", name: "Lambda", description: "Run code without servers", href: "/services/lambda" },
  { key: "dynamodb", name: "DynamoDB", description: "Managed NoSQL database", href: "/services/dynamodb" },
  { key: "rds", name: "RDS", description: "Managed relational databases", href: "/services/rds" },
  { key: "sqs", name: "SQS", description: "Managed message queues", href: "/services/sqs" },
  { key: "sns", name: "SNS", description: "Pub/sub messaging", href: "/services/sns" },
  { key: "apigateway", name: "API Gateway", description: "HTTP and REST APIs", href: "/services/apigateway" },
  { key: "iam", name: "IAM", description: "Identity and access management", href: "/services/iam" },
  { key: "ssm", name: "Parameter Store", description: "Configuration and secrets", href: "/services/ssm" },
  { key: "cloudwatch", name: "CloudWatch", description: "Logs and metrics", href: "/services/cloudwatch" },
];
