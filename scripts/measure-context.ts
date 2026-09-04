import { mkdirSync, readFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const text = (path: string) => readFileSync(path, "utf8");
const estimate = (path: string) => Math.ceil(text(path).length / 4);
const frontmatter = (path: string) => text(path).match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const scalar = (path: string, key: string) => frontmatter(path).match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
const list = (path: string, key: string) => {
  const value = scalar(path, key);
  return value?.startsWith("[") ? value.slice(1, -1).split(",").map(item => item.trim()).filter(Boolean) : [];
};
const capabilityPaths = new Map<string, string>();
for (const name of ["opportunities", "networking", "tasks", "interactions", "documents-profile", "conversational-agent", "gig-scout"]) {
  capabilityPaths.set(name, resolve(root, "capabilities", `${name}.md`));
}
const workflowDirectories = ["opportunities", "networking", "tasks", "interactions", "documents", "agent", "scout"];
const workflows = workflowDirectories.flatMap(directory =>
  Array.from(new Bun.Glob("*.md").scanSync(resolve(root, "workflows", directory))).map(name => resolve(root, "workflows", directory, name))
);
const variants = Array.from(new Bun.Glob("**/*.md").scanSync(resolve(root, "variants"))).map(name => resolve(root, "variants", name));

function requiredFiles(path: string): string[] {
  return list(path, "requires").map(item => resolve(dirname(path), item));
}
function bundle(seed: string[]) {
  const seen = new Set<string>();
  const visit = (path: string) => {
    if (seen.has(path)) return;
    seen.add(path);
    if (path.endsWith(".md")) requiredFiles(path).forEach(visit);
  };
  seed.forEach(visit);
  const files = [...seen];
  return { estimatedTokens: files.reduce((sum, path) => sum + estimate(path), 0), files: files.map(path => relative(root, path)).sort() };
}

const rows = workflows.map(workflow => {
  const capability = scalar(workflow, "capability")!;
  return {
    route: `README.md -> capabilities/${basename(capabilityPaths.get(capability)!)} -> ${relative(root, workflow)}`,
    ...bundle([resolve(root, "README.md"), capabilityPaths.get(capability)!, workflow]),
  };
});
for (const variant of variants) {
  const capability = scalar(variant, "capability")!;
  const workflow = resolve(dirname(variant), scalar(variant, "workflow")!);
  rows.push({
    route: `README.md -> capabilities/${basename(capabilityPaths.get(capability)!)} -> ${relative(root, workflow)} -> ${relative(root, variant)}`,
    ...bundle([resolve(root, "README.md"), capabilityPaths.get(capability)!, workflow, variant]),
  });
}
rows.sort((left, right) => right.estimatedTokens - left.estimatedTokens);
const report = {
  method: "Estimated tokens = UTF-8 JavaScript string characters divided by four and rounded up; this intentionally matches GigFinder's own conversation-budget heuristic and is not provider tokenization.",
  limits: { root: 1000, capability: 1500, workflowHardMaximum: 5000, typicalRoutedBundle: 10000 },
  maximumRoutedBundle: rows[0],
  routeCount: rows.length,
  allWithinTypicalBudget: rows.every(row => row.estimatedTokens <= 10000),
  routes: rows,
};
mkdirSync(resolve(root, "validation"), { recursive: true });
await Bun.write(resolve(root, "validation/context-budgets.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ routeCount: rows.length, maximum: rows[0]?.estimatedTokens, allWithinTypicalBudget: report.allWithinTypicalBudget }, null, 2));
