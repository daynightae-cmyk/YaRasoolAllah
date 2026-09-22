import React from "react";
import { BookOpen, Download, Volume2, ShieldCheck, ExternalLink, ChevronLeft } from "lucide-react";
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
  investigator?: string; // المحقق
  isFoundational?: boolean;
}

interface LivingShelfProps {
  shelfTitleAr: string;
  shelfTitleEn: string;
  shelfDescriptionAr: string;
  books: LibraryBook[];
  onRead: (book: LibraryBook) => void;
  onDownload: (book: LibraryBook) => void;
  onInspectEvidence?: (book: LibraryBook) => void;
}

export default function LivingShelf({
  shelfTitleAr,
  shelfTitleEn,
  shelfDescriptionAr,
  books,
  onRead,
  onDownload,
  onInspectEvidence,
}: LivingShelfProps) {
  return (
    <section className="space-y-4 my-10">
      {/* Shelf Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-amber-900/15 dark:border-amber-500/15 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span className="text-xs font-tajawal text-muted-foreground">
              {shelfTitleEn}
            </span>
          </div>
          <h2 className="text-2xl font-amiri font-bold text-foreground">
            {shelfTitleAr}
          </h2>
        </div>
        <p className="text-xs font-tajawal text-muted-foreground max-w-md text-right">
          {shelfDescriptionAr}
        </p>
      </div>

      {/* Living Books Row On Physical Shelf */}
      <div className="relative pt-6 pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 items-end">
          {books.map((book) => {
            return (
              <div
                key={book.id}
                className="group relative flex flex-col items-center cursor-pointer transition-all duration-200"
                onClick={() => onRead(book)}
              >
                {/* 3D Book Binding with Spine Lighting */}
                <div
                  className={cn(
                    "w-full aspect-[2/3] max-w-[170px] rounded-r-md rounded-l-xs overflow-hidden relative shadow-lg group-hover:-translate-y-3 transition-transform duration-200 border border-amber-950/20",
                    "bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-amber-100 flex flex-col justify-between p-3.5"
                  )}
                  style={{
                    boxShadow: "inset 4px 0 8px rgba(0,0,0,0.5), 0 12px 24px -6px rgba(0,0,0,0.4)",
                  }}
                >
                  {/* Spine Highlight Stripe (Left Edge) */}
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-amber-500/20 via-white/10 to-transparent" />

                  {/* Top Ornament / Language */}
                  <div className="flex items-center justify-between text-[10px] text-amber-400/80 font-mono">
                    <span className="uppercase">{book.format}</span>
                    <span>{book.publishedYear}م</span>
                  </div>

                  {/* Title & Author on Cover */}
                  <div className="text-center my-auto space-y-1 z-10">
                    <div className="w-8 h-8 mx-auto rounded-full border border-amber-400/30 flex items-center justify-center text-amber-300 text-xs font-amiri mb-1">
                      📖
                    </div>
                    <h3 className="font-amiri font-bold text-sm leading-snug line-clamp-3 text-amber-100">
                      {book.title}
                    </h3>
                    <p className="text-[11px] font-tajawal text-amber-300/80 line-clamp-1">
                      {book.author}
                    </p>
                  </div>

                  {/* Bottom Spine Detail */}
                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-mono text-amber-400/70">
                    <span>{book.pages} ص</span>
                    {book.isAudioAvailable && (
                      <Volume2 className="w-3 h-3 text-amber-400" />
                    )}
                  </div>
                </div>

                {/* Quiet Unboxed Book Label Underneath */}
                <div className="w-full text-right mt-3 space-y-0.5">
                  <h4 className="text-xs font-cairo font-bold text-foreground line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {book.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-tajawal">
                    <span>{book.author}</span>
                    <span>·</span>
                    <span className="font-mono">{book.pages} ص</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Physical Wooden / Stone Shelf Ledge */}
        <div className="w-full h-4 mt-3 rounded-sm bg-gradient-to-r from-amber-950 via-stone-800 to-amber-950 shadow-md border-t-2 border-amber-600/40 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        </div>
      </div>
    </section>
  );
}
