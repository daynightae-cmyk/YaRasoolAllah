import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Download, ShieldAlert, XCircle } from "lucide-react";
import { DISCOVERED_MEDIA_CATALOG } from "@/visual-golden/data/media-discovery.generated";
import { MEDIA_REVIEW_GATE_LABELS, isMediaGatePassed, type MediaReviewGateKey } from "@/visual-golden/services/media/review-gates";
import type { MediaDiscoveryRecord } from "@/visual-golden/services/media/types";
import {
  REVIEW_DECISION_LABELS,
  decisionFor,
  loadReviewLog,
  recordReviewDecision,
  saveReviewLog,
  summarizeReviewLog,
  type ReviewDecision,
  type ReviewLogEntry,
} from "@/visual-golden/services/media/review-log";
import { childrenAdaptationRegistry } from "@shared/knowledge-registry";
import { ageBandLabel, kidsAdaptationSources } from "@/visual-golden/services/kids";
import styles from "./KidsReviewQueue.module.css";

const GATE_ORDER = Object.keys(MEDIA_REVIEW_GATE_LABELS) as MediaReviewGateKey[];
const KIDS_CATEGORIES = new Set(["kids", "القرآن الكريم للأطفال"]);
const PAGE_SIZE = 12;

const mediaTitle = (record: MediaDiscoveryRecord) =>
  record.title_ar?.trim() || record.title_original?.trim() || record.id;

function gatesPassed(record: MediaDiscoveryRecord): number {
  return GATE_ORDER.filter((gate) => isMediaGatePassed(gate, record[gate])).length;
}

/**
 * Governed review queue: a clear, actionable list of everything still pending
 * — platform adaptations and discovered kids media — with full metadata and a
 * decision control. Decisions are recorded in the local review log only; they
 * never publish anything. Public display still requires the generated
 * promotion pipeline, so the approved catalog count stays honest.
 */
export function KidsReviewQueue() {
  const [entries, setEntries] = useState<ReviewLogEntry[]>(() => loadReviewLog());
  const [reviewer, setReviewer] = useState("");
  const [note, setNote] = useState("");
  const [visibleMedia, setVisibleMedia] = useState(PAGE_SIZE);

  const pendingMedia = useMemo(
    () => DISCOVERED_MEDIA_CATALOG.filter((record) => KIDS_CATEGORIES.has(record.category ?? "")),
    [],
  );
  const summary = useMemo(() => summarizeReviewLog(entries), [entries]);

  const decide = (itemKind: "media" | "adaptation", itemId: string, decision: ReviewDecision) => {
    const next = recordReviewDecision(entries, {
      itemId,
      itemKind,
      decision,
      note: note.trim(),
      reviewer: reviewer.trim() || "مراجع محلي",
    });
    saveReviewLog(next);
    setEntries(next);
    setNote("");
  };

  const exportLog = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "yra-review-log.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderDecisionButtons = (itemKind: "media" | "adaptation", itemId: string) => {
    const existing = decisionFor(entries, itemKind, itemId);
    return (
      <div className={styles.decisions} role="group" aria-label={`تسجيل قرار المراجعة لـ ${itemId}`}>
        {(["approved", "rejected", "changes_requested"] as ReviewDecision[]).map((decision) => (
          <button
            key={decision}
            type="button"
            className={existing?.decision === decision ? styles.decisionActive : styles.decision}
            data-decision={decision}
            data-active={existing?.decision === decision}
            onClick={() => decide(itemKind, itemId, decision)}
          >
            {REVIEW_DECISION_LABELS[decision]}
          </button>
        ))}
        {existing ? (
          <span className={styles.recorded} data-decision={existing.decision}>
            مسجَّل: {REVIEW_DECISION_LABELS[existing.decision]}
            {existing.note ? ` — ${existing.note}` : ""}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <section className={styles.queue} data-visual="kids-review-queue" aria-labelledby="kids-review-queue-title">
      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}><ClipboardList size={15} aria-hidden="true" /> قائمة المراجعة الحاكمة</span>
          <h2 id="kids-review-queue-title">طابور مراجعة المواد</h2>
          <p>
            كل تكييف أصلي وكل مادة مكتشفة للأطفال ما زالت قيد المراجعة. سجّل قرارك لكل مادة؛
            القرار يُحفظ محليًا على هذا الجهاز فقط.
          </p>
        </div>
        <div className={styles.counts} aria-label="ملخص قرارات المراجعة المسجلة">
          <span><b>{entries.length}</b> قرارًا مسجَّلًا</span>
          <span><b>{summary.approved}</b> اعتماد</span>
          <span><b>{summary.rejected}</b> رفض</span>
          <span><b>{summary.changes_requested}</b> يحتاج تعديل</span>
        </div>
      </div>

      <div className={styles.notice} role="note">
        <ShieldAlert size={16} aria-hidden="true" />
        <span>
          <b>التسجيل ليس نشرًا.</b>قرار المراجعة المحفوظ هنا لا يغيّر كتالوج النشر المعتمد؛
          النشر العام يمر فقط بخط أنابيب الاعتماد المولّد (scripts/acquire)،
          وعداد الوسائط المعتمدة يبقى صفرًا حتى يتم اعتمادها عبره.
        </span>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.reviewer}>
          <span>اسم المراجع (اختياري)</span>
          <input
            value={reviewer}
            onChange={(event) => setReviewer(event.target.value)}
            placeholder="مثال: أم أحمد"
            aria-label="اسم المراجع"
          />
        </label>
        <label className={styles.note}>
          <span>ملاحظة على المادة التالية</span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="سبب الاعتماد أو الرفض أو التعديل المطلوب"
            aria-label="ملاحظة المراجعة"
          />
        </label>
        <button type="button" className="btn-gold" onClick={exportLog} disabled={entries.length === 0}>
          <Download size={15} aria-hidden="true" /> تصدير السجل (JSON)
        </button>
      </div>

      <h3 className={styles.subhead}>التكييفات الأصلية ({childrenAdaptationRegistry.length} قيد المراجعة التحريرية والعلمية)</h3>
      <ul className={styles.list} aria-label="قائمة التكييفات قيد المراجعة">
        {childrenAdaptationRegistry.map((adaptation) => {
          const sources = kidsAdaptationSources(adaptation);
          return (
            <li key={adaptation.adaptationId} className={styles.row} data-item-id={adaptation.adaptationId}>
              <div className={styles.rowBody}>
                <strong>{adaptation.titleAr}</strong>
                <small>
                  {ageBandLabel(adaptation.ageBand)} · {sources.length} مصادر مسجّلة ·{" "}
                  {adaptation.editorialStatus === "editorial_review_pending" ? "تحرير معلّق" : adaptation.editorialStatus} ·{" "}
                  {adaptation.reviewStatus === "scholarly_review_pending" ? "علمية معلّقة" : adaptation.reviewStatus} ·{" "}
                  {adaptation.depictionPolicy === "no_prophetic_depiction" ? "لا تمثيل للأنبياء" : adaptation.depictionPolicy}
                </small>
                <small className={styles.sources}>المعرّفات: {sources.map((source) => source.sourceId).join("، ")}</small>
              </div>
              {renderDecisionButtons("adaptation", adaptation.adaptationId)}
            </li>
          );
        })}
      </ul>

      <h3 className={styles.subhead}>
        الوسائط المكتشفة للأطفال ({pendingMedia.length} سجلًا، {pendingMedia.length} قيد المراجعة)
      </h3>
      <ul className={styles.list} aria-label="قائمة وسائط الأطفال قيد المراجعة">
        {pendingMedia.slice(0, visibleMedia).map((record) => (
          <li key={record.id} className={styles.row} data-item-id={record.id}>
            <div className={styles.rowBody}>
              <strong>{mediaTitle(record)}</strong>
              <small>
                {record.channel_name ?? "قناة غير موثقة"}
                {record.series_name ? ` · ${record.series_name}` : ""}
                {record.category ? ` · ${record.category}` : ""}
              </small>
              <small className={styles.gates}>
                بوابات متجاوزة: {gatesPassed(record)}/{GATE_ORDER.length}
                {record.official_url ? ` · ${record.official_url}` : ""}
              </small>
            </div>
            {renderDecisionButtons("media", record.id)}
          </li>
        ))}
      </ul>
      {visibleMedia < pendingMedia.length ? (
        <button type="button" className={styles.more} onClick={() => setVisibleMedia((count) => count + PAGE_SIZE)}>
          عرض المزيد من المواد ({pendingMedia.length - visibleMedia} متبقية)
        </button>
      ) : null}
    </section>
  );
}
