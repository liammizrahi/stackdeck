"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Select, {
  type SelectProps,
} from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import TagEditor, {
  type TagEditorProps,
} from "@cloudscape-design/components/tag-editor";
import { allRegions } from "@/lib/aws/regions";
import { tagEditorI18nStrings } from "@/lib/tag-editor-i18n";
import { createBucketAction } from "../actions";

const regionOptions: SelectProps.Option[] = allRegions.map((r) => ({
  label: `${r.name}`,
  value: r.code,
  description: r.code,
}));

export default function CreateBucketForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [region, setRegion] = useState<SelectProps.Option>(
    regionOptions.find((o) => o.value === "us-east-1") ?? regionOptions[0]!,
  );
  const [tags, setTags] = useState<TagEditorProps.Tag[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => router.push("/services/s3");

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createBucketAction({
        name,
        region: region.value ?? "us-east-1",
        tags: tags
          .filter((t) => !t.markedForRemoval)
          .map((t) => ({ key: t.key ?? "", value: t.value ?? "" })),
      });
      if (result.ok) {
        router.push("/services/s3");
      } else {
        setError(result.error ?? "Failed to create bucket");
      }
    });
  };

  return (
    <ContentLayout header={<Header variant="h1">Create bucket</Header>}>
      <Form
        errorText={error ?? undefined}
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={cancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isPending}
              disabled={!name.trim()}
              onClick={submit}
            >
              Create bucket
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          <Container header={<Header variant="h2">General configuration</Header>}>
            <SpaceBetween size="l">
              <FormField
                label="Bucket name"
                description="Bucket names must be globally unique and DNS-compliant."
              >
                <Input
                  value={name}
                  onChange={({ detail }) => setName(detail.value)}
                  placeholder="my-bucket"
                />
              </FormField>
              <FormField label="AWS Region">
                <Select
                  selectedOption={region}
                  onChange={({ detail }) => setRegion(detail.selectedOption)}
                  options={regionOptions}
                  filteringType="auto"
                />
              </FormField>
            </SpaceBetween>
          </Container>
          <Container
            header={
              <Header variant="h2" description="Optional">
                Tags
              </Header>
            }
          >
            <TagEditor
              i18nStrings={tagEditorI18nStrings}
              tags={tags}
              onChange={({ detail }) => setTags([...detail.tags])}
            />
          </Container>
        </SpaceBetween>
      </Form>
    </ContentLayout>
  );
}
