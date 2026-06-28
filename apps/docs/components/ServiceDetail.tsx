"use client";

import Image from "next/image";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import { I18nProvider } from "@cloudscape-design/components/i18n";
import enMessages from "@cloudscape-design/components/i18n/messages/all.en.json";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TextContent from "@cloudscape-design/components/text-content";
import type { Service } from "@/lib/services";
import { withBase } from "@/lib/base-path";

export default function ServiceDetail({ service }: { service: Service }) {
  return (
    <I18nProvider locale="en" messages={[enMessages]}>
      <ContentLayout
        defaultPadding={true}
        maxContentWidth={1040}
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { href: withBase("/"), text: "StackDeck" },
              { href: withBase("/services/"), text: "Services" },
              {
                href: withBase(`/services/${service.slug}/`),
                text: service.name,
              },
            ]}
            ariaLabel="Breadcrumbs"
          />
        }
        header={
          <SpaceBetween size="s">
            <Header
              variant="h1"
              description={service.summary}
              actions={<Badge color="blue">{service.category}</Badge>}
            >
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Image
                  src={withBase(`/aws-icons/${service.icon}.svg`)}
                  alt=""
                  width={40}
                  height={40}
                />
                <span>{service.name}</span>
              </SpaceBetween>
            </Header>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          <Container header={<Header variant="h2">What you can do</Header>}>
            <TextContent>
              <ul>
                {service.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </TextContent>
          </Container>

          <Container header={<Header variant="h2">Getting there</Header>}>
            <SpaceBetween size="m">
              <Box variant="p">
                Open StackDeck and choose <strong>{service.abbr}</strong> from the
                navigation sidebar to start browsing your {service.name}{" "}
                resources. StackDeck talks to whatever local AWS emulator{" "}
                <code>AWS_ENDPOINT_URL</code> points at.
              </Box>
              <Box>
                <Link
                  href={service.awsDocsUrl}
                  external={true}
                  variant="primary"
                >
                  {service.name} on AWS documentation
                </Link>
              </Box>
              <Box>
                <Link href={withBase("/services/")}>
                  ← Back to all services
                </Link>
              </Box>
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </ContentLayout>
    </I18nProvider>
  );
}
