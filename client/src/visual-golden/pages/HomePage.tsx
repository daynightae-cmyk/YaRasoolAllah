import { useState } from "react";
import { Link } from "wouter";
import {
  BookMarked,
  Moon,
  Sparkles,
  Calendar,
  Headphones,
  FileText,
  Bookmark,
  MoreHorizontal,
  Settings2,
  Search,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { TiltCard } from "@/visual-golden/components/present/TiltCard";
import { ViewSwitcher, type ViewMode } from "@/visual-golden/components/present/ViewSwitcher";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./HomePage.module.css";

const gateways = [
  {
    to: "/seerah" as const,
    title: "السيرة النبوية",
    en: "Prophetic Biography",
    desc: "رحلة في حياة خير الخلق ﷺ",
    img: art.domeCard,
  },
  {
    to: "/hadith" as const,
    title: "الأحاديث النبوية",
    en: "Hadith Collection",
    desc: "كنوز من هدي المصطفى",
    img: art.books,
  },
  {
    to: "/library" as const,
    title: "العلوم الإسلامية",
    en: "Islamic Sciences",
    desc: "معرفة راسخة ومنهج وسطي",
    img: art.arches,
  },
  {
    to: "/basirah" as const,
    title: "بصيرة",
    en: "Basirah",
    desc: "رفيق البحث الموثَّق في المصادر",
    img: art.lantern,
  },
  {
    to: "/kids" as const,
    title: "الأطفال والعائلة",
    en: "Kids & Family",
    desc: "مسرح قصص دافئ للأسرة",
    img: art.archesNight,
  },
];

const quick = [
  { to: "/quran" as const, label: "القرآن الكريم", icon: BookMarked },
  { to: "/daily" as const, label: "مرصد الصلاة", icon: Moon },
  { to: "/daily" as const, label: "الأدعية", icon: Sparkles },
  { to: "/daily" as const, label: "التقويم الهجري", icon: Calendar },
  { to: "/audio" as const, label: "المواد الصوتية", icon: Headphones },
  { to: "/basirah" as const, label: "بصيرة", icon: Search },
  { to: "/library" as const, label: "المقالات", icon: FileText },
  { to: "/hadith" as const, label: "الحديث", icon: BookMarked },
];

function GateBody({ g }: { g: (typeof gateways)[number] }) {
  return (
    <>
      <img src={g.img} alt="" />
      <div className={styles.gateBody}>
        <h3>{g.title}</h3>
        <span>{g.en}</span>
        <p>{g.desc}</p>
        <i className={styles.gateGo}>←</i>
      </div>
    </>
  );
}

export function HomePage() {
  const [mode, setMode] = useState<ViewMode>("cards");
  const lang = useInstitution((s) => s.lang);
  const visits = useInstitution((s) => s.visits);
  const favorites = useInstitution((s) => s.favorites);
  const notes = useInstitution((s) => s.notes);
  const toggleFavorite = useInstitution((s) => s.toggleFavorite);
  const saved = favorites.some((f) => f.id === "continue-riyad");

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <img className={styles.heroImg} src={art.mosque} alt="" />
        <div className={styles.heroFrame} />
        <div className={`${styles.mash} ${styles.mashL}`} />
        <div className={`${styles.mash} ${styles.mashR}`} />
        <div className={styles.heroCopy}>
          <p className={styles.invoke}>يا رسول الله</p>
          <h1 className="gold-shimmer">بوابة النور</h1>
          <p className={styles.heroSub}>رحلة معرفية إلى سيرة خير البشر ﷺ</p>
          <p className={styles.heroDesc}>
            من هنا نبدأ رحلتنا في طلب العلم، على هدي النبي محمد ﷺ. نكتشف سيرته، وأخلاقه،
            وهديه، وننهل من نوره الذي أضاء للعالمين.
          </p>
        </div>
        <form className={styles.heroSearch} onSubmit={(e) => e.preventDefault()}>
          <Search size={16} />
          <input placeholder="ماذا تريد أن تتعلم اليوم؟" />
          <button className="btn-gold" type="submit">
            بحث
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.headRow}>
          <SectionHead title="بوابات المعرفة الرئيسية" en="Featured Knowledge Gateways" href="/library" action="استكشف جميع البوابات" />
          <ViewSwitcher value={mode} onChange={setMode} />
        </div>

        {mode === "cards" ? (
          <div className={`${styles.gateGrid} stagger`}>
            {gateways.map((g) => (
              <TiltCard key={g.title}>
                <Link href={g.to} className={`${styles.gateCard} ${styles.mashOpen}`}>
                  <GateBody g={g} />
                </Link>
              </TiltCard>
            ))}
          </div>
        ) : null}

        {mode === "panorama" ? (
          <div className={p.panorama}>
            {gateways.map((g) => (
              <Link key={g.title} href={g.to} className={`${styles.gateCard} ${styles.mashOpen}`}>
                <GateBody g={g} />
              </Link>
            ))}
          </div>
        ) : null}

        {mode === "path" ? (
          <div className={p.path}>
            {gateways.map((g, i) => (
              <div key={g.title} className={p.pathStep}>
                {i < gateways.length - 1 ? <span className={p.pathLine} /> : null}
                <span className={p.pathNum}>{i + 1}</span>
                <Link href={g.to} className={p.pathCard}>
                  <img src={g.img} alt="" />
                  <div>
                    <h3>{g.title}</h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className={styles.bottomGrid}>
        <article className={styles.panel}>
          <SectionHead title="متابعة القراءة" en="Continue Reading" href="/hadith" />
          <div className={styles.continueRow}>
            <img src={art.bookStack} alt="" />
            <div className={styles.continueMeta}>
              <div className={styles.continueActions}>
                <button
                  type="button"
                  aria-label="حفظ"
                  onClick={() => toggleFavorite({ id: "continue-riyad", title: "رياض الصالحين", path: "/hadith" })}
                >
                  <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
                </button>
                <button type="button" aria-label="المزيد">
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <strong>رياض الصالحين</strong>
              <p>الإمام النووي</p>
              <p className="muted">{lang === "ar" ? "موضع محفوظ على هذا الجهاز عند الربط" : "A local placeholder until production reading position is wired"}</p>
            </div>
          </div>
          <Link href="/hadith" className={styles.followBtn}>
            متابعة ←
          </Link>
        </article>

        <article className={styles.inspire}>
          <img src={art.mosque} alt="" />
          <div className={styles.inspireInner}>
            <SectionHead title="إلهام اليوم" en="Daily Inspiration" />
            <p className={styles.hadithLabel}>حديث اليوم</p>
            <blockquote>[نص الحديث من المصدر]</blockquote>
            <p className="muted">[بيانات المصدر]</p>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.quickHead}>
            <SectionHead title="وصول سريع" en="Quick Access" />
            <button type="button" className={styles.gear} aria-label="تخصيص">
              <Settings2 size={14} />
            </button>
          </div>
          <div className={`${styles.quickGrid} stagger`}>
            {quick.map((q) => (
              <Link key={q.label} href={q.to}>
                <q.icon size={18} />
                {q.label}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <footer className={styles.statsBar}>
        <div className={styles.stat}>
          <strong>{Object.keys(visits).length}</strong>
          <span>{lang === "ar" ? "أبواب زرتها" : "Wings visited"}</span>
        </div>
        <div className={styles.stat}>
          <strong>{favorites.length}</strong>
          <span>{lang === "ar" ? "محفوظات" : "Saved"}</span>
        </div>
        <div className={styles.stat}>
          <strong>{notes.length}</strong>
          <span>{lang === "ar" ? "ملاحظات" : "Notes"}</span>
        </div>
        <span className={styles.quote}>
          {lang === "ar" ? "مسار تعلّم محايد على هذا الجهاز — ليس تقييمًا للعبادة" : "A neutral learning path on this device — not a piety score"}
        </span>
      </footer>
    </div>
  );
}
