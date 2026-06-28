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
import { servicesByCategory } from "@/lib/services";
import { withBase } from "@/lib/base-path";

export default function ServicesOverview() {
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
            ]}
            ariaLabel="Breadcrumbs"
          />
        }
        header={
          <Header
            variant="h1"
            description="Every AWS service StackDeck can browse and manage on your local cloud."
          >
            Supported services
          </Header>
        }
      >
        <SpaceBetween size="xl">
          {servicesByCategory().map((group) => (
            <div key={group.category}>
              <Box variant="h2" margin={{ bottom: "m" }}>
                {group.category}
              </Box>
              <ul className="product-cards-list">
                {group.items.map((service) => (
                  <li
                    key={service.slug}
                    className="product-cards-list-item"
                    aria-label={service.name}
                  >
                    <Container>
                      <SpaceBetween direction="vertical" size="s">
                        <SpaceBetween direction="vertical" size="xxs">
                          <Image
                            src={withBase(`/aws-icons/${service.icon}.svg`)}
                            alt=""
                            width={40}
                            height={40}
                          />
                          <Box variant="h3">
                            <Link
                              fontSize="inherit"
                              href={withBase(`/services/${service.slug}/`)}
                            >
                              {service.name}
                            </Link>
                          </Box>
                          <Badge>{service.abbr}</Badge>
                        </SpaceBetween>
                        <Box variant="p">{service.summary}</Box>
                      </SpaceBetween>
                    </Container>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </SpaceBetween>
      </ContentLayout>
    </I18nProvider>
  );
}
