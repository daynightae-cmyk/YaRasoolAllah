import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { DISCOVERED_MEDIA_CATALOG } from "@/visual-golden/data/media-discovery.generated";
import { filterMediaDiscoveryRecords, mediaReviewCounts } from "@/visual-golden/services/media/review-gates";
import { MediaReviewTable } from "@/visual-golden/components/media/MediaReviewTable";
import styles from "./MediaReviewPage.module.css";

export function MediaReviewPage() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return sessionStorage.getItem("yra-media-admin") === "1";
    } catch {
      return false;
    }
  });
  const counts = mediaReviewCounts(DISCOVERED_MEDIA_CATALOG);

  const categories = [
    ...new Set(
      DISCOVERED_MEDIA_CATALOG.map((r) => r.category).filter(Boolean),
    ),
  ].sort();

  const statuses = [
    ...new Set(
      DISCOVERED_MEDIA_CATALOG.map((r) => r.publication_status).filter(Boolean),
    ),
  ].sort();

  const filtered = filterMediaDiscoveryRecords(
    DISCOVERED_MEDIA_CATALOG,
    query,
    categoryFilter,
    statusFilter,
  );

  const openSource = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div className={styles.headContent}>
          <span className={styles.pageMark} aria-hidden="true">
            <ClipboardCheck size={22} />
          </span>
          <div>
            <h1>مراجعة الوسائط المستوردة</h1>
            <p>
              كتالوج اكتشاف الوسائط — غير معتمد للتشغيل العام. راجع كل سجل
              واعتمد الحقوق قبل النشر.
            </p>
          </div>
          <button
            type="button"
            className={styles.adminToggle}
            aria-pressed={isAdmin}
            onClick={() => {
              const next = !isAdmin;
              setIsAdmin(next);
              try {
                if (next) sessionStorage.setItem("yra-media-admin", "1");
                else sessionStorage.removeItem("yra-media-admin");
              } catch {
                // The review mode may remain active for this page lifetime.
              }
            }}
          >
            {isAdmin ? "وضع المشرف: مُفعّل" : "تفعيل وضع المشرف"}
          </button>
        </div>
        <div className={styles.counts}>
          <span className={styles.countBadge}>
            {counts.total} سجل مستورد
          </span>
          <span className={`${styles.countBadge} ${styles.countBadgeBlocked}`}>
            {counts.pending} معلّق للمراجعة
          </span>
          <span className={`${styles.countBadge} ${styles.countBadgeOk}`}>
            {counts.approved} معتمد للعرض
          </span>
        </div>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.searchLabel}>
          <span className={styles.srOnly}>ابحث في سجلات الوسائط</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث: العنوان، الناشر، السلسلة، السلسلة..."
            aria-label="ابحث في سجلات الوسائط"
          />
        </label>

        <div className={styles.filters}>
          <label>
            الفئة:
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="تصفية حسب الفئة"
            >
              <option value="all">الكل</option>
              {categories.map((category) => (
                <option key={category} value={category ?? ""}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            الحالة:
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="تصفية حسب حالة النشر"
            >
              <option value="all">الكل</option>
              {statuses.map((status) => (
                <option key={status} value={status ?? ""}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isAdmin ? (
        <section className={styles.adminPanel} aria-label="إدارة الاعتماد">
          <h2>إدارة الاعتماد — وضع المشرف</h2>
          <p>
            هذه الشاشة لا تمنح أي اعتماد. الاعتماد عملية بشرية تُسجَّل خارج
            الواجهة: تُوثَّق مراجعات المحتوى والتصوير والعمر والحقوق لكل معرّف
            فيديو في سجل الموافقات المعتمد، ثم يُنفَّذ أمر الترقية لتوليد
            الكتالوج القابل للتشغيل. أي سجل لا يمر ببوابات المراجعة كلها يبقى
            محظورًا ولا يظهر للجمهور.
          </p>
          <ul>
            <li>حقوق غير معروفة: {counts.rightsUnknown} سجل</li>
            <li>تضمين غير مختبر: {counts.embeddingUntested} سجل</li>
            <li>مراجعة تحريرية معلّقة: {counts.editorialPending} سجل</li>
          </ul>
          <p className={styles.adminNote}>
            ملاحظة: خط الترقية الحالي (promote-kids-media) يغطي كتالوج الأطفال
            فقط؛ سجلات السيرة والميديا تنتظر خط ترقية مخصصًا قبل أي عرض عام.
          </p>
        </section>
      ) : null}

      <MediaReviewTable
        records={filtered}
        totalCount={counts.total}
        approvedCount={counts.approved}
        pendingCount={counts.pending}
        onOpenSource={openSource}
      />
    </div>
  );
}
