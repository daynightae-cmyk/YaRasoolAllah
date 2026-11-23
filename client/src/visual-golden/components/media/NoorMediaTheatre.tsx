import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  BookOpenText,
  CheckCircle2,
  ChevronLeft,
  Clapperboard,
  ExternalLink,
  Film,
  Headphones,
  Info,
  LayoutGrid,
  ListFilter,
  ListVideo,
  LoaderCircle,
  Maximize2,
  Mic2,
  Minimize2,
  Play,
  RotateCcw,
  Search,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import {
  MEDIA_REVIEW_GATE_LABELS,
  isMediaGatePassed,
  isMediaRecordApproved,
  mediaReviewCounts,
  type MediaReviewGateKey,
} from "@/visual-golden/services/media/review-gates";
import {
  EMPTY_NOOR_FILTERS,
  NOOR_MEDIA_RECORDS,
  approvedNoorEmbedUrl,
  clearedNoorThumbnail,
  filterNoorRecords,
  noorMediaDuration,
  noorMediaTitle,
  type NoorAvailability,
  type NoorFilters,
  type NoorTopic,
} from "@/visual-golden/services/media/noor-theatre";
import type { MediaDiscoveryRecord } from "@/visual-golden/services/media/types";
import styles from "./NoorMediaTheatre.module.css";

const GATE_ORDER = Object.keys(MEDIA_REVIEW_GATE_LABELS) as MediaReviewGateKey[];
const TOPICS: ReadonlyArray<{ id: NoorTopic; label: string; en: string; icon: typeof Film }> = [
  { id: "all", label: "كل المواد", en: "Complete catalog", icon: LayoutGrid },
  { id: "seerah", label: "السيرة النبوية", en: "Prophetic biography", icon: BookOpenText },
  { id: "lectures", label: "محاضرات ومواعظ", en: "Lectures", icon: Mic2 },
  { id: "stories", label: "قصص الأنبياء والدروس", en: "Stories and lessons", icon: Film },
];

function uniqueValues(key: "category" | "channel_name" | "speaker"): string[] {
  return [...new Set(NOOR_MEDIA_RECORDS.map((record) => record[key]).filter((value): value is string => Boolean(value)))];
}

function recordMeta(record: MediaDiscoveryRecord): string {
  return [record.channel_name ?? "ناشر غير موثق", record.series_name, record.subcategory]
    .filter(Boolean)
    .join(" · ");
}

export function NoorMediaTheatre() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const effectiveMotion = useEffectiveMotion();
  const [filters, setFilters] = useState<NoorFilters>(EMPTY_NOOR_FILTERS);
  const [visibleCount, setVisibleCount] = useState(8);
  const [detail, setDetail] = useState<MediaDiscoveryRecord | null>(null);
  const [playerState, setPlayerState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [playerAttempt, setPlayerAttempt] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenMessage, setFullscreenMessage] = useState("");
  const screenRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const counts = useMemo(() => mediaReviewCounts(NOOR_MEDIA_RECORDS), []);
  const categories = useMemo(() => uniqueValues("category"), []);
  const channels = useMemo(() => uniqueValues("channel_name"), []);
  const speakers = useMemo(() => uniqueValues("speaker"), []);
  const filtered = useMemo(() => filterNoorRecords(NOOR_MEDIA_RECORDS, filters), [filters]);
  const requestedId = new URLSearchParams(search).get("media");
  const selected = filtered.length
    ? filtered.find((record) => record.id === requestedId) ?? filtered[0]
    : null;
  const selectedIndex = selected ? filtered.findIndex((record) => record.id === selected.id) : -1;
  const selectedApproved = selected ? isMediaRecordApproved(selected) : false;
  const embedUrl = selected ? approvedNoorEmbedUrl(selected) : null;
  const selectedThumbnail = selected ? clearedNoorThumbnail(selected) : null;
  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    setPlayerState("idle");
    setPlayerAttempt(0);
    setFullscreenMessage("");
  }, [selected?.id]);

  useEffect(() => {
    if (playerState !== "loading") return;
    const timeout = window.setTimeout(() => setPlayerState("error"), 15_000);
    return () => window.clearTimeout(timeout);
  }, [playerAttempt, playerState, selected?.id]);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(document.fullscreenElement === screenRef.current);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (detail && !dialog.open) dialog.showModal();
    if (!detail && dialog.open) dialog.close();
  }, [detail]);

  const patchFilters = (patch: Partial<NoorFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setVisibleCount(8);
  };

  const selectRecord = (record: MediaDiscoveryRecord, bringIntoView = false) => {
    const params = new URLSearchParams(search);
    params.set("media", record.id);
    navigate(`/noor?${params.toString()}`);
    if (bringIntoView) {
      screenRef.current?.scrollIntoView({
        block: "center",
        behavior: effectiveMotion === "reduced" ? "auto" : "smooth",
      });
    }
  };

  const selectRelative = (direction: -1 | 1) => {
    if (!filtered.length) return;
    const nextIndex = selectedIndex < 0
      ? 0
      : (selectedIndex + direction + filtered.length) % filtered.length;
    selectRecord(filtered[nextIndex]);
  };

  const toggleFullscreen = async () => {
    setFullscreenMessage("");
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (screenRef.current?.requestFullscreen) {
        await screenRef.current.requestFullscreen();
      } else {
        setFullscreenMessage("ملء الشاشة غير مدعوم في هذا المتصفح.");
      }
    } catch {
      setFullscreenMessage("تعذر فتح ملء الشاشة. يمكنك متابعة الاستكشاف داخل القاعة.");
    }
  };

  const beginPlayback = () => {
    if (!embedUrl) return;
    setPlayerAttempt((attempt) => attempt + 1);
    setPlayerState("loading");
  };

  const availabilityLabel = (record: MediaDiscoveryRecord) =>
    isMediaRecordApproved(record) ? "معتمد للتشغيل" : "قيد المراجعة";

  return (
    <div className={styles.page} data-visual="noor-theatre" data-approved-count={counts.approved}>
      <header className={styles.masthead}>
        <div className={styles.arch} aria-hidden="true"><span /><span /><span /></div>
        <div className={styles.mastheadCopy}>
          <p className={styles.kicker}><Sparkles size={15} aria-hidden /> قاعة المعرفة المرئية <span lang="en">NOOR MEDIA THEATRE</span></p>
          <h1>مسرح <em>النور</em></h1>
          <p className={styles.englishTitle} lang="en">Noor Media Theatre</p>
          <p className={styles.lead}>
            بوابة استكشاف موثّقة للسيرة والمحاضرات؛ تعرض المصدر وحالة المراجعة قبل أي قرار تشغيل.
          </p>
          <nav className={styles.mastheadActions} aria-label="أبواب مرتبطة بالمسرح">
            <Link href="/seerah" className={styles.textLink}><BookOpenText size={15} /> اقرأ السيرة</Link>
            <Link href="/audio" className={styles.textLink}><Headphones size={15} /> غرفة التلاوات</Link>
            <Link href="/seerah/world" className={styles.textLink}><Clapperboard size={15} /> العالم التفاعلي</Link>
          </nav>
        </div>
        <dl className={styles.ledger} aria-label="حصيلة كتالوج المسرح">
          <div><dt>مادة مفهرسة</dt><dd>{counts.total}</dd></div>
          <div><dt>معتمدة للتشغيل</dt><dd>{counts.approved}</dd></div>
          <div><dt>قيد المراجعة</dt><dd>{counts.pending}</dd></div>
        </dl>
      </header>

      <section className={styles.cinema} aria-label="قاعة مسرح النور">
        <div className={styles.hallLight} aria-hidden="true" />
        <div className={styles.hallGrid}>
          <aside className={`${styles.glassPanel} ${styles.topics}`} aria-labelledby="noor-topics-title">
            <header className={styles.panelHead}>
              <ListFilter size={17} aria-hidden />
              <div><h2 id="noor-topics-title">أروقة المسرح</h2><span lang="en">Media rooms</span></div>
            </header>
            <div className={styles.topicList}>
              {TOPICS.map((topic) => {
                const Icon = topic.icon;
                const count = NOOR_MEDIA_RECORDS.filter((record) =>
                  filterNoorRecords([record], { ...EMPTY_NOOR_FILTERS, topic: topic.id }).length > 0,
                ).length;
                return (
                  <button
                    type="button"
                    key={topic.id}
                    className={styles.topicButton}
                    data-active={filters.topic === topic.id}
                    aria-pressed={filters.topic === topic.id}
                    onClick={() => patchFilters({ topic: topic.id, category: "all" })}
                  >
                    <Icon size={20} aria-hidden />
                    <span><strong>{topic.label}</strong><small lang="en">{topic.en}</small></span>
                    <b>{count}</b>
                  </button>
                );
              })}
            </div>
            <p className={styles.topicNote}>التصنيف يغيّر الفهرس فقط؛ لا يبدأ أي تشغيل تلقائي.</p>
          </aside>

          <div className={styles.screenColumn}>
            <div
              ref={screenRef}
              className={styles.screenFrame}
              data-player-state={selectedApproved ? playerState : "blocked"}
              data-media-id={selected?.id ?? "none"}
            >
              <div className={styles.screenTopline}>
                <span><Clapperboard size={15} aria-hidden /> {selected?.category ?? "لا توجد مادة محددة"}</span>
                <span className={selectedApproved ? styles.approvedBadge : styles.reviewBadge}>
                  {selectedApproved ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  {selected ? availabilityLabel(selected) : "نتائج فارغة"}
                </span>
              </div>

              <div className={styles.screenBody}>
                {selected && selectedApproved && embedUrl && playerState !== "idle" ? (
                  <>
                    <iframe
                      key={`${selected.id}-${playerAttempt}`}
                      className={styles.providerFrame}
                      src={embedUrl}
                      title={`مشغل الفيديو الرسمي: ${noorMediaTitle(selected)}`}
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      onLoad={() => setPlayerState("ready")}
                      onError={() => setPlayerState("error")}
                    />
                    {playerState === "loading" ? (
                      <div className={styles.playerOverlay} role="status">
                        <LoaderCircle className={styles.spinner} size={34} aria-hidden />
                        <strong>جاري تحميل مشغل المزود…</strong>
                        <span>لن يبدأ الفيديو تلقائيًا.</span>
                      </div>
                    ) : null}
                    {playerState === "error" ? (
                      <div className={styles.playerOverlay} role="alert">
                        <ShieldAlert size={34} aria-hidden />
                        <strong>تعذر تحميل إطار المزود</strong>
                        <span>تحقق من الاتصال أو افتح المصدر الرسمي.</span>
                        <button type="button" className={styles.goldButton} onClick={beginPlayback}><RotateCcw size={15} /> إعادة المحاولة</button>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <img
                      className={styles.screenArt}
                      src={selectedThumbnail ?? "/visual-golden/art/worlds/seerah.webp"}
                      alt=""
                    />
                    <div className={styles.screenVeil} aria-hidden="true" />
                    <div className={styles.emptyState}>
                      {selected ? <ShieldAlert size={35} aria-hidden /> : <SearchX size={35} aria-hidden />}
                      <p className={styles.emptyKicker}>{selected ? "المادة المحددة" : "الفهرس الحالي"}</p>
                      <h2>{selected ? noorMediaTitle(selected) : "لا توجد نتائج مطابقة"}</h2>
                      <p>
                        {!selected
                          ? "جرّب إزالة بعض الفلاتر أو البحث بكلمة أخرى."
                          : selectedApproved && !embedUrl
                            ? "سجل المراجعة مكتمل، لكن رابط التضمين الرسمي غير صالح؛ لم نركّب مشغلًا بديلًا."
                            : "التشغيل الداخلي متوقف لأن حقوق الاستخدام أو التضمين أو المراجعة لم تكتمل. لا يوجد تشغيل تجريبي ولا مادة بديلة."}
                      </p>
                      <div className={styles.emptyActions}>
                        {selectedApproved && embedUrl ? (
                          <button type="button" className={styles.playButton} onClick={beginPlayback}>
                            <Play size={22} fill="currentColor" aria-hidden /> تحميل المشغل الرسمي
                          </button>
                        ) : null}
                        {selected?.official_url ? (
                          <a href={selected.official_url} target="_blank" rel="noopener noreferrer" className={styles.sourceButton}>
                            <ExternalLink size={16} /> فتح المصدر الرسمي
                          </a>
                        ) : null}
                        {selected ? (
                          <button type="button" className={styles.detailButton} onClick={() => setDetail(selected)}>
                            <Info size={16} /> لماذا لا يعمل المشغل؟
                          </button>
                        ) : (
                          <button type="button" className={styles.detailButton} onClick={() => setFilters(EMPTY_NOOR_FILTERS)}>
                            <RotateCcw size={16} /> إعادة ضبط الفلاتر
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.screenControls}>
                <span className={styles.playerTruth} aria-live="polite">
                  {playerState === "ready"
                    ? "تم تحميل إطار المزود؛ التحكم والتشغيل من داخل المشغل."
                    : "بدون تشغيل تلقائي · بدون تقدم مشاهدة مقدّر"}
                </span>
                <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "الخروج من ملء الشاشة" : "فتح المسرح بملء الشاشة"}>
                  {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                  <span>{fullscreen ? "تصغير" : "ملء الشاشة"}</span>
                </button>
              </div>
            </div>
            {fullscreenMessage ? <p className={styles.fullscreenMessage} role="status">{fullscreenMessage}</p> : null}
            <div className={styles.nowCard}>
              <div>
                <span>المادة المحددة الآن</span>
                <strong>{selected ? noorMediaTitle(selected) : "لا يوجد اختيار"}</strong>
                <small>{selected ? recordMeta(selected) : "عدّل البحث أو الفلاتر لعرض المواد."}</small>
              </div>
              <div className={styles.nowActions}>
                <button type="button" onClick={() => selectRelative(-1)} disabled={!filtered.length} aria-label="المادة السابقة"><SkipForward size={18} /></button>
                <button type="button" onClick={() => selectRelative(1)} disabled={!filtered.length} aria-label="المادة التالية"><SkipBack size={18} /></button>
              </div>
            </div>
          </div>

          <aside className={`${styles.glassPanel} ${styles.playlist}`} aria-labelledby="noor-playlist-title">
            <header className={styles.panelHead}>
              <ListVideo size={18} aria-hidden />
              <div><h2 id="noor-playlist-title">قائمة التشغيل</h2><span>{filtered.length} مادة في العرض الحالي</span></div>
            </header>
            <p className={styles.playlistNote}>اختيار مادة يعرض بيانها، ولا يشغّلها تلقائيًا.</p>
            <ol className={styles.playlistItems}>
              {filtered.map((record, index) => {
                const active = selected?.id === record.id;
                const duration = noorMediaDuration(record.duration_seconds);
                return (
                  <li key={record.id}>
                    <button
                      type="button"
                      className={styles.playlistItem}
                      data-active={active}
                      aria-current={active ? "true" : undefined}
                      onClick={() => selectRecord(record)}
                    >
                      <span className={styles.queueIndex}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.queueCopy}>
                        <strong>{noorMediaTitle(record)}</strong>
                        <small>{record.speaker ?? record.channel_name ?? "ناشر غير موثق"}</small>
                        <em>{duration ?? "المدة غير موثقة"} · {availabilityLabel(record)}</em>
                      </span>
                      <ChevronLeft size={16} aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ol>
            {!filtered.length ? <p className={styles.playlistEmpty}>القائمة فارغة بهذه الفلاتر.</p> : null}
          </aside>
        </div>

        <div className={styles.filterDeck}>
          <label className={styles.searchBox}>
            <Search size={18} aria-hidden />
            <span className="sr-only">ابحث في مسرح النور</span>
            <input
              type="search"
              value={filters.query}
              onChange={(event) => patchFilters({ query: event.target.value })}
              placeholder="ابحث بالعنوان أو السلسلة أو القناة أو المتحدث"
            />
          </label>
          <label className={styles.selectBox}><span>التصنيف الدقيق</span>
            <select value={filters.category} onChange={(event) => patchFilters({ category: event.target.value, topic: "all" })}>
              <option value="all">كل التصنيفات</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className={styles.selectBox}><span>القناة / الناشر</span>
            <select value={filters.channel} onChange={(event) => patchFilters({ channel: event.target.value })}>
              <option value="all">كل القنوات</option>
              {channels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
            </select>
          </label>
          <label className={styles.selectBox}><span>المتحدث</span>
            <select value={filters.speaker} onChange={(event) => patchFilters({ speaker: event.target.value })}>
              <option value="all">كل المتحدثين</option>
              {speakers.map((speaker) => <option key={speaker} value={speaker}>{speaker}</option>)}
            </select>
          </label>
          <div className={styles.availability} aria-label="حالة الاعتماد">
            {(["all", "review", "approved"] as NoorAvailability[]).map((value) => (
              <button
                type="button"
                key={value}
                data-active={filters.availability === value}
                aria-pressed={filters.availability === value}
                onClick={() => patchFilters({ availability: value })}
              >
                {value === "all" ? "كل الحالات" : value === "review" ? "قيد المراجعة" : "المعتمد فقط"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.library} aria-labelledby="noor-library-title">
        <header className={styles.libraryHead}>
          <div><p className={styles.kicker}><Film size={15} /> فهرس القاعة</p><h2 id="noor-library-title">المواد المسجّلة في مسرح النور</h2></div>
          <p><strong>{filtered.length}</strong> نتيجة · الصور الخارجية محجوبة ما لم تُعتمد حقوقها مستقلًا.</p>
        </header>
        <div className={styles.mediaGrid}>
          {visible.map((record) => {
            const active = selected?.id === record.id;
            const duration = noorMediaDuration(record.duration_seconds);
            return (
              <article className={styles.mediaCard} key={record.id} data-active={active}>
                <button type="button" className={styles.mediaSelect} onClick={() => selectRecord(record, true)} aria-label={`تحديد ${noorMediaTitle(record)}`}>
                  <span className={styles.mediaArt} aria-hidden="true">
                    <span className={styles.mediaArch} />
                    {record.category === "محاضرات ومواعظ" ? <Mic2 size={32} /> : <BookOpenText size={32} />}
                    <b>{record.episode_number ? `حلقة ${record.episode_number}` : record.category}</b>
                  </span>
                  <span className={styles.mediaCopy}>
                    <span className={styles.mediaStatus}><ShieldAlert size={12} /> {availabilityLabel(record)}</span>
                    <strong>{noorMediaTitle(record)}</strong>
                    <small>{recordMeta(record)}</small>
                    <em>{duration ?? "المدة غير موثقة"}</em>
                  </span>
                </button>
                <footer>
                  <button type="button" onClick={() => setDetail(record)}><Info size={14} /> بيانات المراجعة</button>
                  {record.official_url ? <a href={record.official_url} target="_blank" rel="noopener noreferrer" aria-label={`فتح المصدر الرسمي لـ ${noorMediaTitle(record)}`}><ExternalLink size={14} /> المصدر</a> : null}
                </footer>
              </article>
            );
          })}
        </div>
        {!visible.length ? <div className={styles.libraryEmpty}><SearchX size={28} /><p>لا توجد مواد بهذا البحث. الفلاتر لا تغيّر حالة اعتماد أي سجل.</p></div> : null}
        {visible.length < filtered.length ? (
          <button type="button" className={styles.moreButton} onClick={() => setVisibleCount((count) => count + 8)}>
            عرض المزيد <span>{filtered.length - visible.length} مادة متبقية</span><ChevronLeft size={16} />
          </button>
        ) : null}
      </section>

      <footer className={styles.sessionDock}>
        <div className={styles.dockIdentity}>
          <span className={styles.dockIcon}><Clapperboard size={22} aria-hidden /></span>
          <span><small>جلسة الاستكشاف الحالية</small><strong>{selected ? noorMediaTitle(selected) : "لا توجد مادة محددة"}</strong></span>
        </div>
        <div className={styles.dockControls}>
          <button type="button" onClick={() => selectRelative(-1)} disabled={!filtered.length}><SkipForward size={16} /> السابق</button>
          <button type="button" onClick={() => selectRelative(1)} disabled={!filtered.length}>التالي <SkipBack size={16} /></button>
          {selected ? <button type="button" onClick={() => setDetail(selected)}><Info size={16} /> المصدر والحالة</button> : null}
        </div>
        <span className={styles.dockStatus}><ShieldAlert size={15} /> {counts.approved} معتمد من {counts.total} — لا يوجد شريط تقدم افتراضي</span>
      </footer>

      <dialog
        ref={dialogRef}
        className={styles.reviewDialog}
        aria-labelledby="noor-review-title"
        onClose={() => setDetail(null)}
        onClick={(event) => { if (event.target === event.currentTarget) setDetail(null); }}
      >
        {detail ? (
          <div className={styles.dialogInner}>
            <button type="button" className={styles.dialogClose} onClick={() => setDetail(null)} aria-label="إغلاق بيانات المراجعة"><X size={20} /></button>
            <p className={styles.kicker}><ShieldCheck size={15} /> سجل الاستحواذ والاعتماد</p>
            <h2 id="noor-review-title">{noorMediaTitle(detail)}</h2>
            <p className={styles.dialogMeta}>{recordMeta(detail)}</p>
            <div className={styles.gateGrid} aria-label="بوابات المراجعة السبع">
              {GATE_ORDER.map((gate) => {
                const passed = isMediaGatePassed(gate, detail[gate]);
                return (
                  <div key={gate} className={styles.gate} data-passed={passed}>
                    {passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    <span>{MEDIA_REVIEW_GATE_LABELS[gate]}</span>
                    <b>{detail[gate] ?? "UNKNOWN"}</b>
                  </div>
                );
              })}
            </div>
            <dl className={styles.sourceFacts}>
              <div><dt>المصدر</dt><dd>{detail.official_url ? <a href={detail.official_url} target="_blank" rel="noopener noreferrer">صفحة الفيديو الأصلية <ExternalLink size={13} /></a> : "غير مسجل"}</dd></div>
              <div><dt>القناة / الناشر</dt><dd>{detail.channel_url ? <a href={detail.channel_url} target="_blank" rel="noopener noreferrer">{detail.channel_name ?? detail.channel_url}</a> : detail.channel_name ?? "غير موثق"}</dd></div>
              <div><dt>سجل الاستحواذ</dt><dd>{detail.provenance.sourceFile} · سطر {detail.provenance.sourceRow}</dd></div>
              <div><dt>بصمة الإدخال</dt><dd><code>{detail.provenance.inputSha256.slice(0, 20)}…</code></dd></div>
              <div><dt>الخطوة التالية</dt><dd>{detail.review_next_action ?? "غير مسجلة"}</dd></div>
            </dl>
            {detail.notes ? <p className={styles.reviewNotes}>{detail.notes}</p> : null}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
