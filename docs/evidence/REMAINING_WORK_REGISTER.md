# سجل الأعمال المتبقية وإغلاق المنتج

**المنتج:** Ya Rasool Allah ﷺ  
**المستودع:** `daynightae-cmyk/YaRasoolAllah`  
**تاريخ السجل:** 2026-09-24  
**الغرض:** فصل ما أُنجز بدليل قابل للتحقق عن الأعمال التي ما زالت ناقصة، مع تسجيل العوائق وشروط الإغلاق. هذا السجل لا يعلن اكتمالًا زائفًا لمجرد نجاح البناء.

## الخلاصة التنفيذية

المنتج يملك أساسًا قويًا ومجموعة واسعة من الواجهات الذهبية، لكنه لم يصل بعد إلى إغلاق إنتاجي شامل. أهم ما أُغلق حديثًا هو بنية التحقق من المصادر، corpus القرآن العربي من Tanzil، البحث القرآني الأساسي في Basirah، اكتشاف الكتب من Open Library، اكتشاف بيانات القرّاء من MP3Quran، تحسين صدق الصلاة، ودمج إصلاح Kids TV في PR مدمج.

أكبر فجوة تشغيلية حالية هي أن بعض الأجنحة تبدو مكتملة بصريًا بينما ما زالت طبقات البيانات أو الحقوق أو التخزين أو القراءة الداخلية ناقصة. كما أن اكتساب فيديوهات الأطفال متوقف بأمان بسبب غياب `YOUTUBE_DATA_API_KEY`. لا توجد موافقات عنصر-بعنصر في `approvals.json`، لذلك لا يجوز توليد كتالوج فيديوهات من اختيارات غير موثقة.

## تعريف الحالات

| الحالة | معناها |
|---|---|
| `IMPLEMENTED_AND_VERIFIED` | الكود موجود، والاختبار أو الدليل الحي المتاح يثبت السلوك المحدد. |
| `IMPLEMENTED_NOT_LIVE_VERIFIED` | الكود موجود، لكن التحقق الحي أو الإنتاجي لم يكتمل. |
| `PARTIAL` | جزء من التجربة موجود، بينما البيانات أو الحقوق أو المسار الكامل ما زال ناقصًا. |
| `BLOCKED_CREDENTIAL` | التنفيذ ينتظر متغير اعتماد محدد، ولم يُسمح باستبداله ببيانات مصطنعة. |
| `BLOCKED_PROVIDER` | المزود نفسه منع التحقق أو أعاد حالة تمنع الإغلاق الآلي. |
| `NOT_IMPLEMENTED` | لا يوجد تنفيذ إنتاجي كافٍ بعد. |

## ما تم إنجازه ولا ينبغي إعادة تنفيذه

| المجال | الحالة | الدليل الحالي |
|---|---|---|
| التحقق من المزودين العامين | `IMPLEMENTED_AND_VERIFIED` | `artifacts/provider-verification/2026-09-24.json`: ستة اختبارات عامة ناجحة، دون فشل عام. |
| بنية تحقق المزودين | `IMPLEMENTED_AND_VERIFIED` | `scripts/verify-provider-endpoints.ts` وworkflow التحقق و`npm run verify:providers`. |
| مصدر القرآن العربي | `IMPLEMENTED_AND_VERIFIED` | ملف Tanzil acquired، تحقق SHA-256، 114 سورة و6236 آية، ونجاح `npm run ingest:quran`. |
| البحث القرآني الأساسي | `IMPLEMENTED_AND_VERIFIED` | بحث Quran الكامل في Basirah وروابط الآيات مثبتة في سجل القبول. |
| اكتشاف الكتب | `IMPLEMENTED_AND_VERIFIED` | اكتشاف Open Library الحي مع حالة المصدر والروابط الخارجية. |
| بيانات القراء | `IMPLEMENTED_AND_VERIFIED` | اكتشاف بيانات MP3Quran دون ادعاء حقوق تشغيل غير مثبتة. |
| صدق الصلاة والقبلة | `IMPLEMENTED_AND_VERIFIED` | حالات provider/pending/fallback واضحة وعدم تصنيع جدول اليوم التالي. |
| حوكمة المصدر والحقوق | `IMPLEMENTED_AND_VERIFIED` | السجل المركزي، rights ledger، provider resources، وحالات المراجعة. |
| Visual Golden shell والصفحات الرئيسية | `PARTIAL` | الصفحات موجودة ويثبت سجل القبول عرضها، لكن وجود shell لا يساوي اكتمال البيانات الداخلية. |
| Kids TV runtime والعمق البصري | `IMPLEMENTED_AND_VERIFIED` | PR #52 مدمج؛ أُصلح ربط الفيديو المختار وإزالة طبقة الستارة بعد الفتح، مع depth وreduced-motion. |
| Kids acquisition pipeline | `IMPLEMENTED_AND_VERIFIED` | أوامر التحقق والمزامنة والترقية موجودة؛ التحقق سجّل ناشرين اثنين. |
| سجل حجب Kids YouTube | `IMPLEMENTED_AND_VERIFIED` | [سجل الاكتساب](../../data-sources/kids/youtube/acquisition-status.json) يسجل `BLOCKED_CREDENTIAL` بدل اختلاق النتائج. |
| إصلاحات deep-link و404 والبحث الفارغ | `IMPLEMENTED_AND_VERIFIED` | موثقة في `docs/evidence/acceptance-log.md`. |

## الأعمال المتبقية حسب الأولوية

### P0 — إغلاق السلامة والصدق قبل توسيع المحتوى

| العمل | الحالة الحالية | شرط الإغلاق | الاعتماد |
|---|---|---|---|
| تشغيل كل مزودي الاعتماد الحقيقيين | `BLOCKED_CREDENTIAL` | توفير الاعتمادات، تشغيل verifier، حفظ artifact أحمر الاعتماد، ثم ربط كل نتيجة بالواجهة دون ادعاء PASS. | `QF_CLIENT_ID`, `QF_CLIENT_SECRET`, `QF_ENV`, `SUNNAH_API_KEY`, `GEONAMES_USERNAME`, `TIMEZONEDB_API_KEY`. |
| Kids YouTube acquisition | `BLOCKED_CREDENTIAL` | توفير `YOUTUBE_DATA_API_KEY`، تشغيل `npm run sync:kids-youtube`، مراجعة كل عنصر، تعبئة `approvals.json`، ثم `npm run promote:kids-media`. | YouTube API key + مراجع محتوى وحقوق. |
| قاعدة بيانات البحث والـ persistence | `NOT_IMPLEMENTED` | اختيار PostgreSQL فعلي، migrations، FTS و`pg_trgm`، فهرس search_documents، اختبارات idempotent، ثم ربط Basirah. | اتصال قاعدة بيانات وقرار استضافة. |
| إزالة أو عزل fake/demo backend | `PARTIAL` | حصر كل memory stores وdemo tokens، منعها من production، ووسم أي fallback محلي بوضوح. | تدقيق server/auth/storage مع اختبارات تشغيل. |
| إنتاج evidence report محدث | `PARTIAL` | تحديث `PRODUCTION_SOURCE_INTEGRATION_REPORT.md` بعد كل PR بفرع البداية، الملفات، QA، PR، merge SHA، وnew main SHA. | مزامنة main بعد كل دمج. |

### P1 — البيانات الأساسية التي تجعل الأجنحة حقيقية

| العمل | الحالة الحالية | ما يجب تنفيذه |
|---|---|---|
| Quran Foundation enrichment | `BLOCKED_CREDENTIAL` | adapter server-side للترجمات والموارد والـTafsir والقراءات والصوت، مع cache وrefresh وretry محدود. يجب إبقاء Tanzil مصدر النص العربي الأساسي. |
| Tafsir حقيقي | `PARTIAL` | resource discovery، records مرتبطة بالآية، حالة review، وعدم تحويل prose غير المحاذى إلى mapping مصطنع. |
| Sunnah.com corpus | `BLOCKED_CREDENTIAL` | adapter يحفظ collection/book/chapter/URN/number/body/language/grade/graded_by، مع فصل grade المزود عن scholarly verification الداخلي. |
| Quran audio | `PARTIAL` | ربط provider حقيقي مع chapter/verse audio، metadata، timestamps إن توفرت، وحقوق التشغيل؛ MP3Quran يبقى metadata إذا لم تثبت الحقوق. |
| Kids shelves | `PARTIAL` | ملء السلال العشر فقط بعناصر معتمدة: السيرة، قصص الأنبياء، الصحابة، الأخلاق، القرآن للصغار، الأذكار، الصلاة، الوضوء، العربية، مختارات الأسرة. لا يتم تجاوز مراجعة العنصر. |
| Library discovery to resource contract | `PARTIAL` | فصل Work/Edition/Digital Version/File/Rights/Source وربط كل حالة توفر ببيانات حقيقية. |
| Internet Archive adapter | `NOT_IMPLEMENTED` | search، metadata، files، checksum، format، rights evidence، item-level acquisition دون تنزيل مجموعات ضخمة. |
| IIIF reader foundation | `PARTIAL` | parser عام لـManifest/Canvas/Image Service/Rights، مع Gallica أولًا؛ QDL يبقى `BLOCKED_PROVIDER` عند 403. |

### P2 — تحويل الواجهات إلى مؤسسات معرفة فعلية

| العمل | الحالة الحالية | شرط الإغلاق |
|---|---|---|
| Premium library reader | `NOT_IMPLEMENTED` | قراءة نص وHTML، PDF، IIIF، صفحات، zoom، source drawer، rights/availability states، وحالات فشل صادقة. |
| PDF/text/IIIF resource flow | `NOT_IMPLEMENTED` | DocumentResource موحد، تنزيل أو embed فقط عندما تسمح الحقوق، وإظهار `DOWNLOAD_BLOCKED` عند الحاجة. |
| Presentation/PPT/PPTX support | `NOT_IMPLEMENTED` | contract واضح للملفات والعرض، مع عدم الادعاء بدعم native قبل وجود parser/viewer واختبارات حقيقية. |
| Seerah event/evidence graph | `PARTIAL` | نموذج حدث بمصدر ودرجة يقين ومكان وعلاقة زمنية، مع فصل known/approximate/disputed/schematic، وعدم اختلاق إحداثيات. |
| Atlas geographic foundation | `PARTIAL` | MapLibre/Natural Earth للسياق الحديث، SRTM أو terrain عند توفره، وطبقات تاريخية مرتبطة بالدليل؛ لا تحويل إحداثيات SVG إلى جغرافيا حقيقية. |
| Basirah institutional retrieval | `PARTIAL` | exact/entity ثم PostgreSQL FTS ثم `pg_trgm` ثم evidence filter، وقياس حقيقي قبل أي embeddings أو pgvector. |
| Semantic search | `NOT_IMPLEMENTED` | benchmark عربي حقيقي، اختيار model بعد القياس، تحديد dimension، ثم hybrid retrieval وRRF. لا hardcode لنموذج غير مختبر. |

### P3 — تجربة الأطفال والتحرير

| العمل | الحالة الحالية | شرط الإغلاق |
|---|---|---|
| Children story reader | `PARTIAL` | تدفق قراءة كامل بعنوان، عمر، نوع مادة، previous/next، evidence drawer، source parent view، review status، وprogress محلي صادق فقط. |
| Editorial review workflow | `NOT_IMPLEMENTED` | أدوات أو ملفات مراجعة تحفظ content/depiction/age/rights reviewer وevidence وtimestamp لكل عنصر. |
| Story adaptation safeguards | `PARTIAL` | عدم تقديم adaptation على أنها نص حديث أو سيرة أصلية، ومنع أي depiction للنبي ﷺ أو صوت منسوب إليه. |

## العوائق المؤكدة الآن

| العائق | الحالة | الإجراء المطلوب |
|---|---|---|
| YouTube Data API | `BLOCKED_CREDENTIAL` | إضافة `YOUTUBE_DATA_API_KEY` إلى بيئة التشغيل ثم إعادة تشغيل sync. |
| Quran Foundation | `BLOCKED_CREDENTIAL` | إضافة متغيرات QF الثلاثة وتشغيل contract test server-side. |
| Sunnah.com | `BLOCKED_CREDENTIAL` | إضافة `SUNNAH_API_KEY`. |
| GeoNames | `BLOCKED_CREDENTIAL` | إضافة `GEONAMES_USERNAME`. |
| TimeZoneDB | `BLOCKED_CREDENTIAL` | إضافة `TIMEZONEDB_API_KEY`. |
| Qatar Digital Library | `BLOCKED_PROVIDER` | عدم تحويل 403 إلى PASS؛ استخدام مسار مسموح أو إبقاء capability dormant. |
| Browser/manual QA | `IMPLEMENTED_NOT_LIVE_VERIFIED` | إعادة تشغيل 360/768/1440 وRTL/LTR وdark/light بعد عودة جهاز Windows أو بيئة browser. |
| Production deployment | `IMPLEMENTED_NOT_LIVE_VERIFIED` | إثبات deploy فعلي، smoke tests، direct refresh للطرق، وartifact deployment. |

## ترتيب التنفيذ المقترح بعد هذا السجل

1. **تثبيت main ومزامنة فرع التوثيق**، ثم دمج PR التوثيق إذا وافق الفريق عليه.
2. **توفير الاعتمادات الخمسة المطلوبة**، بدءًا من YouTube إذا كان هدف Kids هو الأولوية، مع عدم حفظ الأسرار داخل المستودع.
3. **إعادة تشغيل verifier وKids sync**، ثم تنفيذ مراجعة عنصر-بعنصر قبل أي promotion.
4. **إكمال DocumentResource وInternet Archive وGallica IIIF** لأنها تعتمد بدرجة كبيرة على مزودات عامة تم التحقق منها.
5. **اختيار قاعدة البيانات وبناء FTS/pg_trgm** قبل أي semantic search.
6. **تنفيذ Quran Foundation ثم Sunnah ثم audio** بعد توفر الاعتمادات.
7. **إكمال Seerah graph وAtlas terrain** مع طبقات يقين ومصدر لكل ادعاء.
8. **إكمال persistence/auth/progress/bookmarks** وإزالة fake/demo paths من production.
9. **تشغيل QA النهائي**: refresh، loading، empty، failure، console، 360، 768، 1440، RTL/LTR، dark/light، keyboard، touch، reduced motion، والأداء.
10. **تحديث evidence report ثم إعلان الحالة لكل slice** بدل إعلان اكتمال عام.

## أدلة مرجعية داخل المستودع

- `docs/evidence/PRODUCTION_SOURCE_INTEGRATION_REPORT.md`
- `docs/evidence/acceptance-log.md`
- `artifacts/provider-verification/2026-09-24.json`
- `data-sources/kids/youtube/approvals.json`
- `data-sources/kids/youtube/acquisition-status.json`
- `scripts/acquire/youtube-kids-sync.ts`
- `scripts/acquire/promote-kids-media.ts`
- `shared/source-governance.ts`
- `shared/source-registry.ts`
- `docs/visual-transformation/11-verification-acceptance-delivery.md`

## الخلاصة

العمل المنجز يوفر أساسًا صادقًا وقابلًا للتوسع، لكنه لا يغلق بعد مصادر البيانات المعتمدة، القراءة الداخلية، التخزين الدائم، البحث المؤسسي، أو QA الإنتاجي الكامل. لا ينبغي إعادة بناء الأجنحة المرئية. الأولوية الصحيحة هي إزالة العوائق، تنفيذ adapters وingestion على مراحل، ثم إثبات كل slice بالبيانات والحقوق والاختبارات والدليل التشغيلي.

> **قاعدة الإغلاق:** نجاح `build` يثبت قابلية البناء فقط. لا يصبح المسار مغلقًا إلا بعد إثبات runtime والبيانات والحقوق والمراجعة وQA والدليل في PR مدمج.
