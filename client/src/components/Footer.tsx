import React from "react";
import { Link } from "wouter";
import { useLanguage } from "../contexts/LanguageContext";
import { BRAND } from "@/config/brand";
import { ShieldCheck, BookOpen, Compass, Award, ExternalLink, Heart, Layers } from "lucide-react";

export default function Footer() {
  const { direction } = useLanguage();

  return (
    <footer className="bg-stone-950 text-stone-200 pt-16 pb-12 border-t border-amber-900/20 text-right selection:bg-amber-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Scholarly & Theological Charter Card (الميثاق العلمي والتنزيه النبوي) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/30 via-stone-900/50 to-stone-950 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-amiri font-bold text-amber-200">
                الميثاق العلمي والتنزيه النبوي الشريف
              </h3>
              <span className="text-[11px] font-mono text-stone-400">
                THEOLOGICAL & SCHOLARLY INTEGRITY CHARTER
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-tajawal text-stone-300 leading-relaxed max-w-4xl">
            {BRAND.nonPersonificationNotice.ar} — نلتزم بالتحقيق الأكاديمي الرصين المستند إلى أمهات مصادر أهل السنة والجماعة وصحيح الحديث والسير المعتمدة، مع التحري في ضبط الروايات وفصل المتواتر والمشهور عن الضعيف، ونبذ كل صورة أو تمثيل أو تخييل للذات النبوية الشريفة.
          </p>
        </div>

        {/* Four Rich Navigational & Institutional Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Column 1: Identity & Foundation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/80 text-amber-300 flex items-center justify-center font-amiri font-bold text-xl border border-amber-500/30">
                ﷺ
              </div>
              <div>
                <h4 className="text-lg font-amiri font-bold text-white leading-tight">
                  {BRAND.name.ar}
                </h4>
                <p className="text-xs font-mono text-emerald-400">yarasoolallah.org</p>
              </div>
            </div>
            <p className="text-xs font-tajawal text-stone-400 leading-relaxed">
              {BRAND.mission.ar}
            </p>
            <div className="pt-2 text-[11px] font-mono text-stone-500">
              <span>الإصدار التوثيقي: 2026.4 · المعيار العلمي الخامس</span>
            </div>
          </div>

          {/* Column 2: Core Knowledge Wings */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold border-b border-amber-900/30 pb-2">
              الأروقة المعرفية الكبرى
            </h4>
            <ul className="space-y-2 text-xs font-tajawal text-stone-300">
              <li>
                <Link href="/who-is-muhammad" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>من هو محمد ﷺ؟ (مدخل عالمي)</span>
                  <span className="text-[10px] font-mono text-stone-500">WHO IS</span>
                </Link>
              </li>
              <li>
                <Link href="/seerah" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>درب السيرة النبوية الشريفة</span>
                  <span className="text-[10px] font-mono text-stone-500">SEERAH</span>
                </Link>
              </li>
              <li>
                <Link href="/quran" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>رِواق القرآن الكريم وتفاسيره</span>
                  <span className="text-[10px] font-mono text-stone-500">QURAN</span>
                </Link>
              </li>
              <li>
                <Link href="/sunnah" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>دار الحديث وصحيح السنة</span>
                  <span className="text-[10px] font-mono text-stone-500">HADITH</span>
                </Link>
              </li>
              <li>
                <Link href="/digital-library" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>خزانة الرفوف والمصادر الرقمية</span>
                  <span className="text-[10px] font-mono text-stone-500">LIBRARY</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Specialized Wings & Living Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold border-b border-amber-900/30 pb-2">
              المعالم والأدوات التعبدية
            </h4>
            <ul className="space-y-2 text-xs font-tajawal text-stone-300">
              <li>
                <Link href="/prophetic-day" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>الهدي النبوي على مدار 24 ساعة</span>
                  <span className="text-[10px] font-mono text-stone-500">DAILY SUNNAH</span>
                </Link>
              </li>
              <li>
                <Link href="/children-tv" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>واحة الأسرة والطفل (نشأة وقيم)</span>
                  <span className="text-[10px] font-mono text-stone-500">FAMILY</span>
                </Link>
              </li>
              <li>
                <Link href="/prayer-guide" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>دليل الصلاة وأوقاتها الشرعية</span>
                  <span className="text-[10px] font-mono text-stone-500">PRAYER</span>
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>التقويم الهجري القمري الشريف</span>
                  <span className="text-[10px] font-mono text-stone-500">CALENDAR</span>
                </Link>
              </li>
              <li>
                <Link href="/qibla-compass" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>بوصلة تحديد اتجاه القبلة</span>
                  <span className="text-[10px] font-mono text-stone-500">QIBLA</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Verification, Rights & Infrastructure */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold border-b border-amber-900/30 pb-2">
              التحقيق والوقف المعرفي
            </h4>
            <div className="space-y-2 text-xs font-tajawal text-stone-400 leading-relaxed">
              <p>
                جميع النصوص التراثية والقرآنية والأحاديث الشريفة موقوفة لله تعالى، ومتاحة لأي باحث أو مؤسسة دون أي حقوق حصرية.
              </p>
              <div className="pt-2 space-y-1 text-[11px] font-mono text-stone-400">
                <div className="flex items-center justify-between border-b border-stone-900 pb-1">
                  <span>هيئة التحرير:</span>
                  <span className="text-stone-300">لجنة التحقيق والمراجعة</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-900 pb-1">
                  <span>المصادر:</span>
                  <span className="text-stone-300">أمهات كتب الحديث والآثار</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>المعمارية:</span>
                  <span className="text-amber-400">KNOUX Digital Edifice</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Dignified Bar */}
        <div className="border-t border-stone-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-tajawal text-stone-500">
          <div className="flex items-center gap-2">
            <span>© {BRAND.currentYear} صرح يا رسول الله ﷺ</span>
            <span>·</span>
            <span className="text-stone-400">{BRAND.copyrightNotice}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-stone-500">
            <span>KNOUX Institutional Edifice</span>
            <span>·</span>
            <span className="text-amber-500/80">yarasoolallah.org</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
