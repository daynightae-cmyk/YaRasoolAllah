import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgress } from "../contexts/ProgressContext";
import { CirclePlus, RotateCcw, ShieldAlert, DatabaseZap } from "lucide-react";
import InstitutionShell from "@/components/Institution/InstitutionShell";

export default function DailyRemindersPage() {
  const { updateLastVisited } = useProgress();
  const [tasbihCount, setTasbihCount] = useState(0);

  useEffect(() => {
    updateLastVisited("/daily");
  }, [updateLastVisited]);

  return (
    <InstitutionShell activeWing="daily-sanctuary">
    <div className="institution-page institution-page--daily">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="wing-hero wing-hero--daily text-center">
          <div className="wing-hero__eyebrow mx-auto">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            <span>محراب اليوم · سكينة بلا نقاط أو منافسة</span>
          </div>
          <h1>
            الذكر اليومي
          </h1>
          <p className="mx-auto max-w-prose-ar">
            أداة العد المحلية متاحة أدناه. أما نصوص الأذكار وفضائلها فمتوقفة مؤقتًا حتى
            يُربط كل سجل بمصدره، ومرجعه، ودرجة الحديث أو مقيّمه، وحالة المراجعة التحريرية.
          </p>
          <div className="daily-source-line">
            <span>المواقيت عند عرضها: AlAdhan API</span>
            <span>طريقة الحساب يجب أن تظهر للمستخدم</span>
            <a href="https://aladhan.com/calculation-methods" target="_blank" rel="noreferrer">منهج الحساب</a>
          </div>
        </header>

        <Card className="relative overflow-hidden border-emerald-800/30 bg-gradient-to-br from-emerald-950 to-emerald-800 text-white">
          <CardContent className="relative space-y-7 p-5 text-center sm:p-8">
            <div className="space-y-2">
              <h2 className="font-amiri text-2xl font-bold">عداد تسبيح محلي</h2>
              <p className="text-xs leading-6 text-emerald-100">
                يعمل على جهازك فقط ولا يسجل بيانات شخصية أو يرسلها إلى مزوّد خارجي.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <strong className="block text-4xl text-amber-300">{tasbihCount}</strong>
                <span className="text-sm text-emerald-100">العدد الحالي</span>
              </div>
              <div>
                <strong className="block text-4xl text-amber-300">
                  {Math.floor(tasbihCount / 33)}
                </strong>
                <span className="text-sm text-emerald-100">الدورات المكتملة</span>
              </div>
              <div>
                <strong className="block text-4xl text-amber-300">
                  {tasbihCount % 33 === 0 && tasbihCount > 0 ? 0 : 33 - (tasbihCount % 33)}
                </strong>
                <span className="text-sm text-emerald-100">حتى 33</span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => setTasbihCount((count) => count + 1)}
                className="w-full gap-2 bg-amber-500 text-base font-bold text-slate-950 hover:bg-amber-400 sm:w-auto"
              >
                <CirclePlus className="h-5 w-5" aria-hidden="true" />
                زيادة العداد
              </Button>
              <Button
                type="button"
                onClick={() => setTasbihCount(0)}
                variant="outline"
                className="w-full gap-2 border-white/60 bg-transparent text-white hover:bg-white hover:text-emerald-950 sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                إعادة التعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        <section
          className="rounded-2xl border border-amber-500/30 bg-amber-50/70 p-5 text-right dark:bg-amber-950/20 sm:p-6"
          aria-labelledby="adhkar-status-title"
        >
          <div className="flex items-start gap-3">
            <DatabaseZap className="mt-1 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
            <div className="space-y-2">
              <h2 id="adhkar-status-title" className="font-cairo text-base font-bold text-foreground">
                مجموعة الأذكار: قيد المراجعة وغير منشورة
              </h2>
              <p className="font-tajawal text-sm leading-7 text-muted-foreground">
                لا تُعرض حاليًا ملفات JSON مجهولة المصدر، ولا فضائل أو أعداد بلا عزو. يلزم قبل
                النشر: معرف مصدر، موضع الحديث أو الأثر، المقيّم عند وجود درجة، قرار الحقوق،
                وحالة مراجعة بشرية لكل سجل.
              </p>
              <p className="font-mono text-[11px] text-amber-800 dark:text-amber-200" dir="ltr">
                BLOCKED: provenance + grade attribution + rights review
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
    </InstitutionShell>
  );
}
