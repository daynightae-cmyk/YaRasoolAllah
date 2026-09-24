import { useMemo, useState } from "react";
import {
  Archive,
  BookOpen,
  ExternalLink,
  FileCheck2,
  KeyRound,
  Link2,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  providerResourceRegistry,
  rightsLedger,
  sourceRegistry,
} from "@shared/source-registry";
import {
  digitalVersionRegistry,
  mediaAssetRegistry,
  providerPolicyRegistry,
  workRegistry,
} from "@shared/knowledge-registry";
import styles from "./SourcesPage.module.css";

function rightsLabel(value: string) {
  const labels: Record<string, string> = {
    cleared: "مسموح بسجل صريح",
    api_only: "API فقط",
    reference_only: "فهرس/مرجع فقط",
    development_only: "تطوير فقط",
    needs_review: "مراجعة حقوق",
    blocked: "محظور",
    cleared_with_attribution: "مسموح مع النسبة",
    external_link_only: "رابط خارجي فقط",
    needs_license_review: "مراجعة ترخيص",
    needs_credential: "بيانات اعتماد مطلوبة",
    item_by_item_review: "مراجعة كل عنصر",
  };
  return labels[value] ?? value;
}

function reviewLabel(value: string) {
  const labels: Record<string, string> = {
    verified: "تحقق محدد النطاق",
    editorial_review_pending: "مراجعة تحريرية",
    rights_review_pending: "مراجعة حقوق",
    blocked: "محظور",
  };
  return labels[value] ?? value;
}

function includesQuery(query: string, ...values: Array<string | null | undefined>) {
  if (!query) return true;
  return values.filter(Boolean).join(" ").toLowerCase().includes(query);
}

export default function SourcesPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const sources = useMemo(
    () =>
      sourceRegistry.filter((source) =>
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
    [normalizedQuery],
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

  const fullTextCount = providerResourceRegistry.filter(
    (resource) => resource.allowedUsages.includes("full_text") && resource.productionReady,
  ).length;
  const credentialCount = providerPolicyRegistry.filter((provider) => provider.credentialsRequired).length;
  const blockedRightsCount = providerPolicyRegistry.filter((provider) =>
    ["needs_license_review", "item_by_item_review"].includes(provider.rightsState),
  ).length;
  const externalOnlyCount = providerPolicyRegistry.filter(
    (provider) => provider.contentAvailability !== "full_text_cleared",
  ).length;

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

      <section className={styles.summary} aria-label="ملخص الإتاحة والحقوق">
        <article className={styles.metric}>
          <FileCheck2 size={20} />
          <span>نص كامل مسجل للإنتاج</span>
          <strong>{fullTextCount}</strong>
          <small>بحسب المورد وسجل الحقوق الحالي</small>
        </article>
        <article className={styles.metric}>
          <Link2 size={20} />
          <span>اكتشاف/فهرس خارجي</span>
          <strong>{externalOnlyCount}</strong>
          <small>ليس تنزيلًا داخليًا تلقائيًا</small>
        </article>
        <article className={styles.metric}>
          <KeyRound size={20} />
          <span>تحتاج بيانات اعتماد</span>
          <strong>{credentialCount}</strong>
          <small>المفتاح لا يوضع في الواجهة</small>
        </article>
        <article className={styles.metric}>
          <ShieldCheck size={20} />
          <span>تحتاج مراجعة حقوق</span>
          <strong>{blockedRightsCount}</strong>
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
                {source.canonicalUrl ? (
                  <div className={styles.links}>
                    <a href={source.canonicalUrl} target="_blank" rel="noopener noreferrer">
                      المصدر الأصلي <ExternalLink size={12} />
                    </a>
                  </div>
                ) : null}
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
                  <span className={styles.badge}>{rightsLabel(provider.rightsState)}</span>
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
                    <div><dt>قرار الحقوق</dt><dd>{rights ? rightsLabel(rights.decision) : "غير مرتبط"}</dd></div>
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
    </div>
  );
}
