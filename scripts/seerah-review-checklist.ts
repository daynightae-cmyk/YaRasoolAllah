/**
 * Generates the auditable Seerah review checklist.
 *
 * The output is a technical preflight artifact only. It never signs, approves,
 * or publishes a record; every `reviewStatus` stays `pending_review` and every
 * human review field stays empty until a named reviewer fills it.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSeerahReviewChecklist,
  renderSeerahReviewSummary,
} from "../client/src/visual-golden/services/seerah-review";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = join(repoRoot, "artifacts", "seerah");

const checklist = buildSeerahReviewChecklist();
const summary = renderSeerahReviewSummary(checklist);

mkdirSync(outputDir, { recursive: true });

const jsonPath = join(outputDir, "review-checklist.json");
const markdownPath = join(outputDir, "review-checklist-summary.md");

writeFileSync(jsonPath, `${JSON.stringify(checklist, null, 2)}\n`, "utf8");
writeFileSync(markdownPath, summary, "utf8");

const { records, humanReview, technical, recordsWithOpenTechnicalItems } = checklist.summary;

console.log(`Seerah review checklist ${checklist.version}`);
console.log(
  `Records: ${records.total} (events ${records.events}, people ${records.people}, places ${records.places}, sources ${records.sources})`,
);
console.log(`Human review signed: ${humanReview.signed} / required ${humanReview.required}`);
console.log(
  `Technical checks: verified ${technical.verified}, open ${technical.open}, not applicable ${technical.notApplicable}`,
);
console.log(`Records with open non-human technical items: ${recordsWithOpenTechnicalItems}`);
console.log(`Written: ${jsonPath}`);
console.log(`Written: ${markdownPath}`);
