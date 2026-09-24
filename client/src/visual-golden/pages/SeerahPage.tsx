import { useState } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import p from "@/visual-golden/components/present/present.module.css";
import u from "@/visual-golden/components/unique/unique.module.css";
import styles from "./SeerahPage.module.css";

const stages = [
  { year: "570م", title: "المولد والنشأة", img: art.reciterKaaba },
  { year: "610م", title: "البعثة النبوية", img: art.lanternGlow },
  { year: "610-622", title: "الدعوة في مكة", img: art.kaaba },
  { year: "622م", title: "الهجرة إلى المدينة", img: art.storyHijrah },
  { year: "622-630", title: "بناء الدولة", img: art.reciterDome },
  { year: "630م", title: "فتح مكة", img: art.reciterKaaba },
  { year: "630-632", title: "السنوات الأخيرة", img: art.mosque },
];

const events = [
  { year: "610", title: "غار حراء — نزول أول الوحي", img: art.lanternGlow },
  { year: "613", title: "الدعوة الجهرية في مكة", img: art.kaaba },
  { year: "622", title: "الهجرة إلى المدينة", img: art.desert },
  { year: "624", title: "غزوة بدر", img: art.atlas },
  { year: "630", title: "فتح مكة", img: art.kaaba },
];

const figures = ["خديجة رضي الله عنها", "أبو بكر الصديق", "عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب"];
const places = [
  { name: "مكة المكرمة", img: art.kaaba },
  { name: "المدينة المنورة", img: art.mosque },
  { name: "غار حراء", img: art.lanternGlow },
  { name: "بدر", img: art.desert },
  { name: "أحد", img: art.atlas },
  { name: "خيبر", img: art.desert },
];

export function SeerahPage() {
  const [stage, setStage] = useState(3);
  const [event, setEvent] = useState(2);

  return (
    <div className={styles.page}>
      <PageHero
        title="درب السيرة"
        subtitle="رحلة نور .. من مكة إلى العالم"
        desc="سيرة أعظم إنسان، وخاتم الأنبياء والمرسلين — رحلة حياة جمعت بين الوحي والواقع، العبادة والبناء."
        image={art.desert}
        tall
        wing="seerah"
      >
        <div className={styles.heroBtns}>
          <button className="btn-gold" type="button">
            ابدأ الرحلة
          </button>
          <button className="btn-outline" type="button">
            <Play size={14} /> عرض الفيلم التعريفي
          </button>
        </div>
      </PageHero>

      <section className={styles.timelineWrap}>
        <button type="button" className={styles.arrow} onClick={() => setStage((s) => Math.max(0, s - 1))}>
          <ChevronRight size={18} />
        </button>
        <div className={p.film}>
          {stages.map((s, i) => (
            <button
              key={s.title}
              type="button"
              className={`${p.filmItem} ${i === stage ? p.filmOn : ""}`}
              onClick={() => setStage(i)}
            >
              <img src={s.img} alt="" />
              {i === stage ? <span className={u.lantern} aria-hidden /> : null}
              <span>
                <b>{s.title}</b>
                <br />
                {s.year}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => setStage((s) => Math.min(stages.length - 1, s + 1))}
        >
          <ChevronLeft size={18} />
        </button>
      </section>

      <div className={styles.main}>
        <aside className={styles.panel}>
          <SectionHead title="أبرز الأحداث" en="Key Events" />
          <ol className={styles.events}>
            {events.map((e, i) => (
              <li key={e.title} className={i === event ? styles.evOn : ""} onClick={() => setEvent(i)}>
                <img src={e.img} alt="" />
                <div>
                  <span>{e.year}</span>
                  <strong>{e.title}</strong>
                </div>
              </li>
            ))}
          </ol>
        </aside>

        <section className={styles.mapCard}>
          <SectionHead title="رحلة تفاعلية عبر الزمن" en="Interactive Timeline" />
          <div className={styles.map}>
            <img src={art.desert} alt="" />
            <span className={styles.pin} style={{ right: "22%", top: "58%" }}>
              مكة المكرمة
            </span>
            <span className={styles.pin} style={{ right: "48%", top: "28%" }}>
              المدينة المنورة
            </span>
            <span className={`${styles.pin} ${styles.pinOn}`} style={{ right: "38%", top: "42%" }}>
              الهجرة
            </span>
          </div>
        </section>

        <aside className={styles.panel}>
          <SectionHead title="محطات مضيئة" en="Milestones" />
          <div className={styles.miles}>
            {[
              { t: "الرحمة للعالمين", img: art.mushafOpen },
              { t: "بناء المجتمع", img: art.mosque },
              { t: "القيم والأخلاق", img: art.books },
              { t: "القيادة والحكمة", img: art.arches },
            ].map((m) => (
              <article key={m.t}>
                <img src={m.img} alt="" />
                <span>{m.t}</span>
              </article>
            ))}
          </div>
        </aside>
      </div>

      <div className={styles.lower}>
        <section className={styles.panel}>
          <SectionHead title="شخصيات مؤثرة" en="Key Figures" />
          <div className={styles.figures}>
            {figures.map((f) => (
              <span key={f}>
                <img src={art.dome} alt="" />
                {f}
              </span>
            ))}
          </div>
        </section>
        <section className={styles.panel}>
          <SectionHead title="الأماكن في السيرة" en="Places in the Biography" href="/atlas" action="عرض الخريطة" />
          <div className={styles.places}>
            {places.map((p) => (
              <article key={p.name}>
                <img src={p.img} alt="" />
                <span>{p.name}</span>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.panel}>
          <SectionHead title="رحلتك في تعلم السيرة" en="Your Learning Journey" />
          <p>المرحلة 3 من 8 — حياة النبي في المدينة</p>
          <div className={styles.bar}>
            <i style={{ width: "60%" }} />
          </div>
          <span>60%</span>
        </section>
      </div>
    </div>
  );
}
