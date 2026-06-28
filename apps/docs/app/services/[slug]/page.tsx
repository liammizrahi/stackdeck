import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicesShell from "@/components/ServicesShell";
import ServiceDetail from "@/components/ServiceDetail";
import { getService, services } from "@/lib/services";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) {
    return { title: "Service not found — StackDeck" };
  }
  return {
    title: `${service.name} — StackDeck`,
    description: service.summary,
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) {
    notFound();
  }
  return (
    <ServicesShell>
      <ServiceDetail service={service} />
    </ServicesShell>
  );
}
