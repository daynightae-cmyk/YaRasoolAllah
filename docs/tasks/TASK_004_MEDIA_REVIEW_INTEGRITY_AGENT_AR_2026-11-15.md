# مهمة الوكيل 004 — سلامة مراجعة الوسائط والاستيراد الحتمي

## 1. هوية المهمة

**اسم المهمة:** التحقق والتنفيذ الآمن لسطح مراجعة الوسائط وكتالوج الاكتشاف

**المشروع:** يا رسول الله ﷺ — Ya Rasool Allah

**الجذر المسموح:**

`K:\Knoux Projects\YaRasoolAllah\Base`

**الفرع الأساسي:** `main`

**SHA الأساسي الواجب إعادة التحقق منه قبل أي تعديل:**

`df4880589016aa4681b6d43233ecc136f4e32238`

**الأولوية:** P1 — سلامة المحتوى والحقوق والوظيفة

**الحالة عند إنشاء المهمة:** READY — لا تبدأ المهمة إلا بعد إعادة فحص SHA وحالة Git.

**المالك:** وكيل تنفيذ واحد فقط. لا توجد ملكية متوازية لأي ملف من الملفات المشتركة المذكورة أدناه.

---

## 2. خلفية موثقة يجب فهمها قبل التنفيذ

أضيف في آخر نسخة محلية من `main` نظام اكتشاف وسائط يتكون من:

- مصادر CSV وJSON تحت:
  - `data-sources/media/acquisition/kids-media-catalog.csv`
  - `data-sources/media/acquisition/kids-media-catalog.json`
  - `data-sources/media/acquisition/seerah-media-catalog.csv`
  - `data-sources/media/acquisition/seerah-media-catalog.json`
  - `data-sources/media/acquisition/media-rights-ledger.csv`
  - `data-sources/media/acquisition/media-rejected-and-pending.csv`
- مخطط للبيانات:
  - `data-sources/media/acquisition/media-catalog.schema.json`
- برنامج دمج واستيراد:
  - `scripts/acquire/ingest-media-catalog.ts`
- مخرجات طبقة الاكتشاف:
  - `data-sources/media/discovery/media-discovery-catalog.json`
  - `data-sources/media/discovery/ingestion-manifest.json`
  - `data-sources/media/discovery/ingestion-report.md`
- بيانات مولدة للواجهة:
  - `client/src/visual-golden/data/media-discovery.generated.ts`
- صفحة مراجعة داخلية:
  - `client/src/visual-golden/pages/MediaReviewPage.tsx`
  - `client/src/visual-golden/pages/MediaReviewPage.module.css`
  - `client/src/visual-golden/components/media/MediaReviewTable.tsx`
  - `client/src/visual-golden/components/media/MediaReviewTable.module.css`
- تعريف النوع:
  - `client/src/visual-golden/services/media/types.ts`
- المسار العام للواجهة:
  - `/media-review`
  - تعريفه في `client/src/App.tsx`

الحد الأمني والشرعي المقصود في التصميم هو أن هذه الطبقة **اكتشاف ومراجعة فقط** وليست طبقة نشر أو تشغيل عام. يجب أن تظل قيمة `approvedForPublicDisplay` مساوية للصفر ما لم توجد عملية اعتماد مستقلة وموثقة. لا يجوز للواجهة أن تمنح اعتماداً بمجرد تفعيل وضع المشرف أو الضغط على زر أو تغيير قيمة محلية في `sessionStorage`.

التحليل السابق سجل أن الكتالوج الحالي متوقع أن يحتوي على 95 سجلاً، وأن عدد السجلات المعتمدة للعرض العام يساوي 0. هذه أرقام يجب التحقق منها بالأوامر، وليست حقيقة يجوز افتراضها دون إعادة توليد وفحص.

---

## 3. الهدف التنفيذي

تحقق من أن خط الاستيراد وصفحة `/media-review`:

1. تعيدان إنتاج نفس الكتالوج والبيانات الوصفية عند تشغيلهما من نفس المصادر.
2. لا تفقدان معلومات المصدر أو الحقوق أو حالة المراجعة.
3. لا تخلطان بين الاكتشاف، والمراجعة، والاعتماد، والنشر العام، والتشغيل.
4. تعرضان الحالات المعلقة بصدق وبالعربية، دون تقديم زر أو واجهة توحي بقدرة غير موجودة.
5. تدعمان البحث والتصفية بطريقة حتمية وقابلة للاختبار.
6. تمنعان حالات البيانات المكررة أو الروابط غير الصحيحة أو حالات النشر غير المصرح بها.
7. تضيفان اختبارات رجوع صغيرة ومحددة بدلاً من إعادة تصميم النظام.

هذه المهمة ليست مهمة إضافة مزود فيديو، وليست مهمة تشغيل YouTube، وليست مهمة اعتماد حقوق، وليست مهمة نشر محتوى الأطفال أو السيرة. أي احتياج إلى مفاتيح خارجية أو قرار مالك أو مراجعة حقوقية يجب تسجيله كحاجز خارجي، لا تجاوزه.

---

## 4. بروتوكول البدء الإلزامي

قبل فتح أي ملف للتعديل، نفّذ وسجّل النتائج:

```powershell
Set-Location 'K:\Knoux Projects\YaRasoolAllah\Base'
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short --ignored
git worktree list --porcelain
git diff --name-status
```

شروط البدء:

- يجب أن يكون الجذر هو المسار canonical أعلاه.
- يجب أن تكون على `main` أو على فرع عمل مخصص مشتق من SHA الحالي دون إعادة ضبط الفرع الأصلي.
- يجب أن تعيد التحقق من أن ملفات الأدلة البصرية المعدلة مسبقاً ما زالت موجودة ولم تتغير بسبب هذه المهمة.
- لا تلمس هذه الملفات إطلاقاً:
  - `artifacts/visual-evidence/audio-1440-dark-rtl.jpg`
  - `artifacts/visual-evidence/children-1440-dark-ltr.jpg`
  - `artifacts/visual-evidence/children-360-light-rtl.jpg`
  - `artifacts/visual-evidence/daily-360-dark-ltr.jpg`
  - `artifacts/visual-evidence/daily-768-light-rtl.jpg`
  - `artifacts/visual-evidence/daily-verse-honesty-1440-dark-rtl.jpg`
  - `artifacts/visual-evidence/hadith-1440-light-rtl.jpg`
  - `artifacts/visual-evidence/seerah-1440-dark-rtl.jpg`
- لا تستخدم `git reset --hard` أو `git clean` أو `git checkout --` أو حذفاً يدوياً.

إذا وجدت تعديلاً نشطاً في أحد الملفات المسموح بها، أوقف المهمة في ذلك الملف وسجّل `BLOCKED_POLICY` بدلاً من دمج التغييرات أو الكتابة فوقها.

---

## 5. نطاق الملفات المسموح به

### ملفات يمكن تعديلها

يسمح بالتعديل فقط ضمن النطاق التالي، وبعد تحديد الحاجة بدقة:

- `scripts/acquire/ingest-media-catalog.ts`
- ملف اختبار جديد محدود النطاق مثل:
  - `scripts/media-review-integrity.test.ts`
  - أو اسم اختبار أقرب إلى convention المشروع
- `package.json` فقط لإضافة ملف الاختبار إلى `test:p0` إذا كان ذلك ضرورياً.
- ملف المهمة/الدفتر الحالي لتسجيل الأدلة، دون تعديل التقارير التاريخية.

### ملفات يمكن قراءتها ولا يجوز تعديلها إلا إذا أثبت الاختبار وجود خلل ضروري

- `client/src/visual-golden/pages/MediaReviewPage.tsx`
- `client/src/visual-golden/pages/MediaReviewPage.module.css`
- `client/src/visual-golden/components/media/MediaReviewTable.tsx`
- `client/src/visual-golden/components/media/MediaReviewTable.module.css`
- `client/src/visual-golden/services/media/types.ts`
- `client/src/App.tsx`
- ملفات CSV وJSON وسجل الحقوق والمخطط تحت `data-sources/media/`

أي تعديل في هذه المجموعة يحتاج سبباً واضحاً، واختبار رجوع، وشرحاً في التسليم. لا تغيّر بيانات الحقوق أو حالات الاعتماد لمجرد جعل الاختبار يمر.

### ملفات محمية من الكتابة المتزامنة

- `client/src/App.tsx`
- `package.json`
- `package-lock.json`
- مسجل المسارات والقشرة البصرية
- `data-sources/media/acquisition/media-rights-ledger.csv`
- `data-sources/media/acquisition/media-catalog.schema.json`
- جميع الصور المعدلة مسبقاً تحت `artifacts/visual-evidence/`

---

## 6. خطوات التنفيذ المطلوبة

### المرحلة A — فحص الاستيراد الحالي

شغّل:

```powershell
npm run ingest:media
```

وسجّل:

- رمز الخروج.
- العدد الكلي للسجلات الفريدة.
- عدد المكررات التي تم تخطيها.
- عدد السجلات `approved`.
- عدد السجلات المعلقة أو المحظورة.
- توزيع السجلات حسب الفئة وحالة الحقوق وحالة النشر.
- الملفات التي كتبها الأمر.
- أي تحذير أو تعارض CSV/JSON.

بعدها افحص:

```powershell
Get-Content data-sources/media/discovery/ingestion-manifest.json
Get-Content data-sources/media/discovery/ingestion-report.md
```

إذا تغيرت الملفات المولدة، لا تعتبر ذلك نجاحاً تلقائياً. قارن سبب التغير، والعدد، والحقول، ووقت التوليد، وتأكد أن التغير ليس ناتجاً عن إدخال وقت غير حتمي أو ترتيب غير ثابت.

### المرحلة B — اختبار الحتمية

نفذ الاستيراد مرتين متتاليتين من نفس المصدر. قارن المحتوى الدلالي للملفات الناتجة، مع تجاهل `generatedAt` فقط إذا كان هذا الحقل مصمماً زمنياً ولا يؤثر في البيانات أو الهاش.

استخدم مقارنة واضحة، مثلاً:

```powershell
$before = Get-Content data-sources/media/discovery/media-discovery-catalog.json -Raw
npm run ingest:media
$after = Get-Content data-sources/media/discovery/media-discovery-catalog.json -Raw
if ($before -ne $after) { Write-Output 'NON_DETERMINISTIC'; exit 1 }
```

إذا كان `generatedAt` يجعل المقارنة غير ممكنة، لا تعدّل الاختبار لإخفاء المشكلة؛ عدّل الاختبار ليقارن نسخة canonical من JSON بعد إزالة الحقل الزمني فقط، وسجّل السبب.

تحقق من:

- ثبات ترتيب السجلات.
- ثبات معرفات السجلات.
- عدم وجود `video_id` مكرر ضمن المزوّد نفسه.
- عدم وجود `official_url` مكرر بعد التطبيع.
- عدم تحويل سجل ناقص إلى سجل صالح بصمت.
- عدم استبدال قيمة CSV الموثقة بقيمة JSON غير موثقة.
- عدم ترقية `UNKNOWN` أو `PENDING_REVIEW` إلى `APPROVED` تلقائياً.

### المرحلة C — اختبارات صفحة المراجعة

أضف اختبارات حتمية من دون تشغيل متصفح إذا كان ذلك يتوافق مع بنية الاختبارات الحالية. يجب أن تغطي الاختبارات منطقاً قابلاً للعزل، أو تستخرج منطق التصفية إلى دالة صغيرة غير مرئية للمستخدم إذا لزم ذلك، دون إعادة بناء الصفحة.

يجب أن تغطي الاختبارات على الأقل:

1. البحث في `title_ar`.
2. البحث في `title_original`.
3. البحث في `channel_name` و`series_name` و`speaker` و`subcategory`.
4. تجاهل المسافات الزائدة في البحث.
5. عدم إرجاع سجلات من فئة أخرى عند اختيار category filter.
6. عدم إرجاع سجلات من حالة نشر أخرى عند اختيار status filter.
7. اجتماع البحث والفئة والحالة معاً.
8. البحث العربي باستخدام التطبيع الحالي دون كسر النص العربي.
9. أن البحث الفارغ يعيد كل السجلات.
10. أن قائمة الحالات والفئات لا تنتج عناصر مكررة.
11. أن قيمة `approved` المعروضة مشتقة من البيانات وليست رقماً مكتوباً يدوياً.
12. أن السجلات غير المعتمدة لا تمنح واجهة تشغيل عامة.
13. أن وضع المشرف لا يغير سجل الحقوق أو حالة النشر ولا يكتب اعتماداً.
14. أن رابط المصدر لا يُفتح إلا كرابط مصدر صريح، ولا يتحول إلى ادعاء تشغيل داخل التطبيق.
15. أن حالة عدم وجود نتائج، إن كانت موجودة في المكوّن، قابلة للوصول ومفهومة بالعربية.

إذا اكتشفت أن منطق التصفية غير قابل للاختبار بسبب وجوده داخل الصفحة، اجعل أقل تغيير ممكن لاستخراجه إلى helper محلي، ولا تنقل الحالة إلى store جديد ولا تغيّر تصميم القشرة.

### المرحلة D — التحقق من الأمان والصدق

راجع يدوياً وباختبار نصي:

- لا توجد كلمة أو حالة توحي أن `sessionStorage` يمنح اعتماداً حقيقياً.
- لا توجد قيمة نجاح ثابتة في الواجهة تخالف الكتالوج.
- لا توجد روابط HTTP غير آمنة في البيانات أو helper جديد.
- لا توجد مفاتيح أو أسرار أو رموز وصول في الملفات أو السجلات.
- لا توجد عملية نشر عام ضمن `ingest-media-catalog.ts`.
- لا يتم تحويل `embed_url` غير المختبر إلى تشغيل تلقائي.
- لا يتم عرض السجل للمستخدم العام عبر `/kids` أو أي route عام لمجرد وجوده في discovery catalog.

أي نتيجة مخالفة تعامل كـ BUG منفصل مع مسار الملف، وسطر تقريبي، وخطوات إعادة الإنتاج، ولا تصلحها بتعديل بيانات الحقوق.

### المرحلة E — الاختبارات النهائية

بعد أي تعديل، شغّل بالترتيب:

```powershell
npm run ingest:media
npm run check
npm run lint
npm run test:p0
npm run validate:sources
npm run validate:kids-youtube
npm run build
```

ثم نفّذ:

```powershell
git diff --check
git status --short --ignored
git diff --stat
git diff --name-status
```

يجب أن تكون كل الأوامر الناجحة برمز خروج 0. إذا فشل أمر واحد، سجّل الفشل كما هو ولا تصفه بأنه نجاح جزئي إلا مع تحديد ما نجح وما فشل.

---

## 7. شروط القبول النهائية

تعتبر المهمة `VERIFIED_LOCAL` فقط إذا تحققت الشروط التالية كلها:

- تم إعادة التحقق من المستودع وSHA قبل التنفيذ.
- `npm run ingest:media` نجح.
- عدد السجلات الفريدة والعدد المعتمد والعدد المعلق موثقون من المخرجات الفعلية.
- الاستيراد الحتمي مثبت باختبار أو مقارنة موثقة.
- حالات التكرار والتعارض والروابط غير الصحيحة مغطاة.
- منطق البحث والتصفية مغطى باختبارات رجوع.
- لا توجد ترقية تلقائية إلى `APPROVED`.
- وضع المشرف لا يمنح اعتماداً حقيقياً.
- لا يوجد تشغيل عام أو نشر عام جديد نتيجة المهمة.
- `npm run check` و`npm run lint` و`npm run test:p0` و`npm run validate:sources` و`npm run validate:kids-youtube` و`npm run build` نجحت.
- الملفات المعدلة محصورة في نطاق المهمة.
- الصور الثماني المعدلة مسبقاً لم تتغير.
- لم تُستخدم أو تُطلب أسرار خارجية.
- لم يتم الادعاء بأن المهمة مدمجة أو منشورة أو متحققة على الإنتاج.

إذا تعذر شرط بسبب خدمة أو صلاحية أو قرار مالك، استخدم `BLOCKED_EXTERNAL` أو `BLOCKED_OWNER` مع وصف دقيق، ولا تستخدم `VERIFIED`.

---

## 8. قالب التسليم الإلزامي للوكيل

أرسل التسليم بهذا الشكل:

```text
TASK_ID: TASK_004
STATUS: VERIFIED_LOCAL | PARTIAL | BLOCKED_EXTERNAL | BLOCKED_POLICY
BASE_SHA:
FINAL_SHA:
BRANCH:
WORKTREE:

SUMMARY:
- ما الذي تم تنفيذه؟
- ما الذي كان موجوداً مسبقاً؟
- ما الذي لم يتم تنفيذه ولماذا؟

CHANGED_FILES:
- المسار — سبب التغيير

PROTECTED_FILES_CHECK:
- الصور الثماني: unchanged / changed (مع السبب)
- الحقوق والمصادر: unchanged / changed (مع السبب)

MEDIA_EVIDENCE:
- total unique records:
- approved for public display:
- blocked/pending:
- duplicates skipped:
- deterministic comparison:

TESTS:
- command | exit code | result | note

SECURITY_AND_CONTENT_TRUTH:
- لا أسرار مضافة
- لا اعتماد أو تشغيل أو نشر وهمي
- أي حاجز خارجي:

VISUAL_OR_RUNTIME:
- NOT RUN أو مسارات الأدلة الفعلية فقط

NEXT_SAFE_ACTION:

INTEGRATION_RECOMMENDATION:
- هل يلزم commit؟
- هل يلزم مراجعة مالك؟
- هل يلزم CI أو runtime قبل الدمج؟
```

لا تكتب `DONE` أو `PASS` أو `RELEASED` بصورة عامة. استخدم الحالة الخاصة بكل بوابة، وافصل بين نجاح الاختبارات المحلية وبين الدمج وCI والتشغيل والإنتاج.

---

## 9. حدود صريحة لا يجوز تجاوزها

- لا تضف API خارجياً أو مفتاح YouTube أو خدمة تشغيل.
- لا تعتمد سجلاً لأن عنوانه يبدو صحيحاً.
- لا تعتبر `sessionStorage` آلية صلاحيات.
- لا تغيّر `rights_status` أو `editorial_status` أو `publication_status` لتجاوز اختبار.
- لا تحذف ملفات قديمة أو worktrees أو backups أو caches.
- لا تعدّل الصور المعدلة مسبقاً.
- لا تحدّث `package-lock.json` إلا إذا كان هناك سبب تقني مثبت وموافق عليه.
- لا تدمج فرعاً آخر لمجرد أنه يحتوي على إصلاح مشابه.
- لا تصف `/media-review` بأنه لوحة نشر أو CMS مكتمل؛ هو سطح مراجعة واكتشاف فقط.
- لا تصف الكتالوج بأنه محتوى معتمد أو قابل للتشغيل ما لم توجد أدلة مستقلة لكل حالة.
