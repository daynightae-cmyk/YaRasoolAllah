import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";

type Wing =
  | "library"
  | "kids"
  | "media"
  | "home"
  | "audio"
  | "atlas"
  | "tafsir"
  | "seerah"
  | "hadith"
  | "sources"
  | "daily"
  | "basirah"
  | "quran";

interface SectionEntry3DProps {
  wing: Wing;
  children: React.ReactNode;
  active?: boolean;
  onEntered?: () => void;
}

const WING_LABELS: Record<Wing, { ar: string; en: string }> = {
  library: { ar: "المكتبة الكبرى", en: "The Grand Library" },
  kids: { ar: "واحة الأطفال", en: "Children's Oasis" },
  media: { ar: "ستوديو الدعاة", en: "Callers' Studio" },
  home: { ar: "بوابة النور", en: "Gate of Light" },
  audio: { ar: "التلاوات", en: "Recitations" },
  atlas: { ar: "الأطلس التاريخي", en: "Historical Atlas" },
  tafsir: { ar: "التفسير", en: "Tafsir" },
  seerah: { ar: "السيرة النبوية", en: "Prophetic Biography" },
  hadith: { ar: "الحديث النبوي", en: "Prophetic Hadith" },
  sources: { ar: "خزانة المصادر", en: "Sources Vault" },
  daily: { ar: "مرصد الصلاة", en: "Prayer Observatory" },
  basirah: { ar: "بصيرة", en: "Basirah" },
  quran: { ar: "القرآن الكريم", en: "The Qur'an" },
};

interface DoorComponentProps {
  siteNameAr: string;
  siteNameEn?: string;
  active: boolean;
  onEntered: () => void;
  onCancel?: () => void;
  openLabelAr?: string;
  openLabelEn?: string;
}

const SEEN_PREFIX = "yra-door3d-v2-seen-";

function DoorUnavailable({ onEntered }: DoorComponentProps) {
  useEffect(() => {
    onEntered();
  }, [onEntered]);
  return null;
}

// The Three.js door is a separate engine chunk. A chunk-load failure must
// degrade to the route content instead of throwing across the page boundary.
const DoorSimulation3D = lazy<ComponentType<DoorComponentProps>>(() =>
  import("./DoorSimulation3D")
    .then((module) => ({ default: module.DoorSimulation3D as ComponentType<DoorComponentProps> }))
    .catch(() => ({ default: DoorUnavailable })),
);

function hasSeenDoor(wing: Wing): boolean {
  try {
    return sessionStorage.getItem(`${SEEN_PREFIX}${wing}`) === "1";
  } catch {
    return false;
  }
}

/**
 * Stationary-pass guard.
 *
 * A wing may hold a living station: the Library arcade where the visitor walks
 * the hall, or the Seerah terrain studio where the observer stands on a height.
 * Once the visitor has crossed into that station the door must not re-arm on a
 * re-render, a state change, or a re-focus — otherwise it re-mounts over the
 * station, swallows the pointer and takes the camera away every time the view
 * inside updates. The pass is remembered for the session, so re-entering the
 * wing goes straight to the station the reader already chose.
 */
const PASS_PREFIX = "yra-pass-v1-";

function markStationaryPass(wing: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${PASS_PREFIX}${wing}`, "1");
  } catch {
    // Storage can be unavailable; the station still works for this visit.
  }
}

export function hasStationaryPass(wing: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(`${PASS_PREFIX}${wing}`) === "1";
  } catch {
    return false;
  }
}

function forcedDoorPreference(): "0" | "1" | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("door");
  return value === "0" || value === "1" ? value : null;
}

/**
 * The shell's splash ceremony owns the first-arrival moment. A wing doorway
 * must never stack on top of it: while the ceremony is up (or about to be),
 * the door waits; once the ceremony closes, the doorway may appear.
 */
function splashCeremonyActive(): boolean {
  if (typeof window === "undefined") return false;
  const query = new URLSearchParams(window.location.search);
  if (query.get("ceremony") === "0") return false;
  if (query.get("ceremony") === "1") return true;
  try {
    return sessionStorage.getItem("yra-splash") !== "1";
  } catch {
    return false;
  }
}

/**
 * The door is an entrance, not a toll gate.
 *
 * - `?door=1` replays it on demand; `?door=0` skips it.
 * - Reduced-motion users enter directly, including when `?door=1` is present.
 * - After the first entry in a tab, the session remembers it so navigating
 *   between wings never becomes a sequence of doors.
 */
function shouldShowDoor(active: boolean, wing: Wing, reducedMotion: boolean): boolean {
  if (!active || reducedMotion || typeof window === "undefined") return false;
  // Already standing inside this wing's station: never re-arm over it.
  if (hasStationaryPass(wing)) return false;
  const forced = forcedDoorPreference();
  if (forced === "0") return false;
  if (forced === "1") return !splashCeremonyActive();
  if (splashCeremonyActive()) return false;
  return !hasSeenDoor(wing);
}

export function SectionEntry3D({
  wing,
  children,
  active = true,
  onEntered,
}: SectionEntry3DProps) {
  const effectiveMotion = useEffectiveMotion();
  const reducedMotion = effectiveMotion === "reduced";
  const [showDoor, setShowDoor] = useState(() =>
    shouldShowDoor(active, wing, reducedMotion),
  );
  const label = WING_LABELS[wing] ?? WING_LABELS.home;

  // The shell splash may still be up at mount (or forced via ?ceremony=1).
  // Poll lightly until it closes, then re-evaluate the doorway once — the
  // door never stacks over the ceremony, and never reappears after entry.
  useEffect(() => {
    if (!active || reducedMotion || typeof window === "undefined") return;
    if (!splashCeremonyActive()) return;
    const timer = window.setInterval(() => {
      if (!splashCeremonyActive()) {
        window.clearInterval(timer);
        setShowDoor(shouldShowDoor(active, wing, reducedMotion));
      }
    }, 400);
    return () => window.clearInterval(timer);
  }, [active, reducedMotion, wing]);

  const rememberEntry = useCallback(() => {
    try {
      sessionStorage.setItem(`${SEEN_PREFIX}${wing}`, "1");
    } catch {
      // Storage may be unavailable; the route remains directly accessible.
    }
  }, [wing]);

  const handleEntered = useCallback(() => {
    rememberEntry();
    markStationaryPass(wing);
    setShowDoor(false);
    onEntered?.();
  }, [onEntered, rememberEntry, wing]);

  const handleCancel = useCallback(() => {
    rememberEntry();
    markStationaryPass(wing);
    setShowDoor(false);
    onEntered?.();
  }, [onEntered, rememberEntry, wing]);

  useEffect(() => {
    if (!active) {
      setShowDoor(false);
      return;
    }
    if (reducedMotion) {
      setShowDoor(false);
      return;
    }
    // Re-evaluate on mount and when the wing changes. The URL preference must
    // keep winning here: otherwise an unseen wing would re-show the door even
    // when the visitor explicitly asked for `?door=0`, covering the content
    // and swallowing pointer input.
    setShowDoor(shouldShowDoor(active, wing, reducedMotion));
  }, [active, reducedMotion, wing]);

  const doorLabels = useMemo(
    () => ({
      openLabelAr: "افتح الباب",
      openLabelEn: "Open the Door",
    }),
    [],
  );

  return (
    <div
      className="sectionEntry3DWrapper"
      data-stationary-pass={showDoor ? undefined : "1"}
      style={{
        position: "relative",
        minHeight: showDoor ? "100dvh" : undefined,
        height: showDoor ? undefined : "100%",
        width: "100%",
      }}
    >
      {/* Route content is always mounted and remains a DOM equivalent while
          the decorative threshold is present or failing. */}
      <div className="sectionEntry3DContent" style={{ width: "100%" }}>
        {children}
      </div>
      {showDoor ? (
        <Suspense fallback={null}>
          <DoorSimulation3D
            siteNameAr={label.ar}
            siteNameEn={label.en}
            active
            onEntered={handleEntered}
            onCancel={handleCancel}
            openLabelAr={doorLabels.openLabelAr}
            openLabelEn={doorLabels.openLabelEn}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

SectionEntry3D.displayName = "SectionEntry3D";
