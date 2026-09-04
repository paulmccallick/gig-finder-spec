import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const files = (directory: string): string[] => readdirSync(directory).flatMap(name => {
  if (name === ".git") return [];
  const path = join(directory, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});
const corpusFiles = files(root).filter(path => !path.endsWith("validation/corpus-validation.json"));
const markdown = corpusFiles.filter(path => extname(path) === ".md");
const failures: string[] = [];
const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
const requiredHeadings: Record<string, string[]> = {
  capabilities: ["Purpose and boundary", "Vocabulary", "Workflows", "Shared foundations"],
  foundations: ["Scope", "Canonical rule", "Required behavior", "Prohibited behavior", "Failure and retry implications", "Observable consequences", "Used by"],
  workflows: ["Intent", "Access points", "Preconditions", "Workflow", "Decisions and variants", "State changes", "Outputs and observable effects", "Safety rules", "Failure, retry, and recovery", "Known current behavior and limitations", "Related workflows"],
  variants: ["Exposure", "Inputs and validation", "Interaction sequence", "Outputs or presentation", "Confirmation and authorization", "Surface-specific failures", "Refresh and consistency", "Known limitations", "Shared workflow"],
};
const requiredFrontmatter: Record<string, string[]> = {
  capabilities: ["id", "title", "aliases"],
  foundations: ["id", "title", "summary", "aliases"],
  workflows: ["id", "capability", "title", "summary", "aliases", "requires", "related", "implementation_areas", "test_suites"],
  variants: ["id", "capability", "workflow", "surface", "summary", "aliases", "requires"],
};
for (const path of markdown) {
  const source = readFileSync(path, "utf8");
  if (source.includes("{{")) failures.push(`${relative(root, path)} contains an unresolved template placeholder`);
  const kind = relative(root, path).split("/")[0]!;
  for (const heading of requiredHeadings[kind] ?? []) if (!source.includes(`## ${heading}\n`)) failures.push(`${relative(root, path)} missing template heading: ${heading}`);
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1];
  for (const key of requiredFrontmatter[kind] ?? []) if (!frontmatter || !new RegExp(`^${key}:`, "m").test(frontmatter)) failures.push(`${relative(root, path)} missing frontmatter key: ${key}`);
  for (const match of source.matchAll(linkPattern)) {
    const target = match[1]!;
    if (/^[a-z]+:/i.test(target) || target.startsWith("#")) continue;
    const fileTarget = target.split("#")[0]!;
    if (!existsSync(resolve(dirname(path), fileTarget))) failures.push(`${relative(root, path)} -> ${target}`);
  }
}
for (const path of corpusFiles.filter(path => extname(path) === ".json")) {
  try {
    const value = JSON.parse(readFileSync(path, "utf8"));
    const references: string[] = [];
    const collectReferences = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      if ("$ref" in node && typeof node.$ref === "string") references.push(node.$ref);
      for (const nested of Array.isArray(node) ? node : Object.values(node)) collectReferences(nested);
    };
    collectReferences(value);
    for (const reference of references.filter(reference => reference.startsWith("#/"))) {
      const target = reference.slice(2).split("/").map(part => part.replaceAll("~1", "/").replaceAll("~0", "~"))
        .reduce<unknown>((node, part) => node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined, value);
      if (target === undefined) failures.push(`${relative(root, path)} has unresolved JSON pointer ${reference}`);
    }
    if (relative(root, path).startsWith("contracts/operations/")) {
      if (value.type !== "object" || value.additionalProperties !== false || !value.properties?.input || !value.properties?.result) failures.push(`${relative(root, path)} is not a strict operation envelope`);
      if (value.properties?.input?.additionalProperties !== false) failures.push(`${relative(root, path)} input is not strict`);
    }
  }
  catch (error) { failures.push(`${relative(root, path)} invalid JSON: ${error}`); }
}

const tokenEstimate = (path: string) => Math.ceil(readFileSync(path, "utf8").length / 4);
const workflowPaths = markdown.filter(path => relative(root, path).startsWith("workflows/"));
for (const path of workflowPaths) if (tokenEstimate(path) > 5000) failures.push(`${relative(root, path)} exceeds 5,000 estimated tokens`);
if (tokenEstimate(join(root, "README.md")) > 1000) failures.push("README.md exceeds 1,000 estimated tokens");
for (const path of markdown.filter(path => relative(root, path).startsWith("capabilities/"))) {
  if (tokenEstimate(path) > 1500) failures.push(`${relative(root, path)} exceeds 1,500 estimated tokens`);
}

const operationContracts = corpusFiles.filter(path => relative(root, path).startsWith("contracts/operations/") && extname(path) === ".json").length;
if (operationContracts !== 27) failures.push(`expected 27 operation contracts, found ${operationContracts}`);
const report = { files: corpusFiles.length, markdown: markdown.length, links: markdown.reduce((n, path) => n + [...readFileSync(path, "utf8").matchAll(linkPattern)].length, 0), operationContracts, workflowTokenRange: [Math.min(...workflowPaths.map(tokenEstimate)), Math.max(...workflowPaths.map(tokenEstimate))], failures };
await Bun.write(resolve(root, "validation/corpus-validation.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
