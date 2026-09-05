import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const walk = (directory: string): string[] => readdirSync(directory).flatMap(name => {
  if (name === ".git") return [];
  const path = join(directory, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const rel = (path: string) => relative(root, path);
const allFiles = walk(root).filter(path => !rel(path).startsWith("validation/"));
const markdown = allFiles.filter(path => extname(path) === ".md");
const corpusMarkdown = markdown.filter(path => !rel(path).startsWith("templates/"));
const failures: string[] = [];
const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

const requiredTemplates = [
  "capability.template.md", "feature.template.md", "workflow.template.md",
  "operational-model.template.md", "quality-scenarios.template.md",
  "access-point-variant.template.md", "foundation.template.md",
  "agent-tool-operation.schema.template.json",
];
for (const name of requiredTemplates) if (!existsSync(join(root, "templates", name))) failures.push(`missing template: templates/${name}`);
if (!existsSync(join(root, "AUTHORING.md"))) failures.push("missing AUTHORING.md");

const requiredHeadings: Record<string, string[]> = {
  capabilities: ["Purpose and boundary", "Vocabulary", "Features", "Shared foundations"],
  features: ["Purpose and boundary", "Access points", "Configuration and defaults", "Durable state and lifecycle", "Validation and invariants", "Outputs and downstream effects", "Failure, retry, and recovery", "Current limitations", "Detailed specifications"],
  foundations: ["Scope", "Canonical rule", "Required behavior", "Prohibited behavior", "Failure and retry implications", "Observable consequences", "Used by"],
  workflows: ["Intent", "Access points", "Preconditions", "Workflow", "Decisions and variants", "State changes", "Outputs and observable effects", "Safety rules", "Failure, retry, and recovery", "Current limitations", "Related specifications"],
  variants: ["Exposure", "Inputs and validation", "Interaction sequence", "Outputs or presentation", "Confirmation and authorization", "Surface-specific failures", "Refresh and consistency", "Current limitations", "Shared specification"],
  "quality-scenarios": ["Scenario"],
};
const requiredFrontmatter: Record<string, string[]> = {
  capabilities: ["id", "title", "aliases"],
  features: ["id", "capability", "title", "summary", "aliases", "requires", "workflows", "operational_models", "quality_scenarios", "variants", "contracts", "implementation_areas", "test_suites"],
  foundations: ["id", "title", "summary", "aliases"],
  workflows: ["id", "capability", "feature", "title", "summary", "aliases", "requires", "related", "implementation_areas", "test_suites"],
  variants: ["id", "capability", "feature", "workflow", "surface", "summary", "aliases", "requires"],
  "operational-models": ["id", "capability", "feature", "title", "summary", "elements", "requires", "implementation_areas", "test_suites"],
  "quality-scenarios": ["id", "capability", "feature", "title", "classification", "summary"],
};
const fmSource = (path: string) => readFileSync(path, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const scalar = (path: string, key: string) => fmSource(path).match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";
const list = (path: string, key: string) => {
  const value = scalar(path, key);
  if (!value.startsWith("[") || !value.endsWith("]")) return [];
  return value.slice(1, -1).split(",").map(item => item.trim()).filter(Boolean);
};
const kindOf = (path: string) => rel(path).split("/")[0]!;
const localTargets = (path: string) => [...readFileSync(path, "utf8").matchAll(linkPattern)]
  .map(match => match[1]!).filter(target => !/^[a-z]+:/i.test(target) && !target.startsWith("#"))
  .map(target => resolve(dirname(path), target.split("#")[0]!));

for (const path of corpusMarkdown) {
  const source = readFileSync(path, "utf8");
  const kind = kindOf(path);
  if (source.includes("{{")) failures.push(`${rel(path)} contains an unresolved template placeholder`);
  for (const heading of requiredHeadings[kind] ?? []) if (!source.includes(`## ${heading}\n`)) failures.push(`${rel(path)} missing template heading: ${heading}`);
  const frontmatter = fmSource(path);
  for (const key of requiredFrontmatter[kind] ?? []) if (!new RegExp(`^${key}:`, "m").test(frontmatter)) failures.push(`${rel(path)} missing frontmatter key: ${key}`);
  for (const target of localTargets(path)) if (!existsSync(target)) failures.push(`${rel(path)} has unresolved link ${rel(target)}`);
}

const capabilities = corpusMarkdown.filter(path => kindOf(path) === "capabilities");
const features = corpusMarkdown.filter(path => kindOf(path) === "features");
const ownedKinds = ["workflows", "variants", "operational-models", "quality-scenarios"];
const ownedArtifacts = corpusMarkdown.filter(path => ownedKinds.includes(kindOf(path)));
const capabilityById = new Map(capabilities.map(path => [scalar(path, "id"), path]));
const featureByKey = new Map(features.map(path => [`${scalar(path, "capability")}:${scalar(path, "id")}`, path]));
for (const [label, paths] of [["capability", capabilities], ["feature", features]] as const) {
  const seen = new Set<string>();
  for (const path of paths) {
    const key = label === "feature" ? `${scalar(path, "capability")}:${scalar(path, "id")}` : scalar(path, "id");
    if (seen.has(key)) failures.push(`duplicate ${label} identity ${key}`);
    seen.add(key);
  }
}
for (const path of capabilities) {
  if (readFileSync(path, "utf8").includes("## Workflows\n")) failures.push(`${rel(path)} routes directly to workflows`);
}
for (const path of features) {
  const capability = capabilityById.get(scalar(path, "capability"));
  if (!capability) failures.push(`${rel(path)} names unknown capability ${scalar(path, "capability")}`);
  else if (!localTargets(capability).includes(path)) failures.push(`${rel(capability)} does not route to feature ${rel(path)}`);
  for (const key of ["requires", "workflows", "operational_models", "quality_scenarios", "variants", "contracts"]) {
    for (const item of list(path, key)) if (!existsSync(resolve(dirname(path), item))) failures.push(`${rel(path)} ${key} has unresolved target ${item}`);
  }
}
const ownerListKey: Record<string, string> = {
  workflows: "workflows", variants: "variants", "operational-models": "operational_models", "quality-scenarios": "quality_scenarios",
};
for (const path of ownedArtifacts) {
  const key = `${scalar(path, "capability")}:${scalar(path, "feature")}`;
  const owner = featureByKey.get(key);
  if (!owner) { failures.push(`${rel(path)} names unknown owning feature ${key}`); continue; }
  const listed = list(owner, ownerListKey[kindOf(path)]!).map(item => resolve(dirname(owner), item));
  if (!listed.includes(path)) failures.push(`${rel(owner)} does not list owned ${kindOf(path)} artifact ${rel(path)}`);
  for (const item of list(path, "requires")) if (!existsSync(resolve(dirname(path), item))) failures.push(`${rel(path)} requires unresolved target ${item}`);
  if (kindOf(path) === "workflows") for (const item of list(path, "related")) if (!existsSync(resolve(dirname(path), item))) failures.push(`${rel(path)} relates to unresolved target ${item}`);
  if (kindOf(path) === "variants") {
    for (const key of ["workflow", "contract"]) {
      const item = scalar(path, key);
      if (item && !item.startsWith("{{") && !existsSync(resolve(dirname(path), item))) failures.push(`${rel(path)} has unresolved ${key} target ${item}`);
    }
  }
}

const operationalSections: Record<string, string> = {
  "work-levels": "Work levels and coordination", "configuration-binding": "Configuration binding", "status-models": "State models",
  "derived-completion": "Completion and aggregation", "retry-replay-reconciliation": "Retry, replay, and reconciliation",
  "concurrency-ordering": "Concurrency and ordering", "external-trust": "External-source trust",
  "durable-evidence": "Durable evidence and observability", bounds: "Bounds and limits",
};
for (const path of corpusMarkdown.filter(path => kindOf(path) === "operational-models")) {
  const elements = list(path, "elements");
  if (!elements.length) failures.push(`${rel(path)} has no applicable structural elements`);
  for (const element of elements) if (!operationalSections[element]) failures.push(`${rel(path)} declares unknown element ${element}`);
  const actual = [...readFileSync(path, "utf8").matchAll(/^## (.+)$/gm)].map(match => match[1]!);
  const expected = ["Purpose and boundary", "Governing invariants", ...elements.map(element => operationalSections[element]!)];
  for (const heading of expected) if (!actual.includes(heading)) failures.push(`${rel(path)} missing declared operational section ${heading}`);
  for (const heading of actual) if (!expected.includes(heading)) failures.push(`${rel(path)} has undeclared operational section ${heading}`);
  if (elements.includes("status-models")) {
    const stateStart = readFileSync(path, "utf8").indexOf("## State models\n");
    const stateEnd = readFileSync(path, "utf8").indexOf("\n## ", stateStart + 1);
    const stateBody = readFileSync(path, "utf8").slice(stateStart, stateEnd < 0 ? undefined : stateEnd);
    if (!/^\|.+\|$/m.test(stateBody) || !stateBody.includes("|---")) failures.push(`${rel(path)} status model lacks a state table`);
  }
}

const scenarioFields = ["Source", "Stimulus", "Environment", "Affected capability or behavior", "Response", "Response measure"];
const classifications = new Set(["correctness", "safety", "recoverability", "performance", "trust"]);
for (const path of corpusMarkdown.filter(path => kindOf(path) === "quality-scenarios")) {
  if (!classifications.has(scalar(path, "classification"))) failures.push(`${rel(path)} has invalid quality classification`);
  const source = readFileSync(path, "utf8");
  const h2 = [...source.matchAll(/^## (.+)$/gm)].map(match => match[1]!);
  if (h2.length !== 1 || h2[0] !== "Scenario") failures.push(`${rel(path)} must contain only the Scenario section`);
  const rows = new Map([...source.matchAll(/^\| ([^|]+?) \| ([^|]+?) \|$/gm)].map(match => [match[1]!.trim(), match[2]!.trim()]));
  for (const field of scenarioFields) {
    const value = rows.get(field) ?? "";
    if (!value) failures.push(`${rel(path)} missing concrete scenario field ${field}`);
    if (/^(?:n\/?a|none|tbd|todo|-|unknown)\.?$/i.test(value)) failures.push(`${rel(path)} has empty scenario category ${field}`);
    if (/\b(?:should|aspir(?:e|ation|ational)?|desired target)\b/i.test(value)) failures.push(`${rel(path)} contains aspirational scenario prose in ${field}`);
    if (/(?:^|[\s`])(?:src\/|test\/|tests\/|[\w/-]+\.(?:ts|tsx|js|sql))\b/i.test(value)) failures.push(`${rel(path)} contains an implementation reference in ${field}`);
  }
  const measure = rows.get("Response measure") ?? "";
  if (!/(?:\d|exactly|at most|at least|zero|never|every|unchanged|do not (?:increase|advance)|no (?:new|second|duplicate))/i.test(measure)) failures.push(`${rel(path)} response measure is not objectively testable`);
}

for (const path of allFiles.filter(path => extname(path) === ".json")) {
  try {
    const value = JSON.parse(readFileSync(path, "utf8"));
    const refs: string[] = [];
    const collect = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      if ("$ref" in node && typeof node.$ref === "string") refs.push(node.$ref);
      for (const nested of Array.isArray(node) ? node : Object.values(node)) collect(nested);
    };
    collect(value);
    for (const reference of refs.filter(reference => reference.startsWith("#/"))) {
      const target = reference.slice(2).split("/").map(part => part.replaceAll("~1", "/").replaceAll("~0", "~"))
        .reduce<unknown>((node, part) => node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined, value);
      if (target === undefined) failures.push(`${rel(path)} has unresolved JSON pointer ${reference}`);
    }
    if (rel(path).startsWith("contracts/operations/")) {
      if (value.type !== "object" || value.additionalProperties !== false || !value.properties?.input || !value.properties?.result) failures.push(`${rel(path)} is not a strict operation envelope`);
      if (value.properties?.input?.additionalProperties !== false) failures.push(`${rel(path)} input is not strict`);
      const result = value.properties?.result;
      const branches = Array.isArray(result?.oneOf) ? result.oneOf : [result];
      const validateClosedShape = (node: any, location: string) => {
        if (!node || typeof node !== "object") return;
        if (node.type === "object") {
          const intentionalPayload = location.endsWith(".structuredData") && node.additionalProperties === true && typeof node.description === "string";
          if (node.additionalProperties !== false && !intentionalPayload) failures.push(`${rel(path)} leaves object shape open at ${location}`);
          const propertyNames = Object.keys(node.properties ?? {});
          const required = new Set(Array.isArray(node.required) ? node.required : []);
          for (const name of propertyNames) {
            const conditionalStagedReference = rel(path) === "contracts/operations/create_document.schema.json" && location === "result.success" && name === "stagedReference";
            if (!required.has(name) && !conditionalStagedReference) failures.push(`${rel(path)} leaves success property optional at ${location}.${name}`);
          }
        }
        for (const [key, nested] of Object.entries(node)) {
          if (["if", "then", "else"].includes(key)) continue;
          if (Array.isArray(nested)) nested.forEach((item, index) => validateClosedShape(item, `${location}.${key}[${index}]`));
          else if (nested && typeof nested === "object") validateClosedShape(nested, `${location}.${key}`);
        }
      };
      for (const branch of branches) {
        if (!branch || typeof branch !== "object") continue;
        const success = branch.properties?.status?.const === "ok" || result === branch && branch.type === "object";
        if (!success) continue;
        if (branch.additionalProperties !== false) failures.push(`${rel(path)} success result is not strict`);
        validateClosedShape(branch, "result.success");
        for (const key of ["record", "items", "document"]) {
          const property = branch.properties?.[key];
          const shape = key === "items" ? property?.items : property;
          if (shape?.type === "object" && !shape.properties && !shape.oneOf && !shape.$ref) failures.push(`${rel(path)} leaves success ${key} shape uncharacterized`);
        }
      }
      if (rel(path) === "contracts/operations/update_document.schema.json") {
        const success = branches.find((branch: any) => branch?.properties?.status?.const === "ok");
        const conditional = success?.allOf?.find((item: any) => item?.if?.properties?.changed?.const === true);
        if (conditional?.then?.properties?.changeId?.type !== "string" || conditional?.then?.properties?.changeId?.minLength !== 1 || conditional?.else?.properties?.changeId?.const !== null) {
          failures.push(`${rel(path)} does not bind changed=true to a nonblank changeId and changed=false to null`);
        }
      }
    }
  } catch (error) { failures.push(`${rel(path)} invalid JSON: ${error}`); }
}

const operationContracts = allFiles.filter(path => rel(path).startsWith("contracts/operations/") && extname(path) === ".json");
if (operationContracts.length !== 27) failures.push(`expected 27 operation contracts, found ${operationContracts.length}`);
for (const contract of operationContracts) if (!features.some(feature => list(feature, "contracts").map(item => resolve(dirname(feature), item)).includes(contract))) failures.push(`${rel(contract)} is not owned by a feature`);

const estimate = (path: string) => Math.ceil(readFileSync(path, "utf8").length / 4);
if (estimate(join(root, "README.md")) > 1000) failures.push("README.md exceeds 1,000 estimated tokens");
for (const path of capabilities) if (estimate(path) > 1500) failures.push(`${rel(path)} exceeds 1,500 estimated tokens`);
for (const path of features) if (estimate(path) > 5000) failures.push(`${rel(path)} exceeds 5,000 estimated tokens`);
for (const path of corpusMarkdown.filter(path => ["workflows", "operational-models"].includes(kindOf(path)))) if (estimate(path) > 5000) failures.push(`${rel(path)} exceeds 5,000 estimated tokens`);
for (const path of corpusMarkdown.filter(path => kindOf(path) === "quality-scenarios")) if (estimate(path) > 1500) failures.push(`${rel(path)} exceeds 1,500 estimated tokens`);

const linkCount = corpusMarkdown.reduce((count, path) => count + [...readFileSync(path, "utf8").matchAll(linkPattern)].length, 0);
const coverage = readFileSync(join(root, "COVERAGE.md"), "utf8");
const coverageCorpusSummary = `Latest result: ${allFiles.length} files excluding generated validation reports, ${corpusMarkdown.length} corpus Markdown files excluding templates, ${linkCount} internal links, ${operationContracts.length} operation contracts, and zero failures.`;
if (!coverage.includes(coverageCorpusSummary)) failures.push("COVERAGE.md corpus-validation counts are stale");
try {
  const context = JSON.parse(readFileSync(join(root, "validation/context-budgets.json"), "utf8"));
  const coverageContextSummary = `Latest result: ${context.routeCount} routes, all at or below the 10,000 typical-route budget; maximum ${context.maximumRoutedBundle.estimatedTokens.toLocaleString("en-US")} estimated tokens.`;
  if (!coverage.includes(coverageContextSummary)) failures.push("COVERAGE.md context-budget counts are stale");
} catch (error) {
  failures.push(`validation/context-budgets.json is unavailable or invalid: ${error}`);
}

const report = {
  files: allFiles.length, markdown: corpusMarkdown.length, capabilities: capabilities.length, features: features.length,
  workflows: corpusMarkdown.filter(path => kindOf(path) === "workflows").length,
  operationalModels: corpusMarkdown.filter(path => kindOf(path) === "operational-models").length,
  qualityScenarios: corpusMarkdown.filter(path => kindOf(path) === "quality-scenarios").length,
  variants: corpusMarkdown.filter(path => kindOf(path) === "variants").length,
  foundations: corpusMarkdown.filter(path => kindOf(path) === "foundations").length,
  links: linkCount,
  operationContracts: operationContracts.length, failures,
};
mkdirSync(join(root, "validation"), { recursive: true });
await Bun.write(join(root, "validation/corpus-validation.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
