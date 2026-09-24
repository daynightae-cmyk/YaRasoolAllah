import { useEffect, useState } from "react";
import { Accessibility, Pause, Play, Square, Volume2 } from "lucide-react";
import styles from "./ReadingChamber.module.css";

interface Props {
  text: string;
}

type SpeechState = "idle" | "playing" | "paused" | "error";

export function DeviceTtsFallback({ text }: Props) {
  const [state, setState] = useState<SpeechState>("idle");
  const [rate, setRate] = useState(0.9);
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  useEffect(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setState("idle");
    return () => window.speechSynthesis.cancel();
  }, [supported, text]);

  const start = () => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    const arabicVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith("ar"));
    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.rate = rate;
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("error");
    window.speechSynthesis.speak(utterance);
    setState("playing");
  };

  return (
    <details className={styles.ttsFallback} data-device-tts-fallback>
      <summary><Accessibility size={15} /> قراءة آلية من الجهاز (Accessibility)</summary>
      <p>
        أداة مساعدة لقراءة النص المفتوح بصوت الجهاز. <strong>ليست Audiobook</strong> ولا تسجيلاً
        بشريًا للكتاب، ولا يظهر بسببها زر Audiobook.
      </p>
      {!supported ? (
        <div className={styles.speechWarning}>هذا المتصفح لا يوفر Speech Synthesis.</div>
      ) : (
        <div className={styles.audioControls}>
          {state === "playing" ? (
            <button
              type="button"
              className="btn-gold"
              onClick={() => {
                window.speechSynthesis.pause();
                setState("paused");
              }}
            >
              <Pause size={15} /> إيقاف مؤقت
            </button>
          ) : state === "paused" ? (
            <button
              type="button"
              className="btn-gold"
              onClick={() => {
                window.speechSynthesis.resume();
                setState("playing");
              }}
            >
              <Play size={15} /> متابعة
            </button>
          ) : (
            <button type="button" className="btn-gold" data-tts-play onClick={start} disabled={!text.trim()}>
              <Play size={15} /> قراءة المقطع آليًا
            </button>
          )}
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              window.speechSynthesis.cancel();
              setState("idle");
            }}
            disabled={state === "idle"}
          >
            <Square size={14} /> إيقاف
          </button>
          <label>
            <Volume2 size={14} /> السرعة
            <select value={rate} onChange={(event) => setRate(Number(event.target.value))}>
              {[0.75, 0.9, 1, 1.1, 1.25].map((value) => (
                <option key={value} value={value}>{value}×</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {state === "error" ? (
        <div className={styles.speechWarning} role="alert">تعذر تشغيل القراءة الآلية على هذا الجهاز.</div>
      ) : null}
    </details>
  );
}
