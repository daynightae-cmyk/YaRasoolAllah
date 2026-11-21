/**
 * Library reading chamber study tools — directive §4.C.
 *
 * The quiet reading desk must offer bookmarks, notes, resume and citations
 * backed by real persisted state and established record fields only.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

describe("library reading chamber study tools", () => {
  const chamber = read("client/src/visual-golden/components/library/CatalogReadingChamber.tsx");
  const css = read("client/src/visual-golden/components/library/CatalogReadingChamber.module.css");

  it("bookmarks persist through the institution favorites store", () => {
    assert.match(chamber, /useInstitution\(\(state\) => state\.favorites\)/);
    assert.match(chamber, /toggleFavorite\(\{ id: favoriteId, title, path: workPath \}\)/);
    assert.match(chamber, /data-visual="library-reader-favorite"/);
    assert.match(chamber, /aria-pressed=\{isFavorite\}/);
    // The favorite deep-links back to the real catalog record route.
    assert.match(chamber, /\/library\/work\/\$\{encodeURIComponent\(work\.id\)\}/);
  });

  it("notes persist locally with the book, position and citation attached", () => {
    assert.match(chamber, /useInstitution\(\(state\) => state\.addNote\)/);
    assert.match(chamber, /data-visual="library-reader-note"/);
    assert.match(chamber, /data-visual="library-reader-note-panel"/);
    assert.match(chamber, /addNote\(`\$\{title\} · \$\{position\}`, `\$\{body\}\\n\\n\$\{citationText\}`\)/);
    // Empty notes are never saved.
    assert.match(chamber, /if \(!body\) return;/);
    assert.match(chamber, /disabled=\{!noteDraft\.trim\(\)\}/);
  });

  it("citations use only established fields — no invented editor or print pages", () => {
    assert.match(chamber, /data-visual="library-reader-cite"/);
    assert.match(chamber, /navigator\.clipboard\.writeText\(citationText\)/);
    // Version identity comes from the governed reader document or registry.
    assert.match(chamber, /reader\.document\.version\.versionId/);
    assert.match(chamber, /releaseCommit\.slice\(0, 12\)/);
    // Position is honestly labeled digital segments, not print pages.
    assert.match(chamber, /ترقيم مقاطع، ليس صفحات طبعة/);
    assert.match(chamber, /segment numbering, not print pages/);
    // No fabricated bibliographic fields.
    assert.doesNotMatch(chamber, /editionStatement.*editor|ناشر مختلق/);
    // Clipboard failure degrades to the visible citation panel, never a throw.
    assert.match(chamber, /catch \{[\s\S]*?setNoteOpen\(true\)/);
  });

  it("resume stays governed: hydrate before write, clamp stored pages", () => {
    assert.match(chamber, /readStoredPage\(work\.id, totalPages\)/);
    assert.match(chamber, /hydratedWorkId !== work\.id\) return;/);
    assert.match(chamber, /Math\.min\(Math\.floor\(value\), Math\.max\(1, totalPages\)\)/);
  });

  it("study tools reset when a different work opens", () => {
    assert.match(chamber, /setNoteDraft\(""\);\s*setNoteOpen\(false\);\s*setCitationCopied\(false\);\s*\}, \[work\.id\]\)/);
    assert.match(css, /\.notePanel/);
    assert.match(css, /\.citationPreview/);
    assert.match(css, /\.headerActions/);
  });
});