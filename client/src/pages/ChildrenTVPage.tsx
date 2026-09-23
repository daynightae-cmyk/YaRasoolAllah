import { useMemo, useState } from "react";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import { childrenAdaptationRegistry } from "@shared/knowledge-registry";
import {
  BookHeart,
  Feather,
  HeartHandshake,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ageLabels = {
  all: "كل الأعمار",
  "6-8": "6–8 سنوات",
  "9-12": "9–12 سنة",
  "13-15": "13–15 سنة",
};

export default function ChildrenTVPage() {
  const [ageBand, setAgeBand] = useState<keyof typeof ageLabels>("all");
  const [selectedId, setSelectedId] = useState(childrenAdaptationRegistry[0].adaptationId);
  const items = useMemo(
    () => childrenAdaptationRegistry.filter((item) => ageBand === "all" || item.ageBand === ageBand),
    [ageBand],
  );
  const selected = childrenAdaptationRegistry.find((item) => item.adaptationId === selectedId) ?? items[0];

  return (
    <InstitutionShell activeWing="family">
      <div className="institution-page institution-page--children">
        <section className="wing-hero wing-hero--children" aria-labelledby="children-title">
          <div className="wing-hero__eyebrow"><Sparkles className="h-4 w-4" /> واحة التعلّم الأصلي</div>
          <div className="wing-hero__grid">
            <div>
              <h1 id="children-title">واحة الأسرة والطفل</h1>
              <p>حكايات وأنشطة أصلية للمنصة، دافئة وذكية، تربط المعنى بمصدره من دون تحويل التكييف التربوي إلى اقتباس ديني أو تمثيل للنبي محمد ﷺ.</p>
            </div>
            <div className="wing-hero__ledger">
              <span><strong>{childrenAdaptationRegistry.length}</strong> مواد أصلية</span>
              <span><strong>0</strong> فيديو طرف ثالث معروض</span>
              <span><strong>100%</strong> مرتبطة بمصادر</span>
            </div>
          </div>
        </section>

        <section className="children-method" aria-label="ميثاق الطفل">
          <div><ShieldCheck className="h-5 w-5" /><strong>لا تجسيد نبوي</strong><span>لا صورة ولا شخصية بديلة</span></div>
          <div><BookHeart className="h-5 w-5" /><strong>تكييف معلن</strong><span>ليس اقتباساً مباشراً</span></div>
          <div><SearchCheck className="h-5 w-5" /><strong>مصادر ظاهرة</strong><span>معرّفات قابلة للفحص</span></div>
          <div><HeartHandshake className="h-5 w-5" /><strong>مراجعة قبل النشر</strong><span>تحريرية وعلمية</span></div>
        </section>

        <section className="children-studio">
          <div className="children-studio__filters" aria-label="فئة العمر">
            {(Object.keys(ageLabels) as Array<keyof typeof ageLabels>).map((age) => (
              <button key={age} type="button" onClick={() => setAgeBand(age)} className={cn("editorial-tab", ageBand === age && "is-active")}>{ageLabels[age]}</button>
            ))}
          </div>
          <div className="children-studio__grid">
            <div className="children-story-list">
              {items.map((item, index) => (
                <button key={item.adaptationId} type="button" onClick={() => setSelectedId(item.adaptationId)} className={cn("children-story", selected?.adaptationId === item.adaptationId && "is-active")}>
                  <span className="children-story__number">{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{item.titleAr}</strong><small>{ageLabels[item.ageBand]}</small></span>
                  <Feather className="h-4 w-4" />
                </button>
              ))}
              {!items.length && <p className="empty-state">لا توجد مواد في هذه الفئة بعد.</p>}
            </div>

            {selected && (
              <article className="children-reading-nook">
                <span className="children-reading-nook__label">تكييف تعليمي أصلي للمنصة · ليس اقتباساً مباشراً</span>
                <h2>{selected.titleAr}</h2>
                <p>{selected.summaryAr}</p>
                <dl>
                  <div><dt>الفئة العمرية</dt><dd>{ageLabels[selected.ageBand]}</dd></div>
                  <div><dt>المصادر</dt><dd dir="ltr">{selected.sourceIds.join(" · ")}</dd></div>
                  <div><dt>الحالة التحريرية</dt><dd>{selected.editorialStatus}</dd></div>
                  <div><dt>المراجعة العلمية</dt><dd>{selected.reviewStatus}</dd></div>
                </dl>
                <div className="children-reading-nook__notice"><ShieldCheck className="h-4 w-4" /> لا يُنسب نص هذه البطاقة إلى القرآن أو الحديث؛ هو صياغة تربوية أصلية تنتظر المراجعة.</div>
              </article>
            )}
          </div>
        </section>
      </div>
    </InstitutionShell>
  );
}
