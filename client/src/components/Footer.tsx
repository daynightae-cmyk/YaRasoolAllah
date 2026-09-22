import { Link } from "wouter";
import { useLanguage } from "../contexts/LanguageContext";

export default function Footer() {
  const { t, direction } = useLanguage();

  return (
    <footer className="bg-emerald-800 dark:bg-emerald-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* App Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="gradient-gold p-3 rounded-xl">
                <span className="material-symbols-outlined text-white text-xl">menu_book</span>
              </div>
              <div className={`${direction === "rtl" ? "text-right" : "text-left"}`}>
                <h3 className="text-xl font-amiri font-bold text-white">
                  {t("app.name")}
                </h3>
                <p className="text-emerald-400 font-inter">Al-Kitab Al-Mubeen</p>
              </div>
            </div>
            <p className="text-emerald-100 font-inter leading-relaxed mb-6">
              منصة إسلامية شاملة تهدف إلى نشر المعرفة الإسلامية الأصيلة وتقديم أدوات عملية للمسلمين في جميع أنحاء العالم
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <button className="p-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors">
                <span className="material-symbols-outlined">share</span>
              </button>
              <button className="p-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors">
                <span className="material-symbols-outlined">favorite</span>
              </button>
              <button className="p-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors">
                <span className="material-symbols-outlined">bookmark</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-amiri font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 font-inter">
              <li>
                <Link href="/quran">
                  <a className="text-emerald-200 hover:text-white transition-colors">
                    {t("nav.quran")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/seerah">
                  <a className="text-emerald-200 hover:text-white transition-colors">
                    {t("nav.seerah")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/prayer-guide">
                  <a className="text-emerald-200 hover:text-white transition-colors">
                    دليل الصلاة
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant">
                  <a className="text-emerald-200 hover:text-white transition-colors">
                    {t("nav.assistant")}
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-amiri font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-2 font-inter">
              <li className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-200">
                <span className="material-symbols-outlined text-sm">email</span>
                <span>info@alkitab-almubeen.com</span>
              </li>
              <li className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-200">
                <span className="material-symbols-outlined text-sm">support</span>
                <span>دعم فني متاح 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-700 mt-8 pt-8 text-center font-inter text-emerald-200">
          <p>&copy; 2024 الكتاب المبين - جميع الحقوق محفوظة</p>
          <p className="mt-2 text-sm">
            تصميم وتطوير: <span className="text-gold-400 font-medium">Sadek Elgazar</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
