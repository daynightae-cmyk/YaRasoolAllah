import { useEffect, useState } from "react";
import { X, ShieldCheck, ArrowLeft, ArrowRight, Link2, Volume2, VolumeX } from "lucide-react";
import type { KidsAdaptationSource } from "@/visual-golden/services/kids";
import { kidsReviewStatusLabel } from "@/visual-golden/services/kids";
import styles from "./present.module.css";

interface Props {
  title: string;
  en?: string;
  image: string;
  summary?: string;
  ageBand?: string;
  adaptationLabel?: string;
  editorialStatus?: string;
  reviewStatus?: string;
  depictionPolicy?: string;
  sourceCount?: number;
  sources?: KidsAdaptationSource[];
  position?: { index: number; total: number };
  onPrevious?: () => void;
  onNext?: () => void;
  onClose: () => void;
}

export function StoryTheatre({
  title,
  en,
  image,
  summary,
  ageBand,
  adaptationLabel,
  editorialStatus,
  reviewStatus,
  depictionPolicy,
  sourceCount,
  sources,
  position,
  onPrevious,
  onNext,
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [arabicVoiceReady, setArabicVoiceReady] = useState(false);
  const [speechError, setSpeechError] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setOpen(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Accessible read-aloud: the device's own speech engine reads the SAME
  // governed text shown on screen — never a generated recording. Strictly
  // opt-in (no autoplay), stops on close, and degrades to a visible note when
  // the device offers no Arabic-capable voice. Some engines load voices
  // asynchronously, so we watch voiceschanged too.
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSpeechSupported(false);
      return;
    }
    setSpeechSupported(true);
    const synth = window.speechSynthesis;
    const detect = () => {
      setArabicVoiceReady(synth.getVoices().some((voice) => voice.lang.toLowerCase().startsWith("ar")));
    };
    detect();
    synth.addEventListener?.("voiceschanged", detect);
    return () => {
      synth.removeEventListener?.("voiceschanged", detect);
      synth.cancel();
      setSpeaking(false);
    };
  }, []);

  // A different story stops any ongoing reading — voice never bleeds across items.
  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setSpeechError(false);
  }, [title]);

  const readAloudText = [title, summary].filter(Boolean).join(". ");

  const toggleReadAloud = () => {
    if (!speechSupported || !arabicVoiceReady) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    setSpeechError(false);
    const utterance = new SpeechSynthesisUtterance(readAloudText);
    utterance.lang = "ar";
    const arabicVoice = synth.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("ar"));
    if (!arabicVoice) {
      // The voice list changed under us — stay honest rather than mispronounce.
      setArabicVoiceReady(false);
      return;
    }
    utterance.voice = arabicVoice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setSpeechError(true);
    };
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className={`${styles.theatre} ${open ? styles.theatreOpen : ""}`} role="dialog" aria-label={title}>
      <div className={styles.curtain} aria-hidden>
        <div className={styles.curtainL} />
        <div className={styles.curtainR} />
      </div>
      <div className={styles.theatreBar}>
        <span className="gold-text">مسرح القصص · وضع القراءة</span>
        <button type="button" className="btn-outline" onClick={onClose} aria-label="إغلاق">
          <X size={16} /> إغلاق
        </button>
      </div>
      <div className={styles.theatreStage}>
        <img src={image} alt="" />
        <div className={styles.theatreCaption}>
          <h2>{title}</h2>
          {en ? <p className="muted">{en}</p> : null}
          {ageBand ? <p className="muted">الفئة العمرية: {ageBand}</p> : null}
          {summary ? <p style={{ lineHeight: 1.9 }}>{summary}</p> : null}
          <div className={styles.readAloud} data-visual="kids-read-aloud">
            {speechSupported && arabicVoiceReady ? (
              <button
                type="button"
                onClick={toggleReadAloud}
                aria-pressed={speaking}
                aria-label={speaking ? "إيقاف القراءة الصوتية" : "استمع إلى النص بصوت الجهاز"}
              >
                {speaking ? <VolumeX size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}
                {speaking ? "إيقاف القراءة" : "استمع للنص"}
              </button>
            ) : (
              <span className={styles.readAloudNote}>
                {speechSupported
                  ? "لا يوجد صوت عربي في محرك النطق بجهازك — النص كامل أعلاه للقراءة."
                  : "القراءة الصوتية غير مدعومة على هذا الجهاز — النص كامل أعلاه."}
              </span>
            )}
            <span className={styles.readAloudNote}>
              الصوت من محرك النطق في جهازك، وليس تسجيلًا معتمدًا. لا تشغيل تلقائي.
            </span>
            {speechError ? (
              <span role="alert" className={styles.readAloudNote}>تعذر النطق على هذا الجهاز — يمكنك قراءة النص أعلاه.</span>
            ) : null}
          </div>
          <p className="muted" style={{ fontSize: "0.8rem" }}>
            الوسائط المعتمدة (فيديو/صوت) غير متوفرة بعد — هذا وضع معاينة وقراءة فقط.
          </p>
          <p className="muted" style={{ fontSize: "0.78rem", display: "flex", gap: 4, alignItems: "center" }}>
            <ShieldCheck size={13} />
            {adaptationLabel === "platform_original_not_a_direct_quote"
              ? "تكييف تعليمي أصلي للمنصة — ليس اقتباسًا مباشرًا من نص منقول"
              : "مادة تعليمية"}
            {editorialStatus ? ` · التحرير: ${kidsReviewStatusLabel(editorialStatus)}` : ""}
            {reviewStatus ? ` · المراجعة العلمية: ${kidsReviewStatusLabel(reviewStatus)}` : ""}
          </p>
          {depictionPolicy ? (
            <p className="muted" style={{ fontSize: "0.78rem" }}>
              سياسة التصوير: لا تجسيد للنبي ﷺ
              {typeof sourceCount === "number" ? ` · ${sourceCount} مصادر مرتبطة` : ""}
            </p>
          ) : null}
        </div>
      </div>

      {(sources?.length || (position && position.total > 1)) ? (
        <div className={styles.theatreFooter}>
          {sources?.length ? (
            <div className={styles.sourcePanel} data-visual="kids-source-panel">
              <div className={styles.sourcePanelHead}>
                <Link2 size={15} aria-hidden="true" />
                <strong>للمرافق: الدليل والمصدر</strong>
              </div>
              <p>
                المعرّفات التالية تربط الفكرة بسجل العمل أو المصدر، ولا تعني أن نصًا كاملًا أو اعتمادًا علميًا
                متاح داخل هذه الصفحة.
              </p>
              <ul>
                {sources.map((source) => (
                  <li key={source.sourceId}>
                    <span>{source.titleAr}</span>
                    <small dir="ltr">{source.sourceId}</small>
                  </li>
                ))}
              </ul>
              <a className={styles.sourceLink} href="/sources">فتح سجل المصادر والتحقيق</a>
            </div>
          ) : null}

          {position && position.total > 1 ? (
            <div className={styles.theatreNav} aria-label="التنقل بين مواد القراءة" data-visual="kids-theatre-nav">
              <button type="button" onClick={onPrevious} disabled={!onPrevious} aria-label="المادة السابقة">
                <ArrowRight size={14} aria-hidden="true" /> السابقة
              </button>
              <span>{position.index + 1} / {position.total}</span>
              <button type="button" onClick={onNext} disabled={!onNext} aria-label="المادة التالية">
                التالية <ArrowLeft size={14} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
