import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

const root = import.meta.dir;
const excluded = new Set(["AGENTS.md", "llm-facing-application-documentation.md"]);
const failures: string[] = [];
const types = new Set([
  "application", "capability", "workflow", "domain", "requirement",
  "architecture", "interface", "operations", "adr", "change",
]);
const requiredHeadings = {
  capabilities: [
    "Purpose", "Actors", "Functional Behavior", "Business Rules",
    "Capability-Specific Nonfunctional Requirements", "Related Workflows",
    "Related Domain Objects", "Related Interfaces", "Related Architecture", "Known Constraints",
  ],
  workflows: [
    "Purpose", "Actors", "Trigger", "Preconditions", "Inputs", "Normal Flow",
    "Alternate Flows", "Failure Behavior", "Completion / Postconditions",
    "Nonfunctional Requirements", "Related Documentation",
  ],
};

async function markdownFiles(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || excluded.has(entry.name)) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await markdownFiles(filename));
    else if (entry.name.endsWith(".md")) result.push(filename);
  }
  return result.sort();
}

function headingAnchors(text: string): Set<string> {
  const seen = new Map<string, number>();
  return new Set([...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => {
    const base = match[1]!.trim().toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/ /g, "-");
    const occurrence = seen.get(base) ?? 0;
    seen.set(base, occurrence + 1);
    return occurrence ? `${base}-${occurrence}` : base;
  }));
}

const files = await markdownFiles(root);
const fileSet = new Set(files);
const graph = new Map<string, Set<string>>();
let links = 0;
let relatedLinks = 0;
for (const filename of files) {
  const text = await readFile(filename, "utf8");
  const label = path.relative(root, filename);
  // The user requested preservation of these imported ADRs' original text and format.
  const preservedAdr = /^decisions\/(?:000[1-9]|001[0-7])-[^/]+\.md$/.test(label);
  if (preservedAdr) {
    if (!/^\*\*Status:\*\* (Accepted|Superseded|Deprecated)\s*$/m.test(text)) {
      failures.push(`${label}: missing recorded ADR status`);
    }
    for (const heading of ["Context", "Decision", "Consequences"]) {
      if (!text.split("\n").includes(`## ${heading}`)) failures.push(`${label}: missing ADR ${heading}`);
    }
  }
  const frontMatter = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  const body = frontMatter ? text.slice(frontMatter[0].length) : text;
  let related: string[] = [];

  for (const [directory, headings] of Object.entries(requiredHeadings)) {
    if (!label.startsWith(`${directory}${path.sep}`)) continue;
    for (const heading of headings) {
      if (!body.split("\n").includes(`## ${heading}`)) {
        failures.push(`${label}: missing heading ${heading}`);
      }
    }
  }

  if (label !== "MAP.md" && !preservedAdr) {
    if (!frontMatter) failures.push(`${label}: missing front matter`);
    else {
      try {
        const metadata = Bun.YAML.parse(frontMatter[1]!) as Record<string, unknown>;
        if (!metadata || typeof metadata !== "object") throw new Error("expected a YAML mapping");
        if (!types.has(String(metadata.type))) failures.push(`${label}: unsupported type ${String(metadata.type)}`);
        for (const key of ["type", "scope", "summary"]) {
          if (typeof metadata[key] !== "string" || !(metadata[key] as string).trim()) {
            failures.push(`${label}: invalid ${key}`);
          }
        }
        if ("related" in metadata) failures.push(`${label}: move related metadata into a rendered Related documents section`);
        for (const key of ["load_when"]) {
          const value = metadata[key];
          if (!Array.isArray(value) || !value.every(item => typeof item === "string" && item.trim())) {
            failures.push(`${label}: invalid ${key}`);
          }
        }
      } catch (error) {
        failures.push(`${label}: YAML ${String(error)}`);
      }
    }
  }

  if (label !== "MAP.md" && !preservedAdr) {
    const sections = body.split(/^## Related documents\s*$/m);
    if (sections.length !== 2) failures.push(`${label}: expected one Related documents section`);
    else {
      const entries = sections[1]!.split(/^## /m)[0]!.split("\n")
        .map(line => line.trim()).filter(Boolean);
      if (!entries.length) failures.push(`${label}: Related documents section is empty`);
      for (const entry of entries) {
        const link = entry.match(/^- \[[^\]]+\]\(([^)]+)\)$/);
        if (!link) failures.push(`${label}: related entry must be a Markdown document link: ${entry}`);
        else related.push(link[1]!);
      }
    }
  }

  const linkedFiles = new Set<string>();
  for (const match of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1]!.replace(/^<|>$/g, "");
    if (/^[a-z][a-z\d+.-]*:/i.test(target)) continue;
    links++;
    const [filePart, fragment] = target.split("#", 2);
    const resolved = filePart
      ? path.resolve(path.dirname(filename), decodeURIComponent(filePart))
      : filename;
    linkedFiles.add(resolved);
    if (!await Bun.file(resolved).exists()) failures.push(`${label}: broken link ${target}`);
    else if (fragment && resolved.endsWith(".md")) {
      const anchors = headingAnchors(await readFile(resolved, "utf8"));
      if (!anchors.has(decodeURIComponent(fragment))) failures.push(`${label}: missing anchor ${target}`);
    }
  }

  for (const target of related) {
    const resolved = path.resolve(path.dirname(filename), target.split("#", 2)[0]!);
    relatedLinks++;
    if (!fileSet.has(resolved)) failures.push(`${label}: related target must be a current documentation file: ${target}`);
    else if (!linkedFiles.has(resolved)) {
      failures.push(`${label}: related document needs a clickable body link: ${target}`);
    }
  }
  graph.set(filename, new Set([...linkedFiles].filter(target => fileSet.has(target))));
}

const map = path.join(root, "MAP.md");
const reached = new Set<string>();
const pending = [map];
if (!fileSet.has(map)) failures.push("MAP.md: missing documentation entry point");
while (pending.length) {
  const current = pending.pop()!;
  if (reached.has(current)) continue;
  reached.add(current);
  pending.push(...(graph.get(current) ?? []));
}
for (const filename of files) {
  if (!reached.has(filename)) failures.push(`${path.relative(root, filename)}: not reachable through body links from MAP.md`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${files.length} Markdown documents, metadata, required sections, and ${links} local links/anchors.`);
  console.log(`All ${relatedLinks} Related documents entries are clickable links; all ${files.length} documents are reachable from MAP.md.`);
}
