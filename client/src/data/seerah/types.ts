/**
 * Structured seerah database types.
 *
 * This layer is deliberately separate from `seerahData.ts` (the eight
 * narrative chapters). The chapters remain the editorial reading path; this
 * database is the chronological, cross-referenced record behind it.
 *
 * Honesty rules:
 * - Every event is `pending_review` until a named human reviewer signs it off.
 * - Quran references are verified against the bundled Tanzil corpus by tests.
 * - Hadith references either point at a local development sample or are
 *   explicitly marked `external_reference_only` (book/chapter, never an
 *   invented number or quotation).
 * - Place coordinates are approximate modern identifications, not a
 *   historical survey and never a claim of exact battlefield geometry.
 */

export type SeerahReviewStatus = "pending_review";

export type SeerahEventPrecision =
  | "exact_day"
  | "month_year"
  | "year_only"
  | "approximate"
  | "undated";

export type SeerahCertainty =
  | "established"
  | "well_reported"
  | "reported"
  | "disputed";

export type SeerahEraId =
  | "pre-birth"
  | "makkah-childhood"
  | "makkah-youth"
  | "makkah-revelation"
  | "makkah-persecution"
  | "hijrah"
  | "madinah-foundation"
  | "madinah-defense"
  | "madinah-consolidation"
  | "farewell-death";

export type SeerahSourceGenre =
  | "quran"
  | "hadith"
  | "sira"
  | "maghazi"
  | "tarikh"
  | "dalail"
  | "rijal";

export type SeerahPersonCategory =
  | "family"
  | "companion"
  | "child"
  | "opponent"
  | "ally"
  | "ruler";

export interface SeerahEra {
  id: SeerahEraId;
  order: number;
  titleAr: string;
  titleEn: string;
  rangeAr: string;
  summaryAr: string;
  visualKey: string;
}

export interface SeerahQuranRef {
  surah: number;
  ayahStart: number;
  ayahEnd: number;
  /** Why this passage is connected to the event, in editorial Arabic. */
  noteAr: string;
}

export type SeerahHadithRef =
  | {
      kind: "local_sample";
      sampleId: string;
      noteAr: string;
    }
  | {
      kind: "external_reference";
      collectionId: string;
      bookNameAr: string;
      chapterNameAr: string;
      noteAr: string;
      verification: "external_reference_only";
    };

export interface SeerahCitation {
  sourceId: string;
  /** Chapter-level locus only. Page numbers are not guessed. */
  locusAr: string;
}

export interface SeerahEvent {
  id: string;
  order: number;
  eraId: SeerahEraId;
  chapterId: string;
  titleAr: string;
  titleEn: string;
  yearAH: number | null;
  yearCE: number | null;
  dateTextAr: string;
  precision: SeerahEventPrecision;
  certainty: SeerahCertainty;
  placeId: string | null;
  summaryAr: string;
  significanceAr: string;
  quranRefs: SeerahQuranRef[];
  hadithRefs: SeerahHadithRef[];
  peopleIds: string[];
  sources: SeerahCitation[];
  visualKey: string;
  tags: string[];
  reviewStatus: SeerahReviewStatus;
  noteAr?: string;
}

export interface SeerahPerson {
  id: string;
  nameAr: string;
  nameEn: string;
  category: SeerahPersonCategory;
  relationAr: string;
  deathYearAH: number | null;
  deathYearCE: number | null;
  noteAr: string;
  sourceIds: string[];
  reviewStatus: SeerahReviewStatus;
}

export interface SeerahPlaceGeo {
  lat: number;
  lng: number;
  certainty: "approximate_modern_identification";
  noteAr: string;
}

export interface SeerahPlace {
  id: string;
  nameAr: string;
  nameEn: string;
  regionAr: string;
  /** Optional name of the existing schematic atlas node, resolved by name. */
  atlasName?: string;
  geoApprox?: SeerahPlaceGeo;
  noteAr: string;
}

export interface SeerahSource {
  id: string;
  titleAr: string;
  authorAr: string;
  authorDeathHijri: number | null;
  genre: SeerahSourceGenre;
  authorityNoteAr: string;
  reviewStatus: SeerahReviewStatus;
}

export interface SeerahDatabase {
  eras: SeerahEra[];
  events: SeerahEvent[];
  people: SeerahPerson[];
  places: SeerahPlace[];
  sources: SeerahSource[];
}

export interface SeerahIntegrityIssue {
  kind:
    | "duplicate-id"
    | "unknown-era"
    | "unknown-chapter"
    | "unknown-place"
    | "unknown-person"
    | "unknown-source"
    | "unknown-local-hadith-sample"
    | "unknown-visual-key"
    | "quran-ref-missing"
    | "quran-ref-range"
    | "empty-sources"
    | "empty-people"
    | "order-not-monotonic"
    | "bad-year"
    | "empty-summary"
    | "unreviewed-record"
    | "missing-era-events";
  recordId: string;
  detail: string;
}

export const SEERAH_DATABASE_STATUS = {
  materialKind: "chronological-editorial-database",
  scholarlyReview: "pending",
  editionReview: "pending",
  quranText: "tanzil-uthmani-min-1.1-verified",
  hadithScope: "local-samples-plus-external-book-level-references",
  placeGeometry: "approximate-modern-identifications-not-a-survey",
  noticeAr:
    "قاعدة تحريرية زمنية جامعة؛ النصوص القرآنية مطابقة لنسخة تنزيل المحلية، أما الإحالات الحديثية والمواضع فهي إحالات مرجعية ومراجعة علمية معلّقة. لا تُعد مادة منشورة نهائيًا ولا تُغني عن كتب السيرة المحققة.",
  noticeEn:
    "Chronological editorial database. Quranic text matches the bundled Tanzil corpus; hadith and place references remain pending scholarly review. Not a final publication edition.",
} as const;
