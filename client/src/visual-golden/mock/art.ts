/**
 * Fallback environment-art registry for the visual institution.
 *
 * Cinematic world plates from the owner-approved 2026 reference pack are
 * preferred wherever a wing/chapter/event maps to one; this module supplies the
 * shipped non-figurative SVG/WebP fallback (and reading/ceremony surfaces) when
 * no cinematic plate exists. Paths are production assets under
 * `client/public/visual-golden/art/`, not placeholders — provenance for the
 * plate-derived artwork is recorded in `art/worlds/manifest.json`.
 */
export const art = {
  mosque: "/visual-golden/art/mosque-hero.webp",
  kaaba: "/visual-golden/art/kaaba-night.webp",
  dome: "/visual-golden/art/dome-close.webp",
  domeCard: "/visual-golden/art/card-dome.webp",
  books: "/visual-golden/art/card-books.webp",
  bookStack: "/visual-golden/art/book-stack.webp",
  arches: "/visual-golden/art/card-arches.webp",
  archesNight: "/visual-golden/art/arches-night.webp",
  lantern: "/visual-golden/art/card-lantern.webp",
  lanternGlow: "/visual-golden/art/lantern-glow.webp",
  library: "/visual-golden/art/library-hero.webp",
  shelves: "/visual-golden/art/library-shelves.webp",
  mushaf: "/visual-golden/art/mushaf.webp",
  mushafOpen: "/visual-golden/art/mushaf-open.webp",
  atlas: "/visual-golden/art/atlas-hero.webp",
  desert: "/visual-golden/art/desert-trail.webp",
  kids: "/visual-golden/art/kids-hero.webp",
  kidsRead: "/visual-golden/art/kids-reading.webp",
  kidsCamel: "/visual-golden/art/kids-camel.webp",
  logo: "/visual-golden/art/logo.webp",
  emblem: "/visual-golden/art/emblem.webp",
  reciterDome: "/visual-golden/art/reciter-dome.webp",
  reciterKaaba: "/visual-golden/art/reciter-kaaba.webp",
  reciterWater: "/visual-golden/art/reciter-water.webp",
  reciterLanterns: "/visual-golden/art/reciter-lanterns.webp",
  reciterMushaf: "/visual-golden/art/reciter-mushaf.webp",
  reciterCourtyard: "/visual-golden/art/reciter-courtyard.webp",
  storyReading: "/visual-golden/art/story-reading.webp",
  storyHijrah: "/visual-golden/art/story-hijrah.webp",
  storyCamel: "/visual-golden/art/story-camel.webp",
  storyAnimals: "/visual-golden/art/story-animals.webp",
  // Non-figurative environment plates drawn for the immersive Seerah scenes.
  // They carry no people, faces, sacred architecture, or embedded text, and
  // are always presented as illustrative reconstructions.
  sceneThreshold: "/visual-golden/art/scene-threshold.svg",
  sceneGateway: "/visual-golden/art/scene-gateway.svg",
  sceneMakkah: "/visual-golden/art/scene-makkah.svg",
  sceneHira: "/visual-golden/art/scene-hira.svg",
  sceneDawah: "/visual-golden/art/scene-dawah.svg",
  sceneHijrah: "/visual-golden/art/scene-hijrah.svg",
  sceneMadinah: "/visual-golden/art/scene-madinah.svg",
  sceneHajj: "/visual-golden/art/scene-hajj.svg",
  sceneFarewell: "/visual-golden/art/scene-farewell.svg",
  sceneBadr: "/visual-golden/art/scene-badr.svg",
  sceneUhud: "/visual-golden/art/scene-uhud.svg",
  sceneKhandaq: "/visual-golden/art/scene-khandaq.svg",
  sceneKhaybar: "/visual-golden/art/scene-khaybar.svg",
  sceneFath: "/visual-golden/art/scene-fath.svg",
  sceneHunayn: "/visual-golden/art/scene-hunayn.svg",
  sceneTabuk: "/visual-golden/art/scene-tabuk.svg",
} as const;
