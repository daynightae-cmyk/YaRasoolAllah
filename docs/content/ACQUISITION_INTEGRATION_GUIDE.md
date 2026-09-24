# خريطة الربط والمصادر — من البحث إلى الشاشة

## نموذج تدفق واحد

`مصدر رسمي/نسخة معروفة → اكتشاف مرشح → اختبار API أو الملف → توثيق المصدر والنسخة والحق → تنميط وفحص المحتوى → مراجعة علمية/تحريرية بحسب المجال → فهرسة → API خادمي → واجهة مع نسبة المصدر وحالة الثقة`.

سجّل `candidate → verified_source → rights_cleared → reviewed → published`; `revoked` أو `stale` توقف العرض أو تعيده إلى رابط المصدر مع تفسير. لكل عنصر احتفظ بـ `sourceId`, `canonicalUrl`, `workId`, `edition/version`, `attribution`, `licenseEvidenceUrl`, `reviewer`, `reviewDate`, `hash`, `fetchedAt`, `language`, `contentStatus`, `rightsStatus`, `editorialStatus`, `displayMode`. لا ترفع الدرجة تلقائيًا لأن استجابة API نجحت.

## خريطة الصفحات — الأولوية التنفيذية

| الطريق وموقع الخدمة الحالي | الاكتساب المحدد | نوع الربط/البديل | بوابة القبول |
|---|---|---|---|
| `/kids` — `pages/KidsPage.tsx`, `services/kids.ts`, `components/ceremony/TvLounge.tsx` | كتالوج ملف الأطفال أدناه + فيديو ناشر رسمي | صفحة/بطاقة داخلية برابط خارجي؛ embed فقط بعد إذن وفحص | هوية الناشر، محتوى الحلقة، تصوير الأنبياء، العمر، حق، embeddable |
| `/library` — `pages/LibraryPage.tsx`, `services/library.ts`, `ReadingChamber.tsx` | OpenITI RELEASE، Open Library، LOC، QDL IIIF، Internet Archive metadata | فهرس نسخ وروابط أصلية؛ قارئ IIIF للمسموح | طبعة ومصدر وحق كل نسخة، فرق work/edition/item |
| `/quran` — `pages/QuranPage.tsx`, `services/quranService.ts` | Tanzil المحلي + Quran Foundation Content v4 | نص عربي محلي؛ backend لميزات QF | مطابقة مفاتيح `surah:ayah`, حقوق مورد وOAuth production |
| `/tafsir` — `pages/TafsirPage.tsx`, `services/tafsir.ts` | QF `resources/tafsirs` وOpenITI | عقد مجرّب على الخادم؛ عرض المرجع عند الغياب | ربط التفسير بالآية وبالمفسر والنسخة والحق |
| `/hadith` — `pages/HadithPage.tsx`, `services/hadith.ts` | Sunnah.com API، Dorar API، HadeethEnc candidate | Adapter خادمي مع تخزين مؤقت مسموح | نسبة التخريج والحكم لقائله؛ sample لا يصبح متنًا مثبتًا |
| `/seerah` — `pages/SeerahPage.tsx`, `services/seerah.ts` | OpenITI مقيد بنسخة، مصادر تاريخية محررة | graph مصادر/أحداث مع روابط فصول | الفصل بين الرواية والشرح والاستنتاج |
| `/audio` — `pages/AudioPage.tsx`, `services/audio.ts` | MP3Quran reciters/timing، QF audio | بيانات تلاوة وروابط خارجية أولًا | صلاحية بث التسجيل وتعريف القارئ/الرواية والحق |
| `/daily` — `pages/DailyPage.tsx`, `services/prayer/aladhan.ts` | AlAdhan الحالي + GeoNames عند الحاجة | مدن محددة وإعدادات حساب ظاهرة | التوقيت وطريقة الحساب والمنطقة الزمنية |
| `/atlas` — `pages/AtlasPage.tsx`, `services/atlas.ts` | Natural Earth/OSM لخرائط حديثة؛ مراجع تاريخية منفصلة | طبقتان منفصلتان | ترخيص البلاطات، إحداثيات تاريخية بمعيار ثقة |
| `/basirah` — `pages/BasirahPage.tsx`, `services/basirah.ts` | بحث عربي مع مصدر ونسخة؛ pg_trgm/FTS ثم embeddings إذا قيست | retrieval citation-first، إجابة مقيّدة بالمقاطع | لا تولّد نص قرآن/حديث من النموذج كأنه مقتبس أصيل |

## ورقة الربط للمزوّدين

| المصدر | التحقق هنا | نقطة الدخول | استعمال مأمون أولي | الشرط قبل الإنتاج |
|---|---|---|---|---|
| [Quran Foundation](https://api-docs.quran.foundation/docs/quickstart/) | `OFFICIAL-DOC` | `chapters`, `verses/by_chapter`, resources، audio | prelive على الخادم واكتشاف IDs | موافقة production، حقوق resource، curl واستجابة فعلية |
| [Tanzil](https://tanzil.net/download/) | `LIVE-REPO` للنص المحلي | بيانات المشروع | عرض النص المحلي مع نسبته | الحفاظ على سلامة الأحرف والنسخة |
| [OpenITI RELEASE](https://github.com/OpenITI/RELEASE) | وثائق + pin بحثي | metadata/text releases | فهرس أعمال/روابط أصول | URI وSHA ورخصة كل نص واختلاف الطبعات |
| [Sunnah.com](https://sunnah.com/developers) | `OFFICIAL-DOC` | `/v1/collections` وما يتبعه بمفتاح | اكتشاف schema في بيئة مؤهلة | API key، الحقوق، مطابقة أرقام الأحاديث |
| [Dorar](https://dorar.net/article/389/%D8%AE%D8%AF%D9%85%D8%A9-%D9%88%D8%A7%D8%AC%D9%87%D8%A9-%D8%A7%D9%84%D9%85%D9%88%D8%B3%D9%88%D8%B9%D8%A9-%D8%A7%D9%84%D8%AD%D8%AF%D9%8A%D8%AB%D9%8A%D8%A9-API) | `OFFICIAL-DOC` | `/dorar_api.json?skey=...` | رابط نتيجة، تجربة بحث | تعقيم HTML، نسبة الحكم، شروط الاستعمال |
| [MP3Quran API](https://mp3quran.net/api/v3/reciters?language=eng) | `OFFICIAL-DOC` | reciters وayat_timing | بيانات القارئ ورابط المصدر | تجربة IDs والتوقيت وشروط البث لكل تسجيل |
| [Internet Archive](https://archive.org/developers/) | `OFFICIAL-DOC` | Search/metadata | اكتشاف موارد ووصفها | الحقوق على مستوى item؛ لا تفترض الملكية العامة |
| [Open Library](https://openlibrary.org/developers/api) | `OFFICIAL-DOC` | search/works/editions | روابط طبعات ووصف | رابط النسخة وشروط الخدمة |
| [IIIF](https://iiif.io/api/presentation/3.0/) | `LIVE-JSON` لعينة manifest | manifests v2/v3 | عارض صور عند سماح المؤسسة | نسبة المصدر، حق الصورة، CORS، تكبير مطابق |
| [Wikimedia Commons](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) | `OFFICIAL-DOC` | File/extmetadata | صور مع النسبة | الترخيص والملف الفردي والنسخة |
| [YouTube Data API](https://developers.google.com/youtube/v3/docs/search/list) | `OFFICIAL-DOC` | `search.list` ثم `videos.list` | اكتشاف IDs وmeta للحلقات | المفتاح، `status.embeddable`, الناشر، مراجعة الحلقة |
| [GeoNames](https://www.geonames.org/export/web-services.html) | `OFFICIAL-DOC` | city search | اختيار مدن محدود | حساب/حدود/نسبة؛ لا تستخدم public Nominatim كـ autocomplete |

`api-endpoints.json` يضم 20 نقطة من الحزمة الثانية، و`source-registry-candidates.json` يضم 26 مصدرًا؛ أبقينا status كما هو كي لا تتحول أمثلة `curl` غير المجربة إلى ادعاءات نجاح.

## تصميم الـ adapters والبيانات

- `server/services/content/providers/*`: تطبيقات منفصلة وtimeouts وretry محدودة وcache وفصل أسرار.
- `shared/`: أنواع Zod/TypeScript عامة وسجل حق المحتوى؛ لا تربط المزوّد الخارجي بالواجهة مباشرة.
- `scripts/ingest-*`: discover → fetch → validate → normalize → hash → provenance → idempotent upsert → index → report؛ checkpoint وdry-run ودليل تراجع.
- `shared/schema.ts` مع migrations: راجع الجداول الموجودة أولًا. أضف كيانات `source_versions`, `rights_evidence`, `content_reviews`, `media_candidates`, `publication_events`, `search_documents` فقط إن لم تكن مطبقة. فهارس SQL مستقلة، keys مركبة تحفظ أرقام المصدر الأصلية، والـ URL ليس وحده معرف المحتوى.
- التخزين: metadata مرخّصة ومراجعة محليًا؛ النص الكامل والصوت والفيديو مشروط بحق النسخة. مدّة cache مع ETag أو Last-Modified وحقل انتهاء ووسيلة الإزالة.
- البحث: تطبيع العربية في **عمود بحث مشتق** فقط، حافظ على النص الأصلي، واجمع lexical FTS/pg_trgm قبل قرار embeddings. أظهر مقتطفًا محدودًا ورابطه وإصدار المصدر.

## إثبات القبول عند نهاية كل مرحلة

1. لقطة contract test حقيقية من المزوّد مع إخفاء المفاتيح، ووصف quota/الفشل/الترخيص.
2. عنصر منشور واحد على الأقل لكل نوع مع `sourceId` و`rightsStatus` و`reviewStatus` قابلين للمراجعة؛ لا يكفي عداد فهرس.
3. صفحة تحميل/إفراغ وفشل حقيقي، حفظ المصدر وإمكانية فتح الأصل، اختبار RTL وkeyboard/reduced motion.
4. `npm run check`, `npm run validate:sources`, `npm run build` وما يتاح من اختبارات repo؛ توثيق أوامر البيئة المطلوبة والنتائج.
5. تقرير قبل/بعد بعدد النصوص/التسجيلات/الحلقات **المعتمدة** منفصلًا عن المرشحات، ومخاطر المتبقي، وروابط الملفات والـ PR.
