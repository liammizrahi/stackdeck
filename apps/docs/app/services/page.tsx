import type { Metadata } from "next";
import ServicesShell from "@/components/ServicesShell";
import ServicesOverview from "@/components/ServicesOverview";

export const metadata: Metadata = {
  title: "Supported services — StackDeck",
  description:
    "Every AWS service StackDeck can browse and manage on your local cloud.",
};

export default function ServicesPage() {
  return (
    <ServicesShell>
      <ServicesOverview />
    </ServicesShell>
  );
}
