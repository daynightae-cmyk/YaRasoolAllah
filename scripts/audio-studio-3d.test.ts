/**
 * Audio studio 3D — directive §4.E immersive listening studio.
 *
 * Genuine 3D studio on the shared interior engine: rehal + headphones,
 * round carpet, floating sound ribbon, reciter catalog cabinet, smart
 * speaker. The ribbon/equalizer are an HONEST playback-state visualization:
 * they animate only while governed audio is actually playing, freeze on
 * pause and under reduced motion — never permanent fake motion. Real
 * transport controls live in the DOM overlay over the same mounted player;
 * reciter names/streams come from the governed MP3Quran response.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getInteriorScene, listInteriorScenes } from "../client/src/visual-golden/services/interior-scenes";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("audio studio registry", () => {
  it("exposes a governed studio scene with four linked stations", () => {
    const scene = getInteriorScene("audio-studio");
    assert.ok(scene);
    assert.equal(scene.kind, "studio");
    assert.equal(scene.nodes.length, 4);
    const ids = scene.nodes.map((node) => node.id);
    assert.deepEqual(ids, ["entrance", "rehal", "sound-ribbon", "reciter-catalog"]);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(Number.isInteger(scene.seed) && scene.seed > 0);
    for (const node of scene.nodes) {
      assert.ok(node.position[1] > 1.2 && node.position[1] < 2.2, "human observer eye height");
      assert.ok(Math.abs(node.position[0]) < 13 && Math.abs(node.position[2]) < 13, "stations inside the room");
      assert.ok(node.labelAr.length > 0 && node.noteAr.length > 20);
    }
    // A listening studio is not a prayer hall: no mihrab niche.
    assert.equal(scene.shell?.mihrab, false);
  });

  it("discloses artistic nature and the honest-playback contract", () => {
    const scene = getInteriorScene("audio-studio")!;
    assert.match(scene.disclosureAr, /فني/);
    assert.match(scene.disclosureAr, /ليس إعادة بناء/);
    assert.match(scene.disclosureAr, /لا يَرِد نص قرآني داخل المشهد/);
    assert.match(scene.disclosureAr, /يتحرك فقط أثناء التشغيل الحقيقي/);
    const ribbon = scene.nodes.find((node) => node.id === "sound-ribbon")!;
    assert.match(ribbon.noteAr, /لا حركة دائمة مختلقة/);
    const catalog = scene.nodes.find((node) => node.id === "reciter-catalog")!;
    assert.match(catalog.noteAr, /استجابة MP3Quran الرسمية/);
    assert.match(catalog.noteAr, /لا صور مولدة لقراء ولا أصوات مصطنعة/);
  });

  it("keeps every registered scene distinct and honest", () => {
    const scenes = listInteriorScenes();
    const ids = scenes.map((scene) => scene.sceneId);
    assert.equal(new Set(ids).size, ids.length);
    const seeds = scenes.map((scene) => scene.seed);
    assert.equal(new Set(seeds).size, seeds.length);
    assert.ok(scenes.length >= 4, "quran, hadith, sources, audio interiors registered");
    for (const scene of scenes) {
      assert.match(scene.disclosureAr, /فني/);
    }
  });
});

describe("audio studio engine", () => {
  const component = read("client/src/visual-golden/components/audio/AudioStudio3D.tsx");

  it("is a furnishing over the shared verified shell", () => {
    assert.match(component, /InteriorScene3D/);
    assert.match(component, /furnish=\{furnishStudio\}/);
    assert.match(component, /visualId="audio-studio"/);
    assert.match(component, /playing=\{playing\}/);
  });

  it("builds the reference studio: rehal, headphones, carpet, ribbon, catalog, speaker", () => {
    assert.match(component, /Round listening carpet/);
    assert.match(component, /Carved rehal/);
    assert.match(component, /Headphones leaning against the rehal/);
    assert.match(component, /Floating golden sound ribbon/);
    assert.match(component, /TubeGeometry/);
    assert.match(component, /Reciter catalog cabinet/);
    assert.match(component, /Smart speaker on a marble ledge/);
    assert.match(component, /CapsuleGeometry/);
    assert.match(component, /PointLight/);
  });

  it("never renders Quran text or reciter portraits into scene textures", () => {
    assert.doesNotMatch(component, /CanvasTexture/);
    assert.doesNotMatch(component, /fillText/);
    assert.doesNotMatch(component, /createElement\("canvas"\)/);
    assert.doesNotMatch(component, /TextureLoader/);
    assert.match(component, /NO text anywhere/);
    assert.match(component, /pure geometric ornament/);
  });

  it("sound ribbon is honest: playback-driven, frozen at rest, discrete under reduced motion", () => {
    // Amplitude is a function of the engine's eased REAL playback level.
    assert.match(component, /const amp = 0\.34 \* level/);
    assert.match(component, /state\.playbackLevel/);
    // Full motion animates only while there is playback level (or decay tail).
    assert.match(component, /context\.motion === "full"/);
    assert.match(component, /state\.playbackLevel > 0\.002 \|\| appliedLevel > 0\.002/);
    // Reduced motion: one static pose per state change, never continuous.
    assert.match(component, /one static pose per playback-state change/);
    assert.match(component, /onFrame/);
    assert.match(component, /onLamp\(level\)/);
  });

  it("respects motion, lamp and disposal rules", () => {
    assert.doesNotMatch(component, /new THREE\.WebGLRenderer/);
    assert.doesNotMatch(component, /requestAnimationFrame\(/);
    assert.doesNotMatch(component, /matchMedia\(/);
    assert.match(component, /track\(new THREE\./);
  });
});

describe("audio page studio wiring", () => {
  const page = read("client/src/visual-golden/pages/AudioPage.tsx");
  const css = read("client/src/visual-golden/pages/AudioPage.module.css");

  it("offers an explicit opt-in entry, lazy-loaded", () => {
    assert.match(page, /data-visual="audio-studio-enter"/);
    assert.match(page, /const AudioStudio3D = lazy\(/);
    assert.match(page, /getInteriorScene\("audio-studio"\)/);
    assert.match(page, /setStudioFailed\(true\)/);
    assert.match(page, /studioAvailable = !!studioScene && !studioFailed/);
  });

  it("drives the scene from the real player state", () => {
    assert.match(page, /playing=\{playing\}/);
    assert.match(page, /lampOn=\{studioLamp\}/);
    assert.match(page, /data-visual="audio-studio-player"/);
  });

  it("overlay transport controls the SAME mounted governed player", () => {
    assert.match(page, /onClick=\{\(\) => void togglePlay\(\)\}/);
    assert.match(page, /onClick=\{\(\) => changeSurah\(active - 1\)\}/);
    assert.match(page, /onClick=\{\(\) => changeSurah\(active \+ 1\)\}/);
    assert.match(page, /onClick=\{\(\) => setRepeat\(\(value\) => !value\)\}/);
    assert.match(page, /onClick=\{toggleTrackFavorite\}/);
    // Distinct overlay ids — the hidden full player keeps the canonical ones.
    assert.equal((page.match(/data-visual="audio-studio-player"/g) ?? []).length, 1, "overlay id must be unique");
    assert.match(page, /data-visual="audio-player"/);
    assert.match(page, /data-visual="studio-repeat"/);
    assert.match(page, /data-visual="studio-favorite"/);
    assert.match(page, /aria-label="موضع التلاوة"/);
    assert.match(page, /aria-label="مستوى الصوت"/);
  });

  it("reciter catalog reads the real governed MP3Quran response", () => {
    assert.match(page, /reciters\.state === "ready" \? reciters\.items\.slice\(0, 8\) : \[\]/);
    assert.match(page, /onClick=\{\(\) => chooseReciter\(item\)\}/);
    assert.match(page, /aria-label="فهرس القراء"/);
    assert.match(page, /لا أصوات مولدة ولا صور قراء مختلقة/);
    assert.match(page, /شريط الصوت في المشهد يتحرك فقط أثناء التشغيل الحقيقي/);
  });

  it("keeps the real player mounted so listening never restarts on enter/exit", () => {
    assert.match(page, /showStudio \? styles\.studioHidden : ""/);
    assert.match(page, /showStudio \? styles\.studioHidden : undefined/);
    assert.match(css, /\.studioHidden/);
    assert.match(css, /clip-path: inset\(50%\)/);
    // The single <audio> element lives in the always-mounted hero player.
    assert.match(page, /ref=\{audioRef\}/);
  });

  it("preserves the existing audio honesty contracts", () => {
    assert.match(page, /data-visual="audio-repeat"/);
    assert.match(page, /data-visual="audio-favorite"/);
    assert.match(page, /البث مباشر من خوادم MP3Quran\.net داخل المشغل/);
    assert.match(page, /لا أصوات مولدة، لا مدد مختلقة، ولا تنزيلات وهمية/);
    assert.doesNotMatch(page, /waveform|Waveform|موجة صوتية/);
    assert.doesNotMatch(css, /@keyframes[^}]*wave/i);
  });
});