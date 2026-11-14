import { useCallback, useState } from "react";
import { DoorSimulation } from "./DoorSimulation";

interface SectionEntryProps {
  /** Wing identifier (used for door text and analytics) */
  wing: "library" | "kids" | "media" | "home" | "audio" | "atlas" | "tafsir" | "seerah" | "hadith" | "sources" | "daily" | "basirah" | "quran";
  /** Children to render after the door opens */
  children: React.ReactNode;
  /** Whether the door entry is currently active */
  active?: boolean;
  /** Optional callback after entry completes */
  onEntered?: () => void;
}

/**
 * SectionEntry wraps any section with a realistic door entry experience.
 *
 * Flow:
 * 1. DoorOverlay shows (light first, then door)
 * 2. User clicks "Open Door" → door swings open
 * 3. Children content is revealed
 *
 * The entry state is persisted per-session so returning users don't see
 * the door on every navigation within the same session.
 */
export function SectionEntry({
  wing,
  children,
  active = true,
  onEntered,
}: SectionEntryProps) {
  const SEEN_KEY = `yra-door-seen-${wing}`;
  const [showDoor, setShowDoor] = useState(() => {
    if (typeof window === "undefined") return active;
    try {
      const seen = sessionStorage.getItem(SEEN_KEY);
      // Show door if not seen this session, or if active is forced
      return active && seen !== "1";
    } catch {
      return active;
    }
  });

  const handleEntered = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignore
    }
    setShowDoor(false);
    onEntered?.();
  }, [onEntered]);

  const handleCancel = useCallback(() => {
    setShowDoor(false);
  }, []);

  const wingLabels: Record<string, { ar: string; en: string }> = {
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

  const label = wingLabels[wing] ?? wingLabels.home;
  const dir = typeof document !== "undefined" ? document.documentElement.dir : "rtl";

  return (
    <div className="sectionEntryWrapper" style={{ position: "relative", minHeight: "100vh" }}>
      {showDoor ? (
        <DoorSimulation
          siteNameAr={label.ar}
          siteNameEn={label.en}
          active
          onEntered={handleEntered}
          onCancel={handleCancel}
          openLabelAr={dir === "rtl" ? "افتح الباب" : "Open the Door"}
          openLabelEn={dir === "rtl" ? "افتح الباب" : "Open the Door"}
        />
      ) : null}

      {!showDoor ? (
        <div className="sectionEntryContent" aria-hidden={showDoor}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

SectionEntry.displayName = "SectionEntry";