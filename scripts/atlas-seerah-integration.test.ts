import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ATLAS_NODES } from "../client/src/visual-golden/services/atlas";
import {
  atlasPlaceDatabaseHref,
  campaignChapterHref,
  campaignSeerahHref,
  findAtlasNodeByQuery,
  seerahEventForCampaign,
  seerahEventsForAtlasNode,
  seerahPlaceForAtlasNode,
} from "../client/src/visual-golden/services/atlas-seerah";
import { SEERAH_DATABASE } from "../client/src/data/seerah";
import { LIVING_CAMPAIGNS } from "../client/src/visual-golden/data/living-atlas";
import {
  listGhazawatScenes,
  getGhazawatScene,
} from "../client/src/visual-golden/services/seerah-ghazawat";
import {
  listSeerahScenes,
  getSeerahScene,
} from "../client/src/visual-golden/services/seerah-scene";
import { art } from "../client/src/visual-golden/mock/art";
import { seerahChapters } from "../client/src/data/seerahData";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const atlasPage = readFileSync(
  join(repoRoot, "client", "src", "visual-golden", "pages", "AtlasPage.tsx"),
  "utf8",
);
const databasePage = readFileSync(
  join(repoRoot, "client", "src", "visual-golden", "pages", "SeerahDatabasePage.tsx"),
  "utf8",
);

describe("atlas place deep links resolve by id and by Arabic name", () => {
  it("resolves every atlas node by its own id", () => {
    for (const node of ATLAS_NODES) {
      assert.equal(findAtlasNodeByQuery(node.id)?.id, node.id, node.name);
    }
  });

  it("resolves every atlas node by its Arabic name", () => {
    for (const node of ATLAS_NODES) {
      assert.equal(findAtlasNodeByQuery(node.name)?.id, node.id, node.name);
    }
  });

  it("rejects unknown and empty queries instead of guessing a place", () => {
    assert.equal(findAtlasNodeByQuery("غير موجود"), null);
    assert.equal(findAtlasNodeByQuery(""), null);
    assert.equal(findAtlasNodeByQuery(null), null);
  });
});

describe("the atlas and the chronological database share recorded places only", () => {
  it("maps every database atlasName to a real atlas node", () => {
    const atlasNames = new Set(ATLAS_NODES.map((node) => node.name));
    const namedPlaces = SEERAH_DATABASE.places.filter((place) => place.atlasName);
    assert.ok(namedPlaces.length > 0);
    for (const place of namedPlaces) {
      assert.ok(atlasNames.has(place.atlasName as string), place.atlasName);
    }
  });

  it("gives every atlas node a recorded place and at least one ordered event", () => {
    for (const node of ATLAS_NODES) {
      const place = seerahPlaceForAtlasNode(node);
      assert.ok(place, `no Seerah place for ${node.name}`);
      const events = seerahEventsForAtlasNode(node);
      assert.ok(events.length > 0, `no Seerah events for ${node.name}`);
      const orders = events.map((event) => event.order);
      assert.deepEqual(orders, [...orders].sort((a, b) => a - b), node.name);
    }
  });

  it("builds the database place filter from the recorded place id", () => {
    const place = SEERAH_DATABASE.places.find((item) => item.atlasName === "بدر");
    assert.ok(place);
    assert.equal(atlasPlaceDatabaseHref(place), `/seerah/database?place=${place.id}`);
  });
});

describe("documented Living Atlas campaigns link to their Seerah records", () => {
  const documented = ["badr", "uhud", "khandaq", "fath"];

  it("resolves every documented campaign to a real database event", () => {
    for (const campaignId of documented) {
      const event = seerahEventForCampaign(campaignId);
      assert.ok(event, campaignId);
      assert.ok(SEERAH_DATABASE.events.some((item) => item.id === event.id));
    }
  });

  it("produces database and chapter deep links, not a generic landing page", () => {
    for (const campaignId of documented) {
      const record = campaignSeerahHref(campaignId);
      const chapter = campaignChapterHref(campaignId);
      assert.ok(record?.startsWith("/seerah/database?event="));
      assert.ok(chapter?.startsWith("/seerah?chapter="));
      assert.ok(chapter?.includes("&event="));
    }
  });

  it("does not invent a campaign-to-event link for undocumented campaigns", () => {
    assert.equal(seerahEventForCampaign("not-a-campaign"), null);
    assert.equal(campaignSeerahHref("not-a-campaign"), null);
    assert.equal(campaignChapterHref("not-a-campaign"), null);
  });

  it("keeps every Living Atlas campaign in the documented set or explicitly unmapped", () => {
    for (const campaign of LIVING_CAMPAIGNS) {
      if (documented.includes(campaign.id)) continue;
      assert.equal(seerahEventForCampaign(campaign.id), null, campaign.id);
    }
  });
});

describe("the atlas page actually consumes the bridge", () => {
  it("resolves the place query through the shared helper", () => {
    assert.ok(atlasPage.includes("findAtlasNodeByQuery"));
    assert.ok(atlasPage.includes('new URLSearchParams(search).get("place")'));
  });

  it("renders the synchronized place timeline and the campaign record link", () => {
    assert.ok(atlasPage.includes('data-visual="atlas-place-timeline"'));
    assert.ok(atlasPage.includes('data-visual="atlas-campaign-record"'));
    assert.ok(atlasPage.includes("seerahEventsForAtlasNode"));
    assert.ok(atlasPage.includes("campaignSeerahHref"));
  });

  it("lets the database page read the atlas place parameter", () => {
    assert.ok(databasePage.includes('params.get("place")'));
    assert.ok(databasePage.includes("requestedPlaceId"));
    assert.ok(databasePage.includes("SEERAH_DATABASE.places.some"));
  });
});

describe("scene registries stay tied to canonical ids and assets", () => {
  const chapterIds = new Set(seerahChapters.map((chapter) => chapter.id));
  const eventIds = new Set(SEERAH_DATABASE.events.map((event) => event.id));
  const campaignIds = new Set(LIVING_CAMPAIGNS.map((campaign) => campaign.id));

  it("maps every Seerah scene to a canonical chapter", () => {
    for (const scene of listSeerahScenes()) {
      assert.ok(chapterIds.has(scene.chapterId), scene.chapterId);
      assert.ok(scene.plate in art, scene.plate);
      assert.ok(scene.disclosureAr.trim().length > 20, scene.chapterId);
      if (scene.atlasCampaignId) {
        assert.ok(campaignIds.has(scene.atlasCampaignId), scene.atlasCampaignId);
      }
    }
  });

  it("maps every Ghazwah scene to a canonical database event", () => {
    for (const scene of listGhazawatScenes()) {
      assert.ok(eventIds.has(scene.eventId), scene.eventId);
      assert.ok(scene.plate in art, scene.plate);
      assert.ok(scene.disclosureAr.trim().length > 20, scene.eventId);
      if (scene.atlasCampaignId) {
        assert.ok(campaignIds.has(scene.atlasCampaignId), scene.atlasCampaignId);
      }
    }
  });

  it("returns null for unknown ids rather than borrowing another scene", () => {
    assert.equal(getSeerahScene("not-a-chapter"), null);
    assert.equal(getGhazawatScene("not-an-event"), null);
  });
});

describe("the scene copy carries no encoding damage or mixed-language debris", () => {
  const files = [
    "client/src/visual-golden/services/seerah-scene.ts",
    "client/src/visual-golden/services/seerah-ghazawat.ts",
    "client/src/visual-golden/components/seerah/ChapterGateway.tsx",
  ];
  const forbidden = [
    "\uFFFD",
    "묘ق",
    "दूर",
    "환경",
    "所以",
    "lugar",
    "klar",
    "allgemeinen",
    "атмосфера",
    "scène",
    "tileCount",
  ];

  it("contains none of the known damaged tokens", () => {
    for (const file of files) {
      const source = readFileSync(join(repoRoot, file), "utf8");
      for (const token of forbidden) {
        assert.equal(source.includes(token), false, `${file} contains ${token}`);
      }
    }
  });
});
