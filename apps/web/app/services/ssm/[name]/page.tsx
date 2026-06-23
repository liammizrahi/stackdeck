import ParameterDetail from "./ParameterDetail";
import { listParameters, getParameterTags } from "@/lib/aws/ssm";
import { getParameter } from "@/lib/aws/ssm";

export const dynamic = "force-dynamic";

export default async function SsmParameterPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: encodedName } = await params;
  const name = decodeURIComponent(encodedName);

  const allParameters = await listParameters();
  const parameter = allParameters.find((p) => p.name === name) ?? null;

  let value: string | null = null;
  let valueError: string | undefined;

  try {
    const result = await getParameter(name);
    if (result.error) {
      valueError = result.error;
    } else {
      value = result.value ?? "";
    }
  } catch (err) {
    valueError = err instanceof Error ? err.message : String(err);
  }

  const tags = await getParameterTags(name);

  return (
    <ParameterDetail
      name={name}
      arn={parameter?.arn ?? ""}
      type={parameter?.type ?? ""}
      version={parameter?.version ?? 0}
      lastModifiedDate={parameter?.lastModifiedDate ?? null}
      value={value}
      valueError={valueError}
      tags={tags}
    />
  );
}
