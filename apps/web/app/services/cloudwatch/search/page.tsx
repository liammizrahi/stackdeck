import AllGroupsSearch from "./AllGroupsSearch";
import { searchAllGroups } from "@/lib/aws/cloudwatch";

export const dynamic = "force-dynamic";

export default async function AllGroupsSearchPage() {
  const events = await searchAllGroups("");
  return <AllGroupsSearch initialEvents={events} />;
}
