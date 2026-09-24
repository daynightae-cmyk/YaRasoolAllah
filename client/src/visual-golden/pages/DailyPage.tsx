import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { TasbihBeads } from "@/visual-golden/components/unique/TasbihBeads";
import { PrayerObservatory } from "@/visual-golden/components/prayer/PrayerObservatory";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./DailyPage.module.css";

const hours = [
  { t: "قبل الفجر", n: "قيام وتجدد" },
  { t: "الفجر", n: "صلاة وبداية" },
  { t: "الصباح", n: "الصدق في العمل" },
  { t: "الظهر", n: "توقف وتجديد" },
  { t: "العصر", n: "معاملة وأخلاق" },
  { t: "المغرب", n: "أسرة ومودة" },
  { t: "العشاء", n: "علم وتزكية" },
  { t: "قبل النوم", n: "مراجعة وذكر" },
];
const duas = [
  { title: "أدعية من القرآن", img: art.mushafOpen },
  { title: "أدعية من السنة", img: art.lanternGlow },
  { title: "أدعية الحياة اليومية", img: art.mosque },
  { title: "أدعية الكرب والهم", img: art.archesNight },
  { title: "أدعية الرزق", img: art.kaaba },
  { title: "أدعية الهداية", img: art.domeCard },
];
const quick = ["سبحان الله", "الحمد لله", "الله أكبر", "لا إله إلا الله", "أستغفر الله", "حسبي الله"];

export function DailyPage() {
  const lang = useInstitution((s) => s.lang);
  const [count, setCount] = useState(33);
  const [dhikr, setDhikr] = useState("سبحان الله");
  const [hour, setHour] = useState(3);
  const wash = hour <= 1 ? p.dawn : hour <= 3 ? p.noon : hour <= 5 ? p.dusk : p.night;

  return (
    <div className={styles.page}>
      <div className={`${p.hourWash} ${wash}`} aria-hidden />
      <PageHero
        title={lang === "ar" ? "مرصد الصلاة" : "Prayer Observatory"}
        subtitle={lang === "ar" ? "محراب اليوم · حساب علمي للمواقيت" : "Daily sanctuary · scientific prayer times"}
        desc={lang === "ar" ? "المواقيت تُحسب من مزوّد علني حسب المدينة المختارة، وليست أرقامًا ثابتة." : "Times are fetched from a public provider for the selected city — never hard-coded."}
        image={art.kaaba}
        wing="daily"
      />

      <PrayerObservatory />

      <div className={styles.mihrab} aria-label={lang === "ar" ? "محطات اليوم المعنوية" : "Spiritual stations of the day"}>
        {hours.map((h, i) => (
          <button key={h.t} type="button" className={i === hour ? styles.mihrabOn : ""} onClick={() => setHour(i)}>
            <b>{h.t}</b>
            <span>{h.n}</span>
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <SectionHead title="أذكار اليوم" en="Daily Adhkar" />
          <div className={styles.adhkarCard}>
            <img src={art.mosque} alt="" />
            <div>
              <h4>{lang === "ar" ? "أذكار الصباح" : "Morning adhkar"}</h4>
              <p>
                {lang === "ar"
                  ? "متن الأذكار اليومية غير مربوط بعد بمصدر موثق — لا يُعرض هنا متن مدّعى."
                  : "The daily adhkar corpus is not yet bound to a verified source."}
              </p>
              <span>{lang === "ar" ? "قيد مراجعة المصدر والحقوق" : "Source review pending"}</span>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.tasbihHead}>
            <SectionHead title="المسبحة الإلكترونية" en="Tasbih Counter" />
            <button type="button" onClick={() => setCount(0)} aria-label="إعادة">
              <RotateCcw size={14} />
            </button>
          </div>
          <div className={styles.counter}>
            <button type="button" onClick={() => setCount((c) => Math.max(0, c - 1))}>
              −
            </button>
            <span key={count}>{count}</span>
            <button type="button" onClick={() => setCount((c) => c + 1)}>
              +
            </button>
          </div>
          <TasbihBeads count={count} onCount={setCount} />
          <p className={styles.dhikr}>{dhikr}</p>
          <div className={styles.presets}>
            {[33, 100, 300, 1000].map((n) => (
              <button key={n} type="button" className={count === n ? styles.on : ""} onClick={() => setCount(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.lower}>
        <section className={styles.panel}>
          <SectionHead title="أدعية مختارة" en="Selected Duʿas" />
          <div className={styles.duas}>
            {duas.map((d) => (
              <article key={d.title}>
                <img src={d.img} alt="" />
                <span>{d.title}</span>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.panel}>
          <SectionHead title="أذكار سريعة" en="Quick Adhkar" />
          <div className={styles.quick}>
            {quick.map((q) => (
              <button key={q} type="button" onClick={() => setDhikr(q)}>
                {q}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
