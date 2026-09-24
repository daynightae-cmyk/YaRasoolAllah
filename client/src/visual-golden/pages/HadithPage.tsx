import { useState } from "react";
import { Search, Bookmark, Share2, Copy } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { IsnadChain } from "@/visual-golden/components/unique/IsnadChain";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./HadithPage.module.css";

const collections = [
  { name: "الصحيحان", count: "14,678 حديث", desc: "صحيح البخاري ومسلم", img: art.books },
  { name: "الكتب التسعة", count: "62,831 حديث", desc: "المصادر المعتمدة", img: art.bookStack },
  { name: "الأربعون النووية", count: "42 حديث", desc: "مجموعة الأحاديث المختارة", img: art.mushaf },
  { name: "رياض الصالحين", count: "1,899 حديث", desc: "من كلام سيد المرسلين", img: art.lanternGlow },
  { name: "الأدب والمواعظ", count: "8,452 حديث", desc: "في الهدي النبوي", img: art.archesNight },
];

const topics = ["العقيدة", "الصلاة", "الزكاة", "الصيام", "الأسرة", "المعاملات", "الأخلاق", "الطب النبوي"];
const chips = ["الحديث الصحيح", "الطب النبوي", "الأخلاق", "الأسرة", "الزكاة", "الصلاة"];
const narrators = ["أبو بكر الصديق", "عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب"];

export function HadithPage() {
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState(false);
  const [topic, setTopic] = useState("العقيدة");

  return (
    <div className={styles.page}>
      <PageHero
        title="دار الحديث"
        subtitle="مصادر موثوقة · علم راسخ · هداية دائمة"
        desc="[نص الحديث من المصدر] — الأرشيف العلمي للسنة النبوية"
        image={art.shelves}
        wing="hadith"
      >
        <form className={styles.search} onSubmit={(e) => e.preventDefault()}>
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في نصوص الأحاديث، الألفاظ، الرواة، الموضوعات..."
          />
          <button className="btn-gold" type="submit">
            بحث
          </button>
        </form>
        <div className={styles.chips}>
          {chips.map((c) => (
            <button key={c} type="button">
              {c}
            </button>
          ))}
        </div>
      </PageHero>

      <section className={styles.pad}>
        <SectionHead title="المجموعات الرئيسية" en="Featured Collections" href="/library" />
        <div className={`${styles.grid} stagger`}>
          {collections.map((c) => (
            <article key={c.name} className={styles.card}>
              <img src={c.img} alt="" />
              <div>
                <h3>{c.name}</h3>
                <p>{c.desc}</p>
                <span>{c.count}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.row}>
        <article className={styles.hotd}>
          <SectionHead title="حديث اليوم" en="Hadith of the Day" />
          <div className={p.parchment}>
            <blockquote style={{ margin: 0 }}>
              قال رسول الله ﷺ:
              <br />
              «إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»
            </blockquote>
            <p style={{ margin: "0.6rem 0 0" }}>[بيانات المصدر] رواه البخاري ومسلم</p>
            <div className={p.seal}>ختم</div>
          </div>
          <p className="muted" style={{ margin: "0.85rem 0 0.35rem", fontSize: "0.78rem" }}>
            سلسلة الإسناد البصرية — أسماء للعرض فقط
          </p>
          <IsnadChain />
          <div className={styles.actions}>
            <button type="button">
              <Share2 size={14} /> مشاركة
            </button>
            <button type="button">
              <Copy size={14} /> نسخ
            </button>
            <button type="button" className={saved ? styles.on : ""} onClick={() => setSaved((s) => !s)}>
              <Bookmark size={14} /> حفظ
            </button>
          </div>
        </article>

        <article className={styles.panel}>
          <SectionHead title="تصفح بالأبواب" en="Browse by Topics" />
          <div className={styles.topics}>
            {topics.map((t) => (
              <button key={t} type="button" className={topic === t ? styles.on : ""} onClick={() => setTopic(t)}>
                {t}
              </button>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <SectionHead title="شمول الرواية" en="Narrators & Chains" />
          <ul className={styles.narr}>
            {narrators.map((n) => (
              <li key={n}>
                <img src={art.dome} alt="" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
