/**
 * Atlas observer terrain contract — the Living Atlas gains genuine 3D
 * observation without replacing its schematic plate theatre.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { atlasCampaignTerrain } from "../client/src/visual-golden/services/atlas-terrain";
import { LIVING_CAMPAIGNS } from "../client/src/visual-golden/data/living-atlas";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("atlas observer terrains", () => {
  it("derives stations from the campaign's own markers — never new facts", () => {
    for (const campaign of LIVING_CAMPAIGNS) {
      const scene = atlasCampaignTerrain(campaign);
      assert.ok(scene, `campaign ${campaign.id} needs an observer terrain`);
      assert.equal(scene.nodes.length, campaign.markers.length);
      for (const node of scene.nodes) {
        const marker = campaign.markers.find((item) => item.id === node.id);
        assert.ok(marker, `${campaign.id}/${node.id} must be a real marker`);
        assert.equal(node.labelAr, marker.labelAr);
        assert.equal(node.noteAr, marker.descriptionAr, "notes reuse sourced marker text");
        assert.equal(node.position.length, 3);
        assert.ok(node.position[1] >= 1 && node.position[1] <= 4, "human-scale eye height");
        // Positions stay inside the bounded world.
        assert.ok(Math.abs(node.position[0]) <= 30 && Math.abs(node.position[2]) <= 30);
      }
      assert.match(scene.disclosureAr, /تخطيطي|ليست إحداثيات/);
      assert.match(scene.disclosureAr, /ولا قتال|ولا تجسيد/);
      for (const key of ["sky", "fog", "ground", "rock", "sun"] as const) {
        assert.match(scene[key], /^#[0-9a-fA-F]{6}$/, `${campaign.id}.${key}`);
      }
    }
  });

  it("keeps the plate theatre as default and mounts the observer lazily", () => {
    const page = read("client/src/visual-golden/pages/AtlasPage.tsx");
    assert.match(page, /lazy\(\(\) =>\s*import\("@\/visual-golden\/components\/seerah\/TerrainTheatre3D"\)/);
    assert.match(page, /atlasCampaignTerrain\(campaign\)/);
    assert.match(page, /data-visual="atlas-observer-enter"/);
    assert.match(page, /onUnavailable/);
    // The schematic plate path stays intact (default + WebGL fallback).
    assert.match(page, /<LivingTerrainTheatre/);
    assert.match(page, /plate=\{campaign\.plate\}/);
    // Campaign switch resets the observer session.
    assert.match(page, /setObserver3D\(false\);\s*setObserverFailed\(false\);\s*\}, \[campaignId\]\)/);
    const css = read("client/src/visual-golden/pages/LivingAtlasPage.module.css");
    assert.match(css, /seerah-terrain-theatre/);
  });
});
