import { useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Search, ShieldAlert, X, XCircle } from "lucide-react";
import { DISCOVERED_MEDIA_CATALOG } from "@/visual-golden/data/media-discovery.generated";
import {
  MEDIA_REVIEW_GATE_LABELS,
  isMediaGatePassed,
  isMediaRecordApproved,
  type MediaReviewGateKey,
} from "@/visual-golden/services/media/review-gates";
import type { MediaDiscoveryRecord } from "@/visual-golden/services/media/types";
import styles from "./MediaLibrarySection.module.css";

type Props = { kind: "kids" | "seerah"; title: string; subtitle: string };

const GATE_ORDER = Object.keys(MEDIA_REVIEW_GATE_LABELS) as MediaReviewGateKey[];
const KIDS_CATEGORIES = new Set(["kids", "القرآن الكريم للأطفال"]);

const belongsToKind = (record: MediaDiscoveryRecord, kind: Props["kind"]) =>
  kind === "kids" ? KIDS_CATEGORIES.has(record.category ?? "") : !KIDS_CATEGORIES.has(record.category ?? "");

const displayTitle = (record: MediaDiscoveryRecord) =>
  record.title_ar?.trim() || record.title_original?.trim() || record.id;

const thumbnailFor = (record: MediaDiscoveryRecord) =>
  record.thumbnail_url ??
  (record.video_id ? `https://i.ytimg.com/vi/${record.video_id}/hqdefault.jpg` : null);

const formatDuration = (seconds: number | null) => {
  if (!seconds || seconds <= 0) return null;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} ساعة و${rest} دقيقة` : `${hours} ساعة`;
};

const provenanceLabel = (record: MediaDiscoveryRecord) =>
  `${record.provenance.sourceFile} · سطر ${record.provenance.sourceRow}`;

export function MediaLibrarySection({ kind, title, subtitle }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [channel, setChannel] = useState("all");
  const [speaker, setSpeaker] = useState("all");
  const [selected, setSelected] = useState<MediaDiscoveryRecord | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const records = useMemo(
    () => DISCOVERED_MEDIA_CATALOG.filter((record) => belongsToKind(record, kind)),
    [kind],
  );
  const approvedCount = useMemo(
    () => records.filter((record) => isMediaRecordApproved(record)).length,
    [records],
  );
  const categories = useMemo(
    () => ["all", ...new Set(records.map((record) => record.category).filter((item): item is string => Boolean(item)))],
    [records],
  );
  const channels = useMemo(
    () => ["all", ...new Set(records.map((record) => record.channel_name).filter((item): item is string => Boolean(item)))],
    [records],
  );
  const speakers = useMemo(
    () => ["all", ...new Set(records.map((record) => record.speaker).filter((item): item is string => Boolean(item)))],
    [records],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ar");
    return records.filter((record) => {
      if (category !== "all" && record.category !== category) return false;
      if (channel !== "all" && record.channel_name !== channel) return false;
      if (speaker !== "all" && record.speaker !== speaker) return false;
      if (!normalized) return true;
      return [
        record.title_ar,
        record.title_original,
        record.channel_name,
        record.category,
        record.subcategory,
        record.series_name,
        record.speaker,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ar")
        .includes(normalized);
    });
  }, [category, channel, query, records, speaker]);
  const visible = filtered.slice(0, visibleCount);

  const resetPaging = () => setVisibleCount(12);

  return (
    <section className={styles.section} aria-labelledby={`${kind}-media-title`} data-visual="media-library" data-media-kind={kind}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}><ShieldAlert size={15} /> كتالوج استحواذ موثّق المصدر</span>
          <h2 id={`${kind}-media-title`}>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className={styles.count} aria-label={`عدد السجلات ${records.length}، المعتمد للنشر ${approvedCount}`}>
          <strong>{records.length}</strong>
          <span>سجلًا في الكتالوج الموحّد</span>
          <span>{approvedCount} معتمد للنشر</span>
        </div>
      </div>

      <div className={styles.notice} role="note">
        <ShieldAlert size={17} />
        <span>
          كل مادة هنا مسجّلة في كتالوج الاستحواذ الموحّد بوصفها <b>قيد المراجعة</b>: الحقوق غير محسومة،
          والتضمين غير مختبر، والمراجعة التحريرية والدينية لم تكتمل. لا يوجد تشغيل داخلي قبل اجتياز كل
          بوابات الاعتماد؛ زر «فتح المصدر» ينقلك إلى الصفحة الرسمية على YouTube فقط.
        </span>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">ابحث في الكتالوج</span>
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); resetPaging(); }}
            placeholder="ابحث بالعنوان أو القناة أو السلسلة"
          />
        </label>
        <div className={styles.chips} aria-label="تصنيف المواد">
          {categories.map((item) => (
            <button key={item} type="button" data-active={category === item} onClick={() => { setCategory(item); resetPaging(); }}>
              {item === "all" ? "الكل" : item}
            </button>
          ))}
        </div>
        {kind === "seerah" ? (
          <>
            <div className={styles.filterLabel}>حسب القناة</div>
            <div className={styles.chips} aria-label="تصفية حسب القناة">
              {channels.map((item) => (
                <button key={item} type="button" data-active={channel === item} onClick={() => { setChannel(item); resetPaging(); }}>
                  {item === "all" ? "كل القنوات" : item}
                </button>
              ))}
            </div>
            <div className={styles.filterLabel}>حسب الشيخ</div>
            <div className={styles.chips} aria-label="تصفية حسب الشيخ">
              {speakers.map((item) => (
                <button key={item} type="button" data-active={speaker === item} onClick={() => { setSpeaker(item); resetPaging(); }}>
                  {item === "all" ? "كل الشيوخ" : item}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className={styles.grid}>
        {visible.map((record) => {
          const thumbnail = thumbnailFor(record);
          const duration = formatDuration(record.duration_seconds);
          return (
            <article className={styles.card} key={record.id}>
              <button
                className={styles.cardButton}
                type="button"
                onClick={() => setSelected(record)}
                aria-label={`عرض تفاصيل المراجعة لـ ${displayTitle(record)}`}
              >
                <span className={styles.thumb}>
                  {thumbnail ? <img src={thumbnail} alt="" loading="lazy" /> : <span className={styles.thumbFallback} aria-hidden="true" />}
                  <span className={styles.play}><ShieldAlert size={16} /></span>
                  <b>{isMediaRecordApproved(record) ? "معتمد" : "قيد المراجعة"}</b>
                </span>
                <span className={styles.body}>
                  <strong>{displayTitle(record)}</strong>
                  <small>{record.channel_name ?? "قناة غير موثقة"}{record.series_name ? ` · ${record.series_name}` : ""}</small>
                  <em>{record.category ?? "غير مصنّف"}{record.episode_number ? ` · حلقة ${record.episode_number}` : ""}{duration ? ` · ${duration}` : ""}</em>
                </span>
              </button>
              <div className={styles.source}>
                <span>المصدر: صفحة الفيديو على YouTube</span>
                {record.official_url ? (
                  <a href={record.official_url} target="_blank" rel="noopener noreferrer">فتح المصدر <ExternalLink size={13} /></a>
                ) : null}
                <span>القناة/الناشر: {record.channel_name ?? "غير موثق"}</span>
              </div>
            </article>
          );
        })}
      </div>

      {!visible.length && <p className={styles.empty}>لا توجد نتائج مطابقة. جرّب كلمة بحث أو تصنيفًا آخر.</p>}
      {visible.length < filtered.length && (
        <button className={styles.more} type="button" onClick={() => setVisibleCount((count) => count + 12)}>
          عرض المزيد من المواد ({filtered.length - visible.length} متبقية)
        </button>
      )}

      {selected ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setSelected(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className={styles.close} type="button" onClick={() => setSelected(null)} aria-label="إغلاق">
              <X size={20} />
            </button>
            <h3 id="media-dialog-title">{displayTitle(selected)}</h3>
            <p className={styles.modalMeta}>
              {selected.channel_name ?? "قناة غير موثقة"} · {selected.category ?? "غير مصنّف"}
              {selected.series_name ? ` · ${selected.series_name}` : ""}
            </p>

            <div className={styles.gateGrid} aria-label="بوابات المراجعة">
              {GATE_ORDER.map((gate) => {
                const passed = isMediaGatePassed(gate, selected[gate]);
                return (
                  <div key={gate} className={styles.gate} data-passed={passed}>
                    {passed ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                    <span>{MEDIA_REVIEW_GATE_LABELS[gate]}</span>
                    <b>{selected[gate] ?? "UNKNOWN"}</b>
                  </div>
                );
              })}
            </div>

            <div className={styles.modalSource}>
              <strong>المصدر والناشر</strong>
              {selected.official_url ? (
                <span>المصدر: <a href={selected.official_url} target="_blank" rel="noopener noreferrer">صفحة الفيديو الأصلية</a></span>
              ) : null}
              {selected.channel_url ? (
                <span>القناة/الناشر: <a href={selected.channel_url} target="_blank" rel="noopener noreferrer">{selected.channel_name ?? selected.channel_url}</a></span>
              ) : null}
              <span>سجل الاستحواذ: {provenanceLabel(selected)}</span>
              <span>بصمة الإدخال: <code className={styles.hash}>{selected.provenance.inputSha256.slice(0, 16)}…</code></span>
              {selected.review_next_action ? <span>الخطوة التالية: {selected.review_next_action}</span> : null}
              {selected.notes ? <small>{selected.notes}</small> : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
