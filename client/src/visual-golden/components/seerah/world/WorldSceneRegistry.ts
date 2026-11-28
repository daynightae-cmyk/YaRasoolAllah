/**
 * WorldSceneRegistry — Configuration registry for Living Seerah World scenes.
 *
 * Each scene is a complete, walkable 3D environment with:
 * - Procedural terrain (biome, bounds, materials)
 * - Atmosphere (sky, fog, sun, horizon)
 * - Life entities (camels, tents, palms, awnings)
 * - Audio zones (spatial ambience)
 * - Interaction points (educational, transitions)
 * - Entry/exit points
 *
 * Scenes are artistic reconstructions, not archaeological surveys.
 * All historical facts link to governed content (seerah database, atlas).
 */

import * as THREE from "three";
import type { WorldSceneConfig, WorldInteractionPoint, WorldAudioZone, WorldParticleSystemConfig } from "./world-types";

export type { WorldSceneConfig } from "./world-types";

/** Helper to create an interaction point. */
function createInteraction(
  id: string,
  position: THREE.Vector3,
  radius: number,
  kind: WorldInteractionPoint["kind"],
  labelAr: string,
  descriptionAr: string,
  targetRef?: WorldInteractionPoint["targetRef"],
): WorldInteractionPoint {
  return { id, position, radius, kind, labelAr, descriptionAr, targetRef };
}

/** Helper to create an audio zone. */
function createAudioZone(
  id: string,
  bounds: THREE.Box3,
  ambienceId: string,
  fadeDistance = 15,
  priority = 0,
): WorldAudioZone {
  return { id, bounds, ambienceId, fadeDistance, priority };
}

/** Helper to create a particle system config. */
function createParticles(
  id: string,
  count: number,
  area: THREE.Box3,
  particleSize: number,
  color: THREE.Color | THREE.Color[],
  opacity: number,
  velocity: THREE.Vector3,
  turbulence: number,
  lifetime: number,
  spawnRate: number,
): WorldParticleSystemConfig {
  return { id, count, area, particleSize, color, opacity, velocity, turbulence, lifetime, spawnRate };
}

/* ============================================================
 * SCENE 1: Desert Path & Market Camp (The Living World Entry)
 * ============================================================ */
export const SCENE_DESERT_CAMP: WorldSceneConfig = {
  id: "desert-camp",
  nameAr: "درب الصحراء ومعسكر القوافل",
  descriptionAr: "ممر صحراوي يربط بين بيئات السيرة، ومعسكر قوافل على جانب الطريق.",
  seed: 20261122,
  biome: "dunes",
  bounds: { width: 200, depth: 200, height: 50 },
  skyColor: "#3a2f1c",
  fogColor: "#4a3a26",
  fogNear: 15,
  fogFar: 120,
  sunPosition: new THREE.Vector3(-40, 60, 30),
  sunColor: "#ffd9a0",
  sunIntensity: 2.2,
  groundColor: "#a8845c",
  groundRoughness: 0.95,
  groundMetalness: 0,
  rockColor: "#8b7355",
  entryPosition: new THREE.Vector3(0, 2, 70),
  // Camera forward is (-sin yaw, -cos yaw): yaw 0 faces -Z, toward the camp
  // at the world's centre (the player spawns at +Z on the desert path).
  entryYaw: 0,
  props: [
    { id: "prop-well-camp", type: "well", position: new THREE.Vector3(12, 2, 8) },
    { id: "prop-fire-camp", type: "campfire", position: new THREE.Vector3(2, 2, 16) },
  ],
  exits: [
    createInteraction(
      "exit-to-reading",
      new THREE.Vector3(0, 2, -80),
      4,
      "transition",
      "العودة إلى القراءة",
      "الخروج من العالم الحي والعودة إلى تجربة السيرة المقروءة",
      { type: "chapter", id: "hijra-to-madinah" },
    ),
    // ---- TRAVEL GATES (living-world network) ----
    createInteraction(
      "gate-to-hira-cave",
      new THREE.Vector3(-58, 2, 56),
      5,
      "transition",
      "بوابة غار حراء",
      "سفر إلى غار حراء في جبل نور؛ مشهد ليلي لمكان التحنث، بلا تمثيل للوحي.",
      { type: "scene", id: "hira-cave" },
    ),
    createInteraction(
      "gate-to-badr-valley",
      new THREE.Vector3(-58, 2, -56),
      5,
      "transition",
      "بوابة وادي بدر",
      "سفر إلى وادي بدر؛ تضاريس تفسيرية لموقع المعركة الأولى كما تصفه المصادر.",
      { type: "scene", id: "badr-valley" },
    ),
    createInteraction(
      "gate-to-uhud-mountain",
      new THREE.Vector3(58, 2, -56),
      5,
      "transition",
      "بوابة جبل أحد",
      "سفر إلى سفح جبل أحد؛ موقف مراقبة يشرح علاقة المكان بالخبر.",
      { type: "scene", id: "uhud-mountain" },
    ),
    createInteraction(
      "gate-to-madinah-walk",
      new THREE.Vector3(58, 2, 56),
      5,
      "transition",
      "بوابة المدينة الأولى",
      "سفر إلى شوارع يثرب بعد الهجرة؛ ساحة المسجد الأول والبيوت الطينية.",
      { type: "scene", id: "madinah-walk" },
    ),
    createInteraction(
      "gate-to-hijrah-road",
      new THREE.Vector3(0, 2, -58),
      5,
      "transition",
      "بوابة درب الهجرة",
      "سفر إلى درب الهجرة الصحراوي؛ مسار تعليمي بين مكة والمدينة.",
      { type: "scene", id: "hijrah-road" },
    ),
  ],
  interactions: [
    createInteraction(
      "info-camp",
      new THREE.Vector3(-5, 2, 5),
      3,
      "info",
      "معسكر القوافل",
      "موقع استراحة للقوافل التجارية على درب الهجرة؛ خيام بسيطة، آبار ماء، وحراسة ليلية. لا تصوير للأشخاص.",
      { type: "chapter", id: "hijra-to-madinah" },
    ),
    createInteraction(
      "info-well",
      new THREE.Vector3(12, 2, 8),
      2.5,
      "info",
      "بئر الماء",
      "مصدر ماء حيوي على طريق القوافل؛ الآبار في المصادر تحدد محطات الطريق. لا تصوير تاريخي دقيق.",
      { type: "atlas", id: "قباء" },
    ),
    createInteraction(
      "info-tent-merchant",
      new THREE.Vector3(-15, 2, 15),
      3,
      "info",
      "خيمة تاجر",
      "خيمة تاجر القوافل تحمل بضائع الحجاز؛ الحياة التجارية موثقة في المصادر. لا تجسيد لشخصيات محددة.",
      { type: "database", id: "bahira" },
    ),
    createInteraction(
      "info-caravan",
      new THREE.Vector3(20, 2, -10),
      4,
      "info",
      "قافلة قادمة",
      "قافلة تصل من الشمال تحمل الزاد والمتاع؛ حركة القوافل تشرح السياق الاقتصادي للسيرة.",
      { type: "chapter", id: "establishing-state" },
    ),
    createInteraction(
      "info-guide",
      new THREE.Vector3(-25, 2, -20),
      3,
      "info",
      "دلال الطريق",
      "مرشد خبير بطرق الصحراء؛ الدلالة مهنة موثقة في عصر الرسالة. لا تمثيل لشخص بعينه.",
      { type: "database", id: "cave-thawr" },
    ),
  ],
  audioZones: [
    createAudioZone(
      "zone-camp",
      new THREE.Box3(new THREE.Vector3(-30, 0, -10), new THREE.Vector3(30, 15, 30)),
      "ambience-camp",
      15,
      10,
    ),
    createAudioZone(
      "zone-desert",
      new THREE.Box3(new THREE.Vector3(-100, 0, -100), new THREE.Vector3(100, 20, 100)),
      "ambience-desert-wind",
      20,
      0,
    ),
    createAudioZone(
      "zone-market",
      new THREE.Box3(new THREE.Vector3(-20, 0, 10), new THREE.Vector3(20, 15, 50)),
      "ambience-market",
      10,
      5,
    ),
  ],
  lifeEntities: [
    // Camels
    { id: "camel-1", animationType: "idle", animationSpeed: 0.6, cullDistance: 100 },
    { id: "camel-2", animationType: "graze", animationSpeed: 0.4, cullDistance: 100 },
    { id: "camel-3", animationType: "walk", animationSpeed: 0.8, cullDistance: 120 },
    // Tents
    { id: "tent-1", animationType: "sway", animationSpeed: 0.3, cullDistance: 80 },
    { id: "tent-2", animationType: "sway", animationSpeed: 0.35, cullDistance: 80 },
    { id: "tent-3", animationType: "sway", animationSpeed: 0.4, cullDistance: 80 },
    // Awnings
    { id: "awning-1", animationType: "flutter", animationSpeed: 0.5, cullDistance: 60 },
    { id: "awning-2", animationType: "flutter", animationSpeed: 0.6, cullDistance: 60 },
    // Palms near well
    { id: "palm-1", animationType: "sway", animationSpeed: 0.25, cullDistance: 100 },
    { id: "palm-2", animationType: "sway", animationSpeed: 0.3, cullDistance: 100 },
  ],
  particles: [
    createParticles(
      "sand-drift",
      800,
      new THREE.Box3(new THREE.Vector3(-100, 0.5, -100), new THREE.Vector3(100, 15, 100)),
      0.08,
      new THREE.Color("#d4c4a0"),
      0.35,
      new THREE.Vector3(-0.3, 0, -0.15),
      0.4,
      15,
      40,
    ),
    createParticles(
      "dust-motes-camp",
      200,
      new THREE.Box3(new THREE.Vector3(-25, 0.5, -5), new THREE.Vector3(25, 8, 35)),
      0.04,
      [new THREE.Color("#f5e8d0"), new THREE.Color("#e8d4b8")],
      0.25,
      new THREE.Vector3(0.05, 0.02, 0.03),
      0.2,
      8,
      15,
    ),
  ],
  disclosureAr: "بيئة صحراوية ومعسكر قوافل ثلاثية الأبعاد تفسيرية — تضاريس عامة، عمارة غير موثقة، لا تجسيد لأي شخصية تاريخية.",
  canonicalRef: { chapterId: "hijra-to-madinah", eventId: "arrival-quba" },
};

/* ============================================================
 * SCENE 2: Badr Valley (Campaign Environment)
 * ============================================================ */
export const SCENE_BADR_VALLEY: WorldSceneConfig = {
  id: "badr-valley",
  nameAr: "وادي بدر",
  descriptionAr: "وادي بين تلال رملية، وماء قريب، ومطر ليلة المعركة. أول مواجهة كبرى في تاريخ الدولة.",
  seed: 20261123,
  biome: "wadi",
  bounds: { width: 180, depth: 180, height: 40 },
  skyColor: "#2c2214",
  fogColor: "#42331d",
  fogNear: 20,
  fogFar: 100,
  sunPosition: new THREE.Vector3(-30, 50, 20),
  sunColor: "#ffdf9e",
  sunIntensity: 2.5,
  groundColor: "#8f7355",
  groundRoughness: 0.92,
  groundMetalness: 0,
  rockColor: "#6e5a45",
  // A broad valley (not a trench): spawn at the southern mouth looking down
  // the wadi floor toward the wells and the far hills.
  entryPosition: new THREE.Vector3(0, 2, 48),
  entryYaw: 0,
  wadiProfile: { halfWidth: 32, wallWidth: 16, wallSlope: 0.45, depth: 2 },
  exits: [
    createInteraction(
      "exit-to-reading",
      new THREE.Vector3(0, 2, 75),
      4,
      "transition",
      "العودة إلى القراءة",
      "الخروج إلى سجل غزوة بدر في قاعدة السيرة",
      { type: "event", id: "badr" },
    ),
    // ---- TRAVEL GATE (back to the desert road) ----
    createInteraction(
      "gate-to-desert-camp",
      new THREE.Vector3(-70, 2, -66),
      5,
      "transition",
      "بوابة درب الصحراء",
      "سفر إلى درب الصحراء ومعسكر القوافل، نقطة الانطلاق بين بيئات السيرة.",
      { type: "scene", id: "desert-camp" },
    ),
  ],
  interactions: [
    createInteraction(
      "info-badr-hill",
      new THREE.Vector3(-12, 5, 15),
      3,
      "info",
      "مطل العدوة",
      "من المرتفع يُدرك معنى «العدوة الدنيا والقصوى» في وصف المصادر، دون نشر للجيوش.",
      { type: "event", id: "badr" },
    ),
    createInteraction(
      "info-badr-valley",
      new THREE.Vector3(3, 2, 0),
      3,
      "info",
      "قاع الوادي",
      "قاع رملي فيه مواضع آبار في المصادر؛ المشهد يشرح التضاريس فقط.",
      { type: "event", id: "badr" },
    ),
    createInteraction(
      "info-badr-wells",
      new THREE.Vector3(8, 2, -15),
      3,
      "info",
      "جهة الآبار (تخطيطي)",
      "منخفضات توحي بمواضع الماء التي ورد ذكرها؛ الترتيب الزمني في الخط الزمني.",
      { type: "event", id: "badr" },
    ),
    createInteraction(
      "info-badr-rain",
      new THREE.Vector3(-5, 2, -5),
      2.5,
      "narrative",
      "مطر ليلة بدر",
      "المصادر تذكر مطرًا ليلة المعركة ثبت به الأقدام؛ تأثير بيئي توضيحي فقط.",
      { type: "database", id: "badr" },
    ),
  ],
  audioZones: [
    createAudioZone(
      "zone-badr-desert",
      new THREE.Box3(new THREE.Vector3(-90, 0, -90), new THREE.Vector3(90, 20, 90)),
      "ambience-desert-wind",
      20,
      0,
    ),
    createAudioZone(
      "zone-badr-valley",
      new THREE.Box3(new THREE.Vector3(-20, 0, -20), new THREE.Vector3(20, 15, 20)),
      "ambience-camp",
      15,
      5,
    ),
  ],
  lifeEntities: [
    // Authored: grazing camels near the wells and palms along the channel,
    // clear of the eastern terrace sightline.
    { id: "camel-badr-1", animationType: "graze", animationSpeed: 0.4, cullDistance: 100, position: new THREE.Vector3(9, 0, -8) },
    { id: "camel-badr-2", animationType: "idle", animationSpeed: 0.5, cullDistance: 100, position: new THREE.Vector3(-7, 0, -20) },
    { id: "palm-badr-1", animationType: "sway", animationSpeed: 0.3, cullDistance: 80, position: new THREE.Vector3(-26, 0, 30) },
    { id: "palm-badr-2", animationType: "sway", animationSpeed: 0.25, cullDistance: 80, position: new THREE.Vector3(26, 0, 2) },
    { id: "palm-badr-3", animationType: "sway", animationSpeed: 0.35, cullDistance: 80, position: new THREE.Vector3(-28, 0, -32) },
  ],
  particles: [
    createParticles(
      "badr-sand",
      1000,
      new THREE.Box3(new THREE.Vector3(-90, 0.5, -90), new THREE.Vector3(90, 12, 90)),
      0.06,
      new THREE.Color("#c9b890"),
      0.3,
      new THREE.Vector3(-0.2, 0, -0.1),
      0.35,
      12,
      50,
    ),
  ],
  disclosureAr: "بيئة وادٍ ثلاثية الأبعاد تفسيرية لبدر — تضاريس عامة بلا نشر موثق للجيوش، ولا تجسيد ولا قتال ولا لعب.",
  canonicalRef: { chapterId: "battles-conquests", eventId: "badr" },
};

/* ============================================================
 * SCENE 3: Uhud Mountain (Campaign Environment)
 * ============================================================ */
export const SCENE_UHUD_MOUNTAIN: WorldSceneConfig = {
  id: "uhud-mountain",
  nameAr: "جبل أحد",
  descriptionAr: "موقف مراقبة من السهل باتجاه جبل أحد؛ التضاريس هنا تفسير فني لعلاقة المكان بالخبر.",
  seed: 20261124,
  biome: "rocky-plain",
  bounds: { width: 160, depth: 160, height: 60 },
  skyColor: "#2a1f14",
  fogColor: "#3d2c1a",
  fogNear: 25,
  fogFar: 150,
  sunPosition: new THREE.Vector3(-25, 45, 15),
  sunColor: "#ffd9a0",
  sunIntensity: 2.1,
  groundColor: "#6b5136",
  groundRoughness: 0.94,
  groundMetalness: 0,
  rockColor: "#7d6248",
  entryPosition: new THREE.Vector3(0, 2, 55),
  entryYaw: 0, // face -Z: toward the scene centre from the +Z spawn point
  exits: [
    createInteraction(
      "exit-to-reading",
      new THREE.Vector3(-15, 3, 50),
      3,
      "transition",
      "العودة إلى القراءة",
      "الخروج إلى سجل غزوة أحد",
      { type: "event", id: "uhud" },
    ),
    // ---- TRAVEL GATE (back to the desert road) ----
    createInteraction(
      "gate-to-desert-camp",
      new THREE.Vector3(64, 2, -62),
      5,
      "transition",
      "بوابة درب الصحراء",
      "سفر إلى درب الصحراء ومعسكر القوافل، نقطة الانطلاق بين بيئات السيرة.",
      { type: "scene", id: "desert-camp" },
    ),
  ],
  interactions: [
    createInteraction(
      "info-uhud-plain",
      new THREE.Vector3(0, 2, 25),
      3,
      "info",
      "من السهل نحو الجبل",
      "موقف مراقبة من السهل باتجاه جبل أحد؛ التضاريس تفسير فني لعلاقة المكان بالخبر.",
      { type: "event", id: "uhud" },
    ),
    createInteraction(
      "info-uhud-hillside",
      new THREE.Vector3(-15, 4, 5),
      3,
      "info",
      "سفح الجبل",
      "من السفح تظهر صخور الجبل الحمراء المعروفة في وصف أحد؛ البيئة الجبلية تشرح أثر المكان.",
      { type: "event", id: "uhud" },
    ),
    createInteraction(
      "info-uhud-pass",
      new THREE.Vector3(12, 6, -5),
      3,
      "info",
      "مطل الممر",
      "مطل فني على ممر بين الصخور — محطة تأملية لدرس الثبات، بلا تجسيد للأشخاص.",
      { type: "event", id: "uhud" },
    ),
    createInteraction(
      "info-uhud-archers",
      new THREE.Vector3(5, 8, -10),
      2.5,
      "narrative",
      "موضع الرماة (تفسيري)",
      "المصادر تذكر موضع الرماة على الجبل؛ الموقع هنا تقريبي توضيحي فقط.",
      { type: "database", id: "uhud" },
    ),
  ],
  audioZones: [
    createAudioZone(
      "zone-uhud-mountain",
      new THREE.Box3(new THREE.Vector3(-80, 0, -80), new THREE.Vector3(80, 25, 80)),
      "ambience-desert-wind",
      20,
      0,
    ),
  ],
  lifeEntities: [
    { id: "palm-uhud-1", animationType: "sway", animationSpeed: 0.3, cullDistance: 80 },
    { id: "palm-uhud-2", animationType: "sway", animationSpeed: 0.25, cullDistance: 80 },
  ],
  particles: [
    createParticles(
      "uhud-dust",
      600,
      new THREE.Box3(new THREE.Vector3(-80, 0.5, -80), new THREE.Vector3(80, 15, 80)),
      0.05,
      new THREE.Color("#a89478"),
      0.25,
      new THREE.Vector3(-0.15, 0.02, -0.1),
      0.3,
      10,
      30,
    ),
  ],
  disclosureAr: "بيئة جبلية ثلاثية الأبعاد تفسيرية لجبل أحد — ليست مسحًا أثريًا ولا إعادة تمثيل للمعركة، ولا تجسيد لأي شخصية.",
  canonicalRef: { chapterId: "battles-conquests", eventId: "uhud" },
};

/* ============================================================
 * SCENE 4: Khandaq (Trench) Environment
 * ============================================================ */
export const SCENE_KHANDAQ: WorldSceneConfig = {
  id: "khandaq-trench",
  nameAr: "الخندق",
  descriptionAr: "خط دفاع حفره المسلمون حمايةً للمدينة؛ العرض هندسي تعليمي تقريبي.",
  seed: 20261125,
  biome: "wadi",
  bounds: { width: 140, depth: 140, height: 30 },
  skyColor: "#0b1020",
  fogColor: "#131a2e",
  fogNear: 12,
  fogFar: 70,
  sunPosition: new THREE.Vector3(-20, 35, 10),
  sunColor: "#9fb4ff",
  sunIntensity: 1.6,
  groundColor: "#4a4038",
  groundRoughness: 0.96,
  groundMetalness: 0,
  rockColor: "#5c544a",
  entryPosition: new THREE.Vector3(0, 2, 45),
  entryYaw: 0, // face -Z: toward the scene centre from the +Z spawn point
  // The Khandaq is a narrow, deep defensive ditch — restore its authored
  // profile now that the wadi shape is configurable per scene.
  wadiProfile: { halfWidth: 7, wallWidth: 6, wallSlope: 0.8, depth: 4.5 },
  night: true,
  props: [
    { id: "prop-fire-khandaq", type: "campfire", position: new THREE.Vector3(5, 2, 9) },
  ],
  exits: [
    createInteraction(
      "exit-to-reading",
      new THREE.Vector3(0, 2, -55),
      4,
      "transition",
      "العودة إلى القراءة",
      "الخروج إلى سجل غزوة الخندق",
      { type: "event", id: "khandaq" },
    ),
    // ---- TRAVEL GATE (back to the settlement) ----
    createInteraction(
      "gate-to-madinah-walk",
      new THREE.Vector3(-56, 2, -54),
      5,
      "transition",
      "بوابة المدينة الأولى",
      "سفر إلى شوارع يثرب؛ الطريق من الخندق إلى سور المدينة.",
      { type: "scene", id: "madinah-walk" },
    ),
  ],
  interactions: [
    createInteraction(
      "info-trench-edge",
      new THREE.Vector3(0, 2, 15),
      3,
      "info",
      "حافة الخندق",
      "من الحافة يُقرأ مبدأ الخندق كخط دفاع حفره المسلمون؛ العرض هندسي تعليمي تقريبي.",
      { type: "event", id: "khandaq" },
    ),
    createInteraction(
      "info-trench-inside",
      new THREE.Vector3(5, -1.5, 0),
      2.5,
      "info",
      "داخل الخندق",
      "نزول فني آمن إلى قاع الخندق لإدراك عمقه وعرضه التقريبيين؛ الأبعاد تفسيرية.",
      { type: "event", id: "khandaq" },
    ),
    createInteraction(
      "info-city-side",
      new THREE.Vector3(-3, 2, -15),
      3,
      "info",
      "جهة المدينة",
      "من الجهة المقابلة يظهر كيف حُميت المدينة؛ الرياح والليل جزء من وصف المصادر.",
      { type: "event", id: "khandaq" },
    ),
    createInteraction(
      "info-salma",
      new THREE.Vector3(-10, 2, 10),
      2.5,
      "narrative",
      "جبل سلع (سياقي)",
      "الجبل الذي استند إليه الخندق من جهة؛ السياق الجغرافي من المصادر.",
      { type: "atlas", id: "المدينة المنورة" },
    ),
  ],
  audioZones: [
    createAudioZone(
      "zone-khandaq-night",
      new THREE.Box3(new THREE.Vector3(-70, 0, -70), new THREE.Vector3(70, 20, 70)),
      "ambience-camp",
      15,
      0,
    ),
  ],
  lifeEntities: [
    { id: "tent-khandaq-1", animationType: "sway", animationSpeed: 0.4, cullDistance: 60 },
    { id: "tent-khandaq-2", animationType: "sway", animationSpeed: 0.35, cullDistance: 60 },
  ],
  particles: [
    createParticles(
      "khandaq-dust",
      400,
      new THREE.Box3(new THREE.Vector3(-70, 0.5, -70), new THREE.Vector3(70, 10, 70)),
      0.04,
      new THREE.Color("#5a5048"),
      0.2,
      new THREE.Vector3(-0.1, 0.01, -0.05),
      0.25,
      8,
      20,
    ),
  ],
  disclosureAr: "إعادة بناء فنية ثلاثية الأبعاد لمبدأ الخندق — أبعاد تقريبية تعليمية، ليست مسحًا أثريًا ولا تمثيلًا للحصار أو القتال.",
  canonicalRef: { chapterId: "battles-conquests", eventId: "khandaq" },
};

/* ============================================================
 * SCENE 5: Madinah Walk (Early Madinah Settlement)
 * ============================================================ */
export const SCENE_MADINAH_WALK: WorldSceneConfig = {
  id: "madinah-walk",
  nameAr: "شوارع المدينة الأولى",
  descriptionAr: "مسجد من جريد وسقف بسيط، وبيوت من طين، ومؤاخاة بين المهاجرين والأنصار. هنا قامت الدولة.",
  seed: 20261126,
  biome: "settlement",
  bounds: { width: 160, depth: 160, height: 30 },
  skyColor: "#3a3020",
  fogColor: "#54452c",
  fogNear: 20,
  fogFar: 100,
  sunPosition: new THREE.Vector3(-35, 55, 25),
  sunColor: "#fff0c8",
  sunIntensity: 2.3,
  groundColor: "#93765a",
  groundRoughness: 0.93,
  groundMetalness: 0,
  rockColor: "#7a6248",
  entryPosition: new THREE.Vector3(0, 2, 55),
  entryYaw: 0, // face -Z: toward the scene centre from the +Z spawn point
  // The palm road is the authored vista: keep it flat and clear.
  vistaCorridor: { halfWidth: 7, length: 120 },
  exits: [
    createInteraction(
      "exit-to-reading",
      new THREE.Vector3(-10, 2, 60),
      3,
      "transition",
      "العودة إلى القراءة",
      "الخروج إلى فصل تأسيس الدولة",
      { type: "chapter", id: "establishing-state" },
    ),
    // ---- TRAVEL GATES (living-world network) ----
    createInteraction(
      "gate-to-desert-camp",
      new THREE.Vector3(-64, 2, 60),
      5,
      "transition",
      "بوابة درب الصحراء",
      "سفر إلى درب الصحراء ومعسكر القوافل، نقطة الانطلاق بين بيئات السيرة.",
      { type: "scene", id: "desert-camp" },
    ),
    createInteraction(
      "gate-to-khandaq-trench",
      new THREE.Vector3(64, 2, -60),
      5,
      "transition",
      "بوابة الخندق",
      "سفر إلى الخندق؛ خط دفاع حُفر حمايةً للمدينة، وعرضه هندسي تعليمي.",
      { type: "scene", id: "khandaq-trench" },
    ),
    createInteraction(
      "gate-to-hijrah-road",
      new THREE.Vector3(30, 2, 40),
      5,
      "transition",
      "بوابة درب الهجرة",
      "سفر إلى درب الهجرة الصحراوي؛ المسار التوضيحي بين مكة والمدينة.",
      { type: "scene", id: "hijrah-road" },
    ),
  ],
  interactions: [
    createInteraction(
      "info-madinah-entry",
      new THREE.Vector3(0, 2, 25),
      3,
      "info",
      "مدخل يثرب (تفسيري)",
      "مساكن بسيطة ونخيل وساحة ترابية؛ الصورة العامة مستلهمة من وصف المدينة الأولى ببساطتها.",
      { type: "chapter", id: "establishing-state" },
    ),
    createInteraction(
      "info-madinah-mosque",
      new THREE.Vector3(-10, 2, 2),
      3,
      "info",
      "ساحة المسجد الأول",
      "ساحة مسوّرة بأعمدة جذوع وسقف سعف — إعادة بناء فنية لفكرة المسجد الأول كما تصفه المصادر.",
      { type: "event", id: "mosque-building" },
    ),
    createInteraction(
      "info-madinah-market",
      new THREE.Vector3(12, 2, -5),
      3,
      "info",
      "جهة السوق",
      "مظلات سوق عامة توحي بالحياة الاقتصادية للمدينة الناشئة؛ تفاصيل المجتمع في سجلات الفصل.",
      { type: "chapter", id: "establishing-state" },
    ),
    createInteraction(
      "info-madinah-brotherhood",
      new THREE.Vector3(-5, 2, -10),
      2.5,
      "narrative",
      "المؤاخاة (تفسيري)",
      "موضع عام يرمز للمؤاخاة بين المهاجرين والأنصار؛ لا تصوير لأشخاص ولا أحداث محددة.",
      { type: "database", id: "brotherhood" },
    ),
  ],
  audioZones: [
    createAudioZone(
      "zone-madinah-city",
      new THREE.Box3(new THREE.Vector3(-80, 0, -80), new THREE.Vector3(80, 20, 80)),
      "ambience-market",
      20,
      5,
    ),
    createAudioZone(
      "zone-madinah-mosque",
      new THREE.Box3(new THREE.Vector3(-25, 0, -10), new THREE.Vector3(5, 15, 15)),
      "ambience-camp",
      10,
      10,
    ),
  ],
  lifeEntities: [
    // Authored positions: palms and awnings line the road and the market yard
    // instead of hashing onto the entry sightline (0,55 → -Z).
    { id: "awning-madinah-1", animationType: "flutter", animationSpeed: 0.5, cullDistance: 60, position: new THREE.Vector3(16, 0, -2) },
    { id: "awning-madinah-2", animationType: "flutter", animationSpeed: 0.6, cullDistance: 60, position: new THREE.Vector3(6, 0, -10) },
    { id: "awning-madinah-3", animationType: "flutter", animationSpeed: 0.4, cullDistance: 60, position: new THREE.Vector3(-20, 0, -14) },
    { id: "palm-madinah-1", animationType: "sway", animationSpeed: 0.25, cullDistance: 100, position: new THREE.Vector3(15, 0, 38) },
    { id: "palm-madinah-2", animationType: "sway", animationSpeed: 0.3, cullDistance: 100, position: new THREE.Vector3(-16, 0, 32) },
    { id: "palm-madinah-3", animationType: "sway", animationSpeed: 0.2, cullDistance: 100, position: new THREE.Vector3(18, 0, 16) },
    { id: "palm-madinah-4", animationType: "sway", animationSpeed: 0.35, cullDistance: 100, position: new THREE.Vector3(-18, 0, 10) },
  ],
  particles: [
    createParticles(
      "madinah-dust",
      500,
      new THREE.Box3(new THREE.Vector3(-80, 0.5, -80), new THREE.Vector3(80, 12, 80)),
      0.05,
      new THREE.Color("#c4a57a"),
      0.25,
      new THREE.Vector3(-0.1, 0.02, -0.08),
      0.2,
      10,
      25,
    ),
  ],
  disclosureAr: "بيئة مدينة أولى ثلاثية الأبعاد تفسيرية ليثرب — بلا قبة خضراء ولا مآذن متأخرة، عمارة عامة غير موثقة، ولا تجسيد للأشخاص.",
  canonicalRef: { chapterId: "establishing-state", eventId: "mosque-building" },
};

/* ============================================================
 * SCENE 6: Hira Cave (Mountain Cave Environment)
 * ============================================================ */
export const SCENE_HIRA_CAVE: WorldSceneConfig = {
  id: "hira-cave",
  nameAr: "غار حراء",
  descriptionAr: "جبل نور يعلو مكة، وفي أعلاه غار صغير كان محل التحنث. هنا بدأ نزول القرآن.",
  seed: 20261127,
  biome: "mountain-pass",
  bounds: { width: 120, depth: 120, height: 50 },
  skyColor: "#0c1120",
  fogColor: "#141c30",
  fogNear: 10,
  fogFar: 60,
  sunPosition: new THREE.Vector3(-15, 30, 10),
  sunColor: "#b8c8ff",
  sunIntensity: 1.2,
  groundColor: "#5c4a38",
  groundRoughness: 0.95,
  groundMetalness: 0,
  rockColor: "#7a5a44",
  entryPosition: new THREE.Vector3(0, 2, 40),
  entryYaw: 0, // face -Z: toward the scene centre from the +Z spawn point
  night: true,
  props: [
    { id: "prop-lamp-hira", type: "campfire", position: new THREE.Vector3(8, 2, -9), scale: 0.8 },
  ],
  exits: [
    createInteraction(
      "exit-to-reading",
      new THREE.Vector3(0, 2, -50),
      4,
      "transition",
      "العودة إلى القراءة",
      "الخروج إلى فصل بدء الوحي",
      { type: "chapter", id: "prophethood-beginning" },
    ),
    // ---- TRAVEL GATE (back to the desert road) ----
    createInteraction(
      "gate-to-desert-camp",
      new THREE.Vector3(-40, 2, 30),
      5,
      "transition",
      "بوابة درب الصحراء",
      "سفر إلى درب الصحراء ومعسكر القوافل، نقطة الانطلاق بين بيئات السيرة.",
      { type: "scene", id: "desert-camp" },
    ),
  ],
  interactions: [
    createInteraction(
      "info-hira-approach",
      new THREE.Vector3(0, 2, 25),
      3,
      "info",
      "مدخل جبل نور",
      "جبل نور شمال مكة، وفيه غار حراء؛ المشهد ليلي هادئ يهيئ للقراءة، لا يعيد تمثيل الوحي.",
      { type: "chapter", id: "prophethood-beginning" },
    ),
    createInteraction(
      "info-hira-path",
      new THREE.Vector3(5, 3, 2),
      2.5,
      "info",
      "مسار الصعود",
      "مسار صخري صاعد نحو الغار — مسار فني تقريبي ليس قياسًا للطريق الفعلي.",
      { type: "event", id: "first-revelation" },
    ),
    createInteraction(
      "info-hira-cave",
      new THREE.Vector3(12, 2, -15),
      2.5,
      "info",
      "داخل الغار",
      "حجرة صخرية صغيرة بإضاءة قمرية خافتة؛ الغار موضع خلوة وتأمل. لا تمثيل للوحي.",
      { type: "event", id: "first-revelation" },
    ),
    createInteraction(
      "info-hira-lookout",
      new THREE.Vector3(12, 3, -10),
      2.5,
      "info",
      "مطل الغار على مكة",
      "من فم الغار يُطل على السهل باتجاه مكة؛ محطة تأملية لقراءة نص الحدث ومصادره.",
      { type: "event", id: "first-revelation" },
    ),
  ],
  audioZones: [
    createAudioZone(
      "zone-hira-mountain",
      new THREE.Box3(new THREE.Vector3(-60, 0, -60), new THREE.Vector3(60, 25, 60)),
      "ambience-desert-wind",
      15,
      0,
    ),
  ],
  lifeEntities: [],
  particles: [
    createParticles(
      "hira-mist",
      300,
      new THREE.Box3(new THREE.Vector3(-60, 0.5, -60), new THREE.Vector3(60, 15, 60)),
      0.03,
      new THREE.Color("#8aa8d8"),
      0.15,
      new THREE.Vector3(0, 0.02, 0),
      0.15,
      20,
      10,
    ),
  ],
  disclosureAr: "بيئة جبل وغار ثلاثية الأبعاد تفسيرية لحراء — أبعاد الغار ومسار الصعود تقريبية فنية، ولا إعادة تمثيل للوحي ولا تجسيد لأي شخصية.",
  canonicalRef: { chapterId: "prophethood-beginning", eventId: "first-revelation" },
};

/* ============================================================
 * SCENE 7: Hijrah Road (The Migration Desert Journey)
 *
 * REF-13: an illustrative desert route with milestone markers.
 * The path is schematic and educational — it is NOT a surveyed
 * geographical route, and no stop position is claimed as exact.
 * ============================================================ */
export const SCENE_HIJRAH_ROAD: WorldSceneConfig = {
  id: "hijrah-road",
  nameAr: "درب الهجرة",
  descriptionAr: "درب صحراوي طويل من مكة إلى يثرب، ومعالم للطريق مسجلة في السيرة.",
  seed: 20261128,
  biome: "dunes",
  bounds: { width: 160, depth: 320, height: 40 },
  skyColor: "#472a38",
  fogColor: "#6b4230",
  fogNear: 20,
  fogFar: 170,
  sunPosition: new THREE.Vector3(-70, 22, -90),
  sunColor: "#ffb066",
  sunIntensity: 2.4,
  groundColor: "#b08a5e",
  groundRoughness: 0.96,
  groundMetalness: 0,
  rockColor: "#7d6248",
  entryPosition: new THREE.Vector3(0, 2, 150),
  entryYaw: 0, // face -Z: down the road toward the milestones and Madinah
  // The road itself is the authored vista: keep it flat and rock-free.
  vistaCorridor: { halfWidth: 9, length: 320 },
  props: [
    { id: "prop-rest-fire", type: "campfire", position: new THREE.Vector3(-8, 2, 50) },
  ],
  exits: [
    createInteraction(
      "exit-to-reading",
      new THREE.Vector3(-16, 2, 138),
      4,
      "transition",
      "العودة إلى القراءة",
      "الخروج إلى فصل الهجرة",
      { type: "chapter", id: "hijra-to-madinah" },
    ),
    // ---- TRAVEL GATES (living-world network) ----
    createInteraction(
      "gate-to-desert-camp",
      new THREE.Vector3(-60, 2, 120),
      5,
      "transition",
      "بوابة درب الصحراء",
      "سفر إلى درب الصحراء ومعسكر القوافل، نقطة الانطلاق بين بيئات السيرة.",
      { type: "scene", id: "desert-camp" },
    ),
    createInteraction(
      "gate-to-madinah-walk",
      new THREE.Vector3(0, 2, -140),
      5,
      "transition",
      "بوابة المدينة المنورة",
      "سفر إلى شوارع يثرب بعد الوصول؛ ساحة المسجد الأول وبيوت المدينة.",
      { type: "scene", id: "madinah-walk" },
    ),
  ],
  interactions: [
    createInteraction(
      "route-start-makkah",
      new THREE.Vector3(14, 2, 126),
      4,
      "info",
      "بداية الطريق من مكة",
      "انطلاقة الرحلة من مكة في ليلة الهجرة؛ القصة في فصل الهجرة.",
      { type: "event", id: "hijra-start" },
    ),
    createInteraction(
      "route-thawr",
      new THREE.Vector3(-18, 2, 80),
      4,
      "info",
      "غار ثور",
      "محطة غار ثور على طريق الهجرة؛ ثلاث ليالٍ في الغار كما يروي الفصل، بلا تمثيل.",
      { type: "event", id: "cave-thawr" },
    ),
    createInteraction(
      "route-desert-mid",
      new THREE.Vector3(14, 2, 20),
      4,
      "info",
      "درب الصحراء",
      "رمال ومسافات طويلة ودليل خبير بالطرق؛ السياق في فصل الهجرة.",
      { type: "chapter", id: "hijra-to-madinah" },
    ),
    createInteraction(
      "route-quba",
      new THREE.Vector3(-12, 2, -80),
      4,
      "info",
      "قباء على مشارف يثرب؛ أول ما نزل به القادم من مكة قبل دخول المدينة.",
      "قباء قرية على مشارف يثرب؛ أول موضع نزل به القادم من مكة قبل دخول المدينة، كما يذكر فصل الهجرة.",
      { type: "event", id: "arrival-quba" },
    ),
    createInteraction(
      "route-atlas-quba",
      new THREE.Vector3(-24, 2, -92),
      3,
      "info",
      "قباء في الأطلس",
      "موضع قباء في الخريطة التعليمية للأطلس.",
      { type: "atlas", id: "قباء" },
    ),
  ],
  audioZones: [
    createAudioZone(
      "zone-hijrah-desert",
      new THREE.Box3(new THREE.Vector3(-80, 0, -160), new THREE.Vector3(80, 20, 160)),
      "ambience-desert-wind",
      20,
      0,
    ),
    createAudioZone(
      "zone-hijrah-rest",
      new THREE.Box3(new THREE.Vector3(-20, 0, 40), new THREE.Vector3(5, 10, 62)),
      "ambience-camp",
      12,
      10,
    ),
  ],
  lifeEntities: [
    // Camels are owned by the ambient "caravan" preset on this road.
    // Positions are authored so nothing lands on the entry sightline (0,150 → -Z).
    { id: "tent-rest-1", animationType: "sway", animationSpeed: 0.3, cullDistance: 80, position: new THREE.Vector3(-16, 0, 46) },
    { id: "palm-road-1", animationType: "sway", animationSpeed: 0.25, cullDistance: 100, position: new THREE.Vector3(18, 0, 110) },
    { id: "palm-road-2", animationType: "sway", animationSpeed: 0.3, cullDistance: 100, position: new THREE.Vector3(-20, 0, 60) },
    { id: "palm-road-3", animationType: "sway", animationSpeed: 0.22, cullDistance: 100, position: new THREE.Vector3(22, 0, -30) },
  ],
  particles: [
    createParticles(
      "hijrah-sand-drift",
      900,
      new THREE.Box3(new THREE.Vector3(-80, 0.5, -160), new THREE.Vector3(80, 14, 160)),
      0.08,
      new THREE.Color("#e0c49a"),
      0.35,
      new THREE.Vector3(-0.5, 0, -0.2),
      0.5,
      18,
      45,
    ),
  ],
  disclosureAr: "دربُ هجرةٍ ثلاثيُّ الأبعادِ — مسارٌ فنيٌّ تقريبيٌّ بين مكة والمدينة، لا خريطةٌ مساحية، ولا تجسيدٌ للأشخاص.",
  canonicalRef: { chapterId: "hijra-to-madinah" },
};

/** All scenes registry. */
export const WORLD_SCENES: WorldSceneConfig[] = [
  SCENE_DESERT_CAMP,
  SCENE_BADR_VALLEY,
  SCENE_UHUD_MOUNTAIN,
  SCENE_KHANDAQ,
  SCENE_MADINAH_WALK,
  SCENE_HIRA_CAVE,
  SCENE_HIJRAH_ROAD,
];

/** Get scene by ID. */
export function getWorldScene(id: string): WorldSceneConfig | null {
  return WORLD_SCENES.find((s) => s.id === id) ?? null;
}

/** Get scene by canonical reference. */
export function getWorldSceneByRef(ref: { chapterId?: string; eventId?: string }): WorldSceneConfig | null {
  if (ref.eventId) {
    const found = WORLD_SCENES.find((s) => s.canonicalRef?.eventId === ref.eventId);
    if (found) return found;
  }
  if (ref.chapterId) {
    return WORLD_SCENES.find((s) => s.canonicalRef?.chapterId === ref.chapterId) ?? null;
  }
  return null;
}

/** List all scene IDs for navigation. */
export function listWorldSceneIds(): string[] {
  return WORLD_SCENES.map((s) => s.id);
}

/** Default entry scene. */
export const DEFAULT_WORLD_SCENE = SCENE_DESERT_CAMP;