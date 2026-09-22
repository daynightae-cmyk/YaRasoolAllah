import { Link } from "wouter";
import { useLanguage } from "../contexts/LanguageContext";
import { BRAND } from "@/config/brand";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  const { t, direction } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-200 py-12 border-t border-amber-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Religious non-personification rule banner */}
        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs font-cairo flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-200">{BRAND.nonPersonificationNotice.ar}</span>
            <p className="text-slate-400 text-[11px] font-tajawal">{BRAND.nonPersonificationNotice.en}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* App Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-amiri font-bold text-lg border border-amber-400/30">
                ﷺ
              </div>
              <div className={`${direction === "rtl" ? "text-right" : "text-left"}`}>
                <h3 className="text-xl font-amiri font-bold text-white">
                  {BRAND.name.ar}
                </h3>
                <p className="text-emerald-400 text-xs font-mono">{BRAND.domain}</p>
              </div>
            </div>
            <p className="text-slate-300 text-xs font-cairo leading-relaxed max-w-lg">
              {BRAND.mission.ar}
            </p>
          </div>

          {/* Institutional Wings Links */}
          <div>
            <h4 className="text-sm font-cairo font-bold mb-3 text-amber-400">أروقة الصرح</h4>
            <ul className="space-y-1.5 text-xs font-cairo text-slate-300">
              <li>
                <Link href="/who-is-muhammad" className="text-amber-200 hover:text-white transition-colors font-semibold">
                  من هو محمد ﷺ؟ (مدخل للإنسانية)
                </Link>
              </li>
              <li>
                <Link href="/seerah" className="hover:text-white transition-colors">
                  درب السيرة النبوية
                </Link>
              </li>
              <li>
                <Link href="/quran" className="hover:text-white transition-colors">
                  رِواق القرآن والتلاوات
                </Link>
              </li>
              <li>
                <Link href="/sunnah" className="hover:text-white transition-colors">
                  دار الحديث وصحيح السنة
                </Link>
              </li>
            </ul>
          </div>

          {/* Library & Tools */}
          <div>
            <h4 className="text-sm font-cairo font-bold mb-3 text-amber-400">المعرفة والأدوات</h4>
            <ul className="space-y-1.5 text-xs font-cairo text-slate-300">
              <li>
                <Link href="/digital-library" className="hover:text-white transition-colors">
                  مكتبة الرفوف الرقمية
                </Link>
              </li>
              <li>
                <Link href="/children-tv" className="hover:text-white transition-colors">
                  واحة الطفل والأسرة
                </Link>
              </li>
              <li>
                <Link href="/prayer-guide" className="hover:text-white transition-colors">
                  دليل الصلاة ومواقيتها
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-white transition-colors">
                  التقويم الهجري الشريف
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-tajawal gap-2">
          <p>© {BRAND.currentYear} {BRAND.name.ar} ({BRAND.name.en}) — {BRAND.copyrightNotice}</p>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>{BRAND.domain}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
