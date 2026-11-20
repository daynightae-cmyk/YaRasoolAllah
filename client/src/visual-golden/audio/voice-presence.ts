/**
 * Voice-presence bus.
 *
 * The ambience yields to anything spoken or recited. Media elements publish
 * themselves through the document (`play` / `pause` / `ended` / `emptied`), so
 * every existing player participates without its own wiring; non-media voices
 * such as speech synthesis call `setVoiceActive` directly.
 *
 * The bus is a plain module singleton, not a React context, because the engine
 * and the player components both need it without prop drilling.
 */

const listeners = new Set<(active: boolean) => void>();
let active = false;

export function setVoiceActive(next: boolean): void {
  if (next === active) return;
  active = next;
  for (const listener of listeners) listener(next);
}

export function isVoiceActive(): boolean {
  return active;
}

export function subscribeVoiceActive(listener: (active: boolean) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test seam: restore the bus to its initial state. */
export function resetVoiceActive(): void {
  active = false;
  for (const listener of listeners) listener(false);
}

/**
 * Observe every media element in the document. Returns the uninstaller.
 * Safe to call in environments without a `document`.
 */
export function installMediaVoicePresence(
  doc: Document | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!doc) return () => undefined;
  const onPlay = () => setVoiceActive(true);
  const onStop = () => setVoiceActive(false);
  doc.addEventListener("play", onPlay, true);
  doc.addEventListener("pause", onStop, true);
  doc.addEventListener("ended", onStop, true);
  doc.addEventListener("emptied", onStop, true);
  return () => {
    doc.removeEventListener("play", onPlay, true);
    doc.removeEventListener("pause", onStop, true);
    doc.removeEventListener("ended", onStop, true);
    doc.removeEventListener("emptied", onStop, true);
  };
}
