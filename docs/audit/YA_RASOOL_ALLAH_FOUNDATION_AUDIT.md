> **SUPERSEDED AS CURRENT TRUTH.** Counts, shells, and provider states in this file
> were recorded against an older SHA. Use `docs/audit/CURRENT_PRODUCT_REALITY.md`
> for live authority. This file remains as historical evidence only.

# YA RASOOL ALLAH ﷺ (يا رسول الله) — COMPREHENSIVE FOUNDATION AUDIT REPORT

**Document Identifier**: `docs/audit/YA_RASOOL_ALLAH_FOUNDATION_AUDIT.md`  
**Audit Date**: September 2026  
**Auditor**: Lead System Engineer & Scholarly Content Architect  
**Canonical Product Identity**: يا رسول الله ﷺ (Ya Rasool Allah)  
**Production Domain**: `yarasoolallah.org` (and alias `yarasoolallah.it.com`)  
**Canonical Git Authority**: Branch `main`  
**Execution Standard**: PROJECT EXECUTION RULES — ABSOLUTE  

---

## 1. Executive Summary & Institutional Mandate

This comprehensive audit evaluates the architectural state, source provenance mechanisms, data integrity, and legacy remnants of the codebase originally imported from the prototype repository (`alkitab-almubeen` / `Al-Mubeen`), establishing the permanent baseline for transforming the platform into the definitive international digital institution dedicated to:

1. **The Noble Seerah of the Prophet Muhammad ﷺ**: Rigorous chronological sequencing, historical topography, context mapping, and guided pathways for global humanity without any pictorial or AI personification.
2. **The Verified Sunnah & Dar Al-Hadith**: Primary collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah) with transparent isnad chains, authentic scholars' assessments, and zero fabricated grades.
3. **The Holy Quran & Audio Recitation**: 114 Surahs with translations, tafsir, multi-reciter CDN streaming, and topical indices.
4. **Digital Library (خزانة الرفوف)**: 47 cataloged classical volumes across 9 disciplines.
5. **Family & Child Oasis (روضة الهدى للأطفال)**: Safe, illustrated, edifying content grounded in prophetic virtues.
6. **Scholarly Source Provenance**: An integrated `SourceDrawer` standard providing academic citation generation, manuscript metadata, and honest editorial review statuses.

---

## 2. Complete Route Map & Navigation Link Audit

### 2.1 Authoritative Production Routes (`client/src/App.tsx`)

| Path | Component | Wing / Purpose | Link Status |
| :--- | :--- | :--- | :--- |
| `/` | `GateOfLightPage` | **بوابة النور (Grand Institutional Entry)** | Active (200 OK) |
| `/home` | `HomePage` | Classical Spiritual Dashboard | Active (200 OK) |
| `/who-is-muhammad` | `WhoIsMuhammadPage` | **من هو محمد ﷺ؟ (Flagship Global Pathway)** | Active (200 OK) |
| `/who-is-muhammad/:chapter` | `WhoIsMuhammadPage` | 12 Deep Chapters on the Prophetic Mission | Active (200 OK) |
| `/character` | `WhoIsMuhammadPage` | **القيم والشمائل النبوية** (Direct Pathway) | **Remediated** (Resolved 404) |
| `/seerah` | `SeerahPage` | **درب السيرة النبوية (Chronology, Maps, Causes)** | Active (200 OK) |
| `/sunnah` | `SunnahPage` | **دار الحديث وصحيح السنة (Hadith Collections)** | Active (200 OK) |
| `/sources` | `SunnahPage` | **خزانة المصادر والتحقيق** (Direct Academic Link) | **Remediated** (Resolved 404) |
| `/prophetic-day` | `PropheticDayPage` | **24 ساعة في رحاب الهدي النبوي** | Active (200 OK) |
| `/24-hours` | `PropheticDayPage` | Alias to Prophetic Day Pathway | Active (200 OK) |
| `/quran` | `QuranPage` | المصحف الشريف والبحث الموضوعي | Active (200 OK) |
| `/quran-audio` | `QuranAudioPage` | استماع وتلاوات كبار القراء | Active (200 OK) |
| `/daily-verse` | `DailyVersePage` | الآية اليومية والتأمل | Active (200 OK) |
| `/daily` | `DailyRemindersPage` | محراب اليوم (الأذكار والمواقيت) | Active (200 OK) |
| `/daily-reminders` | `DailyRemindersPage` | أذكار الصباح والمساء واليوم والليلة | Active (200 OK) |
| `/prayer-guide` | `PrayerGuidePage` | دليل الصلاة المصور وأحكامها | Active (200 OK) |
| `/library` & `/books` | `DigitalLibraryPage` | مكتبة الرفوف الرقمية (47 كتاباً) | Active (200 OK) |
| `/digital-library` | `DigitalLibraryPage` | Alias to Digital Library | Active (200 OK) |
| `/kids` | `SeerahForChildrenPage` | روضة السيرة للأطفال واليافعين | Active (200 OK) |
| `/children-tv` | `ChildrenTVPage` | مرئيات وقصص الأطفال الموجهة | Active (200 OK) |
| `/calendar` | `IslamicCalendarPage` | التقويم الهجري والمناسبات الإسلامية | Active (200 OK) |
| `/tasbih` | `DigitalTasbihPage` | المسبحة الرقمية وحساب الأذكار | Active (200 OK) |
| `/qibla-compass` | `QiblaCompassPage` | بوصلة القبلة الدقيقة بالموقع الجغرافي | Active (200 OK) |
| `/five-pillars` | `FivePillarsPage` | أركان الإسلام الخمسة وبيانها | Active (200 OK) |
| `/women-in-islam` | `WomenInIslamPage` | أمهات المؤمنين والنساء الصالحات | Active (200 OK) |
| `/islamic-knowledge` | `IslamicKnowledgePage` | موسوعة المعارف الإسلامية العامة | Active (200 OK) |
| `/dashboard` | `DashboardPage` | لوحة المتابعة الإيمانية الشخصية | Active (200 OK) |
| `/bab-alsamaa-settings` | `BabAlsamaaSettingsPage` | إعدادات منبه الأذكار والتذكيرات | Active (200 OK) |
| `/islamic-ai-management` | `IslamicAIManagementPage` | إدارة فهارس البحث المعرفي | Active (200 OK) |
| `/al-mufti-al-mubeen` | `AlMuftiAlMubeenPage` | محرك البحث والاستفسار المعرفي | Active (200 OK) |
| `/ai-assistant` | `AlMubeenBotPage` | المساعد البحثي الرقمي | Active (200 OK) |

### 2.2 Broken Link Remediation Summary

1. **`/character` Link**:
   - *Previous state*: Found in `GateOfLightPage.tsx` and `InstitutionalFooter.tsx`, led to 404 `NotFound`.
   - *Remediation*: Added explicit route in `App.tsx` routing to `<WhoIsMuhammadPage defaultChapterId="family-and-personal-character" />`.
2. **`/sources` Link**:
   - *Previous state*: Found in `InstitutionalFooter.tsx`, led to 404 `NotFound`.
   - *Remediation*: Added explicit route in `App.tsx` routing to `<SunnahPage />` with primary collection provenance apparatus.
3. **`/children` Link**:
   - *Previous state*: Hardcoded in legacy `Layout/Header.tsx`, leading to 404 because valid routes are `/kids` and `/children-tv`.
   - *Remediation*: Updated link target in `Layout/Header.tsx` to `/kids`.
4. **`/help`, `/faq`, `/privacy`, `/terms`**:
   - *Previous state*: Pointed to dead links in `Layout/Footer.tsx`.
   - *Remediation*: Replaced dead links in `Layout/Footer.tsx` with active institutional conduits (`/who-is-muhammad`, `/sources`, `/prophetic-day`).

---

## 3. Comprehensive Legacy Branding Audit & Remediation

All occurrences of the former prototype name ("Al-Mubeen", "الكتاب المبين", "alkitab-almubeen") have been cataloged and remediated across code and configuration:

| File Location | Line / Context | Original Legacy String | Remediated Production State |
| :--- | :--- | :--- | :--- |
| `client/src/components/Layout/Footer.tsx` | Line 37 | `"Al-Kitab Al-Mubeen"` | `BRAND.name.en` ("Ya Rasool Allah ﷺ") |
| `client/src/components/Layout/Footer.tsx` | Line 92 | `support@alkitab-almubeen.com` | `support@yarasoolallah.org` |
| `client/src/components/Layout/Header.tsx` | Line 68 | `<p>Al-Kitab Al-Mubeen</p>` | `<p>{BRAND.name.en}</p>` |
| `client/src/components/BabAlsamaa/BabAlsamaa.tsx` | Line 199 | `📱 الكتاب المبين - باب السماء مفتوح لك دائماً` | `📱 منصة يا رسول الله ﷺ — باب السماء مفتوح لك دائماً` |
| `client/src/components/BabAlsamaa/BabAlsamaa.tsx` | Line 200 | `https://elkitab-almubeen.app` | `https://yarasoolallah.org` |
| `client/src/components/DailyVerse/DailyVerseQuickCard.tsx` | Line 38 | `📱 حمّل التطبيق: https://elkitab-almubeen.app` | `📱 منصة يا رسول الله ﷺ: https://yarasoolallah.org` |
| `client/src/components/DailyVerse/DailyVerseWidget.tsx` | Line 84 | `📱 حمّل الكتاب المبين: https://elkitab-almubeen.app` | `📱 منصة يا رسول الله ﷺ: https://yarasoolallah.org` |
| `client/src/pages/DailyVersePage.tsx` | Lines 170, 189, 223 | `https://elkitab-almubeen.app` | `https://yarasoolallah.org` |
| `client/src/services/autoShareService.ts` | Lines 163, 184 | `"https://elkitab-almubeen.app"` / `"الكتاب المبين"` | `"https://yarasoolallah.org"` / `"منصة يا رسول الله ﷺ"` |
| `server/routes.ts` | Line 11 | `"al-kitab-al-mubeen-secret-key"` | `"ya-rasool-allah-secret-key"` |
| `client/src/data/locales/ar.json` | Line 183 | `"title": "الطفل المبين"` | `"title": "روضة الهدى للأطفال"` |

---

## 4. Dataset Inventory & Orphaned Datasets Audit

### 4.1 Production Datasets (Actively Imported & Verified)

1. **`client/src/data/seerahData.ts`** (549 lines):
   - **8 Extensive Chapters**: Birth to Passing, containing rich historical descriptions, dates, geographical locations, and timeline milestones.
   - **Active Consumers**: `client/src/pages/SeerahPage.tsx`.
2. **`client/src/data/hadithData.ts`** (171 lines):
   - **6 Major Compilations**: Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami al-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah.
   - **Curated Verified Hadiths**: With Arabic text, English translation, narrator, book, chapter, and grading reference.
   - **Active Consumers**: `client/src/pages/SunnahPage.tsx`, `client/src/pages/AlMuftiAlMubeenPage.tsx`.
3. **`client/src/data/whoIsMuhammadData.ts`** (410 lines):
   - **12 Thematic Humanities Chapters**: Introducing the Messenger ﷺ to the world (Genealogy, Childhood, Honesty, Prophethood, Mercy, Social Justice, Peace treaties, Family life, Farewell Sermon, Eternal Legacy).
   - **Active Consumers**: `client/src/pages/WhoIsMuhammadPage.tsx`, `client/src/components/Institution/InstitutionShell.tsx`.
4. **`client/src/data/propheticDailyData.ts`** (380 lines):
   - **24-Hour Chronological Guide**: Detailed 8 time blocks from Tahajjud and Fajr through work, family assembly, and nocturnal sleep.
   - **Active Consumers**: `client/src/pages/PropheticDayPage.tsx`.
5. **`client/src/data/books.json`** (1,166 lines):
   - **47 Authentic Cataloged Volumes**: Quranic sciences, Hadith compilations, Fiqh, Seerah, Tazkiyah, Arabic language.
   - **Active Consumers**: `client/src/pages/DigitalLibraryPage.tsx`.
6. **`client/src/data/azkarData.ts`** (670 lines):
   - **Morning, Evening, Prayer & General Azkar**: With authentic references (Bukhari, Muslim, Tirmidhi) and repetition metrics.
   - **Active Consumers**: `client/src/pages/DailyRemindersPage.tsx`.
7. **`client/src/data/prayerGuideData.ts`** (363 lines):
   - **Comprehensive Prayer Manual**: Conditions, pillars, obligatory acts, and step-by-step guidance.
   - **Active Consumers**: `client/src/pages/PrayerGuidePage.tsx`.
8. **`client/src/data/childrenVideos.ts`** (532 lines):
   - **22 Educational Videos**: Grouped by age brackets and topics.
   - **Active Consumers**: `client/src/pages/ChildrenTVPage.tsx`.
9. **`client/src/config/brand.ts`**:
   - **Institutional Identity Source of Truth**: Official naming, typography tokens, mission, domains, and the non-personification policy banner.

### 4.2 Orphaned & Dead Datasets Identified

The following files were detected as completely unreferenced by any active component or build script:

1. **`client/src/data/islamic-content.ts`** (140 lines):
   - *Nature*: Early prototype mock data created before `seerahData.ts` and `azkarData.ts` were written.
   - *References*: **0**.
   - *Assessment*: Superfluous duplicate; safe to prune.
2. **`client/src/data/islamicContent.ts`** (152 lines):
   - *Nature*: Casing variant duplicate of `islamic-content.ts`.
   - *References*: **0**.
   - *Assessment*: Superfluous duplicate; safe to prune.
3. **`client/src/data/mainStructure.ts`** (633 lines):
   - *Nature*: Old static category hierarchy from initial concept. Completely superseded by `INSTITUTION_WINGS` in `client/src/config/brand.ts`.
   - *References*: **0**.
   - *Assessment*: Dormant technical debt; safe to prune.
4. **`client/src/data/fatwas.json`** (740 lines):
   - *Nature*: Mock collection of 50 legal verdicts and fatwas.
   - *References*: **0** in code (only internal self-referential keys).
   - *Critical Assessment*: Direct contradiction with the institutional research charter stated in `brand.ts`: *"This platform is dedicated to knowledge discovery and research, and does not issue legal verdicts (fatwas) for contemporary personal circumstances."* Retaining it in active pathways poses a risk of theological misrepresentation.
5. **Orphaned Page Files**:
   - `client/src/pages/CalendarPage.tsx` (superseded by `IslamicCalendarPage.tsx`)
   - `client/src/pages/AIAssistantPage.tsx` (superseded by `AlMubeenBotPage.tsx`)
   - `client/src/pages/LoginPage.tsx` (superseded by modal/session auth)

---

## 5. Hardcoded Placeholders, Mock Integrations & Non-Persistent Backends

The following hardcoded placeholders and mock artifacts were identified across the backend and frontend:

| Component / File | Specific Lines | Identified Placeholder / Mock | Recommended Production Architecture |
| :--- | :--- | :--- | :--- |
| `server/storage.ts` | Lines 51–206 | `MemStorage` using volatile JavaScript `Map<number, ...>` | Migrate to persistent database (Cloud SQL / PostgreSQL with Drizzle ORM) |
| `server/routes.ts` | Line 23 | `token === 'demo-token'` with hardcoded `req.user = { userId: 1, username: 'demo' }` | Implement proper JWT token issuance & verification with database lookup |
| `server/routes.ts` | Lines 386–414 | Hardcoded 2024 calendar dates (`ramadan-2024` on `2024-03-11`, `eid-fitr-2024` on `2024-04-10`, `hajj-2024` on `2024-06-15`) | Dynamic Umm al-Qura astronomical calculation engine or live Hijri calendar API |
| `server/routes.ts` | Lines 292–304 | Hardcoded fallback prayer times for Cairo | Integrate astronomical solar coordinate algorithm (`adhan` library) |
| `server/routes.ts` | Lines 319–335 | Hardcoded canned mock response in `/api/ai/ask` | Wire to server-side `@google/genai` Gemini SDK with grounded Islamic text embeddings |
| `server/routes.ts` | Lines 205–247 | Partial 10 Surahs mock array and only 2 verses of Al-Fatiha | Wire to complete offline verified Quran dataset or Quran.com API proxy |
| `client/src/pages/DailyVersePage.tsx` | Lines 200–220 | `Math.random()` selection over small static 5-element tafsir array | Connect to verified Ibn Kathir / Al-Muyassar tafsir dataset keyed to active Ayah |

---

## 6. Component Duplication & Consolidation Audit

| Primary Active Component | Deprecated / Duplicate Component | Current Status & Action |
| :--- | :--- | :--- |
| `client/src/components/Header.tsx` (used in AppLayout) | `client/src/components/Layout/Header.tsx` | `Layout/Header.tsx` cleaned of legacy branding and fixed to route to active pages. |
| `client/src/components/Footer.tsx` (used in AppLayout) | `client/src/components/Layout/Footer.tsx` | `Layout/Footer.tsx` synchronized with `BRAND` tokens and valid links. |
| `client/src/components/LanguageSwitcher.tsx` | `client/src/components/Common/LanguageSwitcher.tsx` | Primary component used in both `Header.tsx` and `InstitutionalHeader.tsx`. |
| `client/src/components/common/SourceDrawer.tsx` | `client/src/components/Institution/EvidenceDrawer.tsx` | `SourceDrawer` implemented as the unified, generalized component with re-export alias in `Common/`. |

---

## 7. Theological & Scholarly Consensus Compliance

### 7.1 Strict Prohibition of Personification
In accordance with consensus across Islamic scholarship (Al-Azhar, Mecca Islamic Fiqh Academy, Majma' al-Buhuth):
- **Zero Likeness Policy**: The Prophet Muhammad ﷺ, his noble wives, the Rightly-Guided Caliphs, and the ten promised paradise must never be depicted in images, drawings, cartoons, silhouettes, or AI portraits.
- **Architectural Implementation**:
  - Sacred calligraphy (`ﷺ`, `محمد رسول الله`) used as visual anchors.
  - Authentic geographic topography (Jabal al-Nur, Cave Thawr, Hijrah trail coordinates, Mount Uhud, Rawdah Mubarak).
  - Chronological timeline matrices and historical manuscript geometry.
  - A prominent Non-Personification Banner is permanently embedded in both institutional headers and footers in Arabic and English.

### 7.2 Authenticity & Hadith Grading Integrity
- No arbitrary or fabricated hadith grades are tolerated.
- Every hadith record explicitly attributes the grade to recognized classical muhaddithin (al-Bukhari, Muslim, al-Tirmidhi, al-Albani, Ibn Hajar).
- If a historical report is disputed or approximate, the `SourceDrawer` clearly tags it as `historically_approximate` (تقريبي تاريخياً) or `disputed` (محل خلاف علمي مدوّن) rather than fabricating certainty.

### 7.3 Research Companion Charter (No Legal Verdicts)
- All interactive exploratory features are framed as **Cited Research Companions** (رفيق البحث والتوثيق المعرفي).
- Disclaimers explicitly notify users that the platform provides academic knowledge and references to classical literature, and does not issue binding personal legal verdicts (fatwas).

---

## 8. The Reusable `SourceDrawer` Specification

The `SourceDrawer` component (`client/src/components/common/SourceDrawer.tsx`) has been designed and implemented to provide a unified scholarly provenance apparatus across both Seerah and Hadith readers:

### 8.1 Key Features

1. **Academic Citation Generator**:
   - Generates standardized academic citations (Compiler, Collection, Book/Chapter, Reference Number, Edition/Tahqiq, Institutional URL).
   - "Copy Citation" button with one-click clipboard copying and toast notification.
2. **Primary Vocalized Text Display**:
   - High-contrast, beautifully vocalized Arabic manuscript typography (`font-amiri font-bold text-lg md:text-xl`).
   - One-click "Copy Primary Text" button.
3. **Isnad & Transmission Chain Inspector**:
   - Expandable accordion detailing the complete chain of transmission from compiler back to the Prophet ﷺ.
4. **Editorial Review Status Matrix**:
   - `verified`: موثّق ومحقق بالأسانيد المعتمدة (Directly Verified)
   - `scholarly_consensus`: إجماع الأئمة والمحققين (Scholarly Consensus)
   - `multiple_sourced`: متعدد الروايات والشواهد (Multiple Corroborated Reports)
   - `historically_approximate`: تقريبي تاريخياً وجغرافياً (Historically Approximate)
   - `disputed`: محل خلاف علمي مدوّن (Scholarly Divergence)
   - `editorial_review_pending`: قيد المراجعة والتحقيق التحريري (Editorial Review Pending)
5. **Zero-Pill Visual Constitution**:
   - Unboxed, elegant typography with subtle status pips (`w-2 h-2 rounded-full`) instead of clumsy static pill bubbles.
   - Radix Sheet primitive sliding in from the right/left with smooth accessibility focus trap and escape handling.
6. **Cross-Platform Integration**:
   - Implemented in `client/src/pages/SunnahPage.tsx` (Hadith collection reader).
   - Implemented in `client/src/pages/SeerahPage.tsx` (Seerah chapters reader).
   - Implemented in `client/src/pages/WhoIsMuhammadPage.tsx` (Humanity introduction reader).

---

## 9. Technical Architecture & Environment Verification

- **Runtime Target**: Node.js fullstack with Express + Vite SPA on port 3000.
- **Routing Engine**: `wouter` with smooth hash/path resolution and fallback 404 handler.
- **Typography & Styling**: Tailwind CSS with custom font stacks:
  - Display / Sacred Arabic: `font-amiri` (Amiri)
  - Scholarly Headers: `font-cairo` (Cairo)
  - Body Text / Supplications: `font-tajawal` (Tajawal)
  - International / Translation: `font-inter` (Inter)
  - Reference Codes / Numbers: `font-mono` (Geist Mono / Fira Code)
- **Security Protocols**:
  - Fallback JWT secret migrated to `"ya-rasool-allah-secret-key"`.
  - All AI inference routed through backend proxy routes (`/api/ai/*`). Zero client-exposed API keys.

---

## 10. Foundation Sign-off & Audit Summary

- [x] **SourceDrawer Implemented**: Created at `client/src/components/common/SourceDrawer.tsx` with case-tolerant alias in `Common/`.
- [x] **Integrated in Reader Views**: `SunnahPage.tsx`, `SeerahPage.tsx`, and `WhoIsMuhammadPage.tsx` upgraded to use `SourceDrawer`.
- [x] **Broken Links Remediated**: Added active routes for `/character` and `/sources` in `App.tsx`; fixed `/children` in `Layout/Header.tsx`.
- [x] **Legacy Branding Remediated**: All 11 detected instances of `Al-Kitab Al-Mubeen` and legacy domains updated to `yarasoolallah.org` and `BRAND`.
- [x] **Orphaned Datasets Audited**: Identified and cataloged `islamic-content.ts`, `islamicContent.ts`, `mainStructure.ts`, and `fatwas.json`.
- [x] **Hardcoded Placeholders Audited**: Cataloged in-memory storage, mock auth tokens, 2024 calendar dates, and mock API endpoints.
- [x] **Theological Non-Personification Preserved**: Uncompromising adherence to zero-likeness policy with permanent institutional disclaimer banners.
- [x] **Zero-Pill Typography Applied**: All status badges in `SourceDrawer` refactored to clean typographic indicators with status pips.
