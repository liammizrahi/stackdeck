"use client";

import Table, {
  type TableProps,
} from "@cloudscape-design/components/table";

export default function ResourceTable<T>(props: TableProps<T>) {
  return <Table<T> variant="full-page" stickyHeader {...props} />;
}
