import React from "react";
import { BookOpen, Download, Volume2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  language: string;
  format: string;
  pages: number;
  description: string;
  downloadUrl: string;
  coverImage?: string;
  tags: string[];
  publishedYear: number;
  size: string;
  isAudioAvailable: boolean;
  audioUrl?: string;
}

interface BookCardProps {
  book: Book;
  onRead: () => void;
  onDownload: () => void;
  viewMode?: "grid" | "list";
}

export default function BookCard({
  book,
  onRead,
  onDownload,
  viewMode = "grid",
}: BookCardProps) {
  if (viewMode === "list") {
    return (
      <article className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-xs hover:border-amber-600/40 transition-colors text-right flex flex-col sm:flex-row gap-5 items-start">
        {/* Cover / Book Shape */}
        <div
          onClick={onRead}
          className="w-20 aspect-[2/3] shrink-0 rounded-r-md rounded-l-xs bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-amber-100 flex flex-col justify-between p-2.5 shadow-md cursor-pointer border border-amber-950/30 group"
        >
          <div className="text-[9px] font-mono text-amber-400 uppercase">{book.format}</div>
          <div className="text-center font-amiri font-bold text-xs line-clamp-2 text-amber-100">
            {book.title}
          </div>
          <div className="text-[9px] font-mono text-amber-400/80">{book.publishedYear}م</div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3
                onClick={onRead}
                className="text-lg font-amiri font-bold text-foreground cursor-pointer hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
              >
                {book.title}
              </h3>
              <p className="text-xs font-cairo text-muted-foreground">{book.author}</p>
            </div>

            {/* Zero-Pill Quiet Metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-tajawal">
              <span>{book.category}</span>
              <span>·</span>
              <span className="font-mono">{book.pages} صفحة</span>
              <span>·</span>
              <span className="font-mono uppercase">{book.size}</span>
            </div>
          </div>

          <p className="text-xs font-tajawal text-muted-foreground leading-relaxed line-clamp-2">
            {book.description}
          </p>

          <div className="pt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {book.isAudioAvailable && (
                <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-400">
                  <Volume2 className="w-3.5 h-3.5" />
                  متاح صوتياً
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="text-xs font-cairo h-8 px-3 gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                تحميل
              </Button>
              <Button
                size="sm"
                onClick={onRead}
                className="text-xs font-cairo h-8 px-3 gap-1.5 bg-amber-700 hover:bg-amber-800 text-white"
              >
                <BookOpen className="w-3.5 h-3.5" />
                قراءة
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-xs hover:border-amber-600/40 transition-all text-right flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Book Spine Simulation */}
        <div
          onClick={onRead}
          className="w-full aspect-[3/4] max-w-[140px] mx-auto rounded-r-md rounded-l-xs bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-amber-100 flex flex-col justify-between p-3.5 shadow-md cursor-pointer border border-amber-950/30 group hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
            <span className="uppercase">{book.format}</span>
            <span>{book.publishedYear}م</span>
          </div>

          <div className="text-center my-auto space-y-1">
            <h4 className="font-amiri font-bold text-sm leading-snug line-clamp-3 text-amber-100">
              {book.title}
            </h4>
            <p className="text-[11px] font-tajawal text-amber-300/80 line-clamp-1">{book.author}</p>
          </div>

          <div className="text-left text-[10px] font-mono text-amber-400/80">
            {book.pages} ص
          </div>
        </div>

        {/* Quiet unboxed title & author */}
        <div className="space-y-1 pt-1">
          <h3
            onClick={onRead}
            className="font-cairo font-bold text-sm text-foreground line-clamp-1 cursor-pointer hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            {book.title}
          </h3>
          <p className="text-xs font-tajawal text-muted-foreground line-clamp-1">{book.author}</p>
        </div>

        {/* Unboxed Metadata (Zero Pill) */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-tajawal">
          <span>{book.category}</span>
          <span>·</span>
          <span className="font-mono">{book.pages} ص</span>
          <span>·</span>
          <span className="font-mono uppercase">{book.size}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="text-xs font-cairo h-8 px-2.5 gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          تحميل
        </Button>
        <Button
          size="sm"
          onClick={onRead}
          className="text-xs font-cairo h-8 px-3 gap-1.5 bg-amber-700 hover:bg-amber-800 text-white flex-1"
        >
          <BookOpen className="w-3.5 h-3.5" />
          قراءة
        </Button>
      </div>
    </article>
  );
}
