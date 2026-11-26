import { useMemo } from "react";
import { Link } from "wouter";
import {
  BarChart3,
  BookOpen,
  BookOpenText,
  Box,
  Clock3,
  Download,
  Footprints,
  Globe2,
  LibraryBig,
  Search,
  SlidersHorizontal,
  Sparkles,
  Bot,
} from "lucide-react";
import type { DomainGateway } from "./LibraryDomainShelves";
import type { CatalogCapabilityReport } from "@/visual-golden/services/catalog-library";
import type { ReadingProgressEntry } from "@/visual-golden/lib/institution/reading-progress";
import styles from "./LibraryHub.module.css";

export type LibraryHubView = "library3d" | "shelves" | "catalog";

interface Props {
  lang: "ar" | "en";
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  searchLabel: string;
  searchHint: string;
  subtitle: string;
  domains: DomainGateway[];
  domainCounts: Readonly<Record<string, number>>;
  capability: CatalogCapabilityReport | null;
  mediaTotal: number;
  manuscriptCount: number;
  recent: ReadingProgressEntry[];
  view: LibraryHubView;
  onViewChange: (view: LibraryHubView) => void;
  onEnterDomain: (category: string) => void;
}

/**
 * REF-01 grand library hub — the top of /library.
 *
 * Composition (approved reference): dark emerald plaque with a gold mihrab
 * frame and medallion, one wide search bar, a row of arched category portals
 * whose counts come from the loaded catalog, a narrow metrics rail with real
 * numbers only, and a gold baseline of exploration actions. Nothing here is
 * decorative fiction: every number is counted from loaded data and every
 * control either works or is honestly disabled.
 */
export function LibraryHub({
  lang,
  query,
  onQueryChange,
  placeholder,
  searchLabel,
  searchHint,
  subtitle,
  domains,
  domainCounts,
  capability,
  mediaTotal,
  manuscriptCount,
  recent,
  view,
  onViewChange,
  onEnterDomain,
}: Props) {
  const ar = lang === "ar";
  const number = useMemo(
    () => new Intl.NumberFormat(ar ? "ar-EG" : "en-US"),
    [ar],
  );
  const relative = useMemo(
    () => new Intl.RelativeTimeFormat(ar ? "ar-EG" : "en", { numeric: "auto" }),
    [ar],
  );

  const formatCount = (value: number) => number.format(value);

  const formatAgo = (at: number) => {
    const diff = Math.round((at - Date.now()) / 60000);
    const abs = Math.abs(diff);
    if (abs < 1) return ar ? "الآن" : "now";
    if (abs < 60) return relative.format(diff, "minute");
    const hours = Math.round(diff / 60);
    if (Math.abs(hours) < 24) return relative.format(hours, "hour");
    return relative.format(Math.round(hours / 24), "day");
  };

  const copy = ar
    ? {
        hubTitle: "المكتبة الإسلامية الرقمية",
        hubTitleEn: "The Islamic Digital Library",
        portalsLabel: "بوابات الأقسام",
        unit: "عمل",
        metricsTitle: "إحصائيات المكتبة",
        works: "الأعمال المصنفة",
        readable: "مؤهلة للقراءة الداخلية",
        pending: "نصوص بانتظار المراجعة",
        media: "المواد الوسائطية",
        manuscripts: "مصادر المخطوطات",
        recentTitle: "استئناف القراءة",
        recentEmpty: "لم تُفتح أي مادة بعد — ابدأ بفتح عمل من أي رف.",

        baselineLabel: "أدوات الاستكشاف",
        view3d: "عرض ثلاثي الأبعاد",
        viewShelves: "الرفوف",
        viewCatalog: "الفهرس",
        seerahTrips: "رحلات السيرة التفاعلية",
        atlas: "الأطلس التاريخي",
        assistant: "مساعد الباحث الذكي",
        offline: "التنزيلات دون اتصال",
        soon: "غير متاح بعد في هذه النسخة",
      }
    : {
        hubTitle: "The Islamic Digital Library",
        hubTitleEn: "المكتبة الإسلامية الرقمية",
        portalsLabel: "Category portals",
        unit: "works",
        metricsTitle: "Library statistics",
        works: "Catalogued works",
        readable: "Cleared for in-app reading",
        pending: "Texts pending review",
        media: "Media items",
        manuscripts: "Manuscript sources",
        recentTitle: "Reading continuation",
        recentEmpty: "Nothing opened yet — start by opening a work from any shelf.",
        baselineLabel: "Exploration tools",
        view3d: "3D view",
        viewShelves: "Shelves",
        viewCatalog: "Catalog",
        seerahTrips: "Interactive Seerah journeys",
        atlas: "Historical Atlas",
        assistant: "Research assistant",
        offline: "Offline downloads",
        soon: "Not available in this version yet",
      };

  const metrics = [
    { icon: <BookOpenText size={15} aria-hidden />, label: copy.works, value: capability ? formatCount(capability.works) : "…" },
    { icon: <BookOpen size={15} aria-hidden />, label: copy.readable, value: capability ? formatCount(capability.readableText) : "…" },
    { icon: <Clock3 size={15} aria-hidden />, label: copy.pending, value: capability ? formatCount(capability.catalogTextOnly) : "…" },
    { icon: <Sparkles size={15} aria-hidden />, label: copy.media, value: formatCount(mediaTotal) },
    { icon: <LibraryBig size={15} aria-hidden />, label: copy.manuscripts, value: formatCount(manuscriptCount) },
  ];

  const latest = [...recent]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 3);

  return (
    <section className={styles.hub} data-visual="library-hub">
      <div className={styles.hubMain}>
        <header className={styles.plaque}>
          <span className={styles.medallion} aria-hidden>
            <BookOpen size={26} />
          </span>
          <h1 className={styles.plaqueTitle}>{copy.hubTitle}</h1>
          <p className={styles.plaqueEn}>{copy.hubTitleEn}</p>
          <p className={styles.plaqueSub}>{subtitle}</p>
        </header>

        <form
          className={styles.searchBar}
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search size={18} className={styles.searchIcon} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            aria-label={searchLabel}
          />
          {query.trim().length > 1 ? (
            <span className={styles.searchHint}>{searchHint}</span>
          ) : null}
          <button type="submit" className={styles.searchGo} aria-label={searchLabel}>
            <SlidersHorizontal size={16} aria-hidden />
          </button>
        </form>

        <div className={styles.portals} role="list" aria-label={copy.portalsLabel}>
          {domains.map((domain) => {
            const count = domainCounts[domain.category] ?? 0;
            return (
              <button
                key={domain.category}
                type="button"
                role="listitem"
                className={styles.portal}
                onClick={() => onEnterDomain(domain.category)}
                title={ar ? domain.hintAr : domain.hintEn}
              >
                <span className={styles.portalArch} aria-hidden>
                  <span className={styles.portalMark}>{domain.mark}</span>
                </span>
                <span className={styles.portalName}>
                  {ar ? domain.titleAr : domain.titleEn}
                </span>
                <span className={styles.portalCount}>
                  +{formatCount(count)} {copy.unit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className={styles.rail}>
        <section className={styles.panel} aria-label={copy.metricsTitle}>
          <h2 className={styles.panelTitle}>
            <BarChart3 size={15} aria-hidden /> {copy.metricsTitle}
          </h2>
          <ul className={styles.metrics}>
            {metrics.map((metric) => (
              <li key={metric.label}>
                <span className={styles.metricIcon}>{metric.icon}</span>
                <span className={styles.metricLabel}>{metric.label}</span>
                <strong className={styles.metricValue}>{metric.value}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel} aria-label={copy.recentTitle}>
          <h2 className={styles.panelTitle}>
            <Sparkles size={15} aria-hidden /> {copy.recentTitle}
          </h2>
          {latest.length === 0 ? (
            <p className={styles.empty}>{copy.recentEmpty}</p>
          ) : (
            <ul className={styles.recentList}>
              {latest.map((entry) => (
                <li key={entry.id}>
                  <Link href={entry.path} className={styles.recentLink}>
                    <span className={styles.recentTitle}>
                      {ar ? entry.titleAr : entry.titleEn}
                    </span>
                    <span className={styles.recentMeta}>
                      {ar ? entry.locationAr : entry.locationEn} · {formatAgo(entry.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>

      <nav className={styles.baseline} aria-label={copy.baselineLabel}>
        <button
          type="button"
          className={view === "library3d" ? styles.baselineOn : ""}
          data-visual="library-mode-3d"
          aria-pressed={view === "library3d"}
          onClick={() => onViewChange("library3d")}
        >
          <Box size={16} aria-hidden /> {copy.view3d}
        </button>
        <button
          type="button"
          className={view === "shelves" ? styles.baselineOn : ""}
          data-visual="library-mode-shelves"
          aria-pressed={view === "shelves"}
          onClick={() => onViewChange("shelves")}
        >
          <LibraryBig size={16} aria-hidden /> {copy.viewShelves}
        </button>
        <button
          type="button"
          className={view === "catalog" ? styles.baselineOn : ""}
          data-visual="library-mode-catalog"
          aria-pressed={view === "catalog"}
          onClick={() => onViewChange("catalog")}
        >
          <BookOpen size={16} aria-hidden /> {copy.viewCatalog}
        </button>
        <Link href="/seerah" className={styles.baselineLink}>
          <Footprints size={16} aria-hidden /> {copy.seerahTrips}
        </Link>
        <Link href="/atlas" className={styles.baselineLink}>
          <Globe2 size={16} aria-hidden /> {copy.atlas}
        </Link>
        <button type="button" className={styles.baselineGhost} disabled title={copy.soon}>
          <Bot size={16} aria-hidden /> {copy.assistant}
        </button>
        <button type="button" className={styles.baselineGhost} disabled title={copy.soon}>
          <Download size={16} aria-hidden /> {copy.offline}
        </button>
      </nav>
    </section>
  );
}
