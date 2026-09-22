import { Link } from "wouter";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Footer() {
  const { t, isRTL } = useLanguage();

  const quickLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/quran", label: t("nav.quran") },
    { href: "/seerah", label: t("nav.seerah") },
    { href: "/prayer-guide", label: t("nav.prayer_guide") },
    { href: "/daily-reminders", label: t("nav.daily_reminders") },
  ];

  const supportLinks = [
    { href: "/help", label: t("footer.help_center") },
    { href: "/faq", label: t("footer.faq") },
    { href: "/privacy", label: t("footer.privacy_policy") },
    { href: "/terms", label: t("footer.terms_of_service") },
  ];

  return (
    <footer className="bg-emerald-800 dark:bg-emerald-900 text-white py-12 transition-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* App Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-2 rounded-xl">
                <span className="material-symbols-outlined text-white text-2xl">menu_book</span>
              </div>
              <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="text-xl font-amiri font-bold text-white">
                  {t("app.name")}
                </h3>
                <p className="text-emerald-200 font-inter">Al-Kitab Al-Mubeen</p>
              </div>
            </div>
            
            <p className="text-emerald-100 font-inter leading-relaxed mb-6 max-w-md">
              {t("app.description")}
            </p>
            
            <div className="flex space-x-4 rtl:space-x-reverse">
              <button className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg transition-colors font-medium">
                {t("footer.download_app")}
              </button>
              <button className="border border-emerald-600 hover:border-emerald-500 px-6 py-2 rounded-lg transition-colors font-medium">
                {t("footer.contact_us")}
              </button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-amiri font-bold mb-4">
              {t("footer.quick_links")}
            </h4>
            <ul className="space-y-3 text-emerald-100">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-white transition-colors hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-lg font-amiri font-bold mb-4">
              {t("footer.support")}
            </h4>
            <ul className="space-y-3 text-emerald-100">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-white transition-colors hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="material-symbols-outlined text-sm">email</span>
                <span>support@alkitab-almubeen.com</span>
              </li>
              <li className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="material-symbols-outlined text-sm">support</span>
                <span>{t("footer.support_available")}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-emerald-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-emerald-200 font-inter text-center md:text-left mb-4 md:mb-0">
            {t("footer.copyright")} © 2024 {t("app.name")} - {t("footer.all_rights_reserved")}
          </p>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button className="p-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button className="p-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors">
              <span className="material-symbols-outlined">favorite</span>
            </button>
            <button className="p-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors">
              <span className="material-symbols-outlined">star</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
