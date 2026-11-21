/**
 * Kids quiz garden — directive §4.H optional educational activity.
 *
 * Real runtime behavior: questions are built from the governed Quran chapter
 * metadata (names + ayah counts). Answers give immediate feedback with the
 * real registry reference — no invented facts, no fake score claims. Progress
 * is local-only and never a measure of faith. Same accessible-modal contract
 * as ColoringStudio (Escape, focus entry/trap/restoration).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Puzzle, RefreshCw, X } from "lucide-react";
import { getQuranChapters, type QuranChapter } from "@/services/quranService";
import {
  buildKidsQuiz,
  kidsQuizComplete,
  type KidsQuiz,
} from "@/visual-golden/services/kids-quiz";
import styles from "./unique.module.css";

interface Props {
  onClose: () => void;
  onSessionComplete?: () => void;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hidden && element.getAttribute("aria-hidden") !== "true",
  );
}

type QuizState =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ready"; quiz: KidsQuiz };

export function KidsQuizGarden({ onClose, onSessionComplete }: Props) {
  const [quizState, setQuizState] = useState<QuizState>({ state: "loading" });
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 0x7fffffff));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const completionReportedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onSessionCompleteRef = useRef(onSessionComplete);

  onCloseRef.current = onClose;
  onSessionCompleteRef.current = onSessionComplete;

  useEffect(() => {
    let cancelled = false;
    setQuizState({ state: "loading" });
    getQuranChapters()
      .then((chapters: QuranChapter[]) => {
        if (cancelled) return;
        const quiz = buildKidsQuiz(chapters, seed);
        setQuizState(quiz ? { state: "ready", quiz } : { state: "error" });
      })
      .catch(() => {
        if (!cancelled) setQuizState({ state: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [seed]);

  const quiz = quizState.state === "ready" ? quizState.quiz : null;
  const question = quiz?.questions[questionIndex] ?? null;
  const finished = quiz ? kidsQuizComplete(answeredCount, quiz.questions.length) : false;

  // Completion is reported once, only when every question was answered.
  const reportCompletion = useCallback(() => {
    if (!quiz || !kidsQuizComplete(answeredCount, quiz.questions.length)) return;
    if (completionReportedRef.current) return;
    completionReportedRef.current = true;
    onSessionCompleteRef.current?.();
  }, [quiz, answeredCount]);

  useEffect(() => {
    if (finished) reportCompletion();
  }, [finished, reportCompletion]);

  const closeDialog = useCallback(() => {
    onCloseRef.current();
  }, []);

  const pickOption = (index: number) => {
    if (!question || picked !== null) return;
    setPicked(index);
    setAnsweredCount((count) => count + 1);
    if (index === question.correctIndex) setCorrectCount((count) => count + 1);
  };

  const nextQuestion = () => {
    setPicked(null);
    setQuestionIndex((index) => index + 1);
  };

  const restart = () => {
    completionReportedRef.current = false;
    setQuestionIndex(0);
    setPicked(null);
    setCorrectCount(0);
    setAnsweredCount(0);
    setSeed(Math.floor(Math.random() * 0x7fffffff));
  };

  const statusText = useMemo(() => {
    if (!quiz) return "";
    if (finished) {
      return `أكملت الجولة: ${correctCount} من ${quiz.questions.length} إجابات صحيحة — تقدّم محلي على هذا الجهاز فقط، وليس مقياسًا للدين.`;
    }
    return `السؤال ${questionIndex + 1} من ${quiz.questions.length}`;
  }, [quiz, finished, correctCount, questionIndex]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = getFocusableElements(dialog)[0];
      (firstFocusable ?? dialog).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      const focusIsOutside = !(activeElement instanceof Node) || !dialog.contains(activeElement);
      if (event.shiftKey && (activeElement === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || focusIsOutside)) {
        event.preventDefault();
        first.focus();
      }
    };

    const keepFocusInside = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || dialog.contains(target)) return;
      const firstFocusable = getFocusableElements(dialog)[0];
      (firstFocusable ?? dialog).focus();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", keepFocusInside, true);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", keepFocusInside, true);
      if (opener?.isConnected) opener.focus();
    };
  }, [closeDialog]);

  return (
    <div className={styles.studio}>
      <div
        ref={dialogRef}
        className={`${styles.board} ${styles.quizBoard}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kids-quiz-title"
        aria-describedby="kids-quiz-status"
        tabIndex={-1}
      >
        <div className={styles.studioHead}>
          <h2 id="kids-quiz-title" className="gold-text">
            <Puzzle size={18} aria-hidden="true" /> حديقة الألغاز
          </h2>
          <button type="button" className="btn-outline" onClick={closeDialog} aria-label="إغلاق حديقة الألغاز">
            <X size={16} /> إغلاق
          </button>
        </div>

        <p id="kids-quiz-status" className={styles.quizStatus} role="status" aria-live="polite">
          {quizState.state === "loading" ? "نجهّز الأسئلة من بيانات المصحف…" : statusText}
        </p>

        {quizState.state === "error" ? (
          <div role="alert" className={styles.quizError}>
            تعذر تجهيز الأسئلة من بيانات المصحف. يمكنك المحاولة مجددًا.
            <button type="button" className="btn-outline" onClick={restart}>
              <RefreshCw size={14} /> إعادة المحاولة
            </button>
          </div>
        ) : null}

        {quiz && !finished && question ? (
          <div className={styles.quizRound} data-visual="kids-quiz-round">
            <p className={styles.quizPrompt}>{question.promptAr}</p>
            <div className={styles.quizOptions} role="group" aria-label="خيارات الإجابة">
              {question.options.map((option, index) => {
                const isPicked = picked === index;
                const isCorrect = index === question.correctIndex;
                const revealed = picked !== null;
                const optionClass = revealed
                  ? isCorrect
                    ? styles.quizOptionCorrect
                    : isPicked
                      ? styles.quizOptionWrong
                      : styles.quizOption
                  : styles.quizOption;
                return (
                  <button
                    key={option}
                    type="button"
                    className={optionClass}
                    onClick={() => pickOption(index)}
                    disabled={revealed}
                    aria-pressed={isPicked}
                  >
                    {revealed && isCorrect ? <Check size={15} aria-hidden="true" /> : null}
                    {option}
                  </button>
                );
              })}
            </div>
            {picked !== null ? (
              <div className={styles.quizFeedback} role="status">
                <p>
                  {picked === question.correctIndex
                    ? "إجابة صحيحة، أحسنت!"
                    : `ليست هذه الإجابة. الصحيح: ${question.options[question.correctIndex]}`}
                </p>
                <p className={styles.quizReference}>{question.referenceAr}</p>
                <button type="button" className="btn-gold" onClick={nextQuestion} data-visual="kids-quiz-next">
                  {questionIndex + 1 < quiz.questions.length ? "السؤال التالي" : "عرض النتيجة"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {quiz && finished ? (
          <div className={styles.quizDone} data-visual="kids-quiz-done">
            <p className={styles.quizPrompt}>
              نتيجتك: {correctCount} / {quiz.questions.length}
            </p>
            <p className={styles.quizReference}>
              كل الأسئلة مبنية على أسماء السور وأعداد آياتها في بيانات المصحف المعتمدة داخل المنصة.
              لا تقييم ديني ولا مقارنة بالآخرين — مجرد تمرين محلي.
            </p>
            <button type="button" className="btn-gold" onClick={restart} data-visual="kids-quiz-restart">
              <RefreshCw size={15} /> جولة جديدة
            </button>
          </div>
        ) : null}

        <p className={styles.quizFootnote}>
          نشاط تعليمي اختياري · الأسئلة من بيانات المصحف الحقيقية · لا تجسيد للنبي ﷺ ولا للأنبياء
        </p>
      </div>
    </div>
  );
}
