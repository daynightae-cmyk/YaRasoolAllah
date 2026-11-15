import type { MediaDiscoveryRecord } from "@/visual-golden/services/media/types";
import styles from "./MediaReviewTable.module.css";

function GateChip({ label, status }: { label: string; status: string }) {
  const blocked =
    status !== "approved" && status !== "APPROVED" && status !== "verified";
  return (
    <span
      className={`${styles.gateChip} ${blocked ? styles.gateBlocked : styles.gateOk}`}
      title={`${label}: ${status}`}
    >
      {label}
    </span>
  );
}

function blockReason(record: MediaDiscoveryRecord): string {
  const reasons: string[] = [];
  if (record.rights_status === "UNKNOWN") {
    reasons.push(
      "الحقوق غير معروفة — يتطلب إذنًا من صاحب الحقوق أو توثيق ترخيص قبل النشر",
    );
  }
  if (record.embedding_status === "UNTESTED") {
    reasons.push(
      "التضمين غير مختبر — يتطلب اختبار التشغيل الفعلي على نطاق المشروع",
    );
  }
  if (record.editorial_status !== "APPROVED" && record.editorial_status !== "approved") {
    reasons.push("المراجعة التحريرية معلقة");
  }
  if (
    record.religious_review_status !== "APPROVED" &&
    record.religious_review_status !== "approved"
  ) {
    reasons.push("المراجعة الدينية معلقة");
  }
  if (
    record.depiction_review_status !== "APPROVED" &&
    record.depiction_review_status !== "approved"
  ) {
    reasons.push("مراجعة التصوير معلقة");
  }
  if (record.publication_status !== "APPROVED" && record.publication_status !== "approved") {
    reasons.push("النشر غير معتمد");
  }
  if (reasons.length === 0) return "مؤهل للمراجعة النهائية";
  return reasons.join(" · ");
}

export function MediaReviewTable({
  records,
  onOpenSource,
}: {
  records: MediaDiscoveryRecord[];
  onOpenSource: (url: string) => void;
}) {
  const gates: Array<{ key: keyof MediaDiscoveryRecord; label: string }> = [
    { key: "publisher_status", label: "الناشر" },
    { key: "rights_status", label: "الحقوق" },
    { key: "embedding_status", label: "التضمين" },
    { key: "editorial_status", label: "التحرير" },
    { key: "religious_review_status", label: "المراجعة الدينية" },
    { key: "depiction_review_status", label: "التصوير" },
    { key: "publication_status", label: "النشر" },
  ];

  const blockedCount = records.filter(
    (r) => r.publication_status !== "APPROVED" && r.publication_status !== "approved",
  ).length;

  return (
    <section className={styles.reviewTable} aria-label="جدول مراجعة الوسائط المستوردة">
      <div className={styles.tableHead}>
        <h2>مراجعة سجلات الوسائط المستوردة</h2>
        <p>
          جميع السجلات بحالة DRAFT / PENDING_REVIEW. لا يُعرض أي منها للتشغيل
          العام حتى تمر بكل بوابات المراجعة وتُعتمد من قبل المشرف.
        </p>
      </div>

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
            const isBlocked =
              record.publication_status !== "APPROVED" &&
              record.publication_status !== "approved";
            const title = record.title_ar ?? record.title_original ?? "(بدون عنوان)";
            return (
              <tr key={record.id} className={isBlocked ? styles.rowBlocked : styles.rowOk}>
                <td className={styles.cellTitle}>
                  <div className={styles.titleWrap}>
                    <strong>{title}</strong>
                    {record.series_name ? (
                      <span className={styles.series}>{record.series_name}</span>
                    ) : null}
                    {record.episode_number ? (
                      <span className={styles.episode}>الحلقة {record.episode_number}</span>
                    ) : null}
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
                      key={gate.key}
                      label={gate.label}
                      status={String(record[gate.key] ?? "-")}
                    />
                  ))}
                </td>
                <td className={styles.cellStatus}>
                  <span className={isBlocked ? styles.statusBlocked : styles.statusOk}>
                    {record.publication_status ?? "DRAFT"}
                  </span>
                  {record.rights_status === "UNKNOWN" && (
                    <span className={styles.tagUnknown}>الحقوق غير معروفة</span>
                  )}
                  {record.embedding_status === "UNTESTED" && (
                    <span className={styles.tagUntested}>
                      التضمين غير مختبر
                    </span>
                  )}
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
        </tbody>
      </table>

      <div className={styles.footer}>
        <p>
          <strong>{records.length}</strong> سجل مستورد · {"0"} معتمد للعرض العام ·
          {blockedCount} معلّق للمراجعة
        </p>
        <p className={styles.note}>
          تنبيه: عرض رابط المصدر لا يُعتبر موافقة على تضمين الفيديو أو إعادة نشره.
          التضمين الرسمي فقط بعد اختبار التشغيل الفعلي واعتماد الحقوق من المشرف.
        </p>
      </div>
    </section>
  );
}
