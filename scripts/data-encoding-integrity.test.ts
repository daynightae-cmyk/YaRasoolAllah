import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPLACEMENT_CHARACTER = "\uFFFD";

const SCANNED_ROOTS = [
  "client/src",
  "shared",
  "server",
  "api",
  "scripts",
  "docs/audit",
];
const SCANNED_EXTENSIONS = /\.(ts|tsx|js|mjs|cjs|css|json|md)$/;
const IGNORED_DIRECTORIES = new Set(["node_modules", "dist", "build", "artifacts", ".git"]);

/**
 * Damage that is knowingly left in place because restoring it would require
 * guessing the original characters. Each entry must state why, and must be
 * removed from this list as soon as the text is confirmed by a human.
 */
const REVIEWED_ALLOWANCES: Array<{ file: string; line: number; reason: string }> = [
  {
    file: "client/src/components/BabAlsamaa/BabAlsamaa.tsx",
    line: 75,
    reason:
      "Hadith text \"ما أصاب المسلم من نصب ولا و<FFFD><FFFD>ب\": the lost character is either a letter (ويب) or a kasra diacritic (وِب) and the rest of the string carries no diacritics, so the original characters cannot be derived. Hadith wording must not be reconstructed by guessing; needs scholarly confirmation.",
  },
];

interface Damage {
  file: string;
  line: number;
  text: string;
  codePoints: string;
}

function collectDamage(): Damage[] {
  const damage: Damage[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory)) {
      const full = join(directory, entry);
      if (statSync(full).isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry)) continue;
        walk(full);
        continue;
      }
      if (!SCANNED_EXTENSIONS.test(entry)) continue;
      readFileSync(full, "utf8")
        .split("\n")
        .forEach((line, index) => {
          if (!line.includes(REPLACEMENT_CHARACTER)) return;
          damage.push({
            file: relative(repoRoot, full).replace(/\\/g, "/"),
            line: index + 1,
            text: line.trim(),
            codePoints: [...line]
              .map((character) => character.codePointAt(0)!.toString(16))
              .join(" "),
          });
        });
    }
  };
  for (const root of SCANNED_ROOTS) walk(join(repoRoot, root));
  return damage;
}

function formatDamage(damage: Damage[]): string {
  return damage
    .map((item) => `  ${item.file}:${item.line}\n    text: ${item.text}\n    code points: ${item.codePoints}`)
    .join("\n");
}

describe("data encoding integrity", () => {
  it("scans the shipped source trees", () => {
    assert.ok(SCANNED_ROOTS.length >= 5);
    assert.ok(IGNORED_DIRECTORIES.has("artifacts"), "generated evidence must not be scanned");
  });

  it("carries no U+FFFD replacement characters from broken UTF-8", () => {
    const damage = collectDamage();
    const allowanceKeys = new Set(REVIEWED_ALLOWANCES.map((item) => `${item.file}:${item.line}`));
    const unreviewed = damage.filter(
      (item) => !allowanceKeys.has(`${item.file}:${item.line}`),
    );
    assert.equal(
      unreviewed.length,
      0,
      `unreviewed replacement characters found (restore the original bytes, do not delete the text):\n${formatDamage(unreviewed)}`,
    );
    const unused = [...allowanceKeys].filter(
      (key) => !damage.some((item) => `${item.file}:${item.line}` === key),
    );
    assert.equal(
      unused.length,
      0,
      `allowance no longer needed, remove it: ${unused.join(", ")}`,
    );
    for (const allowance of REVIEWED_ALLOWANCES) {
      assert.ok(
        allowance.reason.length > 40,
        `allowance ${allowance.file}:${allowance.line} must state why it cannot be repaired`,
      );
    }
  });

  it("keeps the repaired strings intact in their consumers", () => {
    const fatwas = JSON.parse(
      readFileSync(join(repoRoot, "client/src/data/fatwas.json"), "utf8"),
    ) as { fatwas?: Array<{ hadiths?: Array<{ text: string; reference: string }> }> };
    const salahAlSafar = fatwas.fatwas
      ?.flatMap((fatwa) => fatwa.hadiths ?? [])
      .find((hadith) => hadith.text.includes("توجهت به"));
    assert.ok(salahAlSafar, "salah al-safar hadith not found");
    assert.match(salahAlSafar.text, /كان رسول الله ﷺ يصلي على راحلته حيث توجهت به/);

    const arabic = JSON.parse(
      readFileSync(join(repoRoot, "client/src/data/locales/ar.json"), "utf8"),
    ) as { ai?: { references?: string } };
    assert.equal(arabic.ai?.references, "المراجع");

    const mainStructure = readFileSync(join(repoRoot, "client/src/data/mainStructure.ts"), "utf8");
    assert.match(mainStructure, /description: "أحكام الصيام والاعتكاف"/);

    const quranService = readFileSync(join(repoRoot, "client/src/services/quranService.ts"), "utf8");
    assert.match(quranService, /arabicName: "الانشقاق"/);
    assert.match(quranService, /surahName: "الرحمن"/);

    const babAlsamaa = readFileSync(
      join(repoRoot, "client/src/components/BabAlsamaa/BabAlsamaa.tsx"),
      "utf8",
    );
    assert.match(babAlsamaa, /عليه السلام/);

    const quranAudioPage = readFileSync(
      join(repoRoot, "client/src/pages/QuranAudioPage.tsx"),
      "utf8",
    );
    assert.match(quranAudioPage, /name: "البقرة"/);

    const seerahData = readFileSync(join(repoRoot, "client/src/data/seerahData.ts"), "utf8");
    assert.match(seerahData, /location: "المدينة المنورة"/);
  });
});
