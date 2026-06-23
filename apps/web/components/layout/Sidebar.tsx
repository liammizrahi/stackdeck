"use client";

import SideNavigation from "@cloudscape-design/components/side-navigation";
import { usePathname, useRouter } from "next/navigation";

const items = [
  {
    type: "section" as const,
    text: "Services",
    items: [
      { type: "link" as const, text: "S3", href: "/services/s3" },
      { type: "link" as const, text: "Lambda", href: "/services/lambda" },
      { type: "link" as const, text: "DynamoDB", href: "/services/dynamodb" },
      { type: "link" as const, text: "SQS", href: "/services/sqs" },
      { type: "link" as const, text: "SNS", href: "/services/sns" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeHref =
    items[0]?.items.find((i) => pathname.startsWith(i.href))?.href ?? "/";
  return (
    <SideNavigation
      header={{ href: "/", text: "StackDeck" }}
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
