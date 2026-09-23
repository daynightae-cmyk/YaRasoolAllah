import React from "react";
import { Link } from "wouter";
import { BRAND, INSTITUTION_WINGS } from "@/config/brand";
import { ShieldCheck, Heart, ExternalLink } from "lucide-react";

export default function InstitutionalFooter() {
  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-amber-950/40 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Religious Non-Personification Banner (Section 01) */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs font-cairo leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-amber-200 font-bold">{BRAND.nonPersonificationNotice.ar}</p>
            <p className="text-slate-400 font-tajawal text-[11px]">
              {BRAND.nonPersonificationNotice.en}
            </p>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-right">
          {/* Col 1: Identity */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-amiri font-bold text-2xl text-amber-300 leading-none">ﷺ</span>
              <h3 className="font-amiri font-bold text-xl text-white">{BRAND.name.ar}</h3>
            </div>
            <p className="text-xs font-tajawal text-slate-400 leading-relaxed">
              {BRAND.tagline.ar}
            </p>
            <div className="pt-2 text-xs font-mono text-emerald-400">
              النطاق المعلن في وثيقة المشروع: {BRAND.domain}
            </div>
          </div>

          {/* Col 2: Wings 1-4 */}
          <div className="space-y-2">
            <h4 className="font-cairo font-bold text-sm text-amber-400">أروقة الصرح</h4>
            <ul className="space-y-1.5 text-xs font-cairo text-slate-300">
              <li>
                <Link href="/" className="hover:text-amber-300 transition-colors">
                  بوابة النور (الرئيسية)
                </Link>
              </li>
              <li>
                <Link href="/who-is-muhammad" className="hover:text-amber-300 transition-colors font-semibold text-amber-200">
                  من هو محمد ﷺ؟ (مدخل للإنسانية)
                </Link>
              </li>
              <li>
                <Link href="/seerah" className="hover:text-amber-300 transition-colors">
                  درب السيرة (التسلسل والمشاهد)
                </Link>
              </li>
              <li>
                <Link href="/quran" className="hover:text-amber-300 transition-colors">
                  رِواق القرآن والتلاوات
                </Link>
              </li>
              <li>
                <Link href="/sunnah" className="hover:text-amber-300 transition-colors">
                  دار الحديث وصحيح السنة
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Wings 5-8 */}
          <div className="space-y-2">
            <h4 className="font-cairo font-bold text-sm text-amber-400">المعرفة والأسرة</h4>
            <ul className="space-y-1.5 text-xs font-cairo text-slate-300">
              <li>
                <Link href="/library" className="hover:text-amber-300 transition-colors">
                  مكتبة الرفوف الرقمية
                </Link>
              </li>
              <li>
                <Link href="/kids" className="hover:text-amber-300 transition-colors">
                  ركن الأسرة والطفل
                </Link>
              </li>
              <li>
                <Link href="/daily" className="hover:text-amber-300 transition-colors">
                  محراب اليوم (المواقيت والأذكار)
                </Link>
              </li>
              <li>
                <Link href="/prophetic-day" className="hover:text-amber-300 transition-colors font-semibold text-emerald-300">
                  24 ساعة في رحاب الهدي النبوي
                </Link>
              </li>
              <li>
                <Link href="/character" className="hover:text-amber-300 transition-colors">
                  القيم والشمائل النبوية
                </Link>
              </li>
              <li>
                <Link href="/sources" className="hover:text-amber-300 transition-colors">
                  خزانة المصادر والتحقيق
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Methodological Commitment */}
          <div className="space-y-2 text-xs font-cairo">
            <h4 className="font-cairo font-bold text-sm text-amber-400">الأمانة العلمية</h4>
            <p className="text-slate-400 leading-relaxed">
              تميّز المنصة بين النص والمصدر والطبعة وقرار الحقوق. ما لم يكتمل توثيقه يظهر صراحةً بوصفه قيد المراجعة، ولا يُعرض النقص على أنه اعتماد مكتمل.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              بريد المشروع المعلن: {BRAND.contactEmail}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-tajawal gap-3">
          <p>© {BRAND.currentYear} {BRAND.name.ar} — صرح رقمي عالمي مستقل لوجه الله تعالى.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>خالٍ من الإعلانات التجارية</span>
            <span>•</span>
            <span>خالٍ من التجسيد</span>
            <span>•</span>
            <span className="font-mono text-slate-400">{BRAND.domain}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
