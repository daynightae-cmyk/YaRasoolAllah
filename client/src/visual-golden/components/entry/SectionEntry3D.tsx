import { useCallback, useMemo, useState } from "react";
import { DoorSimulation3D } from "./DoorSimulation3D";

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

const SEEN_PREFIX = "yra-door3d-v2-seen-";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The door is an entrance, not a toll gate.
 *
 * - `?door=1` replays it on demand; `?door=0` skips it.
 * - Reduced-motion users enter directly. The door is decorative, so blocking
 *   them behind an animation would be an accessibility regression.
 * - After the first entry in a tab, the session remembers it so navigating
 *   between wings never becomes a sequence of doors.
 */
function shouldShowDoor(active: boolean, wing: Wing) {
  if (!active) return false;
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("door") === "0") return false;
  if (params.get("door") === "1") return true;
  if (prefersReducedMotion()) return false;
  try {
    return sessionStorage.getItem(`${SEEN_PREFIX}${wing}`) !== "1";
  } catch {
    return true;
  }
}

export function SectionEntry3D({
  wing,
  children,
  active = true,
  onEntered,
}: SectionEntry3DProps) {
  const [showDoor, setShowDoor] = useState(() => shouldShowDoor(active, wing));
  const label = WING_LABELS[wing] ?? WING_LABELS.home;

  const rememberEntry = useCallback(() => {
    try {
      sessionStorage.setItem(`${SEEN_PREFIX}${wing}`, "1");
    } catch {
      // Storage may be unavailable; the door still opens.
    }
  }, [wing]);

  const handleEntered = useCallback(() => {
    rememberEntry();
    setShowDoor(false);
    onEntered?.();
  }, [onEntered, rememberEntry]);

  const handleCancel = useCallback(() => {
    rememberEntry();
    setShowDoor(false);
    onEntered?.();
  }, [onEntered, rememberEntry]);

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
      style={{
        position: "relative",
        minHeight: showDoor ? "100dvh" : undefined,
        width: "100%",
      }}
    >
      {showDoor ? (
        <DoorSimulation3D
          siteNameAr={label.ar}
          siteNameEn={label.en}
          active
          onEntered={handleEntered}
          onCancel={handleCancel}
          openLabelAr={doorLabels.openLabelAr}
          openLabelEn={doorLabels.openLabelEn}
        />
      ) : (
        <div className="sectionEntry3DContent" style={{ width: "100%" }}>
          {children}
        </div>
      )}
    </div>
  );
}

SectionEntry3D.displayName = "SectionEntry3D";
