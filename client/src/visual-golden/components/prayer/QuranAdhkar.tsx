/**
 * QuranAdhkar — remembrance texts drawn from the verified local Quran corpus.
 *
 * Every item is a canonical verse reference; its Arabic text is read at
 * runtime from the governed Tanzil Uthmani-min corpus (quranService), never
 * typed or paraphrased here. Each card opens the exact verse in the mushaf.
 *
 * Honesty contract:
 * - Text comes only from the verified corpus; a failed read shows an honest
 *   unavailable state instead of invented text.
 * - These are Quranic remembrance verses, NOT the narrated morning/evening
 *   adhkar collection: the hadith corpus is still development samples under
 *   editorial review, so no prophetic dhikr matn is claimed until cleared.
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { getQuranVerse } from "@/services/quranService";
import styles from "./QuranDuas.module.css";

interface AdhkarReference {
  id: string;
  titleAr: string;
  surah: number;
  ayah: number;
  surahNameAr: string;
}

/** Canonical Quranic remembrance verses — references only, text is fetched. */
const QURAN_ADHKAR: AdhkarReference[] = [
  { id: "ayat-al-kursi", titleAr: "آية الكرسي", surah: 2, ayah: 255, surahNameAr: "البقرة" },
  { id: "heart-rest", titleAr: "ذكر الله وطمأنينة القلوب", surah: 13, ayah: 28, surahNameAr: "الرعد" },
  { id: "much-remembrance", titleAr: "الإكثار من ذكر الله", surah: 33, ayah: 41, surahNameAr: "الأحزاب" },
  { id: "remember-me", titleAr: "اذكروني أذكركم", surah: 2, ayah: 152, surahNameAr: "البقرة" },
  { id: "amanar-rasul", titleAr: "خواتيم سورة البقرة — آمن الرسول", surah: 2, ayah: 285, surahNameAr: "البقرة" },
  { id: "hasbunallah", titleAr: "حسبنا الله ونعم الوكيل", surah: 3, ayah: 173, surahNameAr: "آل عمران" },
];

interface AdhkarState {
  reference: AdhkarReference;
  text: string | null;
  failed: boolean;
}

export function QuranAdhkar() {
  const [items, setItems] = useState<AdhkarState[]>(() =>
    QURAN_ADHKAR.map((reference) => ({ reference, text: null, failed: false })),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const resolved = await Promise.all(
        QURAN_ADHKAR.map(async (reference) => {
          try {
            const verse = await getQuranVerse(reference.surah, reference.ayah);
            const text = verse?.arabic?.trim() ?? "";
            return { reference, text: text.length > 0 ? text : null, failed: text.length === 0 };
          } catch {
            return { reference, text: null, failed: true };
          }
        }),
      );
      if (!cancelled) setItems(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.grid} data-visual="quran-adhkar" aria-label="أذكار من القرآن الكريم">
      {items.map(({ reference, text, failed }) => (
        <article key={reference.id} className={styles.card} data-adhkar={reference.id}>
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
        النصوص أعلاه آيات ذكر مقروءة مباشرة من المصحف العربي المحلي الموثق (تنزيل · عثماني minimal 1.1).
        مجموعة أذكار الصباح والمساء المأثورة ستُضاف عند اكتمال مراجعة مدونة الحديث — لا نعرض متنًا نبويًا غير موثق.
      </p>
    </div>
  );
}

QuranAdhkar.displayName = "QuranAdhkar";
