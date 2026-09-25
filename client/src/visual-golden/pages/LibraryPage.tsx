import { useState } from "react";
import { BookOpen, LibraryBig, Search } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { CatalogShelfHall } from "@/visual-golden/components/library/CatalogShelfHall";
import { LibraryCatalog } from "@/visual-golden/components/library/LibraryCatalog";
import { CatalogReadingChamber } from "@/visual-golden/components/library/CatalogReadingChamber";
import type { CatalogWork } from "@/visual-golden/services/catalog-library";
import styles from "./LibraryPage.module.css";

export function LibraryPage({ initialWorkId }: { initialWorkId?: string }) {
  const lang = useInstitution((state) => state.lang);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"shelves" | "catalog">(initialWorkId ? "catalog" : "shelves");
  const [shelfDomain, setShelfDomain] = useState<string | undefined>();
  const [catalogCategory, setCatalogCategory] = useState<string | undefined>();
  const [openWork, setOpenWork] = useState<CatalogWork | null>(null);

  const gateways = lang === "ar" ? [
    ["A-القرآن وعلومه", "القرآن وعلومه", "المصحف والتفسير وعلوم الوحي"],
    ["B-التفسير", "التفسير", "كتب التفسير ومدارس المفسرين"],
    ["C-الحديث النبوي", "الحديث وعلومه", "المجاميع والأبواب والرواية"],
    ["D-السيرة النبوية", "السيرة النبوية", "العصور والأحداث والرحلات"],
    ["J-الفقه", "الفقه", "العبادات والمعاملات والمذاهب"],
    ["K-أصول الفقه والقواعد", "أصول الفقه", "الأصول والقواعد والمناهج"],
    ["I-العقيدة", "العقيدة", "أصول الاعتقاد وشروحها"],
    ["P-اللغة العربية", "اللغة والأدب", "اللغة والشعر والبلاغة"],
  ] : [
    ["A-القرآن وعلومه", "Qur'an and its sciences", "Mushaf, exegesis, and revelation studies"],
    ["B-التفسير", "Exegesis", "Tafsir works and exegetical traditions"],
    ["C-الحديث النبوي", "Hadith and its sciences", "Collections, chapters, and transmission"],
    ["D-السيرة النبوية", "Prophetic biography", "Eras, events, and journeys"],
    ["J-الفقه", "Jurisprudence", "Worship, transactions, and schools"],
    ["K-أصول الفقه والقواعد", "Legal theory", "Usul, maxims, and methods"],
    ["I-العقيدة", "Creed", "Foundations and commentaries"],
    ["P-اللغة العربية", "Arabic language and literature", "Language, poetry, and rhetoric"],
  ];

  const labels = lang === "ar" ? {
    title: "المكتبة الكبرى",
    subtitle: "٩٬١٢٩ عملاً على الرفوف الرقمية · ١٠٬٦٩٥ سجل طبعة · ١٣٬٦٧٩ نسخة رقمية",
    description: "كل عمل في الفهرس أصبح قابلاً للوصول من قاعات المكتبة ورفوفها. المصدر للتوثيق، أمّا القراءة والاستماع والتنزيل المسموح فتبدأ من داخل المؤسسة.",
    search: "ابحث في كل الكتب والرفوف باسم الكتاب أو المؤلف أو القسم…",
    searchLabel: "بحث داخل المكتبة الكاملة",
    shelves: "المكتبة والرفوف",
    shelvesHint: "كل الأعمال المصنفة موزعة على أبواب وقاعات ورفوف",
    catalog: "الفهرس العلمي",
    catalogHint: "العرض الجدولي المتخصص للباحثين",
    modesLabel: "طرق استكشاف المكتبة",
  } : {
    title: "The Grand Library",
    subtitle: "9,129 works on digital shelves · 10,695 edition records · 13,679 digital versions",
    description: "Every catalogued work is reachable through Library halls and shelves. Sources remain provenance; permitted reading, listening, and downloads begin inside the institution.",
    search: "Search every book and shelf by title, author, or subject…",
    searchLabel: "Search the complete Library",
    shelves: "Library & Shelves",
    shelvesHint: "All classified works arranged as domains, halls, and shelves",
    catalog: "Scholarly Catalog",
    catalogHint: "Specialist tabular view for researchers",
    modesLabel: "Ways to explore the Library",
  };

  const enterDomain = (key: string) => {
    setShelfDomain(key);
    setCatalogCategory(key);
    setView("shelves");
  };

  return (
    <div className={styles.page}>
      <PageHero
        title={labels.title}
        subtitle={labels.subtitle}
        desc={labels.description}
        image={art.library}
        wing="library"
      >
        <div className={styles.search}>
          <Search size={16} />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={labels.search}
            aria-label={labels.searchLabel}
          />
          {q.trim().length > 1 ? (
            <span className={styles.searchHint}>
              {lang === "ar" ? "يُبحث داخل كل الرفوف" : "Searching every shelf"}
            </span>
          ) : null}
        </div>
      </PageHero>

      <section className={styles.gateways} aria-labelledby="library-gateways-title">
        <div className={styles.gatewayHeading}>
          <span>{lang === "ar" ? "بوابات المكتبة" : "Library gateways"}</span>
          <h2 id="library-gateways-title">
            {lang === "ar" ? "ادخل إلى العلم، لا إلى رابط خارجي" : "Enter the domain, not an external link"}
          </h2>
          <p>
            {lang === "ar"
              ? "كل بوابة تفتح قاعتها ورفوف كتبها مباشرة. الفهرس باقٍ كأداة بحث متخصصة، وليس مخزنًا نخفي فيه بقية الكتب."
              : "Each gateway opens its own halls and book shelves. The catalog remains a specialist research tool, not a warehouse hiding the rest of the books."}
          </p>
        </div>
        <div className={styles.gatewayGrid}>
          {gateways.map(([key, title, description]) => (
            <button
              key={key}
              type="button"
              className={styles.gateway}
              onClick={() => enterDomain(key)}
            >
              <strong>{title}</strong>
              <span>{description}</span>
              <small>{lang === "ar" ? "دخول القاعة والرفوف" : "Enter halls and shelves"}</small>
            </button>
          ))}
        </div>
      </section>

      {!initialWorkId ? (
        <nav className={styles.modeSwitch} aria-label={labels.modesLabel}>
          <button
            type="button"
            className={view === "shelves" ? styles.modeOn : ""}
            onClick={() => setView("shelves")}
          >
            <LibraryBig size={19} aria-hidden="true" />
            <span><strong>{labels.shelves}</strong><small>{labels.shelvesHint}</small></span>
          </button>
          <button
            type="button"
            className={view === "catalog" ? styles.modeOn : ""}
            onClick={() => setView("catalog")}
          >
            <BookOpen size={19} aria-hidden="true" />
            <span><strong>{labels.catalog}</strong><small>{labels.catalogHint}</small></span>
          </button>
        </nav>
      ) : null}

      {view === "shelves" && !initialWorkId ? (
        <CatalogShelfHall
          query={q}
          initialCategory={shelfDomain}
          onOpen={setOpenWork}
        />
      ) : (
        <LibraryCatalog
          initialWorkId={initialWorkId}
          initialCategory={catalogCategory}
          canOpenReader={() => true}
          onOpenReader={(work) => setOpenWork(work as CatalogWork)}
        />
      )}

      {openWork ? (
        <CatalogReadingChamber
          work={openWork}
          onClose={() => setOpenWork(null)}
        />
      ) : null}
    </div>
  );
}
