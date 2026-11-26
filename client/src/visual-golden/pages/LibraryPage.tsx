import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { LibraryBig, LoaderCircle } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { LibraryHub } from "@/visual-golden/components/library/LibraryHub";
import { CatalogShelfHall } from "@/visual-golden/components/library/CatalogShelfHall";
import { LibraryCatalog } from "@/visual-golden/components/library/LibraryCatalog";
import { CatalogReadingChamber } from "@/visual-golden/components/library/CatalogReadingChamber";
import { LibraryLivingShelf } from "@/visual-golden/components/library/LibraryLivingShelf";
import { ManuscriptGallery } from "@/visual-golden/components/library/ManuscriptGallery";
import { ManuscriptReader } from "@/visual-golden/components/library/ManuscriptReader";
import { MANUSCRIPT_SOURCES, type ManuscriptSource } from "@/visual-golden/services/iiif";
import {
  LibraryDomainShelves,
  type DomainGateway,
} from "@/visual-golden/components/library/LibraryDomainShelves";
import { SectionEntry3D } from "@/visual-golden/components/entry/SectionEntry3D";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import {
  isLowCapacityDevice,
  readDeviceCapacitySignals,
} from "@/visual-golden/lib/institution/device-capacity";
import {
  canReadTextInside,
  catalogCapabilityReport,
  loadFullLibraryCatalog,
  type CatalogPayload,
  type CatalogWork,
} from "@/visual-golden/services/catalog-library";
import { MEDIA_DISCOVERY_STATUS } from "@/visual-golden/data/media-discovery-status.generated";
import styles from "./LibraryPage.module.css";

// Keep the engine out of the Library route chunk. The deep-reader route and
// the DOM shelves never request Three.js; only the explicit 3D view does.
const Library3D = lazy(() =>
  import("@/visual-golden/components/library/Library3D").then((module) => ({
    default: module.Library3D,
  })),
);

type LibraryView = "library3d" | "shelves" | "catalog";

const DOMAIN_GATEWAYS: DomainGateway[] = [
  {
    category: "A-القرآن وعلومه",
    titleAr: "القرآن وعلومه",
    titleEn: "Qur'an and its sciences",
    hintAr: "المصحف والتفسير وعلوم الوحي",
    hintEn: "Mushaf, exegesis, and revelation studies",
    mark: "١",
  },
  {
    category: "B-التفسير",
    titleAr: "التفسير",
    titleEn: "Exegesis",
    hintAr: "كتب التفسير ومدارس المفسرين",
    hintEn: "Tafsir works and exegetical traditions",
    mark: "٢",
  },
  {
    category: "C-الحديث النبوي",
    titleAr: "الحديث وعلومه",
    titleEn: "Hadith and its sciences",
    hintAr: "المجاميع والأبواب والرواية",
    hintEn: "Collections, chapters, and transmission",
    mark: "٣",
  },
  {
    category: "D-السيرة النبوية",
    titleAr: "السيرة النبوية",
    titleEn: "Prophetic biography",
    hintAr: "العصور والأحداث والرحلات",
    hintEn: "Eras, events, and journeys",
    mark: "٤",
  },
  {
    category: "J-الفقه",
    titleAr: "الفقه",
    titleEn: "Jurisprudence",
    hintAr: "العبادات والمعاملات والمذاهب",
    hintEn: "Worship, transactions, and schools",
    mark: "٥",
  },
  {
    category: "K-أصول الفقه والقواعد",
    titleAr: "أصول الفقه",
    titleEn: "Legal theory",
    hintAr: "الأصول والقواعد والمناهج",
    hintEn: "Usul, maxims, and methods",
    mark: "٦",
  },
  {
    category: "I-العقيدة",
    titleAr: "العقيدة",
    titleEn: "Creed",
    hintAr: "أصول الاعتقاد وشروحها",
    hintEn: "Foundations and commentaries",
    mark: "٧",
  },
  {
    category: "P-اللغة العربية",
    titleAr: "اللغة والأدب",
    titleEn: "Arabic language and literature",
    hintAr: "اللغة والشعر والبلاغة",
    hintEn: "Language, poetry, and rhetoric",
    mark: "٨",
  },
];

export function LibraryPage({ initialWorkId }: { initialWorkId?: string }) {
  const lang = useInstitution((state) => state.lang);
  const hydrated = useInstitution((state) => state.hydrated);
  const readingProgress = useInstitution((state) => state.readingProgress);
  const motion = useEffectiveMotion();
  const [lowCapacity] = useState(() =>
    isLowCapacityDevice(readDeviceCapacitySignals()),
  );
  const [query, setQuery] = useState("");
  // `?view=shelves` lets the immersive hall hand the reader back to the shelves
  // instead of trapping them in the arcade after they leave the 3D view.
  const [viewChoice, setViewChoice] = useState<LibraryView | "auto">(
    initialWorkId
      ? "catalog"
      : new URLSearchParams(window.location.search).get("view") === "shelves"
        ? "shelves"
        : "auto",
  );
  const [shelfDomain, setShelfDomain] = useState<string | undefined>();
  const [catalogCategory, setCatalogCategory] = useState<string | undefined>();
  const [openWork, setOpenWork] = useState<CatalogWork | null>(null);
  const [manuscript, setManuscript] = useState<ManuscriptSource | null>(null);
  const [payload, setPayload] = useState<CatalogPayload | null>(null);
  const [catalogError, setCatalogError] = useState("");
  const recordReadingProgress = useInstitution((state) => state.recordReadingProgress);

  // The complete DOM shelves are the default whenever the device is weak or
  // reduced motion is active. The 3D arcade remains available as an explicit
  // choice, but it is never required to search, browse, or read.
  const autoView: LibraryView =
    motion === "reduced" || lowCapacity ? "shelves" : "library3d";
  const view: LibraryView = viewChoice === "auto" ? autoView : viewChoice;
  const showAutoViewNote =
    hydrated && viewChoice === "auto" && autoView === "shelves";

  // One shared, memoised fetch feeds the 3D halls, the capability statement,
  // and the domain counts. The shelf and catalog views reuse the same promise,
  // so opening them never downloads the 10.7 MB catalog a second time.
  useEffect(() => {
    let active = true;
    loadFullLibraryCatalog()
      .then((data) => {
        if (!active) return;
        setPayload(data);
        setCatalogError("");
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setCatalogError(
          reason instanceof Error
            ? reason.message
            : "تعذر تحميل فهرس المكتبة.",
        );
      });
    return () => {
      active = false;
    };
  }, []);

  const capability = useMemo(
    () => (payload ? catalogCapabilityReport(payload) : null),
    [payload],
  );

  // Real category counts derived from the loaded catalog — never illustrative
  // reference numbers. Each domain gateway's count is the number of catalogued
  // works in that category, so every entrance opens real filtered content.
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const work of (payload?.works ?? [])) {
      if (work.category) counts[work.category] = (counts[work.category] ?? 0) + 1;
    }
    return counts;
  }, [payload]);

  const librarySubtitle = lang === "ar"
    ? "ادخل رواق المكتبة، اختر باباً من العلوم، واقرأ عملاً حقيقياً من الفهرس."
    : "Enter the library arcade, choose a domain of knowledge, and read a real work from the catalog.";

  // LibraryHub is bilingual Arabic/English; the store UI lang also includes fr/ur,
  // and LibraryPage already renders everything as ar vs non-ar.
  const hubLang: "ar" | "en" = lang === "ar" ? "ar" : "en";

  // Entering through the hall's own exit (`?view=shelves`) is a deliberate
  // request for the shelf surface; honour it once the catalog has loaded so
  // the reader is never bounced back into the arcade they just left.
  const shelfRequested = typeof window !== "undefined"
    && new URLSearchParams(window.location.search).get("view") === "shelves";
  useEffect(() => {
    if (shelfRequested) setViewChoice("shelves");
  }, [shelfRequested]);

  const arNumber = useMemo(() => new Intl.NumberFormat("ar-EG"), []);
  const enNumber = useMemo(() => new Intl.NumberFormat("en-US"), []);

  const labels = lang === "ar"
    ? {
        title: "المكتبة الكبرى",
        subtitle: capability
          ? `${arNumber.format(capability.readableText)} عملاً نصياً مؤهلاً للقراءة داخل المنصة من ${arNumber.format(capability.works)} عملاً مصنفاً؛ و${arNumber.format(capability.catalogTextOnly)} نصاً مسجلاً في الفهرس لم يجتز مراجعة النسخة والحقوق للقراءة الداخلية، و${arNumber.format(capability.metadataOnly)} سجلاً فهرسياً فقط بلا نسخة مرفقة.`
          : "جارٍ قياس ما يمكن فتحه فعليًا من الفهرس…",
        description:
          "ادخل رواقًا ثلاثي الأبعاد، امشِ بين خزائن الكتب، واختر عملاً حقيقياً من الفهرس. الأعمال التي لها نسخة OpenITI مؤهلة فقط هي التي تُقرأ داخل المؤسسة. لا توجد تسجيلات صوتية معتمدة بعد، والمصادر تبقى موثقة كما هي.",
        search:
          "ابحث في كل الكتب والرفوف باسم الكتاب أو المؤلف أو القسم…",
        searchLabel: "بحث داخل المكتبة الكاملة",
        searchHint: "يُبحث داخل كل الرفوف",
        threeD: "المكتبة ثلاثية الأبعاد",
        threeDHint: "تجوال مكاني اختياري؛ الرفوف والبحث يعملان دونه",
        shelves: "المكتبة والرفوف",
        shelvesHint: "كل الأعمال المصنفة موزعة على أبواب وقاعات ورفوف",
        catalog: "الفهرس العلمي",
        catalogHint: "العرض الجدولي المتخصص للباحثين",
        modesLabel: "طرق استكشاف المكتبة",
        loading: "يُوقِد سراج المكتبة ويُفتح الرواق…",
        loadingHint:
          "يُحمّل الفهرس الكامل مرة واحدة، ثم يبقى في الذاكرة أثناء التنقل.",
        error: "تعذر تحميل فهرس المكتبة.",
        retry: "إعادة المحاولة",
        auto2d:
          "فُتحت الرفوف الكاملة لأن جهازك أو إعداد تقليل الحركة يفضّل عرضًا أخف. يمكنك اختيار المشهد ثلاثي الأبعاد يدويًا في أي وقت.",
      }
    : {
        title: "The Grand Library",
        subtitle: capability
          ? `${enNumber.format(capability.readableText)} catalogued works have text cleared for in-app reading out of ${enNumber.format(capability.works)}; ${enNumber.format(capability.catalogTextOnly)} catalog text records have not cleared version and rights review for in-app reading, and ${enNumber.format(capability.metadataOnly)} records are catalog metadata only with nothing attached.`
          : "Measuring what the catalog can actually open…",
        description:
          "Enter a three-dimensional arcade, walk between bookcases, and choose a real catalogued work. Only works with an eligible governed OpenITI version can be read inside the institution. No approved audio recording is available yet; provenance stays exactly as recorded.",
        search: "Search every book and shelf by title, author, or subject…",
        searchLabel: "Search the complete Library",
        searchHint: "Searching every shelf",
        threeD: "3D Library",
        threeDHint: "Optional spatial browsing; shelves and search work without it",
        shelves: "Library & Shelves",
        shelvesHint: "All classified works arranged as domains, halls, and shelves",
        catalog: "Scholarly Catalog",
        catalogHint: "Specialist tabular view for researchers",
        modesLabel: "Ways to explore the Library",
        loading: "Lighting the Library lamp and opening the arcade…",
        loadingHint:
          "The complete catalog is fetched once, then kept in memory while you move.",
        error: "The Library catalog could not be loaded.",
        retry: "Try again",
        auto2d:
          "The complete shelves opened because this device or your reduced-motion setting prefers a lighter view. You can still choose the 3D arcade explicitly at any time.",
      };

  const enterDomain = (category: string) => {
    setShelfDomain(category);
    setCatalogCategory(category);
    setViewChoice("shelves");
  };

  const browseFromScene = (category?: string) => {
    setShelfDomain(category);
    setCatalogCategory(category);
    setViewChoice("shelves");
  };

  const openReader = (work: CatalogWork) => {
    setOpenWork(work);
    recordReadingProgress({
      id: `library:${work.id}`,
      surface: "library",
      path: `/library/work/${encodeURIComponent(work.id)}`,
      titleAr: work.titleAr ?? work.titleEn ?? "عمل بلا عنوان مثبت",
      titleEn: work.titleEn ?? work.titleAr ?? "Untitled catalog work",
      locationAr: "قارئ المكتبة الداخلي",
      locationEn: "Internal Library reader",
      completed: null,
      total: null,
      unitAr: "عملًا",
      unitEn: "works",
    });
  };

  const onSearchChange = (value: string) => {
    setQuery(value);
    // The 3D arcade is a browsing surface, not a text result list. When a
    // reader starts searching, move them to the shelf results immediately.
    if (value.trim().length > 1 && view === "library3d") setViewChoice("shelves");
  };

  const gateways = payload ? (
    <LibraryDomainShelves
      domains={DOMAIN_GATEWAYS}
      works={payload.works}
      onOpen={openReader}
      onEnterDomain={enterDomain}
    />
  ) : null;

  const scenePanel = (() => {
    if (view !== "library3d" || initialWorkId) return null;

    if (catalogError) {
      return (
        <section className={styles.catalogState} role="alert">
          <LibraryBig size={26} aria-hidden="true" />
          <h2>{labels.error}</h2>
          <p>{catalogError}</p>
          <button type="button" onClick={() => window.location.reload()}>
            {labels.retry}
          </button>
        </section>
      );
    }

    if (!payload) {
      return (
        <section className={styles.catalogState} role="status">
          <LoaderCircle className={styles.spinner} size={26} aria-hidden="true" />
          <h2>{labels.loading}</h2>
          <p>{labels.loadingHint}</p>
        </section>
      );
    }

    return (
      <Suspense
        fallback={
          <section className={styles.catalogState} role="status">
            <LoaderCircle className={styles.spinner} size={26} aria-hidden="true" />
            <h2>{labels.loading}</h2>
            <p>{labels.loadingHint}</p>
          </section>
        }
      >
        <Library3D
          works={payload.works}
          lang={lang}
          onOpenWork={openReader}
          onBrowseShelves={browseFromScene}
        />
      </Suspense>
    );
  })();

  const catalogContent = (
    <LibraryCatalog
      initialWorkId={initialWorkId}
      initialCategory={catalogCategory}
      query={query}
      onQueryChange={setQuery}
      canOpenReader={canReadTextInside}
      onOpenReader={(work) => openReader(work as CatalogWork)}
    />
  );

  const libraryContent = (
    <div className={styles.page}>
      <LibraryHub
        lang={hubLang}
        query={query}
        onQueryChange={onSearchChange}
        placeholder={labels.search}
        searchLabel={labels.searchLabel}
        searchHint={labels.searchHint}
        subtitle={librarySubtitle}
        domains={DOMAIN_GATEWAYS}
        domainCounts={domainCounts}
        capability={capability}
        mediaTotal={MEDIA_DISCOVERY_STATUS.totalDiscoveryRecords}
        manuscriptCount={MANUSCRIPT_SOURCES.length}
        recent={readingProgress}
        view={view}
        onViewChange={(next) => setViewChoice(next)}
        onEnterDomain={enterDomain}
      />

      {!initialWorkId ? (
        <>
          {showAutoViewNote ? (
            <p className={styles.autoViewNote} role="status">
              {labels.auto2d}
            </p>
          ) : null}

          {view === "catalog" ? catalogContent : (
            <>
              {payload ? (
                <LibraryLivingShelf works={payload.works} onOpen={openReader} />
              ) : null}
              {view === "library3d" ? (
                scenePanel
              ) : (
                <CatalogShelfHall
                  key={shelfDomain ?? "all"}
                  query={query}
                  initialCategory={shelfDomain}
                  onOpen={openReader}
                  hideDomainGrid
                />
              )}
            </>
          )}

          {gateways}
          <ManuscriptGallery onOpen={setManuscript} />
        </>
      ) : (
        catalogContent
      )}

      {openWork ? (
        <CatalogReadingChamber
          work={openWork}
          onClose={() => setOpenWork(null)}
        />
      ) : null}
      {manuscript ? (
        <ManuscriptReader source={manuscript} onClose={() => setManuscript(null)} />
      ) : null}
    </div>
  );

  return (
    <SectionEntry3D
      wing="library"
      active={!initialWorkId}
      onEntered={() => {
        // The page is already mounted beneath the threshold; the door simply
        // reveals it once the visitor crosses into the wing.
      }}
    >
      {libraryContent}
    </SectionEntry3D>
  );
}

LibraryPage.displayName = "LibraryPage";
