import { useState } from "react";
import { ZoomIn, ZoomOut, Locate, Play, List, Expand } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { CompassRose } from "@/visual-golden/components/unique/CompassRose";
import { FocusBar } from "@/visual-golden/components/present/FocusBar";
import styles from "./AtlasPage.module.css";

const events = [
  { id: 1, name: "مكة", en: "Makkah", x: 44, y: 78 },
  { id: 2, name: "الطائف", en: "Taif", x: 56, y: 80 },
  { id: 3, name: "المدينة", en: "Madinah", x: 48, y: 50 },
  { id: 4, name: "خيبر", en: "Khaybar", x: 50, y: 28 },
  { id: 5, name: "تبوك", en: "Tabuk", x: 38, y: 12 },
  { id: 6, name: "ينبع", en: "Yanbu", x: 30, y: 48 },
  { id: 7, name: "بدر", en: "Badr", x: 34, y: 60 },
];

const filters = ["جميع الغزوات", "غزوات النبي ﷺ", "السرايا", "الفتوحات"];
const layers = [
  { id: "terrain", label: "التضاريس الجبلية", on: true },
  { id: "routes", label: "المسارات والطرق", on: true },
  { id: "battles", label: "أماكن الغزوات", on: true },
  { id: "cities", label: "المدن التاريخية", on: true },
  { id: "borders", label: "الحدود التاريخية", on: false },
  { id: "water", label: "المسطحات المائية", on: false },
];

export function AtlasPage() {
  const [selected, setSelected] = useState(4);
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState(1);
  const [layerOn, setLayerOn] = useState(() => Object.fromEntries(layers.map((l) => [l.id, l.on])));
  const [immersive, setImmersive] = useState(false);
  const sel = events.find((e) => e.id === selected)!;
  const routes = ["44,78 34,60 48,50 50,28 38,12", "44,78 56,80", "30,48 48,50"];

  return (
    <div className={`${styles.page} ${immersive ? styles.immersive : ""}`}>
      <FocusBar
        focus={immersive}
        onFocus={() => setImmersive((v) => !v)}
        extra={{ label: "غمر الخريطة", on: immersive, onClick: () => setImmersive((v) => !v) }}
      />
      <div className={styles.mapArea}>
        <div className={styles.title}>
          <h1>الأطلس الجبلي للغزوات</h1>
          <p>ATLAS OF THE BATTLES</p>
        </div>

        <div className={styles.filters}>
          {filters.map((f, i) => (
            <button key={f} className={filter === i ? styles.active : ""} type="button" onClick={() => setFilter(i)}>
              {f}
            </button>
          ))}
        </div>

        <div className={styles.mapTools}>
          <CompassRose deg={selected * 18} />
          <button type="button" onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))}>
            <ZoomIn size={16} />
          </button>
          <button type="button" onClick={() => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))}>
            <ZoomOut size={16} />
          </button>
          <button type="button" onClick={() => setZoom(1)}>
            <Locate size={16} />
          </button>
          <button type="button" onClick={() => setImmersive((v) => !v)} aria-label="عرض غامر">
            <Expand size={16} />
          </button>
        </div>

        <aside className={styles.layers}>
          <h4>طبقات الخريطة</h4>
          {layers.map((l) => (
            <label key={l.id}>
              <input
                type="checkbox"
                checked={layerOn[l.id]}
                onChange={() => setLayerOn((s) => ({ ...s, [l.id]: !s[l.id] }))}
              />
              {l.label}
            </label>
          ))}
        </aside>

        <div className={styles.map}>
          <div className={styles.mapInner} style={{ transform: `scale(${zoom})` }}>
            <img src={art.atlas} alt="" />
            {layerOn.routes ? (
              <svg className={styles.routes} viewBox="0 0 100 100" preserveAspectRatio="none">
                {routes.map((d) => (
                  <polyline key={d} points={d} />
                ))}
              </svg>
            ) : null}
            {layerOn.cities || layerOn.battles
              ? events.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className={`${styles.marker} ${selected === e.id ? styles.selected : ""}`}
                    style={{ left: `${e.x}%`, top: `${e.y}%` }}
                    onClick={() => setSelected(e.id)}
                  >
                    <span className={styles.dot} />
                    <span className={styles.label}>
                      {e.name}
                      <em>{e.en}</em>
                    </span>
                  </button>
                ))
              : null}
          </div>
        </div>

        <aside className={styles.inspector} key={sel.id}>
          <img src={art.desert} alt="" />
          <div className={styles.insBody}>
            <h3>غزوة {sel.name}</h3>
            <span className={styles.badge}>غزوات النبي ﷺ</span>
            <dl>
              <dt>التاريخ الهجري</dt>
              <dd>7 هـ (شوال)</dd>
              <dt>الموقع</dt>
              <dd>{sel.name} — شمال المدينة المنورة</dd>
              <dt>الأطراف</dt>
              <dd>المسلمون × موضع تاريخي</dd>
              <dt>النتيجة</dt>
              <dd>[بيانات المصدر]</dd>
            </dl>
            <p>
              [بيانات المصدر] كانت هذه المرحلة في السنة السابعة من الهجرة، وهي محطة بصرية للتسلسل الزمني في النموذج.
            </p>
            <button className="btn-outline" type="button">
              التفاصيل الكاملة
            </button>
          </div>
        </aside>
      </div>

      <div className={styles.timelineBar}>
        <button type="button" className={styles.play}>
          <Play size={14} />
        </button>
        <span>الخط الزمني للغزوات</span>
        <div className={styles.ticks}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              className={n === 7 ? styles.tickActive : ""}
              onClick={() => setSelected(n === 7 ? 4 : selected)}
            >
              {n} هـ
            </button>
          ))}
        </div>
        <button type="button" className={styles.listBtn}>
          <List size={14} /> عرض كقائمة
        </button>
      </div>
    </div>
  );
}
