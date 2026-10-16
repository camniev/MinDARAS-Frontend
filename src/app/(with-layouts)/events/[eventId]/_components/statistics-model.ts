import { RegistrationListItem } from "@/utils/mindaras-api-types";

export type Bucket = { label: string; registered: number; checkedIn: number };

export type Aggregation = {
  buckets: Bucket[]; // sorted by registered, descending
  answered: number; // registrations that gave a non-empty answer
  total: number; // all registrations
};

const normalizeKey = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

export function aggregateByField(
  registrations: RegistrationListItem[],
  fieldId: string,
): Aggregation {
  type Working = { variants: Map<string, number>; registered: number; checkedIn: number };
  const groups = new Map<string, Working>();
  let answered = 0;

  for (const r of registrations) {
    const raw = r.responses.find((x) => x.fieldId === fieldId)?.fieldValue?.trim();
    if (!raw) continue; // e.g. someone who declined consent never saw this question
    answered++;

    const display = raw.replace(/\s+/g, " ");
    const key = normalizeKey(raw);
    const group = groups.get(key) ?? { variants: new Map(), registered: 0, checkedIn: 0 };
    group.variants.set(display, (group.variants.get(display) ?? 0) + 1);
    group.registered++;
    if (r.checkInTime) group.checkedIn++;
    groups.set(key, group);
  }

  const buckets: Bucket[] = [...groups.values()].map((g) => ({
    // show the spelling people used most often
    label: [...g.variants.entries()].sort((a, b) => b[1] - a[1])[0][0],
    registered: g.registered,
    checkedIn: g.checkedIn,
  }));
  buckets.sort((a, b) => b.registered - a.registered || a.label.localeCompare(b.label));

  return { buckets, answered, total: registrations.length };
}

/** Keeps the chart readable: the top `limit` buckets plus one "Others" bucket for the rest. */
export function topWithOthers(buckets: Bucket[], limit: number): Bucket[] {
  if (buckets.length <= limit) return buckets;
  const rest = buckets.slice(limit);
  return [
    ...buckets.slice(0, limit),
    {
      label: `Others (${rest.length})`,
      registered: rest.reduce((sum, b) => sum + b.registered, 0),
      checkedIn: rest.reduce((sum, b) => sum + b.checkedIn, 0),
    },
  ];
}

export const truncateLabel = (max: number) => (value: string) =>
  value.length > max ? `${value.slice(0, max)}…` : value;

/** Pie/donut slice label: "Male: 12 (48%)". Zero-value slices get no label so they don't pile up at one point. */
export const donutLabel = (total: number) => (p: { name?: string; value?: number }) =>
  p.value ? `${p.name}: ${p.value} (${Math.round((p.value / total) * 100)}%)` : "";
