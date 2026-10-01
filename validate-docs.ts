import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { checkRepositoryReference, extractRepositoryReferences } from "./repository-ref";

const root = import.meta.dir;
const excluded = new Set([".git", "AGENTS.md", "llm-facing-application-documentation.md"]);
const failures: string[] = [];
const types = new Set(["application", "capability", "workflow", "domain", "requirement", "architecture", "interface", "operations", "adr", "change"]);
async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || excluded.has(entry.name)) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await markdownFiles(filename));
    else if (entry.name.endsWith(".md")) result.push(filename);
  }
  return result;
}
function headingAnchors(text: string) {
  const seen = new Map<string, number>();
  return new Set([...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => {
    const base = match[1]!.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/ /g, "-");
    const occurrence = seen.get(base) ?? 0;
    seen.set(base, occurrence + 1);
    return occurrence ? `${base}-${occurrence}` : base;
  }));
}
const files = await markdownFiles(root);
let links = 0;
for (const filename of files) {
  const text = await readFile(filename, "utf8");
  const label = path.relative(root, filename);
  const importedDecision = /^decisions[/\\]00\d{2}-.*\.md$/.test(label);
  if (label.startsWith(`capabilities${path.sep}`)) {
    for (const heading of ["Purpose", "Actors", "Functional Behavior", "Business Rules", "Capability-Specific Nonfunctional Requirements", "Related Workflows", "Related Domain Objects", "Related Interfaces", "Related Architecture", "Known Constraints"]) {
      if (!text.split("\n").includes(`## ${heading}`)) failures.push(`${label}: missing capability heading ${heading}`);
    }
  }
  if (label.startsWith(`workflows${path.sep}`)) {
    for (const heading of ["Purpose", "Actors", "Trigger", "Preconditions", "Inputs", "Normal Flow", "Alternate Flows", "Failure Behavior", "Completion / Postconditions", "Nonfunctional Requirements", "Related Documentation"]) {
      if (!text.split("\n").includes(`## ${heading}`)) failures.push(`${label}: missing workflow heading ${heading}`);
    }
  }
  if (label !== "MAP.md" && !importedDecision) {
    const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
    if (!match) failures.push(`${label}: missing front matter`);
    else {
      try {
        const metadata = Bun.YAML.parse(match[1]!) as Record<string, unknown>;
        if (!types.has(String(metadata.type))) failures.push(`${label}: unsupported type ${String(metadata.type)}`);
        for (const key of ["type", "scope", "summary"]) {
          if (typeof metadata[key] !== "string" || !(metadata[key] as string).trim()) failures.push(`${label}: invalid ${key}`);
        }
        for (const key of ["load_when", "related"]) {
          if (!Array.isArray(metadata[key]) || !(metadata[key] as unknown[]).every(item => typeof item === "string")) failures.push(`${label}: invalid ${key}`);
        }
        for (const target of (Array.isArray(metadata.related) ? metadata.related : []) as string[]) {
          if (!await Bun.file(path.resolve(root, target)).exists()) failures.push(`${label}: missing related ${target}`);
        }
      } catch (error) { failures.push(`${label}: YAML ${String(error)}`); }
    }
  }
  for (const target of extractRepositoryReferences(text)) {
    links++;
    try {
      await checkRepositoryReference(target);
    } catch (error) {
      failures.push(`${label}: broken repository reference ${target}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    let target = match[1]!.replace(/^<|>$/g, "");
    if (/^[a-z][a-z\d+.-]*:/i.test(target)) continue;
    links++;
    const [filePart, fragment] = target.split("#", 2);
    const resolved = filePart ? path.resolve(path.dirname(filename), decodeURIComponent(filePart)) : filename;
    if (!await Bun.file(resolved).exists()) failures.push(`${label}: broken link ${target}`);
    else if (fragment && resolved.endsWith(".md")) {
      const anchors = headingAnchors(await readFile(resolved, "utf8"));
      if (!anchors.has(decodeURIComponent(fragment))) failures.push(`${label}: missing anchor ${target}`);
    }
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log(`Validated ${files.length} Markdown documents, required YAML metadata, related paths, and ${links} local links/anchors.`);
