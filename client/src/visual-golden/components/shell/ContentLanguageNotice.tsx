import { Languages } from "lucide-react";
import { contentLanguageNotice } from "@/visual-golden/services/content-language";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import styles from "./shell.module.css";

/**
 * States, in both languages, when the interface language cannot present the
 * recorded content. Rendered by the shell so no route can quietly present
 * Arabic content inside an English interface without saying so.
 */
export function ContentLanguageNotice({ pathname }: { pathname: string }) {
  const lang = useInstitution((state) => state.lang);
  const notice = contentLanguageNotice(pathname, lang);
  if (!notice) return null;

  return (
    <p className={styles.contentLanguage} data-visual="content-language-notice" lang="en" dir="ltr">
      <Languages size={14} aria-hidden />
      <span>{notice.textEn}</span>
      <span className={styles.contentLanguageAr} lang="ar" dir="rtl">
        {notice.textAr}
      </span>
    </p>
  );
}
