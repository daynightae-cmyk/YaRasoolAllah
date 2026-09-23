import { useMemo, useState } from "react";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import { Input } from "@/components/ui/input";
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

export default function SourcesPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const works = useMemo(
    () => workRegistry.filter((work) => !normalizedQuery || `${work.titleAr} ${work.titleEn} ${work.authorAr} ${work.openitiWorkUri ?? ""}`.toLowerCase().includes(normalizedQuery)),
    [normalizedQuery],
  );
  const providers = useMemo(
    () => providerPolicyRegistry.filter((provider) => !normalizedQuery || `${provider.provider} ${provider.domain} ${provider.rightsState}`.toLowerCase().includes(normalizedQuery)),
    [normalizedQuery],
  );

  const fullTextCount = providerResourceRegistry.filter((resource) => resource.allowedUsages.includes("full_text") && resource.productionReady).length;
  const credentialCount = providerPolicyRegistry.filter((provider) => provider.credentialsRequired).length;
  const blockedRightsCount = providerPolicyRegistry.filter((provider) => ["needs_license_review", "item_by_item_review"].includes(provider.rightsState)).length;

  return (
    <InstitutionShell activeWing="source-registry">
      <div className="institution-page institution-page--sources">
        <section className="wing-hero wing-hero--sources" aria-labelledby="sources-title">
          <div className="wing-hero__eyebrow"><Archive className="h-4 w-4" /> خزانة البحث والمنهج</div>
          <div className="wing-hero__grid">
            <div>
              <h1 id="sources-title">خزانة المصادر والتحقيق</h1>
              <p>واجهة فحص حيّة للعمل والنسخة والمزوّد والحقوق والإتاحة. الحقول غير المثبتة تظهر فارغة أو قيد المراجعة؛ لا تتحول إلى ادعاءات.</p>
            </div>
            <div className="wing-hero__ledger">
              <span><strong>{sourceRegistry.length}</strong> مصادر</span>
              <span><strong>{workRegistry.length}</strong> أعمال</span>
              <span><strong>{digitalVersionRegistry.length}</strong> نسخ</span>
              <span><strong>{mediaAssetRegistry.length}</strong> أصول وسائط إنتاجية</span>
            </div>
          </div>
        </section>

        <section className="provenance-search" aria-label="بحث الخزانة">
          <Search className="h-4 w-4" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن عمل، مؤلف، مزوّد، معرّف نسخة أو حالة حقوق…" />
        </section>

        <section className="rights-summary" aria-label="ملخص حالات الإتاحة">
          <div><FileCheck2 className="h-5 w-5" /><span>نص كامل مصرح</span><strong>{fullTextCount}</strong><small>النص العربي لتنزيل فقط</small></div>
          <div><Link2 className="h-5 w-5" /><span>روابط/فهارس خارجية</span><strong>{providerPolicyRegistry.filter((provider) => provider.contentAvailability !== "full_text_cleared").length}</strong><small>لا تنزيل داخلي</small></div>
          <div><KeyRound className="h-5 w-5" /><span>تحتاج بيانات اعتماد</span><strong>{credentialCount}</strong><small>المحوّل مغلق</small></div>
          <div><ShieldCheck className="h-5 w-5" /><span>تحتاج مراجعة حقوق</span><strong>{blockedRightsCount}</strong><small>لا أصول إنتاجية</small></div>
        </section>

        <section className="vault-section">
          <header className="vault-section__header">
            <span>WORK / AUTHOR / VERSION</span>
            <h2>سجل الأعمال والنسخ الرقمية</h2>
            <p>{works.length} نتيجة · تظهر كل نسخة OpenITI كسجل مستقل.</p>
          </header>
          <div className="work-register">
            {works.map((work) => {
              const versions = digitalVersionRegistry.filter((version) => version.workId === work.workId);
              return (
                <article key={work.workId} className="work-register__record">
                  <div className="work-register__identity">
                    <BookOpen className="h-5 w-5" />
                    <div><h3>{work.titleAr}</h3><p dir="ltr">{work.titleEn}</p></div>
                  </div>
                  <dl>
                    <div><dt>المؤلف</dt><dd>{work.authorAr}</dd></div>
                    <div><dt>OpenITI URI</dt><dd dir="ltr">{work.openitiWorkUri ?? "غير مثبت"}</dd></div>
                    <div><dt>الحالة التحريرية</dt><dd>{work.bibliographicStatus}</dd></div>
                    <div><dt>المراجعة العلمية</dt><dd>{work.scholarlyReviewStatus}</dd></div>
                    <div><dt>الإتاحة</dt><dd>فهرس فقط</dd></div>
                    <div><dt>النسخ المسجلة</dt><dd>{versions.length}</dd></div>
                  </dl>
                  <p className="work-register__note">{work.attributionCaveat}</p>
                  {versions.length > 0 && (
                    <details>
                      <summary>افتح قائمة النسخ ({versions.length})</summary>
                      <div className="version-register">
                        {versions.map((version) => (
                          <a key={version.versionId} href={version.versionMetadataUrl} target="_blank" rel="noreferrer">
                            <span dir="ltr">{version.openitiUri}</span>
                            <small>{version.editionStatement}</small>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ))}
                      </div>
                    </details>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="vault-section">
          <header className="vault-section__header">
            <span>PROVIDER / RIGHTS / AVAILABILITY</span>
            <h2>سجل المزوّدين والسياسات</h2>
            <p>{providers.length} نتيجة · حالة التشغيل منفصلة عن وجود الرابط.</p>
          </header>
          <div className="provider-ledger">
            {providers.map((provider) => (
              <article key={provider.providerId} className="provider-ledger__record">
                <div className="provider-ledger__top">
                  <div><span>{provider.domain}</span><h3>{provider.provider}</h3></div>
                  <strong>{rightsLabel(provider.rightsState)}</strong>
                </div>
                <p>{provider.productionUse}</p>
                <dl>
                  <div><dt>المحتوى</dt><dd>{provider.contentAvailability}</dd></div>
                  <div><dt>الاعتماد</dt><dd>{provider.credentialsRequired ? "مطلوب" : "غير مطلوب"}</dd></div>
                  <div><dt>النسبة</dt><dd>{provider.attribution ?? "تُحدد عند العنصر"}</dd></div>
                  <div><dt>تاريخ الفحص</dt><dd dir="ltr">{provider.checkedAt}</dd></div>
                </dl>
                <div className="provider-ledger__links">
                  <a href={provider.canonicalUrl} target="_blank" rel="noreferrer">المصدر <ExternalLink className="h-3 w-3" /></a>
                  {provider.rightsUrl && <a href={provider.rightsUrl} target="_blank" rel="noreferrer">الحقوق <ExternalLink className="h-3 w-3" /></a>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="vault-section">
          <header className="vault-section__header">
            <span>SOURCE / RIGHTS / RESOURCE</span>
            <h2>السجل التشغيلي</h2>
            <p>مطابقة المورد بقرار الحقوق قبل أي استخدام إنتاجي.</p>
          </header>
          <div className="operational-ledger">
            {providerResourceRegistry.map((resource) => {
              const source = sourceRegistry.find((item) => item.sourceId === resource.sourceId);
              const rights = rightsLedger.find((item) => item.rightsId === resource.rightsId);
              return (
                <article key={resource.resourceId}>
                  <span>{resource.productionReady ? "PRODUCTION" : "CLOSED"}</span>
                  <h3>{source?.title ?? resource.provider}</h3>
                  <p dir="ltr">{resource.resourceId}</p>
                  <dl>
                    <div><dt>الحقوق</dt><dd>{rights ? rightsLabel(rights.decision) : "غير مرتبطة"}</dd></div>
                    <div><dt>الإتاحة</dt><dd>{resource.allowedUsages.length ? resource.allowedUsages.join(" · ") : "مغلقة"}</dd></div>
                    <div><dt>الإصدار</dt><dd>{source?.version ?? "غير محدد"}</dd></div>
                    <div><dt>الفحص</dt><dd dir="ltr">{source?.checkedAt ?? "—"}</dd></div>
                  </dl>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </InstitutionShell>
  );
}
