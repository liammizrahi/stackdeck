import { listApis } from "./apigateway";
import { listDistributions } from "./cloudfront";
import { listLogGroups } from "./cloudwatch";
import { listUserPools } from "./cognito";
import { listTables as listDynamoTables } from "./dynamodb";
import { listInstances } from "./ec2";
import { listClusters } from "./elasticache";
import { listRoles } from "./iam";
import { listFunctions } from "./lambda";
import { listDbInstances } from "./rds";
import { listBuckets } from "./s3";
import { listTopics } from "./sns";
import { listQueues } from "./sqs";
import { listParameters } from "./ssm";

export interface ServiceCount {
  key: string;
  name: string;
  count: number;
}

export interface RuntimeCount {
  runtime: string;
  count: number;
}

export interface ResourceOverview {
  services: ServiceCount[];
  lambdaRuntimes: RuntimeCount[];
  total: number;
}

async function safe<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch {
    return [];
  }
}

export async function getResourceOverview(): Promise<ResourceOverview> {
  const [
    buckets,
    functions,
    dynamoTables,
    dbInstances,
    queues,
    topics,
    apis,
    roles,
    parameters,
    logGroups,
    instances,
    clusters,
    userPools,
    distributions,
  ] = await Promise.all([
    safe(listBuckets),
    safe(listFunctions),
    safe(listDynamoTables),
    safe(listDbInstances),
    safe(listQueues),
    safe(listTopics),
    safe(listApis),
    safe(listRoles),
    safe(listParameters),
    safe(listLogGroups),
    safe(listInstances),
    safe(listClusters),
    safe(listUserPools),
    safe(listDistributions),
  ]);

  const services: ServiceCount[] = [
    { key: "s3", name: "S3", count: buckets.length },
    { key: "lambda", name: "Lambda", count: functions.length },
    { key: "dynamodb", name: "DynamoDB", count: dynamoTables.length },
    { key: "rds", name: "RDS", count: dbInstances.length },
    { key: "sqs", name: "SQS", count: queues.length },
    { key: "sns", name: "SNS", count: topics.length },
    { key: "apigateway", name: "API Gateway", count: apis.length },
    { key: "iam", name: "IAM roles", count: roles.length },
    { key: "ssm", name: "Parameters", count: parameters.length },
    { key: "cloudwatch", name: "Log groups", count: logGroups.length },
    { key: "ec2", name: "EC2", count: instances.length },
    { key: "elasticache", name: "ElastiCache", count: clusters.length },
    { key: "cognito", name: "Cognito", count: userPools.length },
    { key: "cloudfront", name: "CloudFront", count: distributions.length },
  ]
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const runtimeCounts = new Map<string, number>();
  for (const fn of functions) {
    const runtime = fn.runtime || "unknown";
    runtimeCounts.set(runtime, (runtimeCounts.get(runtime) ?? 0) + 1);
  }
  const lambdaRuntimes: RuntimeCount[] = [...runtimeCounts.entries()]
    .map(([runtime, count]) => ({ runtime, count }))
    .sort((a, b) => b.count - a.count);

  const total = services.reduce((sum, s) => sum + s.count, 0);

  return { services, lambdaRuntimes, total };
}
