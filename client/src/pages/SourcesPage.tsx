import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Archive,
  BookOpen,
  ExternalLink,
  FileCheck2,
  KeyRound,
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

  // Escape closes the inspection drawer; focus enters it on open.
  useEffect(() => {
    if (!openSource) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    const frame = window.requestAnimationFrame(() => drawerRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      window.cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSource]);

  const sources = useMemo(
    () =>
      sourceRegistry.filter((source) =>
        (kindFilter === "all" || source.kind === kindFilter) &&
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
    [normalizedQuery, kindFilter],
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

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="sources-title">
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <Archive size={16} />
            خزانة البحث والمنهج
          </div>
          <h1 id="sources-title">خزانة المصادر والتحقيق</h1>
          <p>
            سجل حيّ للمصدر والعمل والنسخة والمزوّد والحقوق والإتاحة. وجود الرابط لا يعني حق
            القراءة أو التنزيل، وحالة «تحقق» لا تعني حكمًا علميًا عامًا على المحتوى.
          </p>
        </div>
        <div className={styles.ledger} aria-label="أحجام السجلات الحالية">
          <div>
            <strong>{sourceRegistry.length}</strong>
            <span>مصدرًا مسجلًا</span>
          </div>
          <div>
            <strong>{workRegistry.length}</strong>
            <span>عملًا ببليوغرافيًا</span>
          </div>
          <div>
            <strong>{digitalVersionRegistry.length}</strong>
            <span>نسخة رقمية</span>
          </div>
          <div>
            <strong>{mediaAssetRegistry.length}</strong>
            <span>أصل وسائط إنتاجي</span>
          </div>
        </div>
      </section>

      <label className={styles.searchBand}>
        <Search size={18} aria-hidden />
        <span className="sr-only">بحث خزانة المصادر</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث في المصدر، العمل، المؤلف، المزوّد، النسخة أو حالة الحقوق…"
        />
      </label>

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

      <section className={styles.section} aria-labelledby="source-registry-heading">
        <header className={styles.sectionHead}>
          <span>SOURCE / VERSION / REVIEW</span>
          <h2 id="source-registry-heading">سجل المصادر</h2>
          <p>{sources.length} نتيجة من السجل الحالي، مع إبقاء النطاق والمراجعة والحقوق منفصلة.</p>
        </header>
        {sources.length ? (
          <div className={styles.grid2}>
            {sources.map((source) => (
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
                  <div><dt>النوع</dt><dd>{source.kind}</dd></div>
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
        ) : (
          <div className={styles.empty}>لا توجد مصادر مطابقة لهذا البحث في السجل المحلي الحالي.</div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="works-heading">
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

      <section className={styles.section} aria-labelledby="providers-heading">
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

      <section className={styles.section} aria-labelledby="resources-heading">
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

      {openSource ? (
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
  );
}
