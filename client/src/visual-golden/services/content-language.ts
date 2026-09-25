import type { UiLang } from "@/visual-golden/lib/institution/store";

/**
 * UI language and content language are different things.
 *
 * The interface can be switched to English, but the knowledge itself is
 * recorded in Arabic and is not machine-translated. Silently mixing an English
 * interface around Arabic content reads as "this is the English edition", which
 * it is not. Every route therefore declares what it actually serves, and the
 * shell says so out loud when the interface language does not match.
 *
 * Only routes verified from their own data are listed. Anything unlisted is
 * treated as "no declaration", which means no claim is made in either
 * direction — an unverified route must never be asserted as translated.
 */
export type ContentLanguage = "ar";

export interface RouteContentDeclaration {
  path: string;
  contentLanguage: ContentLanguage;
  /** Why this route serves Arabic-only content, in reviewable terms. */
  reason: string;
}

export const ROUTE_CONTENT_DECLARATIONS: RouteContentDeclaration[] = [
  {
    path: "/seerah",
    contentLanguage: "ar",
    reason: "seerahData chapters, details and timeline events are recorded in Arabic only.",
  },
  {
    path: "/hadith",
    contentLanguage: "ar",
    reason: "Hadith matn and provider notices are recorded in Arabic; no translated edition exists.",
  },
  {
    path: "/sunnah",
    contentLanguage: "ar",
    reason: "Same Hadith surface as /hadith; the matn is Arabic only.",
  },
  {
    path: "/atlas",
    contentLanguage: "ar",
    reason: "Atlas place names come from the Arabic timeline-event locations.",
  },
  {
    path: "/who-is-muhammad",
    contentLanguage: "ar",
    reason: "Chapter text is Arabic only; no translated edition is recorded.",
  },
  {
    path: "/kids",
    contentLanguage: "ar",
    reason: "Children adaptations are recorded in Arabic; cleared media count is 0.",
  },
  {
    path: "/digital-tasbih",
    contentLanguage: "ar",
    reason: "Dhikr text and counter labels are Arabic only.",
  },
  {
    path: "/daily-verse",
    contentLanguage: "ar",
    reason: "The daily dua and verse commentary text are Arabic only.",
  },
];

export interface ContentLanguageNotice {
  /** Always bilingual so the notice is readable in either interface language. */
  textAr: string;
  textEn: string;
  contentLanguage: ContentLanguage;
  uiLang: UiLang;
  reason: string;
}

export function routeContentDeclaration(pathname: string): RouteContentDeclaration | undefined {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return ROUTE_CONTENT_DECLARATIONS.find((declaration) => declaration.path === normalized);
}

/**
 * Returns a notice only when the interface language cannot present the content
 * as-is. An Arabic interface over Arabic content needs no notice; neither does
 * a route that declares nothing.
 */
export function contentLanguageNotice(
  pathname: string,
  uiLang: UiLang,
): ContentLanguageNotice | null {
  const declaration = routeContentDeclaration(pathname);
  if (!declaration) return null;
  if (declaration.contentLanguage === uiLang) return null;

  return {
    textAr: "الواجهة بالإنجليزية، لكن هذا المحتوى مسجَّل بالعربية فقط ولم يُترجم.",
    textEn: "The interface is in English, but this content is recorded in Arabic only and has not been translated.",
    contentLanguage: declaration.contentLanguage,
    uiLang,
    reason: declaration.reason,
  };
}

export const CONTENT_LANGUAGE_FACTS = {
  declaredRoutes: ROUTE_CONTENT_DECLARATIONS.length,
  contentLanguages: [...new Set(ROUTE_CONTENT_DECLARATIONS.map((item) => item.contentLanguage))],
} as const;
