import { useMemo, useState } from "react";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  digitalVersionRegistry,
  workRegistry,
  type WorkCategory,
  type WorkRecord,
} from "@shared/knowledge-registry";
import {
  Archive,
  BookMarked,
  ExternalLink,
  FileSearch,
  Library,
  Search,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryLabels: Record<"all" | WorkCategory, string> = {
  all: "جميع الخزائن",
  seerah: "السيرة",
  history: "التاريخ",
  tafsir: "التفسير",
  hadith: "الحديث",
  adab: "الآداب",
};

const shelfOrder: WorkCategory[] = ["seerah", "tafsir", "hadith", "adab", "history"];

function versionCount(workId: string) {
  return digitalVersionRegistry.filter((version) => version.workId === workId).length;
}

function WorkSpine({ work, onSelect }: { work: WorkRecord; onSelect: () => void }) {
  const count = versionCount(work.workId);
  return (
    <button
      type="button"
      onClick={onSelect}
      className="knowledge-spine group"
      aria-label={`افتح سجل ${work.titleAr}`}
    >
      <span className="knowledge-spine__code" dir="ltr">
        {work.openitiWorkUri ?? "CATALOG"}
      </span>
      <span className="knowledge-spine__title">{work.titleAr}</span>
      <span className="knowledge-spine__author">{work.authorAr}</span>
      <span className="knowledge-spine__status">
        {count ? `${count} نسخ رقمية مسجلة` : "سجل عمل فقط"}
      </span>
    </button>
  );
}

export default function DigitalLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<"all" | WorkCategory>("all");
  const [mode, setMode] = useState<"shelves" | "catalog">("shelves");
  const [selectedWork, setSelectedWork] = useState<WorkRecord>(workRegistry[0]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return workRegistry.filter((work) => {
      const categoryMatch = category === "all" || work.category === category;
      const queryMatch =
        !query ||
        work.titleAr.toLowerCase().includes(query) ||
        work.titleEn.toLowerCase().includes(query) ||
        work.authorAr.toLowerCase().includes(query) ||
        work.authorEn.toLowerCase().includes(query) ||
        work.openitiWorkUri?.toLowerCase().includes(query);
      return categoryMatch && queryMatch;
    });
  }, [category, searchQuery]);

  const selectedVersions = digitalVersionRegistry.filter(
    (version) => version.workId === selectedWork.workId,
  );

  return (
    <InstitutionShell activeWing="library">
      <div className="institution-page institution-page--library">
        <section className="wing-hero wing-hero--library" aria-labelledby="library-title">
          <div className="wing-hero__eyebrow">
            <Library className="h-4 w-4" />
            مكتبة فهرسية مرتبطة بإصدارات حقيقية
          </div>
          <div className="wing-hero__grid">
            <div>
              <h1 id="library-title">مكتبة الرفوف</h1>
              <p>
                قاعة بحث هادئة للأعمال والنسخ الرقمية المثبتة. كل كعب كتاب هنا
                يعود إلى سجل عمل حقيقي؛ لا تنزيلات مزعومة ولا قارئ نص كامل قبل
                ثبوت حق النسخة.
              </p>
            </div>
            <div className="wing-hero__ledger" aria-label="ملخص الفهرس">
              <span><strong>{workRegistry.length}</strong> عملاً</span>
              <span><strong>{digitalVersionRegistry.length}</strong> نسخة رقمية</span>
              <span><strong>0</strong> تنزيل غير موثق</span>
            </div>
          </div>
        </section>

        <section className="reading-table" aria-label="أدوات استكشاف المكتبة">
          <div className="reading-table__search">
            <Search className="h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ابحث بالعنوان أو المؤلف أو معرّف OpenITI…"
              aria-label="بحث المكتبة"
            />
          </div>
          <div className="reading-table__filters" aria-label="تصنيف الأعمال">
            {(Object.keys(categoryLabels) as Array<"all" | WorkCategory>).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn("editorial-tab", category === item && "is-active")}
              >
                {categoryLabels[item]}
              </button>
            ))}
          </div>
          <div className="reading-table__mode">
            <button type="button" className={cn("editorial-tab", mode === "shelves" && "is-active")} onClick={() => setMode("shelves")}>رفوف</button>
            <button type="button" className={cn("editorial-tab", mode === "catalog" && "is-active")} onClick={() => setMode("catalog")}>فهرس</button>
          </div>
        </section>

        <div className="library-workspace">
          <section className="library-collection" aria-live="polite">
            {mode === "shelves" ? (
              <div className="space-y-10">
                {shelfOrder.map((shelfCategory) => {
                  const books = filtered.filter((work) => work.category === shelfCategory);
                  if (!books.length) return null;
                  return (
                    <div key={shelfCategory} className="knowledge-shelf">
                      <header>
                        <span>{books.length} أعمال</span>
                        <h2>{categoryLabels[shelfCategory]}</h2>
                      </header>
                      <div className="knowledge-shelf__books">
                        {books.map((work) => (
                          <WorkSpine key={work.workId} work={work} onSelect={() => setSelectedWork(work)} />
                        ))}
                      </div>
                      <div className="knowledge-shelf__board" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="catalog-ledger">
                {filtered.map((work) => (
                  <button key={work.workId} type="button" onClick={() => setSelectedWork(work)} className="catalog-ledger__row">
                    <span className="catalog-ledger__mark"><BookMarked className="h-4 w-4" /></span>
                    <span><strong>{work.titleAr}</strong><small>{work.authorAr}</small></span>
                    <span className="font-mono" dir="ltr">{work.openitiWorkUri ?? "catalog-only"}</span>
                    <span>{versionCount(work.workId)} نسخة</span>
                  </button>
                ))}
                {!filtered.length && <p className="empty-state">لا توجد سجلات تطابق البحث الحالي.</p>}
              </div>
            )}
          </section>

          <aside className="catalog-desk" aria-label="سجل العمل المحدد">
            <div className="catalog-desk__seal"><Archive className="h-5 w-5" /></div>
            <p className="catalog-desk__kicker">بطاقة الفهرسة</p>
            <h2>{selectedWork.titleAr}</h2>
            <p className="catalog-desk__latin" dir="ltr">{selectedWork.titleEn}</p>
            <dl>
              <div><dt>المؤلف</dt><dd>{selectedWork.authorAr}</dd></div>
              <div><dt>معرّف العمل</dt><dd dir="ltr">{selectedWork.openitiWorkUri ?? "غير مثبت"}</dd></div>
              <div><dt>الحالة</dt><dd>فهرس/رابط خارجي فقط</dd></div>
              <div><dt>المراجعة</dt><dd>مراجعة علمية مطلوبة</dd></div>
            </dl>
            <p className="catalog-desk__caveat">{selectedWork.attributionCaveat}</p>
            <div className="catalog-desk__versions">
              <h3>النسخ المسجلة</h3>
              {selectedVersions.length ? selectedVersions.map((version) => (
                <a
                  key={version.versionId}
                  href={version.versionMetadataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="version-slip"
                >
                  <span dir="ltr">{version.openitiUri}</span>
                  <small>{version.contentAvailability === "catalog_only" ? "فهرس فقط" : version.contentAvailability}</small>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )) : (
                <p className="empty-state">سجل عمل فقط؛ لا توجد نسخة رقمية مثبتة.</p>
              )}
            </div>
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href="/sources"><FileSearch className="h-4 w-4" /> افحص سجل المصدر والحقوق</a>
            </Button>
            <p className="catalog-desk__integrity"><ShieldCheck className="h-4 w-4" /> لا تنزيل أو نص كامل دون قرار حقوق صريح.</p>
          </aside>
        </div>
      </div>
    </InstitutionShell>
  );
}
