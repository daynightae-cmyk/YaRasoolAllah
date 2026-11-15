# البرومبت الشمولي للوكيل — الجيل الثاني
# مشروع يا رسول الله ﷺ — تجربة مؤسسية ثلاثية الأبعاد وبيانات موثقة متعددة المنصات

## تعليمات تشغيل عليا

أنت الوكيل التنفيذي الرئيسي لمشروع **يا رسول الله ﷺ — Ya Rasool Allah**. لا تعمل كمولد أفكار فقط، ولا تبدأ من الصفر، ولا تهدم ما هو موجود. اعمل داخل المشروع الحقيقي فقط:

`K:\Knoux Projects\YaRasoolAllah\Base`

المستودع canonical هو:

`https://github.com/daynightae-cmyk/YaRasoolAllah.git`

أعد التحقق من الفرع وHEAD قبل أي تعديل. خط الأساس الذي رُصد في 2026-11-15 هو:

- الفرع: `main`
- HEAD: `df4880589016aa4681b6d43233ecc136f4e32238`
- `origin/main` المرصود محلياً: `5d069b83`
- المنتج الحالي: تطبيق Web مبني على Vite + React + TypeScript مع Express وVercel API.
- نقطة الدخول: `client/src/App.tsx`.
- القشرة البصرية: `client/src/visual-golden/`.
- الخادم: `server/`.
- API: `api/`.
- البيانات والمصادر: `data-sources/`.
- اختبارات وأدوات الاستيراد: `scripts/`.

هذا البرومبت يطلب منك تنفيذ تطوير حقيقي متدرج، وليس إعادة تصميم وهمية. نفّذ ما يمكن تنفيذه محلياً مباشرة، وسجّل ما يحتاج إلى مفتاح أو مصادقة أو قرار مالك كحاجز خارجي واضح. لا تسأل عن قرارات التصميم الصغيرة. استخدم أفضل قرار متسق مع هوية المشروع. لكن لا تتجاوز تأكيداً أمنياً أو حذفاً مدمراً أو مصادقة حساب أو نشر إنتاج؛ في هذه الحالات اعرض الإجراء الدقيق والرابط أو المسارات المطلوبة وانتظر التأكيد الصريح.

---

## 1. النتيجة المستهدفة

حوّل المشروع إلى تجربة مؤسسية immersive تبدو كأنها **مقر معرفي حي** لا مجرد مجموعة صفحات وبطاقات. يجب أن يشعر المستخدم عند فتح الباب أنه دخل إلى مساحة علمية وروحية منظمة، ثم ينتقل إلى أجنحة متخصصة، ولكل جناح شخصية بصرية وحركية وصوتية اختيارية وطبقة بيانات حقيقية.

الهدف ليس استخدام 3D للزينة. الهدف أن يصبح 3D جزءاً من طريقة التنقل والفهم:

- الباب هو بوابة الدخول إلى المؤسسة.
- كل جناح بعد الباب هو مكان معرفي له وظيفة واضحة.
- كل حركة أو إضاءة أو انتقال تساعد المستخدم على فهم مكانه وما يفعله.
- كل عنصر بصري مرتبط بحالة بيانات حقيقية أو يعلن بوضوح أنه زخرفي.
- كل غرفة لها نسخة 2D/low-power كاملة عند ضعف الجهاز أو تفعيل تقليل الحركة.
- كل شاشة قابلة للعمل على الهاتف والكمبيوتر واللوحي، ولا تعتمد على hover أو عرض واسع فقط.

لا تجعل الموقع لعبة، ولا معرضاً سينمائياً بلا وظائف. حافظ على الوقار والراحة واحترام النصوص الإسلامية، واجعل المؤثرات تخدم القراءة والتعلم ولا تشتت عنهما.

---

## 2. قواعد عدم التدمير والملكية

قبل التنفيذ نفّذ:

```powershell
Set-Location 'K:\Knoux Projects\YaRasoolAllah\Base'
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short --ignored
git worktree list --porcelain
git diff --name-status
```

احفظ الملفات التالية ولا تلمسها أو تستبدلها أو تعيد توليدها أثناء عملك إلا بمهمة مستقلة وموافقة صريحة:

- `artifacts/visual-evidence/audio-1440-dark-rtl.jpg`
- `artifacts/visual-evidence/children-1440-dark-ltr.jpg`
- `artifacts/visual-evidence/children-360-light-rtl.jpg`
- `artifacts/visual-evidence/daily-360-dark-ltr.jpg`
- `artifacts/visual-evidence/daily-768-light-rtl.jpg`
- `artifacts/visual-evidence/daily-verse-honesty-1440-dark-rtl.jpg`
- `artifacts/visual-evidence/hadith-1440-light-rtl.jpg`
- `artifacts/visual-evidence/seerah-1440-dark-rtl.jpg`

لا تستخدم:

- `git reset --hard`
- `git clean`
- `git checkout --` لاسترجاع ملفات فوق عمل قائم
- `git worktree prune` أو `git worktree remove`
- حذف branches أو backups أو recovery objects
- force push أو إعادة كتابة التاريخ
- حذفاً شاملاً باسم تنظيف المشروع

أي ملف قديم أو كبير لا يُحذف لأن اسمه قديم أو لأنه داخل `dist` أو `artifacts`. صنّفه أولاً، احسب حجمه، أثبت أنه قابل لإعادة التوليد، تحقق من عدم وجود قيمة فريدة، ثم لا تحذف إلا مساراً دقيقاً مسموحاً. ملفات المصدر والبيانات والحقوق والتقارير والصور والـrecovery تبقى محفوظة.

---

## 3. قراءة الوضع الحالي قبل التطوير

اقرأ أولاً:

- `docs/audit/FORENSIC_BASELINE_2026-11-15.md`
- `docs/audit/UNIQUE_WORK_REGISTER_2026-11-15.md`
- `docs/audit/STORAGE_CLEANUP_REVIEW_2026-11-15.md`
- `docs/tasks/TASK_INDEX_2026-11-15.md`
- `docs/tasks/EXECUTION_LEDGER_2026-11-15.md`
- `client/src/App.tsx`
- `client/src/visual-golden/visual-base.css`
- مكونات القشرة تحت `client/src/visual-golden/components/shell/`
- صفحات `client/src/visual-golden/pages/`
- `package.json`
- `.github/workflows/`

لا تفترض أن التقارير التاريخية ما زالت تمثل HEAD الحالي. استخدم الكود وGit والمخرجات الفعلية كمصدر الحقيقة.

أثبت عدد المسارات الحالية من `App.tsx`. المسارات الأساسية الحالية تشمل:

`/`, `/who-is-muhammad`, `/sunnah`, `/hadith`, `/sources`, `/prophetic-day`, `/24-hours`, `/library`, `/library/work/:workId`, `/daily`, `/quran`, `/tafsir`, `/quran-audio`, `/audio`, `/daily-verse`, `/basirah`, `/digital-library`, `/books`, `/seerah`, `/atlas`, `/prayer-guide`, `/islamic-knowledge`, `/five-pillars`, `/women-in-islam`, `/kids`, `/children-tv`, `/media-review`, `/calendar`, `/digital-tasbih`, `/qibla-compass`, `/dashboard`.

لا تنشئ route جديداً إذا كان route قائم يمكن تطويره. لا تكرر القشرة أو سجل المسارات.

---

## 4. الرؤية البصرية الشاملة

### 4.1 القشرة المؤسسية

طوّر القشرة إلى نظام workspace قوي، مع الحفاظ على الهوية العربية وRTL:

- بوابة افتتاحية واضحة ومريحة، بلا شاشة بيضاء أو وميض غير مبرر.
- رأس مؤسسي ثابت يعرّف اسم القسم الحالي وحالته.
- شريط تنقل جانبي على الشاشات الكبيرة، يتحول إلى bottom navigation أو drawer مريح على الهاتف.
- command/search center موحد للانتقال بين الأقسام والكتب والآيات والأحاديث والمواضيع.
- breadcrumb مكاني يوضح: المؤسسة ← الجناح ← الغرفة ← الوثيقة أو الحالة.
- نظام focus وkeyboard navigation كامل.
- نافذة command palette قابلة للبحث، مع اختصارات واضحة ولا تعتمد على لوحة مفاتيح فقط.
- notification/status center يعرض فقط الحالات الحقيقية: مصدر غير متاح، بيانات قيد المراجعة، لا يوجد اعتماد، آخر مزامنة.
- persistent reading/activity rail يحفظ الموضع محلياً عندما يكون ذلك ممكناً، ويعلن للمستخدم إن كان الحفظ محلياً أو حسابياً.
- نظام themes متوازن: dark sanctuary، light manuscript، high contrast، وreduced motion.
- أحجام touch targets لا تقل عن الحد العملي للهاتف.
- safe-area وnotch وgesture-area في الهاتف.

### 4.2 نظام التصميم

استخرج tokens مركزية قابلة لإعادة الاستخدام، ولا تنشر ألواناً عشوائية داخل كل صفحة:

- ألوان الرمل والورق والحبر والزمرد والذهب والليل.
- مستويات عمق واضحة: surface، raised، glass، portal، modal.
- radii وspacing متسقان مع نظام فعلي.
- typography عربية مريحة للقراءة الطويلة مع line-height مناسب.
- خطوط القرآن والنصوص العربية لا تستخدم خطاً زخرفياً يضر بالضبط أو القراءة.
- gradients وglows خفيفة ومبررة.
- حالات hover/focus/pressed/disabled/loading/error/empty/success.
- توحيد iconography وعدم استخدام emoji كأيقونة نهائية في الواجهات الأساسية.
- عدم إدخال نص إنجليزي داخل route معلن على أنه عربي فقط.

### 4.3 ثلاثي الأبعاد مسؤول

استخدم Three.js الموجود في المشروع أو طبقة 3D خفيفة متوافقة مع بنية المشروع. لا تضف محركاً ثقيلاً أو ملفات ضخمة بلا قياس.

كل مساحة 3D يجب أن تحتوي على:

1. نموذج أو شكل بسيط قابل للتجريد.
2. إضاءة ومواد مرتبطة بجو القسم.
3. نقطة دخول واضحة.
4. حالة loading صادقة مرتبطة بجاهزية المشهد، لا progress وهمي.
5. fallback 2D كامل عند فشل WebGL أو ضعف الجهاز.
6. reduced-motion mode.
7. keyboard/touch alternative.
8. حدود للـFPS والذاكرة.
9. تنظيف صريح للـgeometries/materials/textures عند مغادرة route.
10. lazy loading بحيث لا يحمّل كل الأجنحة عند أول زيارة.

لا تجعل المشهد 3D شرطاً للوصول إلى النص أو الزر. النص، البحث، الفهرسة، القراءة، الإشارات، والروابط يجب أن تبقى متاحة في DOM ويمكن الوصول إليها دون الحركة.

---

## 5. الأجنحة والغرف المطلوبة بعد الباب

طوّر كل قسم باعتباره جناحاً له هوية ووظيفة. لا تكتفِ بتغيير الخلفية؛ اربط الجمال ببيانات ومهام حقيقية.

### 5.1 بوابة المؤسسة والردهة الرئيسية

- باب أو بوابة 3D افتتاحية متوازنة لا تؤخر المحتوى.
- دخول يوضح الجناح الحالي والحالة العامة للبيانات.
- انتقال سريع إلى آخر مكان قراءة أو آخر قسم زاره المستخدم.
- مشهد ردهة يحتوي على بوابات الأقسام، لكن كل بوابة keyboard/touch accessible.
- مؤشرات حقيقية فقط: عدد الكتب القابلة للفتح، عدد الآيات المتاحة، حالة كتالوج الحديث، حالة الوسائط المعلقة.
- لا تعرض عداداً زخرفياً كأنه إحصاء حقيقي.

### 5.2 جناح السيرة النبوية

هذا أهم جناح سردي وتربوي. يجب أن يكون واسعاً، دقيقاً، هادئاً، وقابلاً للتنقل الزمني.

أنشئ تجربة timeline/rooms مفهومة، لا تدّعِ أنها تمثل كل التفاصيل قبل اكتمال مصادرها. اقترح طبقات:

- العرب والبيئة قبل الميلاد.
- عام الفيل.
- مولده ﷺ ونشأته الأولى.
- الرضاع والحضانة والطفولة.
- شبابه وأمانته وتجارته.
- الزواج والأسرة والصفات الشخصية.
- غار حراء وبداية الوحي.
- الدعوة السرية والجهرية.
- الابتلاء والهجرة إلى الحبشة.
- عام الحزن والطائف والإسراء والمعراج، مع الفصل الواضح بين النص الثابت والشرح السياقي.
- بيعة العقبة والهجرة.
- بناء المدينة والمؤاخاة والمسجد.
- بدر وأحد والخندق، مع خرائط وأحداث منضبطة لا مشاهد عنف استعراضية.
- صلح الحديبية والرسائل والوفود.
- فتح مكة وحنين وتبوك، مع توثيق كل حدث.
- حجة الوداع.
- مرضه ووفاته ﷺ، بوقار وبلا تمثيل جسدي أو تجسيد للشخص النبوي.
- أثره وتعليمه وأخلاقه في حياة الناس.

لكل فصل:

- عنوان عربي واضح.
- ملخص قصير لا يضيف معلومة غير موثقة.
- خط زمني ومكان وأشخاص مرتبطون بالمصادر.
- طبقة `verified` للنصوص والأحداث المدعومة.
- طبقة `context` للشرح التاريخي العام.
- طبقة `scholarly disagreement` عند وجود اختلاف معتبر.
- قائمة مصادر دقيقة: كتاب، مؤلف، باب/صفحة أو معرف/رابط، نسخة، ودرجة الثقة.
- حالة ترجمة واضحة.
- زر قراءة متعمقة، لا زر تشغيل وهمي.

الأجواء البصرية لكل فترة يجب أن تكون إيحائية وغير مجسدة للنبي ﷺ:

- مكة القديمة: حجر، رمل، ضوء فجر، سماء واسعة، حركة هادئة.
- غار حراء: ظلال صخرية ونجوم وصمت بصري، دون تمثيل للوحي أو ظهور ملائكة.
- المدينة: نخيل وطرقات ومسجد مجرد بصرياً، دون اختلاق عمارة دقيقة بلا مصدر.
- الرحلة والهجرة: مسارات وخرائط ونجوم وإضاءة طريق، دون صناعة أحداث غير واردة.
- الغزوات: خرائط زمنية وتعليمية، دون مشاهد قتال دموية أو بطولة سينمائية.
- حجة الوداع: مساحة مفتوحة ونصوص موثقة، دون تجسيد الشخص أو خطبة مركبة من مصادر غير مفصولة.

ممنوع إنشاء حوارات أو مشاهد درامية من عندك ثم تقديمها كسيرة. إذا احتجت محتوى سردياً، خزّنه كـ`adaptation` أو `educational narration` مع مصدر ودرجة تحرير واضحة، ولا تضعه في طبقة النص الأصلي.

### 5.3 جناح القرآن والتفسير

- غرفة مصحف رقمية هادئة.
- اختيار السورة والآية والجزء والصفحة.
- عرض النص العربي كما ورد في المصدر دون خلطه بالترجمة.
- طبقات منفصلة: Arabic، translation، tafsir، footnotes، source metadata.
- وضع قراءة، وضع حفظ موضع، وضع بحث، وتحديد آية.
- تمييز نتيجة البحث دون تغيير نص الآية.
- لا تستخدم ترجمة غير موثقة.
- لا تسمِّ تفسيراً أو ترجمة باسم غير موجود في المصدر.
- اجعل القارئ مناسباً للهاتف واللوحي والشاشة الكبيرة.

### 5.4 جناح الحديث ودار الحديث

- رفوف للمجموعات، ثم صفحات للأحاديث.
- فصل واضح بين نص الحديث، التخريج، الدرجة، الشرح، والترجمة.
- عدم جمع روايات متشابهة كأنها رواية واحدة.
- إظهار المجموعة والكتاب والباب ورقم الحديث عند توفرها.
- عدم إطلاق "صحيح" أو "ضعيف" إلا إذا كانت المعلومة من سجل أو مصدر محدد.
- حالة `sample` أو `development` يجب أن تظهر للمستخدم بوضوح.
- بحث بالنص والمصدر والراوي والموضوع.
- compare view بين روايتين مع إظهار الاختلاف، لا إخفاؤه.
- مصدر كل ترجمة ونسختها وحقوقها.

### 5.5 مكتبة الكتب وغرفة القراءة

حوّل قارئ الكتب إلى تجربة قراءة قوية:

- shelf/room navigation مرتبط بالكتالوج الحقيقي.
- reader يشبه غرفة مخطوطات حديثة: نص مركزي، margin notes، footnotes، source drawer، progress rail.
- صفحات أو مقاطع قابلة للفتح فقط عندما يثبت مصدرها وحقها.
- حفظ موضع القراءة لكل `workId` مع clamp للبيانات التالفة.
- bookmarks وhighlights محلية بوضوح، ثم قابلة للمزامنة مستقبلاً عند وجود حساب.
- table of contents حقيقي مشتق من النص، لا عناوين وهمية.
- search داخل الكتاب مع context حول النتيجة.
- وضع presentation للكتب التعليمية، ووضع quiet reading للقراءة الطويلة.
- دعم PDF/IIIF/structured text فقط عند وجود capability واضحة.
- إذا كان الكتاب catalog-only، اعرضه ككتالوج لا كأنه قابل للقراءة.
- لا تعلن عدد كتب أكبر من عدد الأعمال القابلة للفتح.

### 5.6 جناح اليوم النبوي والعبادات

- time stations وdaily guidance بهدوء ووضوح.
- افصل بين النص الديني الموثق وبين اقتراحات تنظيم الوقت.
- أظهر حالة الموقع والصلاحية ومصدر الوقت عند الصلاة أو القبلة.
- لا تجعل الشريط الزمني يدّعي أن كل حدث تاريخي مثبت إذا كان مجرد تصور تعليمي.

### 5.7 جناح الأطفال والعائلة

- visual language ألطف، لكن بنفس الصدق.
- لا توجد فيديوهات تشغيل عامة إذا كانت catalog-only أو pending.
- parental/source labels واضحة.
- لا تعرض إحصاءات مشاهدة أو شهادات غير موجودة.
- كل media item يمر عبر rights/editorial/age/depiction review.

### 5.8 جناح المصادر والأمانة العلمية

- source registry قابل للبحث.
- لكل مصدر: الجهة، الرابط، النوع، النسخة، التاريخ، الحقوق، طريقة الاستخدام، درجة الثقة.
- provenance drawer يشرح لماذا ظهر المحتوى وما الذي لم نتحقق منه.
- source conflicts لا تُخفى؛ تُعرض بطريقة هادئة مع فصل الروايات.

### 5.9 جناح بصيرة والبحث

- research desk وليس chatbot يدعي الفتوى.
- نتائج مرتبطة بمصادر ومعرفات.
- graph nodes كاملة وليست بطاقات مقطوعة.
- لا يجيب النظام بثقة أكبر من مصدره.
- إذا لم توجد إجابة، يقول لا توجد مادة موثقة كافية.

### 5.10 جناح الصوت والوسائط

- audio theatre للملفات التي يثبت مصدرها وحقوقها فقط.
- حالة provider unavailable وrights pending وnot playable صريحة.
- لا fake playback أو progress أو مدة مختلقة.
- `media-review` غرفة إدارية/تحريرية لا تظهر كغرفة مشاهدة عامة.

---

## 6. الاستجابة للويب والهاتف والـEXE

لا تدّعِ أن المشروع أصبح Android أو Windows native قبل وجود كود packaging واختبار حقيقي. صمّم الآن على شكل طبقات قابلة للنقل:

- domain/data layer لا يعتمد على DOM.
- design tokens مشتركة.
- components بلا افتراضات viewport ضيقة.
- platform adapters لاحقاً للملفات، الإشعارات، التخزين، audio، share، deep links.
- service contracts قابلة للاستهلاك من Web وMobile وDesktop.
- حالة offline واضحة، مع cache محلي لا يخلط البيانات القديمة بالجديدة.
- لا تحفظ الأسرار في renderer أو localStorage.
- عند بناء EXE لاحقاً، لا تقرر Electron أو Tauri دون مهمة منصة منفصلة؛ حافظ على web runtime صالحاً أولاً.
- عند بناء الهاتف، اختبر lifecycle، back، keyboard، safe-area، permission، network recovery، وfont rendering في RTL.

أنشئ مصفوفة تحقق بالمقاسات التالية على الأقل:

- 360×800 هاتف صغير.
- 390×844 هاتف متوسط.
- 430×932 هاتف كبير.
- 768×1024 لوحي عمودي.
- 1024×768 لوحي أفقي.
- 1280×800 لابتوب.
- 1440×900 شاشة مكتب.
- 1920×1080 شاشة واسعة.

اختبر كل route أساسي في light/dark وRTL/LTR عندما تكون اللغة متاحة. افحص overflow وfixed elements وmodal وfocus وtouch targets. لا تكتفِ بصورة واحدة للصفحة الرئيسية.

---

## 7. استراتيجية البيانات والمصادر الموثوقة

لا يوجد مصدر واحد يضمن قاعدة كاملة ونهائية لكل القرآن والحديث والسيرة والكتب. أنشئ طبقة مصادر متعددة، مع سجل provenance ونسخ وحقوق.

### 7.1 القرآن والترجمات والتفسير

ابدأ بمصادر رسمية يمكن توثيقها:

- QuranEnc API وملفات التحميل: يوفر API بلا مصادقة، ونص حفص/بيانات الآيات وترجمات متعددة. يشترط إبقاء المحتوى دون تعديل، نسبه إلى الناشر، ذكر النسخة، والحفاظ على معلومات النسخ. [1]
- AlQuran Cloud: يوفر API وCDN بلا مفتاح، لكن الترجمات والتلاوات مرتبطة بحقوق المترجمين والقراء، ويجب حفظ النسب واتباع معدل الاستخدام والتخزين المؤقت. [2]
- المصادر الحالية في المشروع: لا تستبدلها تلقائياً. قارن IDs والنسخ وحقوق المصدر قبل أي استيراد.

لكل نسخة خزّن:

`sourceId`, `editionKey`, `language`, `direction`, `version`, `lastUpdated`, `license`, `attribution`, `sourceUrl`, `retrievedAt`, `sha256`, `contentHash`.

لا تعدّل نص القرآن أو تخلط الآية بالترجمة أو التفسير داخل نفس الحقل.

### 7.2 الحديث

- Sunnah.com API: نطاقه جزئي، يتطلب API key، وتذكر وثائقه أن البيانات تضاف بعد فحوص يدوية. إذا احتاجه الوكيل، ينشئ مسار مصادقة رسمي ولا يضع المفتاح في المستودع. يمكن طلب API access أو offline dump عبر القنوات الرسمية، لكن لا تفترض توفر dump حتى يتم إثباته. [3]
- HadeethEnc: يوفر مشروع موسوعة للأحاديث وترجمات وملفات تنزيل CSV/SQLite بعد قبول الشروط. استخدمه لنطاقه الفعلي، وسجّل اللغة والنسخة والمعرف والشرح والمصدر، ولا تقدمه كأنه corpus كامل لكل كتب الحديث. [4]
- مجموعات أخرى: لا تُستخدم إلا بعد فحص المصدر وحقوق إعادة النشر وبنية الإسناد والتخريج.

يجب أن يفرق النموذج بين:

- collection
- book
- chapter
- hadith id
- Arabic matn
- isnad إن توفر
- narrator
- grading
- source edition
- explanation
- translation
- translator
- rights
- editorial review status

لا تسمح بدمج حديثين أو إسناد درجة من مصدر إلى نص آخر بلا قاعدة مطابقة صريحة.

### 7.3 السيرة النبوية والتاريخ

ابنِ طبقة سيرة متعددة المصادر، ولا تبحث عن "قاعدة سيرة واحدة كاملة" فتنسخها بلا فحص. استخدم:

- القرآن كمرجع سياقي للآيات المتعلقة بالأحداث، دون تحويل كل آية إلى سيرة تفصيلية.
- كتب الحديث الموثقة مع reference IDs.
- OpenITI corpus للبحث في النصوص العربية التاريخية والكتب، مع حفظ URI والإصدار. OpenITI يوضح أن GitHub نسخة عمل متغيرة، وأن Zenodo يوفر releases قابلة للاستشهاد، وأن النصوص متفاوتة الجودة، وأن corpus releases تخضع لـCC BY-NC-SA 4.0. [5]
- Internet Archive أو المكتبات الرقمية للنسخ والمخطوطات فقط بعد فحص حقوق كل item؛ وجود عنصر في Archive لا يعني أن كل النصوص أو الـOCR صالحة لإعادة النشر. سجّل item identifier وrights metadata وOCR status. [6]
- مصادر أكاديمية أو مؤسسات علمية للشرح الحديث، مع وسمها كشرح معاصر لا كنص أصلي.

أنشئ لكل حدث في السيرة:

```text
eventId
canonicalTitleAr
alternateTitles
period
hijriDate إن وجدت
gregorianApproximation إن وجدت مع دقة تقريبية
locations
people
sourceReferences[]
primaryEvidence[]
secondaryContext[]
certainty
scholarlyNotes
narrativeStatus: VERIFIED | CONTEXT | DISPUTED | ILLUSTRATIVE
translationStatus
rightsStatus
editorialReviewStatus
```

لا تملأ التاريخ أو المكان بالتخمين. إذا اختلفت الروايات، خزّنها كاختلافات مرتبطة بالمصادر. لا تنتج سرداً درامياً موحداً يخفي الخلاف.

### 7.4 الكتب والمخطوطات

- استخدم catalog metadata أولاً.
- افصل بين metadata، structured text، OCR، PDF، IIIF، وexternal link.
- افحص license لكل نسخة لا لكل عنوان فقط.
- خزّن checksum وmanifest وsource edition.
- لا تعتمد OCR العربي دون عرض تحذير جودة ومراجعة.
- لا تدعي أن كتاباً قابل للقراءة داخل التطبيق لمجرد وجود رابط خارجي.

---

## 8. خط استيراد البيانات المطلوب

أنشئ pipeline حتمياً ومراقباً يتكون من:

1. `source registry` يعرّف المصدر والنسخة والحقوق.
2. `adapter` مستقل لكل API أو export.
3. `raw snapshot` محفوظ خارج طبقة العرض، مع تاريخ وhash.
4. `normalizer` يحول إلى schema داخلي دون فقد المصدر الأصلي.
5. `deduplicator` يعتمد IDs ومفاتيح canonical لا تشابه العناوين فقط.
6. `rights gate` يمنع النشر إذا كانت الحقوق UNKNOWN أو غير cleared.
7. `quality gate` يتحقق من UTF-8، الترقيم، missing fields، وduplicate IDs.
8. `provenance builder` يربط كل record بمصادره.
9. `generated runtime artifact` يكتب deterministic JSON/TS مرتباً ثابتاً.
10. `manifest` يسجل الإصدار، عدد المدخلات، المستبعد، الأخطاء، التحذيرات، الhash، والوقت.
11. `test fixture` صغير وثابت، لا يعتمد دائماً على الإنترنت.
12. `live verification` منفصل عن unit tests، ولا يجعل غياب الإنترنت فشل بيانات مصطنعاً.

استخدم cache وETag/If-Modified-Since عندما يتيحه المصدر. احترم rate limits. لا تجلب كميات ضخمة من الخدمة الحية في كل build. لا تضع API keys في Git أو frontend أو logs.

إذا احتجت مصادقة من المالك:

- أنشئ رابط OAuth أو رابط طلب API رسمي فقط.
- اشرح اسم المزود والصلاحية المطلوبة والغرض.
- لا تطلب كلمة المرور داخل ملف أو chat.
- خزّن السر في إعداد آمن أو environment secret.
- اختبر غياب السر بحالة `BLOCKED_EXTERNAL` واضحة.
- لا تعلن نجاح الاتصال حتى يتم اختبار endpoint الحقيقي.

---

## 9. قاعدة البيانات والتخزين

طوّر storage layer قابلة للانتقال:

- schema versioned.
- migrations منفصلة.
- مفاتيح مستقرة للمصادر والمحتوى.
- unique constraints للمعرفات.
- تاريخ مزامنة ومصدر كل سجل.
- حالات review وrights لا تُمحى عند إعادة الاستيراد.
- upsert idempotent.
- audit log للتغييرات التحريرية.
- فصل بيانات المستخدم عن catalog data.
- لا تستخدم memory fallback في production كأنه persistence.
- إذا لم توجد `DATABASE_URL` أو `JWT_SECRET`، أعد حالة 503 منظمة أو blocker صريحاً، ولا تنشئ نجاحاً وهمياً.

للمحلي يمكن استخدام generated artifacts أو SQLite عند الحاجة، لكن لا تضف قاعدة جديدة قبل فحص Drizzle والمخططات الحالية. إذا تغيّر schema، أضف migration واختبار rollback أو خطة استرجاع.

---

## 10. إدارة المساحة والتنظيف الآمن

نفذ جرد المساحة قبل أي حذف:

```powershell
Get-PSDrive K | Select-Object Name,Used,Free
Get-ChildItem -Force | ForEach-Object { ... }
git status --short --ignored
git worktree list --porcelain
git fsck --no-reflogs --unreachable
```

صنّف كل عنصر إلى:

- `UNIQUE_PRESERVE`
- `ACTIVE_AGENT`
- `RECOVERY_PRESERVE`
- `INTEGRATION_NEEDED`
- `SAFE_REGENERABLE_CANDIDATE`
- `UNKNOWN_PRESERVE`

المسموح المرشح لاحقاً فقط:

- build output قابل لإعادة التوليد مثل `dist/` بعد حفظ manifest/hash.
- cache مثبت أنه لا يحمل مصدراً فريداً.
- dependency install مثل `node_modules/` فقط إذا لم توجد عملية أخرى تعتمد عليه، وبعد ضمان `npm ci`.

الممنوع حذفه تلقائياً:

- `.git/`
- `_recovery/`
- `research/`
- `data-sources/`
- `docs/`
- `attached_assets/`
- `artifacts/visual-evidence/`
- worktrees أو branches أو backups.

بعد أي تنظيف مسموح ومؤكد:

1. سجل المسار والحجم والhash.
2. احفظ خطة recovery.
3. نفذ عملية واحدة محددة.
4. أعد فحص Git والمساحة.
5. أعد التثبيت أو البناء عند الحاجة.
6. أعد جميع الاختبارات ذات الصلة.
7. لا تقل إنك استعدت مساحة قبل قياس `Free` بعد العملية.

---

## 11. الاختبار المستمر

بعد كل slice صغير شغّل الاختبارات المناسبة. وقبل تسليم أي مرحلة شغّل:

```powershell
npm run check
npm run lint
npm run test:p0
npm run validate:sources
npm run validate:kids-youtube
npm run build
```

وللواجهة المرئية استخدم الأدوات الموجودة فعلاً مثل:

```powershell
node scripts/smoke-visual-golden.mjs
node scripts/capture-visual-evidence.mjs
```

لا تضع screenshots في Git على أنها جديدة إذا لم تسجل viewport وtheme وlanguage وroute وSHA ووقت الالتقاط.

لكل viewport، افحص:

- لا يوجد horizontal overflow غير مقصود.
- لا ينقطع النص العربي.
- لا يغطي الزر محتوى آخر.
- لا تعلق modal أو drawer.
- لا تضيع focus.
- لا تظهر وعود تشغيل أو تحميل بلا خدمة حقيقية.
- لا ينهار 3D عند تغيير orientation.
- لا يتسرب WebGL resource بعد التنقل.
- لا يتسبب المشهد في long task أو FPS سيئ على هاتف متوسط.
- fallback 2D قابل للاستخدام.

اختبارات البيانات تشمل:

- type/schema.
- UTF-8 وUnicode.
- duplicate IDs.
- source references.
- rights state.
- deterministic generation.
- missing provider.
- invalid API response.
- rate limit.
- timeout.
- retry.
- partial import.
- rollback أو عدم نشر artifact ناقص.

---

## 12. ترتيب التنفيذ الإلزامي

نفذ على مراحل مستقلة، ولا تخلط عشرات الملفات في تعديل غير قابل للمراجعة:

### المرحلة 0 — حماية baseline

سجل Git والملفات المعدلة والمساحة والاختبارات الحالية. لا تعدل كوداً قبل إنهاء هذه المرحلة.

### المرحلة 1 — workspace shell

وحّد القشرة، tokens، navigation، responsive rules، accessibility، loading/error states. لا تبدأ بتفاصيل 3D قبل أن يصبح shell ثابتاً.

### المرحلة 2 — 3D framework

أنشئ primitives صغيرة: portal، room، lighting preset، camera mode، reduced motion، fallback. اختبر التنقل والتنظيف والتحميل الكسول.

### المرحلة 3 — الأجنحة الأساسية

ابدأ بالباب، الردهة، المكتبة/القارئ، السيرة، القرآن، الحديث، المصادر، ثم بقية الأجنحة. لكل جناح قبل/بعد ومهام بيانات حقيقية.

### المرحلة 4 — reader experience

قوِّ قارئ الكتب والقرآن والحديث من ناحية القراءة والبحث والهوامش والموضع والمرجع والحقوق.

### المرحلة 5 — data foundation

نفذ source registry وmanifests وadapters وschema وdeterministic import. ابدأ بمصدرين حقيقيين منخفضي المخاطر، ثم وسّع بعد نجاح الاختبارات.

### المرحلة 6 — السيرة التفصيلية

لا تملأ الأحداث من نموذج لغوي بلا مصادر. ابنِ timeline من سجلات مرتبطة بمراجع، ثم طبقة narrative منفصلة وموسومة.

### المرحلة 7 — responsive/platform readiness

اختبر المقاسات واللمس والكيبورد وRTL/LTR وreduced motion وlow-power وoffline. اجعل عقود الخدمة مستقلة عن Web حتى يمكن بناء Mobile/EXE لاحقاً.

### المرحلة 8 — cleanup/release

لا تنظيف شامل. فقط candidates مثبتة، ثم gates، ثم artifact hash، ثم CI، ثم runtime، ثم production/packaging عندما تتوفر صلاحياتها.

---

## 13. تعريف النجاح

لا تعتبر المهمة ناجحة لمجرد أن الصفحة جميلة أو أن build نجح. النجاح يتطلب:

- قشرة مؤسسية قوية تعمل 2D و3D.
- كل جناح له وظيفة وحالة بيانات ومشهد ملائم.
- لا يوجد 3D يحجب الوصول أو القراءة.
- السيرة لا تحتوي على اختلاق أو دمج غير موثق.
- الحديث لا يعرض sample كأنه corpus كامل.
- الكتب لا تعلن capability غير موجودة.
- بيانات القرآن والترجمات محفوظة مع الإصدار والنسب والحقوق.
- كل import قابل للتكرار وله manifest وhash.
- بيانات المستخدم منفصلة عن بيانات المحتوى.
- responsive على الهاتف واللوحي والكمبيوتر.
- اختبارات type/lint/unit/source/build وvisual/runtime منفصلة ومثبتة.
- التنظيف لا يحذف قيمة فريدة.
- production blockers معلنة، لا مخفية.

استخدم الحالات:

`IMPLEMENTED_LOCAL_UNCOMMITTED`, `COMMITTED_UNPUSHED`, `PUSHED_UNMERGED`, `MERGED_UNRELEASED`, `RUNTIME_VERIFIED`, `BLOCKED_EXTERNAL`, `BLOCKED_OWNER`, `UNKNOWN`.

لا تستخدم `RELEASED` أو `100%` إلا بدليل نشر وتشغيل حقيقي.

---

## 14. قالب التسليم الإلزامي

في نهاية كل مرحلة سلّم:

```text
PROJECT: Ya Rasool Allah
STAGE:
STATUS:
BASE_SHA:
FINAL_SHA:
BRANCH:
WORKTREE:

WHAT_ALREADY_EXISTED:

WHAT_WAS_IMPLEMENTED:

EXACT_CHANGED_FILES:

VISUAL_EVIDENCE:
- route:
- viewport:
- language/direction:
- theme:
- screenshot path:
- comparison result:

DATA_EVIDENCE:
- source:
- version:
- retrievedAt:
- hash:
- records:
- approved:
- pending:
- rights status:

TEST_MATRIX:
- command:
- exit code:
- result:
- logs/evidence:

SECURITY_AND_RIGHTS:

STORAGE_CLEANUP:
- inspected:
- removed exact paths:
- bytes before/after:
- recovery proof:

BLOCKERS:

NEXT_SAFE_ACTION:

INTEGRATION_RECOMMENDATION:
```

لا تضع في التسليم عبارة عامة مثل "تم تحسين كل شيء". اذكر ما تغير فعلاً، وما لم يتغير، وما لم يمكن إثباته.

---

## 15. قرارات تصميمية إبداعية مسموحة للوكيل

يمكنك الإبداع بحرية في:

- هندسة الردهة والبوابات.
- خامات الورق والحجر والزجاج والضوء.
- انتقالات الغرف.
- depth وparallax الخفيف.
- reading ambience.
- خرائط السيرة التعليمية.
- رفوف الكتب والهوامش.
- spatial search وcommand palette.
- الألوان الموسمية داخل tokens.
- مؤثرات صوتية اختيارية غير مزعجة إذا كانت مرخصة ومفتوحة الإيقاف.
- خلفيات بيئية مجردة لا تجسد النبي ﷺ ولا الملائكة ولا أحداثاً غيبية.

لكن الإبداع لا يسمح بـ:

- تجسيد النبي ﷺ أو تصويره أو اختلاق صوته.
- اختلاق حديث أو قصة أو مصدر.
- اختلاق نسب أو درجة حديث.
- استخدام صور أو كتب أو صوت دون حقوق واضحة.
- تحويل النص الديني إلى مشهد ترفيهي يغير معناه.
- إخفاء حالات عدم اليقين خلف مؤثرات سينمائية.
- إضافة fake analytics أو fake progress.

ابدأ من الواقع الحالي، طوّر أقل تغيير آمن في كل مرة، اختبره فوراً، ثم انتقل للمرحلة التالية. لا تنتظر مراجعة المستخدم في قرارات التصميم الصغيرة، لكن لا تتجاوز المصادقة أو الأسرار أو الحذف المدمّر أو النشر الخارجي.

---

## المراجع الموثقة

[1]: https://quranenc.com/en/home/api/ "QuranEnc.com API and publication terms"

[2]: https://alquran.cloud/terms-and-conditions "AlQuran Cloud terms and conditions"

[3]: https://sunnah.com/developers "Sunnah.com developer documentation"

[4]: https://hadeethenc.com/en/home "Encyclopedia of Translated Prophetic Hadiths"

[5]: https://openiti.org/documentation/ "OpenITI documentation, releases, quality, citation, and license"

[6]: https://archive.org/details/NEP27 "Internet Archive item example with item-level rights and OCR metadata"
