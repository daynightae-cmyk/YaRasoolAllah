import type { MediaDiscoveryRecord } from "@/visual-golden/services/media/types";
import {
  isMediaGatePassed,
  isMediaRecordApproved,
  MEDIA_REVIEW_GATE_LABELS,
  type MediaReviewGateKey,
} from "@/visual-golden/services/media/review-gates";
import styles from "./MediaReviewTable.module.css";

function GateChip({ label, status, passed }: { label: string; status: string; passed: boolean }) {
  return (
    <span
      className={`${styles.gateChip} ${passed ? styles.gateOk : styles.gateBlocked}`}
      title={`${label}: ${status}`}
    >
      {label}
    </span>
  );
}

function blockReason(record: MediaDiscoveryRecord): string {
  const reasons: string[] = [];
  if (!isMediaGatePassed("rights_status", record.rights_status)) {
    reasons.push("الحقوق غير محسومة — يتطلب إذنًا من صاحب الحقوق أو توثيق ترخيص قبل النشر");
  }
  if (!isMediaGatePassed("embedding_status", record.embedding_status)) {
    reasons.push("التضمين غير مختبر — يتطلب اختبار التشغيل الفعلي على نطاق المشروع");
  }
  if (!isMediaGatePassed("editorial_status", record.editorial_status)) reasons.push("المراجعة التحريرية معلقة");
  if (!isMediaGatePassed("religious_review_status", record.religious_review_status)) reasons.push("المراجعة الدينية معلقة");
  if (!isMediaGatePassed("depiction_review_status", record.depiction_review_status)) reasons.push("مراجعة التصوير معلقة");
  if (!isMediaGatePassed("publication_status", record.publication_status)) reasons.push("النشر غير معتمد");
  if (reasons.length === 0) return "مؤهل للمراجعة النهائية";
  return reasons.join(" · ");
}

export function MediaReviewTable({
  records,
  totalCount,
  approvedCount,
  pendingCount,
  onOpenSource,
}: {
  records: MediaDiscoveryRecord[];
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  onOpenSource: (url: string) => void;
}) {
  const gates = Object.keys(MEDIA_REVIEW_GATE_LABELS) as MediaReviewGateKey[];

  return (
    <section className={styles.reviewTable} aria-label="جدول مراجعة الوسائط المستوردة">
      <div className={styles.tableHead}>
        <h2>مراجعة سجلات الوسائط المستوردة</h2>
        <p>
          جميع السجلات بحالة discovery. لا يُعرض أي منها للتشغيل العام حتى تمر بكل
          بوابات المراجعة وتُعتمد من قبل المشرف.
        </p>
      </div>

      <div className={styles.tableScroller} tabIndex={0} aria-label="جدول قابل للتمرير الأفقي">
        <table className={styles.table} role="grid" aria-label="سجلات الوسائط">
          <thead>
            <tr>
              <th>الفيديو</th>
              <th>الفئة</th>
              <th>الناشر / القناة</th>
              <th>البوابات</th>
              <th>الحالة العامة</th>
              <th>سبب الحظر</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const isBlocked = !isMediaRecordApproved(record);
              const title = record.title_ar ?? record.title_original ?? "(بدون عنوان)";
              return (
                <tr key={record.id} className={isBlocked ? styles.rowBlocked : styles.rowOk}>
                  <td className={styles.cellTitle}>
                    <div className={styles.titleWrap}>
                      <strong>{title}</strong>
                      {record.series_name ? <span className={styles.series}>{record.series_name}</span> : null}
                      {record.episode_number ? <span className={styles.episode}>الحلقة {record.episode_number}</span> : null}
                      <small className={styles.lang}>{record.language ?? "-"}</small>
                    </div>
                  </td>
                  <td className={styles.cellCategory}>
                    {record.category ?? "-"}
                    {record.subcategory ? ` · ${record.subcategory}` : null}
                  </td>
                  <td className={styles.cellPublisher}>
                    <strong>{record.channel_name ?? "-"}</strong>
                    <br />
                    <small>{record.channel_url ?? "-"}</small>
                  </td>
                  <td className={styles.cellGates}>
                    {gates.map((gate) => (
                      <GateChip
                        key={gate}
                        label={MEDIA_REVIEW_GATE_LABELS[gate]}
                        status={String(record[gate] ?? "-")}
                        passed={isMediaGatePassed(gate, record[gate])}
                      />
                    ))}
                  </td>
                  <td className={styles.cellStatus}>
                    <span className={isBlocked ? styles.statusBlocked : styles.statusOk}>
                      {record.publication_status ?? "DRAFT"}
                    </span>
                    {record.rights_status === "UNKNOWN" ? <span className={styles.tagUnknown}>الحقوق غير معروفة</span> : null}
                    {record.embedding_status === "UNTESTED" ? <span className={styles.tagUntested}>التضمين غير مختبر</span> : null}
                  </td>
                  <td className={styles.cellReason}>{blockReason(record)}</td>
                  <td className={styles.cellAction}>
                    {record.official_url ? (
                      <button
                        type="button"
                        className={styles.btnSource}
                        onClick={() => onOpenSource(record.official_url!)}
                        aria-label={`فتح مصدر الفيديو: ${title}`}
                      >
                        المصدر الأصلي
                        <span aria-hidden="true">↗</span>
                      </button>
                    ) : (
                      <button type="button" className={styles.btnSource} disabled>
                        رابط المصدر غير متاح
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  لا توجد سجلات مطابقة للمرشحات الحالية. عدّل البحث أو الفئة أو الحالة.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <p>
          <strong>{records.length}</strong> سجل معروض · <strong>{totalCount}</strong> في الكتالوج ·{" "}
          <strong>{approvedCount}</strong> معتمد للعرض العام · <strong>{pendingCount}</strong> معلّق للمراجعة
        </p>
        <p className={styles.note}>
          تنبيه: عرض رابط المصدر لا يُعتبر موافقة على تضمين الفيديو أو إعادة نشره.
          التضمين الرسمي فقط بعد اختبار التشغيل الفعلي واعتماد الحقوق من المشرف.
        </p>
      </div>
    </section>
  );
}
