import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import {
  ZoomIn,
  ZoomOut,
  Locate,
  List,
  ChevronRight,
  ChevronLeft,
  Mountain,
  BookOpen,
  BookMarked,
  Clock,
  ExternalLink,
  Boxes,
} from "lucide-react";
import { LivingTerrainTheatre } from "@/visual-golden/components/atlas/LivingTerrainTheatre";
import { atlasCampaignTerrain } from "@/visual-golden/services/atlas-terrain";

// Three.js stays out of the initial chunk: the observer terrain loads only
// when the visitor opts into the 3D mode.
const TerrainTheatre3D = lazy(() =>
  import("@/visual-golden/components/seerah/TerrainTheatre3D").then((module) => ({
    default: module.TerrainTheatre3D,
  })),
);
import {
  LIVING_CAMPAIGNS,
  CERTAINTY_LABEL,
  WEATHER_LABEL,
  campaignById,
  type Weather,
} from "@/visual-golden/data/living-atlas";
import {
  ATLAS_COUNTS,
  ATLAS_FILTERS,
  ATLAS_NODES,
  filterNodes,
  type AtlasFilter,
} from "@/visual-golden/services/atlas";
import {
  atlasPlaceDatabaseHref,
  campaignChapterHref,
  campaignSeerahHref,
  findAtlasNodeByQuery,
  seerahEventForCampaign,
  seerahEventsForAtlasNode,
  seerahPlaceForAtlasNode,
} from "@/visual-golden/services/atlas-seerah";
import styles from "./LivingAtlasPage.module.css";

const HIJAZ_PLATE = "/visual-golden/art/atlas-hero.webp";

function initialPlace() {
  const requested = new URLSearchParams(window.location.search).get("place");
  return findAtlasNodeByQuery(requested)?.id ?? null;
}

export function AtlasPage() {
  const search = useSearch();
  const requestedPlace = useMemo(() => new URLSearchParams(search).get("place"), [search]);
  const [linkedPlace] = useState(initialPlace);
  const [mode, setMode] = useState<"theatre" | "places">(linkedPlace ? "places" : "theatre");
  const [campaignId, setCampaignId] = useState(LIVING_CAMPAIGNS[0].id);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [markerId, setMarkerId] = useState(LIVING_CAMPAIGNS[0].markers[0]?.id ?? "");
  const [zoom, setZoom] = useState(1);
  const [showOverlays, setShowOverlays] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [listMode, setListMode] = useState(false);
  const [observer3D, setObserver3D] = useState(false);
  const [observerFailed, setObserverFailed] = useState(false);
  const [placeFilter, setPlaceFilter] = useState<AtlasFilter>("all");
  const [placeId, setPlaceId] = useState(linkedPlace ?? ATLAS_NODES[0]?.id ?? "");

  const campaign = campaignById(campaignId);
  const phase = campaign.phases[Math.min(phaseIndex, campaign.phases.length - 1)];
  const marker = campaign.markers.find((item) => item.id === markerId) ?? campaign.markers[0];
  const weather: Weather = phase.weather;
  const places = useMemo(() => filterNodes(placeFilter), [placeFilter]);
  const place = places.find((node) => node.id === placeId) ?? places[0] ?? null;
  const placeSeerah = place ? seerahPlaceForAtlasNode(place) : null;
  const placeEvents = place ? seerahEventsForAtlasNode(place) : [];
  const campaignEvent = seerahEventForCampaign(campaign.id);
  const campaignRecordHref = campaignSeerahHref(campaign.id);
  const campaignChapterLink = campaignChapterHref(campaign.id);

  useEffect(() => {
    const requested = findAtlasNodeByQuery(requestedPlace);
    if (!requested) return;
    setMode("places");
    setPlaceFilter("all");
    setPlaceId(requested.id);
  }, [requestedPlace]);

  useEffect(() => {
    setPhaseIndex(0);
    setZoom(1);
    setObserver3D(false);
    setObserverFailed(false);
  }, [campaignId]);

  const observerTerrain = useMemo(
    () => (mode === "theatre" ? atlasCampaignTerrain(campaign) : null),
    [mode, campaign],
  );
  const observerAvailable = !!observerTerrain && !observerFailed;
  const showObserver = observer3D && observerAvailable && !listMode;

  useEffect(() => {
    const firstActive = phase.activeMarkerIds[0];
    if (firstActive) setMarkerId(firstActive);
  }, [campaignId, phaseIndex, phase.activeMarkerIds]);

  useEffect(() => {
    if (!places.some((node) => node.id === placeId)) {
      setPlaceId(places[0]?.id ?? "");
    }
  }, [places, placeId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (mode !== "theatre") return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPhaseIndex((index) => Math.min(campaign.phases.length - 1, index + 1));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPhaseIndex((index) => Math.max(0, index - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, campaign.phases.length]);

  const witnessKind =
    phase.witness.kind === "quran" ? "قرآن" : phase.witness.kind === "hadith" ? "حديث" : "سيرة";

  return (
    <div className={styles.page} data-climate={mode === "theatre" ? weather : "places"}>
      <div className={styles.stageWrap}>
        {listMode ? (
          <ol className={styles.listEq}>
            {(mode === "theatre" ? campaign.markers : places).map((item) => {
              const id = item.id;
              const name = "labelAr" in item ? item.labelAr : item.name;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === "theatre") setMarkerId(id);
                      else setPlaceId(id);
                      setListMode(false);
                    }}
                  >
                    <strong>{name}</strong>
                    <span>{"certainty" in item ? CERTAINTY_LABEL[item.certainty] : "موضع تخطيطي"}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className={styles.frame}>
            {mode === "theatre" ? (
              showObserver && observerTerrain ? (
                <Suspense fallback={<div className={styles.observerLoading}>جارٍ تحميل البيئة ثلاثية الأبعاد…</div>}>
                  <TerrainTheatre3D
                    scene={observerTerrain}
                    onExit={() => setObserver3D(false)}
                    onUnavailable={() => {
                      setObserverFailed(true);
                      setObserver3D(false);
                    }}
                  />
                </Suspense>
              ) : (
                <LivingTerrainTheatre
                  plate={campaign.plate}
                  plateAlt={`لوحة فنية لمناخ ${campaign.nameAr} — ليست خريطة مساحية. ${campaign.terrainTeacherAr}`}
                  weather={weather}
                  overlays={campaign.overlays}
                  markers={campaign.markers}
                  selectedId={marker?.id ?? ""}
                  activeIds={phase.activeMarkerIds}
                  showOverlays={showOverlays}
                  showMarkers={showMarkers}
                  zoom={zoom}
                  onSelect={setMarkerId}
                />
              )
            ) : (
              <LivingTerrainTheatre
                plate={HIJAZ_PLATE}
                plateAlt="لوحة فنية لمرتفعات الحجاز — مواضع السيرة عليها تخطيطية وليست إحداثيات."
                weather="clear-dawn"
                overlays={[]}
                markers={places.map((node) => ({
                  id: node.id,
                  labelAr: node.name,
                  x: node.layout.x,
                  y: node.layout.y,
                  kind: "place" as const,
                  certainty: "schematic" as const,
                  descriptionAr: node.mentions.map((mention) => mention.eventTitle).join(" · "),
                  source: "فصول السيرة الموجودة في المنصة",
                }))}
                selectedId={place?.id ?? ""}
                activeIds={place ? [place.id] : []}
                showOverlays={false}
                showMarkers={showMarkers}
                zoom={zoom}
                onSelect={setPlaceId}
              />
            )}
          </div>
        )}

        <header className={styles.top}>
          <div className={styles.kicker}>
            <Mountain size={16} />
            <span>الأطلس الجبلي الحي</span>
            <em>SCHEMATIC · بلا تجسيد · بلا إحداثيات</em>
          </div>
          <h1>{mode === "theatre" ? campaign.nameAr : "مواضع السيرة التخطيطية"}</h1>
          <p className={styles.lede}>
            {mode === "theatre"
              ? `${campaign.questionAr} · ${phase.hourLabel} · ${WEATHER_LABEL[weather]}`
              : "أسماء مواضع من فصول السيرة على لوحة فنية. ليست خريطة مساحية."}
          </p>
          <div className={styles.pledge} role="note">
            نعيش الحدث بالمكان والزمن والرواية. لا صورة لرسول الله ﷺ ولا محاكاة قتال.
          </div>
          <div className={styles.modes} role="tablist" aria-label="نمط الأطلس">
            <button type="button" role="tab" aria-selected={mode === "theatre"} onClick={() => setMode("theatre")}>
              مسرح الغزوات
            </button>
            <button type="button" role="tab" aria-selected={mode === "places"} onClick={() => setMode("places")}>
              مواضع السيرة
            </button>
          </div>
          {mode === "theatre" ? (
            <div className={styles.campaigns} role="list">
              {LIVING_CAMPAIGNS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === campaign.id}
                  onClick={() => setCampaignId(item.id)}
                >
                  <strong>{item.nameAr}</strong>
                  <span>{item.dateAr}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.campaigns}>
              {ATLAS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={placeFilter === filter.id}
                  onClick={() => setPlaceFilter(filter.id)}
                >
                  <strong>{filter.label}</strong>
                  <span>{filter.id === "all" ? `${ATLAS_COUNTS.nodes} مواضع` : ""}</span>
                </button>
              ))}
            </div>
          )}
        </header>

        <div className={styles.tools}>
          {mode === "theatre" && observerAvailable && !showObserver ? (
            <button
              type="button"
              className={styles.observerEnter}
              data-visual="atlas-observer-enter"
              onClick={() => setObserver3D(true)}
              aria-label="الدخول إلى بيئة ثلاثية الأبعاد لمراقبة التضاريس"
            >
              <Boxes size={15} /> مراقبة ثلاثية الأبعاد
            </button>
          ) : null}
          {!showObserver ? (
            <>
              <button type="button" onClick={() => setZoom((value) => Math.min(1.7, +(value + 0.15).toFixed(2)))} aria-label="تكبير">
                <ZoomIn size={16} />
              </button>
              <button type="button" onClick={() => setZoom((value) => Math.max(1, +(value - 0.15).toFixed(2)))} aria-label="تصغير">
                <ZoomOut size={16} />
              </button>
              <button type="button" onClick={() => setZoom(1)} aria-label="إعادة الضبط">
                <Locate size={16} />
              </button>
            </>
          ) : null}
          <button type="button" onClick={() => setListMode((value) => !value)} aria-label="عرض كقائمة">
            <List size={16} />
          </button>
        </div>

        <aside className={styles.layers}>
          <h4>الطبقات</h4>
          <label>
            <input type="checkbox" checked={showOverlays} onChange={() => setShowOverlays((value) => !value)} />
            حدود تضاريسية تخطيطية
          </label>
          <label>
            <input type="checkbox" checked={showMarkers} onChange={() => setShowMarkers((value) => !value)} />
            العلامات
          </label>
          <p>لوحة فنية للمناخ. العلامات تخطيطية. لا مقياس مسافة.</p>
        </aside>

        {mode === "theatre" && marker ? (
          <aside className={styles.floatCard} aria-live="polite" data-visual="atlas-theatre-evidence">
            <span className={styles.badge}>{CERTAINTY_LABEL[marker.certainty]}</span>
            <h2>{marker.labelAr}</h2>
            <p>{marker.descriptionAr}</p>
            <p className={styles.src}>
              {witnessKind} · {phase.witness.cite}
            </p>
            {campaignEvent ? (
              <p className={styles.src}>
                <Clock size={12} /> {campaignEvent.dateTextAr}
              </p>
            ) : null}
            <div className={styles.recordLinks}>
              {campaignChapterLink ? (
                <Link href={campaignChapterLink} className={styles.seerahLink}>
                  <BookOpen size={14} /> فصل الغزوة
                </Link>
              ) : null}
              {campaignRecordHref ? (
                <Link href={campaignRecordHref} className={styles.seerahLink} data-visual="atlas-campaign-record">
                  <BookMarked size={14} /> التفصيل والمصادر
                </Link>
              ) : null}
            </div>
          </aside>
        ) : null}

        {mode === "places" && place ? (
          <aside className={styles.floatCard} aria-live="polite" data-visual="atlas-place-evidence">
            <span className={styles.badge}>موضع تخطيطي — ليس إحداثيات</span>
            <h2>{place.name}</h2>
            <ul className={styles.mentions}>
              {place.mentions.slice(0, 4).map((mention) => (
                <li key={`${mention.chapterId}-${mention.eventId}`}>
                  <Link href={`/seerah?chapter=${encodeURIComponent(mention.chapterId)}&event=${encodeURIComponent(mention.eventId)}`}>
                    <strong>{mention.eventTitle}</strong>
                  </Link>
                  <span>
                    {mention.chapterTitle} · {mention.eventDate}
                  </span>
                </li>
              ))}
            </ul>
            {placeSeerah ? (
              <Link href={atlasPlaceDatabaseHref(placeSeerah)} className={styles.seerahLink}>
                <BookMarked size={14} /> السجل الزمني للموضع ({placeEvents.length})
              </Link>
            ) : null}
            <Link href="/seerah" className={styles.seerahLink}>
              <BookOpen size={14} /> فتح فصول السيرة
            </Link>
          </aside>
        ) : null}

        {mode === "theatre" ? (
          <div className={styles.phaseRail}>
            <button
              type="button"
              onClick={() => setPhaseIndex((index) => Math.max(0, index - 1))}
              disabled={phaseIndex === 0}
              aria-label="المرحلة السابقة"
            >
              <ChevronRight size={16} />
            </button>
            <ol>
              {campaign.phases.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={index === phaseIndex ? "step" : undefined}
                    onClick={() => setPhaseIndex(index)}
                  >
                    <span>٠{index + 1}</span>
                    {item.titleAr}
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setPhaseIndex((index) => Math.min(campaign.phases.length - 1, index + 1))}
              disabled={phaseIndex === campaign.phases.length - 1}
              aria-label="المرحلة التالية"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        ) : null}
      </div>

      {mode === "theatre" ? (
        <section className={styles.board}>
          <article className={styles.teacher}>
            <h2>الأرض معلّمة</h2>
            <p>{campaign.terrainTeacherAr}</p>
            <dl>
              <div>
                <dt>نوع الخريطة</dt>
                <dd>{campaign.mapTypeLabel}</dd>
              </div>
              <div>
                <dt>ساعة المرحلة</dt>
                <dd>
                  {phase.hourLabel} · {WEATHER_LABEL[weather]}
                </dd>
              </div>
              <div>
                <dt>الثقة المكانية</dt>
                <dd>{campaign.confidenceLabel}</dd>
              </div>
              <div>
                <dt>المسافة</dt>
                <dd>{campaign.distanceNote}</dd>
              </div>
            </dl>
          </article>
          <article className={styles.witness}>
            <h2>دفتر الشاهد</h2>
            <span className={styles.badge}>{witnessKind}</span>
            <blockquote>
              <p>{phase.witness.arabic}</p>
              <footer>{phase.witness.cite}</footer>
            </blockquote>
            <p className={styles.phaseBody}>{phase.bodyAr}</p>
          </article>
          <section className={styles.legend} aria-label="مفتاح الرموز واليقين">
            <h2>مفتاح اليقين</h2>
            <ul>
              <li>
                <i className={styles.kNamed} /> معلم مسمّى
              </li>
              <li>
                <i className={styles.kApprox} /> تقريبي
              </li>
              <li>
                <i className={styles.kSchema} /> تخطيطي
              </li>
              <li>
                <i className={styles.kNur} /> مقام النور — بلا تجسيد
              </li>
            </ul>
            <p>{campaign.disputeAr}</p>
            <p>{campaign.geographicBasisAr}</p>
            <p className={styles.src}>{campaign.sources.join(" · ")}</p>
          </section>
        </section>
      ) : null}

      {mode === "places" && place ? (
        <section
          className={styles.placeBoard}
          data-visual="atlas-place-timeline"
          aria-label={`الخط الزمني المسجل لموضع ${place.name}`}
        >
          <header className={styles.placeBoardHead}>
            <div>
              <span className={styles.badge}>مزامنة مع قاعدة السيرة الزمنية</span>
              <h2>الخط الزمني للموضع</h2>
              <p>
                الأحداث المسجلة في قاعدة السيرة عند «{place.name}»، مرتبة بحسب ترتيبها
                الزمني في السجل. الموضع نفسه يبقى تخطيطيًا على اللوحة.
              </p>
            </div>
            {placeSeerah ? (
              <Link href={atlasPlaceDatabaseHref(placeSeerah)} className={styles.seerahLink}>
                <BookMarked size={14} /> تصفية القاعدة بهذا الموضع
              </Link>
            ) : null}
          </header>

          {placeEvents.length === 0 ? (
            <p className={styles.placeEmpty}>
              لا توجد أحداث مرتبطة بهذا الموضع في قاعدة السيرة الحالية. لا يُستنتج
              وجود حدث من مجرد ورود اسم الموضع في فصل آخر.
            </p>
          ) : (
            <ol className={styles.placeEventList}>
              {placeEvents.map((event) => (
                <li key={event.id}>
                  <Link href={event.href} className={styles.placeEvent}>
                    <span className={styles.placeOrder}>{event.order}</span>
                    <span className={styles.placeEventText}>
                      <span>
                        {event.yearAH === null ? "قبل الهجرة" : `${event.yearAH} هـ`}
                        {event.yearCE === null ? "" : ` / ${event.yearCE} م`}
                        {" · "}
                        {event.eraTitleAr}
                      </span>
                      <strong>{event.titleAr}</strong>
                      <small>
                        {event.chapterTitleAr} · {event.dateTextAr}
                      </small>
                    </span>
                    <span className={styles.placeCounts}>
                      <span>{event.quranCount} قرآن</span>
                      <span>{event.hadithCount} حديث</span>
                      <span>{event.sourceCount} مصدر</span>
                    </span>
                    <ExternalLink size={14} aria-hidden />
                  </Link>
                </li>
              ))}
            </ol>
          )}

          <p className={styles.placeSourceNote}>
            كل سجل معلّق للمراجعة العلمية. فتح الحدث يعرض إحالاته القرآنية
            والحديثية وقائمة مصادره، ولا يضيف الموقع علاقة غير مسجلة.
          </p>
        </section>
      ) : null}
    </div>
  );
}
