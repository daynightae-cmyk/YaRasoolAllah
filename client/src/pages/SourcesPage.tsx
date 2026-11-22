import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  ExternalLink,
  FileCheck2,
  KeyRound,
  Lamp,
  LibraryBig,
  Link2,
  Radio,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  providerResourceRegistry,
  rightsLedger,
  sourceRegistry,
} from "@shared/source-registry";
import {
  digitalVersionRegistry,
  getProviderAvailabilityMetrics,
  mediaAssetRegistry,
  providerPolicyRegistry,
  workRegistry,
} from "@shared/knowledge-registry";
import { getEligibleDirectOpenItiVersions } from "@/visual-golden/services/direct-book-reader";
import {
  EVIDENCE_STATUSES,
  PROVIDER_RIGHTS_STATE_LABELS,
  RIGHTS_DECISION_LABELS,
  type EvidenceStatus,
} from "@shared/evidence-contract";
import styles from "./SourcesPage.module.css";
import { getInteriorScene } from "@/visual-golden/services/interior-scenes";

// Three.js stays out of the initial chunk: the treasury loads only when the
// visitor explicitly opts in (same lazy pattern as the verified wings).
const SourcesTreasury3D = lazy(() =>
  import("@/visual-golden/components/sources/SourcesTreasury3D").then((module) => ({
    default: module.SourcesTreasury3D,
  })),
);

/**
 * `RightsDecision` (a decision about a governed source) and
 * `providerPolicyRegistry.rightsState` (a provider's content state) are
 * different vocabularies that share some values, so they are labelled from
 * two separate tables. `api_only` exists in both and means different things.
 */
function rightsDecisionLabel(value: string) {
  const labels = RIGHTS_DECISION_LABELS as Record<string, { labelAr: string } | undefined>;
  return labels[value]?.labelAr ?? value;
}

function providerRightsStateLabel(value: string) {
  return PROVIDER_RIGHTS_STATE_LABELS[value]?.labelAr ?? value;
}

function reviewLabel(value: string) {
  const status = EVIDENCE_STATUSES[value as EvidenceStatus];
  return status?.labelAr ?? value;
}

function includesQuery(query: string, ...values: Array<string | null | undefined>) {
  if (!query) return true;
  return values.filter(Boolean).join(" ").toLowerCase().includes(query);
}

function initialSourceQuery() {
  try {
    return new URLSearchParams(window.location.search).get("q") ?? "";
  } catch {
    return "";
  }
}

/** Deep-linkable record inspection: /sources?source=<sourceId> opens the drawer. */
function initialSourceId() {
  try {
    const requested = new URLSearchParams(window.location.search).get("source") ?? "";
    return sourceRegistry.some((source) => source.sourceId === requested) ? requested : "";
  } catch {
    return "";
  }
}

const SOURCE_KIND_LABELS: Record<string, string> = {
  primary_text: "نص أصلي",
  translation: "ترجمة",
  commentary: "شرح",
  hadith: "حديث",
  bibliography: "ببليوغرافيا",
  catalog_metadata: "بيانات فهرس",
  audio_recording: "تسجيل صوتي",
  geodata: "بيانات جغرافية",
  font: "خط",
  provider_policy: "سياسة مزوّد",
  media_catalog: "فهرس وسائط",
  educational_adaptation: "تكييف تعليمي",
  internal_development_sample: "عينة تطوير داخلية",
};

function sourceKindLabel(kind: string) {
  return SOURCE_KIND_LABELS[kind] ?? kind;
}

const PERMISSION_LABELS: Record<string, string> = {
  allowed: "مسموح",
  forbidden: "ممنوع",
  unknown: "غير محدد",
};

export default function SourcesPage() {
  const [query, setQuery] = useState(initialSourceQuery);
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [openSourceId, setOpenSourceId] = useState<string>(initialSourceId);
  const [treasuryOpen, setTreasuryOpen] = useState(false);
  const [treasuryFailed, setTreasuryFailed] = useState(false);
  const [treasuryLamp, setTreasuryLamp] = useState(true);
  // Browse-deck state: review chips, table/card view, real pagination and
  // the record selected for the details + governance panels.
  const [reviewFilter, setReviewFilter] = useState<"all" | "verified" | "pending">("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const PAGE_SIZE = 10;
  const drawerRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = query.trim().toLowerCase();

  const openSource = useMemo(
    () => sourceRegistry.find((source) => source.sourceId === openSourceId) ?? null,
    [openSourceId],
  );

  // Established relationships only: every link below is a recorded registry
  // reference (work.sourceIds, resource.sourceId, rights.sourceId) — never
  // inferred from names or topics.
  const openSourceWorks = useMemo(
    () => (openSource ? workRegistry.filter((work) => work.sourceIds.includes(openSource.sourceId)) : []),
    [openSource],
  );
  const openSourceResources = useMemo(
    () => (openSource ? providerResourceRegistry.filter((resource) => resource.sourceId === openSource.sourceId) : []),
    [openSource],
  );
  const openSourceRights = useMemo(
    () => (openSource ? rightsLedger.filter((rights) => rights.sourceId === openSource.sourceId) : []),
    [openSource],
  );
  const openSourceVersions = useMemo(() => {
    if (!openSource) return [];
    const workIds = new Set(openSourceWorks.map((work) => work.workId));
    return digitalVersionRegistry.filter((version) => workIds.has(version.workId));
  }, [openSource, openSourceWorks]);

  // Cabinet categories derived from the real registry — counts are measured.
  const kindCabinets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const source of sourceRegistry) counts.set(source.kind, (counts.get(source.kind) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const openDrawer = (sourceId: string) => {
    setOpenSourceId(sourceId);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("source", sourceId);
      window.history.replaceState(null, "", url.toString());
    } catch {
      // deep link is progressive enhancement; the drawer still opens
    }
  };

  const closeDrawer = () => {
    setOpenSourceId("");
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("source");
      window.history.replaceState(null, "", url.toString());
    } catch {
      // ignore
    }
  };

  // Escape closes the inspection drawer (unless the treasury is open — there
  // the shared observer shell owns Escape as scene exit); focus enters on open.
  useEffect(() => {
    if (!openSource || treasuryOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    const frame = window.requestAnimationFrame(() => drawerRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      window.cancelAnimationFrame(frame);
    };
  }, [openSource, treasuryOpen]);

  const sources = useMemo(
    () =>
      sourceRegistry.filter((source) =>
        (kindFilter === "all" || source.kind === kindFilter) &&
        (reviewFilter === "all" ||
          (reviewFilter === "verified" && source.editorialStatus === "verified") ||
          (reviewFilter === "pending" &&
            (source.editorialStatus === "editorial_review_pending" || source.editorialStatus === "rights_review_pending"))) &&
        includesQuery(
          normalizedQuery,
          source.sourceId,
          source.title,
          source.provider,
          source.kind,
          source.version,
          source.editorialStatus,
          source.notes,
        ),
      ),
    [normalizedQuery, kindFilter, reviewFilter],
  );

  // Pagination and selection derive from the filtered registry — pages
  // clamp themselves, and an unknown selection falls back to the first row.
  const pageCount = Math.max(1, Math.ceil(sources.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageSources = sources.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const selectedSource =
    sources.find((source) => source.sourceId === selectedId) ?? pageSources[0] ?? sources[0] ?? null;
  const selectedWorks = useMemo(
    () => (selectedSource ? workRegistry.filter((work) => work.sourceIds.includes(selectedSource.sourceId)) : []),
    [selectedSource],
  );
  const selectedVersions = useMemo(() => {
    const workIds = new Set(selectedWorks.map((work) => work.workId));
    return digitalVersionRegistry
      .filter((version) => workIds.has(version.workId))
      .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));
  }, [selectedWorks]);
  const selectedRights = useMemo(
    () => (selectedSource ? rightsLedger.filter((rights) => rights.sourceId === selectedSource.sourceId) : []),
    [selectedSource],
  );

  const works = useMemo(
    () =>
      workRegistry.filter((work) =>
        includesQuery(
          normalizedQuery,
          work.workId,
          work.titleAr,
          work.titleEn,
          work.authorAr,
          work.openitiWorkUri,
          work.category,
          work.bibliographicStatus,
          work.scholarlyReviewStatus,
        ),
      ),
    [normalizedQuery],
  );

  const providers = useMemo(
    () =>
      providerPolicyRegistry.filter((provider) =>
        includesQuery(
          normalizedQuery,
          provider.providerId,
          provider.provider,
          provider.domain,
          provider.rightsState,
          provider.contentAvailability,
          provider.productionUse,
        ),
      ),
    [normalizedQuery],
  );

  const resources = useMemo(
    () =>
      providerResourceRegistry.filter((resource) => {
        const source = sourceRegistry.find((item) => item.sourceId === resource.sourceId);
        const rights = rightsLedger.find((item) => item.rightsId === resource.rightsId);
        return includesQuery(
          normalizedQuery,
          resource.resourceId,
          resource.provider,
          resource.resourceType,
          resource.integrationMode,
          resource.acquisitionStatus,
          source?.title,
          source?.sourceId,
          rights?.decision,
        );
      }),
    [normalizedQuery],
  );

  const availabilityMetrics = getProviderAvailabilityMetrics();

  // Review-state ring: measured from the registry's editorial statuses.
  // "Verified" here means the recorded status, never a scholarly ruling.
  const reviewRing = useMemo(() => {
    const total = sourceRegistry.length;
    const verified = sourceRegistry.filter((source) => source.editorialStatus === "verified").length;
    const editorialPending = sourceRegistry.filter(
      (source) => source.editorialStatus === "editorial_review_pending",
    ).length;
    const rightsPending = sourceRegistry.filter(
      (source) => source.editorialStatus === "rights_review_pending",
    ).length;
    const other = total - verified - editorialPending - rightsPending;
    return {
      total,
      verified,
      editorialPending,
      rightsPending,
      other,
      percent: total ? Math.round((verified / total) * 100) : 0,
    };
  }, []);
  // Sources with no recorded rights decision stay visibly closed — the
  // count is measured, never assumed.
  const noRightsCount = useMemo(
    () => sourceRegistry.filter((source) => !rightsLedger.some((rights) => rights.sourceId === source.sourceId)).length,
    [],
  );
  const registryTableRef = useRef<HTMLElement | null>(null);
  const worksRef = useRef<HTMLElement | null>(null);
  const providersRef = useRef<HTMLElement | null>(null);
  const resourcesRef = useRef<HTMLElement | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);

  const treasuryScene = useMemo(() => getInteriorScene("sources-treasury"), []);
  const treasuryAvailable = !!treasuryScene && !treasuryFailed;
  const showTreasury = treasuryOpen && treasuryAvailable;
  // Drawer clicks inside the treasury set the SAME kindFilter the full
  // registry uses — measured counts from the real registry, never invented.
  const treasuryRecord = openSource ?? sources[0] ?? null;
  const treasuryRights = treasuryRecord
    ? rightsLedger.filter((rights) => rights.sourceId === treasuryRecord.sourceId)
    : [];

  return (
    <div className={styles.page}>
      {showTreasury && treasuryScene ? (
        <Suspense fallback={<div className={styles.treasuryLoading} role="status">جارٍ تهيئة خزانة المصادر ثلاثية الأبعاد…</div>}>
          <SourcesTreasury3D
            scene={treasuryScene}
            lampOn={treasuryLamp}
            onExit={() => setTreasuryOpen(false)}
            onUnavailable={() => {
              setTreasuryFailed(true);
              setTreasuryOpen(false);
            }}
            overlay={
              <div className={styles.treasuryCard} data-visual="sources-treasury-record">
                <div className={styles.treasuryDrawers} role="tablist" aria-label="أدراج الفهرسة">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={kindFilter === "all"}
                    className={kindFilter === "all" ? styles.treasuryDrawerOn : ""}
                    onClick={() => {
                      setKindFilter("all");
                      closeDrawer();
                    }}
                  >
                    كل الأدراج ({sourceRegistry.length})
                  </button>
                  {kindCabinets.map(([kind, count]) => (
                    <button
                      key={kind}
                      type="button"
                      role="tab"
                      aria-selected={kindFilter === kind}
                      className={kindFilter === kind ? styles.treasuryDrawerOn : ""}
                      onClick={() => {
                        setKindFilter(kind);
                        closeDrawer();
                      }}
                    >
                      {sourceKindLabel(kind)} ({count})
                    </button>
                  ))}
                </div>
                {treasuryRecord ? (
                  <>
                    <div className={styles.treasuryCardHead}>
                      <strong>{treasuryRecord.title}</strong>
                      <span className={styles.treasuryStatus}>{reviewLabel(treasuryRecord.editorialStatus)}</span>
                    </div>
                    <p className={styles.treasuryMeta}>
                      {sourceKindLabel(treasuryRecord.kind)} · المزوّد: {treasuryRecord.provider} · الإصدار:{" "}
                      {treasuryRecord.version ?? "غير محدد"}
                    </p>
                    <p className={styles.treasuryMeta} dir="ltr">
                      {treasuryRecord.sourceId}
                    </p>
                    <p className={styles.treasuryRights}>
                      {treasuryRights.length > 0
                        ? `قرار الحقوق: ${rightsDecisionLabel(treasuryRights[0].decision)} — ${treasuryRights[0].reviewNote}`
                        : "لا يوجد قرار حقوق مسجل لهذا المصدر — يبقى مغلقًا حتى قرار صريح."}
                    </p>
                    <div className={styles.treasuryRecords} role="tablist" aria-label="سجلات الدرج">
                      {sources.slice(0, 8).map((source) => (
                        <button
                          key={source.sourceId}
                          type="button"
                          role="tab"
                          aria-selected={source.sourceId === treasuryRecord.sourceId}
                          className={source.sourceId === treasuryRecord.sourceId ? styles.treasuryRecordOn : ""}
                          onClick={() => openDrawer(source.sourceId)}
                        >
                          {source.title}
                        </button>
                      ))}
                    </div>
                    <div className={styles.treasuryCardTools}>
                      <button
                        type="button"
                        onClick={() => {
                          openDrawer(treasuryRecord.sourceId);
                          setTreasuryOpen(false);
                        }}
                      >
                        <FileCheck2 size={13} aria-hidden /> فحص السجل الكامل والعلاقات
                      </button>
                      {treasuryRecord.canonicalUrl ? (
                        <a href={treasuryRecord.canonicalUrl} target="_blank" rel="noopener noreferrer">
                          المصدر الأصلي <ExternalLink size={12} aria-hidden />
                        </a>
                      ) : null}
                      <button
                        type="button"
                        className={treasuryLamp ? styles.treasuryToolOn : ""}
                        onClick={() => setTreasuryLamp((value) => !value)}
                      >
                        <Lamp size={13} aria-hidden /> {treasuryLamp ? "إطفاء المصباح" : "إضاءة المصباح"}
                      </button>
                      <button type="button" onClick={() => setTreasuryOpen(false)}>
                        الخزانة الكاملة
                      </button>
                    </div>
                    <p className={styles.treasuryBoundary}>
                      العلاقات مراجع مسجلة فقط — لا استنتاج ولا اختراع، والتحقق البرمجي ليس اعتمادًا علميًا شرعيًا.
                    </p>
                  </>
                ) : (
                  <p className={styles.treasuryMeta}>
                    لا توجد مصادر مطابقة لهذا البحث في السجل المحلي الحالي — لا تُخترع بدائل.
                  </p>
                )}
              </div>
            }
          />
        </Suspense>
      ) : null}

      {treasuryAvailable && !showTreasury ? (
        <button
          type="button"
          className={styles.treasuryEnter}
          data-visual="sources-treasury-enter"
          onClick={() => setTreasuryOpen(true)}
        >
          <Boxes size={15} aria-hidden />
          ادخل خزانة المصادر ثلاثية الأبعاد — فهرسة وتتبّع وتحقق
        </button>
      ) : null}

      {/* The full registry stays mounted while the 3D treasury is open;
          it is only visually hidden (search, filters and drawer keep state). */}
      <div className={showTreasury ? styles.treasuryHidden : undefined}>
      <section className={styles.hero} aria-labelledby="sources-title" data-visual="sources-vault-hero">
        <img className={styles.heroPlate} src="/visual-golden/art/worlds/sources.webp" alt="" />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <Archive size={16} />
            مركز المصادر والأرشفة وبيانات الإسناد
          </div>
          <h1 id="sources-title">خزانة المصادر والتحقيق</h1>
          <p>
            سجل حيّ للمصدر والعمل والنسخة والمزوّد والحقوق والإتاحة. وجود الرابط لا يعني حق
            القراءة أو التنزيل، وحالة «تحقق» لا تعني حكمًا علميًا عامًا على المحتوى.
          </p>
          <div className={styles.heroServices}>
            <span><ShieldCheck size={15} aria-hidden="true" /> توثيق الإسناد وسلاسل النقل</span>
            <span><Boxes size={15} aria-hidden="true" /> إدارة النسخ والإصدارات</span>
            <span><FileCheck2 size={15} aria-hidden="true" /> مراجعة حقوقية وتحكيم متخصص</span>
            <span><Archive size={15} aria-hidden="true" /> أرشفة المدى مع سلامة البيانات</span>
          </div>
          {treasuryAvailable ? (
            <button type="button" className={styles.heroCta} onClick={() => setTreasuryOpen(true)}>
              <Boxes size={16} aria-hidden="true" /> ادخل خزانة المصادر ثلاثية الأبعاد
            </button>
          ) : null}
        </div>
        <div className={styles.ledger} aria-label="أحجام السجلات الحالية">
          <div>
            <strong>{sourceRegistry.length.toLocaleString("ar-EG")}</strong>
            <span>مصدرًا مسجلًا</span>
          </div>
          <div>
            <strong>{workRegistry.length.toLocaleString("ar-EG")}</strong>
            <span>عملًا ببليوغرافيًا</span>
          </div>
          <div>
            <strong>{digitalVersionRegistry.length.toLocaleString("ar-EG")}</strong>
            <span>نسخة رقمية</span>
          </div>
          <div>
            <strong>{mediaAssetRegistry.length.toLocaleString("ar-EG")}</strong>
            <span>أصل وسائط إنتاجي</span>
          </div>
        </div>
      </section>

      {/* Search deck: full-width search with real review-state chips and a
          table/card view toggle — every chip maps to a recorded status. */}
      <div className={styles.searchDeck} data-visual="sources-search-deck">
        <label className={styles.searchBand}>
          <Search size={18} aria-hidden />
          <span className="sr-only">بحث خزانة المصادر</span>
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(0); }}
            placeholder="ابحث في المصدر، العمل، المؤلف، المزوّد، النسخة أو حالة الحقوق…"
          />
        </label>
        <div className={styles.reviewChips} role="group" aria-label="تصفية حسب حالة المراجعة">
          <button
            type="button"
            className={reviewFilter === "all" ? styles.reviewChipOn : styles.reviewChip}
            aria-pressed={reviewFilter === "all"}
            onClick={() => { setReviewFilter("all"); setPage(0); }}
          >
            <Archive size={14} aria-hidden /> جميع المصادر ({sourceRegistry.length.toLocaleString("ar-EG")})
          </button>
          <button
            type="button"
            className={reviewFilter === "verified" ? styles.reviewChipOn : styles.reviewChip}
            aria-pressed={reviewFilter === "verified"}
            onClick={() => { setReviewFilter("verified"); setPage(0); }}
          >
            <ShieldCheck size={14} aria-hidden /> الموثّق ({reviewRing.verified.toLocaleString("ar-EG")})
          </button>
          <button
            type="button"
            className={reviewFilter === "pending" ? styles.reviewChipOn : styles.reviewChip}
            aria-pressed={reviewFilter === "pending"}
            onClick={() => { setReviewFilter("pending"); setPage(0); }}
          >
            <FileCheck2 size={14} aria-hidden /> قيد المراجعة ({(reviewRing.editorialPending + reviewRing.rightsPending).toLocaleString("ar-EG")})
          </button>
          <button
            type="button"
            className={styles.reviewChip}
            aria-pressed={viewMode === "cards"}
            onClick={() => setViewMode((mode) => (mode === "cards" ? "table" : "cards"))}
          >
            <Boxes size={14} aria-hidden /> {viewMode === "cards" ? "عرض الجدول" : "عرض البطاقات"}
          </button>
        </div>
      </div>

      <section className={styles.cabinets} aria-label="أدراج الخزانة حسب نوع المصدر" data-visual="source-cabinets">
        <button
          type="button"
          className={kindFilter === "all" ? styles.cabinetOn : styles.cabinet}
          aria-pressed={kindFilter === "all"}
          onClick={() => setKindFilter("all")}
        >
          <Archive size={15} aria-hidden /> كل الأدراج ({sourceRegistry.length})
        </button>
        {kindCabinets.map(([kind, count]) => (
          <button
            key={kind}
            type="button"
            className={kindFilter === kind ? styles.cabinetOn : styles.cabinet}
            aria-pressed={kindFilter === kind}
            onClick={() => setKindFilter(kind)}
          >
            {sourceKindLabel(kind)} ({count})
          </button>
        ))}
      </section>

      {/* Statistics row, as in the approved composition: vault totals,
          review-state ring and the isnad/treasury gateway. Every number is
          measured from the governed registries — the reference's larger
          figures are bibliographic ambition, not this registry's size. */}
      <section className={styles.statsRow} aria-label="إحصاءات خزانة المصادر" data-visual="sources-stats" ref={summaryRef}>
        <article className={styles.statsPanel}>
          <header><BarChart3 size={16} aria-hidden /> إحصاءات خزانة المصادر</header>
          <div className={styles.statsGrid}>
            <div>
              <strong>{sourceRegistry.length.toLocaleString("ar-EG")}</strong>
              <span>مصدرًا موثقًا</span>
            </div>
            <div>
              <strong>{rightsLedger.length.toLocaleString("ar-EG")}</strong>
              <span>سجل حقوق وإسناد</span>
            </div>
            <div>
              <strong>{kindCabinets.length.toLocaleString("ar-EG")}</strong>
              <span>مجموعة موضوعية</span>
            </div>
          </div>
          <p className={styles.statsNote}>
            أعداد السجل المحلي المحكوم فقط — وليست حجم المكتبة الببليوغرافية الكاملة.
          </p>
        </article>
        <article className={styles.statsPanel}>
          <header><ShieldCheck size={16} aria-hidden /> حالة الأرشفة والاعتماد</header>
          <div className={styles.ringRow}>
            <div
              className={styles.ring}
              role="img"
              aria-label={`${reviewRing.percent}٪ من المصادر بحالة موثّق مسجلة`}
              style={{ background: `conic-gradient(var(--gold-400, #e8c547) ${reviewRing.percent * 3.6}deg, rgba(148, 163, 150, 0.18) 0deg)` }}
            >
              <span>
                <strong>{reviewRing.percent}٪</strong>
                <small>موثّق ومعتمد</small>
              </span>
            </div>
            <ul className={styles.ringLegend}>
              <li><i className={styles.dotVerified} aria-hidden /> موثّق <b>{reviewRing.verified.toLocaleString("ar-EG")}</b></li>
              <li><i className={styles.dotPending} aria-hidden /> قيد مراجعة تحريرية <b>{reviewRing.editorialPending.toLocaleString("ar-EG")}</b></li>
              <li><i className={styles.dotRights} aria-hidden /> قيد مراجعة حقوق <b>{reviewRing.rightsPending.toLocaleString("ar-EG")}</b></li>
              <li><i className={styles.dotOther} aria-hidden /> حالات أخرى <b>{reviewRing.other.toLocaleString("ar-EG")}</b></li>
            </ul>
          </div>
          <p className={styles.statsNote}>
            «موثّق» حالة تحريرية مسجلة — ليست حكمًا علميًا على المحتوى. مصادر بلا قرار حقوق: {noRightsCount.toLocaleString("ar-EG")}.
          </p>
        </article>
        <article className={styles.statsPanel}>
          <header><Link2 size={16} aria-hidden /> سجل الإسناد والتوثيق</header>
          <p className={styles.statsLead}>
            تتبّع سجل المصدر وحقوقه ونسخه الرقمية — العلاقات مراجع مسجلة في الفهارس المحكومة فقط.
          </p>
          <div className={styles.statsMini}>
            <div>
              <strong>{workRegistry.length.toLocaleString("ar-EG")}</strong>
              <span>عملًا مرتبطًا بمصادر</span>
            </div>
            <div>
              <strong>{digitalVersionRegistry.length.toLocaleString("ar-EG")}</strong>
              <span>نسخة رقمية مثبتة</span>
            </div>
          </div>
          <button type="button" className={styles.statsAction} onClick={() => registryTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            استعراض سجل الاعتماد <ArrowLeft size={13} aria-hidden />
          </button>
        </article>
      </section>

      {/* Action rail — real navigation to the governed sections below. */}
      <nav className={styles.actionRail} aria-label="أقسام الخزانة" data-visual="sources-action-rail">
        <button type="button" onClick={() => registryTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          <Archive size={15} aria-hidden />
          <strong>بيانات المصدر</strong>
          <small>الوصف والفهرسة المعيارية</small>
        </button>
        <button type="button" onClick={() => worksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          <Link2 size={15} aria-hidden />
          <strong>سلسلة الإسناد</strong>
          <small>توثيق النقل والرواة</small>
        </button>
        <button type="button" onClick={() => worksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          <Boxes size={15} aria-hidden />
          <strong>سجل الإصدارات</strong>
          <small>إدارة النسخ والطبعات</small>
        </button>
        <button type="button" onClick={() => providersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          <FileCheck2 size={15} aria-hidden />
          <strong>سجل المراجعات</strong>
          <small>ملاحظات وتواريخ الإفراجات</small>
        </button>
        <button type="button" onClick={() => resourcesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          <Radio size={15} aria-hidden />
          <strong>الإتاحة والجودة</strong>
          <small>حالات المزوّدين والتشغيل</small>
        </button>
      </nav>

      <section className={styles.summary} aria-label="ملخص الإتاحة والحقوق">
        <article className={styles.metric}>
          <FileCheck2 size={20} />
          <span>نص كامل مسجل</span>
          <strong>{availabilityMetrics.fullTextCleared}</strong>
          <small>مزوّدون بحالة إتاحة النص الكامل</small>
        </article>
        <article className={styles.metric}>
          <Radio size={20} />
          <span>بث مباشر مسجل</span>
          <strong>{availabilityMetrics.streamingCleared}</strong>
          <small>حالة بث مستقلة عن النص الكامل</small>
        </article>
        <article className={styles.metric}>
          <LibraryBig size={20} />
          <span>فهرس فقط</span>
          <strong>{availabilityMetrics.catalogOnly}</strong>
          <small>بيانات بلا عرض نصي أو بث</small>
        </article>
        <article className={styles.metric}>
          <ExternalLink size={20} />
          <span>رابط خارجي فقط</span>
          <strong>{availabilityMetrics.externalLinkOnly}</strong>
          <small>اكتشاف وإحالة بلا قراءة داخلية</small>
        </article>
        <article className={styles.metric}>
          <Link2 size={20} />
          <span>API فقط</span>
          <strong>{availabilityMetrics.apiOnly}</strong>
          <small>تكامل اختياري عبر واجهة المزوّد</small>
        </article>
        <article className={styles.metric}>
          <KeyRound size={20} />
          <span>تحتاج بيانات اعتماد</span>
          <strong>{availabilityMetrics.credentialsRequired}</strong>
          <small>المفتاح لا يوضع في الواجهة</small>
        </article>
        <article className={styles.metric}>
          <ShieldCheck size={20} />
          <span>تحتاج مراجعة حقوق</span>
          <strong>{availabilityMetrics.rightsReviewPending}</strong>
          <small>تبقى مغلقة حتى قرار صريح</small>
        </article>
      </section>

      {/* Browse deck, as in the approved composition: records table · source
          details with version timeline · governance panel. All rows are real
          governed registry entries; selection drives the side panels. */}
      <section className={styles.section} aria-labelledby="source-registry-heading" ref={registryTableRef}>
        <header className={styles.sectionHead}>
          <span>SOURCE / VERSION / REVIEW</span>
          <h2 id="source-registry-heading">سجلات المصادر الموثقة ({sources.length.toLocaleString("ar-EG")})</h2>
          <p>نتائج السجل الحالي، مع إبقاء النطاق والمراجعة والحقوق منفصلة.</p>
        </header>
        <div className={styles.browseDeck} data-visual="sources-browse-deck">
          <div className={styles.tablePanel}>
            <div className={styles.tableTools}>
              <div className={styles.viewToggle} role="group" aria-label="نمط العرض">
                <button
                  type="button"
                  className={viewMode === "table" ? styles.viewOn : ""}
                  aria-pressed={viewMode === "table"}
                  onClick={() => setViewMode("table")}
                >
                  عرض الجدول
                </button>
                <button
                  type="button"
                  className={viewMode === "cards" ? styles.viewOn : ""}
                  aria-pressed={viewMode === "cards"}
                  onClick={() => setViewMode("cards")}
                >
                  عرض البطاقات
                </button>
              </div>
              <span className={styles.tableCount}>
                {sources.length.toLocaleString("ar-EG")} سجلًا · صفحة {(safePage + 1).toLocaleString("ar-EG")} من {pageCount.toLocaleString("ar-EG")}
              </span>
            </div>
            {sources.length ? (
              viewMode === "table" ? (
                <div className={styles.tableScroll}>
                  <table className={styles.registryTable}>
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">المصدر</th>
                        <th scope="col">المجال</th>
                        <th scope="col">حالة الاعتماد</th>
                        <th scope="col">الإصدار الحالي</th>
                        <th scope="col">تاريخ آخر مراجعة</th>
                        <th scope="col">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageSources.map((source, index) => (
                        <tr
                          key={source.sourceId}
                          className={selectedSource?.sourceId === source.sourceId ? styles.rowOn : undefined}
                          data-source-row={source.sourceId}
                        >
                          <td>{(safePage * PAGE_SIZE + index + 1).toLocaleString("ar-EG")}</td>
                          <td>
                            <button
                              type="button"
                              className={styles.rowTitle}
                              onClick={() => setSelectedId(source.sourceId)}
                              aria-label={`عرض تفاصيل ${source.title}`}
                            >
                              {source.title}
                            </button>
                          </td>
                          <td><span className={styles.kindTag}>{sourceKindLabel(source.kind)}</span></td>
                          <td><span className={styles.badge}>{reviewLabel(source.editorialStatus)}</span></td>
                          <td dir="ltr">{source.version ?? "غير محدد"}</td>
                          <td dir="ltr">{source.checkedAt.slice(0, 10)}</td>
                          <td>
                            <button
                              type="button"
                              className={styles.inspectBtn}
                              data-visual="source-inspect"
                              onClick={() => openDrawer(source.sourceId)}
                              aria-label={`فحص سجل المصدر: ${source.title}`}
                            >
                              <FileCheck2 size={13} aria-hidden /> عرض السجل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.grid2}>
                  {pageSources.map((source) => (
                    <article key={source.sourceId} className={styles.card}>
                      <div className={styles.cardTop}>
                        <div className={styles.identity}>
                          <Archive size={18} />
                          <div>
                            <h3>{source.title}</h3>
                            <p dir="ltr">{source.sourceId}</p>
                          </div>
                        </div>
                        <span className={styles.badge}>{reviewLabel(source.editorialStatus)}</span>
                      </div>
                      <dl className={styles.facts}>
                        <div><dt>المزوّد</dt><dd>{source.provider}</dd></div>
                        <div><dt>النوع</dt><dd>{sourceKindLabel(source.kind)}</dd></div>
                        <div><dt>الإصدار</dt><dd>{source.version ?? "غير محدد"}</dd></div>
                        <div><dt>آخر فحص</dt><dd dir="ltr">{source.checkedAt}</dd></div>
                      </dl>
                      <p>{source.notes}</p>
                      <div className={styles.links}>
                        <button
                          type="button"
                          className={styles.inspectBtn}
                          data-visual="source-inspect"
                          onClick={() => openDrawer(source.sourceId)}
                          aria-label={`فحص سجل المصدر: ${source.title}`}
                        >
                          <FileCheck2 size={13} aria-hidden /> فحص السجل والعلاقات
                        </button>
                        {source.canonicalUrl ? (
                          <a href={source.canonicalUrl} target="_blank" rel="noopener noreferrer">
                            المصدر الأصلي <ExternalLink size={12} />
                          </a>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )
            ) : (
              <div className={styles.empty}>لا توجد مصادر مطابقة لهذا البحث في السجل المحلي الحالي.</div>
            )}
            {sources.length > PAGE_SIZE ? (
              <nav className={styles.pagination} aria-label="صفحات سجل المصادر">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                  aria-label="الصفحة السابقة"
                >
                  <ArrowRight size={14} aria-hidden />
                </button>
                {Array.from({ length: pageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={safePage === index ? styles.pageOn : undefined}
                    aria-current={safePage === index ? "page" : undefined}
                    onClick={() => setPage(index)}
                    aria-label={`الصفحة ${(index + 1).toLocaleString("ar-EG")}`}
                  >
                    {(index + 1).toLocaleString("ar-EG")}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                  aria-label="الصفحة التالية"
                >
                  <ArrowLeft size={14} aria-hidden />
                </button>
              </nav>
            ) : null}
          </div>

          <aside className={styles.detailPanel} aria-label="تفاصيل المصدر المحدد" data-visual="sources-detail-panel">
            <header><BookOpen size={16} aria-hidden /> تفاصيل المصدر</header>
            {selectedSource ? (
              <>
                <div className={styles.detailHead}>
                  <div>
                    <h3>{selectedSource.title}</h3>
                    <p>المزوّد: {selectedSource.provider}</p>
                    <p>المجال: {sourceKindLabel(selectedSource.kind)}</p>
                    <p dir="ltr">{selectedSource.sourceId}</p>
                  </div>
                  <span className={styles.badge}>{reviewLabel(selectedSource.editorialStatus)}</span>
                </div>
                <p className={styles.detailNotes}>{selectedSource.notes}</p>
                <button
                  type="button"
                  className={styles.statsAction}
                  onClick={() => openDrawer(selectedSource.sourceId)}
                >
                  فحص السجل الكامل والعلاقات <ArrowLeft size={13} aria-hidden />
                </button>
                <div className={styles.timeline}>
                  <h4><Boxes size={14} aria-hidden /> سجل الإصدارات والمراجعة</h4>
                  {selectedVersions.length ? (
                    <ol>
                      {selectedVersions.map((version, index) => (
                        <li key={version.versionId} className={index === 0 ? styles.timelineCurrent : undefined}>
                          <span className={styles.timelineDot} aria-hidden />
                          <div>
                            <strong dir="ltr">{version.openitiUri.split(".").pop() ?? version.versionId}</strong>
                            <small dir="ltr">{version.checkedAt.slice(0, 10)}</small>
                            <p>{version.editionStatement}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className={styles.drawerNone}>
                      لا توجد نسخ رقمية مسجلة لهذا المصدر — الإصدار الحالي: {selectedSource.version ?? "غير محدد"}.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className={styles.drawerNone}>لا سجلات مطابقة — اختر مصدرًا من الجدول لعرض تفاصيله.</p>
            )}
          </aside>

          <aside className={styles.governPanel} aria-label="بيانات الاعتماد والإسناد" data-visual="sources-govern-panel">
            <header><ShieldCheck size={16} aria-hidden /> بيانات الاعتماد والإسناد</header>
            {selectedSource ? (
              <>
                <dl className={styles.governList}>
                  <div>
                    <dt>حالة الاعتماد</dt>
                    <dd><span className={styles.badge}>{reviewLabel(selectedSource.editorialStatus)}</span></dd>
                  </div>
                  <div>
                    <dt>قرار الحقوق</dt>
                    <dd>
                      {selectedRights.length
                        ? rightsDecisionLabel(selectedRights[0].decision)
                        : "لا يوجد قرار حقوق مسجل لهذا المصدر — يبقى مغلقًا حتى قرار صريح."}
                    </dd>
                  </div>
                  <div>
                    <dt>أعمال مسجلة تشير إليه</dt>
                    <dd>{selectedWorks.length.toLocaleString("ar-EG")}</dd>
                  </div>
                  <div>
                    <dt>نسخ رقمية مثبتة</dt>
                    <dd>{selectedVersions.length.toLocaleString("ar-EG")}</dd>
                  </div>
                  <div>
                    <dt>آخر فحص</dt>
                    <dd dir="ltr">{selectedSource.checkedAt.slice(0, 10)}</dd>
                  </div>
                  <div>
                    <dt>بصمة الأثر (SHA-256)</dt>
                    <dd dir="ltr">{selectedSource.artifactSha256 ? `${selectedSource.artifactSha256.slice(0, 16)}…` : "غير مسجلة"}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className={styles.statsAction}
                  onClick={() => openDrawer(selectedSource.sourceId)}
                >
                  عرض شجرة الإسناد الكاملة <ArrowLeft size={13} aria-hidden />
                </button>
                <p className={styles.statsNote}>
                  العلاقات مراجع مسجلة فقط — لا استنتاج ولا اختراع، والتحقق البرمجي ليس اعتمادًا علميًا شرعيًا.
                </p>
              </>
            ) : (
              <p className={styles.drawerNone}>لا سجل محدد حاليًا.</p>
            )}
          </aside>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="works-heading" ref={worksRef}>
        <header className={styles.sectionHead}>
          <span>WORK / AUTHOR / VERSION</span>
          <h2 id="works-heading">سجل الأعمال والنسخ الرقمية</h2>
          <p>{works.length} نتيجة؛ العمل والنسخة الرقمية يظلان كيانين منفصلين.</p>
        </header>
        {works.length ? (
          <div className={styles.grid2}>
            {works.map((work) => {
              const versions = digitalVersionRegistry.filter((version) => version.workId === work.workId);
              return (
                <article key={work.workId} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.identity}>
                      <BookOpen size={18} />
                      <div>
                        <h3>{work.titleAr}</h3>
                        <p dir="ltr">{work.titleEn}</p>
                      </div>
                    </div>
                    <span className={styles.badge}>فهرس عمل</span>
                  </div>
                  <dl className={styles.facts}>
                    <div><dt>المؤلف</dt><dd>{work.authorAr}</dd></div>
                    <div><dt>OpenITI URI</dt><dd dir="ltr">{work.openitiWorkUri ?? "غير مثبت"}</dd></div>
                    <div><dt>الحالة التحريرية</dt><dd>{work.bibliographicStatus}</dd></div>
                    <div><dt>المراجعة العلمية</dt><dd>{work.scholarlyReviewStatus}</dd></div>
                    <div><dt>النسخ المسجلة</dt><dd>{versions.length}</dd></div>
                  </dl>
                  <p>{work.attributionCaveat}</p>
                  {versions.length > 0 ? (
                    <details className={styles.details}>
                      <summary>النسخ المسجلة ({versions.length})</summary>
                      <div className={styles.versionList}>
                        {versions.map((version) => (
                          <a
                            key={version.versionId}
                            href={version.versionMetadataUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span dir="ltr">{version.openitiUri}</span>
                            <small>{version.editionStatement}</small>
                            <ExternalLink size={12} />
                          </a>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>لا توجد أعمال مطابقة لهذا البحث في السجل المحلي الحالي.</div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="providers-heading" ref={providersRef}>
        <header className={styles.sectionHead}>
          <span>PROVIDER / RIGHTS / AVAILABILITY</span>
          <h2 id="providers-heading">سجل المزوّدين والسياسات</h2>
          <p>{providers.length} نتيجة؛ تشغيل المزوّد منفصل عن وجود رابط صالح.</p>
        </header>
        {providers.length ? (
          <div className={styles.grid3}>
            {providers.map((provider) => (
              <article key={provider.providerId} className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <span className={styles.eyebrow}>{provider.domain}</span>
                    <h3>{provider.provider}</h3>
                  </div>
                  <span className={styles.badge}>{providerRightsStateLabel(provider.rightsState)}</span>
                </div>
                <p>{provider.productionUse}</p>
                <dl className={styles.facts}>
                  <div><dt>المحتوى</dt><dd>{provider.contentAvailability}</dd></div>
                  <div><dt>الاعتماد</dt><dd>{provider.credentialsRequired ? "مطلوب" : "غير مطلوب"}</dd></div>
                  <div><dt>النسبة</dt><dd>{provider.attribution ?? "تحدد عند العنصر"}</dd></div>
                  <div><dt>آخر فحص</dt><dd dir="ltr">{provider.checkedAt}</dd></div>
                </dl>
                <div className={styles.links}>
                  <a href={provider.canonicalUrl} target="_blank" rel="noopener noreferrer">
                    المصدر <ExternalLink size={12} />
                  </a>
                  {provider.rightsUrl ? (
                    <a href={provider.rightsUrl} target="_blank" rel="noopener noreferrer">
                      الحقوق <ExternalLink size={12} />
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>لا توجد سياسات مزوّدين مطابقة لهذا البحث.</div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="resources-heading" ref={resourcesRef}>
        <header className={styles.sectionHead}>
          <span>SOURCE / RIGHTS / RESOURCE</span>
          <h2 id="resources-heading">السجل التشغيلي</h2>
          <p>{resources.length} موردًا مطابقًا؛ المورد لا يفتح في الإنتاج قبل قرار الحقوق وحالة التشغيل.</p>
        </header>
        {resources.length ? (
          <div className={styles.grid3}>
            {resources.map((resource) => {
              const source = sourceRegistry.find((item) => item.sourceId === resource.sourceId);
              const rights = rightsLedger.find((item) => item.rightsId === resource.rightsId);
              return (
                <article key={resource.resourceId} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <span className={styles.eyebrow}>{resource.provider}</span>
                      <h3>{source?.title ?? resource.resourceId}</h3>
                    </div>
                    <span className={styles.badge}>
                      {resource.productionReady ? "مورد إنتاجي" : "غير مفتوح للإنتاج"}
                    </span>
                  </div>
                  <p dir="ltr">{resource.resourceId}</p>
                  <dl className={styles.facts}>
                    <div><dt>قرار الحقوق</dt><dd>{rights ? rightsDecisionLabel(rights.decision) : "غير مرتبط"}</dd></div>
                    <div><dt>نمط الدمج</dt><dd>{resource.integrationMode}</dd></div>
                    <div><dt>الاكتساب</dt><dd>{resource.acquisitionStatus}</dd></div>
                    <div><dt>الاستخدامات</dt><dd>{resource.allowedUsages.length ? resource.allowedUsages.join(" · ") : "مغلقة"}</dd></div>
                  </dl>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>لا توجد موارد تشغيلية مطابقة لهذا البحث.</div>
        )}
      </section>

      {openSource && !showTreasury ? (
        <div className={styles.drawerScrim} onClick={closeDrawer}>
          <div
            ref={drawerRef}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="source-drawer-title"
            tabIndex={-1}
            data-visual="source-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.drawerHead}>
              <div>
                <span className={styles.eyebrow}>فحص سجل المصدر</span>
                <h2 id="source-drawer-title">{openSource.title}</h2>
                <p dir="ltr" className={styles.drawerId}>{openSource.sourceId}</p>
              </div>
              <button type="button" className={styles.drawerClose} onClick={closeDrawer} aria-label="إغلاق فحص السجل">
                <X size={16} /> إغلاق
              </button>
            </div>

            <dl className={styles.facts}>
              <div><dt>المزوّد</dt><dd>{openSource.provider}</dd></div>
              <div><dt>النوع</dt><dd>{sourceKindLabel(openSource.kind)}</dd></div>
              <div><dt>الإصدار</dt><dd>{openSource.version ?? "غير محدد"}</dd></div>
              <div><dt>الحالة التحريرية</dt><dd>{reviewLabel(openSource.editorialStatus)}</dd></div>
              <div><dt>آخر فحص</dt><dd dir="ltr">{openSource.checkedAt}</dd></div>
              <div><dt>بصمة الأثر (SHA-256)</dt><dd dir="ltr">{openSource.artifactSha256 ?? "غير مسجلة"}</dd></div>
            </dl>
            <p className={styles.drawerNotes}>{openSource.notes}</p>
            {openSource.canonicalUrl ? (
              <a className={styles.drawerExternal} href={openSource.canonicalUrl} target="_blank" rel="noopener noreferrer">
                المصدر الأصلي <ExternalLink size={12} />
              </a>
            ) : null}

            <section className={styles.drawerSection} aria-label="الأعمال المرتبطة بهذا المصدر">
              <h3>أعمال مسجلة تشير إلى هذا المصدر ({openSourceWorks.length})</h3>
              {openSourceWorks.length ? (
                <ul className={styles.drawerList}>
                  {openSourceWorks.map((work) => {
                    const readable = getEligibleDirectOpenItiVersions(work.workId).length;
                    return (
                      <li key={work.workId}>
                        <Link href={`/library/work/${encodeURIComponent(work.workId)}`}>
                          <strong>{work.titleAr}</strong>
                          <small>{work.authorAr}</small>
                          <span className={styles.drawerMeta}>
                            {readable > 0 ? `${readable} نسخة مقروءة داخل المنصة` : "فهرس عمل — لا نص مقروء بعد"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={styles.drawerNone}>لا توجد أعمال مسجلة تشير إلى هذا المصدر في السجل الحالي.</p>
              )}
            </section>

            <section className={styles.drawerSection} aria-label="النسخ الرقمية المرتبطة">
              <h3>نسخ رقمية لأعمال هذا المصدر ({openSourceVersions.length})</h3>
              {openSourceVersions.length ? (
                <ul className={styles.drawerList}>
                  {openSourceVersions.map((version) => (
                    <li key={version.versionId}>
                      <a href={version.versionMetadataUrl} target="_blank" rel="noopener noreferrer">
                        <strong dir="ltr">{version.openitiUri}</strong>
                        <small>{version.editionStatement}</small>
                        <span className={styles.drawerMeta}>
                          تثبيت: <span dir="ltr">{version.releaseCommit.slice(0, 12)}</span> · {version.contentAvailability}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.drawerNone}>لا توجد نسخ رقمية مسجلة مرتبطة بهذا المصدر.</p>
              )}
            </section>

            <section className={styles.drawerSection} aria-label="قرارات الحقوق لهذا المصدر">
              <h3>سجل الحقوق ({openSourceRights.length})</h3>
              {openSourceRights.length ? (
                openSourceRights.map((rights) => (
                  <div key={rights.rightsId} className={styles.rightsBlock}>
                    <div className={styles.rightsHead}>
                      <strong>{rightsDecisionLabel(rights.decision)}</strong>
                      <span dir="ltr">{rights.rightsId}</span>
                    </div>
                    <p>{rights.reviewNote}</p>
                    <dl className={styles.facts}>
                      <div><dt>الترخيص</dt><dd>{rights.licenseName ?? "غير محدد"}</dd></div>
                      <div><dt>النسبة</dt><dd>{rights.attribution ?? "تحدد عند العنصر"}</dd></div>
                      <div><dt>البث</dt><dd>{PERMISSION_LABELS[rights.permissions.streaming] ?? rights.permissions.streaming}</dd></div>
                      <div><dt>التخزين</dt><dd>{PERMISSION_LABELS[rights.permissions.caching] ?? rights.permissions.caching}</dd></div>
                      <div><dt>إعادة النشر</dt><dd>{PERMISSION_LABELS[rights.permissions.redistribution] ?? rights.permissions.redistribution}</dd></div>
                      <div><dt>آخر فحص</dt><dd dir="ltr">{rights.checkedAt}</dd></div>
                    </dl>
                    {rights.licenseUrl ? (
                      <a href={rights.licenseUrl} target="_blank" rel="noopener noreferrer">
                        نص الترخيص <ExternalLink size={12} />
                      </a>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className={styles.drawerNone}>لا يوجد قرار حقوق مسجل لهذا المصدر — يبقى مغلقًا حتى قرار صريح.</p>
              )}
            </section>

            <section className={styles.drawerSection} aria-label="الموارد التشغيلية لهذا المصدر">
              <h3>موارد تشغيلية ({openSourceResources.length})</h3>
              {openSourceResources.length ? (
                <ul className={styles.drawerList}>
                  {openSourceResources.map((resource) => (
                    <li key={resource.resourceId}>
                      <div className={styles.resourceRow}>
                        <strong dir="ltr">{resource.resourceId}</strong>
                        <span className={styles.drawerMeta}>
                          {resource.integrationMode} · {resource.acquisitionStatus} ·{" "}
                          {resource.productionReady ? "مورد إنتاجي" : "غير مفتوح للإنتاج"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.drawerNone}>لا توجد موارد تشغيلية مسجلة لهذا المصدر.</p>
              )}
            </section>

            <p className={styles.drawerBoundary}>
              العلاقات المعروضة مراجع مسجلة في الفهارس المحكومة فقط — لا استنتاج ولا اختراع. وجود
              الرابط لا يعني حق القراءة، وحالة التحقق تحريرية وليست حكمًا علميًا على المحتوى.
            </p>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
