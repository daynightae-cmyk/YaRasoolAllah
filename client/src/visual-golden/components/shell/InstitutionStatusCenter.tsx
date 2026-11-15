import { Archive, BookOpen, Database, FileWarning, Radio, ShieldCheck, UserRoundX } from "lucide-react";
import { BASIRAH_COUNTS } from "@/visual-golden/services/basirah";
import { MEDIA_DISCOVERY_STATUS } from "@/visual-golden/data/media-discovery-status.generated";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { STATUS_TONE_CLASS, type StatusTone } from "./shell-state";
import styles from "./shell.module.css";

interface StatusItem {
  id: string;
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
  detailAr: string;
  detailEn: string;
  tone: StatusTone;
  icon: typeof ShieldCheck;
}

export function InstitutionStatusCenter() {
  const lang = useInstitution((state) => state.lang);

  const items: StatusItem[] = [
    {
      id: "quran",
      labelAr: "المصحف المحلي",
      labelEn: "Local mushaf",
      valueAr: "النص العربي متاح",
      valueEn: "Arabic text available",
      detailAr: "تُعرض الترجمة والتفسير في طبقات منفصلة مع بيان نسختهما ومصدرهما.",
      detailEn: "Translation and tafsir are shown in separate layers with their edition and source.",
      tone: "available",
      icon: Archive,
    },
    {
      id: "library",
      labelAr: "سجل المكتبة",
      labelEn: "Library registry",
      valueAr: `${BASIRAH_COUNTS.works} سجل عمل`,
      valueEn: `${BASIRAH_COUNTS.works} work records`,
      detailAr: "عدد السجلات لا يعني أن جميعها تحتوي نصًا قابلًا للقراءة.",
      detailEn: "The record count does not mean every work contains readable full text.",
      tone: "neutral",
      icon: BookOpen,
    },
    {
      id: "hadith",
      labelAr: "سجل الحديث",
      labelEn: "Hadith registry",
      valueAr: `${BASIRAH_COUNTS.hadithSamples} عينات قيد المراجعة`,
      valueEn: `${BASIRAH_COUNTS.hadithSamples} samples under review`,
      detailAr: "هذه عينات تطوير وليست مدونة حديث كاملة، ولا تُنسب لها درجة غير مسجلة.",
      detailEn: "These are development samples, not a complete hadith corpus, and carry no unregistered grading.",
      tone: "review",
      icon: FileWarning,
    },
    {
      id: "media",
      labelAr: "وسائط الأطفال والعائلة",
      labelEn: "Children and family media",
      valueAr: `${MEDIA_DISCOVERY_STATUS.approvedForPublicDisplay} معتمد للعرض العام`,
      valueEn: `${MEDIA_DISCOVERY_STATUS.approvedForPublicDisplay} approved for public display`,
      detailAr: `${MEDIA_DISCOVERY_STATUS.blockedPendingReview} سجل اكتشاف معلّق؛ الحقوق غير محسومة لجميعها.`,
      detailEn: `${MEDIA_DISCOVERY_STATUS.blockedPendingReview} discovery records are blocked; rights remain unresolved for all.`,
      tone: "blocked",
      icon: Radio,
    },
    {
      id: "sources",
      labelAr: "سجل المصادر",
      labelEn: "Source registry",
      valueAr: `${BASIRAH_COUNTS.sources} مصدرًا مسجلًا`,
      valueEn: `${BASIRAH_COUNTS.sources} registered sources`,
      detailAr: "تظهر حالة الحقوق والتحرير ودرجة الثقة داخل سجل المصدر نفسه.",
      detailEn: "Rights, editorial status, and confidence appear inside each source record.",
      tone: "available",
      icon: ShieldCheck,
    },
    {
      id: "account",
      labelAr: "الحفظ والمزامنة",
      labelEn: "Storage and sync",
      valueAr: "حفظ محلي فقط",
      valueEn: "Local storage only",
      detailAr: "لا يوجد حساب أو مزامنة سحابية، ولم يُطلب أي سر في الواجهة.",
      detailEn: "There is no account or cloud sync, and no secret is requested in the interface.",
      tone: "neutral",
      icon: UserRoundX,
    },
    {
      id: "sync",
      labelAr: "آخر مزامنة",
      labelEn: "Last sync",
      valueAr: "غير متاح",
      valueEn: "Not available",
      detailAr: "لا توجد خدمة مزامنة خارجية متصلة في هذه النسخة.",
      detailEn: "No external sync service is connected in this build.",
      tone: "neutral",
      icon: Database,
    },
  ];

  return (
    <section className={styles.statusCenter} aria-label={lang === "ar" ? "حالة البيانات الحقيقية" : "Real data status"}>
      <p className={styles.statusIntro}>
        {lang === "ar"
          ? "تعرض هذه الحالات فقط ما يمكن إثباته من السجل المحلي؛ لا توجد حالة مزامنة أو اعتماد افتراضي."
          : "This view shows only what the local registry can substantiate; there is no implicit sync or approval state."}
      </p>
      <ul className={styles.statusList}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className={STATUS_TONE_CLASS[item.tone]}>
              <Icon size={18} aria-hidden="true" />
              <div>
                <span>{lang === "ar" ? item.labelAr : item.labelEn}</span>
                <strong>{lang === "ar" ? item.valueAr : item.valueEn}</strong>
                <small>{lang === "ar" ? item.detailAr : item.detailEn}</small>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
