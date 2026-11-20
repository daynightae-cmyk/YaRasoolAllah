/**
 * QuranDuas — real supplications from the verified local Quran corpus.
 *
 * Each dua is a canonical verse reference; its Arabic text is read at runtime
 * from the governed Tanzil Uthmani-min corpus (quranService), never typed or
 * paraphrased here. Cards link into the mushaf reader at the exact verse.
 *
 * Honesty contract:
 * - Text comes only from the verified corpus; a failed read shows an honest
 *   unavailable state instead of invented text.
 * - Sunnah supplications are NOT included here: the hadith corpus is still
 *   development samples under editorial review, so no prophetic dua text is
 *   claimed until that corpus is cleared.
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { getQuranVerse } from "@/services/quranService";
import styles from "./QuranDuas.module.css";

interface DuaReference {
  id: string;
  titleAr: string;
  surah: number;
  ayah: number;
  surahNameAr: string;
}

/** Canonical Quranic supplications — references only, text is fetched. */
const QURAN_DUAS: DuaReference[] = [
  { id: "dunya-akhirah", titleAr: "خير الدنيا والآخرة", surah: 2, ayah: 201, surahNameAr: "البقرة" },
  { id: "steadfast-heart", titleAr: "ثبات القلب على الهدى", surah: 3, ayah: 8, surahNameAr: "آل عمران" },
  { id: "ease-task", titleAr: "شرح الصدر وتيسير الأمر", surah: 20, ayah: 25, surahNameAr: "طه" },
  { id: "family-comfort", titleAr: "قرة العين في الذرية", surah: 25, ayah: 74, surahNameAr: "الفرقان" },
  { id: "parents-forgiveness", titleAr: "المغفرة للوالدين والمؤمنين", surah: 14, ayah: 41, surahNameAr: "إبراهيم" },
  { id: "trust-reliance", titleAr: "التوكل والإنابة", surah: 60, ayah: 4, surahNameAr: "الممتحنة" },
];

interface DuaState {
  reference: DuaReference;
  text: string | null;
  failed: boolean;
}

export function QuranDuas() {
  const [duas, setDuas] = useState<DuaState[]>(() =>
    QURAN_DUAS.map((reference) => ({ reference, text: null, failed: false })),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const resolved = await Promise.all(
        QURAN_DUAS.map(async (reference) => {
          try {
            const verse = await getQuranVerse(reference.surah, reference.ayah);
            const text = verse?.arabic?.trim() ?? "";
            return { reference, text: text.length > 0 ? text : null, failed: text.length === 0 };
          } catch {
            return { reference, text: null, failed: true };
          }
        }),
      );
      if (!cancelled) setDuas(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.grid} data-visual="quran-duas" aria-label="أدعية من القرآن الكريم">
      {duas.map(({ reference, text, failed }) => (
        <article key={reference.id} className={styles.card} data-dua={reference.id}>
          <header className={styles.head}>
            <h4>{reference.titleAr}</h4>
            <span className={styles.ref}>
              {reference.surahNameAr} · الآية {reference.ayah}
            </span>
          </header>
          {text ? (
            <p className={styles.text} lang="ar" dir="rtl">
              {text}
            </p>
          ) : failed ? (
            <p className={styles.unavailable} role="status">
              تعذر قراءة نص الآية من المصحف المحلي — لا يُعرض نص بديل غير موثق.
            </p>
          ) : (
            <p className={styles.loading} role="status">
              جارٍ قراءة الآية من المصحف المحلي…
            </p>
          )}
          <Link
            className={styles.open}
            href={`/quran?surah=${reference.surah}&ayah=${reference.ayah}`}
          >
            <BookOpen size={13} aria-hidden />
            افتح الآية في المصحف
          </Link>
        </article>
      ))}
      <p className={styles.scope}>
        النصوص أعلاه مقروءة مباشرة من المصحف العربي المحلي الموثق (تنزيل · عثماني minimal 1.1).
        أدعية السنة النبوية ستُضاف عند اكتمال مراجعة مدونة الحديث — لا نعرض متنًا غير موثق.
      </p>
    </div>
  );
}

QuranDuas.displayName = "QuranDuas";
