import { Link } from "wouter";
import { useLanguage } from "../../contexts/LanguageContext";
import { BRAND } from "@/config/brand";

export default function Footer() {
  const { t, isRTL } = useLanguage();

  const quickLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/who-is-muhammad", label: "من هو محمد ﷺ؟" },
    { href: "/quran", label: t("nav.quran") },
    { href: "/seerah", label: t("nav.seerah") },
    { href: "/sunnah", label: "دار الحديث والسنة" },
    { href: "/prayer-guide", label: t("nav.prayer_guide") },
    { href: "/daily", label: t("nav.daily_reminders") },
  ];

  const supportLinks = [
    { href: "/who-is-muhammad", label: "عن المنصة ورسالتها" },
    { href: "/sources", label: "خزانة المصادر والتحقيق" },
    { href: "/prophetic-day", label: "الهدي النبوي 24 ساعة" },
  ];

  return (
    <footer className="bg-slate-950 text-white py-12 border-t border-amber-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* App Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-amiri font-bold text-lg border border-amber-400/30">
                ﷺ
              </div>
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="text-xl font-amiri font-bold text-white">
                  {BRAND.name.ar}
                </h3>
                <p className="text-amber-300/80 font-inter text-xs">{BRAND.name.en}</p>
              </div>
            </div>
            
            <p className="text-slate-300 font-cairo text-xs leading-relaxed max-w-md">
              {BRAND.mission.ar}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-cairo font-bold mb-4 text-amber-400">
              {t("footer.quick_links")}
            </h4>
            <ul className="space-y-2 text-xs font-cairo text-slate-300">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-amber-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-sm font-cairo font-bold mb-4 text-amber-400">
              التوثيق والتواصل
            </h4>
            <ul className="space-y-2 text-xs font-cairo text-slate-300">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-amber-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="flex items-center space-x-2 rtl:space-x-reverse pt-2 text-slate-400">
                <span className="material-symbols-outlined text-sm">email</span>
                <span className="font-mono text-[11px]">support@{BRAND.domain}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-cairo text-slate-400">
          <p className="text-center md:text-left mb-4 md:mb-0">
            {BRAND.copyrightNotice}
          </p>
          <div className="font-mono text-emerald-400 text-xs">
            {BRAND.domain}
          </div>
        </div>
      </div>
    </footer>
  );
}
