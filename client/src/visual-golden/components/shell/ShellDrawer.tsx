import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { t } from "@/visual-golden/lib/i18n";
import styles from "./shell.module.css";

export function ShellDrawer() {
  const panel = useInstitution((s) => s.panel);
  const setPanel = useInstitution((s) => s.setPanel);
  const lang = useInstitution((s) => s.lang);
  const favorites = useInstitution((s) => s.favorites);
  const notes = useInstitution((s) => s.notes);
  const journey = useInstitution((s) => s.journey);
  const addNote = useInstitution((s) => s.addNote);
  const removeNote = useInstitution((s) => s.removeNote);
  const notifyLeadMin = useInstitution((s) => s.notifyLeadMin);
  const notifyPrayers = useInstitution((s) => s.notifyPrayers);
  const notifySound = useInstitution((s) => s.notifySound);
  const setNotify = useInstitution((s) => s.setNotify);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!panel) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, setPanel]);

  useEffect(() => {
    if (typeof Notification === "undefined") setPerm("unsupported");
    else setPerm(Notification.permission);
  }, [panel]);

  if (!panel) return null;

  const title =
    panel === "favorites" ? t(lang, "favorites") : panel === "notes" ? t(lang, "notes") : panel === "journey" ? t(lang, "journey") : t(lang, "notify");

  return (
    <div className={styles.drawerScrim} onClick={() => setPanel(null)} role="presentation">
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.drawerHead}>
          <h2>{title}</h2>
          <button ref={closeBtn} type="button" onClick={() => setPanel(null)} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        {panel === "favorites" ? (
          <ul className={styles.drawerList}>
            {favorites.length === 0 ? <li className="muted">{lang === "ar" ? "لا عناصر محفوظة بعد." : "Nothing saved yet."}</li> : null}
            {favorites.map((f) => (
              <li key={f.id}>
                {f.path.startsWith("loc:") ? (
                  <span>{f.title}</span>
                ) : (
                  <Link href={f.path} onClick={() => setPanel(null)}>
                    {f.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : null}

        {panel === "notes" ? (
          <div className={styles.noteForm}>
            <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder={lang === "ar" ? "عنوان" : "Title"} />
            <textarea value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder={lang === "ar" ? "ملاحظة محلية على هذا الجهاز" : "Local note on this device"} rows={4} />
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
              {notes.map((n) => (
                <li key={n.id}>
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                  <button type="button" onClick={() => removeNote(n.id)}>
                    {lang === "ar" ? "حذف" : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {panel === "journey" ? (
          <ul className={styles.drawerList}>
            <li className="muted">
              {lang === "ar"
                ? "سجل تعلّم محايد: زيارات، محفوظات، ملاحظات. ليس تقييمًا للعبادة."
                : "A neutral learning log: visits, bookmarks, notes. Not a piety score."}
            </li>
            {journey.map((j) => (
              <li key={j.id}>
                <small>{j.kind}</small> {j.label}
              </li>
            ))}
          </ul>
        ) : null}

        {panel === "notifications" ? (
          <div className={styles.noteForm}>
            <p className="muted">
              {lang === "ar"
                ? "التذكير يعمل أثناء فتح هذه الصفحة في المتصفح، وليس كجدولة خلفية لنظام التشغيل."
                : "Reminders fire only while this page is open in the browser — not as OS background scheduling."}
            </p>
            <label>
              {lang === "ar" ? "قبل الصلاة بـ" : "Lead time"}
              <select
                value={notifyLeadMin}
                onChange={(e) => setNotify({ notifyLeadMin: Number(e.target.value) as 5 | 10 | 15 | 30 })}
              >
                {[5, 10, 15, 30].map((n) => (
                  <option key={n} value={n}>
                    {n} min
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input type="checkbox" checked={notifySound} onChange={(e) => setNotify({ notifySound: e.target.checked })} />
              {lang === "ar" ? "صوت (واجهة فقط)" : "Sound (UI preference)"}
            </label>
            {perm === "unsupported" ? (
              <p className="muted">{lang === "ar" ? "واجهة الإشعارات غير مدعومة هنا." : "Notification API is unsupported here."}</p>
            ) : perm !== "granted" ? (
              <button
                type="button"
                className={styles.goldBtn}
                onClick={async () => {
                  const r = await Notification.requestPermission();
                  setPerm(r);
                }}
              >
                {lang === "ar" ? "السماح بالإشعارات" : "Allow notifications"}
              </button>
            ) : (
              <p>{lang === "ar" ? "الإذن ممنوح." : "Permission granted."}</p>
            )}
            <p className="muted">{notifyPrayers.join(" · ")}</p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
