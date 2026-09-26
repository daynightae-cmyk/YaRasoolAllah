import type { UiLang } from "@/visual-golden/lib/institution/store";

/**
 * UI language and content language are different things.
 *
 * The interface can be switched to English, but the knowledge itself is
 * recorded in Arabic and is not machine-translated. Silently mixing an English
 * interface around Arabic content reads as "this is the English edition", which
 * it is not.
 *
 * Two rules make this contract worth something:
 *
 *  1. **Every canonical route is declared.** A route with no declaration used
 *     to make no claim at all, which is how four routes came to serve English
 *     while the product said nothing. Silence is not honesty here, because the
 *     interface language is still switched; an undeclared route just escapes
 *     scrutiny.
 *  2. **A declaration carries its own evidence.** `servesContent` names the
 *     exact field and `file:line` of every non-Arabic passage the route shows,
 *     and `scripts/multilingual-closure.test.ts` re-checks each anchor against
 *     the file. A declaration cannot quietly stop being true.
 *
 * A previous version of this table declared five routes Arabic-only while they
 * rendered English. That is worse than saying nothing: it told an English
 * reader "this content is recorded in Arabic only and has not been translated"
 * about a page that was showing them an English chapter summary. The
 * bidirectional gate in that script is what now prevents a repeat.
 */
export type ContentLanguage = "ar" | "en" | "fr" | "ur";

/**
 * `knowledge` serves recorded material. `navigation` moves the reader
 * elsewhere without asserting anything of its own. `redirect` has no surface
 * at all.
 */
export type RouteContentKind = "knowledge" | "navigation" | "redirect";

/** A non-Arabic passage a route actually shows, with proof. */
export interface ContentEvidence {
  readonly language: ContentLanguage;
  readonly field: string;
  /** Repo-relative `file:line` of the populated value. */
  readonly at: string;
}

/** A governed edition reachable for a route, including the Arabic original. */
export interface RouteTranslation {
  readonly language: ContentLanguage;
  readonly edition: string | null;
  readonly translator: string | null;
  /** Where this claim is traceable. */
  readonly basis: string;
}

export interface RouteContentDeclaration {
  readonly path: string;
  readonly kind: RouteContentKind;
  /** Every language whose content this route actually serves. */
  readonly contentLanguages: readonly ContentLanguage[];
  readonly reason: string;
  /**
   * What kind of English a partly-translated route is showing. Required
   * whenever `servesContent` is non-empty, because "some English appears here"
   * is only honest if the reader is also told whether that English is a
   * published edition, a platform-authored passage, or a development sample.
   */
  readonly englishCaveat?: string;
  /** Repo-relative files that were read to make this claim. */
  readonly verifiedIn: readonly string[];
  /** Non-Arabic knowledge content this route shows, each with an anchor. */
  readonly servesContent: readonly ContentEvidence[];
  /** Governed editions reachable here. Arabic-only routes still list theirs. */
  readonly translations: readonly RouteTranslation[];
}

const ARABIC_ORIGINAL: RouteTranslation = {
  language: "ar",
  edition: "Tanzil Uthmani-min 1.1",
  translator: null,
  basis: "shared/source-registry.ts src-tanzil-uthmani-min-1-1-acquired",
};

const alquranCloud = (language: ContentLanguage, edition: string, translator: string): RouteTranslation => ({
  language,
  edition,
  translator,
  basis: "shared/source-registry.ts src-alquran-cloud-translations",
});

/** Arabic-only knowledge route. `verifiedIn` must list what was read. */
function arabicOnly(path: string, reason: string, verifiedIn: readonly string[]): RouteContentDeclaration {
  return {
    path,
    kind: "knowledge",
    contentLanguages: ["ar"],
    reason,
    verifiedIn,
    servesContent: [],
    translations: [ARABIC_ORIGINAL],
  };
}

/** A route that shows recorded Arabic plus an English passage it authored. */
function withEnglish(
  path: string,
  reason: string,
  verifiedIn: readonly string[],
  servesContent: readonly ContentEvidence[],
  englishCaveat: string,
): RouteContentDeclaration {
  return {
    path,
    kind: "knowledge",
    contentLanguages: ["ar", "en"],
    reason,
    englishCaveat,
    verifiedIn,
    servesContent,
    translations: [ARABIC_ORIGINAL],
  };
}

export const ROUTE_CONTENT_DECLARATIONS: readonly RouteContentDeclaration[] = [
  {
    path: "/",
    kind: "navigation",
    contentLanguages: ["ar"],
    reason:
      "The landing page only routes onward. Its bilingual card blurbs are navigation chrome, not recorded knowledge.",
    verifiedIn: ["client/src/visual-golden/pages/HomePage.tsx"],
    servesContent: [],
    translations: [],
  },
  arabicOnly(
    "/seerah",
    "seerahData chapters, details and timeline events are recorded in Arabic only.",
    ["client/src/data/seerahData.ts", "client/src/visual-golden/pages/SeerahPage.tsx"],
  ),
  arabicOnly(
    "/atlas",
    "Atlas place names come from the Arabic timeline-event locations in seerahData.",
    ["client/src/visual-golden/pages/AtlasPage.tsx", "client/src/data/seerahData.ts"],
  ),
  {
    path: "/quran",
    kind: "knowledge",
    contentLanguages: ["ar", "en", "fr", "ur"],
    reason:
      "The Arabic text is the bundled Tanzil artifact; the three translations are governed AlQuran Cloud editions behind /api/content/quran/translations, allowlisted as en.sahih, fr.hamidullah and ur.jalandhry.",
    verifiedIn: [
      "server/quran-translations.ts",
      "client/src/visual-golden/services/quran-translations.ts",
      "client/src/visual-golden/pages/QuranPage.tsx",
    ],
    servesContent: [],
    translations: [
      ARABIC_ORIGINAL,
      alquranCloud("en", "en.sahih", "Saheeh International"),
      alquranCloud("fr", "fr.hamidullah", "Muhammad Hamidullah"),
      alquranCloud("ur", "ur.jalandhry", "Fateh Muhammad Jalandhry"),
    ],
  },
  arabicOnly(
    "/tafsir",
    "TafsirPage lists five classical Arabic works bibliographically and renders no tafsir text, and states in the interface that no approved English translation is linked yet.",
    ["client/src/visual-golden/pages/TafsirPage.tsx", "client/src/visual-golden/services/tafsir.ts"],
  ),
  {
    path: "/audio",
    kind: "knowledge",
    contentLanguages: ["ar"],
    reason:
      "The MP3Quran catalog returns audio streams and Arabic reciter labels only; the payload carries no text field, so there is nothing to translate.",
    verifiedIn: [
      "server/mp3quran-catalog.ts",
      "client/src/visual-golden/pages/AudioPage.tsx",
    ],
    servesContent: [],
    translations: [ARABIC_ORIGINAL],
  },
  arabicOnly(
    "/quran-audio",
    "Same recitation surface as /audio, mounted for the legacy path.",
    ["client/src/visual-golden/pages/AudioPage.tsx", "server/mp3quran-catalog.ts"],
  ),
  arabicOnly(
    "/daily",
    "The prayer observatory renders AlAdhan calculation times and Arabic devotional labels; no translated passage is recorded.",
    ["client/src/visual-golden/pages/DailyPage.tsx", "client/src/visual-golden/services/prayer/types.ts"],
  ),
  withEnglish(
    "/hadith",
    "The matn is Arabic, but the four local development samples also carry an English text that the reader shows and labels as a development sample. It is not a published translation.",
    ["client/src/data/hadithData.ts", "client/src/visual-golden/pages/HadithPage.tsx"],
    [
      { language: "en", field: "textEn", at: "client/src/data/hadithData.ts:115" },
      { language: "en", field: "textEn", at: "client/src/data/hadithData.ts:135" },
      { language: "en", field: "textEn", at: "client/src/data/hadithData.ts:155" },
        { language: "en", field: "textEn", at: "client/src/data/hadithData.ts:175" },
      ],
      "The English here is a local development sample, not a published translation of the matn.",
    ),
  {
    path: "/sunnah",
    kind: "knowledge",
    contentLanguages: ["ar", "en"],
      reason: "App.tsx routes /sunnah to the same HadithPage, so the same development-sample English applies.",
      englishCaveat:
        "The English here is a local development sample, not a published translation of the matn.",
    verifiedIn: ["client/src/App.tsx", "client/src/visual-golden/pages/HadithPage.tsx"],
    servesContent: [{ language: "en", field: "textEn", at: "client/src/data/hadithData.ts:115" }],
    translations: [ARABIC_ORIGINAL],
  },
  arabicOnly(
    "/kids",
    "Children adaptations are recorded in Arabic; the cleared media count is 0 and the bilingual-looking labels are interface chrome.",
    ["client/src/visual-golden/pages/KidsPage.tsx"],
  ),
  arabicOnly(
    "/children-tv",
    "App.tsx routes /children-tv to the same KidsPage, so the same Arabic-only adaptations apply.",
    ["client/src/App.tsx", "client/src/visual-golden/pages/KidsPage.tsx"],
  ),
  {
    path: "/library",
    kind: "knowledge",
    contentLanguages: ["ar", "en"],
    reason:
        "The catalog is bilingual by design: hall and shelf labels switch on the interface language, and displayTitle/displayAuthor fall back to the English title whenever a work has no recorded Arabic title, which is the case for 531 of 9,129 works.",
      englishCaveat:
        "The English is a bibliographic title and author for cataloguing. 531 of 9,129 works have no recorded Arabic title at all, so the English label is shown in place of a missing one rather than as a translation.",
    verifiedIn: [
      "client/src/visual-golden/pages/LibraryPage.tsx",
      "client/src/visual-golden/services/catalog-library.ts",
      "client/src/visual-golden/services/library-catalog-presentation.ts",
    ],
    servesContent: [
      { language: "en", field: "titleEn", at: "client/src/visual-golden/services/catalog-library.ts:18" },
      { language: "en", field: "authorEn", at: "client/src/visual-golden/services/catalog-library.ts:20" },
    ],
    translations: [ARABIC_ORIGINAL],
  },
  {
    path: "/books",
    kind: "knowledge",
    contentLanguages: ["ar", "en"],
      reason: "App.tsx routes /books to the same LibraryPage, so the same bilingual catalog applies.",
      englishCaveat:
        "The English is a bibliographic title and author for cataloguing, shown where no recorded Arabic title exists rather than as a translation.",
    verifiedIn: ["client/src/App.tsx", "client/src/visual-golden/pages/LibraryPage.tsx"],
    servesContent: [
      { language: "en", field: "titleEn", at: "client/src/visual-golden/services/catalog-library.ts:18" },
    ],
    translations: [ARABIC_ORIGINAL],
  },
  {
    path: "/digital-library",
    kind: "knowledge",
    contentLanguages: ["ar", "en"],
      reason: "App.tsx routes /digital-library to the same LibraryPage, so the same bilingual catalog applies.",
      englishCaveat:
        "The English is a bibliographic title and author for cataloguing, shown where no recorded Arabic title exists rather than as a translation.",
    verifiedIn: ["client/src/App.tsx", "client/src/visual-golden/pages/LibraryPage.tsx"],
    servesContent: [
      { language: "en", field: "titleEn", at: "client/src/visual-golden/services/catalog-library.ts:18" },
    ],
    translations: [ARABIC_ORIGINAL],
  },
  withEnglish(
    "/basirah",
    "Retrieval results are Arabic, but each result also carries an English title, kind and hint that the evidence cards render.",
    ["client/src/visual-golden/services/basirah.ts", "client/src/visual-golden/pages/BasirahPage.tsx"],
    [
      { language: "en", field: "titleEn", at: "client/src/visual-golden/services/basirah.ts:53" },
      { language: "en", field: "kindEn", at: "client/src/visual-golden/services/basirah.ts:55" },
        { language: "en", field: "hintEn", at: "client/src/visual-golden/services/basirah.ts:58" },
      ],
      "The English is a short generated label and hint written beside the Arabic record, not a translation of the underlying text.",
    ),
  withEnglish(
    "/sources",
    "The governance registries carry English bibliographic titles and authors, and the page renders work.titleEn directly.",
    ["shared/knowledge-registry.ts", "client/src/pages/SourcesPage.tsx"],
    [
      { language: "en", field: "titleEn", at: "shared/knowledge-registry.ts:93" },
        { language: "en", field: "authorEn", at: "shared/knowledge-registry.ts:95" },
      ],
      "The English is a bibliographic title and author written by this platform, not a translation of the work, whose full text is not available here.",
    ),
  withEnglish(
    "/who-is-muhammad",
    "Each chapter's Arabic narrative is accompanied by an English title and summary that the page renders, plus English excerpts of the cited evidence.",
    ["client/src/data/whoIsMuhammadData.ts", "client/src/pages/WhoIsMuhammadPage.tsx"],
    [
      { language: "en", field: "titleEn", at: "client/src/data/whoIsMuhammadData.ts:36" },
      { language: "en", field: "summaryEn", at: "client/src/data/whoIsMuhammadData.ts:40" },
        { language: "en", field: "textEn", at: "client/src/data/whoIsMuhammadData.ts:55" },
      ],
      "The English is a chapter title, a summary and an excerpt of the cited evidence written for this platform; the full narrative itself is Arabic only.",
    ),
  {
    path: "/character",
    kind: "knowledge",
    contentLanguages: ["ar", "en"],
    reason:
        "App.tsx routes /character to WhoIsMuhammadPage with a fixed chapter, so the same English title, summary and evidence excerpts apply.",
      englishCaveat:
        "The English is a chapter title, a summary and an excerpt of the cited evidence written for this platform; the full narrative itself is Arabic only.",
    verifiedIn: ["client/src/App.tsx", "client/src/pages/WhoIsMuhammadPage.tsx"],
    servesContent: [
      { language: "en", field: "titleEn", at: "client/src/data/whoIsMuhammadData.ts:36" },
      { language: "en", field: "summaryEn", at: "client/src/data/whoIsMuhammadData.ts:40" },
    ],
    translations: [ARABIC_ORIGINAL],
  },
  withEnglish(
    "/prophetic-day",
    "Every station renders an English timeframe and, for the active station, the English text of the hadith it cites.",
    ["client/src/data/propheticDailyData.ts", "client/src/pages/PropheticDayPage.tsx"],
    [
      { language: "en", field: "timeframeEn", at: "client/src/data/propheticDailyData.ts:20" },
        { language: "en", field: "hadithTextEn", at: "client/src/data/propheticDailyData.ts:25" },
      ],
      "The English timeframe and hadith text are written for this platform; the devotional framing and reflection around them are Arabic only.",
    ),
  {
    path: "/24-hours",
    kind: "knowledge",
    contentLanguages: ["ar", "en"],
      reason: "App.tsx routes /24-hours to the same PropheticDayPage, so the same English station content applies.",
      englishCaveat:
        "The English timeframe and hadith text are written for this platform; the devotional framing and reflection around them are Arabic only.",
    verifiedIn: ["client/src/App.tsx", "client/src/pages/PropheticDayPage.tsx"],
    servesContent: [
      { language: "en", field: "timeframeEn", at: "client/src/data/propheticDailyData.ts:20" },
      { language: "en", field: "hadithTextEn", at: "client/src/data/propheticDailyData.ts:25" },
    ],
    translations: [ARABIC_ORIGINAL],
  },
  withEnglish(
    "/daily-verse",
    "The verse and its dua are Arabic, but the reader also shows the English translation carried by the local development samples.",
    ["client/src/services/quranService.ts", "client/src/pages/DailyVersePage.tsx"],
    [
        { language: "en", field: "translation", at: "client/src/services/quranService.ts:975" },
      ],
      "The English is a local development sample translation, not a governed edition; the governed editions are only available on the Quran route.",
    ),
  arabicOnly(
    "/prayer-guide",
    "PrayerGuide labels and devotional classifications are Arabic, and the step dataset is currently empty so no passage renders at all.",
    ["client/src/data/prayerGuideData.ts", "client/src/pages/PrayerGuidePage.tsx"],
  ),
  arabicOnly(
    "/islamic-knowledge",
    "Knowledge topics and categories are Arabic; the dataset is currently empty so no article renders.",
    ["client/src/data/islamicKnowledgeData.ts", "client/src/pages/IslamicKnowledgePage.tsx"],
  ),
  arabicOnly(
    "/five-pillars",
    "FivePillarsPage records the pillars' rulings, conditions, benefits and detailed reasoning in Arabic only.",
    ["client/src/pages/FivePillarsPage.tsx"],
  ),
  arabicOnly(
    "/women-in-islam",
    "WomenInIslamPage records its questions, answers and cited evidence in Arabic only.",
    ["client/src/pages/WomenInIslamPage.tsx"],
  ),
  arabicOnly(
    "/calendar",
    "Month and weekday names come from Intl in the Arabic locale and the AlAdhan response contributes numeric times only; the calculation-method names are Arabic.",
    ["client/src/pages/IslamicCalendarPage.tsx", "client/src/hooks/usePrayerTimes.ts"],
  ),
  withEnglish(
    "/digital-tasbih",
    "Each dhikr shows its Arabic text and reward alongside an English translation, which the counter renders beneath the Arabic.",
    ["client/src/pages/DigitalTasbihPage.tsx"],
    [
        { language: "en", field: "translation", at: "client/src/pages/DigitalTasbihPage.tsx:29" },
      ],
      "The English is a short rendering written beside the Arabic dhikr, not a published translation of a canonical collection.",
    ),
  arabicOnly(
    "/qibla-compass",
    "QiblaCompass renders Arabic city names, direction labels and instructions; the calculation is numeric.",
    ["client/src/pages/QiblaCompassPage.tsx"],
  ),
  {
    path: "/ai-assistant",
    kind: "redirect",
    contentLanguages: [],
    reason: "Redirects to /basirah and asserts no content of its own.",
    verifiedIn: ["client/src/App.tsx"],
    servesContent: [],
    translations: [],
  },
  {
    path: "/al-mufti-al-mubeen",
    kind: "redirect",
    contentLanguages: [],
    reason: "Redirects to /basirah and asserts no content of its own.",
    verifiedIn: ["client/src/App.tsx"],
    servesContent: [],
    translations: [],
  },
];

export const CONTENT_LANGUAGE_FACTS = {
  declaredRoutes: ROUTE_CONTENT_DECLARATIONS.length,
  contentLanguages: [...new Set(ROUTE_CONTENT_DECLARATIONS.flatMap((item) => item.contentLanguages))],
  routesServingEnglish: ROUTE_CONTENT_DECLARATIONS.filter((item) =>
    item.contentLanguages.includes("en"),
  ).length,
} as const;

export function routeContentDeclaration(pathname: string): RouteContentDeclaration | undefined {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return ROUTE_CONTENT_DECLARATIONS.find((declaration) => declaration.path === normalized);
}

/**
 * What a reader is actually looking at. This is derived, never hand-labelled,
 * so a declaration cannot describe its own shape incorrectly.
 *
 *  - `no_content` — navigation or a redirect, asserting nothing.
 *  - `arabic_only` — recorded Arabic and nothing else.
 *  - `partly_translated` — Arabic plus English the reader did **not** choose,
 *    shown unconditionally beside the Arabic. This is the case that needs a
 *    disclosure: an English interface can read a page whose substance is still
 *    Arabic without being told so.
 *  - `selectable_translations` — the non-Arabic content is a governed edition
 *    the reader picks from a labelled list, so there is no mismatch to report.
 */
export type ContentShape =
  | "no_content"
  | "arabic_only"
  | "partly_translated"
  | "selectable_translations";

export function contentShape(declaration: RouteContentDeclaration): ContentShape {
  if (declaration.kind !== "knowledge") return "no_content";
  if (declaration.contentLanguages.length === 1 && declaration.contentLanguages[0] === "ar") {
    return "arabic_only";
  }
  if (declaration.servesContent.length > 0) return "partly_translated";
  if (
    declaration.translations.some(
      (item) => item.language !== "ar" && item.edition !== null,
    )
  ) {
    return "selectable_translations";
  }
  return "partly_translated";
}

/** True when the route serves recorded material that is Arabic and nothing else. */
export function isArabicOnly(declaration: RouteContentDeclaration): boolean {
  return contentShape(declaration) === "arabic_only";
}

export interface ContentLanguageNotice {
  /** Always bilingual so the notice is readable in either interface language. */
  textAr: string;
  textEn: string;
  /** Which of the three honest states produced this notice. */
  shape: ContentShape;
  /** Languages the route actually serves, named so the reader can see the boundary. */
  available: readonly ContentLanguage[];
  contentLanguages: readonly ContentLanguage[];
  /** What kind of English this is, on a partly-translated route. */
  englishCaveat: string | null;
  uiLang: UiLang;
  reason: string;
}

/** The language every recorded passage is authored in. */
const PRIMARY_CONTENT_LANGUAGE: ContentLanguage = "ar";

const LANGUAGE_NAMES: Record<ContentLanguage, { ar: string; en: string }> = {
  ar: { ar: "العربية", en: "Arabic" },
  en: { ar: "الإنجليزية", en: "English" },
  fr: { ar: "الفرنسية", en: "French" },
  ur: { ar: "الأردية", en: "Urdu" },
};

export function languageName(language: ContentLanguage, uiLang: UiLang): string {
  return LANGUAGE_NAMES[language][uiLang];
}

/** A governed edition the reader can actually choose, not just be told about. */
export interface TranslationChoice {
  readonly language: ContentLanguage;
  readonly edition: string;
  readonly translator: string;
  readonly labelAr: string;
  readonly labelEn: string;
}

/**
 * The editions a route really offers, taken from its declaration rather than
 * from a hand-written list. The Quran study-mode picker used to hardcode its
 * own three options, which meant the reader was never shown the edition
 * identity and a fourth server edition would have appeared nowhere.
 */
export function translationChoices(pathname: string): TranslationChoice[] {
  const declaration = routeContentDeclaration(pathname);
  if (!declaration) return [];
  return declaration.translations
    .filter(
      (item): item is RouteTranslation & { edition: string; translator: string } =>
        item.language !== "ar" && item.edition !== null && item.translator !== null,
    )
    .map((item) => ({
      language: item.language,
      edition: item.edition,
      translator: item.translator,
      labelAr: `${LANGUAGE_NAMES[item.language].ar} · ${item.edition} · ${item.translator}`,
      labelEn: `${LANGUAGE_NAMES[item.language].en} · ${item.edition} · ${item.translator}`,
    }));
}

/**
 * Returns a notice only when the interface language cannot present the recorded
 * content. An Arabic interface over Arabic-only content needs no notice, a
 * bilingual route can serve an English interface, and a route that carries no
 * content of its own says nothing.
 */
export function contentLanguageNotice(
  pathname: string,
  uiLang: UiLang,
): ContentLanguageNotice | null {
  const declaration = routeContentDeclaration(pathname);
  if (!declaration) return null;

  const shape = contentShape(declaration);
  if (shape === "no_content") return null;
  // Choosing a governed edition from a labelled list is not a mismatch, so a
  // route whose only non-Arabic content is selectable says nothing.
  if (shape === "selectable_translations") return null;
  // The primary recorded language is Arabic, so an Arabic interface can always
  // present the material as it stands.
  if (uiLang === PRIMARY_CONTENT_LANGUAGE) return null;

  const available = declaration.contentLanguages.filter((language) => language !== "ar");
  const named = available
    .map((language) => languageName(language, uiLang))
    .join(uiLang === "ar" ? "، " : ", ");

  let textEn: string;
  let textAr: string;
  if (shape === "arabic_only") {
    textEn =
      "The interface is in English, but this content is recorded in Arabic only and has not been translated.";
    textAr = "الواجهة بالإنجليزية، لكن هذا المحتوى مسجَّل بالعربية فقط ولم يُترجم.";
  } else if (shape === "partly_translated") {
    textEn =
      "The interface is in English. Part of this page appears in English, but the recorded material is Arabic and anything not shown in English is untranslated.";
    textAr =
      "الواجهة بالإنجليزية. يظهر جزء من هذه الصفحة بالإنجليزية، لكن المادة المسجَّلة بالعربية، وما لا يظهر بالإنجليزية فهو غير مترجم.";
  } else {
    textEn = `The interface is in English. The recorded material is in ${named}; it is not an English edition.`;
    textAr = `الواجهة بالإنجليزية، والمادة المسجَّلة بـ${named}، وليست نسخة إنجليزية.`;
  }

  return {
    textEn,
    textAr,
    shape,
    available,
    contentLanguages: declaration.contentLanguages,
    englishCaveat: declaration.englishCaveat ?? null,
    uiLang,
    reason: declaration.reason,
  };
}
