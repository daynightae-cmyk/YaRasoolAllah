import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ZoomIn, ZoomOut, Locate, Play, Pause, List, Expand } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { CompassRose } from "@/visual-golden/components/unique/CompassRose";
import { FocusBar } from "@/visual-golden/components/present/FocusBar";
import {
  ATLAS_COUNTS,
  ATLAS_FILTERS,
  ATLAS_NODES,
  filterNodes,
  narrativeLinks,
  type AtlasFilter,
} from "@/visual-golden/services/atlas";
import styles from "./AtlasPage.module.css";

const layers = [
  { id: "terrain", label: "التضاريس (رسم توضيحي)", on: true },
  { id: "routes", label: "التسلسل السردي التخطيطي", on: true },
  { id: "nodes", label: "المواضع التخطيطية", on: true },
  { id: "legend", label: "مفتاح الدقة", on: true },
];

export function AtlasPage() {
  const [selectedId, setSelectedId] = useState(ATLAS_NODES[0]?.id ?? "");
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState<AtlasFilter>("all");
  const [layerOn, setLayerOn] = useState(() => Object.fromEntries(layers.map((l) => [l.id, l.on])));
  const [immersive, setImmersive] = useState(false);
  const [touring, setTouring] = useState(false);
  const [listMode, setListMode] = useState(false);

  const visible = useMemo(() => filterNodes(filter), [filter]);
  const sel = visible.find((node) => node.id === selectedId) ?? visible[0] ?? null;
  const links = useMemo(() => narrativeLinks(visible), [visible]);

  useEffect(() => {
    if (!touring || visible.length < 2) return;
    const timer = window.setInterval(() => {
      setSelectedId((current) => {
        const idx = visible.findIndex((node) => node.id === current);
        return visible[(idx + 1) % visible.length].id;
      });
    }, 1800);
    return () => window.clearInterval(timer);
  }, [touring, visible]);

  useEffect(() => {
    setTouring(false);
    if (!visible.some((node) => node.id === selectedId)) {
      setSelectedId(visible[0]?.id ?? "");
    }
  }, [filter, visible, selectedId]);

  return (
    <div className={`${styles.page} ${immersive ? styles.immersive : ""}`}>
      <FocusBar
        focus={immersive}
        onFocus={() => setImmersive((v) => !v)}
        extra={{ label: "غمر الخريطة", on: immersive, onClick: () => setImmersive((v) => !v) }}
      />
      <div className={styles.mapArea}>
        <div className={styles.title}>
          <h1>الأطلس التخطيطي للسيرة</h1>
          <p>
            SCHEMATIC ATLAS · {ATLAS_COUNTS.nodes} مواضع · {ATLAS_COUNTS.mentions} إشارة من فصول السيرة
          </p>
        </div>

        <div className={styles.filters}>
          {ATLAS_FILTERS.map((f) => (
            <button
              key={f.id}
              className={filter === f.id ? styles.active : ""}
              type="button"
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.mapTools}>
          <span title="بوصلة زخرفية — لا تمثل اتجاهًا محسوبًا">
            <CompassRose deg={0} />
          </span>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))} aria-label="تكبير">
            <ZoomIn size={16} />
          </button>
          <button type="button" onClick={() => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))} aria-label="تصغير">
            <ZoomOut size={16} />
          </button>
          <button type="button" onClick={() => setZoom(1)} aria-label="إعادة الضبط">
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
          {layerOn.legend ? (
            <p className="muted" style={{ fontSize: "0.72rem", lineHeight: 1.8, margin: "0.4rem 0 0" }}>
              مفتاح الدقة: كل المواضع <strong>تخطيطية</strong> — مواضع رسم توضيحي على صورة فنية،
              ليست إحداثيات GPS ولا مسارات تاريخية دقيقة ولا مواقع عسكرية محددة.
            </p>
          ) : null}
        </aside>

        {listMode ? (
          <div className={styles.map} style={{ display: "grid", placeItems: "center", padding: "5rem 1rem 1rem" }}>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem", width: "min(560px, 100%)" }}>
              {visible.map((node) => (
                <li key={node.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(node.id);
                      setListMode(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "start",
                      padding: "0.6rem 0.8rem",
                      borderRadius: 12,
                      border: "1px solid rgba(212,160,23,0.35)",
                      background: "rgba(6,32,28,0.9)",
                      color: "var(--ivory-100)",
                    }}
                  >
                    <strong>{node.name}</strong> · تخطيطي · {node.mentions.length}{" "}
                    {node.mentions.length === 1 ? "إشارة" : "إشارات"}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className={styles.map}>
            <div className={styles.mapInner} style={{ transform: `scale(${zoom})` }}>
              <img src={art.atlas} alt="رسم توضيحي فني للتضاريس — ليس خريطة مساحية" />
              {layerOn.routes && links ? (
                <svg className={styles.routes} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                  <polyline points={links} />
                </svg>
              ) : null}
              {layerOn.nodes
                ? visible.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      className={`${styles.marker} ${sel?.id === node.id ? styles.selected : ""}`}
                      style={{ left: `${node.layout.x}%`, top: `${node.layout.y}%` }}
                      onClick={() => setSelectedId(node.id)}
                      aria-label={`${node.name} — موضع تخطيطي`}
                    >
                      <span className={styles.dot} />
                      <span className={styles.label}>
                        {node.name}
                        <em>SCHEMATIC</em>
                      </span>
                    </button>
                  ))
                : null}
            </div>
          </div>
        )}

        {sel ? (
          <aside className={styles.inspector} key={sel.id}>
            <img src={art.desert} alt="" />
            <div className={styles.insBody}>
              <h3>{sel.name}</h3>
              <span className={styles.badge}>موضع تخطيطي — ليس إحداثيات دقيقة</span>
              <dl>
                <dt>الإشارات في السيرة</dt>
                <dd>
                  {sel.mentions.length} {sel.mentions.length === 1 ? "إشارة" : "إشارات"}
                </dd>
                <dt>الفصول</dt>
                <dd>{[...new Set(sel.mentions.map((m) => `فصل ${m.chapterOrder}`))].join(" · ")}</dd>
              </dl>
              <ul style={{ listStyle: "none", margin: "0 0 0.6rem", padding: 0, display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.78rem" }}>
                {sel.mentions.map((mention, i) => (
                  <li key={`${mention.chapterId}-${i}`}>
                    <strong>{mention.eventTitle}</strong> · {mention.eventDate}
                    <br />
                    <span className="muted">
                      {mention.chapterTitle} (فصل {mention.chapterOrder})
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                خط التسلسل على الرسم يربط المواضع بترتيب الفصول السردي فقط — لا يمثل طريقًا
                تاريخيًا مرسومًا ولا تحركات عسكرية.
              </p>
              <Link href="/seerah" className="btn-outline" style={{ textDecoration: "none", display: "inline-block", marginTop: "0.4rem" }}>
                فتح فصول السيرة
              </Link>
            </div>
          </aside>
        ) : null}
      </div>

      <div className={styles.timelineBar}>
        <button
          type="button"
          className={styles.play}
          onClick={() => setTouring((t) => !t)}
          aria-label={touring ? "إيقاف الجولة" : "جولة بصرية بين المواضع"}
          title="جولة بصرية بين المواضع التخطيطية"
        >
          {touring ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <span>التسلسل السردي للمواضع {touring ? "· الجولة تعمل" : ""}</span>
        <div className={styles.ticks}>
          {visible.map((node) => (
            <button
              key={node.id}
              type="button"
              className={sel?.id === node.id ? styles.tickActive : ""}
              onClick={() => setSelectedId(node.id)}
            >
              {node.name}
            </button>
          ))}
        </div>
        <button type="button" className={styles.listBtn} onClick={() => setListMode((v) => !v)}>
          <List size={14} /> {listMode ? "عرض كخريطة" : "عرض كقائمة"}
        </button>
      </div>
    </div>
  );
}
