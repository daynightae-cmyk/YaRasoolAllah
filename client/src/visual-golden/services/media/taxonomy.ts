import type { MediaDiscoveryRecord } from "./types";

/** Presentation-only aliases. Original acquisition values remain untouched. */
const CATEGORY_ALIASES: Readonly<Record<string, string>> = {
  seerah: "السيرة النبوية",
  "سيرة نبوية": "السيرة النبوية",
  "السيرة النبوية الكاملة": "السيرة النبوية",
};

export function canonicalMediaCategory(category: string | null): string {
  if (!category?.trim()) return "غير مصنّف";
  const original = category.trim();
  return CATEGORY_ALIASES[original] ?? original;
}

export function recordMediaCategory(record: MediaDiscoveryRecord): string {
  return canonicalMediaCategory(record.category);
}
