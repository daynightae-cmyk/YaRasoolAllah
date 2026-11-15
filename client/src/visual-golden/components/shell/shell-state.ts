import styles from "./shell.module.css";

export const WING_STATE_CLASS = {
  operational: styles.stateOperational,
  review: styles.stateReview,
  catalog: styles.stateCatalog,
} as const;

export type StatusTone = "available" | "review" | "blocked" | "neutral";

export const STATUS_TONE_CLASS = {
  available: styles.statusAvailable,
  review: styles.statusReview,
  blocked: styles.statusBlocked,
  neutral: styles.statusNeutral,
} as const;
