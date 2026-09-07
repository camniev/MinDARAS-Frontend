// Derives a stable, DB-safe technical key from a human-entered label.
// e.g. "Office" -> "office", "T-Shirt Size" -> "t_shirt_size"
export function slugify(label: string, existingKeys: string[] = []): string {
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "field";

  if (!existingKeys.includes(base)) return base;

  let i = 2;
  while (existingKeys.includes(`${base}_${i}`)) i++;
  return `${base}_${i}`;
}