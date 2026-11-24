import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const origin = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:4173";
const chromePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const evidenceDir = resolve("artifacts", "visual-evidence");
const debuggingPort = 9337;
/**
 * Optional case filter. `VISUAL_CASES=media-shelf` captures only the cases
 * whose name matches, so a targeted before/after review never overwrites the
 * historical evidence of unrelated routes.
 */
const caseFilter = process.env.VISUAL_CASES ? new RegExp(process.env.VISUAL_CASES, "i") : null;
const outputDir = process.env.VISUAL_OUTPUT_DIR
  ? resolve(process.env.VISUAL_OUTPUT_DIR)
  : evidenceDir;

export const cases = [
  { name: "gate-1440-light-rtl", path: "/", width: 1440, height: 1000, theme: "light", language: "ar" },
  { name: "gate-360-dark-ltr", path: "/", width: 360, height: 900, theme: "dark", language: "en" },
  { name: "gate-768-dark-rtl", path: "/home", width: 768, height: 1024, theme: "dark", language: "ur" },
  { name: "library-1440-dark-rtl", path: "/library", search: "?view=shelves&ceremony=0&door=0", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="library-living-shelf"]' },
  { name: "library-360-light-ltr", path: "/library", search: "?view=shelves&ceremony=0&door=0", width: 360, height: 900, theme: "light", language: "en", readySelector: '[data-visual="library-living-shelf"]' },
  { name: "library-facade-1440-dark-rtl", path: "/library", search: "?view=shelves&ceremony=0&door=0", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="library-living-shelf"]', scrollSelector: '[data-visual="library-living-shelf"]', scrollOffset: -20 },
  { name: "library-facade-390-dark-rtl", path: "/library", search: "?view=shelves&ceremony=0&door=0", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="library-living-shelf"]', scrollSelector: '[data-visual="library-living-shelf"]', scrollOffset: -20 },
  { name: "library-domain-shelves-1440-dark-rtl", path: "/library", search: "?view=shelves&ceremony=0&door=0", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="library-gateways"]', scrollSelector: '[data-visual="library-gateways"]', scrollOffset: -20 },
  { name: "quran-1440-light-rtl", path: "/quran", width: 1440, height: 1000, theme: "light", language: "ar", readySelector: '[data-visual="quran-sheet"][data-quran-state="ready"]' },
  { name: "quran-360-dark-ltr", path: "/quran", width: 360, height: 900, theme: "dark", language: "en", readySelector: '[data-visual="quran-sheet"][data-quran-state="ready"]' },
  { name: "audio-1440-dark-rtl", path: "/audio", width: 1440, height: 1000, theme: "dark", language: "ar" },
  { name: "audio-360-light-ltr", path: "/audio", width: 360, height: 900, theme: "light", language: "en" },
  { name: "seerah-1440-dark-rtl", path: "/seerah", width: 1440, height: 1000, theme: "dark", language: "ar" },
  { name: "seerah-hero-1440-dark-rtl", path: "/seerah", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-hero"]', scrollSelector: '[data-visual="seerah-hero"]', scrollOffset: -70 },
  { name: "seerah-explore-rail-1440-dark-rtl", path: "/seerah", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-explore-rail"]', scrollSelector: '[data-visual="seerah-explore-rail"]', scrollOffset: -80 },
  { name: "seerah-hero-390-dark-rtl", path: "/seerah", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-hero"]', scrollSelector: '[data-visual="seerah-hero"]', scrollOffset: -70 },
  { name: "seerah-explore-rail-390-dark-rtl", path: "/seerah", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-explore-rail"]', scrollSelector: '[data-visual="seerah-explore-rail"]', scrollOffset: -20 },
  { name: "seerah-graph-768-dark-rtl", path: "/seerah", width: 768, height: 1024, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-event-graph"]', scrollSelector: '[data-visual="seerah-event-graph"]', scrollOffset: -80 },
  { name: "atlas-1440-dark-rtl", path: "/atlas", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[role="tablist"]', clickText: "مسرح الغزوات", scrollSelector: '[data-visual="atlas-theatre-evidence"]', scrollOffset: -80 },
  { name: "atlas-place-badr-1440-dark-rtl", path: "/atlas", search: `?place=${encodeURIComponent("بدر")}`, width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="atlas-place-timeline"]', scrollSelector: '[data-visual="atlas-place-timeline"]', scrollOffset: -80 },
  { name: "atlas-campaign-record-1440-dark-rtl", path: "/atlas", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[role="tablist"]', clickText: "مسرح الغزوات", scrollSelector: '[data-visual="atlas-campaign-record"]', scrollOffset: -80 },
  { name: "atlas-hero-1440-dark-rtl", path: "/atlas", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="atlas-era-rail"]', scrollSelector: '[data-visual="atlas-hero"]', scrollOffset: -10 },
  { name: "atlas-lower-deck-1440-dark-rtl", path: "/atlas", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="atlas-lower-deck"]', scrollSelector: '[data-visual="atlas-lower-deck"]', scrollOffset: -60 },
  { name: "atlas-hero-390-dark-rtl", path: "/atlas", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="atlas-era-rail"]', scrollSelector: '[data-visual="atlas-hero"]', scrollOffset: -10 },
  { name: "atlas-lower-deck-390-dark-rtl", path: "/atlas", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="atlas-lower-deck"]', scrollSelector: '[data-visual="atlas-lower-deck"]', scrollOffset: -20 },
  { name: "seerah-768-light-ltr", path: "/seerah", width: 768, height: 1024, theme: "light", language: "en", scrollSelector: '[data-visual="content-language-notice"]', scrollOffset: -80 },
  { name: "seerah-birth-1440-dark-rtl", path: "/seerah", search: "?chapter=birth-and-upbringing", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-scene="birth-and-upbringing"]', scrollSelector: '[data-scene="birth-and-upbringing"]', scrollOffset: -80 },
  { name: "seerah-revelation-1440-dark-rtl", path: "/seerah", search: "?chapter=prophethood-beginning", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-scene="prophethood-beginning"]', scrollSelector: '[data-scene="prophethood-beginning"]', scrollOffset: -80 },
  { name: "seerah-hijrah-1440-dark-rtl", path: "/seerah", search: "?chapter=hijra-to-madinah", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-scene="hijra-to-madinah"]', scrollSelector: '[data-scene="hijra-to-madinah"]', scrollOffset: -80 },
  { name: "seerah-battles-1440-dark-rtl", path: "/seerah", search: "?chapter=battles-conquests", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-scene="battles-conquests"]', scrollSelector: '[data-scene="battles-conquests"]', scrollOffset: -80 },
  { name: "seerah-reading-1440-dark-rtl", path: "/seerah", search: "?chapter=hijra-to-madinah", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-reading"]', scrollSelector: '[data-visual="seerah-reading"]', scrollOffset: -80 },
  { name: "seerah-journey-theatre-1440-dark-rtl", path: "/seerah", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-journey-theatre"]', scrollSelector: '[data-visual="seerah-journey-theatre"]', scrollOffset: -80 },
  { name: "seerah-journey-thawr-1440-dark-rtl", path: "/seerah", search: "?journey=hijrah-thawr", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-journey-stop="hijrah-thawr"]', scrollSelector: '[data-visual="seerah-journey-theatre"]', scrollOffset: -80 },
  { name: "seerah-journey-theatre-390-dark-rtl", path: "/seerah", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-journey-theatre"]', scrollSelector: '[data-visual="seerah-journey-theatre"]', scrollOffset: -80 },
  { name: "seerah-stage-hijrah-1440-dark-rtl", path: "/seerah", search: "?chapter=hijra-to-madinah", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-chapter-stage="hijra-to-madinah"]', scrollSelector: '[data-visual="seerah-chapter-stage"]', scrollOffset: -80 },
  { name: "seerah-stage-hajj-1440-dark-rtl", path: "/seerah", search: "?chapter=farewell-hajj", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-chapter-stage="farewell-hajj"]', scrollSelector: '[data-visual="seerah-chapter-stage"]', scrollOffset: -80 },
  { name: "seerah-stage-hijrah-390-dark-rtl", path: "/seerah", search: "?chapter=hijra-to-madinah", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-chapter-stage="hijra-to-madinah"]', scrollSelector: '[data-visual="seerah-chapter-stage"]', scrollOffset: -80 },
  { name: "ghazawat-badr-1440-dark-rtl", path: "/seerah", search: "?chapter=battles-conquests&event=badr", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-ghazwah="badr"]', scrollSelector: '[data-ghazwah="badr"]', scrollOffset: -80 },
  { name: "ghazawat-uhud-1440-dark-rtl", path: "/seerah", search: "?chapter=battles-conquests&event=uhud", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-ghazwah="uhud"]', scrollSelector: '[data-ghazwah="uhud"]', scrollOffset: -80 },
  { name: "ghazawat-khandaq-1440-dark-rtl", path: "/seerah", search: "?chapter=battles-conquests&event=khandaq", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-ghazwah="khandaq"]', scrollSelector: '[data-ghazwah="khandaq"]', scrollOffset: -80 },
  { name: "ghazawat-mecca-conquest-1440-dark-rtl", path: "/seerah", search: "?chapter=battles-conquests&event=mecca-conquest", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-ghazwah="mecca-conquest"]', scrollSelector: '[data-ghazwah="mecca-conquest"]', scrollOffset: -80 },
  { name: "ghazawat-khaybar-1440-dark-rtl", path: "/seerah", search: "?chapter=battles-conquests&event=khaybar", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-ghazwah="khaybar"]', scrollSelector: '[data-ghazwah="khaybar"]', scrollOffset: -80 },
  { name: "ghazawat-hunayn-1440-dark-rtl", path: "/seerah", search: "?chapter=battles-conquests&event=hunayn", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-ghazwah="hunayn"]', scrollSelector: '[data-ghazwah="hunayn"]', scrollOffset: -80 },
  { name: "ghazawat-tabuk-1440-dark-rtl", path: "/seerah", search: "?chapter=battles-conquests&event=tabuk", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-ghazwah="tabuk"]', scrollSelector: '[data-ghazwah="tabuk"]', scrollOffset: -80 },
  { name: "seerah-database-1440-dark-rtl", path: "/seerah/database", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-database"]' },
  { name: "seerah-database-badr-1440-light-rtl", path: "/seerah/database", search: "?event=badr", width: 1440, height: 1000, theme: "light", language: "ar", readySelector: '[data-visual="seerah-database-detail"]', scrollSelector: '[data-visual="seerah-database-detail"]', scrollOffset: -80 },
  { name: "seerah-database-quran-1440-dark-rtl", path: "/seerah/database", search: "?event=badr", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-database-quran"]', scrollSelector: '[data-visual="seerah-database-quran"]', scrollOffset: -90 },
  { name: "seerah-database-hadith-360-dark-rtl", path: "/seerah/database", search: "?event=badr", width: 360, height: 900, theme: "dark", language: "ar", readySelector: '[data-visual="seerah-database-hadith"]', scrollSelector: '[data-visual="seerah-database-hadith"]', scrollOffset: -80 },
  { name: "children-360-light-rtl", path: "/kids", width: 360, height: 900, theme: "light", language: "ar" },
  { name: "children-1440-dark-ltr", path: "/children-tv", width: 1440, height: 1000, theme: "dark", language: "en" },
  { name: "hadith-768-dark-rtl", path: "/sunnah", width: 768, height: 1024, theme: "dark", language: "ar" },
  { name: "hadith-360-dark-rtl", path: "/sunnah", width: 360, height: 900, theme: "dark", language: "ar" },
  { name: "hadith-archive-1440-dark-rtl", path: "/hadith", width: 1440, height: 1000, theme: "dark", language: "ar", scrollSelector: '[data-visual="hadith-corpus-scope"]', scrollOffset: -80 },
  { name: "hadith-archive-360-light-ltr", path: "/hadith", width: 360, height: 900, theme: "light", language: "en", scrollSelector: '[data-visual="hadith-corpus-scope"]', scrollOffset: -80 },
  { name: "sources-1440-light-ltr", path: "/sources", width: 1440, height: 1000, theme: "light", language: "en" },
  { name: "sources-deck-1440-dark-rtl", path: "/sources", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="sources-browse-deck"]', scrollSelector: '[data-visual="sources-stats"]', scrollOffset: -20 },
  { name: "sources-deck-390-dark-rtl", path: "/sources", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="sources-browse-deck"]', scrollSelector: '[data-visual="sources-browse-deck"]', scrollOffset: -20 },
  { name: "sources-360-dark-rtl", path: "/sources", width: 360, height: 900, theme: "dark", language: "ar" },
  { name: "daily-768-light-rtl", path: "/daily", width: 768, height: 1024, theme: "light", language: "ar", readySelector: '[data-visual="prayer-observatory"]:not([data-prayer-state="loading"])' },
  { name: "daily-360-dark-ltr", path: "/daily", width: 360, height: 900, theme: "dark", language: "en", readySelector: '[data-visual="prayer-observatory"]:not([data-prayer-state="loading"])' },
  { name: "daily-verse-honesty-1440-dark-rtl", path: "/daily-verse", width: 1440, height: 1000, theme: "dark", language: "ar", scrollSelector: '[data-honesty="no-reward-claim"]', scrollOffset: -140 },
  { name: "prophetic-day-360-light-rtl", path: "/prophetic-day", width: 360, height: 900, theme: "light", language: "ar" },
  { name: "prophetic-day-status-360-dark-rtl", path: "/prophetic-day", width: 360, height: 900, theme: "dark", language: "ar", scrollSelector: ".reflection-nook__summary", scrollOffset: -120 },
  { name: "basirah-1440-dark-rtl", path: "/basirah", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="basirah-desk"]:not([data-basirah-state="loading"])' },
  { name: "basirah-360-light-ltr", path: "/basirah", width: 360, height: 900, theme: "light", language: "en", readySelector: '[data-visual="basirah-desk"]:not([data-basirah-state="loading"])' },
  { name: "who-is-muhammad-1440-light-rtl", path: "/who-is-muhammad", width: 1440, height: 1000, theme: "light", language: "ar" },
  { name: "who-is-muhammad-360-dark-ltr", path: "/who-is-muhammad", width: 360, height: 900, theme: "dark", language: "en" },
  { name: "tafsir-1440-light-rtl", path: "/tafsir", width: 1440, height: 1000, theme: "light", language: "ar", readySelector: '[data-visual="tafsir-study"][data-tafsir-state="ready"]' },
  { name: "library-1440-light-rtl", path: "/library", search: "?view=shelves&ceremony=0&door=0", width: 1440, height: 1000, theme: "light", language: "ar", readySelector: '[data-visual="library-living-shelf"]' },
  { name: "hadith-1440-light-rtl", path: "/hadith", width: 1440, height: 1000, theme: "light", language: "ar", readySelector: '[data-visual="hadith-corpus-scope"]' },
  { name: "hadith-browse-deck-1440-dark-rtl", path: "/hadith", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="hadith-browse-deck"]', scrollSelector: '[data-visual="hadith-browse-deck"]', scrollOffset: -20 },
  { name: "hadith-browse-deck-390-dark-rtl", path: "/hadith", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="hadith-browse-deck"]', scrollSelector: '[data-visual="hadith-browse-deck"]', scrollOffset: -20 },
  // Post-consolidation evidence: the unified media shelf, the parent source
  // panel, and the two legacy-baseline routes that were empty before.
  { name: "kids-hero-1440-dark-rtl", path: "/kids", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="kids-hero"]', scrollSelector: '[data-visual="kids-hero"]', scrollOffset: -70 },
  { name: "kids-interest-rail-1440-dark-rtl", path: "/kids", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="kids-interest-rail"]', scrollSelector: '[data-visual="kids-interest-rail"]', scrollOffset: -120 },
  { name: "kids-safety-band-1440-dark-rtl", path: "/kids", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="kids-safety-band"]', scrollSelector: '[data-visual="kids-safety-band"]', scrollOffset: -80 },
  { name: "kids-explore-rail-1440-dark-rtl", path: "/kids", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="kids-explore-rail"]', scrollSelector: '[data-visual="kids-explore-rail"]', scrollOffset: -80 },
  { name: "kids-hero-390-dark-rtl", path: "/kids", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="kids-hero"]', scrollSelector: '[data-visual="kids-hero"]', scrollOffset: -70 },
  { name: "daily-hero-1440-dark-rtl", path: "/daily", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="daily-hero"]', scrollSelector: '[data-visual="daily-hero"]', scrollOffset: -70 },
  { name: "daily-routine-1440-dark-rtl", path: "/daily", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="daily-routine"]', scrollSelector: '[data-visual="daily-routine"]', scrollOffset: -80 },
  { name: "daily-progress-tools-1440-dark-rtl", path: "/daily", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="daily-tools"]', scrollSelector: '[data-visual="daily-tools"]', scrollOffset: -80 },
  { name: "daily-hero-390-dark-rtl", path: "/daily", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="daily-hero"]', scrollSelector: '[data-visual="daily-hero"]', scrollOffset: -70 },
  { name: "audio-hero-1440-dark-rtl", path: "/audio", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="audio-hero"]', scrollSelector: '[data-visual="audio-hero"]', scrollOffset: -70 },
  { name: "audio-player-1440-dark-rtl", path: "/audio", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="audio-player"]', scrollSelector: '[data-visual="audio-player"]', scrollOffset: -80 },
  { name: "audio-hero-390-dark-rtl", path: "/audio", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="audio-hero"]', scrollSelector: '[data-visual="audio-hero"]', scrollOffset: -70 },
  { name: "kids-media-shelf-1440-dark-rtl", path: "/kids", width: 1440, height: 1000, theme: "dark", language: "ar", scrollSelector: '[data-visual="media-library"]', scrollOffset: -80 },
  { name: "kids-source-panel-1440-dark-rtl", path: "/kids", width: 1440, height: 1000, theme: "dark", language: "ar", clickText: "افتح القصة", scrollSelector: '[data-visual="kids-source-panel"]', scrollOffset: -140 },
  { name: "noor-theatre-1672-dark-rtl", path: "/noor", search: "?ceremony=0", width: 1672, height: 941, theme: "dark", language: "ar", readySelector: '[data-visual="noor-theatre"]', scrollSelector: '[data-visual="noor-theatre"]', scrollOffset: -20 },
  { name: "noor-theatre-1440-dark-rtl", path: "/noor", search: "?ceremony=0", width: 1440, height: 900, theme: "dark", language: "ar", readySelector: '[data-visual="noor-theatre"]', scrollSelector: '[data-visual="noor-theatre"]', scrollOffset: -20 },
  { name: "noor-theatre-768-dark-rtl", path: "/noor", search: "?ceremony=0", width: 768, height: 1024, theme: "dark", language: "ar", readySelector: '[data-visual="noor-theatre"]', scrollSelector: '[data-visual="noor-theatre"]', scrollOffset: -20 },
  { name: "noor-theatre-390-dark-rtl", path: "/noor", search: "?ceremony=0", width: 390, height: 844, theme: "dark", language: "ar", readySelector: '[data-visual="noor-theatre"]', scrollSelector: '[data-visual="noor-theatre"]', scrollOffset: -20 },
  { name: "noor-theatre-360-light-ltr", path: "/noor", search: "?ceremony=0", width: 360, height: 800, theme: "light", language: "en", readySelector: '[data-visual="noor-theatre"]', scrollSelector: '[data-visual="noor-theatre"]', scrollOffset: -20 },
  { name: "manuscript-gallery-1440-dark-rtl", path: "/library", search: "?view=shelves&ceremony=0&door=0", width: 1440, height: 1000, theme: "dark", language: "ar", readySelector: '[data-visual="manuscript-gallery"]', scrollSelector: '[data-visual="manuscript-gallery"]', scrollOffset: -80 },
  { name: "manuscript-gallery-390-light-ltr", path: "/library", search: "?view=shelves&ceremony=0&door=0", width: 390, height: 844, theme: "light", language: "en", readySelector: '[data-visual="manuscript-gallery"]', scrollSelector: '[data-visual="manuscript-gallery"]', scrollOffset: -80 },
  { name: "prayer-guide-1440-light-rtl", path: "/prayer-guide", width: 1440, height: 1000, theme: "light", language: "ar", scrollSelector: '[data-visual="prayer-guide-review"]', scrollOffset: -80 },
  { name: "islamic-knowledge-1440-dark-rtl", path: "/islamic-knowledge", width: 1440, height: 1000, theme: "dark", language: "ar", scrollSelector: '[data-visual="islamic-knowledge-review"]', scrollOffset: -80 },
  // Paired before/after review set. The same case names are captured from the
  // pre-consolidation commit and from `main`, so the two folders can be
  // compared side by side without scroll or click differences.
  { name: "compare-kids-1440-dark-rtl", path: "/kids", width: 1440, height: 1000, theme: "dark", language: "ar" },
  { name: "compare-prayer-guide-1440-light-rtl", path: "/prayer-guide", width: 1440, height: 1000, theme: "light", language: "ar" },
  { name: "compare-islamic-knowledge-1440-dark-rtl", path: "/islamic-knowledge", width: 1440, height: 1000, theme: "dark", language: "ar" },
  { name: "compare-seerah-1440-dark-rtl", path: "/seerah", width: 1440, height: 1000, theme: "dark", language: "ar" },
];

async function main() {
mkdirSync(outputDir, { recursive: true });
const profileDir = mkdtempSync(join(tmpdir(), "yra-visual-evidence-"));

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--hide-scrollbars",
  "--disable-background-networking",
  "--disable-default-apps",
  "--disable-extensions",
  "--disable-sync",
  `--remote-debugging-port=${debuggingPort}`,
  `--user-data-dir=${profileDir}`,
  `${origin}/`,
], { stdio: "ignore", windowsHide: true });

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

async function waitForDebugger() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`);
      const pages = await response.json();
      const page = pages.find((item) => item.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome has not finished opening the debugger endpoint yet.
    }
    await delay(125);
  }
  throw new Error("Chrome DevTools endpoint did not become available");
}

class DevToolsSession {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
  }

  async open() {
    await new Promise((resolveOpen, rejectOpen) => {
      this.socket.once("open", resolveOpen);
      this.socket.once("error", rejectOpen);
    });
    this.socket.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      this.events.push(message);
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolveSend, rejectSend) => {
      this.pending.set(id, { resolve: resolveSend, reject: rejectSend });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

async function waitForDocument(session, expectedPath = null) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const state = await session.send("Runtime.evaluate", {
      expression: expectedPath
        ? `({ readyState: document.readyState, pathname: location.pathname })`
        : "({ readyState: document.readyState })",
      returnByValue: true,
    });
    const value = state.result.value;
    const pathReady = !expectedPath || value.pathname === expectedPath;
    if (value.readyState === "complete" && pathReady) break;
    await delay(100);
  }
  await session.send("Runtime.evaluate", {
    expression: "document.fonts ? document.fonts.ready.then(() => true) : true",
    awaitPromise: true,
    returnByValue: true,
  });
  await delay(500);
}

async function waitForMainContent(session, minimumCharacters = 120) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const probe = await session.send("Runtime.evaluate", {
      expression: `(() => {
        const main = document.querySelector("main");
        return {
          readyState: document.readyState,
          textLength: main?.textContent?.trim().length ?? 0,
        };
      })()`,
      returnByValue: true,
    });
    if (probe.result?.value?.textLength >= minimumCharacters) return;
    await delay(250);
  }
  throw new Error("The application main region never received real content");
}

const report = [];
let session;

try {
  session = new DevToolsSession(await waitForDebugger());
  await session.open();
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("Log.enable");
  await session.send("Accessibility.enable");

  await session.send("Page.navigate", { url: `${origin}/` });
  await waitForDocument(session);

  for (const testCase of cases) {
    if (caseFilter && !caseFilter.test(testCase.name)) continue;
    const eventStart = session.events.length;
    await session.send("Emulation.setDeviceMetricsOverride", {
      width: testCase.width,
      height: testCase.height,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: testCase.width,
      screenHeight: testCase.height,
    });
    await session.send("Emulation.setEmulatedMedia", {
      media: "screen",
      features: [
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "prefers-color-scheme", value: testCase.theme },
      ],
    });
    await session.send("Runtime.evaluate", {
      expression: `localStorage.setItem("divine-mode", ${JSON.stringify(testCase.theme === "dark" ? "heaven" : "earth")}); localStorage.setItem("preferred-language", ${JSON.stringify(testCase.language)}); localStorage.setItem("institution-welcome-seen", "true");
      (() => {
        const key = "yra-visual-golden-v1";
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch { saved = {}; }
        localStorage.setItem(key, JSON.stringify({ ...saved, theme: ${JSON.stringify(testCase.theme)}, lang: ${JSON.stringify(
          testCase.language === "en" ? "en" : "ar",
        )} }));
      })();`,
    });
    await session.send("Page.navigate", { url: `${origin}${testCase.path}${testCase.search ?? ""}` });
    await waitForDocument(session, testCase.path === "/home" ? "/" : testCase.path);
    await waitForMainContent(session);

    if (testCase.readySelector) {
      // A 10.7 MB catalog cannot be assumed to be on screen when
      // readyState completes. Without this the Library evidence was a
      // screenshot of the loading spinner.
      const deadline = Date.now() + 120_000;
      let found = false;
      while (Date.now() < deadline) {
        const probe = await session.send("Runtime.evaluate", {
          expression: `Boolean(document.querySelector(${JSON.stringify(testCase.readySelector)}))`,
          returnByValue: true,
        });
        if (probe.result?.value === true) {
          found = true;
          break;
        }
        await delay(500);
      }
      if (!found) throw new Error(`Visual evidence never became ready for ${testCase.name}: ${testCase.readySelector}`);
      await delay(300);
    }
    if (testCase.clickText) {
      const actionResult = await session.send("Runtime.evaluate", {
        expression: `(() => {
          const target = [...document.querySelectorAll("button")].find((button) => button.textContent?.includes(${JSON.stringify(testCase.clickText)}));
          if (!target) throw new Error("Visual evidence action target not found");
          target.click();
        })()`,
      });
      if (actionResult.exceptionDetails) throw new Error(`Visual action failed for ${testCase.name}`);
      await delay(450);
    }
    if (testCase.scrollSelector) {
      await session.send("Runtime.evaluate", {
        expression: `document.querySelector(${JSON.stringify(testCase.scrollSelector)})?.scrollIntoView({ block: "start" })`,
      });
      await delay(250);
    }
    if (testCase.scrollOffset) {
      await session.send("Runtime.evaluate", { expression: `window.scrollBy(0, ${testCase.scrollOffset})` });
      await delay(150);
    }

    const diagnostics = await session.send("Runtime.evaluate", {
      expression: `(() => {
        const viewportWidth = window.innerWidth;
        const overflowElements = [...document.querySelectorAll("body *")]
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return { element, rect };
          })
          .filter(({ element, rect }) => {
            const style = getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden" && rect.width > 1 &&
              (rect.left < -1 || rect.right > viewportWidth + 1);
          })
          .slice(0, 12)
          .map(({ element, rect }) => ({
            tag: element.tagName.toLowerCase(),
            id: element.id,
            className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          }));
        return {
          url: location.href,
          title: document.title,
          viewportWidth,
          viewportHeight: window.innerHeight,
          documentWidth: document.documentElement.scrollWidth,
          documentHeight: document.documentElement.scrollHeight,
          bodyWidth: document.body.scrollWidth,
          applicationMounted: Boolean(document.querySelector("#root")?.children.length),
          expectedOrigin: ${JSON.stringify(origin)},
          originMatches: location.origin === ${JSON.stringify(origin)},
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          language: document.documentElement.lang,
          direction: document.documentElement.dir,
          shellLanguage: document.querySelector(".vg-shell")?.getAttribute("data-lang") ?? null,
          contentLanguageNotice: Boolean(document.querySelector('[data-visual="content-language-notice"]')),
      contentLanguageShape: document
        .querySelector('[data-visual="content-language-notice"]')
        ?.getAttribute("data-content-shape") ?? null,
          horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
          overflowElements,
          visiblyUnnamedInteractive: [...document.querySelectorAll("button, a[href], [role='button'], [role='link']")]
            .filter((element) => {
              const style = getComputedStyle(element);
              if (style.display === "none" || style.visibility === "hidden") return false;
              const label = element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent?.trim();
              const imageLabel = element.querySelector("img")?.getAttribute("alt");
              return !label && !imageLabel;
            })
            .slice(0, 12)
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              href: element.getAttribute("href"),
              className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
              html: element.outerHTML.slice(0, 260),
            })),
        };
      })()`,
      returnByValue: true,
    });

    const accessibility = await session.send("Accessibility.getFullAXTree");
    const unnamedInteractive = accessibility.nodes.filter((node) => {
      const role = node.role?.value;
      return (role === "button" || role === "link") && !node.name?.value;
    }).length;

    const screenshot = await session.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 86,
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const screenshotPath = join(outputDir, `${testCase.name}.jpg`);
    writeFileSync(screenshotPath, Buffer.from(screenshot.data, "base64"));

    const newEvents = session.events.slice(eventStart);
    const runtimeErrors = newEvents
      .filter((event) => event.method === "Runtime.exceptionThrown" ||
        (event.method === "Log.entryAdded" && ["error", "warning"].includes(event.params.entry.level)) ||
        (event.method === "Runtime.consoleAPICalled" && event.params.type === "error"))
      .map((event) => ({
        method: event.method,
        text: event.params?.entry?.text ?? event.params?.exceptionDetails?.text ?? event.params?.type ?? "unknown",
        url: event.params?.entry?.url ?? event.params?.exceptionDetails?.url ?? null,
      }));

    report.push({
      ...testCase,
      screenshot: screenshotPath.replaceAll("\\", "/"),
      ...diagnostics.result.value,
      unnamedInteractive,
      runtimeErrors,
    });
  }

  const caseByName = new Map(cases.map((item) => [item.name, item]));
  const withExpectations = report.map((item) => {
    const declared = caseByName.get(item.name);
    const expectedLanguage = declared?.language === "en" ? "en" : "ar";
    const expectedDirection = expectedLanguage === "ar" ? "rtl" : "ltr";
    const shellLang = item.shellLanguage ?? null;
    return {
      ...item,
      expectedLanguage,
      expectedDirection,
      shellLanguage: shellLang,
      matchesDeclaredLanguage: shellLang === expectedLanguage,
      matchesDeclaredDirection: item.direction === expectedDirection,
    };
  });
  const mismatched = withExpectations.filter(
    (item) => !item.matchesDeclaredLanguage || !item.matchesDeclaredDirection,
  );
  const reportPath = join(outputDir, "visual-evidence-report.json");
  writeFileSync(
    reportPath,
    `${JSON.stringify({ origin, reducedMotion: true, cases: withExpectations }, null, 2)}\n`,
  );

  const failed = withExpectations.filter((item) => !item.applicationMounted || !item.originMatches || item.horizontalOverflow || item.runtimeErrors.length || item.visiblyUnnamedInteractive.length || !item.matchesDeclaredLanguage || !item.matchesDeclaredDirection);
  console.log(`Visual evidence captured: ${withExpectations.length} cases.`);
  console.log(`Application mount failures: ${withExpectations.filter((item) => !item.applicationMounted || !item.originMatches).length}.`);
  console.log(`Horizontal overflow failures: ${withExpectations.filter((item) => item.horizontalOverflow).length}.`);
  console.log(`Runtime error cases: ${withExpectations.filter((item) => item.runtimeErrors.length).length}.`);
  console.log(`Cases with visible unnamed interactive elements: ${withExpectations.filter((item) => item.visiblyUnnamedInteractive.length).length}.`);
  console.log(`Cases whose rendered language/direction did not match the case name: ${mismatched.length}.`);
  if (failed.length) {
    console.log(`Review required: ${failed.map((item) => item.name).join(", ")}`);
    process.exitCode = 1;
  }
} finally {
  session?.close();
  chrome.kill();
}
}

const invokedDirectly = process.argv[1] === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  await main();
}
