import {
  canReadTextInside,
  hashWorkId,
  type CatalogWork,
} from "./catalog-library";

/**
 * The ten architectural halls of the walkable Library.
 *
 * The catalog's own category codes are the source of truth. Nothing here
 * invents a title, an author, or a book: every object on a shelf is a real
 * `CatalogWork` that the internal reader can actually open.
 */
export interface LibraryHallDefinition {
  key: string;
  titleAr: string;
  titleEn: string;
  eyebrowAr: string;
  eyebrowEn: string;
  categories: string[];
  /** Deep leather/plaster tone used by the 3D shelves and the DOM rail. */
  tone: number;
  accent: string;
}

export const LIBRARY_HALLS: LibraryHallDefinition[] = [
  {
    key: "quran",
    titleAr: "القرآن وعلومه",
    titleEn: "Qur'an & Sciences",
    eyebrowAr: "رواق الوحي",
    eyebrowEn: "The Revelation Arcade",
    categories: ["A-القرآن وعلومه"],
    tone: 0x0d3a31,
    accent: "#8fd6be",
  },
  {
    key: "tafsir",
    titleAr: "التفسير",
    titleEn: "Exegesis",
    eyebrowAr: "مدارس التأويل",
    eyebrowEn: "Schools of Tafsir",
    categories: ["B-التفسير"],
    tone: 0x2a2417,
    accent: "#dcc487",
  },
  {
    key: "hadith",
    titleAr: "الحديث النبوي",
    titleEn: "Prophetic Hadith",
    eyebrowAr: "دار السنة",
    eyebrowEn: "The Sunnah House",
    categories: ["C-الحديث النبوي"],
    tone: 0x261b16,
    accent: "#d3a06f",
  },
  {
    key: "seerah",
    titleAr: "السيرة النبوية",
    titleEn: "Prophetic Biography",
    eyebrowAr: "درب السيرة",
    eyebrowEn: "The Seerah Path",
    categories: ["D-السيرة النبوية"],
    tone: 0x2c2116,
    accent: "#e0bc88",
  },
  {
    key: "fiqh",
    titleAr: "الفقه والأصول",
    titleEn: "Fiqh & Usul",
    eyebrowAr: "مجالس الفقه",
    eyebrowEn: "The Fiqh Sessions",
    categories: ["J-الفقه", "K-أصول الفقه والقواعد", "L-الفتاوى"],
    tone: 0x162b30,
    accent: "#8fc9d8",
  },
  {
    key: "aqidah",
    titleAr: "العقيدة",
    titleEn: "Creed",
    eyebrowAr: "أصول الاعتقاد",
    eyebrowEn: "Foundations of Belief",
    categories: ["I-العقيدة"],
    tone: 0x211b32,
    accent: "#b9a8e8",
  },
  {
    key: "arabic",
    titleAr: "اللغة العربية",
    titleEn: "Arabic Language",
    eyebrowAr: "لسان العرب",
    eyebrowEn: "The Arabic Tongue",
    categories: ["P-اللغة العربية"],
    tone: 0x2d1f18,
    accent: "#e2b38c",
  },
  {
    key: "history",
    titleAr: "التاريخ والأطلس",
    titleEn: "History & Atlas",
    eyebrowAr: "ذاكرة الأمكنة",
    eyebrowEn: "Memory of Places",
    categories: ["N-التاريخ الإسلامي", "O-الجغرافيا والرحلات"],
    tone: 0x23261a,
    accent: "#c9c98e",
  },
  {
    key: "biographies",
    titleAr: "التراجم والأسرة",
    titleEn: "Biographies & Family",
    eyebrowAr: "طبقات الناس",
    eyebrowEn: "Generations & Households",
    categories: [
      "H-التراجم والطبقات",
      "E-الصحابة رضي الله عنهم",
      "E-الصحابة",
      "F-أمهات المؤمنين وأهل البيت",
      "G-التابعون وتابعو التابعين",
      "M-الزهد والرقائق والأخلاق",
      "R-المرأة والأسرة",
      "S-الطفل",
    ],
    tone: 0x1e1c2b,
    accent: "#b9b2da",
  },
  {
    key: "openiti",
    titleAr: "المكنز المفتوح",
    titleEn: "Open Corpus",
    eyebrowAr: "خزانة المخطوطات",
    eyebrowEn: "The Manuscript Vault",
    categories: ["UNCLASSIFIED_OPENITI", "T-الموسوعات والفهارس"],
    tone: 0x202020,
    accent: "#d0c7a8",
  },
];

const HALL_BY_CATEGORY = new Map<string, LibraryHallDefinition>();
for (const hall of LIBRARY_HALLS) {
  for (const category of hall.categories) HALL_BY_CATEGORY.set(category, hall);
}

export const FALLBACK_HALL =
  LIBRARY_HALLS.find((hall) => hall.key === "openiti") ?? LIBRARY_HALLS[0];

export function hallForCategory(
  category: string | null | undefined,
): LibraryHallDefinition {
  if (!category) return FALLBACK_HALL;
  return HALL_BY_CATEGORY.get(category) ?? FALLBACK_HALL;
}

export interface LibraryHallShelf {
  hall: LibraryHallDefinition;
  /** Deterministic selection of openable works placed on the 3D shelves. */
  works: CatalogWork[];
  /** Every openable work in the hall, not only the ones modelled in 3D. */
  total: number;
}

/**
 * Choose the books that are physically modelled in each hall.
 *
 * Selection is deterministic: the same catalog always produces the same
 * shelves, so a reader can return to the same book at the same place. It is
 * also honest: only works whose text the internal reader can open are placed
 * on a shelf. Metadata-only records stay in the catalog and are never dressed
 * up as readable books.
 */
export function buildLibraryHallShelves(
  works: CatalogWork[],
  perHall = 90,
): LibraryHallShelf[] {
  const buckets = new Map<string, CatalogWork[]>();
  for (const hall of LIBRARY_HALLS) buckets.set(hall.key, []);

  for (const work of works) {
    if (!canReadTextInside(work)) continue;
    if (!work.titleAr && !work.titleEn) continue;
    const hall = hallForCategory(work.category);
    buckets.get(hall.key)?.push(work);
  }

  return LIBRARY_HALLS.map((hall) => {
    const bucket = buckets.get(hall.key) ?? [];
    // Hash ordering is stable across reloads but does not pretend to rank
    // scholarly importance. The catalog's own metadata remains the authority.
    bucket.sort((a, b) => hashWorkId(a.id) - hashWorkId(b.id));
    return {
      hall,
      works: bucket.slice(0, Math.max(0, perHall)),
      total: bucket.length,
    };
  });
}
