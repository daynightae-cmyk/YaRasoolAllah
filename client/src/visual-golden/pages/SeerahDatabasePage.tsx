import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  ExternalLink,
  Filter,
  Layers,
  MapPin,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { SEERAH_DATABASE_STATUS } from "@/data/seerah/types";
import type { SeerahCertainty, SeerahEraId } from "@/data/seerah/types";
import {
  SEERAH_DATABASE,
  SEERAH_DATABASE_STATS,
  filterSeerahEvents,
  groupEventsByEra,
  hydrateSeerahEventById,
  listSeerahPeopleForEvents,
  listSeerahPlacesForEvents,
  resolveSeerahArtwork,
  type HydratedSeerahEvent,
} from "@/visual-golden/services/seerah-database";
import styles from "./SeerahDatabasePage.module.css";

const CERTAINTY_LABEL: Record<SeerahCertainty, string> = {
  established: "ثابت",
  well_reported: "مشهور",
  reported: "رواية",
  disputed: "محل خلاف",
};

const PRECISION_LABEL: Record<string, string> = {
  exact_day: "يوم محدد",
  month_year: "شهر وسنة",
  year_only: "سنة فقط",
  approximate: "تقديري",
  undated: "غير مؤرخ",
};

function formatYear(yearAH: number | null, yearCE: number | null): string {
  const hijri = yearAH === null ? "قبل الهجرة" : `${yearAH} هـ`;
  const miladi = yearCE === null ? "" : ` / ${yearCE} م`;
  return `${hijri}${miladi}`;
}

function DetailBlock({
  icon,
  title,
  anchor,
  children,
}: {
  icon: ReactNode;
  title: string;
  anchor?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.detailBlock} data-visual={anchor}>
      <h3>
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function EventDetail({
  hydrated,
  onPerson,
  onPlace,
  onClose,
}: {
  hydrated: HydratedSeerahEvent;
  onPerson: (personId: string) => void;
  onPlace: (placeId: string) => void;
  onClose: () => void;
}) {
  const { event, era, place, people, sources, quran, hadith, chapterTitleAr, atlasHref, artHref } =
    hydrated;

  return (
    <article className={styles.detail} aria-label={`تفصيل حدث: ${event.titleAr}`}>
      <figure className={styles.eventArt} data-visual="seerah-database-art">
        <img src={artHref} alt="" loading="lazy" decoding="async" />
        <figcaption>
          <span>رسم رمزي للمكان والجو العام</span>
          <span>ليس صورة تاريخية ولا تجسيدًا للشخصيات</span>
        </figcaption>
      </figure>

      <header className={styles.detailHead}>
        <div className={styles.detailKicker}>
          <span className={styles.orderBadge}>#{event.order}</span>
          <span>{era?.titleAr ?? event.eraId}</span>
          <span className={styles.dot}>·</span>
          <span>{chapterTitleAr}</span>
        </div>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="إغلاق التفصيل">
          إغلاق
        </button>
        <h2>{event.titleAr}</h2>
        <div className={styles.badges}>
          <span className={styles.badgeGold}>{formatYear(event.yearAH, event.yearCE)}</span>
          <span className={styles.badge}>{PRECISION_LABEL[event.precision] ?? event.precision}</span>
          <span className={`${styles.badge} ${styles[`certainty_${event.certainty}`] ?? ""}`}>
            {CERTAINTY_LABEL[event.certainty]}
          </span>
          <span className={styles.badgeReview}>مراجعة علمية معلّقة</span>
        </div>
      </header>

      <p className={styles.detailDate}>{event.dateTextAr}</p>
      <p className={styles.lead}>{event.summaryAr}</p>
      <p className={styles.significance}>{event.significanceAr}</p>

      <div className={styles.metaRow}>
        {place ? (
          <div className={styles.metaCard}>
            <MapPin size={16} />
            <div>
              <b>{place.nameAr}</b>
              <span>{place.regionAr}</span>
              {place.geoApprox ? (
                <small>
                  إحداثيات تقريبية: {place.geoApprox.lat.toFixed(3)}, {place.geoApprox.lng.toFixed(3)}
                </small>
              ) : null}
              <div className={styles.metaActions}>
                <button type="button" onClick={() => onPlace(place.id)}>
                  تصفية الموضع
                </button>
                {atlasHref ? (
                  <Link href={atlasHref}>
                    الخريطة <ExternalLink size={12} />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.metaCard}>
            <MapPin size={16} />
            <div>
              <b>الموضع غير محدد</b>
              <span>لم يُثبت موضع دقيق لهذا الحدث في هذا السجل.</span>
            </div>
          </div>
        )}

        <div className={styles.metaCardWide}>
          <Users size={16} />
          <div>
            <b>أشخاص مرتبطون ({people.length})</b>
            {people.length > 0 ? (
              <div className={styles.peopleChips}>
                {people.map((person) => (
                  <button key={person.id} type="button" onClick={() => onPerson(person.id)}>
                    {person.nameAr}
                  </button>
                ))}
              </div>
            ) : (
              <span>لا توجد إحالات أشخاص مسجلة لهذا الحدث.</span>
            )}
          </div>
        </div>
      </div>

      <DetailBlock icon={<BookOpen size={16} />} title="القرآن الكريم" anchor="seerah-database-quran">
        {quran.length === 0 ? (
          <p className={styles.empty}>لا توجد إحالة قرآنية مباشرة مسجلة لهذا الحدث.</p>
        ) : (
          <div className={styles.quranList}>
            {quran.map(({ ref, verses }) => (
              <div key={`${ref.surah}:${ref.ayahStart}-${ref.ayahEnd}`} className={styles.quranItem}>
                <div className={styles.quranRefHead}>
                  <span>سورة {ref.surah} · الآيات {ref.ayahStart}–{ref.ayahEnd}</span>
                  <Link href={`/quran?surah=${ref.surah}&ayah=${ref.ayahStart}`}>
                    فتح في المصحف <ExternalLink size={12} />
                  </Link>
                </div>
                <p className={styles.quranNote}>{ref.noteAr}</p>
                {verses.map((verse) => (
                  <Link key={verse.key} href={verse.href} className={styles.verse}>
                    <span className={styles.verseText}>﴿{verse.text}﴾</span>
                    <span className={styles.verseKey}>{verse.surah}:{verse.ayah}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </DetailBlock>

      <DetailBlock icon={<BookMarked size={16} />} title="الحديث والسنة" anchor="seerah-database-hadith">
        {hadith.length === 0 ? (
          <p className={styles.empty}>
            لا توجد إحالة حديثية مسجلة لهذا الحدث. غياب الإحالة لا يعني نفي ورود الخبر في السنة.
          </p>
        ) : (
          <div className={styles.hadithList}>
            {hadith.map((ref, index) =>
              ref.kind === "local_sample" ? (
                <div key={`${ref.sample.id}-${index}`} className={styles.hadithItem}>
                  <div className={styles.hadithHead}>
                    <b>{ref.labelAr}</b>
                    <span className={styles.badgeSample}>عينة محلية</span>
                  </div>
                  <p className={styles.hadithText}>{ref.sample.textAr}</p>
                  <p className={styles.hadithMeta}>
                    {ref.sample.narratorAr} · {ref.sample.gradeAr}
                  </p>
                  <p className={styles.hadithNote}>{ref.noteAr}</p>
                  <Link href={ref.href} className={styles.inlineLink}>
                    عرض العينة في صفحة الحديث <ExternalLink size={12} />
                  </Link>
                </div>
              ) : (
                <div key={`${ref.collectionId}-${index}`} className={styles.hadithItem}>
                  <div className={styles.hadithHead}>
                    <b>{ref.collectionTitleAr}</b>
                    <span className={styles.badgeExternal}>إحالة كتابية فقط</span>
                  </div>
                  <p className={styles.hadithMeta}>
                    {ref.bookNameAr} — {ref.chapterNameAr}
                  </p>
                  <p className={styles.hadithNote}>{ref.noteAr}</p>
                  <p className={styles.hadithCaution}>
                    لا يُعرض نص ولا رقم حديث هنا، لأن النص الكامل غير متاح محليًا والمراجعة التحريرية معلّقة.
                  </p>
                  <Link href={ref.href} className={styles.inlineLink}>
                    صفحة الحديث <ExternalLink size={12} />
                  </Link>
                </div>
              ),
            )}
          </div>
        )}
      </DetailBlock>

      <DetailBlock icon={<Layers size={16} />} title="المصادر والإحالات" anchor="seerah-database-sources">
        <ul className={styles.sourceList}>
          {sources.map(({ source, locusAr }, index) => (
            <li key={`${source.id}-${index}`}>
              <div>
                <b>{source.titleAr}</b>
                <span>
                  {source.authorAr}
                  {source.authorDeathHijri ? ` (ت ${source.authorDeathHijri} هـ)` : ""}
                </span>
              </div>
              <small>{locusAr}</small>
            </li>
          ))}
        </ul>
        <p className={styles.sourceNote}>{SEERAH_DATABASE_STATUS.noticeAr}</p>
      </DetailBlock>

      {event.noteAr ? (
        <aside className={styles.editorialNote}>
          <ShieldAlert size={16} />
          <p>{event.noteAr}</p>
        </aside>
      ) : null}

      {event.tags.length > 0 ? (
        <div className={styles.tags}>
          {event.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function SeerahDatabasePage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const requestedEventId = params.get("event") ?? "";
  const requestedPlaceId = params.get("place") ?? "";

  const [query, setQuery] = useState("");
  const [eraId, setEraId] = useState<SeerahEraId | "all">("all");
  const [personId, setPersonId] = useState("all");
  const [placeId, setPlaceId] = useState(() =>
    SEERAH_DATABASE.places.some((place) => place.id === requestedPlaceId)
      ? requestedPlaceId
      : "all",
  );
  const [quranOnly, setQuranOnly] = useState(false);
  const [hadithOnly, setHadithOnly] = useState(false);

  const allPeople = useMemo(() => listSeerahPeopleForEvents(SEERAH_DATABASE.events), []);
  const allPlaces = useMemo(() => listSeerahPlacesForEvents(SEERAH_DATABASE.events), []);

  const filtered = useMemo(
    () =>
      filterSeerahEvents({
        query,
        eraId,
        personId,
        placeId,
        quranOnly,
        hadithOnly,
      }),
    [query, eraId, personId, placeId, quranOnly, hadithOnly],
  );

  const groups = useMemo(() => groupEventsByEra(filtered), [filtered]);
  const selected = useMemo(() => {
    const byRequest = requestedEventId ? hydrateSeerahEventById(requestedEventId) : null;
    if (byRequest) return byRequest;
    return filtered[0] ? hydrateSeerahEventById(filtered[0].id) : null;
  }, [requestedEventId, filtered]);

  const selectedId = selected?.event.id ?? null;

  useEffect(() => {
    if (!requestedPlaceId) return;
    if (!SEERAH_DATABASE.places.some((place) => place.id === requestedPlaceId)) return;
    setPlaceId(requestedPlaceId);
  }, [requestedPlaceId]);

  useEffect(() => {
    if (!selectedId) return;
    const pane = document.querySelector<HTMLElement>('[data-visual="seerah-database-timeline"]');
    const row = pane?.querySelector<HTMLElement>(`[data-event-id="${selectedId}"]`);
    if (!pane || !row) return;
    const paneRect = pane.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    if (rowRect.top >= paneRect.top && rowRect.bottom <= paneRect.bottom) return;
    const rowTop =
      rowRect.top - paneRect.top + pane.scrollTop - Math.max(0, pane.clientHeight / 3);
    pane.scrollTop = Math.max(0, rowTop);
  }, [selectedId]);

  const selectEvent = (eventId: string) => {
    const next = new URLSearchParams(search);
    next.set("event", eventId);
    navigate(`/seerah/database?${next.toString()}`, { replace: true });
    document.getElementById("seerah-db-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearEvent = () => {
    const next = new URLSearchParams(search);
    next.delete("event");
    navigate(`/seerah/database${next.toString() ? `?${next.toString()}` : ""}`, { replace: true });
  };

  const resetFilters = () => {
    setQuery("");
    setEraId("all");
    setPersonId("all");
    setPlaceId("all");
    setQuranOnly(false);
    setHadithOnly(false);
    clearEvent();
  };

  const selectedInResults = selected
    ? filtered.some((event) => event.id === selected.event.id)
    : false;

  return (
    <div className={styles.page} data-visual="seerah-database">
      <PageHero
        title="قاعدة السيرة الزمنية"
        subtitle={`${SEERAH_DATABASE_STATS.events} حدثًا · ${SEERAH_DATABASE_STATS.people} شخصية · ${SEERAH_DATABASE_STATS.places} موضعًا · ${SEERAH_DATABASE_STATS.quranRefs} إحالة قرآنية`}
        desc="من الولادة إلى الوفاة: سجل زمني مترابط مع القرآن والحديث والمواضع، وكل السجلات معلّقة للمراجعة العلمية"
        image={art.mushafOpen}
        compact
        wing="seerah"
      >
        <div className={styles.heroButtons}>
          <Link href="/seerah" className="btn-outline">
            <ArrowLeft size={14} /> الرحلة السردية
          </Link>
          <Link href="/atlas" className="btn-outline">
            <MapPin size={14} /> الخريطة التخطيطية
          </Link>
          <Link href="/quran" className="btn-outline">
            <BookOpen size={14} /> المصحف
          </Link>
        </div>
      </PageHero>

      <section className={styles.stats} aria-label="إحصاءات قاعدة السيرة">
        <div><b>{SEERAH_DATABASE_STATS.events}</b><span>حدثًا مرتبًا</span></div>
        <div><b>{SEERAH_DATABASE_STATS.people}</b><span>شخصية</span></div>
        <div><b>{SEERAH_DATABASE_STATS.places}</b><span>موضعًا</span></div>
        <div><b>{SEERAH_DATABASE_STATS.sources}</b><span>مصدرًا</span></div>
        <div><b>{SEERAH_DATABASE_STATS.quranRefs}</b><span>إحالة قرآنية</span></div>
        <div><b>{SEERAH_DATABASE_STATS.hadithRefs}</b><span>إحالة حديثية</span></div>
      </section>

      <section className={styles.eraRail} aria-label="تصفية حسب المرحلة">
        <button
          type="button"
          className={eraId === "all" ? styles.eraOn : ""}
          onClick={() => setEraId("all")}
        >
          كل المراحل <span>{SEERAH_DATABASE_STATS.events}</span>
        </button>
        {SEERAH_DATABASE.eras.map((era) => {
          const count = SEERAH_DATABASE.events.filter((event) => event.eraId === era.id).length;
          return (
            <button
              key={era.id}
              type="button"
              className={eraId === era.id ? styles.eraOn : ""}
              onClick={() => setEraId(era.id)}
            >
              {era.titleAr} <span>{count}</span>
            </button>
          );
        })}
      </section>

      <section className={styles.toolbar} aria-label="أدوات البحث والتصفية">
        <label className={styles.searchBox}>
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث في العناوين والملخصات والأشخاص والمواضع…"
            aria-label="بحث في قاعدة السيرة"
          />
        </label>

        <label className={styles.selectBox}>
          <Users size={15} />
          <select value={personId} onChange={(event) => setPersonId(event.target.value)} aria-label="تصفية حسب الشخص">
            <option value="all">كل الأشخاص</option>
            {allPeople.map((person) => (
              <option key={person.id} value={person.id}>{person.nameAr}</option>
            ))}
          </select>
        </label>

        <label className={styles.selectBox}>
          <MapPin size={15} />
          <select value={placeId} onChange={(event) => setPlaceId(event.target.value)} aria-label="تصفية حسب الموضع">
            <option value="all">كل المواضع</option>
            {allPlaces.map((place) => (
              <option key={place.id} value={place.id}>{place.nameAr}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={`${styles.toggle} ${quranOnly ? styles.toggleOn : ""}`}
          onClick={() => setQuranOnly((value) => !value)}
          aria-pressed={quranOnly}
        >
          <BookOpen size={14} /> فيها قرآن
        </button>
        <button
          type="button"
          className={`${styles.toggle} ${hadithOnly ? styles.toggleOn : ""}`}
          onClick={() => setHadithOnly((value) => !value)}
          aria-pressed={hadithOnly}
        >
          <BookMarked size={14} /> فيها حديث
        </button>

        <button type="button" className={styles.reset} onClick={resetFilters}>
          <Filter size={14} /> إعادة الضبط
        </button>
      </section>

      <p className={styles.resultLine} role="status">
        {filtered.length} نتيجة من {SEERAH_DATABASE_STATS.events} حدثًا
        {selected && !selectedInResults ? " — الحدث المعروض خارج نتائج التصفية الحالية" : ""}
      </p>

      <div className={styles.layout}>
        <aside className={styles.timelinePane} aria-label="الخط الزمني للأحداث" data-visual="seerah-database-timeline">
          {groups.length === 0 ? (
            <p className={styles.empty}>لا توجد أحداث تطابق هذا البحث. جرّب إعادة الضبط.</p>
          ) : (
            groups.map((group) => (
              <section key={group.era.id} className={styles.eraGroup}>
                <header>
                  <div>
                    <h2>{group.era.titleAr}</h2>
                    <span>{group.era.rangeAr}</span>
                  </div>
                  <b>{group.events.length}</b>
                </header>
                <p className={styles.eraSummary}>{group.era.summaryAr}</p>
                <ol>
                  {group.events.map((event) => (
                    <li key={event.id}>
                      <button
                        type="button"
                        className={`${styles.eventRow} ${selected?.event.id === event.id ? styles.eventOn : ""}`}
                        onClick={() => selectEvent(event.id)}
                        aria-pressed={selected?.event.id === event.id}
                        data-event-id={event.id}
                      >
                        <span className={styles.eventOrder}>{event.order}</span>
                        <span className={styles.eventText}>
                          <span>{formatYear(event.yearAH, event.yearCE)}</span>
                          <strong>{event.titleAr}</strong>
                          <small>
                            {event.quranRefs.length > 0 ? `${event.quranRefs.length} قرآن` : ""}
                            {event.quranRefs.length > 0 && event.hadithRefs.length > 0 ? " · " : ""}
                            {event.hadithRefs.length > 0 ? `${event.hadithRefs.length} حديث` : ""}
                          </small>
                        </span>
                        <img
                          className={styles.eventThumb}
                          src={resolveSeerahArtwork(event.visualKey)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            ))
          )}
        </aside>

        <section className={styles.detailPane} id="seerah-db-detail" aria-live="polite" data-visual="seerah-database-detail">
          <SectionHead
            title="تفصيل الحدث"
            en="Chronological record · Quran, hadith, people, places, citations"
          />
          {selected ? (
            <EventDetail
              hydrated={selected}
              onPerson={(id) => {
                setPersonId(id);
                setEraId("all");
                setQuery("");
              }}
              onPlace={(id) => {
                setPlaceId(id);
                setEraId("all");
                setQuery("");
              }}
              onClose={clearEvent}
            />
          ) : (
            <p className={styles.empty}>اختر حدثًا من الخط الزمني لعرض تفصيله ومصادره.</p>
          )}
        </section>
      </div>

      <section className={styles.reviewShelf}>
        <ShieldAlert size={20} />
        <div>
          <h2>حدود المادة والمراجعة</h2>
          <p>{SEERAH_DATABASE_STATUS.noticeAr}</p>
          <ul>
            <li>النص القرآني مطابق لنسخة تنزيل المحلية (114 سورة / 6,236 آية) ويُتحقق منه في الاختبارات.</li>
            <li>الحديث: عينات تطويرية محلية فقط، وما عداها إحالات على مستوى الكتاب والباب بلا أرقام أو نصوص مخترعة.</li>
            <li>المواضع: تعريفات حديثة تقريبية، وليست مسحًا تاريخيًا ولا إحداثيات دقيقة للمعارك.</li>
            <li>كل حدث وكل شخصية وكل مصدر في هذه القاعدة معلّق للمراجعة العلمية والتحريرية.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
