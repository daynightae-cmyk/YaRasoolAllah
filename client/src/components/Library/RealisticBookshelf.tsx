import React, { useState } from "react";
import { BookOpen, Download, ShieldCheck, ChevronLeft, Search, Eye, Sparkles, Bookmark, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LibraryBook {
  id: string;
  title: string;
  titleEn: string;
  author: string;
  authorEn: string;
  category: string;
  language: string;
  format: string;
  pages: number;
  description: string;
  descriptionEn?: string;
  downloadUrl: string;
  coverImage?: string;
  publishedYear: number;
  size: string;
  isAudioAvailable?: boolean;
  edition?: string;
  publisher?: string;
  investigator?: string;
  isFoundational?: boolean;
}

// Visual binding profiles for physical books on the shelf
type LeatherType = "oxblood" | "emerald" | "navy" | "walnut" | "parchment";

interface SpineStyle {
  leather: LeatherType;
  bgGradient: string;
  borderGlow: string;
  ribColor: string;
  textColor: string;
  accentGold: string;
}

const LEATHER_PROFILES: Record<LeatherType, SpineStyle> = {
  oxblood: {
    leather: "oxblood",
    bgGradient: "from-[#380e12] via-[#2a0a0d] to-[#1c0608]",
    borderGlow: "rgba(217, 119, 6, 0.35)",
    ribColor: "#170406",
    textColor: "#fde68a",
    accentGold: "#f59e0b",
  },
  emerald: {
    leather: "emerald",
    bgGradient: "from-[#0d3322] via-[#092418] to-[#04130c]",
    borderGlow: "rgba(52, 211, 153, 0.3)",
    ribColor: "#020a06",
    textColor: "#d1fae5",
    accentGold: "#eab308",
  },
  navy: {
    leather: "navy",
    bgGradient: "from-[#0f243a] via-[#0a1a2b] to-[#050d17]",
    borderGlow: "rgba(147, 197, 253, 0.3)",
    ribColor: "#03080e",
    textColor: "#e0f2fe",
    accentGold: "#cbd5e1",
  },
  walnut: {
    leather: "walnut",
    bgGradient: "from-[#3d2415] via-[#2d1a0f] to-[#1f1109]",
    borderGlow: "rgba(245, 158, 11, 0.35)",
    ribColor: "#140a05",
    textColor: "#fef3c7",
    accentGold: "#d97706",
  },
  parchment: {
    leather: "parchment",
    bgGradient: "from-[#2b2519] via-[#1f1b12] to-[#14110a]",
    borderGlow: "rgba(251, 191, 36, 0.3)",
    ribColor: "#0e0c07",
    textColor: "#fef08a",
    accentGold: "#b45309",
  },
};

// Deterministic spine generation from stable book identity to ensure
// consistent visual identity regardless of result array order.
function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getBookSpineProfile(book: LibraryBook, index: number): {
  profile: SpineStyle;
  height: number;
  width: number;
} {
  const leatherTypes: LeatherType[] = ["oxblood", "emerald", "navy", "walnut", "parchment"];
  const stableId = stableHash(book.id || book.title);
  const typeIndex = (stableId + (book.publishedYear % 5)) % leatherTypes.length;
  const leather = leatherTypes[typeIndex];

  // Natural variations in physical height (240px - 285px) and thickness (38px - 54px)
  const heightVariations = [255, 270, 245, 280, 260, 265, 250];
  const widthVariations = [42, 48, 52, 40, 46, 54, 44];

  const height = heightVariations[stableId % heightVariations.length];
  const width = widthVariations[(stableId * 3) % widthVariations.length];
  void index;

  return {
    profile: LEATHER_PROFILES[leather],
    height,
    width,
  };
}

interface RealisticBookshelfProps {
  shelfTitleAr: string;
  shelfTitleEn: string;
  shelfDescriptionAr: string;
  categoryIcon?: string;
  books: LibraryBook[];
  onSelectBook: (book: LibraryBook) => void;
}

export default function RealisticBookshelf({
  shelfTitleAr,
  shelfTitleEn,
  shelfDescriptionAr,
  books,
  onSelectBook,
}: RealisticBookshelfProps) {
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

  return (
    <section className="my-14 space-y-6">
      {/* Shelf Header Banner with Institutional Dignity */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-amber-900/20 dark:border-amber-500/20 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
            <span className="text-xs font-tajawal text-muted-foreground uppercase tracking-wider">
              {shelfTitleEn}
            </span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-xs font-mono text-amber-700 dark:text-amber-400">
              {books.length} مؤلفات
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-amiri font-bold text-foreground flex items-center gap-2">
            {shelfTitleAr}
          </h2>
        </div>
        <p className="text-xs md:text-sm font-tajawal text-muted-foreground max-w-xl text-right leading-relaxed">
          {shelfDescriptionAr}
        </p>
      </div>

      {/* Physical Realistic Bookshelf Container */}
      <div className="relative pt-12 pb-6 px-4 sm:px-8 rounded-2xl bg-gradient-to-b from-stone-900/40 via-stone-950/60 to-stone-950/90 border border-stone-800/60 shadow-2xl overflow-hidden">
        {/* Soft Background Library Ambiance / Back Wall */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.15) 0%, transparent 70%)`,
          }}
        />

        {/* Standing Books Row with Realistic Heights & Spine Tooling */}
        <div className="relative flex items-end justify-start sm:justify-center gap-3 sm:gap-4 md:gap-5 overflow-x-auto pb-2 pt-6 min-h-[310px] scrollbar-thin scrollbar-thumb-amber-900/40">
          {books.map((book, index) => {
            const { profile, height, width } = getBookSpineProfile(book, index);
            const isHovered = hoveredBookId === book.id;

            return (
              <div
                key={book.id}
                className="group relative flex flex-col items-center flex-shrink-0 cursor-pointer select-none transition-all duration-300"
                style={{ width: `${width}px` }}
                onMouseEnter={() => setHoveredBookId(book.id)}
                onMouseLeave={() => setHoveredBookId(null)}
                onClick={() => onSelectBook(book)}
              >
                {/* Floating Hover Label / Tooltip Above Book */}
                <div
                  className={cn(
                    "absolute -top-14 z-30 pointer-events-none transition-all duration-200 transform text-center whitespace-nowrap",
                    isHovered
                      ? "opacity-100 -translate-y-1 scale-100"
                      : "opacity-0 translate-y-2 scale-95"
                  )}
                >
                  <div className="bg-slate-950/95 text-amber-200 text-xs px-3 py-1.5 rounded-lg border border-amber-500/30 shadow-xl backdrop-blur-sm space-y-0.5">
                    <p className="font-amiri font-bold text-sm text-white">{book.title}</p>
                    <p className="text-[11px] font-tajawal text-slate-300">{book.author}</p>
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="w-2 h-2 bg-slate-950 rotate-45 mx-auto border-r border-b border-amber-500/30 -mt-1" />
                </div>

                {/* The 3D Book Spine */}
                <div
                  className={cn(
                    "relative rounded-t-sm overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl",
                    `bg-gradient-to-r ${profile.bgGradient}`,
                    isHovered
                      ? "-translate-y-4 shadow-2xl brightness-110 z-20 scale-105"
                      : "hover:-translate-y-2 z-10"
                  )}
                  style={{
                    height: `${height}px`,
                    width: `${width}px`,
                    boxShadow: isHovered
                      ? `0 20px 30px -8px rgba(0,0,0,0.8), inset 0 0 12px ${profile.borderGlow}, 0 0 16px rgba(217, 119, 6, 0.2)`
                      : "0 10px 18px -4px rgba(0,0,0,0.7), inset 2px 0 5px rgba(255,255,255,0.06), inset -2px 0 5px rgba(0,0,0,0.5)",
                    borderLeft: `1px solid rgba(255,255,255,0.08)`,
                    borderRight: `1px solid rgba(0,0,0,0.6)`,
                  }}
                >
                  {/* Spine Curved Highlights (Cylinder Illusion) */}
                  <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-white/15 via-white/5 to-transparent pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-2.5 bg-gradient-to-l from-black/50 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Gilt Headband & Decorative Cord */}
                  <div className="relative pt-2 px-1 text-center">
                    <div className="w-full h-1 bg-gradient-to-r from-amber-600/30 via-amber-400 to-amber-600/30 rounded-xs mb-1" />
                    <span className="text-[9px] font-mono text-amber-300/70 block">
                      {book.publishedYear}م
                    </span>
                    {/* Upper Raised Cord Rib */}
                    <div
                      className="w-full h-1.5 my-1.5 shadow-inner"
                      style={{ backgroundColor: profile.ribColor }}
                    />
                  </div>

                  {/* Vertical Calligraphic Arabic Title along Spine */}
                  <div className="flex-1 flex items-center justify-center px-1 my-1 overflow-hidden">
                    <div
                      className="writing-mode-vertical text-center font-amiri font-bold tracking-wide select-none leading-none line-clamp-1"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        color: profile.textColor,
                        textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                        fontSize: width > 46 ? "13px" : "11px",
                        maxHeight: `${height - 90}px`,
                      }}
                    >
                      {book.title}
                    </div>
                  </div>

                  {/* Bottom Spine Ornament, Lower Rib & Author Initials */}
                  <div className="relative pb-2 px-1 text-center">
                    {/* Lower Raised Cord Rib */}
                    <div
                      className="w-full h-1.5 my-1.5 shadow-inner"
                      style={{ backgroundColor: profile.ribColor }}
                    />
                    <div className="text-[9px] font-tajawal text-slate-300/80 truncate px-0.5">
                      {book.author.split(" ")[0]}
                    </div>
                    {/* Bottom Gold Gilt Footband */}
                    <div className="w-full h-1 bg-gradient-to-r from-amber-600/30 via-amber-400 to-amber-600/30 rounded-xs mt-1" />
                  </div>
                </div>

                {/* Contact Shadow Under Book */}
                <div
                  className={cn(
                    "w-full h-2 bg-black/80 rounded-full blur-[2px] transition-all duration-300 mt-0.5",
                    isHovered ? "opacity-30 scale-90" : "opacity-90 scale-100"
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Physical Heavy Dark Wood Shelf Plank */}
        <div className="relative w-full z-20">
          {/* Top Surface of the Shelf Plank (Bevel & Warm Light Reflection) */}
          <div className="h-3 w-full bg-gradient-to-r from-[#29170e] via-[#452817] to-[#29170e] border-t border-amber-500/30 shadow-inner flex items-center justify-between px-6">
            <div className="w-16 h-[1px] bg-amber-400/40" />
            <div className="w-32 h-[1px] bg-amber-400/60" />
            <div className="w-16 h-[1px] bg-amber-400/40" />
          </div>

          {/* Front Face of the Shelf Plank (Solid Mahogany Wood Face) */}
          <div className="h-5 w-full bg-gradient-to-b from-[#24130b] via-[#1a0d07] to-[#120804] border-b border-black/80 shadow-2xl flex items-center justify-between px-4">
            <span className="text-[10px] font-mono text-amber-500/40">خزانة الرفوف</span>
            <div className="h-1 w-24 bg-amber-500/20 rounded-full" />
            <span className="text-[10px] font-mono text-amber-500/40">صرح يا رسول الله ﷺ</span>
          </div>

          {/* Cast Shadow Below the Shelf */}
          <div className="h-4 w-full bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
