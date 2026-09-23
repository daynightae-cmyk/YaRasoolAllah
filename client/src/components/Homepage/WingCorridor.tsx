import React from "react";
import { Link } from "wouter";
import { INSTITUTION_WINGS, type WingDefinition } from "@/config/brand";
import { cn } from "@/lib/utils";
import {
  Compass,
  BookOpen,
  Feather,
  Library,
  Baby,
  Sun,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const WING_ICONS: Record<string, LucideIcon> = {
  "prophetic-seerah": Compass,
  "quran-colonnade": BookOpen,
  "dar-al-hadith": Feather,
  "library-shelves": Library,
  "family-and-kids": Baby,
  "daily-sanctuary": Sun,
  "source-registry": ShieldCheck,
};

const WING_TINTS: Record<string, { glow: string; ring: string; text: string }> = {
  "prophetic-seerah": {
    glow: "rgba(197, 134, 65, 0.12)",
    ring: "rgba(197, 134, 65, 0.45)",
    text: "#c58641",
  },
  "quran-colonnade": {
    glow: "rgba(46, 115, 95, 0.12)",
    ring: "rgba(46, 115, 95, 0.40)",
    text: "#2e735f",
  },
  "dar-al-hadith": {
    glow: "rgba(115, 195, 189, 0.10)",
    ring: "rgba(115, 195, 189, 0.40)",
    text: "#73c3bd",
  },
  "library-shelves": {
    glow: "rgba(139, 92, 60, 0.12)",
    ring: "rgba(139, 92, 60, 0.40)",
    text: "#a07042",
  },
  "family-and-kids": {
    glow: "rgba(220, 150, 100, 0.10)",
    ring: "rgba(220, 150, 100, 0.40)",
    text: "#d49564",
  },
  "daily-sanctuary": {
    glow: "rgba(247, 199, 92, 0.10)",
    ring: "rgba(247, 199, 92, 0.40)",
    text: "#c7a030",
  },
  "source-registry": {
    glow: "rgba(132, 184, 168, 0.10)",
    ring: "rgba(132, 184, 168, 0.38)",
    text: "#84b8a8",
  },
};

function WingChamber({ wing }: { wing: WingDefinition }) {
  const Icon = WING_ICONS[wing.id] ?? Compass;
  const tint = WING_TINTS[wing.id] ?? WING_TINTS["prophetic-seerah"];

  return (
    <Link
      href={wing.path}
      className="wing-chamber group"
      style={{
        "--wing-glow": tint.glow,
        "--wing-ring": tint.ring,
        "--wing-text": tint.text,
      } as React.CSSProperties}
      aria-label={wing.nameAr}
    >
      {/* Ambient glow band */}
      <div className="wing-chamber__glow" aria-hidden="true" />

      {/* Wing number — architectural */}
      <span className="wing-chamber__number">{String(wing.number).padStart(2, "0")}</span>

      {/* Icon seal */}
      <div className="wing-chamber__seal">
        <Icon className="w-6 h-6" />
      </div>

      {/* Identity */}
      <div className="wing-chamber__identity">
        <h3 className="wing-chamber__name">{wing.nameAr}</h3>
        {wing.badge && (
          <span className="wing-chamber__badge">{wing.badge}</span>
        )}
      </div>

      {/* Tagline */}
      <p className="wing-chamber__tagline">{wing.taglineAr}</p>

      {/* Enter indicator */}
      <div className="wing-chamber__enter">
        <span>دخول</span>
      </div>
    </Link>
  );
}

export default function WingCorridor() {
  const wings = INSTITUTION_WINGS.filter((w) => w.id !== "gate-of-light");

  return (
    <div className="wing-corridor">
      {wings.map((wing) => (
        <WingChamber key={wing.id} wing={wing} />
      ))}
    </div>
  );
}
