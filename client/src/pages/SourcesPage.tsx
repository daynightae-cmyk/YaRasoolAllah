import InstitutionShell from "@/components/Institution/InstitutionShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  providerResourceRegistry,
  rightsLedger,
  sourceRegistry,
} from "@shared/source-registry";
import type {
  RightsDecision,
} from "@shared/source-governance";
import { ShieldCheck, BookOpen, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const EDITORIAL_LABELS: Record<string, { ar: string; tone: string }> = {
  verified: { ar: "موثق", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  editorial_review_pending: { ar: "قيد المراجعة التحريرية", tone: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" },
  rights_review_pending: { ar: "قيد مراجعة الحقوق", tone: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  blocked: { ar: "محظور", tone: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

const RIGHTS_LABELS: Record<RightsDecision, string> = {
  cleared: "مسموح وفق السجل الحالي",
  api_only: "استخدام عبر API فقط",
  reference_only: "فهرسة ورابط خارجي فقط",
  development_only: "عينة تطوير فقط",
  needs_review: "مراجعة الحقوق مطلوبة",
  blocked: "الاستخدام محظور",
};

function editorialLabel(status: string) {
  return EDITORIAL_LABELS[status] ?? EDITORIAL_LABELS.editorial_review_pending;
}

export default function SourcesPage() {
  return (
    <InstitutionShell activeWing="source-registry">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
        {/* Header */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 border border-slate-700/60 text-white shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-tajawal text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>سجل التوثيق والحقوق — يُقرأ من سجل المصادر الحي، لا من نسخة عرض</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-amiri font-bold tracking-tight">
            خزانة المصادر
          </h1>
          <p className="text-sm md:text-base font-tajawal text-slate-300 max-w-2xl leading-relaxed">
            كل مورد في المنصة — نصًا كان أو فهرسًا أو تسجيلًا أو واجهة — له سجل مصدر
            وقرار حقوق ومورد مزود. ما لم يُستكمل سجله يبقى قيد المراجعة ولا يُعتمد.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-white/10">{sourceRegistry.length} مصادر</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10">{rightsLedger.length} قرارات حقوق</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10">{providerResourceRegistry.length} موارد مزودين</span>
          </div>
        </div>

        {/* Source registry */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-xl font-amiri font-bold text-foreground">سجل المصادر</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sourceRegistry.map((s) => {
              const label = editorialLabel(s.editorialStatus);
              return (
                <Card key={s.sourceId} className="rounded-2xl">
                  <CardContent className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className={cn("text-[11px] font-tajawal", label.tone)}>
                        {label.ar}
                      </Badge>
                      <span className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                        {s.sourceId}
                      </span>
                    </div>
                    <h3 className="font-cairo font-bold text-sm text-foreground">{s.title}</h3>
                    <p className="text-xs font-tajawal text-muted-foreground">
                      المزود: {s.provider} · النوع: {s.kind}
                    </p>
                    <p className="text-xs font-tajawal text-muted-foreground leading-relaxed">
                      {s.notes}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground" dir="ltr">
                      checked_at: {s.checkedAt}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Rights ledger */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <h2 className="text-xl font-amiri font-bold text-foreground">سجل الحقوق</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rightsLedger.map((r) => (
              <Card key={r.rightsId} className="rounded-2xl">
                <CardContent className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-cairo font-bold text-foreground">
                      {RIGHTS_LABELS[r.decision]}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                      {r.rightsId}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                    source: {r.sourceId}
                  </p>
                  <p className="text-xs font-tajawal text-muted-foreground leading-relaxed">
                    {r.reviewNote}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Provider resources */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
            <h2 className="text-xl font-amiri font-bold text-foreground">موارد المزودين</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providerResourceRegistry.map((res) => (
              <Card key={res.resourceId} className="rounded-2xl">
                <CardContent className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-cairo font-bold text-foreground">
                      {res.provider} · {res.resourceType}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-tajawal",
                        res.productionReady
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-muted-foreground",
                      )}
                    >
                      {res.productionReady ? "معتمد للإنتاج" : "غير معتمد للإنتاج"}
                    </Badge>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                    {res.resourceId} · {res.acquisitionStatus}
                  </p>
                  <p className="text-xs font-tajawal text-muted-foreground">
                    الاستخدامات المسجلة:{" "}
                    {res.allowedUsages.length ? res.allowedUsages.join("، ") : "لا يوجد — مغلق"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </InstitutionShell>
  );
}
