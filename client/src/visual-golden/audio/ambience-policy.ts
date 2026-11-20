/**
 * Pure gain policy for the opt-in procedural ambience.
 *
 * The ambience is a background bed, never a foreground: when speech or
 * recitation is active the bed ducks instead of competing with it. Keeping the
 * policy pure means the ducking curve is contract-tested without an
 * AudioContext or a DOM.
 */

export type AmbientPresence = "none" | "voice";

/** Default bed level. Deliberately low: this is atmosphere, not content. */
export const AMBIENT_BASE_LEVEL = 0.05;

/** Bed level while recitation / speech is active, as a fraction of the bed. */
export const AMBIENT_DUCK_RATIO = 0.12;

export const AMBIENT_MAX_LEVEL = 1;

export function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return 0;
  if (level <= 0) return 0;
  return Math.min(AMBIENT_MAX_LEVEL, level);
}

/**
 * Target level for a given bed and presence. A non-finite base is treated as
 * silence rather than propagated into Web Audio.
 */
export function targetLevel(base: number, presence: AmbientPresence): number {
  const bed = clampLevel(base);
  return presence === "voice" ? bed * AMBIENT_DUCK_RATIO : bed;
}
