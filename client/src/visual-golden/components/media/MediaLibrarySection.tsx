import { useMemo, useState } from "react";
import { ExternalLink, Play, Search, ShieldAlert, X } from "lucide-react";
import { MEDIA_LIBRARY, type MediaLibraryKind, type MediaLibraryRecord } from "@/data/mediaLibrary";
import { ImmersiveGateway } from "@/visual-golden/components/immersive/ImmersiveGateway";
import styles from "./MediaLibrarySection.module.css";

type Props = { kind: MediaLibraryKind; title: string; subtitle: string };

const statusLabel = (record: MediaLibraryRecord) =>
  record.embeddingStatus === "EMBED_RUNTIME_VERIFIED" ? "تشغيل متحقق" : "مرشح تشغيل · قيد التحقق";

export function MediaLibrarySection({ kind, title, subtitle }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [channel, setChannel] = useState("all");
  const [speaker, setSpeaker] = useState("all");
  const [selected, setSelected] = useState<MediaLibraryRecord | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const records = useMemo(() => MEDIA_LIBRARY.filter((item) => item.kind === kind), [kind]);
  const categories = useMemo(() => ["all", ...new Set(records.map((item) => item.category))], [records]);
  const channels = useMemo(() => ["all", ...new Set(records.map((item) => item.channel))], [records]);
  const speakers = useMemo(() => ["all", ...new Set(records.map((item) => item.speaker).filter((item): item is string => Boolean(item)))], [records]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ar");
    return records.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (channel !== "all" && item.channel !== channel) return false;
      if (speaker !== "all" && item.speaker !== speaker) return false;
      if (!normalized) return true;
      return [item.title, item.originalTitle, item.channel, item.category, item.series ?? "", item.speaker ?? ""]
        .join(" ").toLocaleLowerCase("ar").includes(normalized);
    });
  }, [category, channel, query, records, speaker]);
  const visible = filtered.slice(0, visibleCount);

  return (
    <ImmersiveGateway
      title={kind === "kids" ? "باب مسرح الأطفال" : "باب استوديو الدعاة"}
      subtitle={kind === "kids" ? "رسوم وقصص صوتية ومحتوى تربوي للصغار" : "قراء ودعاة وخطب وسلاسل في السيرة"}
      description={kind === "kids" ? "ادخل إلى رفوف الحلقات واختَر المادة التي تريد تشغيلها." : "ادخل إلى الاستوديو، اقترب من رف الدعاة، ثم شغّل الخطب والسلاسل من صفحاتها الأصلية."}
      eyebrow={kind === "kids" ? "ممر الأطفال" : "ممر الميديا"}
      Icon={Play}
    >
    <section className={styles.section} aria-labelledby={`${kind}-media-title`}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}><Play size={15} /> مكتبة فيديو موثقة المصدر</span>
          <h2 id={`${kind}-media-title`}>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className={styles.count} aria-label={`عدد السجلات ${records.length}`}><strong>{records.length}</strong><span>سجلًا في الكتالوج</span></div>
      </div>
      <div className={styles.notice} role="note"><ShieldAlert size={17} /><span>التشغيل هنا عبر مشغل YouTube الرسمي وبالنقر فقط. كل سجل ما زال يحتاج مراجعة الحقوق والتحرير واختبار التضمين داخل الموقع؛ ظهور الرابط لا يعني الترخيص.</span></div>
      <div className={styles.toolbar}>
        <label className={styles.search}><Search size={17} aria-hidden="true" /><span className="sr-only">ابحث في المكتبة</span><input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(12); }} placeholder="ابحث بالعنوان أو القناة أو السلسلة" /></label>
        <div className={styles.chips} aria-label="تصنيف الفيديوهات">
          {categories.map((item) => <button key={item} type="button" data-active={category === item} onClick={() => { setCategory(item); setVisibleCount(12); }}>{item === "all" ? "الكل" : item}</button>)}
        </div>
        {kind === "seerah" ? <>
          <div className={styles.filterLabel}>حسب القناة</div>
          <div className={styles.chips} aria-label="تصفية حسب القناة">
            {channels.map((item) => <button key={item} type="button" data-active={channel === item} onClick={() => { setChannel(item); setVisibleCount(12); }}>{item === "all" ? "كل القنوات" : item}</button>)}
          </div>
          <div className={styles.filterLabel}>حسب الشيخ</div>
          <div className={styles.chips} aria-label="تصفية حسب الشيخ">
            {speakers.map((item) => <button key={item} type="button" data-active={speaker === item} onClick={() => { setSpeaker(item); setVisibleCount(12); }}>{item === "all" ? "كل الشيوخ" : item}</button>)}
          </div>
        </> : null}
      </div>
      <div className={styles.grid}>
        {visible.map((item) => (
          <article className={styles.card} key={item.id}>
            <button className={styles.cardButton} type="button" onClick={() => setSelected(item)} aria-label={`تشغيل ${item.title}`}>
              <span className={styles.thumb}><img src={item.thumbnail} alt="" loading="lazy" /><span className={styles.play}><Play size={18} fill="currentColor" /></span><b>{statusLabel(item)}</b></span>
              <span className={styles.body}><strong>{item.title}</strong><small>{item.channel}{item.series ? ` · ${item.series}` : ""}</small><em>{item.category}</em></span>
            </button>
            <div className={styles.source}><span>المصدر: صفحة الفيديو على YouTube</span><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">فتح المصدر <ExternalLink size={13} /></a><span>القناة/الناشر: {item.channel}</span></div>
          </article>
        ))}
      </div>
      {!visible.length && <p className={styles.empty}>لا توجد نتائج مطابقة. جرّب كلمة بحث أخرى.</p>}
      {visible.length < filtered.length && <button className={styles.more} type="button" onClick={() => setVisibleCount((count) => count + 12)}>عرض المزيد من المواد ({filtered.length - visible.length} متبقية)</button>}
      {selected ? <div className={styles.modalBackdrop} role="presentation" onClick={() => setSelected(null)}><div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="media-dialog-title" onClick={(event) => event.stopPropagation()}><button className={styles.close} type="button" onClick={() => setSelected(null)} aria-label="إغلاق"><X size={20} /></button><div className={styles.player}><iframe src={`https://www.youtube-nocookie.com/embed/${selected.videoId}?rel=0&modestbranding=1`} title={selected.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><h3 id="media-dialog-title">{selected.title}</h3><p className={styles.modalMeta}>{selected.channel} · {selected.category}</p><div className={styles.modalSource}><strong>المصدر والناشر</strong><span>المصدر: <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">صفحة الفيديو الأصلية</a></span><span>القناة/الناشر: <a href={selected.channelUrl ?? selected.sourceUrl} target="_blank" rel="noopener noreferrer">{selected.channel}</a></span><span>حالة الحقوق: {selected.rightsStatus} · حالة التضمين: {selected.embeddingStatus}</span><small>{selected.notes}</small></div></div></div> : null}
    </section>
    </ImmersiveGateway>
  );
}
