"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Select, {
  type SelectProps,
} from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Tiles from "@cloudscape-design/components/tiles";
import Wizard, {
  type WizardProps,
} from "@cloudscape-design/components/wizard";
import { createDbInstanceAction } from "../actions";

const engineVersions: Record<string, string[]> = {
  postgres: ["18", "17", "16", "15"],
  mysql: ["8.4", "8.0"],
  mariadb: ["11.4", "10.11"],
};

const engineTiles = [
  {
    value: "postgres",
    label: "PostgreSQL",
    description: "Open-source object-relational database.",
  },
  {
    value: "mysql",
    label: "MySQL",
    description: "Popular open-source relational database.",
  },
  {
    value: "mariadb",
    label: "MariaDB",
    description: "Community-developed fork of MySQL.",
  },
];

const instanceClasses = [
  "db.t3.micro",
  "db.t3.small",
  "db.t4g.micro",
  "db.m5.large",
];

const wizardI18n: WizardProps.I18nStrings = {
  stepNumberLabel: (n) => `Step ${n}`,
  collapsedStepsLabel: (n, total) => `Step ${n} of ${total}`,
  navigationAriaLabel: "Steps",
  cancelButton: "Cancel",
  previousButton: "Previous",
  nextButton: "Next",
  submitButton: "Create database",
  optional: "optional",
};

export default function CreateInstanceWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [engine, setEngine] = useState("postgres");
  const [version, setVersion] = useState<SelectProps.Option>({
    label: "18",
    value: "18",
  });
  const [identifier, setIdentifier] = useState("");
  const [masterUsername, setMasterUsername] = useState("postgres");
  const [masterPassword, setMasterPassword] = useState("");
  const [instanceClass, setInstanceClass] = useState<SelectProps.Option>({
    label: "db.t3.micro",
    value: "db.t3.micro",
  });
  const [allocatedStorage, setAllocatedStorage] = useState("20");
  const [dbName, setDbName] = useState("");

  const versionOptions: SelectProps.Option[] = (
    engineVersions[engine] ?? []
  ).map((v) => ({ label: v, value: v }));

  const selectEngine = (next: string) => {
    setEngine(next);
    const first = engineVersions[next]?.[0] ?? "";
    setVersion({ label: first, value: first });
  };

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createDbInstanceAction({
        identifier: identifier.trim(),
        engine,
        engineVersion: version.value ?? "",
        instanceClass: instanceClass.value ?? "db.t3.micro",
        allocatedStorage: Number(allocatedStorage) || 20,
        masterUsername: masterUsername.trim(),
        masterPassword,
        dbName: dbName.trim(),
      });
      if (result.ok) {
        router.push("/services/rds");
      } else {
        setError(result.error ?? "Failed to create database");
      }
    });
  };

  const steps: WizardProps.Step[] = [
    {
      title: "Engine options",
      description: "Choose a database engine and version.",
      content: (
        <SpaceBetween size="l">
          <FormField label="Engine type">
            <Tiles
              value={engine}
              onChange={({ detail }) => selectEngine(detail.value)}
              items={engineTiles}
            />
          </FormField>
          <FormField label="Engine version">
            <Select
              selectedOption={version}
              onChange={({ detail }) => setVersion(detail.selectedOption)}
              options={versionOptions}
            />
          </FormField>
        </SpaceBetween>
      ),
    },
    {
      title: "Settings",
      content: (
        <Container header={<Header variant="h2">Settings</Header>}>
          <SpaceBetween size="l">
            <FormField
              label="DB instance identifier"
              description="Unique name for the database instance."
            >
              <Input
                value={identifier}
                onChange={({ detail }) => setIdentifier(detail.value)}
                placeholder="my-database"
              />
            </FormField>
            <FormField label="Master username">
              <Input
                value={masterUsername}
                onChange={({ detail }) => setMasterUsername(detail.value)}
              />
            </FormField>
            <FormField label="Master password">
              <Input
                type="password"
                value={masterPassword}
                onChange={({ detail }) => setMasterPassword(detail.value)}
              />
            </FormField>
          </SpaceBetween>
        </Container>
      ),
    },
    {
      title: "Instance configuration",
      content: (
        <Container header={<Header variant="h2">Instance configuration</Header>}>
          <SpaceBetween size="l">
            <FormField label="DB instance class">
              <Select
                selectedOption={instanceClass}
                onChange={({ detail }) => setInstanceClass(detail.selectedOption)}
                options={instanceClasses.map((c) => ({ label: c, value: c }))}
              />
            </FormField>
            <FormField label="Allocated storage (GiB)">
              <Input
                type="number"
                value={allocatedStorage}
                onChange={({ detail }) => setAllocatedStorage(detail.value)}
              />
            </FormField>
            <FormField label="Initial database name" description="Optional.">
              <Input
                value={dbName}
                onChange={({ detail }) => setDbName(detail.value)}
                placeholder="appdb"
              />
            </FormField>
          </SpaceBetween>
        </Container>
      ),
    },
    {
      title: "Review and create",
      content: (
        <SpaceBetween size="l">
          {error && (
            <Alert type="error" header="Could not create database">
              {error}
            </Alert>
          )}
          <Container header={<Header variant="h2">Review</Header>}>
            <KeyValuePairs
              columns={3}
              items={[
                { label: "Engine", value: `${engine} ${version.value ?? ""}` },
                { label: "Identifier", value: identifier || "—" },
                { label: "Master username", value: masterUsername || "—" },
                { label: "Instance class", value: instanceClass.value ?? "—" },
                { label: "Allocated storage", value: `${allocatedStorage} GiB` },
                { label: "Database name", value: dbName || "—" },
              ]}
            />
          </Container>
        </SpaceBetween>
      ),
    },
  ];

  return (
    <Wizard
      i18nStrings={wizardI18n}
      steps={steps}
      activeStepIndex={activeStepIndex}
      onNavigate={({ detail }) => setActiveStepIndex(detail.requestedStepIndex)}
      onCancel={() => router.push("/services/rds")}
      onSubmit={submit}
      isLoadingNextStep={isPending}
    />
  );
}
