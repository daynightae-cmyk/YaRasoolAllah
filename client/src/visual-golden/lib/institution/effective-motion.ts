import { useEffect, useState } from "react";
import { useInstitution } from "./store";

export type EffectiveMotion = "full" | "reduced";

/** Read the operating-system preference without subscribing 3D scenes to it. */
export function systemPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Resolve the institution's persisted motion preference against the live
 * operating-system preference. Explicit "reduced" always wins; "full" always
 * wins; "system" follows the current OS signal.
 *
 * This is the only motion authority used by the shell and immersive surfaces.
 * Scene components receive the resolved value and must not take their own
 * `matchMedia` snapshots.
 */
export function useEffectiveMotion(): EffectiveMotion {
  const preference = useInstitution((state) => state.motion);
  const hydrated = useInstitution((state) => state.hydrated);
  const [systemReduced, setSystemReduced] = useState(systemPrefersReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Until persisted preferences are hydrated, fail closed for decorative
  // motion. The resolved value updates immediately after storage hydration.
  if (!hydrated) return "reduced";
  if (preference === "reduced") return "reduced";
  if (preference === "full") return "full";
  return systemReduced ? "reduced" : "full";
}
