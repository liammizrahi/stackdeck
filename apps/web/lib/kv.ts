import type { ReactNode } from "react";
import type { KeyValuePairsProps } from "@cloudscape-design/components/key-value-pairs";

export interface KvPair {
  label: ReactNode;
  value: ReactNode;
  id?: string;
}

export function columnGroups(
  items: KvPair[],
  columns: number,
): KeyValuePairsProps.Item[] {
  const rows = Math.ceil(items.length / Math.max(1, columns));
  const groups: KeyValuePairsProps.Item[] = [];
  for (let c = 0; c < columns; c++) {
    const slice = items.slice(c * rows, (c + 1) * rows);
    if (slice.length > 0) {
      groups.push({ type: "group", items: slice });
    }
  }
  return groups;
}
