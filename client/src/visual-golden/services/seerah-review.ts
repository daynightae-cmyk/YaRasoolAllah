import { art } from "@/visual-golden/mock/art";
import {
  SEERAH_DATABASE,
  resolveHadithRef,
  resolveQuranRef,
  type SeerahEvent,
  type SeerahPerson,
  type SeerahPlace,
  type SeerahSource,
} from "@/visual-golden/services/seerah-database";

/**
 * A per-record review checklist for the Seerah database.
 *
 * This module never changes a record's review status and never signs a
 * record off. It makes the pre-review state auditable: every technical check
 * is recorded with its evidence, and the human scholarly gate stays open
 * until a named reviewer writes a decision.
 */

export const SEERAH_REVIEW_CHECKLIST_VERSION = "2026-11-20";

export const SEERAH_REVIEW_POLICY = {
  autoApproval: false,
  humanReviewRequired: true,
  scholarlyReviewStatus: "pending",
  editionReviewStatus: "pending",
  sacredDepictionForbidden: true,
  noteAr:
    "هذه قائمة فحص تقنية تمهيدية، وليست مراجعة علمية ولا اعتمادًا. لا يُغلق أي سجل إلا بتوقيع مراجع بشري مسمّى وتاريخ مراجعة وقرار مكتوب.",
  noteEn:
    "This is a technical preflight checklist, not a scholarly review or an approval. A record stays open until a named human reviewer signs a decision with a date.",
} as const;

export type SeerahReviewChecklistStatus = "verified" | "open" | "not_applicable";
export type SeerahReviewRecordType = "event" | "person" | "place" | "source";

export interface SeerahReviewChecklistItem {
  key: string;
  labelAr: string;
  labelEn: string;
  status: SeerahReviewChecklistStatus;
  evidenceAr: string;
  evidenceEn: string;
}

export interface SeerahReviewChecklistRecord {
  recordType: SeerahReviewRecordType;
  recordId: string;
  titleAr: string;
  titleEn: string;
  reviewStatus: "pending_review";
  reviewStatusSource: "record" | "checklist";
  provenance: {
    certainty: string | null;
    precision: string | null;
    sourceCount: number;
    quranRefCount: number;
    hadithRefCount: number;
    peopleCount: number;
    placeId: string | null;
    atlasName: string | null;
    visualKey: string | null;
  };
  checklist: SeerahReviewChecklistItem[];
  humanReview: {
    required: true;
    reviewer: null;
    reviewerRole: null;
    reviewedAt: null;
    decision: null;
    noteAr: string;
    noteEn: string;
  };
}

export interface SeerahReviewChecklist {
  version: string;
  generatedFor: string;
  policy: typeof SEERAH_REVIEW_POLICY;
  summary: SeerahReviewChecklistSummary;
  records: SeerahReviewChecklistRecord[];
}

export interface SeerahReviewChecklistSummary {
  records: {
    events: number;
    people: number;
    places: number;
    sources: number;
    total: number;
  };
  humanReview: {
    required: number;
    signed: number;
    pending: number;
  };
  technical: {
    verified: number;
    open: number;
    notApplicable: number;
  };
  openItemsByKey: Record<string, number>;
  recordsWithOpenTechnicalItems: number;
  certainty: Record<string, number>;
  precision: Record<string, number>;
  places: {
    withAtlasName: number;
    withoutAtlasName: number;
  };
  events: {
    withPlace: number;
    withoutPlace: number;
    withAtlasLink: number;
    withoutAtlasLink: number;
  };
}

const HUMAN_REVIEW_ITEM: SeerahReviewChecklistItem = {
  key: "human-scholarly-review",
  labelAr: "مراجعة علمية بشرية مسمّاة",
  labelEn: "Named human scholarly review",
  status: "open",
  evidenceAr:
    "لا يوجد مراجع بشري مسمّى ولا تاريخ مراجعة ولا قرار مكتوب. السجل باقٍ على pending_review.",
  evidenceEn:
    "No named human reviewer, review date, or written decision exists. The record remains pending_review.",
};

const EDITION_REVIEW_ITEM: SeerahReviewChecklistItem = {
  key: "edition-review",
  labelAr: "مراجعة الطبعة والترجمة",
  labelEn: "Edition and translation review",
  status: "open",
  evidenceAr:
    "لا توجد طبعة منشورة معتمدة ولا ترجمة إنجليزية معتمدة لهذا السجل.",
  evidenceEn:
    "No approved published edition or approved English translation exists for this record.",
};

function hasEncodingDamage(value: string): boolean {
  return value.includes("\uFFFD");
}

function collectEncodingEvidence(values: Array<string | null | undefined>): {
  status: SeerahReviewChecklistStatus;
  evidenceAr: string;
  evidenceEn: string;
} {
  const damaged = values.filter((value): value is string => Boolean(value && hasEncodingDamage(value)));
  if (damaged.length === 0) {
    return {
      status: "verified",
      evidenceAr: "لا توجد محارف تالفة (U+FFFD) في حقول السجل.",
      evidenceEn: "No replacement characters (U+FFFD) in the record fields.",
    };
  }
  return {
    status: "open",
    evidenceAr: `توجد ${damaged.length} قيمة فيها محارف تالفة تحتاج إصلاحًا قبل المراجعة.`,
    evidenceEn: `${damaged.length} value(s) contain replacement characters and need repair before review.`,
  };
}

function eventChecklist(event: SeerahEvent): SeerahReviewChecklistItem[] {
  const place = event.placeId
    ? SEERAH_DATABASE.places.find((item) => item.id === event.placeId) ?? null
    : null;
  const people = event.peopleIds
    .map((id) => SEERAH_DATABASE.people.find((person) => person.id === id))
    .filter((person): person is SeerahPerson => Boolean(person));
  const sources = event.sources
    .map((citation) => SEERAH_DATABASE.sources.find((source) => source.id === citation.sourceId))
    .filter((source): source is SeerahSource => Boolean(source));

  const quranRefs = event.quranRefs.map((ref) => {
    const verses = resolveQuranRef(ref);
    return {
      ref,
      resolved: verses.length === ref.ayahEnd - ref.ayahStart + 1 && verses.length > 0,
    };
  });
  const hadithRefs = event.hadithRefs.map((ref) => ({
    ref,
    resolved: resolveHadithRef(ref) !== null,
  }));

  const encoding = collectEncodingEvidence([
    event.titleAr,
    event.titleEn,
    event.dateTextAr,
    event.summaryAr,
    event.significanceAr,
    event.noteAr,
    ...event.tags,
    ...event.sources.map((citation) => citation.locusAr),
  ]);

  const items: SeerahReviewChecklistItem[] = [
    {
      key: "identity",
      labelAr: "هوية السجل وترتيبه",
      labelEn: "Record identity and order",
      status: "verified",
      evidenceAr: `الترتيب ${event.order} · الفصل ${event.chapterId} · المرحلة ${event.eraId}`,
      evidenceEn: `Order ${event.order} · chapter ${event.chapterId} · era ${event.eraId}`,
    },
    {
      key: "source-citation",
      labelAr: "إحالة مصدر واحدة على الأقل",
      labelEn: "At least one source citation",
      status: event.sources.length > 0 ? "verified" : "open",
      evidenceAr:
        event.sources.length > 0
          ? `${event.sources.length} إحالة، منها: ${event.sources
              .slice(0, 3)
              .map((citation) => citation.sourceId)
              .join("، ")}`
          : "لا توجد إحالة مصدر.",
      evidenceEn:
        event.sources.length > 0
          ? `${event.sources.length} citation(s), including: ${event.sources
              .slice(0, 3)
              .map((citation) => citation.sourceId)
              .join(", ")}`
          : "No source citation.",
    },
    {
      key: "source-identity",
      labelAr: "هوية كل مصدر مُحال",
      labelEn: "Every cited source resolves",
      status: sources.length === event.sources.length ? "verified" : "open",
      evidenceAr:
        sources.length === event.sources.length
          ? `كل المصادر (${sources.length}) موجودة في سجل المصادر.`
          : `تعذّر حل ${event.sources.length - sources.length} مصدر.`,
      evidenceEn:
        sources.length === event.sources.length
          ? `All ${sources.length} cited sources exist in the source registry.`
          : `${event.sources.length - sources.length} cited source(s) could not be resolved.`,
    },
    {
      key: "quran-text",
      labelAr: "نص القرآن مطابق لنسخة تنزيل المحلية",
      labelEn: "Quran text matches the local Tanzil corpus",
      status:
        event.quranRefs.length === 0
          ? "not_applicable"
          : quranRefs.every((entry) => entry.resolved)
            ? "verified"
            : "open",
      evidenceAr:
        event.quranRefs.length === 0
          ? "لا توجد إحالات قرآنية في هذا السجل."
          : `${quranRefs.filter((entry) => entry.resolved).length} من ${event.quranRefs.length} إحالة قرآنية تُحل كاملة من النسخة المحلية.`,
      evidenceEn:
        event.quranRefs.length === 0
          ? "This record has no Quran references."
          : `${quranRefs.filter((entry) => entry.resolved).length} of ${event.quranRefs.length} Quran reference(s) resolve completely from the local corpus.`,
    },
    {
      key: "hadith-provenance",
      labelAr: "نسبة الحديث: عينة محلية أو إحالة كتابية فقط",
      labelEn: "Hadith provenance: local sample or book-level reference only",
      status:
        event.hadithRefs.length === 0
          ? "not_applicable"
          : hadithRefs.every((entry) => entry.resolved)
            ? "verified"
            : "open",
      evidenceAr:
        event.hadithRefs.length === 0
          ? "لا توجد إحالات حديثية في هذا السجل."
          : `${hadithRefs.filter((entry) => entry.ref.kind === "local_sample").length} عينة محلية و${hadithRefs.filter((entry) => entry.ref.kind === "external_reference").length} إحالة كتابية فقط، بلا رقم أو نص مخترع.`,
      evidenceEn:
        event.hadithRefs.length === 0
          ? "This record has no hadith references."
          : `${hadithRefs.filter((entry) => entry.ref.kind === "local_sample").length} local sample(s) and ${hadithRefs.filter((entry) => entry.ref.kind === "external_reference").length} book-level reference(s), with no invented number or quotation.`,
    },
    {
      key: "date-precision",
      labelAr: "دقة التاريخ معلنة",
      labelEn: "Date precision is declared",
      status: event.dateTextAr.trim().length > 0 ? "verified" : "open",
      evidenceAr: `الدقة: ${event.precision} · النص: ${event.dateTextAr}`,
      evidenceEn: `Precision: ${event.precision} · text: ${event.dateTextAr}`,
    },
    {
      key: "certainty-label",
      labelAr: "درجة الثبوت معلنة",
      labelEn: "Certainty level is declared",
      status: "verified",
      evidenceAr: `درجة الثبوت المسجلة: ${event.certainty}`,
      evidenceEn: `Recorded certainty: ${event.certainty}`,
    },
    {
      key: "place-relation",
      labelAr: "الموضع المذكور",
      labelEn: "Recorded place relation",
      status: !event.placeId ? "not_applicable" : place ? "verified" : "open",
      evidenceAr: !event.placeId
        ? "لا يوجد موضع مسجل لهذا الحدث."
        : place
          ? `${place.nameAr} (${place.id})`
          : `الموضع ${event.placeId} غير موجود في سجل المواضع.`,
      evidenceEn: !event.placeId
        ? "No place is recorded for this event."
        : place
          ? `${place.nameEn} (${place.id})`
          : `Place ${event.placeId} is missing from the place registry.`,
    },
    {
      key: "atlas-link",
      labelAr: "ربط الموضع بالأطلس التخطيطي",
      labelEn: "Place link to the schematic atlas",
      status: !event.placeId
        ? "not_applicable"
        : place?.atlasName
          ? "verified"
          : "open",
      evidenceAr: !event.placeId
        ? "لا يوجد موضع مسجل، فلا رابط أطلس."
        : place?.atlasName
          ? `عقدة الأطلس المسجلة: ${place.atlasName}`
          : "الموضع مسجل لكن لا توجد عقدة أطلس تخطيطية مقابلة؛ لا يُنشأ رابط خريطة.",
      evidenceEn: !event.placeId
        ? "No place is recorded, so there is no atlas link."
        : place?.atlasName
          ? `Recorded atlas node: ${place.atlasName}`
          : "The place is recorded but has no matching schematic atlas node; no map link is invented.",
    },
    {
      key: "people-relations",
      labelAr: "أشخاص السجل",
      labelEn: "Recorded people relations",
      status:
        event.peopleIds.length === 0
          ? "not_applicable"
          : people.length === event.peopleIds.length
            ? "verified"
            : "open",
      evidenceAr:
        event.peopleIds.length === 0
          ? "لا توجد معرفات أشخاص مسجلة لهذا الحدث."
          : `${people.length} من ${event.peopleIds.length} معرف شخص موجود في سجل الأشخاص.`,
      evidenceEn:
        event.peopleIds.length === 0
          ? "No person identifiers are recorded for this event."
          : `${people.length} of ${event.peopleIds.length} person identifier(s) exist in the people registry.`,
    },
    {
      key: "symbolic-art",
      labelAr: "عمل فني رمزي غير مجسّد",
      labelEn: "Symbolic, non-figurative artwork",
      status: event.visualKey in art ? "verified" : "open",
      evidenceAr:
        event.visualKey in art
          ? `المفتاح ${event.visualKey} مسجل في سجل الفنون الرمزية؛ لا تجسيد للذات النبوية أو الصحابة أو الملائكة.`
          : `المفتاح ${event.visualKey} غير مسجل.`,
      evidenceEn:
        event.visualKey in art
          ? `Key ${event.visualKey} is registered in the symbolic art registry; no depiction of the Prophet, companions, or angels.`
          : `Key ${event.visualKey} is not registered.`,
    },
    {
      key: "encoding",
      labelAr: "سلامة ترميز النص",
      labelEn: "Text encoding integrity",
      status: encoding.status,
      evidenceAr: encoding.evidenceAr,
      evidenceEn: encoding.evidenceEn,
    },
    HUMAN_REVIEW_ITEM,
    EDITION_REVIEW_ITEM,
  ];

  return items;
}

function personChecklist(person: SeerahPerson): SeerahReviewChecklistItem[] {
  const sources = person.sourceIds
    .map((id) => SEERAH_DATABASE.sources.find((source) => source.id === id))
    .filter((source): source is SeerahSource => Boolean(source));
  const encoding = collectEncodingEvidence([person.nameAr, person.nameEn, person.relationAr, person.noteAr]);

  return [
    {
      key: "identity",
      labelAr: "هوية الشخص",
      labelEn: "Person identity",
      status: person.nameAr.trim() && person.nameEn.trim() ? "verified" : "open",
      evidenceAr: `${person.nameAr} · ${person.nameEn} · ${person.category}`,
      evidenceEn: `${person.nameEn} · ${person.category}`,
    },
    {
      key: "source-identity",
      labelAr: "مصادر الشخص",
      labelEn: "Person sources",
      status:
        person.sourceIds.length > 0 && sources.length === person.sourceIds.length
          ? "verified"
          : "open",
      evidenceAr:
        person.sourceIds.length > 0 && sources.length === person.sourceIds.length
          ? `${sources.length} مصدرًا موجودًا.`
          : `المصادر المسجلة ${person.sourceIds.length} والمحلولة ${sources.length}.`,
      evidenceEn:
        person.sourceIds.length > 0 && sources.length === person.sourceIds.length
          ? `${sources.length} source(s) resolve.`
          : `${person.sourceIds.length} source(s) recorded, ${sources.length} resolved.`,
    },
    {
      key: "death-date",
      labelAr: "سنة الوفاة",
      labelEn: "Death year",
      status:
        person.deathYearAH === null && person.deathYearCE === null ? "not_applicable" : "verified",
      evidenceAr:
        person.deathYearAH === null && person.deathYearCE === null
          ? "لا توجد سنة وفاة معلنة؛ لا يُخترع تاريخ."
          : `${person.deathYearAH ?? "غير مسجل"} هـ / ${person.deathYearCE ?? "غير مسجل"} م`,
      evidenceEn:
        person.deathYearAH === null && person.deathYearCE === null
          ? "No death year is claimed; no date is invented."
          : `${person.deathYearAH ?? "not recorded"} AH / ${person.deathYearCE ?? "not recorded"} CE`,
    },
    {
      key: "relation",
      labelAr: "صلة الشخص بالسيرة",
      labelEn: "Person relation",
      status: person.relationAr.trim() ? "verified" : "open",
      evidenceAr: person.relationAr || "لا توجد صلة مسجلة.",
      evidenceEn: person.relationAr || "No relation is recorded.",
    },
    {
      key: "encoding",
      labelAr: "سلامة ترميز النص",
      labelEn: "Text encoding integrity",
      status: encoding.status,
      evidenceAr: encoding.evidenceAr,
      evidenceEn: encoding.evidenceEn,
    },
    HUMAN_REVIEW_ITEM,
    EDITION_REVIEW_ITEM,
  ];
}

function placeChecklist(place: SeerahPlace): SeerahReviewChecklistItem[] {
  const encoding = collectEncodingEvidence([place.nameAr, place.nameEn, place.regionAr, place.noteAr]);
  const geo = place.geoApprox;
  const geoValid =
    Boolean(geo) &&
    geo!.certainty === "approximate_modern_identification" &&
    geo!.lat >= -90 &&
    geo!.lat <= 90 &&
    geo!.lng >= -180 &&
    geo!.lng <= 180;

  return [
    {
      key: "identity",
      labelAr: "هوية الموضع",
      labelEn: "Place identity",
      status: place.nameAr.trim() && place.nameEn.trim() && place.regionAr.trim() ? "verified" : "open",
      evidenceAr: `${place.nameAr} · ${place.regionAr}`,
      evidenceEn: `${place.nameEn} · ${place.regionAr}`,
    },
    {
      key: "coordinates",
      labelAr: "إحداثيات تقريبية معلنة",
      labelEn: "Declared approximate coordinates",
      status: !geo ? "not_applicable" : geoValid ? "verified" : "open",
      evidenceAr: !geo
        ? "لا توجد إحداثيات معلنة لهذا الموضع."
        : geoValid
          ? `إحداثيات تقريبية (${geo.lat}, ${geo.lng}) بدرجة «${geo.certainty}» — ليست مسحًا ميدانيًا.`
          : "الإحداثيات المعلنة لا تطابق عقد الإحداثيات التقريبية.",
      evidenceEn: !geo
        ? "No coordinates are claimed for this place."
        : geoValid
          ? `Approximate coordinates (${geo.lat}, ${geo.lng}) marked «${geo.certainty}» — not a field survey.`
          : "The declared coordinates do not match the approximate-identification contract.",
    },
    {
      key: "atlas-mapping",
      labelAr: "ربط الموضع بعقدة أطلس",
      labelEn: "Atlas node mapping",
      status: place.atlasName ? "verified" : "open",
      evidenceAr: place.atlasName
        ? `عقدة الأطلس: ${place.atlasName}`
        : "لا توجد عقدة أطلس تخطيطية مقابلة؛ الربط مفتوح للمراجعة.",
      evidenceEn: place.atlasName
        ? `Atlas node: ${place.atlasName}`
        : "No matching schematic atlas node; the link remains open for review.",
    },
    {
      key: "encoding",
      labelAr: "سلامة ترميز النص",
      labelEn: "Text encoding integrity",
      status: encoding.status,
      evidenceAr: encoding.evidenceAr,
      evidenceEn: encoding.evidenceEn,
    },
    HUMAN_REVIEW_ITEM,
    EDITION_REVIEW_ITEM,
  ];
}

function sourceChecklist(source: SeerahSource): SeerahReviewChecklistItem[] {
  const encoding = collectEncodingEvidence([
    source.titleAr,
    source.authorAr,
    source.authorityNoteAr,
  ]);

  return [
    {
      key: "identity",
      labelAr: "هوية المصدر",
      labelEn: "Source identity",
      status: source.titleAr.trim() && source.authorAr.trim() ? "verified" : "open",
      evidenceAr: `${source.titleAr} · ${source.authorAr}`,
      evidenceEn: `${source.titleAr} · ${source.authorAr}`,
    },
    {
      key: "authority-note",
      labelAr: "ملاحظة السلطة العلمية",
      labelEn: "Scholarly authority note",
      status: source.authorityNoteAr.trim() ? "verified" : "open",
      evidenceAr: source.authorityNoteAr || "لا توجد ملاحظة سلطة علمية.",
      evidenceEn: source.authorityNoteAr || "No scholarly authority note.",
    },
    {
      key: "genre",
      labelAr: "نوع المصدر",
      labelEn: "Source genre",
      status: "verified",
      evidenceAr: `النوع المسجل: ${source.genre}`,
      evidenceEn: `Recorded genre: ${source.genre}`,
    },
    {
      key: "encoding",
      labelAr: "سلامة ترميز النص",
      labelEn: "Text encoding integrity",
      status: encoding.status,
      evidenceAr: encoding.evidenceAr,
      evidenceEn: encoding.evidenceEn,
    },
    HUMAN_REVIEW_ITEM,
    EDITION_REVIEW_ITEM,
  ];
}

function humanReview(): SeerahReviewChecklistRecord["humanReview"] {
  return {
    required: true,
    reviewer: null,
    reviewerRole: null,
    reviewedAt: null,
    decision: null,
    noteAr:
      "لا يُملأ هذا الحقل تلقائيًا. يلزم مراجع بشري مسمّى، وتاريخ، وقرار مكتوب، قبل أي تغيير لحالة السجل.",
    noteEn:
      "This field is never filled automatically. A named human reviewer, a date, and a written decision are required before any status change.",
  };
}

export function buildSeerahReviewChecklist(): SeerahReviewChecklist {
  const records: SeerahReviewChecklistRecord[] = [];

  for (const event of SEERAH_DATABASE.events) {
    const place = event.placeId
      ? SEERAH_DATABASE.places.find((item) => item.id === event.placeId) ?? null
      : null;
    records.push({
      recordType: "event",
      recordId: event.id,
      titleAr: event.titleAr,
      titleEn: event.titleEn,
      reviewStatus: event.reviewStatus,
      reviewStatusSource: "record",
      provenance: {
        certainty: event.certainty,
        precision: event.precision,
        sourceCount: event.sources.length,
        quranRefCount: event.quranRefs.length,
        hadithRefCount: event.hadithRefs.length,
        peopleCount: event.peopleIds.length,
        placeId: event.placeId,
        atlasName: place?.atlasName ?? null,
        visualKey: event.visualKey,
      },
      checklist: eventChecklist(event),
      humanReview: humanReview(),
    });
  }

  for (const person of SEERAH_DATABASE.people) {
    records.push({
      recordType: "person",
      recordId: person.id,
      titleAr: person.nameAr,
      titleEn: person.nameEn,
      reviewStatus: person.reviewStatus,
      reviewStatusSource: "record",
      provenance: {
        certainty: null,
        precision: null,
        sourceCount: person.sourceIds.length,
        quranRefCount: 0,
        hadithRefCount: 0,
        peopleCount: 0,
        placeId: null,
        atlasName: null,
        visualKey: null,
      },
      checklist: personChecklist(person),
      humanReview: humanReview(),
    });
  }

  for (const place of SEERAH_DATABASE.places) {
    records.push({
      recordType: "place",
      recordId: place.id,
      titleAr: place.nameAr,
      titleEn: place.nameEn,
      reviewStatus: "pending_review",
      reviewStatusSource: "checklist",
      provenance: {
        certainty: place.geoApprox?.certainty ?? null,
        precision: null,
        sourceCount: 0,
        quranRefCount: 0,
        hadithRefCount: 0,
        peopleCount: 0,
        placeId: place.id,
        atlasName: place.atlasName ?? null,
        visualKey: null,
      },
      checklist: placeChecklist(place),
      humanReview: humanReview(),
    });
  }

  for (const source of SEERAH_DATABASE.sources) {
    records.push({
      recordType: "source",
      recordId: source.id,
      titleAr: source.titleAr,
      titleEn: source.titleAr,
      reviewStatus: source.reviewStatus,
      reviewStatusSource: "record",
      provenance: {
        certainty: null,
        precision: null,
        sourceCount: 0,
        quranRefCount: 0,
        hadithRefCount: 0,
        peopleCount: 0,
        placeId: null,
        atlasName: null,
        visualKey: null,
      },
      checklist: sourceChecklist(source),
      humanReview: humanReview(),
    });
  }

  const openItemsByKey: Record<string, number> = {};
  let verified = 0;
  let open = 0;
  let notApplicable = 0;
  let recordsWithOpenTechnicalItems = 0;

  for (const record of records) {
    let hasOpenTechnical = false;
    for (const item of record.checklist) {
      if (item.status === "verified") verified += 1;
      else if (item.status === "open") {
        open += 1;
        if (item.key !== "human-scholarly-review" && item.key !== "edition-review") {
          hasOpenTechnical = true;
          openItemsByKey[item.key] = (openItemsByKey[item.key] ?? 0) + 1;
        }
      } else {
        notApplicable += 1;
      }
    }
    if (hasOpenTechnical) recordsWithOpenTechnicalItems += 1;
  }

  const certainty: Record<string, number> = {};
  const precision: Record<string, number> = {};
  for (const event of SEERAH_DATABASE.events) {
    certainty[event.certainty] = (certainty[event.certainty] ?? 0) + 1;
    precision[event.precision] = (precision[event.precision] ?? 0) + 1;
  }

  const withAtlasName = SEERAH_DATABASE.places.filter((place) => place.atlasName).length;
  const eventsWithPlace = SEERAH_DATABASE.events.filter((event) => event.placeId).length;
  const eventsWithAtlasLink = SEERAH_DATABASE.events.filter((event) => {
    if (!event.placeId) return false;
    const place = SEERAH_DATABASE.places.find((item) => item.id === event.placeId);
    return Boolean(place?.atlasName);
  }).length;

  return {
    version: SEERAH_REVIEW_CHECKLIST_VERSION,
    generatedFor: SEERAH_REVIEW_CHECKLIST_VERSION,
    policy: SEERAH_REVIEW_POLICY,
    summary: {
      records: {
        events: SEERAH_DATABASE.events.length,
        people: SEERAH_DATABASE.people.length,
        places: SEERAH_DATABASE.places.length,
        sources: SEERAH_DATABASE.sources.length,
        total: records.length,
      },
      humanReview: {
        required: records.length,
        signed: 0,
        pending: records.length,
      },
      technical: { verified, open, notApplicable },
      openItemsByKey,
      recordsWithOpenTechnicalItems,
      certainty,
      precision,
      places: {
        withAtlasName,
        withoutAtlasName: SEERAH_DATABASE.places.length - withAtlasName,
      },
      events: {
        withPlace: eventsWithPlace,
        withoutPlace: SEERAH_DATABASE.events.length - eventsWithPlace,
        withAtlasLink: eventsWithAtlasLink,
        withoutAtlasLink: eventsWithPlace - eventsWithAtlasLink,
      },
    },
    records,
  };
}

export function renderSeerahReviewSummary(checklist: SeerahReviewChecklist): string {
  const { summary } = checklist;
  const lines: string[] = [
    "# Seerah review checklist summary",
    "",
    `Version: ${checklist.version}`,
    "",
    "> This is a technical preflight, not a scholarly review or an approval.",
    "> Every record remains `pending_review`; the human review fields are empty.",
    "",
    "## Record coverage",
    "",
    "| Type | Records | Human review signed | Pending |",
    "|---|---:|---:|---:|",
    `| Events | ${summary.records.events} | 0 | ${summary.records.events} |`,
    `| People | ${summary.records.people} | 0 | ${summary.records.people} |`,
    `| Places | ${summary.records.places} | 0 | ${summary.records.places} |`,
    `| Sources | ${summary.records.sources} | 0 | ${summary.records.sources} |`,
    `| **Total** | **${summary.records.total}** | **0** | **${summary.records.total}** |`,
    "",
    "## Technical preflight",
    "",
    `- Verified checks: ${summary.technical.verified}`,
    `- Open checks (including human/edition review): ${summary.technical.open}`,
    `- Not applicable checks: ${summary.technical.notApplicable}`,
    `- Records with open non-human technical items: ${summary.recordsWithOpenTechnicalItems}`,
    "",
    "### Open non-human items by key",
    "",
  ];

  const keys = Object.keys(summary.openItemsByKey).sort();
  if (keys.length === 0) {
    lines.push("- None.");
  } else {
    for (const key of keys) {
      lines.push(`- \`${key}\`: ${summary.openItemsByKey[key]}`);
    }
  }

  lines.push(
    "",
    "## Provenance declared by the records",
    "",
    "| Certainty | Events |",
    "|---|---:|",
  );
  for (const key of Object.keys(summary.certainty).sort()) {
    lines.push(`| ${key} | ${summary.certainty[key]} |`);
  }

  lines.push("", "| Date precision | Events |", "|---|---:|");
  for (const key of Object.keys(summary.precision).sort()) {
    lines.push(`| ${key} | ${summary.precision[key]} |`);
  }

  lines.push(
    "",
    "## Atlas linkage",
    "",
    `- Places with a recorded atlas node: ${summary.places.withAtlasName}`,
    `- Places without a recorded atlas node: ${summary.places.withoutAtlasName}`,
    `- Events with a place: ${summary.events.withPlace}`,
    `- Events with a place but no atlas link: ${summary.events.withoutAtlasLink}`,
    "",
    "## Boundary",
    "",
    "No record was approved, published, or given a scholarly decision by this checklist.",
    "A named human reviewer must fill `reviewer`, `reviewedAt`, and `decision` in the per-record JSON before any status change.",
    "",
  );

  return lines.join("\n");
}
