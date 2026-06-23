import { services, type ServiceInfo } from "@/lib/services";

function scoreService(service: ServiceInfo, query: string): number {
  const name = service.name.toLowerCase();
  if (name.startsWith(query)) return 4;
  if (name.includes(query)) return 3;
  if (service.aliases.some((alias) => alias.toLowerCase().includes(query))) return 2;
  if (service.description.toLowerCase().includes(query)) return 1;
  return 0;
}

export function searchServices(rawQuery: string): ServiceInfo[] {
  const query = rawQuery.trim().toLowerCase();
  if (query === "") return [];

  return services
    .map((service) => ({ service, score: scoreService(service, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.service.name.localeCompare(b.service.name))
    .map((entry) => entry.service);
}
