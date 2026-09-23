import { Link } from "wouter";
import { BRAND } from "@/config/brand";
import { BookOpen, ExternalLink, Feather, Library, ShieldCheck } from "lucide-react";

const wings = [
  ["/who-is-muhammad", "من هو محمد ﷺ؟"],
  ["/seerah", "درب السيرة"],
  ["/quran", "رِواق القرآن"],
  ["/sunnah", "دار الحديث"],
  ["/library", "مكتبة الرفوف"],
  ["/kids", "واحة الأسرة"],
  ["/prophetic-day", "محراب اليوم"],
] as const;

export default function InstitutionalFooter() {
  return (
    <footer className="institution-footer">
      <div className="institution-footer__arch" aria-hidden="true" />
      <div className="institution-footer__inner">
        <section className="institution-footer__statement">
          <div className="institution-footer__seal">ﷺ</div>
          <div>
            <p className="institution-footer__eyebrow">خاتمة الرواق</p>
            <h2>{BRAND.name.ar}</h2>
            <p>{BRAND.tagline.ar}</p>
          </div>
          <blockquote>«وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ» <cite>الأنبياء: 107</cite></blockquote>
        </section>

        <section className="institution-footer__catalog" aria-label="أروقة المعرفة">
          <div className="institution-footer__index">
            <span>01—07</span>
            <h3>أروقة المعرفة</h3>
            <p>مسار واحد بين السيرة والنص والمصدر، لا صفحات منفصلة بلا سياق.</p>
          </div>
          <nav>
            {wings.map(([href, label], index) => (
              <Link key={href} href={href}><span>{String(index + 1).padStart(2, "0")}</span>{label}</Link>
            ))}
          </nav>
        </section>

        <section className="institution-footer__method">
          <div>
            <ShieldCheck className="h-5 w-5" />
            <h3>منهجية المصدر</h3>
            <p>نفصل بين العمل والنسخة والطبعة والمزوّد وقرار الحقوق. النقص يظهر بوضوح ولا يُقدّم كاعتماد.</p>
            <Link href="/sources">افتح خزانة المصادر <ExternalLink className="h-3.5 w-3.5" /></Link>
          </div>
          <div>
            <BookOpen className="h-5 w-5" />
            <h3>الحقوق والنسبة</h3>
            <p>لا تنزيل، ولا نص كامل، ولا وسيط تاريخي يدخل الإنتاج من دون حالة إتاحة ودليل حقوق على مستوى المورد.</p>
            <Link href="/library">افحص سجل الأعمال <Library className="h-3.5 w-3.5" /></Link>
          </div>
          <div>
            <Feather className="h-5 w-5" />
            <h3>تصحيح أو مساهمة</h3>
            <p>للتصحيح العلمي أو الإبلاغ عن نسبة أو حق غير دقيق، استخدم قناة المشروع المعلنة.</p>
            <a href={`mailto:${BRAND.contactEmail}?subject=Ya%20Rasool%20Allah%20source%20correction`}>{BRAND.contactEmail}</a>
          </div>
        </section>

        <div className="institution-footer__notice">
          <ShieldCheck className="h-4 w-4" />
          <p>{BRAND.nonPersonificationNotice.ar}</p>
          <span>{BRAND.nonPersonificationNotice.en}</span>
        </div>

        <div className="institution-footer__base">
          <p>© {BRAND.currentYear} {BRAND.name.ar} · صرح معرفي مستقل بلا إعلانات أو تجسيد.</p>
          <p>التنفيذ التقني <strong>KNOUX</strong> · {BRAND.domain}</p>
        </div>
      </div>
    </footer>
  );
}
