import { mkdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const scan = (directory: string) => Array.from(new Bun.Glob("**/*.md").scanSync(resolve(root, directory))).map(name => resolve(root, directory, name));
const text = (path: string) => readFileSync(path, "utf8");
const estimate = (path: string) => Math.ceil(text(path).length / 4);
const fm = (path: string) => text(path).match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
const scalar = (path: string, key: string) => fm(path).match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";
const list = (path: string, key: string) => {
  const value = scalar(path, key);
  return value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1).split(",").map(item => item.trim()).filter(Boolean) : [];
};
const features = scan("features");
const capabilities = new Map(scan("capabilities").map(path => [scalar(path, "id"), path]));
const featureByKey = new Map(features.map(path => [`${scalar(path, "capability")}:${scalar(path, "id")}`, path]));
const details = ["workflows", "operational-models", "quality-scenarios", "variants"].flatMap(scan);
const rows: Array<{ route: string; estimatedTokens: number; files: string[] }> = [];

function bundle(seed: string[]) {
  const seen = new Set<string>();
  const visit = (path: string) => {
    if (seen.has(path)) return;
    seen.add(path);
    if (path.endsWith(".md")) for (const item of list(path, "requires")) visit(resolve(dirname(path), item));
  };
  seed.forEach(visit);
  const files = [...seen];
  return { estimatedTokens: files.reduce((sum, path) => sum + estimate(path), 0), files: files.map(path => relative(root, path)).sort() };
}
function addRoute(feature: string, detail?: string) {
  const capability = capabilities.get(scalar(feature, "capability"))!;
  const seed = [resolve(root, "README.md"), capability, feature, ...(detail ? [detail] : [])];
  rows.push({ route: seed.map(path => relative(root, path)).join(" -> "), ...bundle(seed) });
}
for (const feature of features) {
  addRoute(feature);
  for (const contractItem of list(feature, "contracts")) addRoute(feature, resolve(dirname(feature), contractItem));
}
for (const detail of details) {
  const feature = featureByKey.get(`${scalar(detail, "capability")}:${scalar(detail, "feature")}`);
  if (feature) addRoute(feature, detail);
}
rows.sort((left, right) => right.estimatedTokens - left.estimatedTokens || left.route.localeCompare(right.route));
const report = {
  method: "Estimated tokens = JavaScript UTF-16 string code units divided by four and rounded up; this intentionally matches GigFinder's own conversation-budget heuristic and is not provider tokenization.",
  routing: "Every route includes README, the owning capability, the mandatory functional feature, the requested detail when any, and transitive requires dependencies. Strict contracts are measured one operation at a time.",
  limits: { root: 1000, capability: 1500, featureHardMaximum: 5000, detailHardMaximum: 5000, qualityScenario: 1500, typicalRoutedBundle: 10000 },
  maximumRoutedBundle: rows[0], routeCount: rows.length,
  featureRouteCount: features.length,
  detailRouteCount: rows.length - features.length,
  allWithinTypicalBudget: rows.every(row => row.estimatedTokens <= 10000), routes: rows,
};
mkdirSync(resolve(root, "validation"), { recursive: true });
await Bun.write(resolve(root, "validation/context-budgets.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ routeCount: rows.length, featureRouteCount: features.length, maximum: rows[0]?.estimatedTokens, allWithinTypicalBudget: report.allWithinTypicalBudget }, null, 2));
if (!report.allWithinTypicalBudget) process.exit(1);
