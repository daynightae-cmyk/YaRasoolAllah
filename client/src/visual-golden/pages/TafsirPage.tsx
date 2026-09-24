import { useState } from "react";
import {
  Bookmark,
  Share2,
  Copy,
  Headphones,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { FocusBar } from "@/visual-golden/components/present/FocusBar";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./TafsirPage.module.css";

const sources = ["تفسير ابن كثير", "تفسير الطبري", "تفسير السعدي", "تفسير مختصر"];
const words = [
  { ar: "الحي", en: "The Ever-Living", mean: "الذي لا يموت، الحياة الكاملة التي لا يقبلها فناء" },
  { ar: "القيوم", en: "The Sustainer", mean: "القائم بنفسه، المقيم لغيره، المدبر لشؤون الخلق" },
  { ar: "سنة", en: "Drowsiness", mean: "الغفوة اليسيرة التي تسبق النوم" },
  { ar: "كرسيه", en: "His Kursi", mean: "كرسيه، وهو موضع قدميه، وعلم عظيم وسلطان" },
];

export function TafsirPage() {
  const [src, setSrc] = useState(0);
  const [tab, setTab] = useState("تأمل");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const [focus, setFocus] = useState(false);

  return (
    <div className={`${styles.page} ${focus ? styles.focus : ""}`}>
      {focus ? null : (
        <PageHero
          title="التفسير والتدبر"
          subtitle="غرفة الدراسة العلمية"
          desc="رحلة في معاني القرآن — لتنفتح بها القلوب وتزداد هدى"
          image={art.mushaf}
          compact
          wing="tafsir"
        />
      )}
      <FocusBar focus={focus} onFocus={() => setFocus((v) => !v)} extra={{ label: "لوحة الآية", on: focus, onClick: () => setFocus(true) }} />

      <div className={styles.toolbar}>
        <button type="button">
          سورة البقرة <ChevronDown size={14} />
        </button>
        <label>
          رقم السورة <b>2</b>
        </label>
        <label>
          رقم الآية <b>255</b>
        </label>
        <div className={styles.tools}>
          <button type="button" className={saved ? styles.on : ""} onClick={() => setSaved((s) => !s)}>
            <Bookmark size={15} />
          </button>
          <button type="button">
            <Headphones size={15} /> استماع
          </button>
          <button type="button">
            <Share2 size={15} /> مشاركة
          </button>
          <button type="button">
            <Copy size={15} /> نسخ الآية
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.panel}>
          <SectionHead title="سياق الآيات" en="Verse Context" />
          <button type="button" className={styles.verseItem}>
            <span>الآية السابقة</span>
            <b>254</b>
            <p>[نص القرآن من مصدر البيانات]</p>
          </button>
          <button type="button" className={`${styles.verseItem} ${styles.current}`}>
            <span>الآية الحالية</span>
            <b>255</b>
            <p>اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ…</p>
          </button>
          <button type="button" className={styles.verseItem}>
            <span>الآية التالية</span>
            <b>256</b>
            <p>[نص القرآن من مصدر البيانات]</p>
          </button>
        </aside>

        <main className={styles.verseBox}>
          <h2>سُورَةُ البَقَرَة</h2>
          <p className={styles.arabic}>
            اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي
            السَّمَاوَاتِ وَمَا فِي الْأَرْضِ
            <span>٢٥٥</span>
          </p>
          <p className={styles.en}>
            Allah — there is no deity except Him, the Ever-Living, the Sustainer of [all] existence…
          </p>
          <small>سورة البقرة · الآية 255</small>
        </main>

        <aside className={styles.panel}>
          <SectionHead title="التفسير والمصادر" en="Tafsir & Sources" />
          <div className={styles.srcTabs}>
            {sources.map((s, i) => (
              <button key={s} type="button" className={i === src ? styles.srcOn : ""} onClick={() => setSrc(i)}>
                {s}
              </button>
            ))}
          </div>
          <p className={styles.tafsir}>
            [التفسير سيُربط لاحقًا] هذه الآية الكريمة أعظم آية في كتاب الله تعالى، وهي آية الكرسي، دلت على عظمة
            الله تعالى وتفرده بالألوهية والربوبية.
          </p>
          <button type="button" className={styles.more}>
            عرض المزيد <ChevronLeft size={14} />
          </button>
        </aside>
      </div>

      <div className={styles.bottom}>
        <section className={styles.panel}>
          <SectionHead title="معاني المفردات" en="Key Words & Meanings" />
          <ul className={styles.words}>
            {words.map((w) => (
              <li key={w.ar}>
                <strong>{w.ar}</strong>
                <em>{w.en}</em>
                <p>{w.mean}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.panel}>
          <SectionHead title="منهجية التدبر" en="Reflection & Contemplation" />
          <div className={styles.reflectTabs}>
            {["تأمل", "تطبيق", "أسئلة", "فوائد"].map((t) => (
              <button key={t} type="button" className={tab === t ? styles.srcOn : ""} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <ul className={styles.prompts}>
            <li>ما الذي تُحدثه لك صفة (القيوم) في نظرتك إلى حياتك؟</li>
            <li>كيف يطمئن قلبك بمعرفة أن الله لا تأخذه سنة ولا نوم؟</li>
            <li>تأمل سعة علم الله… كيف تؤثر على اختياراتك اليومية؟</li>
          </ul>
        </section>
        <section className={styles.panel}>
          <SectionHead title="ملاحظاتي وتطبيقاتي" en="My Notes & Application" />
          <textarea
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="اكتب تأملاتك هنا..."
          />
          <button className="btn-gold" type="button" onClick={() => setSaved(true)}>
            حفظ الملاحظة
          </button>
          {saved ? <div className={p.seal}>خُتم</div> : null}
        </section>
      </div>
    </div>
  );
}
