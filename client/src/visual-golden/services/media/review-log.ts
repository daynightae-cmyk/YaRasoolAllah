/**
 * Local review log for the governed media/adaptation review queue.
 *
 * A recorded decision is a reviewer's action captured on this device. It is
 * NOT publication approval: the public kids/adult media catalogs are only
 * repopulated by the item-level promotion pipeline (scripts/acquire/*), and
 * the registry's cleared-media list stays untouched here. The queue exists
 * so a human reviewer has a clear, actionable work list with full metadata —
 * never so a pending item can publish itself.
 */

export const REVIEW_LOG_STORAGE_KEY = "yra-review-log-v1";

export type ReviewItemKind = "media" | "adaptation";
export type ReviewDecision = "approved" | "rejected" | "changes_requested";

export interface ReviewLogEntry {
  itemId: string;
  itemKind: ReviewItemKind;
  decision: ReviewDecision;
  note: string;
  reviewer: string;
  at: string;
}

export const REVIEW_DECISION_LABELS: Record<ReviewDecision, string> = {
  approved: "اعتماد",
  rejected: "رفض",
  changes_requested: "يحتاج تعديل",
};

const DECISIONS: ReviewDecision[] = ["approved", "rejected", "changes_requested"];

export function isReviewDecision(value: unknown): value is ReviewDecision {
  return typeof value === "string" && (DECISIONS as string[]).includes(value);
}

export function parseReviewLog(raw: string | null): ReviewLogEntry[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const entries: ReviewLogEntry[] = [];
  for (const item of parsed) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as ReviewLogEntry).itemId === "string" &&
      ((item as ReviewLogEntry).itemKind === "media" || (item as ReviewLogEntry).itemKind === "adaptation") &&
      isReviewDecision((item as ReviewLogEntry).decision) &&
      typeof (item as ReviewLogEntry).at === "string"
    ) {
      const entry = item as ReviewLogEntry;
      entries.push({
        itemId: entry.itemId,
        itemKind: entry.itemKind,
        decision: entry.decision,
        note: typeof entry.note === "string" ? entry.note : "",
        reviewer: typeof entry.reviewer === "string" ? entry.reviewer : "",
        at: entry.at,
      });
    }
  }
  return entries;
}

/**
 * Append (or replace) the latest decision for an item. Pure: returns a new
 * array, latest decision per (itemKind, itemId) wins.
 */
export function recordReviewDecision(
  entries: readonly ReviewLogEntry[],
  entry: Omit<ReviewLogEntry, "at"> & { at?: string },
): ReviewLogEntry[] {
  const stamped: ReviewLogEntry = { ...entry, at: entry.at ?? new Date().toISOString() };
  const rest = entries.filter(
    (item) => !(item.itemId === stamped.itemId && item.itemKind === stamped.itemKind),
  );
  return [...rest, stamped];
}

export function decisionFor(
  entries: readonly ReviewLogEntry[],
  itemKind: ReviewItemKind,
  itemId: string,
): ReviewLogEntry | null {
  return (
    entries.find((item) => item.itemId === itemId && item.itemKind === itemKind) ?? null
  );
}

export function summarizeReviewLog(
  entries: readonly ReviewLogEntry[],
): Record<ReviewDecision, number> {
  const summary: Record<ReviewDecision, number> = {
    approved: 0,
    rejected: 0,
    changes_requested: 0,
  };
  for (const entry of entries) summary[entry.decision] += 1;
  return summary;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStorage(): StorageLike | null {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    // non-browser environment (tests, SSR): no persistent log
  }
  return null;
}

export function loadReviewLog(storage: StorageLike | null = defaultStorage()): ReviewLogEntry[] {
  if (!storage) return [];
  try {
    return parseReviewLog(storage.getItem(REVIEW_LOG_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveReviewLog(
  entries: readonly ReviewLogEntry[],
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(REVIEW_LOG_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or blocked: the in-memory queue still works for this session
  }
}
