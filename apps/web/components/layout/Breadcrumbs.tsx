"use client";

import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import { usePathname, useRouter } from "next/navigation";

const serviceLabels: Record<string, string> = {
  s3: "S3",
  lambda: "Lambda",
  dynamodb: "DynamoDB",
  sqs: "SQS",
  sns: "SNS",
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
