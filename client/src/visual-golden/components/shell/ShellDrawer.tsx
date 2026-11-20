import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { BellRing, X } from "lucide-react";
import { useInstitution, type ShellPanel } from "@/visual-golden/lib/institution/store";
import { t } from "@/visual-golden/lib/i18n";
import { InstitutionStatusCenter } from "./InstitutionStatusCenter";
import styles from "./shell.module.css";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ShellDrawer() {
  const panel = useInstitution((state) => state.panel);
  const setPanel = useInstitution((state) => state.setPanel);
  const lang = useInstitution((state) => state.lang);
  const favorites = useInstitution((state) => state.favorites);
  const notes = useInstitution((state) => state.notes);
  const journey = useInstitution((state) => state.journey);
  const addNote = useInstitution((state) => state.addNote);
  const removeNote = useInstitution((state) => state.removeNote);
  const notifyLeadMin = useInstitution((state) => state.notifyLeadMin);
  const notifyPrayers = useInstitution((state) => state.notifyPrayers);
  const notifySound = useInstitution((state) => state.notifySound);
  const setNotify = useInstitution((state) => state.setNotify);
  const ambientEnabled = useInstitution((state) => state.ambientEnabled);
  const setAmbientEnabled = useInstitution((state) => state.setAmbientEnabled);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!panel) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setPanel(null);
        return;
      }
      if (event.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = [...drawer.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previousFocusRef.current?.focus?.();
    };
  }, [panel, setPanel]);

  useEffect(() => {
    if (typeof Notification === "undefined") setPerm("unsupported");
    else setPerm(Notification.permission);
  }, [panel]);

  if (!panel) return null;

  const title = drawerTitle(panel, lang);

  return (
    <div className={styles.drawerScrim} onClick={() => setPanel(null)} role="presentation">
      <aside
        ref={drawerRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.drawerHead}>
          <h2>{title}</h2>
          <button ref={closeButtonRef} type="button" onClick={() => setPanel(null)} aria-label={lang === "ar" ? "إغلاق" : "Close"}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {panel === "favorites" ? (
          <ul className={styles.drawerList}>
            {favorites.length === 0 ? <li className="muted">{lang === "ar" ? "لا عناصر محفوظة بعد." : "Nothing saved yet."}</li> : null}
            {favorites.map((favorite) => (
              <li key={favorite.id}>
                {favorite.path.startsWith("loc:") ? (
                  <span>{favorite.title}</span>
                ) : (
                  <Link href={favorite.path} onClick={() => setPanel(null)}>
                    {favorite.title}
                  </Link>
                )}
              </li>
            ))}
            <li className={styles.drawerScope}>{lang === "ar" ? "المحفوظات محلية على هذا الجهاز." : "Saved items are local to this device."}</li>
          </ul>
        ) : null}

        {panel === "notes" ? (
          <div className={styles.noteForm}>
            <input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder={lang === "ar" ? "عنوان" : "Title"} aria-label={lang === "ar" ? "عنوان الملاحظة" : "Note title"} />
            <textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} placeholder={lang === "ar" ? "ملاحظة محلية على هذا الجهاز" : "Local note on this device"} aria-label={lang === "ar" ? "نص الملاحظة" : "Note body"} rows={4} />
            <button
              type="button"
              className={styles.goldBtn}
              onClick={() => {
                if (!noteTitle.trim()) return;
                addNote(noteTitle.trim(), noteBody.trim());
                setNoteTitle("");
                setNoteBody("");
              }}
            >
              {lang === "ar" ? "حفظ الملاحظة" : "Save note"}
            </button>
            <ul className={styles.drawerList}>
              {notes.map((note) => (
                <li key={note.id}>
                  <strong>{note.title}</strong>
                  <p>{note.body}</p>
                  <button type="button" onClick={() => removeNote(note.id)}>
                    {lang === "ar" ? "حذف" : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
            <p className={styles.drawerScope}>{lang === "ar" ? "تُحفظ الملاحظات محليًا فقط ولا تتزامن مع حساب." : "Notes are stored locally and are not synced to an account."}</p>
          </div>
        ) : null}

        {panel === "journey" ? (
          <ul className={styles.drawerList}>
            <li className="muted">
              {lang === "ar"
                ? "سجل تعلّم محايد: زيارات، محفوظات، ملاحظات. ليس تقييمًا للعبادة."
                : "A neutral learning log: visits, bookmarks, notes. Not a piety score."}
            </li>
            {journey.map((event) => (
              <li key={event.id}>
                <small>{journeyKind(event.kind, lang)}</small> {event.label}
                {event.path ? <Link href={event.path} onClick={() => setPanel(null)}>{lang === "ar" ? "فتح" : "Open"}</Link> : null}
              </li>
            ))}
            <li className={styles.drawerScope}>{lang === "ar" ? "سجل محلي على هذا الجهاز." : "Local log on this device."}</li>
          </ul>
        ) : null}

        {panel === "status" ? (
          <>
            <InstitutionStatusCenter />
            <button type="button" className={styles.secondaryBtn} onClick={() => setPanel("notifications")}>
              <BellRing size={16} aria-hidden="true" />
              {lang === "ar" ? "إعدادات تذكير الصلاة داخل الصفحة" : "In-page prayer reminder settings"}
            </button>
          </>
        ) : null}

        {panel === "notifications" ? (
          <div className={styles.noteForm}>
            <p className="muted">
              {lang === "ar"
                ? "التذكير يعمل أثناء فتح صفحة المرصد في المتصفح، وليس كجدولة خلفية لنظام التشغيل."
                : "The reminder works while the observatory page is open in the browser — not as OS background scheduling."}
            </p>
            <label>
              {lang === "ar" ? "قبل الصلاة بـ" : "Lead time"}
              <select value={notifyLeadMin} onChange={(event) => setNotify({ notifyLeadMin: Number(event.target.value) as 5 | 10 | 15 | 30 })}>
                {[5, 10, 15, 30].map((minutes) => (
                  <option key={minutes} value={minutes}>{lang === "ar" ? `${minutes} دقائق` : `${minutes} min`}</option>
                ))}
              </select>
            </label>
            <label>
              <input type="checkbox" checked={notifySound} onChange={(event) => setNotify({ notifySound: event.target.checked })} />
              {lang === "ar" ? "صوت (واجهة فقط)" : "Sound (UI preference)"}
            </label>
            <label>
              <input type="checkbox" checked={ambientEnabled} onChange={(event) => setAmbientEnabled(event.target.checked)} />
              {lang === "ar" ? "بنية صوتية محيطة (مركّبة محليًا، إيقاف افتراضي)" : "Ambient soundscape (locally synthesized, off by default)"}
            </label>
            <p className={styles.drawerScope}>
              {lang === "ar"
                ? "تُبنى البنية الصوتية محليًا ولا تنقل تسجيلات ولا مستودعات؛ وتخفي وترتفع تلقائيًا عند التلاوة أو القراءة الصوتية."
                : "The soundscape is synthesized locally; it carries no recordings or repositories and yields automatically to recitation or speech."}
            </p>
            {perm === "unsupported" ? (
              <p className="muted">{lang === "ar" ? "واجهة الإشعارات غير مدعومة هنا." : "Notification API is unsupported here."}</p>
            ) : perm !== "granted" ? (
              <button
                type="button"
                className={styles.goldBtn}
                onClick={async () => {
                  const result = await Notification.requestPermission();
                  setPerm(result);
                }}
              >
                {lang === "ar" ? "السماح بالإشعارات" : "Allow notifications"}
              </button>
            ) : (
              <p>{lang === "ar" ? "الإذن ممنوح." : "Permission granted."}</p>
            )}
            <p className={styles.drawerScope}>{lang === "ar" ? "الصلوات المختارة" : "Selected prayers"}: {notifyPrayers.map((prayer) => prayerLabel(prayer, lang)).join(" · ")}</p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function drawerTitle(panel: Exclude<ShellPanel, null>, lang: "ar" | "en" | "fr" | "ur"): string {
  if (panel === "favorites") return t(lang, "favorites");
  if (panel === "notes") return t(lang, "notes");
  if (panel === "journey") return t(lang, "journey");
  if (panel === "status") return lang === "ar" ? "حالة البيانات" : "Data status";
  return lang === "ar" ? "تذكير الصلاة" : "Prayer reminders";
}

function journeyKind(kind: "visit" | "bookmark" | "note", lang: "ar" | "en" | "fr" | "ur"): string {
  if (lang === "en") return kind;
  if (kind === "visit") return "زيارة";
  if (kind === "bookmark") return "محفوظ";
  return "ملاحظة";
}

function prayerLabel(prayer: string, lang: "ar" | "en" | "fr" | "ur"): string {
  if (lang === "en") return prayer;
  const labels: Record<string, string> = { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
  return labels[prayer] ?? prayer;
}
