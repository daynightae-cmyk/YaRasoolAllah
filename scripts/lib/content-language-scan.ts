import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Derives, from the code itself, which non-Arabic content each route serves.
 *
 * This exists because the content-language table is prose, and prose is not
 * checked against the components it describes. Five routes were declared
 * Arabic-only while rendering English, and the previous guard could not see it
 * because it only knew about three hardcoded paths.
 *
 * The scan is deliberately conservative and lexical — it is a guard, not a
 * compiler. Two rules keep it honest:
 *
 *  - A field counts only when it holds a **populated** value somewhere the
 *    route can reach, so a type declaration with no data is not evidence.
 *  - A field counts only when the **component itself references it**, so
 *    unreferenced data is not evidence either.
 *
 * Known blind spot, recorded rather than hidden: a component that reaches
 * non-Arabic content through an indirection is not detected. `/library` reads
 * `work.titleEn` inside `displayTitle()` rather than in the page, so the scan
 * reports nothing there and the declaration carries the evidence instead. The
 * gate checks declared anchors by file and line, which covers that case.
 */

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const clientSrc = join(repoRoot, "client/src");
const sharedDir = join(repoRoot, "shared");

const toRepoPath = (absolute: string) => relative(repoRoot, absolute).replace(/\\/g, "/");
const read = (repoPath: string) => readFileSync(join(repoRoot, repoPath), "utf8");

function resolveModule(base: string): string | null {
  for (const candidate of [
    `${base}.tsx`,
    `${base}.ts`,
    join(base, "index.tsx"),
    join(base, "index.ts"),
  ]) {
    if (existsSync(candidate)) return toRepoPath(candidate);
  }
  return null;
}

function resolveSpecifier(specifier: string, fromDir: string): string | null {
  if (specifier.startsWith("@shared/")) {
    return resolveModule(join(sharedDir, specifier.slice("@shared/".length)));
  }
  if (specifier.startsWith("@/")) {
    return resolveModule(join(clientSrc, specifier.slice(2)));
  }
  if (specifier.startsWith(".")) {
    return resolveModule(resolvePath(join(repoRoot, fromDir), specifier));
  }
  return null;
}

/** Route path to the component App.tsx renders, derived from the router itself. */
export function routeComponentMap(appSource: string): Map<string, string | "REDIRECT"> {
  const lazyImports = new Map<string, string>();
  for (const match of appSource.matchAll(
    /const (\w+)\s*=\s*lazy\(\s*\(\)\s*=>\s*import\("([^"]+)"\)/g,
  )) {
    const specifier = match[2].replace(/^\.\//, "");
    const absolute = specifier.startsWith("@/")
      ? join(clientSrc, specifier.slice(2))
      : join(clientSrc, specifier);
    lazyImports.set(match[1], resolveModule(absolute) ?? toRepoPath(absolute));
  }

  const routed = new Map<string, string | "REDIRECT">();
  let current: string | null = null;
  for (const line of appSource.split(/\r?\n/)) {
    const route = line.match(/<Route path="([^"]+)"/);
    if (route) current = route[1];
    if (current) {
      for (const match of line.matchAll(/<([A-Z]\w*)\b/g)) {
        const file = lazyImports.get(match[1]);
        if (file) routed.set(current, file);
      }
      if (/Redirect to=/.test(line)) routed.set(current, "REDIRECT");
    }
    if (/<\/Route>/.test(line)) current = null;
  }
  return routed;
}

const IDENTIFIER_NOISE =
  /^(then|when|for|if|is|has|do|can|men|run|own|var|new|use|not|let|get|set|add|src|url|dir|key|id|by|on|to|in|at|as|of|or|lang|font|rtl|ltr)$/i;

export type ScannedLanguage = "en" | "fr" | "ur";

/**
 * Maps a field name to the language it carries, or null when the name is not
 * evidence of translated knowledge content.
 *
 * Bare `en` / `fr` / `ur` keys are deliberately excluded: they are bilingual
 * interface label records (prayer names, scope names, gateway blurbs) rather
 * than knowledge, and counting them made every route look multilingual.
 */
export function languageOfField(field: string): ScannedLanguage | null {
  if (IDENTIFIER_NOISE.test(field)) return null;
  if (/(?:^|[a-z0-9])(En|Fr|Ur)$/.test(field) && field.length > 2) {
    return field.slice(-2).toLowerCase() as ScannedLanguage;
  }
  if (field === "translation" || field === "translations") return "en";
  return null;
}

const POPULATED_FIELD =
  /(?<![A-Za-z0-9_$])([a-z][A-Za-z0-9]*)\s*:\s*(["'`])(?:(?!\2)[\s\S]){4,}?\2/g;
const IMPORT_SPECIFIER = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;

function localModuleClosure(entry: string, depth: number): string[] {
  const seen = new Set([entry]);
  let frontier = [entry];
  for (let level = 0; level < depth; level += 1) {
    const next: string[] = [];
    for (const file of frontier) {
      let source: string;
      try {
        source = read(file);
      } catch {
        continue;
      }
      const fromDir = dirname(file).replace(/\\/g, "/");
      for (const match of source.matchAll(IMPORT_SPECIFIER)) {
        const resolved = resolveSpecifier(match[1], fromDir);
        if (resolved && !seen.has(resolved)) {
          seen.add(resolved);
          next.push(resolved);
        }
      }
    }
    frontier = next;
    if (next.length === 0) break;
  }
  return [...seen];
}

export interface ScannedContent {
  field: string;
  language: ScannedLanguage;
  at: string;
}

/** Non-Arabic knowledge content a route's component actually shows. */
export function scanRouteContent(componentRepoPath: string | "REDIRECT"): ScannedContent[] {
  if (componentRepoPath === "REDIRECT") return [];
  const component = resolveModule(join(repoRoot, componentRepoPath));
  if (!component) return [];

  const componentSource = read(component);
  const findings: ScannedContent[] = [];

  for (const file of localModuleClosure(component, 2)) {
    if (file.endsWith(".json")) continue;
    let source: string;
    try {
      source = read(file);
    } catch {
      continue;
    }
    for (const match of source.matchAll(POPULATED_FIELD)) {
      const language = languageOfField(match[1]);
      if (!language) continue;
      const line = source.slice(0, match.index).split(/\r?\n/).length;
      findings.push({ field: match[1], language, at: `${file}:${line}` });
    }
  }

  const referencedInComponent = (field: string) =>
    new RegExp(`(?<![A-Za-z0-9_$])${field}(?![A-Za-z0-9_$])`).test(componentSource);

  const seen = new Set<string>();
  return findings.filter((finding) => {
    if (finding.at.startsWith(`${component}:`)) return true;
    if (!referencedInComponent(finding.field)) return false;
    const key = `${finding.field}@${finding.at}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
