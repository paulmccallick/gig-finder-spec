import path from "node:path";
import { readFile, realpath, stat } from "node:fs/promises";

export type RepositoryAlias = "app" | "spec";

export interface RepositoryEnvironment {
  env?: Record<string, string | undefined>;
}

export interface ParsedRepositoryReference {
  alias: RepositoryAlias;
  relativePath: string;
  symbol?: string;
}

export interface ResolvedRepositoryReference extends ParsedRepositoryReference {
  repositoryRoot: string;
  absolutePath: string;
}

const aliases = new Set<RepositoryAlias>(["app", "spec"]);

function environmentFor(options: RepositoryEnvironment) {
  return options.env ?? process.env;
}

async function runGit(arguments_: string[], options: RepositoryEnvironment) {
  const child = Bun.spawn(["git", ...arguments_], {
    env: environmentFor(options),
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { exitCode, stdout: stdout.trim(), stderr: stderr.trim() };
}

export function parseRepositoryReference(value: string): ParsedRepositoryReference {
  const separator = value.indexOf("::");
  if (separator < 1) throw new Error(`Invalid repository reference '${value}'`);

  const alias = value.slice(0, separator);
  if (!aliases.has(alias as RepositoryAlias)) throw new Error(`Unknown repository alias '${alias}'`);

  const target = value.slice(separator + 2);
  const hash = target.indexOf("#");
  const relativePath = hash === -1 ? target : target.slice(0, hash);
  const fragment = hash === -1 ? undefined : target.slice(hash + 1);
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.startsWith("/")) {
    throw new Error("Repository reference path must be repository-relative");
  }
  if (relativePath.split(/[\\/]/).includes("..")) {
    throw new Error("Repository reference path cannot contain '..'");
  }
  if (relativePath.includes("\\")) throw new Error("Repository reference paths must use '/' separators");

  if (fragment && !fragment.startsWith("symbol=")) {
    throw new Error(`Unsupported reference fragment '${fragment}'`);
  }
  const symbol = fragment?.slice("symbol=".length);
  if (fragment && !symbol) throw new Error("Repository reference symbol cannot be empty");

  return {
    alias: alias as RepositoryAlias,
    relativePath,
    ...(symbol ? { symbol: decodeURIComponent(symbol) } : {}),
  };
}

export async function registerRepository(
  alias: RepositoryAlias,
  checkout: string,
  options: RepositoryEnvironment = {},
) {
  const repository = await runGit(["-C", checkout, "rev-parse", "--show-toplevel"], options);
  if (repository.exitCode !== 0) throw new Error(`Not a Git checkout: ${checkout}`);

  const repositoryRoot = repository.stdout;
  let marker: string;
  try {
    marker = (await readFile(path.join(repositoryRoot, ".gf-repository"), "utf8")).trim();
  } catch {
    throw new Error(`Repository marker is missing from ${repositoryRoot}`);
  }
  if (marker !== alias) throw new Error(`Repository marker identifies '${marker}', not '${alias}'`);

  const configured = await runGit(
    ["config", "--global", "--path", `gigfinder.repo.${alias}`, repositoryRoot],
    options,
  );
  if (configured.exitCode !== 0) throw new Error(configured.stderr || `Could not register '${alias}'`);
  return repositoryRoot;
}

export async function resolveRepositoryReference(
  value: string,
  options: RepositoryEnvironment = {},
): Promise<ResolvedRepositoryReference> {
  const parsed = parseRepositoryReference(value);
  const configured = await runGit(
    ["config", "--global", "--path", "--get", `gigfinder.repo.${parsed.alias}`],
    options,
  );
  if (configured.exitCode !== 0 || !configured.stdout) {
    throw new Error(`No local checkout is registered for '${parsed.alias}'`);
  }

  const configuredRoot = path.resolve(configured.stdout);
  const repository = await runGit(["-C", configuredRoot, "rev-parse", "--show-toplevel"], options);
  if (repository.exitCode !== 0) {
    throw new Error(`Registered checkout for '${parsed.alias}' is not a Git checkout: ${configuredRoot}`);
  }

  const repositoryRoot = path.resolve(repository.stdout);
  if (repositoryRoot !== configuredRoot) {
    throw new Error(`Registered checkout for '${parsed.alias}' is not a repository root: ${configuredRoot}`);
  }

  let marker: string;
  try {
    marker = (await readFile(path.join(repositoryRoot, ".gf-repository"), "utf8")).trim();
  } catch {
    throw new Error(`Repository marker is missing from ${repositoryRoot}`);
  }
  if (marker !== parsed.alias) {
    throw new Error(`Repository marker identifies '${marker}', not '${parsed.alias}'`);
  }

  const absolutePath = path.resolve(repositoryRoot, parsed.relativePath);
  const prefix = `${repositoryRoot}${path.sep}`;
  if (absolutePath !== repositoryRoot && !absolutePath.startsWith(prefix)) {
    throw new Error("Resolved reference escapes its repository");
  }

  return { ...parsed, repositoryRoot, absolutePath };
}

export async function checkRepositoryReference(
  value: string,
  options: RepositoryEnvironment = {},
): Promise<ResolvedRepositoryReference> {
  const resolved = await resolveRepositoryReference(value, options);
  try {
    const metadata = await stat(resolved.absolutePath);
    if (!metadata.isFile()) throw new Error("not a file");
  } catch {
    throw new Error(`Referenced file does not exist: ${value}`);
  }

  const [realRoot, realTarget] = await Promise.all([
    realpath(resolved.repositoryRoot),
    realpath(resolved.absolutePath),
  ]);
  if (!realTarget.startsWith(`${realRoot}${path.sep}`)) {
    throw new Error(`Referenced file escapes its repository: ${value}`);
  }

  if (resolved.symbol) {
    const contents = await readFile(realTarget, "utf8");
    if (!contents.includes(resolved.symbol)) {
      throw new Error(`Symbol '${resolved.symbol}' was not found in ${resolved.relativePath}`);
    }
  }
  return resolved;
}

export function extractRepositoryReferences(markdown: string) {
  return [...markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
    .map(match => match[1]!.replace(/^<|>$/g, ""))
    .filter(target => /^(?:app|spec)::/.test(target));
}

export async function checkMarkdownRepositoryReferences(
  markdown: string,
  options: RepositoryEnvironment = {},
) {
  return await Promise.all(
    extractRepositoryReferences(markdown).map(reference => checkRepositoryReference(reference, options)),
  );
}
