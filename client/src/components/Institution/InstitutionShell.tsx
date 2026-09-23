import React from "react";
import InstitutionalHeader from "./InstitutionalHeader";
import InstitutionalFooter from "./InstitutionalFooter";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  childrenAdaptationRegistry,
  digitalVersionRegistry,
  mediaAssetRegistry,
  workRegistry,
} from "@shared/knowledge-registry";
import {
  providerResourceRegistry,
  sourceRegistry,
} from "@shared/source-registry";
import {
  Sparkles,
  Compass,
  BookOpen,
  Library,
  Sun,
  Baby,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InstitutionShellProps {
  children: React.ReactNode;
  activeWing?: string;
  hideFooter?: boolean;
}

const DOCK_ITEMS = [
  { href: "/", label: "الرئيسية", icon: Sparkles },
  { href: "/who-is-muhammad", label: "من هو ﷺ", icon: Heart },
  { href: "/seerah", label: "السيرة", icon: Compass },
  { href: "/quran", label: "القرآن", icon: BookOpen },
  { href: "/library", label: "المكتبة", icon: Library },
  { href: "/daily", label: "اليوم", icon: Sun },
];

interface TruthRail {
  wing: string;
  status: string;
  summary: string;
  facts: string[];
}

function getTruthRail(location: string, activeWing: string | undefined, isLtrLanguage: boolean): TruthRail {
  if (location.startsWith("/library") || location.startsWith("/books") || location.startsWith("/digital-library")) {
    return {
      wing: isLtrLanguage ? "Library" : "مكتبة الرفوف",
      status: isLtrLanguage ? "Real catalog · internal reading is conditional" : "فهرس حقيقي · قراءة داخلية مشروطة",
      summary: isLtrLanguage
        ? "Each visible record maps to a real work and registered digital version; no download or full-text reader is claimed before version rights are proven."
        : "كل سجل ظاهر يعود إلى عمل ونسخة رقمية مسجلة؛ لا تنزيل ولا قارئ نص كامل قبل ثبوت حق النسخة.",
      facts: isLtrLanguage
        ? [`${workRegistry.length} works`, `${digitalVersionRegistry.length} digital versions`, "0 licensed downloads"]
        : [`${workRegistry.length} عملاً`, `${digitalVersionRegistry.length} نسخة رقمية`, "0 تنزيل مرخّص"],
    };
  }

  if (location.startsWith("/quran")) {
    return {
      wing: isLtrLanguage ? "Quran" : "رِواق القرآن",
      status: isLtrLanguage ? "Arabic text complete · translations are separate" : "النص العربي مكتمل · الترجمات منفصلة",
      summary: isLtrLanguage
        ? "The Arabic Tanzil text is preserved and verified; translation, tafsir, and audio are separate resources that remain unclaimed until proven."
        : "النص العربي من Tanzil محفوظ ومتحقق، بينما الترجمة والتفسير والصوت موارد مستقلة لا تُدّعى حتى تثبت.",
      facts: isLtrLanguage ? ["114 surahs", "6236 ayahs", "audio needs recording review"] : ["114 سورة", "6236 آية", "الصوت يحتاج مراجعة تسجيلية"],
    };
  }

  if (location.startsWith("/seerah") || location.startsWith("/who-is-muhammad") || location.startsWith("/character")) {
    return {
      wing: isLtrLanguage ? "Seerah and Character" : "السيرة والشمائل",
      status: isLtrLanguage ? "Structured journey · scholarly review continues" : "رحلة منظّمة · مراجعة علمية مستمرة",
      summary: isLtrLanguage
        ? "Narrative and place are presented as institutional knowledge under review, without depiction or unsupported geographic certainty."
        : "السرد والمكان يعرضان بوصفهما معرفة مؤسسية قيد التحقيق، دون تجسيد أو يقين جغرافي غير مثبت.",
      facts: isLtrLanguage ? ["8 Seerah chapters", "12 guide chapters", "no depiction of the Prophet ﷺ"] : ["8 فصول سيرة", "12 فصل تعريفي", "لا تصوير للنبي ﷺ"],
    };
  }

  if (location.startsWith("/sunnah") || location.startsWith("/al-mufti")) {
    return {
      wing: isLtrLanguage ? "Hadith Archive" : "دار الحديث",
      status: isLtrLanguage ? "Limited archive · samples under review" : "أرشيف محدود · عينات قيد المراجعة",
      summary: isLtrLanguage
        ? "Collection, book, number, grade, and grade source stay separate; this release has no external corpus and no automated fatwa."
        : "تُفصل المجموعة والكتاب والرقم والدرجة ومصدر الحكم؛ لا Corpus خارجي ولا فتوى آلية في هذا الإصدار.",
      facts: isLtrLanguage ? ["6 collections", "4 samples", "Sunnah.com needs a key"] : ["6 مجموعات", "4 عينات", "Sunnah.com يحتاج مفتاحاً"],
    };
  }

  if (location.startsWith("/kids") || location.startsWith("/children-tv")) {
    return {
      wing: isLtrLanguage ? "Family and Children" : "الأسرة والطفل",
      status: isLtrLanguage ? "Original adaptations · no video theatre yet" : "تكييفات أصلية · لا مسرح فيديو بعد",
      summary: isLtrLanguage
        ? "Children's material is labeled as original educational adaptation and review state is visible; no video or media appears until rights are registered."
        : "مواد الأطفال موسومة كتكييف تعليمي أصلي ومراجعتها معلنة؛ لا فيديو أو وسائط حتى تسجل الحقوق.",
      facts: isLtrLanguage
        ? [`${childrenAdaptationRegistry.length} adaptations`, `${mediaAssetRegistry.length} media assets`, "no addictive feed"]
        : [`${childrenAdaptationRegistry.length} تكييفات`, `${mediaAssetRegistry.length} أصول وسائط`, "بلا تغذية إدمانية"],
    };
  }

  if (location.startsWith("/sources")) {
    return {
      wing: isLtrLanguage ? "Sources" : "خزانة المصادر",
      status: isLtrLanguage ? "Evidence center, not a replacement for experience" : "مركز إثبات لا بديل عن التجربة",
      summary: isLtrLanguage
        ? "The registry exposes rights, versions, and provider resources; it supports the wings without forcing ordinary visitors out of the experience."
        : "السجل يكشف الحقوق والنسخ والموارد؛ وظيفته أن يساند الأجنحة ولا يجبر الزائر العادي على مغادرة التجربة.",
      facts: isLtrLanguage
        ? [`${sourceRegistry.length} sources`, `${providerResourceRegistry.length} resources`, `${mediaAssetRegistry.length} cleared media`]
        : [`${sourceRegistry.length} مصادر`, `${providerResourceRegistry.length} موارد`, `${mediaAssetRegistry.length} وسائط مرخّصة`],
    };
  }

  if (location.startsWith("/daily") || location.startsWith("/prophetic-day") || location.startsWith("/24-hours")) {
    return {
      wing: isLtrLanguage ? "Daily Sanctuary" : "محراب اليوم",
      status: isLtrLanguage ? "Local tools · adhkar corpus withheld pending review" : "أدوات محلية · نصوص الأذكار محجوبة حتى التحقيق",
      summary: isLtrLanguage
        ? "Counter and prayer-time tools are helpers; adhkar corpus, reward language, and grades remain constrained by source and review."
        : "العداد والمواقيت يظهران كأدوات مساعدة، أما corpus الأذكار والثواب والدرجات فتبقى مقيدة بالمصدر والمراجعة.",
      facts: isLtrLanguage ? ["local counter", "method source visible", "no unsourced reward claims"] : ["عداد محلي", "مصدر المواقيت ظاهر", "لا وعود ثواب غير موثقة"],
    };
  }

  return {
    wing: isLtrLanguage ? (activeWing === "gate-of-light" ? "Gate of Light" : "Institution") : (activeWing === "gate-of-light" ? "بوابة النور" : "الصرح المؤسسي"),
    status: isLtrLanguage ? "Knowledge experience with visible rights state" : "تجربة معرفية بحقوق معلنة",
    summary: isLtrLanguage
      ? "Each wing separates text, explanation, source, rights, and what is still under review."
      : "كل جناح يميّز بين المتن، والشرح، والمصدر، والحقوق، وما يزال قيد المراجعة.",
    facts: isLtrLanguage
      ? [`${sourceRegistry.length} sources`, `${workRegistry.length} works`, `${mediaAssetRegistry.length} cleared media`]
      : [`${sourceRegistry.length} مصادر`, `${workRegistry.length} أعمال`, `${mediaAssetRegistry.length} وسائط مرخّصة`],
  };
}

export default function InstitutionShell({
  children,
  activeWing,
  hideFooter = false,
}: InstitutionShellProps) {
  const [location] = useLocation();
  // Shell direction follows the active language (ar/ur RTL, en/fr LTR).
  // Arabic Quran/Hadith excerpts keep their own local RTL containers.
  const { direction, language } = useLanguage();
  const truthRail = getTruthRail(location, activeWing, language === "en" || language === "fr");

  return (
      <div className="institution-shell min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors pb-16 md:pb-0" dir={direction} data-wing={activeWing}>
        <InstitutionalHeader />

        <aside className="institution-truth-rail" aria-label="حالة الجناح ومصدر التجربة">
          <div className="institution-truth-rail__inner">
            <div className="institution-truth-rail__identity">
              <span className="institution-truth-rail__wing">{truthRail.wing}</span>
              <strong>{truthRail.status}</strong>
            </div>
            <p>{truthRail.summary}</p>
            <div className="institution-truth-rail__facts" aria-label="مؤشرات موثقة">
              {truthRail.facts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>
          </div>
        </aside>

        <main id="main-content" className="flex-1 w-full">
          {children}
        </main>

        {!hideFooter && <InstitutionalFooter />}

        {/* Mobile Navigation Dock */}
        <nav
          className="institution-mobile-dock fixed bottom-0 inset-x-0 z-40 md:hidden flex items-center justify-around px-2 py-1.5"
          aria-label="شريط التنقل السريع"
        >
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[11px] font-cairo transition-all",
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn("w-5 h-5 mb-0.5", isActive && "stroke-[2.5px]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
  );
}
